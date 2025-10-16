-- Create storage bucket for clan logos
INSERT INTO storage.buckets (id, name, public)
VALUES ('clan-logos', 'clan-logos', true);

-- Allow anyone to view clan logos
CREATE POLICY "Clan logos are publicly accessible"
ON storage.objects
FOR SELECT
USING (bucket_id = 'clan-logos');

-- Allow admins to upload clan logos
CREATE POLICY "Admins can upload clan logos"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'clan-logos' AND
  has_role(auth.uid(), 'admin'::app_role)
);

-- Allow admins to update clan logos
CREATE POLICY "Admins can update clan logos"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'clan-logos' AND
  has_role(auth.uid(), 'admin'::app_role)
);

-- Allow admins to delete clan logos
CREATE POLICY "Admins can delete clan logos"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'clan-logos' AND
  has_role(auth.uid(), 'admin'::app_role)
);