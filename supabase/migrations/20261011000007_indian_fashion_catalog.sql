-- ============================================================================
-- Migration 000007: Indian Fashion Catalog, Textiles & Unified E-Commerce
-- ============================================================================

-- 1. Extend Garment Types with Cultural & Regional Metadata
ALTER TABLE garment_types
    ADD COLUMN IF NOT EXISTS category TEXT NOT NULL DEFAULT 'traditional',
    ADD COLUMN IF NOT EXISTS gender TEXT NOT NULL DEFAULT 'men',
    ADD COLUMN IF NOT EXISTS occasion TEXT NOT NULL DEFAULT 'festive',
    ADD COLUMN IF NOT EXISTS region TEXT NOT NULL DEFAULT 'All India',
    ADD COLUMN IF NOT EXISTS is_ready_made BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN IF NOT EXISTS is_customizable BOOLEAN NOT NULL DEFAULT true;

-- 2. Extend Fabrics with Indian Textile Attributes
ALTER TABLE fabrics
    ADD COLUMN IF NOT EXISTS regional_trade_name TEXT,
    ADD COLUMN IF NOT EXISTS region_of_origin TEXT,
    ADD COLUMN IF NOT EXISTS weight_gsm INTEGER,
    ADD COLUMN IF NOT EXISTS drape_characteristics TEXT DEFAULT 'crisp',
    ADD COLUMN IF NOT EXISTS border_pattern_type TEXT DEFAULT 'none',
    ADD COLUMN IF NOT EXISTS border_width_mm INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS suitable_garment_types JSONB DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS care_instructions TEXT DEFAULT 'Dry clean or gentle hand wash',
    ADD COLUMN IF NOT EXISTS is_authenticity_verified BOOLEAN NOT NULL DEFAULT true;

-- 3. Ready-Made Products Catalog
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    garment_type_id UUID REFERENCES garment_types(id) ON DELETE SET NULL,
    sku TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    category TEXT NOT NULL,     -- 'kurtas', 'nehru_jackets', 'sherwanis', 'dhotis_mundu', 'sarees', 'blouses', 'western'
    gender TEXT NOT NULL,       -- 'men', 'women', 'unisex'
    occasion TEXT NOT NULL,     -- 'festive', 'wedding', 'ceremony', 'everyday', 'office'
    region TEXT NOT NULL,       -- 'Kerala', 'Tamil Nadu', 'Bengal', 'Rajasthan', 'Gujarat', 'Kashmir', 'All India'
    fabric_name TEXT NOT NULL,
    color_name TEXT NOT NULL,
    color_hex TEXT NOT NULL,
    price_paise INTEGER NOT NULL CHECK (price_paise >= 0),
    is_ready_made BOOLEAN NOT NULL DEFAULT true,
    is_customizable BOOLEAN NOT NULL DEFAULT false,
    image_placeholder TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 4. Ready-Made Product Variants (Sizes & Inventory)
CREATE TABLE IF NOT EXISTS product_variants (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
    size_code TEXT NOT NULL,    -- 'S', 'M', 'L', 'XL', 'XXL'
    stock_quantity INTEGER NOT NULL DEFAULT 10 CHECK (stock_quantity >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    CONSTRAINT uq_product_size UNIQUE (product_id, size_code)
);

CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_gender ON products(gender);
CREATE INDEX IF NOT EXISTS idx_products_occasion ON products(occasion);
CREATE INDEX IF NOT EXISTS idx_products_region ON products(region);
CREATE INDEX IF NOT EXISTS idx_product_variants_product_id ON product_variants(product_id);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE product_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read products" ON products FOR SELECT USING (true);
CREATE POLICY "Public read product_variants" ON product_variants FOR SELECT USING (true);
CREATE POLICY "Staff manage products" ON products FOR ALL USING (is_staff_or_admin());
CREATE POLICY "Staff manage product_variants" ON product_variants FOR ALL USING (is_staff_or_admin());
