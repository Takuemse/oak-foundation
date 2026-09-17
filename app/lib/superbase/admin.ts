import { createClient } from "@supabase/supabase-js";

// SERVER-ONLY. Never import this from a "use client" file or anything that
// could end up in a client bundle — SUPABASE_SECRET_KEY has full admin
// privileges (bypasses RLS, can create/delete auth users). It must never be
// prefixed with NEXT_PUBLIC_ and must never reach the browser.
//
// This client is used for exactly one thing in this app: creating new
// admin_users accounts (app/api/admin/create-account/route.ts), which
// requires supabase.auth.admin.createUser() — an operation no RLS-respecting
// client, however privileged the calling user, can perform.
export function createAdminSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const secretKey = process.env.SUPABASE_SECRET_KEY;

  if (!url || !secretKey) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SECRET_KEY environment variable"
    );
  }

  return createClient(url, secretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}