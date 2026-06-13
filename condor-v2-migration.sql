-- Condor Egypt V2 Migration Schema
-- Run this in your Supabase SQL Editor

-- 1. Drop the old categories table and references
ALTER TABLE IF EXISTS products DROP CONSTRAINT IF EXISTS products_category_id_fkey;
DROP TABLE IF EXISTS categories CASCADE;

-- 2. Modify products table to be the Product Type (e.g. 'APm Peripheral Pump')
-- First drop columns we no longer need on the product level
ALTER TABLE products 
  DROP COLUMN IF EXISTS category_id,
  DROP COLUMN IF EXISTS price,
  DROP COLUMN IF EXISTS stock,
  DROP COLUMN IF EXISTS specifications,
  DROP COLUMN IF EXISTS model_name,
  DROP COLUMN IF EXISTS before_sale_price,
  DROP COLUMN IF EXISTS rating,
  DROP COLUMN IF EXISTS reviews_count,
  DROP COLUMN IF EXISTS is_featured,
  DROP COLUMN IF EXISTS images;

-- Add new columns to products
ALTER TABLE products 
  ADD COLUMN IF NOT EXISTS image_url TEXT,
  ADD COLUMN IF NOT EXISTS sort_order INTEGER DEFAULT 0;

-- 3. Create Models table (e.g. APm60, APm110)
CREATE TABLE IF NOT EXISTS models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    description_ar TEXT,
    description_en TEXT,
    price NUMERIC(10,2) NOT NULL,
    before_sale_price NUMERIC(10,2),
    hp TEXT,
    kw TEXT,
    voltage TEXT,
    phase TEXT,
    max_head TEXT,
    max_flow TEXT,
    specifications JSONB DEFAULT '{}'::jsonb,
    images TEXT[] DEFAULT ARRAY[]::TEXT[],
    stock INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Update Hero Slides table
ALTER TABLE hero_slides 
  ADD COLUMN IF NOT EXISTS product_id UUID REFERENCES products(id) ON DELETE SET NULL;

-- 5. Indexes for Performance
CREATE INDEX IF NOT EXISTS idx_models_product ON models(product_id);
CREATE INDEX IF NOT EXISTS idx_models_brand ON models(brand_id);
CREATE INDEX IF NOT EXISTS idx_models_slug ON models(slug);
CREATE INDEX IF NOT EXISTS idx_models_is_active ON models(is_active);

-- 6. Trigger for updated_at on models
DROP TRIGGER IF EXISTS update_models_updated_at ON models;
CREATE TRIGGER update_models_updated_at BEFORE UPDATE ON models FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. RLS Policies for models
ALTER TABLE models ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Active models viewable by everyone" ON models;
CREATE POLICY "Active models viewable by everyone" ON models FOR SELECT USING (is_active = true);

-- Enable RLS for all users on products as well
DROP POLICY IF EXISTS "Active products viewable by everyone" ON products;
CREATE POLICY "Active products viewable by everyone" ON products FOR SELECT USING (is_active = true);

-- Admin Bypass is handled by using service_role key in API routes

-- 8. Seed Data for Brands (if not exists)
INSERT INTO brands (id, slug, name_ar, name_en) VALUES 
('11111111-1111-1111-1111-111111111111', 'pedrollo', 'بيدرولو', 'Pedrollo'),
('22222222-2222-2222-2222-222222222222', 'pentax', 'بنتاكس', 'Pentax'),
('33333333-3333-3333-3333-333333333333', 'dab', 'داب', 'DAB'),
('44444444-4444-4444-4444-444444444444', 'condor', 'كوندور', 'Condor')
ON CONFLICT (id) DO NOTHING;
