-- =========================================================
-- ENABLE REQUIRED EXTENSIONS
-- pgcrypto is pre-installed on local Supabase dev environments
-- but must be explicitly enabled on a fresh cloud project.
-- Must run before any migration using gen_random_bytes()
-- or gen_random_uuid() with older Postgres versions.
-- =========================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;