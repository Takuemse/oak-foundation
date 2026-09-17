-- =========================================================
-- MISSING RPC FUNCTIONS
-- app/api/qr/route.ts calls get_partner_qr() and
-- app/api/attendance/route.ts calls get_attendance_participants(),
-- but neither function exists anywhere in the migration history.
-- Every call to /api/qr or /api/attendance's participant list has
-- been failing with "could not find function" since those routes
-- were written. This migration defines both, plus a new
-- super_admin-only function for exporting sensitive fields
-- (dietary/accessibility/travel/phone/email) safely.
--
-- All three are careful about exactly which columns they expose,
-- per the Definition of Done requirement that sensitive fields
-- are never readable except by logged-in admins.
-- =========================================================

-- Drop first: CREATE OR REPLACE cannot change a function's return columns
-- (RETURNS TABLE shape), only its body. If any of these three already
-- exist with a different signature — from an earlier migration or a
-- change made directly in Supabase Studio — the CREATE OR REPLACE below
-- would fail with "cannot change return type of existing function".
-- Dropping first makes this migration safe to (re-)apply regardless of
-- what's currently live.
DROP FUNCTION IF EXISTS public.get_partner_qr(TEXT, TEXT);
DROP FUNCTION IF EXISTS public.get_attendance_participants(DATE);
DROP FUNCTION IF EXISTS public.get_attendee_sensitive_export(TEXT);

-- ---------------------------------------------------------
-- 1. get_partner_qr
-- Public-callable (anon) by design — a Partner has no login and
-- must be able to re-view their own QR code later using only the
-- token they were given (or, as a fallback, their email).
-- Returns ONLY what the QR Code Page requirements list: name,
-- organization, a registration id, and the QR token. Explicitly
-- excludes phone/email/dietary/accessibility/travel. Also
-- excludes anyone who isn't a Partner — the QR Code Page is
-- Partner-only per the requirements' role matrix.
-- ---------------------------------------------------------

CREATE OR REPLACE FUNCTION public.get_partner_qr(
    p_qr_token TEXT DEFAULT NULL,
    p_email TEXT DEFAULT NULL
)
RETURNS TABLE (
    registration_id UUID,
    first_name TEXT,
    last_name TEXT,
    organization_name TEXT,
    qr_token TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF (p_qr_token IS NULL OR trim(p_qr_token) = '')
       AND (p_email IS NULL OR trim(p_email) = '') THEN
        RAISE EXCEPTION 'A token or email is required';
    END IF;

    RETURN QUERY
    SELECT
        a.id,
        a.first_name,
        a.last_name,
        a.organization_name,
        a.qr_token
    FROM public.attendees AS a
    WHERE a.role = 'Partner'
      AND (
          (p_qr_token IS NOT NULL AND a.qr_token = trim(p_qr_token))
          OR (p_email IS NOT NULL AND lower(a.email) = lower(trim(p_email)))
      )
    LIMIT 1;
END;
$$;

REVOKE ALL ON FUNCTION public.get_partner_qr(TEXT, TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_partner_qr(TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.get_partner_qr(TEXT, TEXT) TO authenticated;

-- ---------------------------------------------------------
-- 2. get_attendance_participants
-- Powers the Coordination Team's operational Attendance page
-- participant list. is_admin()-gated (either tier may view it —
-- this is a day-of operational tool). Returns exactly the fields
-- the requirements doc lists for this list: Full Name,
-- Organization, Role, Registration Date, Attendance Status,
-- Check-In Time. Deliberately excludes phone/email/dietary/
-- accessibility/travel — those are Lead-Organizer-only via
-- get_attendee_sensitive_export() below.
-- ---------------------------------------------------------

CREATE OR REPLACE FUNCTION public.get_attendance_participants(
    p_event_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    attendee_id UUID,
    first_name TEXT,
    last_name TEXT,
    organization_name TEXT,
    role TEXT,
    registration_date TIMESTAMPTZ,
    checked_in BOOLEAN,
    checked_in_at TIMESTAMPTZ
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NOT public.is_admin() THEN
        RAISE EXCEPTION 'Only admins can view the participant list';
    END IF;

    RETURN QUERY
    SELECT
        a.id,
        a.first_name,
        a.last_name,
        a.organization_name,
        a.role,
        a.created_at,
        (att.id IS NOT NULL) AS checked_in,
        att.checked_in_at
    FROM public.attendees AS a
    LEFT JOIN public.attendance AS att
        ON att.attendee_id = a.id
        AND att.event_date = p_event_date
    ORDER BY a.created_at DESC;
END;
$$;

REVOKE ALL ON FUNCTION public.get_attendance_participants(DATE) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_attendance_participants(DATE) TO authenticated;

-- ---------------------------------------------------------
-- 3. get_attendee_sensitive_export (NEW)
-- Lead-Organizer-only (is_super_admin()). This is the one place
-- in the system where dietary/accessibility/travel/phone/email
-- are readable, for logistics purposes (catering counts,
-- accessibility arrangements, travel coordination). Everything
-- else in the app — including the Coordination Team's own
-- operational views above — must never touch these columns.
-- ---------------------------------------------------------

CREATE OR REPLACE FUNCTION public.get_attendee_sensitive_export(
    p_role TEXT DEFAULT NULL
)
RETURNS TABLE (
    attendee_id UUID,
    first_name TEXT,
    last_name TEXT,
    organization_name TEXT,
    role TEXT,
    email TEXT,
    phone TEXT,
    dietary_requirements TEXT,
    accessibility_requirements TEXT,
    travel_requirements TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    IF NOT public.is_super_admin() THEN
        RAISE EXCEPTION 'Only lead organizers can export sensitive attendee data';
    END IF;

    RETURN QUERY
    SELECT
        a.id,
        a.first_name,
        a.last_name,
        a.organization_name,
        a.role,
        a.email,
        a.phone,
        a.dietary_requirements,
        a.accessibility_requirements,
        a.travel_requirements
    FROM public.attendees AS a
    WHERE p_role IS NULL OR a.role = p_role
    ORDER BY a.last_name, a.first_name;
END;
$$;

REVOKE ALL ON FUNCTION public.get_attendee_sensitive_export(TEXT) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_attendee_sensitive_export(TEXT) TO authenticated;