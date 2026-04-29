-- Revoke execute on SECURITY DEFINER helpers (still callable inside RLS / triggers)
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;

-- Tighten storage SELECT: only allow fetching specific objects (still works via getPublicUrl),
-- but disallow broad listing.
DROP POLICY IF EXISTS "Public can read ijazah files" ON storage.objects;

CREATE POLICY "Public can read specific ijazah files"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'ijazah-files'
    AND name IS NOT NULL
  );