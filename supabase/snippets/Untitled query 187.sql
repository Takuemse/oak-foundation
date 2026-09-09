SELECT *
FROM public.register_attendee(
    p_first_name := 'Test',
    p_last_name := 'Attendee',
    p_email := 'test@example.com',
    p_phone := '+263771234567',
    p_role := 'Programme Officer',
    p_dietary_requirements := 'Vegetarian',
    p_accessibility_requirements := NULL,
    p_travel_requirements := 'Transport required',
    p_consent_given := TRUE
);