import { NextRequest, NextResponse } from "next/server";
import { createSessionSupabaseClient } from "@/app/lib/superbase/server-auth";

// GET /api/admin/sensitive-export?role=Partner
//
// Lead-Organizer-only (super_admin). Returns dietary, accessibility,
// travel, phone, and email for attendees — the one endpoint in the
// system permitted to expose these fields. Everything else (the
// public register/qr/programme/partners responses, and the
// Coordination Team's operational attendance list) must never
// include them.
//
// Authorization is enforced twice, independently:
//   1. Here, by using the session-aware Supabase client so RLS/RPC
//      checks run as the actual signed-in user.
//   2. In the database, by get_attendee_sensitive_export() raising
//      an exception unless is_super_admin() is true.
// Either layer failing independently still blocks the request —
// this is intentional defense in depth, not redundancy to remove.
export async function GET(request: NextRequest) {
  try {
    const supabase = await createSessionSupabaseClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Not authorized." },
        { status: 401 }
      );
    }

    const role = request.nextUrl.searchParams.get("role");

    const { data, error } = await supabase.rpc(
      "get_attendee_sensitive_export",
      role ? { p_role: role } : {}
    );

    if (error) {
      console.error("Sensitive export error:", error);
      if (error.message?.includes("lead organizers")) {
        return NextResponse.json(
          { success: false, message: "Not authorized." },
          { status: 403 }
        );
      }
      return NextResponse.json(
        { success: false, message: "Unable to load export." },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, attendees: data ?? [] });
  } catch (err) {
    console.error("API sensitive-export error:", err);
    return NextResponse.json(
      { success: false, message: "Invalid request." },
      { status: 400 }
    );
  }
}