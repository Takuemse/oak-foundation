-- supabase/migrations/20260918150000_grant_admin_write_privileges.sql
--
-- Same root cause as the admin_users SELECT fix (see
-- 20260918140500_grant_admin_users_select.sql): RLS policies on these
-- tables are correctly designed and already gate every one of these
-- operations (is_admin()/is_super_admin()), but no table-level GRANT
-- was ever issued for INSERT/UPDATE/DELETE to the roles that need them.
-- Postgres checks table-level privilege before RLS is evaluated, so
-- every direct-table admin write in the app has been silently broken
-- since it was built — it just hadn't been clicked yet. Operational
-- paths (registration, check-in, attendance summary) are unaffected:
-- they go through SECURITY DEFINER RPCs, which run as the function
-- owner and were already correctly GRANTed EXECUTE in earlier
-- migrations.

-- Partner directory management (admin/partners "Upload logo", and any
-- future create/edit/delete of partners) — is_super_admin()-gated.
GRANT INSERT, UPDATE, DELETE ON public.organizations TO authenticated;

-- Programme management — is_super_admin()-gated. No UI writes these
-- yet, but the RLS policy already exists for when it does.
GRANT INSERT, UPDATE, DELETE ON public.programme_days TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.programme_sessions TO authenticated;

-- Documentation publishing (admin/documentation: create post, upload
-- photo, delete post/photo) — is_super_admin()-gated. This is the
-- exact failure in image 4.
GRANT INSERT, UPDATE, DELETE ON public.documentation_posts TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.documentation_photos TO authenticated;

-- Sensitive attendee/attendance tables — direct access is
-- is_super_admin()-only per the two-tier RBAC design. No INSERT grant
-- on either: attendee creation goes through register_attendee() and
-- check-ins through check_in_attendee(), both SECURITY DEFINER RPCs,
-- intentionally the only way rows get created in these tables.
GRANT SELECT, UPDATE, DELETE ON public.attendees TO authenticated;
GRANT SELECT, UPDATE, DELETE ON public.attendance TO authenticated;

-- admin_users writes (create-account, and future edit/delete of an
-- account) go through the service-role client in
-- /api/admin/create-account, not the session client — this is the
-- exact failure in images 2 and 3. service_role bypasses RLS but is
-- still subject to the same table-grant check, and this table was
-- evidently never granted to it either.
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_users TO service_role;