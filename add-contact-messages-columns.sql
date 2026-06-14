-- Migration: Add missing columns to contact_messages table
-- Run this in your Supabase SQL editor

-- Add phone column if not exists
ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS phone TEXT DEFAULT '';

-- Add is_read column if not exists
ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS is_read BOOLEAN NOT NULL DEFAULT FALSE;

-- Add name column as alias for full_name (if using full_name)
-- If your table uses full_name, this adds a name column as well
ALTER TABLE contact_messages ADD COLUMN IF NOT EXISTS name TEXT;

-- Copy full_name into name if it exists
UPDATE contact_messages SET name = full_name WHERE name IS NULL AND full_name IS NOT NULL;

-- Make name NOT NULL after backfill
-- ALTER TABLE contact_messages ALTER COLUMN name SET NOT NULL;

-- Add RLS policy to allow admins to update (mark as read) and delete messages
DROP POLICY IF EXISTS "Admin can update contact_messages" ON contact_messages;
CREATE POLICY "Admin can update contact_messages"
  ON contact_messages FOR UPDATE
  USING (true);

DROP POLICY IF EXISTS "Admin can delete contact_messages" ON contact_messages;
CREATE POLICY "Admin can delete contact_messages"
  ON contact_messages FOR DELETE
  USING (true);
