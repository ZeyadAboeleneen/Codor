-- Migration: Add missing columns to orders table
-- Run this in your Supabase SQL editor (Dashboard → SQL Editor)

-- Add order_id column (the app-generated ID like "order-1234567-abc")
ALTER TABLE orders ADD COLUMN IF NOT EXISTS order_id TEXT;

-- Add items column (JSONB array of order items)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS items JSONB NOT NULL DEFAULT '[]'::jsonb;

-- Add discount_code column
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_code TEXT;

-- Add discount_amount column
ALTER TABLE orders ADD COLUMN IF NOT EXISTS discount_amount NUMERIC(10, 2) DEFAULT 0;

-- Backfill order_id from id for any existing rows
UPDATE orders SET order_id = id::text WHERE order_id IS NULL;

-- Add unique index on order_id
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_order_id ON orders(order_id);

-- Add index on status for filtering
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);

-- Add index on user_id for user order lookups
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON orders(user_id);
