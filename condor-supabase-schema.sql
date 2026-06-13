-- Condor Egypt (Water Pumps) Supabase Schema
-- Run this in your Supabase SQL Editor

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ----------------------------------------------------
-- CLEANUP PREVIOUS SCHEMA (WARNING: This deletes old data)
-- ----------------------------------------------------
DROP TABLE IF EXISTS order_items CASCADE;
DROP TABLE IF EXISTS orders CASCADE;
DROP TABLE IF EXISTS reviews CASCADE;
DROP TABLE IF EXISTS carts CASCADE;
DROP TABLE IF EXISTS products CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS brands CASCADE;
DROP TABLE IF EXISTS hero_slides CASCADE;
DROP TABLE IF EXISTS homepage_sections CASCADE;
DROP TABLE IF EXISTS settings CASCADE;
DROP TABLE IF EXISTS contact_messages CASCADE;
DROP TABLE IF EXISTS offers CASCADE;
DROP TABLE IF EXISTS discount_codes CASCADE;
-- Note: We are keeping the 'users' table structure largely the same, but dropping it 
-- will delete auth relations if not careful. However, in this dev schema, we drop it to cleanly rebuild.
DROP TABLE IF EXISTS users CASCADE;

-- 1. Brands
CREATE TABLE brands (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    logo_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Categories
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    description_ar TEXT,
    description_en TEXT,
    image_url TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Products
CREATE TABLE products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    slug TEXT UNIQUE NOT NULL,
    category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
    brand_id UUID REFERENCES brands(id) ON DELETE SET NULL,
    model_name TEXT NOT NULL,
    name_ar TEXT NOT NULL,
    name_en TEXT NOT NULL,
    description_ar TEXT,
    description_en TEXT,
    specifications JSONB DEFAULT '{}'::jsonb, -- e.g., {"horsepower": "1 HP", "max_head": "50m", "max_flow": "80 l/min"}
    price NUMERIC(10, 2) NOT NULL,
    before_sale_price NUMERIC(10, 2),
    stock INTEGER NOT NULL DEFAULT 0,
    images TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    rating NUMERIC(3, 2) DEFAULT 0,
    reviews_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Hero Slides
CREATE TABLE hero_slides (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title_ar TEXT NOT NULL,
    title_en TEXT NOT NULL,
    subtitle_ar TEXT,
    subtitle_en TEXT,
    image_url TEXT NOT NULL,
    link_url TEXT,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    phone TEXT UNIQUE,
    name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'employee', 'user')),
    favorites TEXT[] DEFAULT ARRAY[]::TEXT[],
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. Carts
CREATE TABLE carts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_id TEXT UNIQUE, -- For guest users
    items JSONB NOT NULL DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT has_user_or_session CHECK (user_id IS NOT NULL OR session_id IS NOT NULL)
);

-- 7. Orders
CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_number TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    total NUMERIC(10, 2) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
    shipping_address JSONB NOT NULL,
    payment_method TEXT NOT NULL CHECK (payment_method IN ('cod', 'visa', 'mastercard')),
    payment_details JSONB,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 8. Order Items
CREATE TABLE order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE SET NULL,
    product_name_ar TEXT NOT NULL,
    product_name_en TEXT NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    price NUMERIC(10, 2) NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Reviews
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_approved BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Homepage Sections
CREATE TABLE homepage_sections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL, -- e.g., 'hero', 'categories', 'featured_products', 'brands'
    title_ar TEXT,
    title_en TEXT,
    config JSONB DEFAULT '{}'::jsonb,
    sort_order INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Settings
CREATE TABLE settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);


-- Storage Buckets Configuration (via SQL, requires superuser privileges or can be done in dashboard)
INSERT INTO storage.buckets (id, name, public) VALUES 
  ('products', 'products', true),
  ('brands', 'brands', true),
  ('hero', 'hero', true),
  ('categories', 'categories', true)
ON CONFLICT (id) DO NOTHING;

-- Bucket Policies (Public read)
DROP POLICY IF EXISTS "Public Access" ON storage.objects;
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING ( bucket_id IN ('products', 'brands', 'hero', 'categories') );


-- Indexes for Performance
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_brand ON products(brand_id);
CREATE INDEX idx_products_slug ON products(slug);
CREATE INDEX idx_products_is_active ON products(is_active);
CREATE INDEX idx_orders_user ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_order_items_order ON order_items(order_id);
CREATE INDEX idx_reviews_product ON reviews(product_id);

-- Auto Updated_at Trigger Function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply triggers
CREATE TRIGGER update_brands_updated_at BEFORE UPDATE ON brands FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_hero_slides_updated_at BEFORE UPDATE ON hero_slides FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_carts_updated_at BEFORE UPDATE ON carts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reviews_updated_at BEFORE UPDATE ON reviews FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_homepage_sections_updated_at BEFORE UPDATE ON homepage_sections FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_settings_updated_at BEFORE UPDATE ON settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS)

-- Enable RLS
ALTER TABLE brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE carts ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE homepage_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

-- Public READ policies
CREATE POLICY "Brands viewable by everyone" ON brands FOR SELECT USING (true);
CREATE POLICY "Categories viewable by everyone" ON categories FOR SELECT USING (true);
CREATE POLICY "Active products viewable by everyone" ON products FOR SELECT USING (is_active = true);
CREATE POLICY "Active hero slides viewable by everyone" ON hero_slides FOR SELECT USING (is_active = true);
CREATE POLICY "Active homepage sections viewable by everyone" ON homepage_sections FOR SELECT USING (is_active = true);
CREATE POLICY "Approved reviews viewable by everyone" ON reviews FOR SELECT USING (is_approved = true);

-- User Policies
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid()::text = id::text);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid()::text = id::text);
CREATE POLICY "Anyone can register" ON users FOR INSERT WITH CHECK (true);

-- Carts
CREATE POLICY "Users can manage own cart" ON carts FOR ALL USING (
    (auth.uid()::text = user_id::text) OR (session_id IS NOT NULL)
);

-- Orders
CREATE POLICY "Users can view own orders" ON orders FOR SELECT USING (auth.uid()::text = user_id::text);
CREATE POLICY "Users can create orders" ON orders FOR INSERT WITH CHECK (auth.uid()::text = user_id::text OR user_id IS NULL);
CREATE POLICY "Users can view own order items" ON order_items FOR SELECT USING (
    order_id IN (SELECT id FROM orders WHERE user_id::text = auth.uid()::text)
);
CREATE POLICY "Users can insert order items" ON order_items FOR INSERT WITH CHECK (true);

-- Reviews
CREATE POLICY "Users can create reviews" ON reviews FOR INSERT WITH CHECK (auth.uid()::text = user_id::text);
CREATE POLICY "Users can manage own reviews" ON reviews FOR UPDATE USING (auth.uid()::text = user_id::text);

-- Admin Bypass (You would typically use a trigger or JWT claims to handle full admin bypass securely, 
-- but since API routes often use service_role key, they will automatically bypass RLS.)

-- ----------------------------------------------------
-- SEED DATA (Condor Water Pumps)
-- ----------------------------------------------------

-- Insert Brands
INSERT INTO brands (id, slug, name_ar, name_en) VALUES 
('11111111-1111-1111-1111-111111111111', 'pedrollo', 'بيدرولو', 'Pedrollo'),
('22222222-2222-2222-2222-222222222222', 'pentax', 'بنتاكس', 'Pentax'),
('33333333-3333-3333-3333-333333333333', 'dab', 'داب', 'DAB'),
('44444444-4444-4444-4444-444444444444', 'condor', 'كوندور', 'Condor')
ON CONFLICT (id) DO NOTHING;

-- Insert Categories
INSERT INTO categories (id, slug, name_ar, name_en, sort_order) VALUES 
('aaaa1111-1111-1111-1111-111111111111', 'submersible-pumps', 'مضخات غاطسة', 'Submersible Pumps', 1),
('bbbb2222-2222-2222-2222-222222222222', 'centrifugal-pumps', 'مضخات طرد مركزي', 'Centrifugal Pumps', 2),
('cccc3333-3333-3333-3333-333333333333', 'surface-pumps', 'مضخات سطحية', 'Surface Pumps', 3),
('dddd4444-4444-4444-4444-444444444444', 'deep-well-pumps', 'مضخات آبار عميقة', 'Deep Well Pumps', 4)
ON CONFLICT (id) DO NOTHING;

-- Insert Products
INSERT INTO products (slug, category_id, brand_id, model_name, name_ar, name_en, description_ar, description_en, specifications, price, stock, is_active, is_featured, images) VALUES 
('pedrollo-pk60', 'bbbb2222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'PKm 60', 'مضخة مياه بيدرولو نصف حصان', 'Pedrollo 0.5 HP Water Pump', 'مضخة طرد مركزي عالية الجودة للاستخدام المنزلي.', 'High quality centrifugal pump for domestic use.', '{"horsepower": "0.5 HP", "max_head": "38m", "max_flow": "40 l/min"}'::jsonb, 3500.00, 50, true, true, ARRAY['/placeholder.svg']),
('pentax-cm100', 'bbbb2222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'CM 100', 'مضخة مياه بنتاكس 1 حصان', 'Pentax 1 HP Water Pump', 'مضخة سطحية ممتازة لرفع المياه للادوار العليا.', 'Excellent surface pump for high floors.', '{"horsepower": "1.0 HP", "max_head": "50m", "max_flow": "90 l/min"}'::jsonb, 5200.00, 30, true, true, ARRAY['/placeholder.svg']),
('condor-subm-15', 'aaaa1111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 'CS-150', 'مضخة غاطسة كوندور 1.5 حصان', 'Condor 1.5 HP Submersible Pump', 'مضخة غاطسة للآبار والصرف الصحي.', 'Submersible pump for wells and drainage.', '{"horsepower": "1.5 HP", "max_head": "20m", "max_flow": "250 l/min"}'::jsonb, 7800.00, 15, true, false, ARRAY['/placeholder.svg'])
ON CONFLICT (slug) DO NOTHING;
