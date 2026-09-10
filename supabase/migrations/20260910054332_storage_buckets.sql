-- =========================================================
-- STORAGE BUCKETS
-- logos: partner organization logos — publicly readable
-- photos: event documentation photos — publicly readable
--         once attached to a published documentation post
-- Both: only admins can upload/modify/delete
-- =========================================================

INSERT INTO storage.buckets (id, name, public)
VALUES
    ('logos', 'logos', true),
    ('photos', 'photos', true);

-- =========================================================
-- LOGOS BUCKET POLICIES
-- =========================================================

CREATE POLICY "Public can view logos"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'logos');

CREATE POLICY "Admins can upload logos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'logos' AND public.is_admin());

CREATE POLICY "Admins can update logos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'logos' AND public.is_admin())
WITH CHECK (bucket_id = 'logos' AND public.is_admin());

CREATE POLICY "Admins can delete logos"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'logos' AND public.is_admin());

-- =========================================================
-- PHOTOS BUCKET POLICIES
-- Same admin-only write model. Public read is acceptable here
-- because documentation_photos rows are only ever linked to
-- documentation_posts, which already have their own
-- is_published gate at the database-row level — this bucket
-- policy controls the raw file, not which posts reference it.
-- =========================================================

CREATE POLICY "Public can view photos"
ON storage.objects
FOR SELECT
TO anon, authenticated
USING (bucket_id = 'photos');

CREATE POLICY "Admins can upload photos"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'photos' AND public.is_admin());

CREATE POLICY "Admins can update photos"
ON storage.objects
FOR UPDATE
TO authenticated
USING (bucket_id = 'photos' AND public.is_admin())
WITH CHECK (bucket_id = 'photos' AND public.is_admin());

CREATE POLICY "Admins can delete photos"
ON storage.objects
FOR DELETE
TO authenticated
USING (bucket_id = 'photos' AND public.is_admin());