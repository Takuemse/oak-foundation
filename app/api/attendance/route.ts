import { NextRequest, NextResponse } from "next/server";
import { createSessionSupabaseClient } from "@/app/lib/superbase/server-auth";

export async function GET(request: NextRequest) {
  try {
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

    const eventDate = request.nextUrl.searchParams.get("eventDate");

    const { data, error } = await supabase.rpc("get_attendance_summary", {
      ...(eventDate ? { p_event_date: eventDate } : {}),
    });

    if (error) {
      console.error("Attendance summary error:", error);
      return NextResponse.json(
        { success: false, message: "Unable to load attendance summary." },
        { status: 500 }
      );
    }

    const summary = data?.[0];

    return NextResponse.json({ success: true, summary });
  } catch (err) {
    console.error("API attendance error:", err);
    return NextResponse.json(
      { success: false, message: "Invalid request." },
      { status: 400 }
    );
  }
}