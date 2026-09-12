import { NextRequest, NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/app/lib/superbase/server";

export async function GET(request: NextRequest) {
  try {
    const supabase = createServerSupabaseClient();

    const eventDate = request.nextUrl.searchParams.get("eventDate");
    const dateArg = eventDate ? { p_event_date: eventDate } : {};

    const { data: summaryData, error: summaryError } = await supabase.rpc(
      "get_attendance_summary",
      dateArg
    );

    if (summaryError) {
      console.error("Attendance summary error:", summaryError);
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