-- =========================================================
-- OPTION B: COORDINATION TEAM SELF-DECLARED ACCESS
-- Per updated requirements, Coordination Team members reach
-- Check-In/Attendance immediately after registering, with no
-- separate login. This REMOVES the admin-only requirement on
-- these two functions — deliberate, informed trade-off; the
-- real access boundary implied by the PDF is "the person chose
-- this role at registration," not a verified credential.
-- =========================================================

CREATE OR REPLACE FUNCTION public.check_in_attendee(
    p_qr_token TEXT,
    p_event_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    attendance_id UUID,
    attendee_id UUID,
    first_name TEXT,
    last_name TEXT,
    organization_name TEXT,
    role TEXT,
    event_date DATE,
    checked_in_at TIMESTAMPTZ,
    already_checked_in BOOLEAN
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_attendee_id UUID;
    v_first_name TEXT;
    v_last_name TEXT;
    v_role TEXT;
    v_org_name TEXT;
    v_existing_id UUID;
    v_existing_checked_in_at TIMESTAMPTZ;
    v_new_id UUID;
    v_new_checked_in_at TIMESTAMPTZ;
BEGIN
    IF p_qr_token IS NULL OR trim(p_qr_token) = '' THEN
        RAISE EXCEPTION 'QR code not recognised';
    END IF;

    SELECT a.id, a.first_name, a.last_name, a.role, o.name
    INTO v_attendee_id, v_first_name, v_last_name, v_role, v_org_name
    FROM public.attendees AS a
    LEFT JOIN public.organizations AS o ON o.id = a.organization_id
    WHERE a.qr_token = trim(p_qr_token);

    IF v_attendee_id IS NULL THEN
        RAISE EXCEPTION 'QR code not recognised';
    END IF;

    SELECT att.id, att.checked_in_at
    INTO v_existing_id, v_existing_checked_in_at
    FROM public.attendance AS att
    WHERE att.attendee_id = v_attendee_id AND att.event_date = p_event_date;

    IF v_existing_id IS NOT NULL THEN
        RETURN QUERY
        SELECT v_existing_id, v_attendee_id, v_first_name, v_last_name,
               v_org_name, v_role, p_event_date, v_existing_checked_in_at, TRUE;
        RETURN;
    END IF;

    INSERT INTO public.attendance AS att (attendee_id, event_date)
    VALUES (v_attendee_id, p_event_date)
    RETURNING att.id, att.checked_in_at INTO v_new_id, v_new_checked_in_at;

    RETURN QUERY
    SELECT v_new_id, v_attendee_id, v_first_name, v_last_name,
           v_org_name, v_role, p_event_date, v_new_checked_in_at, FALSE;
END;
$$;

REVOKE ALL ON FUNCTION public.check_in_attendee(TEXT, DATE) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.check_in_attendee(TEXT, DATE) TO anon;
GRANT EXECUTE ON FUNCTION public.check_in_attendee(TEXT, DATE) TO authenticated;


CREATE OR REPLACE FUNCTION public.get_attendance_summary(
    p_event_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    event_date DATE,
    total_registered BIGINT,
    checked_in BIGINT,
    pending BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_total BIGINT;
    v_checked_in BIGINT;
BEGIN
    SELECT COUNT(*) INTO v_total FROM public.attendees;
    SELECT COUNT(*) INTO v_checked_in
    FROM public.attendance WHERE attendance.event_date = p_event_date;

    RETURN QUERY SELECT p_event_date, v_total, v_checked_in, v_total - v_checked_in;
END;
$$;

REVOKE ALL ON FUNCTION public.get_attendance_summary(DATE) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_attendance_summary(DATE) TO anon;
GRANT EXECUTE ON FUNCTION public.get_attendance_summary(DATE) TO authenticated;