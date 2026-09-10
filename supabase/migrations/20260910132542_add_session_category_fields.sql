ALTER TABLE public.programme_sessions
  ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'plenary'
    CHECK (category IN ('plenary','breakout','workshop','social','break')),
  ADD COLUMN IF NOT EXISTS presenter_name text,
  ADD COLUMN IF NOT EXISTS presenter_org text,
  ADD COLUMN IF NOT EXISTS is_featured boolean NOT NULL DEFAULT false;