import { describe, it, expect } from 'vitest';
import { generateProductionSpec } from '../production/techPackGenerator';
import { validateStatusTransition } from './orderStateMachine';
import {
  INITIAL_PROFILE,
  INITIAL_BODY_MEASUREMENTS,
  INITIAL_FABRICS,
  INITIAL_OPTIONS,
  INITIAL_EASE_RULES
} from '../../lib/storage/mockData';
import { calculateFinishedGarmentMeasurements } from '../sizing/sizingEngine';

describe('Production Tech Pack Generator', () => {
  it('generates a full specification with cut dimensions and bill of materials', () => {
    const finished = calculateFinishedGarmentMeasurements(
      INITIAL_BODY_MEASUREMENTS,
      'regular',
      INITIAL_EASE_RULES
    );

    const spec = generateProductionSpec({
      orderItemId: 'item-101',
      orderNumber: 'ORD-20261011-001',
      customerProfileId: INITIAL_PROFILE.id,
      garmentName: "Men's Tailored Shirt",
      fabric: INITIAL_FABRICS[0],
      selectedOptions: INITIAL_OPTIONS.filter((o) => o.isDefault),
      bodyMeasurements: INITIAL_BODY_MEASUREMENTS,
      finishedMeasurements: finished,
      recommendedSize: 'M',
      fitPreference: 'regular',
      quantity: 1
    });

    expect(spec.specNumber).toContain('SPEC-');
    expect(spec.customerRef).toContain('CUST-');
    expect(spec.cutDimensions.chestCutMm).toBeGreaterThan(finished.chestMm / 2);
    expect(spec.cutDimensions.seamAllowanceMm).toBe(12);
    expect(spec.billOfMaterials.length).toBeGreaterThanOrEqual(4);
    expect(spec.constructionInstructions.length).toBeGreaterThanOrEqual(6);
  });
});

describe('Order Lifecycle State Machine', () => {
  it('permits valid linear forward transitions by staff', () => {
    expect(validateStatusTransition('draft', 'confirmed', 'staff').canTransition).toBe(true);
    expect(validateStatusTransition('confirmed', 'accepted_production', 'staff').canTransition).toBe(true);
    expect(validateStatusTransition('accepted_production', 'in_production', 'staff').canTransition).toBe(true);
    expect(validateStatusTransition('in_production', 'quality_check', 'staff').canTransition).toBe(true);
    expect(validateStatusTransition('quality_check', 'ready_dispatch', 'staff').canTransition).toBe(true);
    expect(validateStatusTransition('ready_dispatch', 'completed', 'staff').canTransition).toBe(true);
  });

  it('permits rework transition from quality_check back to in_production', () => {
    const check = validateStatusTransition('quality_check', 'in_production', 'staff');
    expect(check.canTransition).toBe(true);
  });

  it('prohibits illegal skips in order lifecycle', () => {
    const check = validateStatusTransition('confirmed', 'completed', 'staff');
    expect(check.canTransition).toBe(false);
    expect(check.reason).toContain('is not permitted');
  });

  it('prevents regular customers from advancing production stages', () => {
    const check = validateStatusTransition('confirmed', 'accepted_production', 'customer');
    expect(check.canTransition).toBe(false);
    expect(check.reason).toContain('Only authorized factory and tailoring staff');
  });

  it('allows customer to cancel an unproduced confirmed order', () => {
    const check = validateStatusTransition('confirmed', 'cancelled', 'customer');
    expect(check.canTransition).toBe(true);
  });
});
