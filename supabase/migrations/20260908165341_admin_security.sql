-- =========================================================
-- OAK ZIMBABWE PARTNER GATHERING
-- ADMIN USERS AND SECURITY FOUNDATION
-- =========================================================


-- =========================================================
-- 1. ADMIN USERS
-- Links authorized Supabase Auth users to the admin system
-- =========================================================

CREATE TABLE public.admin_users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    user_id UUID NOT NULL UNIQUE
        REFERENCES auth.users(id)
        ON DELETE CASCADE,

    role TEXT NOT NULL DEFAULT 'admin'
        CHECK (role IN ('admin', 'super_admin')),

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- =========================================================
-- 2. ENABLE ROW LEVEL SECURITY
-- =========================================================

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.attendees ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.attendance ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.programme_days ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.programme_sessions ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.documentation_posts ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.documentation_photos ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;


-- =========================================================
-- 3. ADMIN SECURITY FUNCTION
-- Returns true if the authenticated user is an admin
-- =========================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM public.admin_users
        WHERE user_id = auth.uid()
    );
$$;