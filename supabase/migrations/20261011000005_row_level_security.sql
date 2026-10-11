-- ============================================================================
-- Migration 000005: Row Level Security (RLS) & Updated_at Triggers
-- ============================================================================

-- Function to automatically bump updated_at
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc', now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply triggers
CREATE TRIGGER trg_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_body_profiles_updated_at BEFORE UPDATE ON body_profiles FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_designs_updated_at BEFORE UPDATE ON designs FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE body_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE garment_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE garment_models ENABLE ROW LEVEL SECURITY;
ALTER TABLE fabrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE customization_options ENABLE ROW LEVEL SECURITY;
ALTER TABLE option_compatibility ENABLE ROW LEVEL SECURITY;
ALTER TABLE designs ENABLE ROW LEVEL SECURITY;
ALTER TABLE design_selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE garment_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE size_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_specs ENABLE ROW LEVEL SECURITY;
ALTER TABLE production_events ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current caller is staff or admin
CREATE OR REPLACE FUNCTION is_staff_or_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM profiles
        WHERE id = auth.uid() AND role IN ('staff', 'admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Publicly readable catalog tables
CREATE POLICY "Public read garment_types" ON garment_types FOR SELECT USING (true);
CREATE POLICY "Public read garment_models" ON garment_models FOR SELECT USING (true);
CREATE POLICY "Public read fabrics" ON fabrics FOR SELECT USING (true);
CREATE POLICY "Public read customization_options" ON customization_options FOR SELECT USING (true);
CREATE POLICY "Public read option_compatibility" ON option_compatibility FOR SELECT USING (true);
CREATE POLICY "Public read garment_measurements" ON garment_measurements FOR SELECT USING (true);
CREATE POLICY "Public read size_rules" ON size_rules FOR SELECT USING (true);
CREATE POLICY "Public read price_rules" ON price_rules FOR SELECT USING (true);

-- Staff manage catalog tables
CREATE POLICY "Staff manage garment_types" ON garment_types FOR ALL USING (is_staff_or_admin());
CREATE POLICY "Staff manage garment_models" ON garment_models FOR ALL USING (is_staff_or_admin());
CREATE POLICY "Staff manage fabrics" ON fabrics FOR ALL USING (is_staff_or_admin());
CREATE POLICY "Staff manage customization_options" ON customization_options FOR ALL USING (is_staff_or_admin());
CREATE POLICY "Staff manage option_compatibility" ON option_compatibility FOR ALL USING (is_staff_or_admin());
CREATE POLICY "Staff manage garment_measurements" ON garment_measurements FOR ALL USING (is_staff_or_admin());
CREATE POLICY "Staff manage size_rules" ON size_rules FOR ALL USING (is_staff_or_admin());
CREATE POLICY "Staff manage price_rules" ON price_rules FOR ALL USING (is_staff_or_admin());

-- Customer Profile Isolation
CREATE POLICY "Users read own profile" ON profiles FOR SELECT USING (auth.uid() = id OR is_staff_or_admin());
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Body Profile & Measurement Isolation
CREATE POLICY "Users access own body profiles" ON body_profiles FOR ALL USING (auth.uid() = profile_id OR is_staff_or_admin());

CREATE POLICY "Users access own body measurements" ON body_measurements FOR ALL USING (
    EXISTS (
        SELECT 1 FROM body_profiles
        WHERE body_profiles.id = body_measurements.body_profile_id
        AND (body_profiles.profile_id = auth.uid() OR is_staff_or_admin())
    )
);

-- Design Isolation
CREATE POLICY "Users access own designs" ON designs FOR ALL USING (auth.uid() = profile_id OR is_staff_or_admin());

CREATE POLICY "Users access own design selections" ON design_selections FOR ALL USING (
    EXISTS (
        SELECT 1 FROM designs
        WHERE designs.id = design_selections.design_id
        AND (designs.profile_id = auth.uid() OR is_staff_or_admin())
    )
);

-- Order Isolation
CREATE POLICY "Users read own orders" ON orders FOR SELECT USING (auth.uid() = profile_id OR is_staff_or_admin());
CREATE POLICY "Users insert own orders" ON orders FOR INSERT WITH CHECK (auth.uid() = profile_id);
CREATE POLICY "Staff update orders" ON orders FOR UPDATE USING (is_staff_or_admin());

CREATE POLICY "Users read own order items" ON order_items FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM orders
        WHERE orders.id = order_items.order_id
        AND (orders.profile_id = auth.uid() OR is_staff_or_admin())
    )
);

-- Production Specs & Events: Staff can manage; Customer can view spec of their own order item
CREATE POLICY "Access production specs" ON production_specs FOR SELECT USING (
    is_staff_or_admin() OR EXISTS (
        SELECT 1 FROM order_items
        JOIN orders ON orders.id = order_items.order_id
        WHERE order_items.id = production_specs.order_item_id
        AND orders.profile_id = auth.uid()
    )
);
CREATE POLICY "Staff manage production specs" ON production_specs FOR ALL USING (is_staff_or_admin());

CREATE POLICY "Access production events" ON production_events FOR SELECT USING (
    is_staff_or_admin() OR EXISTS (
        SELECT 1 FROM orders
        WHERE orders.id = production_events.order_id
        AND orders.profile_id = auth.uid()
    )
);
CREATE POLICY "Staff insert production events" ON production_events FOR INSERT WITH CHECK (is_staff_or_admin());
