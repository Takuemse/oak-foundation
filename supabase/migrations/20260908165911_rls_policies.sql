-- =========================================================
-- OAK ZIMBABWE PARTNER GATHERING
-- ROW LEVEL SECURITY POLICIES
-- =========================================================


-- =========================================================
-- ORGANIZATIONS
-- Public users can view partner organizations
-- =========================================================

CREATE POLICY "Public can view organizations"
ON public.organizations
FOR SELECT
TO anon, authenticated
USING (true);


-- Admins can manage organizations

CREATE POLICY "Admins can manage organizations"
ON public.organizations
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());


-- =========================================================
-- PROGRAMME DAYS
-- Public users can view the event programme
-- =========================================================

CREATE POLICY "Public can view programme days"
ON public.programme_days
FOR SELECT
TO anon, authenticated
USING (true);


CREATE POLICY "Admins can manage programme days"
ON public.programme_days
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());


-- =========================================================
-- PROGRAMME SESSIONS
-- Public users can view programme sessions
-- =========================================================

CREATE POLICY "Public can view programme sessions"
ON public.programme_sessions
FOR SELECT
TO anon, authenticated
USING (true);


CREATE POLICY "Admins can manage programme sessions"
ON public.programme_sessions
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- =========================================================
-- DOCUMENTATION POSTS
-- Public users can only view published posts
-- =========================================================

CREATE POLICY "Public can view published documentation"
ON public.documentation_posts
FOR SELECT
TO anon, authenticated
USING (
    is_published = true
);


-- Admins can manage all documentation posts

CREATE POLICY "Admins can manage documentation posts"
ON public.documentation_posts
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());


-- =========================================================
-- DOCUMENTATION PHOTOS
-- Public users can view photos belonging to published posts
-- =========================================================

CREATE POLICY "Public can view photos from published posts"
ON public.documentation_photos
FOR SELECT
TO anon, authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.documentation_posts
        WHERE documentation_posts.id =
              documentation_photos.documentation_post_id
        AND documentation_posts.is_published = true
    )
);


-- Admins can manage documentation photos

CREATE POLICY "Admins can manage documentation photos"
ON public.documentation_photos
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());


-- =========================================================
-- ATTENDEES
-- Private data: only authorized admins can access it
-- =========================================================

CREATE POLICY "Admins can view attendees"
ON public.attendees
FOR SELECT
TO authenticated
USING (public.is_admin());


CREATE POLICY "Admins can update attendees"
ON public.attendees
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());


CREATE POLICY "Admins can delete attendees"
ON public.attendees
FOR DELETE
TO authenticated
USING (public.is_admin());


-- =========================================================
-- ATTENDANCE
-- Only admins can access attendance records
-- =========================================================

CREATE POLICY "Admins can view attendance"
ON public.attendance
FOR SELECT
TO authenticated
USING (public.is_admin());


CREATE POLICY "Admins can create attendance"
ON public.attendance
FOR INSERT
TO authenticated
WITH CHECK (public.is_admin());


CREATE POLICY "Admins can update attendance"
ON public.attendance
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());


CREATE POLICY "Admins can delete attendance"
ON public.attendance
FOR DELETE
TO authenticated
USING (public.is_admin());

-- =========================================================
-- ADMIN USERS
-- Prevent public access to administrator information
-- =========================================================

CREATE POLICY "Super admins can manage admin users"
ON public.admin_users
FOR ALL
TO authenticated
USING (
    EXISTS (
        SELECT 1
        FROM public.admin_users
        WHERE user_id = auth.uid()
        AND role = 'super_admin'
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM public.admin_users
        WHERE user_id = auth.uid()
        AND role = 'super_admin'
    )
);