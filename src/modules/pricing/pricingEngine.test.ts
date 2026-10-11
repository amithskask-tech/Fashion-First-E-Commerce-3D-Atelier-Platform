import { describe, it, expect } from 'vitest';
import { calculatePrice, formatCurrency } from './pricingEngine';
import {
  INITIAL_GARMENT_TYPE,
  INITIAL_FABRICS,
  INITIAL_OPTIONS
} from '../../lib/storage/mockData';
import { createDefaultDesignSelections } from '../customization/compatibilityEngine';

describe('Pricing Engine', () => {
  const options = INITIAL_OPTIONS;
  const standardFabric = INITIAL_FABRICS[0]; // $0 surcharge
  const luxuryFabric = INITIAL_FABRICS[3];   // Linen $25.00 (2500 cents) surcharge

  it('calculates standard base price accurately in integer cents', () => {
    const defaultDesign = createDefaultDesignSelections(
      INITIAL_GARMENT_TYPE.id,
      standardFabric.id,
      options
    );

    // Default design selections include Mother of Pearl buttons (+$12.00 / 1200 cents)
    const breakdown = calculatePrice(defaultDesign, standardFabric, options, {
      basePriceCents: 11900,
      customFitSurchargeCents: 2000,
      isCustomFit: false,
      currency: 'USD'
    });

    expect(breakdown.basePriceCents).toBe(11900);
    expect(breakdown.fabricSurchargeCents).toBe(0);
    expect(breakdown.customizationSurchargeCents).toBe(1200); // MOP buttons
    expect(breakdown.customFitSurchargeCents).toBe(0);
    expect(breakdown.totalCents).toBe(11900 + 1200);
  });

  it('adds fabric and custom fit surcharges with zero rounding error', () => {
    const defaultDesign = createDefaultDesignSelections(
      INITIAL_GARMENT_TYPE.id,
      luxuryFabric.id,
      options
    );

    const breakdown = calculatePrice(defaultDesign, luxuryFabric, options, {
      basePriceCents: 11900,
      customFitSurchargeCents: 2000,
      isCustomFit: true,
      currency: 'USD'
    });

    expect(breakdown.fabricSurchargeCents).toBe(2500);
    expect(breakdown.customFitSurchargeCents).toBe(2000);
    expect(breakdown.totalCents).toBe(11900 + 2500 + 1200 + 2000);
  });

  it('formats minor currency units to standard currency string', () => {
    expect(formatCurrency(11900, 'USD')).toBe('$119.00');
    expect(formatCurrency(17600, 'USD')).toBe('$176.00');
  });
});
