ALTER TABLE public.programme_sessions
    ADD COLUMN category TEXT
        CHECK (category IN ('plenary', 'breakout', 'workshop', 'social')),
    ADD COLUMN presenter_name TEXT,
    ADD COLUMN presenter_org TEXT,
    ADD COLUMN is_featured BOOLEAN NOT NULL DEFAULT FALSE;