-- =========================================================
-- SHORT, HUMAN-READABLE QR TOKENS
-- Replaces the 32-char hex token with a format matching the
-- Figma reference: OAK-2026-XXXX-XXXX (uppercase alphanumeric)
-- =========================================================

CREATE OR REPLACE FUNCTION public.generate_short_qr_token()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
    chars TEXT := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; -- no 0/O/1/I to avoid confusion
    part1 TEXT := '';
    part2 TEXT := '';
    i INT;
BEGIN
    FOR i IN 1..4 LOOP
        part1 := part1 || substr(chars, floor(random() * length(chars) + 1)::INT, 1);
    END LOOP;
    FOR i IN 1..4 LOOP
        part2 := part2 || substr(chars, floor(random() * length(chars) + 1)::INT, 1);
    END LOOP;

    RETURN 'OAK-2026-' || part1 || '-' || part2;
END;
$$;

ALTER TABLE public.attendees
    ALTER COLUMN qr_token SET DEFAULT public.generate_short_qr_token();