-- ============================================================================
-- Migration 000004: Designs, Orders, Production Specifications & Tracking
-- ============================================================================

CREATE TYPE order_status AS ENUM (
    'draft',
    'confirmed',
    'accepted_production',
    'in_production',
    'quality_check',
    'ready_dispatch',
    'completed',
    'cancelled',
    'rejected'
);

-- Saved Customer Designs
CREATE TABLE IF NOT EXISTS designs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    garment_type_id UUID NOT NULL REFERENCES garment_types(id) ON DELETE RESTRICT,
    body_profile_id UUID REFERENCES body_profiles(id) ON DELETE SET NULL,
    name TEXT NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    is_finalized BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Design Selections (Normalised link of options and fabrics per design)
CREATE TABLE IF NOT EXISTS design_selections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    design_id UUID NOT NULL REFERENCES designs(id) ON DELETE CASCADE,
    category TEXT NOT NULL,
    option_id UUID NOT NULL REFERENCES customization_options(id) ON DELETE RESTRICT,
    fabric_id UUID NOT NULL REFERENCES fabrics(id) ON DELETE RESTRICT,
    custom_values JSONB DEFAULT '{}'::jsonb,
    CONSTRAINT uq_design_category UNIQUE (design_id, category)
);

-- Orders
CREATE TABLE IF NOT EXISTS orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE RESTRICT,
    order_number TEXT UNIQUE NOT NULL,
    status order_status NOT NULL DEFAULT 'confirmed',
    total_price_cents INTEGER NOT NULL CHECK (total_price_cents >= 0),
    currency TEXT NOT NULL DEFAULT 'USD',
    idempotency_key TEXT UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Order Items (Contains immutable snapshots of design, measurements, and applied pricing)
CREATE TABLE IF NOT EXISTS order_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    design_id UUID REFERENCES designs(id) ON DELETE SET NULL,
    quantity INTEGER NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit_price_cents INTEGER NOT NULL CHECK (unit_price_cents >= 0),
    
    -- Immutable Historical Snapshots
    design_snapshot JSONB NOT NULL,
    measurement_snapshot JSONB NOT NULL,
    pricing_breakdown_snapshot JSONB NOT NULL,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Production Specifications (Opaque tech pack for tailoring, redacting customer PII)
CREATE TABLE IF NOT EXISTS production_specs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_item_id UUID UNIQUE NOT NULL REFERENCES order_items(id) ON DELETE CASCADE,
    spec_number TEXT UNIQUE NOT NULL,
    version INTEGER NOT NULL DEFAULT 1,
    customer_ref TEXT NOT NULL, -- Pseudonymized reference, e.g. "CUST-9821"
    
    -- Tailoring cuts and manufacturing specs
    cut_dimensions JSONB NOT NULL,
    bill_of_materials JSONB NOT NULL,
    construction_instructions JSONB NOT NULL,
    
    status TEXT NOT NULL DEFAULT 'ready_for_cutting',
    generated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Production Lifecycle Events (Audit trail for status transitions)
CREATE TABLE IF NOT EXISTS production_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    from_status order_status NOT NULL,
    to_status order_status NOT NULL,
    actor_profile_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX IF NOT EXISTS idx_designs_profile_id ON designs(profile_id);
CREATE INDEX IF NOT EXISTS idx_orders_profile_id ON orders(profile_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_order_id ON order_items(order_id);
CREATE INDEX IF NOT EXISTS idx_production_events_order_id ON production_events(order_id);
