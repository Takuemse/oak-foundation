import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/app/lib/superbase/server";

export async function GET() {
  try {
    const supabase = createServerSupabaseClient();

    const { data: days, error: daysError } = await supabase
      .from("programme_days")
      .select("id, event_date, title")
      .order("event_date", { ascending: true });

    if (daysError) {
      console.error("Programme days error:", daysError);
      return NextResponse.json(
        { success: false, message: "Unable to load programme." },
        { status: 500 }
      );
    }

    const { data: sessions, error: sessionsError } = await supabase
      .from("programme_sessions")
      .select("id, programme_day_id, title, description, start_time, end_time, location, display_order")
      .order("display_order", { ascending: true });

    if (sessionsError) {
      console.error("Programme sessions error:", sessionsError);
      return NextResponse.json(
        { success: false, message: "Unable to load programme." },
        { status: 500 }
      );
    }

    const result = (days ?? []).map((day) => ({
      ...day,
      sessions: (sessions ?? []).filter((s) => s.programme_day_id === day.id),
    }));

    return NextResponse.json({ success: true, days: result });
  } catch (err) {
    console.error("API programme error:", err);
    return NextResponse.json(
      { success: false, message: "Invalid request." },
      { status: 500 }
    );
  }
}