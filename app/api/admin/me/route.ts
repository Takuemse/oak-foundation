import { NextResponse } from "next/server";
import { createSessionSupabaseClient } from "@/app/lib/superbase/server-auth";

// DIAGNOSTIC VERSION — temporary. Reveals the real Postgres error instead
// of collapsing every failure into a bare 403. Revert to the clean version
// (no error/stage/queriedUserId/queriedUserEmail in the response body)
// once the 42P17 recursion fix is confirmed working end-to-end.
export async function GET() {
  try {
    const supabase = await createSessionSupabaseClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, tier: null, stage: "no_session" },
        { status: 401 }
      );
    }

    const { data, error } = await supabase
      .from("admin_users")
      .select("role")
      .eq("user_id", user.id)
      .single();

    if (error || !data) {
      return NextResponse.json(
        {
          success: false,
          tier: null,
          stage: "admin_users_query",
          error: error
            ? { code: error.code, message: error.message, details: error.details, hint: error.hint }
            : "Query returned no row for this user_id.",
          queriedUserId: user.id,
          queriedUserEmail: user.email,
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      tier: data.role, // "admin" | "super_admin"
      email: user.email,
      stage: "ok",
    });
  } catch (err) {
    console.error("API admin/me error:", err);
    return NextResponse.json(
      {
        success: false,
        tier: null,
        stage: "unexpected_exception",
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 400 }
    );
  }
}