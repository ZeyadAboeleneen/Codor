-- ============================================
-- Condor V2 - Add Missing Columns Migration
-- Run this in Supabase Dashboard > SQL Editor
-- ============================================

-- 1. Add missing columns to brands table
ALTER TABLE brands ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS description_ar TEXT;
ALTER TABLE brands ADD COLUMN IF NOT EXISTS description_en TEXT;

-- 2. Set all existing brands to active
UPDATE brands SET is_active = true WHERE is_active IS NULL;

-- 3. Set sort_order for existing brands
UPDATE brands SET sort_order = 1 WHERE slug = 'pedrollo';
UPDATE brands SET sort_order = 2 WHERE slug = 'pentax';
UPDATE brands SET sort_order = 3 WHERE slug = 'dab';
UPDATE brands SET sort_order = 4 WHERE slug = 'condor';

-- 4. Create "images" bucket if it doesn't exist (already created via API)
-- This is done via the Supabase Storage UI or API.

-- 5. Storage policy: allow public reads on images bucket
-- (Go to Storage > images > Policies > Add Policy)
-- Or run:
DO $$
BEGIN
  -- Allow public read on images bucket
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Public read images' AND tablename = 'objects'
  ) THEN
    CREATE POLICY "Public read images" ON storage.objects
      FOR SELECT USING (bucket_id = 'images');
  END IF;

  -- Allow authenticated uploads to images bucket
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Auth upload images' AND tablename = 'objects'
  ) THEN
    CREATE POLICY "Auth upload images" ON storage.objects
      FOR INSERT WITH CHECK (bucket_id = 'images');
  END IF;
  
  -- Allow authenticated updates to images bucket
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE policyname = 'Auth update images' AND tablename = 'objects'
  ) THEN
    CREATE POLICY "Auth update images" ON storage.objects
      FOR UPDATE USING (bucket_id = 'images');
  END IF;
END $$;

-- 6. Verify
SELECT name_en, is_active, sort_order FROM brands ORDER BY sort_order;
