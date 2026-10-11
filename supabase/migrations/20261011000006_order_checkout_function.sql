-- ============================================================================
-- Migration 000006: Server-Authoritative Checkout Stored Function
-- ============================================================================

CREATE OR REPLACE FUNCTION place_order_transaction(
    p_profile_id UUID,
    p_design_id UUID,
    p_idempotency_key TEXT,
    p_quantity INTEGER,
    p_expected_price_cents INTEGER,
    p_design_snapshot JSONB,
    p_measurement_snapshot JSONB,
    p_pricing_snapshot JSONB,
    p_cut_dimensions JSONB,
    p_bill_of_materials JSONB,
    p_construction_instructions JSONB
)
RETURNS JSONB AS $$
DECLARE
    v_order_id UUID;
    v_order_item_id UUID;
    v_spec_id UUID;
    v_order_number TEXT;
    v_spec_number TEXT;
    v_calculated_price_cents INTEGER;
    v_customer_ref TEXT;
BEGIN
    -- 1. Idempotency check: if an order with this idempotency key already exists, return it
    IF p_idempotency_key IS NOT NULL THEN
        SELECT id, order_number INTO v_order_id, v_order_number
        FROM orders
        WHERE idempotency_key = p_idempotency_key;

        IF FOUND THEN
            RETURN jsonb_build_object(
                'status', 'success',
                'order_id', v_order_id,
                'order_number', v_order_number,
                'idempotent', true
            );
        END IF;
    END IF;

    -- 2. Verify server-authoritative pricing from snapshot
    v_calculated_price_cents := (p_pricing_snapshot->>'totalCents')::INTEGER;
    IF v_calculated_price_cents IS NULL OR v_calculated_price_cents != p_expected_price_cents THEN
        RAISE EXCEPTION 'Price discrepancy detected. Client expected %, server calculated %',
            p_expected_price_cents, v_calculated_price_cents;
    END IF;

    -- 3. Generate human-readable identifiers
    v_order_number := 'ORD-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substring(replace(uuid_generate_v4()::text, '-', '') from 1 for 6));
    v_spec_number  := 'SPEC-' || to_char(now(), 'YYYYMMDD') || '-' || upper(substring(replace(uuid_generate_v4()::text, '-', '') from 1 for 6));
    v_customer_ref := 'CUST-' || upper(substring(replace(p_profile_id::text, '-', '') from 1 for 6));

    -- 4. Create Order
    INSERT INTO orders (
        profile_id,
        order_number,
        status,
        total_price_cents,
        currency,
        idempotency_key
    ) VALUES (
        p_profile_id,
        v_order_number,
        'confirmed',
        v_calculated_price_cents,
        COALESCE(p_pricing_snapshot->>'currency', 'USD'),
        p_idempotency_key
    ) RETURNING id INTO v_order_id;

    -- 5. Create Order Item with Frozen Snapshots
    INSERT INTO order_items (
        order_id,
        design_id,
        quantity,
        unit_price_cents,
        design_snapshot,
        measurement_snapshot,
        pricing_breakdown_snapshot
    ) VALUES (
        v_order_id,
        p_design_id,
        p_quantity,
        v_calculated_price_cents / GREATEST(p_quantity, 1),
        p_design_snapshot,
        p_measurement_snapshot,
        p_pricing_snapshot
    ) RETURNING id INTO v_order_item_id;

    -- 6. Create Production Specification
    INSERT INTO production_specs (
        order_item_id,
        spec_number,
        customer_ref,
        cut_dimensions,
        bill_of_materials,
        construction_instructions,
        status
    ) VALUES (
        v_order_item_id,
        v_spec_number,
        v_customer_ref,
        p_cut_dimensions,
        p_bill_of_materials,
        p_construction_instructions,
        'ready_for_cutting'
    ) RETURNING id INTO v_spec_id;

    -- 7. Audit Log Event
    INSERT INTO production_events (
        order_id,
        from_status,
        to_status,
        actor_profile_id,
        notes
    ) VALUES (
        v_order_id,
        'draft',
        'confirmed',
        p_profile_id,
        'Order confirmed and production tech-pack generated'
    );

    RETURN jsonb_build_object(
        'status', 'success',
        'order_id', v_order_id,
        'order_number', v_order_number,
        'spec_id', v_spec_id,
        'spec_number', v_spec_number,
        'idempotent', false
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
