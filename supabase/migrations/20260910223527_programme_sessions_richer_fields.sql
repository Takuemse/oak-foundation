-- =========================================================
-- PROGRAMME SESSIONS: RICHER FIELDS (IDEMPOTENT GUARD)
-- These columns are first added by
-- 20260909113000_programme_sessions_richer_fields.sql; an
-- equivalent guard exists in
-- 20260910132542_add_session_category_fields.sql.
--
-- IF NOT EXISTS makes this migration a no-op wherever the
-- columns already exist, so the full chain — including a
-- fresh `supabase db reset` — runs cleanly in timestamp
-- order instead of failing with "column already exists".
-- =========================================================

ALTER TABLE public.programme_sessions
    ADD COLUMN IF NOT EXISTS category TEXT
        NOT NULL DEFAULT 'plenary'
        CHECK (category IN ('plenary', 'breakout', 'workshop', 'social', 'break')),
    ADD COLUMN IF NOT EXISTS presenter_name TEXT,
    ADD COLUMN IF NOT EXISTS presenter_org TEXT,
    ADD COLUMN IF NOT EXISTS is_featured BOOLEAN NOT NULL DEFAULT FALSE;