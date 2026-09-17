import { NextResponse } from "next/server";
import { createSessionSupabaseClient } from "@/app/lib/superbase/server-auth";
import { createAdminSupabaseClient } from "@/app/lib/superbase/admin";

// GET /api/admin/accounts
// Lists existing admin_users accounts with their email (joined from
// auth.users via the service-role client, since admin_users itself only
// stores user_id + role). Super_admin-only.
export async function GET() {
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

    const { data: callerRow } = await sessionSupabase
      .from("admin_users")
      .select("role")
      .eq("user_id", caller.id)
      .single();

    if (callerRow?.role !== "super_admin") {
      return NextResponse.json(
        { success: false, message: "Only Lead Organizers can view admin accounts." },
        { status: 403 }
      );
    }

    // admin_users has no email column (email lives on auth.users), so listing
    // it with emails requires the service-role client's admin API.
    const adminSupabase = createAdminSupabaseClient();

    const { data: adminRows, error: adminRowsError } = await adminSupabase
      .from("admin_users")
      .select("user_id, role, created_at")
      .order("created_at", { ascending: false });

    if (adminRowsError) {
      console.error("List admin_users error:", adminRowsError);
      return NextResponse.json(
        { success: false, message: "Unable to load accounts." },
        { status: 500 }
      );
    }

    const accounts = await Promise.all(
      (adminRows ?? []).map(async (row) => {
        const { data } = await adminSupabase.auth.admin.getUserById(row.user_id);
        return {
          id: row.user_id,
          email: data?.user?.email ?? "(unknown)",
          role: row.role,
          createdAt: row.created_at,
        };
      })
    );

    return NextResponse.json({ success: true, accounts });
  } catch (err) {
    console.error("API list accounts error:", err);
    return NextResponse.json(
      { success: false, message: "Invalid request." },
      { status: 400 }
    );
  }
}