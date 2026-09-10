-- =========================================================
-- OAK ZIMBABWE PARTNER GATHERING
-- INITIAL DATABASE SCHEMA
-- =========================================================


-- =========================================================
-- 1. ORGANIZATIONS
-- Stores partner organizations and sub-partners
-- =========================================================

CREATE TABLE public.organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name TEXT NOT NULL,

    organization_type TEXT NOT NULL
        CHECK (organization_type IN ('partner', 'sub_partner')),

    parent_organization_id UUID
        REFERENCES public.organizations(id)
        ON DELETE SET NULL,

    website_url TEXT,

    logo_path TEXT,

    description TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- =========================================================
-- 2. ATTENDEES
-- Stores private registration information
-- =========================================================

CREATE TABLE public.attendees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

   qr_token TEXT NOT NULL
    UNIQUE
    DEFAULT encode(extensions.gen_random_bytes(16), 'hex'),

    first_name TEXT NOT NULL,

    last_name TEXT NOT NULL,

    email TEXT NOT NULL UNIQUE,

    phone TEXT NOT NULL,

    organization_id UUID
        REFERENCES public.organizations(id)
        ON DELETE SET NULL,

    role TEXT,

    dietary_requirements TEXT,

    accessibility_requirements TEXT,

    travel_requirements TEXT,

    consent_given BOOLEAN NOT NULL DEFAULT FALSE,

    registered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- =========================================================
-- 3. ATTENDANCE
-- Records attendee check-ins for each event day
-- =========================================================

CREATE TABLE public.attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    attendee_id UUID NOT NULL
        REFERENCES public.attendees(id)
        ON DELETE CASCADE,

    event_date DATE NOT NULL,

    checked_in_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    checked_in_by UUID
        REFERENCES auth.users(id)
        ON DELETE SET NULL,

    CONSTRAINT unique_daily_attendance
        UNIQUE (attendee_id, event_date)
);


-- =========================================================
-- 4. PROGRAMME DAYS
-- Stores each day of the event
-- =========================================================

CREATE TABLE public.programme_days (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    event_date DATE NOT NULL UNIQUE,

    title TEXT NOT NULL,

    description TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- =========================================================
-- 5. PROGRAMME SESSIONS
-- Stores individual sessions for each programme day
-- =========================================================

CREATE TABLE public.programme_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    programme_day_id UUID NOT NULL
        REFERENCES public.programme_days(id)
        ON DELETE CASCADE,

    title TEXT NOT NULL,

    description TEXT,

    start_time TIME NOT NULL,

    end_time TIME NOT NULL,

    location TEXT,

    display_order INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- =========================================================
-- 6. DOCUMENTATION POSTS
-- Stores daily event documentation
-- =========================================================

CREATE TABLE public.documentation_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    event_date DATE NOT NULL,

    title TEXT NOT NULL,

    content TEXT NOT NULL,

    is_published BOOLEAN NOT NULL DEFAULT FALSE,

    created_by UUID
        REFERENCES auth.users(id)
        ON DELETE SET NULL,

    published_at TIMESTAMPTZ,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- =========================================================
-- 7. DOCUMENTATION PHOTOS
-- Stores references to photos in Supabase Storage
-- =========================================================

CREATE TABLE public.documentation_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    documentation_post_id UUID NOT NULL
        REFERENCES public.documentation_posts(id)
        ON DELETE CASCADE,

    storage_path TEXT NOT NULL,

    caption TEXT,

    display_order INTEGER NOT NULL DEFAULT 0,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- =========================================================
-- INDEXES
-- Improve performance for commonly used queries
-- =========================================================

CREATE INDEX idx_attendees_organization
ON public.attendees(organization_id);


CREATE INDEX idx_attendance_attendee
ON public.attendance(attendee_id);


CREATE INDEX idx_attendance_event_date
ON public.attendance(event_date);


CREATE INDEX idx_programme_sessions_day
ON public.programme_sessions(programme_day_id);


CREATE INDEX idx_documentation_posts_date
ON public.documentation_posts(event_date);


CREATE INDEX idx_documentation_photos_post
ON public.documentation_photos(documentation_post_id);