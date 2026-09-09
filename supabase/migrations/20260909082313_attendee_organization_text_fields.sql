-- =========================================================
-- ADD FREE-TEXT ORGANIZATION FIELDS TO ATTENDEES
-- Matches the Figma registration form, which collects
-- organization/sub-partner as free text, not a directory pick
-- =========================================================

ALTER TABLE public.attendees
    ADD COLUMN organization_name TEXT,
    ADD COLUMN sub_partner TEXT;