import { describe, it, expect } from 'vitest';
import { calculatePrice, formatCurrency } from './pricingEngine';
import {
  SHIRT_GARMENT_TYPE,
  KURTA_GARMENT_TYPE,
  INITIAL_FABRICS,
  INITIAL_OPTIONS
} from '../../lib/storage/mockData';
import { createDefaultDesignSelections } from '../customization/compatibilityEngine';

describe('Pricing Engine', () => {
  const options = INITIAL_OPTIONS;
  const standardShirtFabric = INITIAL_FABRICS.find((f) => f.code === 'poplin_white')!;
  const luxuryLinenFabric = INITIAL_FABRICS.find((f) => f.code === 'linen_sand')!;
  const kasavuFabric = INITIAL_FABRICS.find((f) => f.code === 'kasavu_kerala')!;
  const rawSilkFabric = INITIAL_FABRICS.find((f) => f.code === 'raw_silk_navy')!;

  describe('Western Shirt Pricing (USD)', () => {
    it('calculates standard base price accurately in integer cents', () => {
      const defaultDesign = createDefaultDesignSelections(
        SHIRT_GARMENT_TYPE.id,
        standardShirtFabric.id,
        options
      );

      // Default shirt selections include Mother of Pearl buttons (+$12.00 / 1200 cents)
      const breakdown = calculatePrice(defaultDesign, standardShirtFabric, options, {
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
        SHIRT_GARMENT_TYPE.id,
        luxuryLinenFabric.id,
        options
      );

      const breakdown = calculatePrice(defaultDesign, luxuryLinenFabric, options, {
        basePriceCents: 11900,
        customFitSurchargeCents: 2000,
        isCustomFit: true,
        currency: 'USD'
      });

      expect(breakdown.fabricSurchargeCents).toBe(2500);
      expect(breakdown.customFitSurchargeCents).toBe(2000);
      expect(breakdown.totalCents).toBe(11900 + 2500 + 1200 + 2000);
    });

    it('formats USD currency correctly', () => {
      expect(formatCurrency(11900, 'USD')).toBe('$119.00');
      expect(formatCurrency(17600, 'USD')).toBe('$176.00');
    });
  });

  describe("Indian Kurta Pricing (INR / Paise)", () => {
    it('calculates Indian Kurta base and embellishment surcharges in integer paise', () => {
      const defaultDesign = createDefaultDesignSelections(
        KURTA_GARMENT_TYPE.id,
        kasavuFabric.id,
        options
      );

      // Kurta default selections: Kasavu Gold Zari Border (40000 paise / ₹400) + Brass Buttons (25000 paise / ₹250)
      const breakdown = calculatePrice(defaultDesign, kasavuFabric, options, {
        basePriceCents: 249900, // ₹2,499.00 in paise
        customFitSurchargeCents: 50000, // ₹500.00 MTM pattern drafting
        isCustomFit: true,
        currency: 'INR',
        garmentName: "Men's Tailored Kurta"
      });

      expect(breakdown.basePriceCents).toBe(249900);
      expect(breakdown.fabricSurchargeCents).toBe(0); // Standard Kasavu has 0 surcharge
      expect(breakdown.customizationSurchargeCents).toBe(40000 + 25000); // 65000 paise
      expect(breakdown.customFitSurchargeCents).toBe(50000);
      expect(breakdown.totalCents).toBe(249900 + 65000 + 50000);
    });

    it('calculates Chanderi raw silk fabric surcharge in paise', () => {
      const defaultDesign = createDefaultDesignSelections(
        KURTA_GARMENT_TYPE.id,
        rawSilkFabric.id,
        options
      );

      const breakdown = calculatePrice(defaultDesign, rawSilkFabric, options, {
        basePriceCents: 249900,
        customFitSurchargeCents: 0,
        isCustomFit: false,
        currency: 'INR'
      });

      expect(breakdown.fabricSurchargeCents).toBe(60000); // ₹600.00
      expect(breakdown.totalCents).toBe(249900 + 60000 + 65000);
    });

    it('formats Indian Rupee (INR) amounts with authentic symbol', () => {
      const formatted = formatCurrency(249900, 'INR');
      expect(formatted).toContain('2,499');
      expect(formatted).toMatch(/₹|INR/);
    });
  });
});
