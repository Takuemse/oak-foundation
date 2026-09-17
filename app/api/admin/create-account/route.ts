import { NextRequest, NextResponse } from "next/server";
import { createSessionSupabaseClient } from "@/app/lib/superbase/server-auth";
import { createAdminSupabaseClient } from "@/app/lib/superbase/admin";

// POST /api/admin/create-account
// Creates a new admin_users account (either tier). This is the ONLY place
// in the app that uses the service-role client, and it's gated in two
// independent ways before it's ever reached:
//   1. The caller must have a real Supabase Auth session (checked here).
//   2. The caller must be a super_admin (checked here, against the
//      session-aware client so RLS/is_super_admin() reflects who is
//      ACTUALLY calling — not a claim the client could fake).
// Only after both checks pass do we touch the service-role client.
export async function POST(request: NextRequest) {
  try {
    const sessionSupabase = await createSessionSupabaseClient();

    const {
      data: { user: caller },
    } = await sessionSupabase.auth.getUser();

    if (!caller) {
      return NextResponse.json(
        { success: false, message: "Not authorized." },
        { status: 401 }
      );
    }

    const { data: callerRow, error: callerError } = await sessionSupabase
      .from("admin_users")
      .select("role")
      .eq("user_id", caller.id)
      .single();

    if (callerError || callerRow?.role !== "super_admin") {
      return NextResponse.json(
        { success: false, message: "Only Lead Organizers can create admin accounts." },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { email, password, role } = body as {
      email?: string;
      password?: string;
      role?: string;
    };

    if (!email || !password || !role) {
      return NextResponse.json(
        { success: false, message: "Email, password, and role are required." },
        { status: 400 }
      );
    }

    if (role !== "admin" && role !== "super_admin") {
      return NextResponse.json(
        { success: false, message: "Role must be 'admin' or 'super_admin'." },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { success: false, message: "Password must be at least 8 characters." },
        { status: 400 }
      );
    }

    const adminSupabase = createAdminSupabaseClient();

    const { data: newUser, error: createError } =
      await adminSupabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // no email delivery dependency for this sprint
      });

    if (createError || !newUser?.user) {
      console.error("Create admin user error:", createError);
      const message = createError?.message?.includes("already registered")
        ? "An account with this email already exists."
        : "Unable to create account.";
      return NextResponse.json({ success: false, message }, { status: 400 });
    }

    const { error: roleError } = await adminSupabase
      .from("admin_users")
      .insert({ user_id: newUser.user.id, role });

    if (roleError) {
      console.error("admin_users insert error:", roleError);
      // Don't leave an orphaned auth user with no admin_users row — clean up
      // so a retry with the same email doesn't hit "already registered"
      // for an account that never actually got tier access.
      await adminSupabase.auth.admin.deleteUser(newUser.user.id);
      return NextResponse.json(
        { success: false, message: "Unable to finish creating the account. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      account: { id: newUser.user.id, email, role },
    });
  } catch (err) {
    console.error("API create-account error:", err);
    return NextResponse.json(
      { success: false, message: "Invalid request." },
      { status: 400 }
    );
  }
}