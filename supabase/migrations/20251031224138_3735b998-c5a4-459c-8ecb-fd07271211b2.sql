-- Fix PUBLIC_DATA_EXPOSURE: Restrict clan_members access to authenticated users only
-- This prevents public exposure of student emails and personal information

DROP POLICY IF EXISTS "Anyone can view clan members" ON public.clan_members;

CREATE POLICY "Authenticated users can view clan members"
ON public.clan_members 
FOR SELECT 
USING (auth.uid() IS NOT NULL);