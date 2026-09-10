import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/app/lib/superbase/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

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
    } = body;

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

      if (error.message.includes("already registered")) {
        return NextResponse.json(
          {
            success: false,
            message: "An attendee with this email is already registered.",
          },
          { status: 409 }
        );
      }

      return NextResponse.json(
        {
          success: false,
          message: "Unable to complete registration.",
        },
        { status: 500 }
      );
    }

    const attendee = data?.[0];

    // 4. Enhanced Response Payload
    return NextResponse.json(
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
  } catch (error) {
    console.error("API registration error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Invalid registration request.",
      },
      { status: 400 }
    );
  }
}