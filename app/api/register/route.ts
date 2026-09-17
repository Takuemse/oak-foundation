import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/app/lib/superbase/server";
import { createSessionToken } from "@/app/lib/session";

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, message: "Malformed request body." },
      { status: 400 }
    );
  }

  const {
    firstName,
    lastName,
    email,
    phone,
    organizationName,
    subPartner,
    role,
    dietaryRequirements,
    accessibilityRequirements,
    travelRequirements,
    consentGiven,
  } = body as {
    firstName?: string;
    lastName?: string;
    email?: string;
    phone?: string;
    organizationName?: string;
    subPartner?: string;
    role?: string;
    dietaryRequirements?: string;
    accessibilityRequirements?: string;
    travelRequirements?: string;
    consentGiven?: boolean;
  };

  // 1. Consolidated required field validation
  if (!firstName || !lastName || !email || !organizationName) {
    return NextResponse.json(
      {
        success: false,
        message:
          "First name, last name, email, and organization are required.",
      },
      { status: 400 }
    );
  }

  // 2. Consent validation
  if (consentGiven !== true) {
    return NextResponse.json(
      {
        success: false,
        message: "You must provide consent before registering.",
      },
      { status: 400 }
    );
  }

  // 2b. Coordination Team no longer self-registers through this public
  // form — per the sprint brief ("Only the coordination team logs in
  // (admin)"), that role is provisioned as a real admin_users account and
  // authenticates via /admin/login instead. Reject it here even if a
  // client somehow still sends it, since the public UI no longer offers
  // it as an option.
  if (role === "Coordination Team") {
    return NextResponse.json(
      {
        success: false,
        message:
          "Coordination Team members should sign in at /admin/login instead of registering here.",
      },
      { status: 400 }
    );
  }

  // 3. Email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return NextResponse.json(
      {
        success: false,
        message: "Please provide a valid email address.",
      },
      { status: 400 }
    );
  }

  // --- Phase 1: the actual registration (this is the part that must succeed) ---
  let attendee: {
    attendee_id: string;
    first_name: string;
    last_name: string;
    qr_token: string;
  };

  try {
    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase.rpc("register_attendee", {
      p_first_name: firstName,
      p_last_name: lastName,
      p_email: email,
      p_phone: phone || null,
      p_organization_name: organizationName,
      p_sub_partner: subPartner || null,
      p_role: role || null,
      p_dietary_requirements: dietaryRequirements || null,
      p_accessibility_requirements: accessibilityRequirements || null,
      p_travel_requirements: travelRequirements || null,
      p_consent_given: consentGiven,
    });

    if (error) {
      console.error("Registration error:", error);

      if (error.message?.includes("already registered")) {
        return NextResponse.json(
          {
            success: false,
            message: "An attendee with this email is already registered.",
          },
          { status: 409 }
        );
      }

      // Surface the actual database validation message (e.g. "Phone number is
      // required") instead of a generic one, so real validation failures are
      // distinguishable from server misconfiguration in logs and in the UI.
      return NextResponse.json(
        {
          success: false,
          message: error.message || "Unable to complete registration.",
        },
        { status: 400 }
      );
    }

    const row = data?.[0];
    if (!row) {
      // The RPC succeeded but returned no row — this should never happen if
      // the function is deployed correctly, so treat it as a server error
      // and log loudly rather than crashing with a generic message.
      console.error("register_attendee returned no rows", { data });
      return NextResponse.json(
        {
          success: false,
          message:
            "Registration could not be completed due to a server error. Please try again or contact support.",
        },
        { status: 500 }
      );
    }
    attendee = row;
  } catch (error) {
    // Any exception here means the attendee was NOT created (we haven't
    // touched the database yet in this catch's scope beyond the RPC call
    // itself, which either succeeded above or threw before assignment).
    console.error("API registration error (pre-insert):", error);
    return NextResponse.json(
      {
        success: false,
        message:
          error instanceof Error && error.message.includes("environment variable")
            ? "Server is misconfigured. Please contact the event organisers."
            : "Invalid registration request.",
      },
      { status: 400 }
    );
  }

  // --- Phase 2: build the success response. The attendee already exists in
  // the database at this point, so nothing below should ever turn this into
  // a failure response — at worst we skip the session cookie. ---
  const response = NextResponse.json(
    {
      success: true,
      message: "Registration completed successfully.",
      attendee: {
        id: attendee.attendee_id,
        firstName: attendee.first_name,
        lastName: attendee.last_name,
        email: email,
        organizationName: organizationName,
        role: role || "",
        qrToken: attendee.qr_token,
      },
    },
    { status: 201 }
  );

  try {
    const sessionToken = await createSessionToken({
      attendeeId: attendee.attendee_id,
      role: role || "",
      exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30, // 30 days
    });

    response.cookies.set("oak_session", sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
  } catch (sessionError) {
    // Registration already succeeded — a broken session cookie (e.g. a
    // missing SESSION_SECRET env var) must not surface as a registration
    // failure. Log it loudly so it gets fixed, but still return success.
    console.error(
      "Session token creation failed after successful registration:",
      sessionError
    );
  }

  return response;
}