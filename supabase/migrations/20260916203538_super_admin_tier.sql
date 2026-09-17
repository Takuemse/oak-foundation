-- =========================================================
-- TWO-TIER ADMIN RBAC
-- Splits the single "admin" concept into two tiers, matching
-- the Coordination Team vs Lead Organizer split:
--
--   admin        Coordination Team — operational, day-of tasks:
--                check-in scanning, basic headcount/attendance.
--   super_admin  Lead Organizers — sensitive data, attendance
--                analytics/exports, documentation publishing,
--                partner directory management, admin user mgmt.
--
-- public.is_admin() already exists and returns true for EITHER
-- tier (any row in admin_users) — kept as-is so it still means
-- "any logged-in staff member" for operational checks.
--
-- This migration adds public.is_super_admin() for the stricter
-- tier and re-scopes policies/grants that should be Lead
-- Organizer-only.
-- =========================================================

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.admin_users
        WHERE user_id = auth.uid()
          AND role = 'super_admin'
    );
$$;

-- =========================================================
-- ORGANIZATIONS (Partner Directory management)
-- Public read stays open (the partner directory is public).
-- Management (create/edit/delete partners) becomes Lead
-- Organizer-only — Coordination Team has no reason to edit
-- the partner directory during the event.
-- =========================================================

DROP POLICY IF EXISTS "Admins can manage organizations" ON public.organizations;

CREATE POLICY "Super admins can manage organizations"
ON public.organizations
FOR ALL
TO authenticated
USING (public.is_super_admin())
WITH CHECK (public.is_super_admin());

-- =========================================================
-- DOCUMENTATION POSTS / PHOTOS (publishing)
-- Public read of *published* posts stays open. Publishing and
-- editing becomes Lead Organizer-only.
-- =========================================================

DROP POLICY IF EXISTS "Admins can manage documentation posts" ON public.documentation_posts;

CREATE POLICY "Super admins can manage documentation posts"
ON public.documentation_posts
FOR ALL
TO authenticated
USING (public.is_super_admin())
WITH CHECK (public.is_super_admin());

DROP POLICY IF EXISTS "Admins can manage documentation photos" ON public.documentation_photos;

CREATE POLICY "Super admins can manage documentation photos"
ON public.documentation_photos
FOR ALL
TO authenticated
USING (public.is_super_admin())
WITH CHECK (public.is_super_admin());

-- =========================================================
-- ATTENDEES (the sensitive table)
-- Coordination Team never needs direct table access to
-- attendees — their entire workflow (scanning, headcount) goes
-- through SECURITY DEFINER functions that return only safe,
-- non-sensitive fields (see the companion RPC migration).
--
-- Direct table SELECT/UPDATE/DELETE — which would expose or let
-- someone touch phone/email/dietary/accessibility/travel data —
-- is now Lead Organizer-only.
-- =========================================================

DROP POLICY IF EXISTS "Admins can view attendees" ON public.attendees;
DROP POLICY IF EXISTS "Admins can update attendees" ON public.attendees;
DROP POLICY IF EXISTS "Admins can delete attendees" ON public.attendees;

CREATE POLICY "Super admins can view attendees"
ON public.attendees
FOR SELECT
TO authenticated
USING (public.is_super_admin());

CREATE POLICY "Super admins can update attendees"
ON public.attendees
FOR UPDATE
TO authenticated
USING (public.is_super_admin())
WITH CHECK (public.is_super_admin());

CREATE POLICY "Super admins can delete attendees"
ON public.attendees
FOR DELETE
TO authenticated
USING (public.is_super_admin());

-- =========================================================
-- ATTENDANCE (check-in records)
-- Coordination Team's check-in workflow inserts through
-- check_in_attendee() (SECURITY DEFINER, is_admin()-gated) so
-- it doesn't need a table-level INSERT policy for the
-- 'authenticated' role generally. Direct table access (viewing
-- raw attendance rows, correcting a bad check-in) is Lead
-- Organizer-only; the operational summary/list views go through
-- the safe RPCs, unaffected by this change.
-- =========================================================

DROP POLICY IF EXISTS "Admins can view attendance" ON public.attendance;
DROP POLICY IF EXISTS "Admins can create attendance" ON public.attendance;
DROP POLICY IF EXISTS "Admins can update attendance" ON public.attendance;
DROP POLICY IF EXISTS "Admins can delete attendance" ON public.attendance;

CREATE POLICY "Super admins can view attendance"
ON public.attendance
FOR SELECT
TO authenticated
USING (public.is_super_admin());

CREATE POLICY "Super admins can update attendance"
ON public.attendance
FOR UPDATE
TO authenticated
USING (public.is_super_admin())
WITH CHECK (public.is_super_admin());

CREATE POLICY "Super admins can delete attendance"
ON public.attendance
FOR DELETE
TO authenticated
USING (public.is_super_admin());

-- Note: no direct INSERT policy is added for 'attendance' — all
-- inserts happen through check_in_attendee(), which is
-- SECURITY DEFINER and bypasses RLS internally after its own
-- is_admin() check. This is intentional: it keeps "how a
-- check-in is recorded" centralized in one auditable function
-- rather than allowing arbitrary direct inserts.

-- =========================================================
-- ADMIN USERS
-- Provisioning new admin/super_admin accounts is already
-- super_admin-gated from the original admin_security policy —
-- left unchanged here for reference.
--
-- New: any authenticated admin may read their OWN row (and only
-- their own), so the app can show tier-appropriate navigation
-- (e.g. hiding Documentation/Partners management from
-- Coordination Team) without needing super_admin privileges just
-- to ask "what tier am I?".
-- =========================================================

CREATE POLICY "Admins can view their own admin_users row"
ON public.admin_users
FOR SELECT
TO authenticated
USING (user_id = auth.uid());