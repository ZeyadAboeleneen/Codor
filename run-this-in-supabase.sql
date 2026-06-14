-- ============================================================
-- Run this entire script in Supabase Dashboard → SQL Editor
-- ============================================================

-- ── 1. Fix orders table ──────────────────────────────────────

-- Add missing columns
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_id TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS items JSONB NOT NULL DEFAULT '[]'::jsonb;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_code TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(10,2) DEFAULT 0;

-- Make order_number nullable so existing rows without it don't block inserts
-- (the app now always sends order_number = order_id)
ALTER TABLE orders ALTER COLUMN order_number DROP NOT NULL;

-- Backfill order_id / order_number for any existing rows
UPDATE orders SET order_id = id::text WHERE order_id IS NULL;
UPDATE orders SET order_number = order_id WHERE order_number IS NULL;

-- Indexes
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_order_id ON orders(order_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);


-- ── 2. Create contact_messages table (if it doesn't exist) ───

CREATE TABLE IF NOT EXISTS contact_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL DEFAULT '',
  full_name TEXT,
  email TEXT NOT NULL,
  phone TEXT DEFAULT '',
  subject TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for ordering
CREATE INDEX IF NOT EXISTS idx_contact_messages_created ON contact_messages(created_at DESC);

-- Allow anyone to insert (contact form is public)
ALTER TABLE contact_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can submit contact form" ON contact_messages;
CREATE POLICY "Anyone can submit contact form"
  ON contact_messages FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service role full access to contact_messages" ON contact_messages;
CREATE POLICY "Service role full access to contact_messages"
  ON contact_messages FOR ALL
  USING (true);
