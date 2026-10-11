import { describe, it, expect } from 'vitest';
import { inchesToMm, mmToInches, lbsToKg, kgToLbs } from './units';
import { BodyMeasurementsZodSchema, checkMeasurementConsistency } from './validator';
import { INITIAL_BODY_MEASUREMENTS } from '../../lib/storage/mockData';

describe('Measurement Engine - Unit Conversions', () => {
  it('converts inches to exact rounded millimetres', () => {
    expect(inchesToMm(10)).toBe(254);
    expect(inchesToMm(15.5)).toBe(394); // 15.5 * 25.4 = 393.7 -> 394
    expect(inchesToMm(0)).toBe(0);
    expect(inchesToMm(-5)).toBe(0);
  });

  it('converts millimetres to inches with precision', () => {
    expect(mmToInches(254, 1)).toBe(10);
    expect(mmToInches(394, 1)).toBe(15.5);
    expect(mmToInches(0)).toBe(0);
  });

  it('converts weight between kg and lbs bi-directionally without rounding drift', () => {
    expect(kgToLbs(78.5)).toBe(173.1);
    expect(lbsToKg(173.1)).toBe(78.5);
  });
});

describe('Measurement Engine - Zod Schema Validation', () => {
  it('accepts valid anatomical measurements', () => {
    const result = BodyMeasurementsZodSchema.safeParse(INITIAL_BODY_MEASUREMENTS);
    expect(result.success).toBe(true);
  });

  it('rejects measurements below physical thresholds', () => {
    const invalid = {
      ...INITIAL_BODY_MEASUREMENTS,
      heightMm: 900 // Below 1200mm
    };
    const result = BodyMeasurementsZodSchema.safeParse(invalid);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toContain('Height must be at least 120 cm');
    }
  });

  it('rejects missing mandatory measurements', () => {
    const incomplete = {
      heightMm: 1800,
      weightKg: 75
    };
    const result = BodyMeasurementsZodSchema.safeParse(incomplete);
    expect(result.success).toBe(false);
    if (!result.success) {
      const missingFields = result.error.issues.map((i) => i.path[0]);
      expect(missingFields).toContain('neckCircMm');
      expect(missingFields).toContain('chestCircMm');
      expect(missingFields).toContain('waistCircMm');
    }
  });
});

describe('Measurement Engine - Consistency Checks', () => {
  it('returns no warnings for proportional standard measurements', () => {
    const warnings = checkMeasurementConsistency(INITIAL_BODY_MEASUREMENTS);
    expect(warnings.length).toBe(0);
  });

  it('flags error when wrist is larger than bicep', () => {
    const invertedArm = {
      ...INITIAL_BODY_MEASUREMENTS,
      bicepCircMm: 220,
      wristCircMm: 240
    };
    const warnings = checkMeasurementConsistency(invertedArm);
    expect(warnings.some((w) => w.field === 'wristCircMm' && w.severity === 'error')).toBe(true);
  });

  it('flags warning when sleeve length is disproportionately long for height', () => {
    const apeIndex = {
      ...INITIAL_BODY_MEASUREMENTS,
      heightMm: 1600,
      sleeveLengthMm: 950 // 950 / 1600 = 0.59 > 0.55 max
    };
    const warnings = checkMeasurementConsistency(apeIndex);
    expect(warnings.some((w) => w.field === 'sleeveLengthMm' && w.severity === 'warning')).toBe(true);
  });
});
