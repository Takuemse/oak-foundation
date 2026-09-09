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
      organizationId,
      role,
      dietaryRequirements,
      accessibilityRequirements,
      travelRequirements,
      consentGiven,
    } = body;

    // Basic required field validation
    if (!firstName || !lastName || !email || !phone) {
      return NextResponse.json(
        {
          success: false,
          message:
            "First name, last name, email, and phone are required.",
        },
        {
          status: 400,
        }
      );
    }

    // Consent validation
    if (consentGiven !== true) {
      return NextResponse.json(
        {
          success: false,
          message:
            "You must provide consent before registering.",
        },
        {
          status: 400,
        }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      return NextResponse.json(
        {
          success: false,
          message: "Please provide a valid email address.",
        },
        {
          status: 400,
        }
      );
    }

    const supabase = createServerSupabaseClient();

    const { data, error } = await supabase.rpc(
      "register_attendee",
      {
        p_first_name: firstName,
        p_last_name: lastName,
        p_email: email,
        p_phone: phone,
        p_organization_id: organizationId || null,
        p_role: role || null,
        p_dietary_requirements:
          dietaryRequirements || null,
        p_accessibility_requirements:
          accessibilityRequirements || null,
        p_travel_requirements:
          travelRequirements || null,
        p_consent_given: consentGiven,
      }
    );

    if (error) {
      console.error("Registration error:", error);

      // Duplicate registration
      if (
        error.message.includes(
          "already registered"
        )
      ) {
        return NextResponse.json(
          {
            success: false,
            message:
              "An attendee with this email is already registered.",
          },
          {
            status: 409,
          }
        );
      }

      return NextResponse.json(
        {
          success: false,
          message:
            "Unable to complete registration.",
        },
        {
          status: 500,
        }
      );
    }

    const attendee = data?.[0];

    return NextResponse.json(
      {
        success: true,
        message:
          "Registration completed successfully.",
        attendee: {
          id: attendee.attendee_id,
          firstName: attendee.first_name,
          lastName: attendee.last_name,
          qrToken: attendee.qr_token,
        },
      },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("API registration error:", error);

    return NextResponse.json(
      {
        success: false,
        message: "Invalid registration request.",
      },
      {
        status: 400,
      }
    );
  }
}