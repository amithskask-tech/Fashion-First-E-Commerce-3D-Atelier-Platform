-- ============================================================================
-- Migration 000001: Initial Core Schema (Profiles & Body Measurements)
-- ============================================================================

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Custom Enums
CREATE TYPE user_role AS ENUM ('customer', 'staff', 'admin');
CREATE TYPE fit_preference_type AS ENUM ('slim', 'regular', 'relaxed');
CREATE TYPE measurement_unit AS ENUM ('metric', 'imperial');

-- Profiles Table (Linked to Supabase auth.users or standalone UUIDs)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role user_role NOT NULL DEFAULT 'customer',
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now())
);

-- Body Profiles (Customers can have multiple profiles, e.g. "Self - Formal", "Brother", "Self - Casual")
CREATE TABLE IF NOT EXISTS body_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    profile_name TEXT NOT NULL,
    fit_preference fit_preference_type NOT NULL DEFAULT 'regular',
    preferred_unit measurement_unit NOT NULL DEFAULT 'metric',
    is_default BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    CONSTRAINT uq_customer_profile_name UNIQUE (profile_id, profile_name)
);

-- Body Measurements (Strictly canonical: mm and kg)
CREATE TABLE IF NOT EXISTS body_measurements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    body_profile_id UUID NOT NULL REFERENCES body_profiles(id) ON DELETE CASCADE,
    version INTEGER NOT NULL DEFAULT 1,
    
    -- Linear dimensions in millimetres (integer)
    height_mm INTEGER NOT NULL CHECK (height_mm BETWEEN 1200 AND 2400),
    weight_kg NUMERIC(5, 2) NOT NULL CHECK (weight_kg BETWEEN 30.00 AND 300.00),
    neck_circ_mm INTEGER NOT NULL CHECK (neck_circ_mm BETWEEN 280 AND 650),
    chest_circ_mm INTEGER NOT NULL CHECK (chest_circ_mm BETWEEN 650 AND 1900),
    waist_circ_mm INTEGER NOT NULL CHECK (waist_circ_mm BETWEEN 500 AND 1900),
    hip_circ_mm INTEGER NOT NULL CHECK (hip_circ_mm BETWEEN 650 AND 1900),
    shoulder_width_mm INTEGER NOT NULL CHECK (shoulder_width_mm BETWEEN 300 AND 700),
    sleeve_length_mm INTEGER NOT NULL CHECK (sleeve_length_mm BETWEEN 400 AND 1000),
    bicep_circ_mm INTEGER NOT NULL CHECK (bicep_circ_mm BETWEEN 180 AND 650),
    wrist_circ_mm INTEGER NOT NULL CHECK (wrist_circ_mm BETWEEN 100 AND 350),
    shirt_length_mm INTEGER NOT NULL CHECK (shirt_length_mm BETWEEN 500 AND 1100),
    
    additional_measurements JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc', now()),
    CONSTRAINT uq_body_profile_version UNIQUE (body_profile_id, version)
);

CREATE INDEX IF NOT EXISTS idx_body_profiles_profile_id ON body_profiles(profile_id);
CREATE INDEX IF NOT EXISTS idx_body_measurements_profile_id ON body_measurements(body_profile_id);
