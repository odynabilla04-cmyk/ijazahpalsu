-- =========================================================
-- Roles
-- =========================================================
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'admin',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE POLICY "Users can view own roles"
  ON public.user_roles FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Auto-assign admin role on signup (demo kampus: setiap signup = admin)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'admin')
  ON CONFLICT DO NOTHING;
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================================
-- Ijazah
-- =========================================================
CREATE TABLE public.ijazah (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cert_id text NOT NULL UNIQUE,                  -- ID sertifikat publik (untuk QR)
  nama text NOT NULL,
  nim text NOT NULL,
  jurusan text NOT NULL,
  tahun_lulus int NOT NULL,
  file_hash text NOT NULL,                       -- SHA-256 dari file PDF
  ipfs_cid text NOT NULL,                        -- CID IPFS (disimulasikan)
  tx_hash text NOT NULL,                         -- "blockchain tx hash" (disimulasikan)
  block_number bigint NOT NULL,                  -- nomor blok simulasi
  file_path text NOT NULL,                       -- path di storage
  issuer_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  issuer_address text NOT NULL,                  -- alamat wallet simulasi penginput
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_ijazah_hash ON public.ijazah(file_hash);
CREATE INDEX idx_ijazah_cert_id ON public.ijazah(cert_id);
CREATE INDEX idx_ijazah_nim ON public.ijazah(nim);

ALTER TABLE public.ijazah ENABLE ROW LEVEL SECURITY;

-- Publik bisa baca (untuk verifikasi)
CREATE POLICY "Public can view ijazah"
  ON public.ijazah FOR SELECT
  USING (true);

-- Hanya admin yang bisa insert/update/delete
CREATE POLICY "Admins can insert ijazah"
  ON public.ijazah FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin') AND issuer_id = auth.uid());

CREATE POLICY "Admins can update ijazah"
  ON public.ijazah FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete ijazah"
  ON public.ijazah FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- =========================================================
-- Storage bucket untuk file PDF
-- =========================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('ijazah-files', 'ijazah-files', true);

CREATE POLICY "Public can read ijazah files"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'ijazah-files');

CREATE POLICY "Admins can upload ijazah files"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'ijazah-files'
    AND public.has_role(auth.uid(), 'admin')
  );

CREATE POLICY "Admins can delete ijazah files"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'ijazah-files'
    AND public.has_role(auth.uid(), 'admin')
  );