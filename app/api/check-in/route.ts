import { NextRequest, NextResponse } from "next/server";
import { createSessionSupabaseClient } from "@/app/lib/superbase/server-auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { qrToken, eventDate } = body;

    if (!qrToken || typeof qrToken !== "string") {
      return NextResponse.json(
        { success: false, message: "QR code not recognised." },
        { status: 400 }
      );
    }

    const supabase = await createSessionSupabaseClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Not authenticated." },
        { status: 401 }
      );
    }

    const { data, error } = await supabase.rpc("check_in_attendee", {
      p_qr_token: qrToken,
      ...(eventDate ? { p_event_date: eventDate } : {}),
    });

    if (error) {
      console.error("Check-in error:", error);

      if (error.message.includes("not recognised")) {
        return NextResponse.json(
          { success: false, message: "QR code not recognised." },
          { status: 404 }
        );
      }

      if (error.message.includes("Only admins")) {
        return NextResponse.json(
          { success: false, message: "Not authorized." },
          { status: 403 }
        );
      }

      return NextResponse.json(
        { success: false, message: "Unable to complete check-in." },
        { status: 500 }
      );
    }

    const result = data?.[0];

    return NextResponse.json(
      { success: true, attendee: result },
      { status: 200 }
    );
  } catch (err) {
    console.error("API check-in error:", err);
    return NextResponse.json(
      { success: false, message: "Invalid check-in request." },
      { status: 400 }
    );
  }
}