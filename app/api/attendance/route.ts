import { NextRequest, NextResponse } from "next/server";
import { createSessionSupabaseClient } from "@/app/lib/superbase/server-auth";

export async function GET(request: NextRequest) {
  try {
    // Session-aware client — get_attendance_summary() and
    // get_attendance_participants() are both is_admin()-gated, which reads
    // auth.uid() from the caller's session cookie. See check-in/route.ts
    // for the same fix and why the plain anon client can't work here.
    const supabase = await createSessionSupabaseClient();

    const eventDate = request.nextUrl.searchParams.get("eventDate");
    const dateArg = eventDate ? { p_event_date: eventDate } : {};

    const { data: summaryData, error: summaryError } = await supabase.rpc(
      "get_attendance_summary",
      dateArg
    );

    if (summaryError) {
      console.error("Attendance summary error:", summaryError);
      if (summaryError.message?.includes("Only admins")) {
        return NextResponse.json(
          { success: false, message: "Not authorized. Please sign in again." },
          { status: 403 }
        );
      }
      return NextResponse.json(
        { success: false, message: "Unable to load attendance summary." },
        { status: 500 }
      );
    }

    const { data: participants, error: participantsError } = await supabase.rpc(
      "get_attendance_participants",
      dateArg
    );

    if (participantsError) {
      console.error("Attendance participants error:", participantsError);
      return NextResponse.json(
        { success: false, message: "Unable to load participant list." },
        { status: 500 }
      );
    }

    const summary = summaryData?.[0];

    return NextResponse.json({
      success: true,
      summary,
      participants: participants ?? [],
    });
  } catch (err) {
    console.error("API attendance error:", err);
    return NextResponse.json(
      { success: false, message: "Invalid request." },
      { status: 400 }
    );
  }
}