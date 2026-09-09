-- =========================================================
-- SECURE REGISTRATION FUNCTION ACCESS
-- Explicitly control who can execute register_attendee()
-- =========================================================

REVOKE ALL ON FUNCTION public.register_attendee(
    TEXT, TEXT, TEXT, TEXT, UUID, TEXT, TEXT, TEXT, TEXT, BOOLEAN
) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.register_attendee(
    TEXT, TEXT, TEXT, TEXT, UUID, TEXT, TEXT, TEXT, TEXT, BOOLEAN
) TO anon;

GRANT EXECUTE ON FUNCTION public.register_attendee(
    TEXT, TEXT, TEXT, TEXT, UUID, TEXT, TEXT, TEXT, TEXT, BOOLEAN
) TO authenticated;

