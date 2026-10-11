-- ============================================================================
-- Migration 000003: Sizing Rules, Grading Charts, and Pricing Rules
-- ============================================================================

-- Standard Garment Sizing Dimensions (Grading chart per garment type)
CREATE TABLE IF NOT EXISTS garment_measurements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    garment_type_id UUID NOT NULL REFERENCES garment_types(id) ON DELETE CASCADE,
    size_code TEXT NOT NULL, -- 'XS', 'S', 'M', 'L', 'XL', 'XXL'
    chest_garment_mm INTEGER NOT NULL CHECK (chest_garment_mm > 0),
    waist_garment_mm INTEGER NOT NULL CHECK (waist_garment_mm > 0),
    hip_garment_mm INTEGER NOT NULL CHECK (hip_garment_mm > 0),
    neck_garment_mm INTEGER NOT NULL CHECK (neck_garment_mm > 0),
    shoulder_garment_mm INTEGER NOT NULL CHECK (shoulder_garment_mm > 0),
    sleeve_garment_mm INTEGER NOT NULL CHECK (sleeve_garment_mm > 0),
    length_garment_mm INTEGER NOT NULL CHECK (length_garment_mm > 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    CONSTRAINT uq_garment_size_code UNIQUE (garment_type_id, size_code)
);

-- Tailoring Ease Rules (Garment-specific ease allowance based on fit preference)
CREATE TABLE IF NOT EXISTS size_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    garment_type_id UUID NOT NULL REFERENCES garment_types(id) ON DELETE CASCADE,
    fit_preference fit_preference_type NOT NULL,
    chest_ease_mm INTEGER NOT NULL CHECK (chest_ease_mm >= 0),
    waist_ease_mm INTEGER NOT NULL CHECK (waist_ease_mm >= 0),
    hip_ease_mm INTEGER NOT NULL CHECK (hip_ease_mm >= 0),
    bicep_ease_mm INTEGER NOT NULL CHECK (bicep_ease_mm >= 0),
    neck_ease_mm INTEGER NOT NULL CHECK (neck_ease_mm >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    CONSTRAINT uq_garment_fit_ease UNIQUE (garment_type_id, fit_preference)
);

-- Versioned Pricing Rules (Server authoritative, integer cents)
CREATE TABLE IF NOT EXISTS price_rules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    garment_type_id UUID NOT NULL REFERENCES garment_types(id) ON DELETE CASCADE,
    version INTEGER NOT NULL DEFAULT 1,
    base_price_cents INTEGER NOT NULL CHECK (base_price_cents >= 0),
    custom_fit_surcharge_cents INTEGER NOT NULL DEFAULT 0 CHECK (custom_fit_surcharge_cents >= 0),
    currency TEXT NOT NULL DEFAULT 'USD',
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    CONSTRAINT uq_garment_price_version UNIQUE (garment_type_id, version)
);

CREATE INDEX IF NOT EXISTS idx_price_rules_active ON price_rules(garment_type_id, is_active);
