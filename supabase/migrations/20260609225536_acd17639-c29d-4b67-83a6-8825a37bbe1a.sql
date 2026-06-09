GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, anon, service_role;

-- Ensure storage policies exist for ijazah-files bucket
DROP POLICY IF EXISTS "Admins can upload ijazah files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can update ijazah files" ON storage.objects;
DROP POLICY IF EXISTS "Admins can delete ijazah files" ON storage.objects;
DROP POLICY IF EXISTS "Public can read ijazah files" ON storage.objects;

CREATE POLICY "Admins can upload ijazah files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'ijazah-files' AND public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can update ijazah files"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'ijazah-files' AND public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can delete ijazah files"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'ijazah-files' AND public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Public can read ijazah files"
ON storage.objects FOR SELECT TO public
USING (bucket_id = 'ijazah-files');
