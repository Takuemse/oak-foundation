import { NextResponse } from "next/server";
import { createSessionSupabaseClient } from "@/app/lib/superbase/server-auth";

// GET /api/admin/me
// Returns the signed-in admin's tier ("admin" | "super_admin") so
// client components (AdminSidebar, dashboard) can conditionally show
// Lead-Organizer-only navigation without needing their own RLS-bypassing
// query against admin_users.
export async function GET() {
  try {
    const supabase = await createSessionSupabaseClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ success: false, tier: null }, { status: 401 });
    }

    const { data, error } = await supabase
      .from("admin_users")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (error || !data) {
      return NextResponse.json({ success: false, tier: null }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      tier: data.role, // "admin" | "super_admin"
      email: user.email,
    });
  } catch (err) {
    console.error("API admin/me error:", err);
    return NextResponse.json({ success: false, tier: null }, { status: 400 });
  }
}