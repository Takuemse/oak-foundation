import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/app/lib/superbase/server";

export async function GET(request: NextRequest) {
  try {
    const token = request.nextUrl.searchParams.get("token");
    const email = request.nextUrl.searchParams.get("email");

    if (!token && !email) {
      return NextResponse.json(
        { success: false, message: "Provide a token or email." },
        { status: 400 }
      );
    }

    const supabase = createServerSupabaseClient();
    const { data, error } = await supabase.rpc("get_partner_qr", {
      p_qr_token: token || null,
      p_email: email || null,
    });

    if (error) {
      console.error("QR lookup error:", error);
      return NextResponse.json(
        { success: false, message: "Unable to look up your entry pass." },
        { status: 500 }
      );
    }

    const attendee = data?.[0];
    if (!attendee) {
      return NextResponse.json(
        { success: false, message: "No Partner registration found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, attendee });
  } catch (err) {
    console.error("API qr error:", err);
    return NextResponse.json(
      { success: false, message: "Invalid request." },
      { status: 400 }
    );
  }
}