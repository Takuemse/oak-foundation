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

    // Must be the session-aware client — check_in_attendee() is gated by
    // is_admin(), which reads auth.uid() from the caller's session. The
    // plain anon client (createServerSupabaseClient) never forwards the
    // request's auth cookies, so is_admin() would always resolve to false
    // regardless of who's actually logged in.
    const supabase = await createSessionSupabaseClient();

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
          { success: false, message: "Not authorized. Please sign in again." },
          { status: 403 }
        );
      }

      return NextResponse.json(
        { success: false, message: "Unable to complete check-in." },
        { status: 500 }
      );
    }

    const result = data?.[0];
    if (!result) {
      return NextResponse.json(
        { success: false, message: "QR code not recognised." },
        { status: 404 }
      );
    }

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