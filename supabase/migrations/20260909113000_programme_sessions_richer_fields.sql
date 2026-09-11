-- =========================================================
-- PROGRAMME SESSIONS: RICHER FIELDS
-- Adds category classification, presenter attribution and a
-- "featured session" flag consumed by the public programme
-- page (/programme) and its API route (/api/programme).
--
-- Runs immediately before seed_programme (20260909113510),
-- which inserts rows using these columns.
--
-- category is NOT NULL DEFAULT 'plenary' so the app can treat
-- it as a guaranteed non-null SessionCategory value.
-- =========================================================

ALTER TABLE public.programme_sessions
    ADD COLUMN category TEXT
        NOT NULL DEFAULT 'plenary'
        CHECK (category IN ('plenary', 'breakout', 'workshop', 'social', 'break')),
    ADD COLUMN presenter_name TEXT,
    ADD COLUMN presenter_org TEXT,
    ADD COLUMN is_featured BOOLEAN NOT NULL DEFAULT FALSE;
