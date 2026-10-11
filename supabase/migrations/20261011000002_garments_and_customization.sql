-- ============================================================================
-- Migration 000002: Garments, Fabrics, Options, and Compatibility Rules
-- ============================================================================

CREATE TYPE compatibility_rule_type AS ENUM ('incompatible', 'requires', 'forces_default');

-- Garment Types (e.g. "men_shirt")
CREATE TABLE IF NOT EXISTS garment_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- 3D Garment Models and Attachments
CREATE TABLE IF NOT EXISTS garment_models (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    garment_type_id UUID NOT NULL REFERENCES garment_types(id) ON DELETE CASCADE,
    mesh_identifier TEXT NOT NULL,
    slot_type TEXT NOT NULL, -- 'body', 'collar', 'cuff', 'sleeve', 'pocket', 'button'
    asset_path TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    CONSTRAINT uq_garment_mesh_slot UNIQUE (garment_type_id, mesh_identifier, slot_type)
);

-- Fabrics
CREATE TABLE IF NOT EXISTS fabrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    material_composition TEXT NOT NULL, -- e.g. "100% Egyptian Cotton"
    weave_type TEXT NOT NULL,            -- e.g. "Poplin", "Oxford", "Twill", "Linen"
    color_name TEXT NOT NULL,
    color_hex TEXT NOT NULL,
    pattern_type TEXT NOT NULL DEFAULT 'solid', -- 'solid', 'stripes', 'checks'
    texture_asset_path TEXT,
    surcharge_cents INTEGER NOT NULL DEFAULT 0 CHECK (surcharge_cents >= 0),
    in_stock BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Customization Options (Collar, Cuff, Placket, Sleeve, Pocket, Hem, Pleat, Buttons)
CREATE TABLE IF NOT EXISTS customization_options (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    garment_type_id UUID NOT NULL REFERENCES garment_types(id) ON DELETE CASCADE,
    category TEXT NOT NULL, -- 'collar', 'cuff', 'sleeve', 'placket', 'pocket', 'buttons', 'back_pleat', 'hem'
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    description TEXT,
    surcharge_cents INTEGER NOT NULL DEFAULT 0 CHECK (surcharge_cents >= 0),
    default_model_slot TEXT,
    is_default BOOLEAN NOT NULL DEFAULT false,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Option Compatibility Rules (Declarative DAG)
CREATE TABLE IF NOT EXISTS option_compatibility (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    option_a_id UUID NOT NULL REFERENCES customization_options(id) ON DELETE CASCADE,
    option_b_id UUID NOT NULL REFERENCES customization_options(id) ON DELETE CASCADE,
    rule_type compatibility_rule_type NOT NULL,
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    CONSTRAINT uq_option_rule UNIQUE (option_a_id, option_b_id, rule_type)
);

CREATE INDEX IF NOT EXISTS idx_custom_options_category ON customization_options(garment_type_id, category);
CREATE INDEX IF NOT EXISTS idx_compatibility_option_a ON option_compatibility(option_a_id);
CREATE INDEX IF NOT EXISTS idx_compatibility_option_b ON option_compatibility(option_b_id);
