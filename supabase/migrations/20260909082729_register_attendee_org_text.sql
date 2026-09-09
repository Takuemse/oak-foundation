DROP FUNCTION IF EXISTS public.register_attendee(
    TEXT, TEXT, TEXT, TEXT, UUID, TEXT, TEXT, TEXT, TEXT, BOOLEAN
);

CREATE OR REPLACE FUNCTION public.register_attendee(
    p_first_name TEXT,
    p_last_name TEXT,
    p_email TEXT,
    p_phone TEXT,
    p_organization_name TEXT DEFAULT NULL,
    p_sub_partner TEXT DEFAULT NULL,
    p_role TEXT DEFAULT NULL,
    p_dietary_requirements TEXT DEFAULT NULL,
    p_accessibility_requirements TEXT DEFAULT NULL,
    p_travel_requirements TEXT DEFAULT NULL,
    p_consent_given BOOLEAN DEFAULT FALSE
)
RETURNS TABLE (
    attendee_id UUID,
    first_name TEXT,
    last_name TEXT,
    qr_token TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    new_attendee_id UUID;
    new_qr_token TEXT;
BEGIN
    IF p_consent_given IS NOT TRUE THEN
        RAISE EXCEPTION 'Consent is required to register for this event';
    END IF;

    IF p_first_name IS NULL OR trim(p_first_name) = '' THEN
        RAISE EXCEPTION 'First name is required';
    END IF;

    IF p_last_name IS NULL OR trim(p_last_name) = '' THEN
        RAISE EXCEPTION 'Last name is required';
    END IF;

    IF p_email IS NULL OR trim(p_email) = '' THEN
        RAISE EXCEPTION 'Email is required';
    END IF;

    IF p_phone IS NULL OR trim(p_phone) = '' THEN
        RAISE EXCEPTION 'Phone number is required';
    END IF;

    IF p_organization_name IS NULL OR trim(p_organization_name) = '' THEN
        RAISE EXCEPTION 'Organization is required';
    END IF;

    IF EXISTS (
        SELECT 1
        FROM public.attendees AS existing_attendee
        WHERE lower(existing_attendee.email) = lower(trim(p_email))
    ) THEN
        RAISE EXCEPTION 'An attendee with this email is already registered';
    END IF;

    INSERT INTO public.attendees AS new_attendee (
        first_name,
        last_name,
        email,
        phone,
        organization_name,
        sub_partner,
        role,
        dietary_requirements,
        accessibility_requirements,
        travel_requirements,
        consent_given
    )
    VALUES (
        trim(p_first_name),
        trim(p_last_name),
        lower(trim(p_email)),
        trim(p_phone),
        trim(p_organization_name),
        NULLIF(trim(p_sub_partner), ''),
        NULLIF(trim(p_role), ''),
        NULLIF(trim(p_dietary_requirements), ''),
        NULLIF(trim(p_accessibility_requirements), ''),
        NULLIF(trim(p_travel_requirements), ''),
        p_consent_given
    )
    RETURNING new_attendee.id, new_attendee.qr_token
    INTO new_attendee_id, new_qr_token;

    RETURN QUERY
    SELECT
        new_attendee_id,
        trim(p_first_name),
        trim(p_last_name),
        new_qr_token;
END;
$$;

REVOKE ALL ON FUNCTION public.register_attendee(
    TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, BOOLEAN
) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.register_attendee(
    TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, BOOLEAN
) TO anon;

GRANT EXECUTE ON FUNCTION public.register_attendee(
    TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, TEXT, BOOLEAN
) TO authenticated;