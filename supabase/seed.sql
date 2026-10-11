-- ============================================================================
-- Supabase Seed Data: Men's Shirt Catalog, Fabrics, Options, Compatibility, Sizing & Pricing
-- ============================================================================

-- 1. Garment Type
INSERT INTO garment_types (id, code, name, description, is_active)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    'men_shirt',
    'Men''s Tailored Shirt',
    'Custom tailored dress and casual shirt engineered to exact anatomical measurements.',
    true
) ON CONFLICT (code) DO NOTHING;

-- 2. Fabrics
INSERT INTO fabrics (id, code, name, material_composition, weave_type, color_name, color_hex, pattern_type, surcharge_cents, in_stock)
VALUES
    ('22222222-2222-2222-2222-000000000001', 'poplin_white', 'Egyptian Cotton Poplin', '100% 2-ply Long Staple Egyptian Cotton (120/2)', 'Poplin', 'Crisp White', '#f8fafc', 'solid', 0, true),
    ('22222222-2222-2222-2222-000000000002', 'oxford_sky', 'Royal Oxford Cotton', '100% Combed Cotton Oxford', 'Oxford', 'Sky Blue', '#bae6fd', 'solid', 0, true),
    ('22222222-2222-2222-2222-000000000003', 'twill_navy', 'Herringbone Twill Navy', '100% Premium Twill (100/2)', 'Twill', 'Midnight Navy', '#1e293b', 'solid', 1500, true),
    ('22222222-2222-2222-2222-000000000004', 'linen_sand', 'Normandy Washed Linen', '100% European Flax Linen', 'Linen Plain', 'Natural Sand', '#e2e8f0', 'solid', 2500, true)
ON CONFLICT (code) DO NOTHING;

-- 3. Customization Options for Men's Shirt
-- Collars
INSERT INTO customization_options (id, garment_type_id, category, code, name, description, surcharge_cents, default_model_slot, is_default, is_active)
VALUES
    ('33333333-3333-3333-3333-000000000001', '11111111-1111-1111-1111-111111111111', 'collar', 'collar_spread', 'Classic Semi-Spread Collar', 'Versatile collar suitable for standard neckties or open collar styling.', 0, 'collar_spread', true, true),
    ('33333333-3333-3333-3333-000000000002', '11111111-1111-1111-1111-111111111112', 'collar', 'collar_buttondown', 'Button-Down Collar', 'Casual American style with secure roll buttons.', 0, 'collar_buttondown', false, true),
    ('33333333-3333-3333-3333-000000000003', '11111111-1111-1111-1111-111111111113', 'collar', 'collar_band', 'Band / Grandad Collar', 'Modern minimalist standing collar without collar points.', 500, 'collar_band', false, true),
    ('33333333-3333-3333-3333-000000000004', '11111111-1111-1111-1111-111111111114', 'collar', 'collar_cutaway', 'Full Cutaway Italian Collar', 'Wide spread designed for large tie knots and contemporary formalwear.', 0, 'collar_spread', false, true)
ON CONFLICT (code) DO NOTHING;

-- Cuffs
INSERT INTO customization_options (id, garment_type_id, category, code, name, description, surcharge_cents, default_model_slot, is_default, is_active)
VALUES
    ('33333333-3333-3333-3333-000000000010', '11111111-1111-1111-1111-111111111111', 'cuff', 'cuff_barrel', 'Single-Button Barrel Cuff', 'Standard round barrel cuff with single adjustable button.', 0, 'cuff_barrel', true, true),
    ('33333333-3333-3333-3333-000000000011', '11111111-1111-1111-1111-111111111111', 'cuff', 'cuff_french', 'Double French Cuff', 'Formal folded cuff requiring cufflinks.', 1000, 'cuff_french', false, true),
    ('33333333-3333-3333-3333-000000000012', '11111111-1111-1111-1111-111111111111', 'cuff', 'cuff_none', 'No Cuff (Short Sleeve)', 'Clean hemmed sleeve finish.', 0, 'cuff_none', false, true)
ON CONFLICT (code) DO NOTHING;

-- Sleeves
INSERT INTO customization_options (id, garment_type_id, category, code, name, description, surcharge_cents, default_model_slot, is_default, is_active)
VALUES
    ('33333333-3333-3333-3333-000000000020', '11111111-1111-1111-1111-111111111111', 'sleeve', 'sleeve_long', 'Long Sleeve', 'Full length sleeve with gauntlet button.', 0, 'sleeve_long', true, true),
    ('33333333-3333-3333-3333-000000000021', '11111111-1111-1111-1111-111111111111', 'sleeve', 'sleeve_short', 'Short Sleeve', 'Summer length tailored at bicep level.', 0, 'sleeve_short', false, true)
ON CONFLICT (code) DO NOTHING;

-- Plackets
INSERT INTO customization_options (id, garment_type_id, category, code, name, description, surcharge_cents, default_model_slot, is_default, is_active)
VALUES
    ('33333333-3333-3333-3333-000000000030', '11111111-1111-1111-1111-111111111111', 'placket', 'placket_front', 'Standard Stitched Placket', 'Classic folded and edge-stitched front placket.', 0, 'placket_front', true, true),
    ('33333333-3333-3333-3333-000000000031', '11111111-1111-1111-1111-111111111111', 'placket', 'placket_french', 'French Front (Seamless)', 'Clean folded edge with hidden stitching for modern dress shirts.', 0, 'placket_french', false, true),
    ('33333333-3333-3333-3333-000000000032', '11111111-1111-1111-1111-111111111111', 'placket', 'placket_concealed', 'Covered / Fly Front Placket', 'Fabric flap covers buttons entirely. Formal tuxedo style.', 800, 'placket_concealed', false, true)
ON CONFLICT (code) DO NOTHING;

-- Pockets
INSERT INTO customization_options (id, garment_type_id, category, code, name, description, surcharge_cents, default_model_slot, is_default, is_active)
VALUES
    ('33333333-3333-3333-3333-000000000040', '11111111-1111-1111-1111-111111111111', 'pocket', 'pocket_none', 'No Pocket', 'Clean, sleek chest styling.', 0, 'pocket_none', true, true),
    ('33333333-3333-3333-3333-000000000041', '11111111-1111-1111-1111-111111111111', 'pocket', 'pocket_single_chest', 'Single Left Chest Pocket', 'Rounded utility patch pocket on left chest.', 0, 'pocket_single_chest', false, true)
ON CONFLICT (code) DO NOTHING;

-- Buttons
INSERT INTO customization_options (id, garment_type_id, category, code, name, description, surcharge_cents, default_model_slot, is_default, is_active)
VALUES
    ('33333333-3333-3333-3333-000000000050', '11111111-1111-1111-1111-111111111111', 'buttons', 'button_mother_pearl', 'Genuine Mother of Pearl', 'Luminous natural trocas shell buttons.', 1200, 'button_mop', true, true),
    ('33333333-3333-3333-3333-000000000051', '11111111-1111-1111-1111-111111111111', 'buttons', 'button_classic_resin', 'Durable White Resin', 'High-durability laser-engraved cross-stitch buttons.', 0, 'button_resin', false, true),
    ('33333333-3333-3333-3333-000000000052', '11111111-1111-1111-1111-111111111111', 'buttons', 'button_horn_smoke', 'Dark Smoke Horn Buttons', 'Polished horn buttons with rich natural grain.', 1500, 'button_horn', false, true)
ON CONFLICT (code) DO NOTHING;

-- Back Pleats
INSERT INTO customization_options (id, garment_type_id, category, code, name, description, surcharge_cents, default_model_slot, is_default, is_active)
VALUES
    ('33333333-3333-3333-3333-000000000060', '11111111-1111-1111-1111-111111111111', 'back_pleat', 'pleat_side', 'Dual Side Pleats', 'Two knife pleats below the yoke at shoulder blades for optimal shoulder mobility.', 0, 'pleat_side', true, true),
    ('33333333-3333-3333-3333-000000000061', '11111111-1111-1111-1111-111111111111', 'back_pleat', 'pleat_box', 'Center Box Pleat', 'Casual Ivy League style center pleat with hanging loop.', 0, 'pleat_box', false, true),
    ('33333333-3333-3333-3333-000000000062', '11111111-1111-1111-1111-111111111111', 'back_pleat', 'pleat_plain', 'Plain Back (No Pleats)', 'Fitted clean back with dual vertical darts.', 0, 'pleat_plain', false, true)
ON CONFLICT (code) DO NOTHING;

-- Hem
INSERT INTO customization_options (id, garment_type_id, category, code, name, description, surcharge_cents, default_model_slot, is_default, is_active)
VALUES
    ('33333333-3333-3333-3333-000000000070', '11111111-1111-1111-1111-111111111111', 'hem', 'hem_curved', 'Classic Tails Hem (Curved)', 'Long curved hem engineered to stay tucked into trousers.', 0, 'hem_curved', true, true),
    ('33333333-3333-3333-3333-000000000071', '11111111-1111-1111-1111-111111111111', 'hem', 'hem_straight', 'Straight Hem with Side Vents', 'Shorter cut designed specifically for untucked wear.', 0, 'hem_straight', false, true)
ON CONFLICT (code) DO NOTHING;

-- 4. Option Compatibility Rules
-- Rule 1: French Cuffs are incompatible with Short Sleeves
INSERT INTO option_compatibility (option_a_id, option_b_id, rule_type, reason)
VALUES (
    '33333333-3333-3333-3333-000000000011', -- cuff_french
    '33333333-3333-3333-3333-000000000021', -- sleeve_short
    'incompatible',
    'French double cuffs require full length sleeves and cannot be constructed on short sleeves.'
) ON CONFLICT DO NOTHING;

-- Rule 2: Short Sleeves require No Cuff
INSERT INTO option_compatibility (option_a_id, option_b_id, rule_type, reason)
VALUES (
    '33333333-3333-3333-3333-000000000021', -- sleeve_short
    '33333333-3333-3333-3333-000000000012', -- cuff_none
    'forces_default',
    'Selecting short sleeves automatically sets the cuff style to clean hem (no cuff).'
) ON CONFLICT DO NOTHING;

-- 5. Standard Garment Grading Chart (Measurements in mm)
INSERT INTO garment_measurements (garment_type_id, size_code, chest_garment_mm, waist_garment_mm, hip_garment_mm, neck_garment_mm, shoulder_garment_mm, sleeve_garment_mm, length_garment_mm)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'XS',  980,  880,  960,  370, 430, 810, 740),
    ('11111111-1111-1111-1111-111111111111', 'S',  1040,  940, 1020,  385, 450, 830, 760),
    ('11111111-1111-1111-1111-111111111111', 'M',  1100, 1000, 1080,  400, 470, 850, 780),
    ('11111111-1111-1111-1111-111111111111', 'L',  1180, 1080, 1160,  420, 490, 875, 800),
    ('11111111-1111-1111-1111-111111111111', 'XL', 1260, 1180, 1240,  440, 510, 900, 820),
    ('11111111-1111-1111-1111-111111111111', 'XXL',1340, 1280, 1320,  460, 530, 920, 840)
ON CONFLICT (garment_type_id, size_code) DO NOTHING;

-- 6. Tailoring Ease Rules (Allowance added to customer body measurements in mm)
INSERT INTO size_rules (garment_type_id, fit_preference, chest_ease_mm, waist_ease_mm, hip_ease_mm, bicep_ease_mm, neck_ease_mm)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'slim',    80,  60,  60, 40, 15),
    ('11111111-1111-1111-1111-111111111111', 'regular', 120, 100, 100, 60, 15),
    ('11111111-1111-1111-1111-111111111111', 'relaxed', 160, 140, 140, 80, 20)
ON CONFLICT (garment_type_id, fit_preference) DO NOTHING;

-- 7. Base Pricing Rules
INSERT INTO price_rules (garment_type_id, version, base_price_cents, custom_fit_surcharge_cents, currency, is_active)
VALUES (
    '11111111-1111-1111-1111-111111111111',
    1,
    11900, -- $119.00 USD base shirt price
    2000,  -- $20.00 USD made-to-measure custom pattern drafting surcharge
    'USD',
    true
) ON CONFLICT (garment_type_id, version) DO NOTHING;

-- 8. Sample Customer Profile and Body Profile for Instant Local / Test Usage
INSERT INTO profiles (id, email, full_name, role)
VALUES (
    '44444444-4444-4444-4444-444444444444',
    'customer.demo@bespoke-shirts.local',
    'Alexander Vance',
    'customer'
) ON CONFLICT (email) DO NOTHING;

INSERT INTO body_profiles (id, profile_id, profile_name, fit_preference, preferred_unit, is_default)
VALUES (
    '55555555-5555-5555-5555-555555555555',
    '44444444-4444-4444-4444-444444444444',
    'My Standard Fit (Office)',
    'regular',
    'metric',
    true
) ON CONFLICT DO NOTHING;

INSERT INTO body_measurements (
    id, body_profile_id, version,
    height_mm, weight_kg, neck_circ_mm, chest_circ_mm, waist_circ_mm, hip_circ_mm,
    shoulder_width_mm, sleeve_length_mm, bicep_circ_mm, wrist_circ_mm, shirt_length_mm
) VALUES (
    '66666666-6666-6666-6666-666666666666',
    '55555555-5555-5555-5555-555555555555',
    1,
    1800,  -- 180 cm / 5'11"
    78.50, -- 78.5 kg
    395,   -- 39.5 cm / 15.5"
    1010,  -- 101 cm / 39.8"
    860,   -- 86 cm / 33.8"
    990,   -- 99 cm / 39"
    465,   -- 46.5 cm / 18.3"
    840,   -- 84 cm / 33"
    340,   -- 34 cm / 13.4"
    175,   -- 17.5 cm / 6.9"
    760    -- 76 cm / 30"
) ON CONFLICT DO NOTHING;
