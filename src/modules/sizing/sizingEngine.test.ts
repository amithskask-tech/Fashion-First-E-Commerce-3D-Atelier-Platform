import { describe, it, expect } from 'vitest';
import {
  calculateFinishedGarmentMeasurements,
  recommendStandardSize
} from './sizingEngine';
import {
  INITIAL_BODY_MEASUREMENTS,
  INITIAL_GRADING_CHART,
  INITIAL_EASE_RULES
} from '../../lib/storage/mockData';

describe('Sizing & Fit Engine', () => {
  it('applies correct fit ease allowance for slim, regular, and relaxed fits', () => {
    const slimFinished = calculateFinishedGarmentMeasurements(
      INITIAL_BODY_MEASUREMENTS,
      'slim',
      INITIAL_EASE_RULES
    );
    // Body chest is 1010mm; Slim ease is +80mm -> 1090mm
    expect(slimFinished.chestMm).toBe(1010 + 80);
    // Body waist is 860mm; Slim ease is +60mm -> 920mm
    expect(slimFinished.waistMm).toBe(860 + 60);

    const regularFinished = calculateFinishedGarmentMeasurements(
      INITIAL_BODY_MEASUREMENTS,
      'regular',
      INITIAL_EASE_RULES
    );
    // Regular chest ease is +120mm -> 1130mm
    expect(regularFinished.chestMm).toBe(1010 + 120);

    const relaxedFinished = calculateFinishedGarmentMeasurements(
      INITIAL_BODY_MEASUREMENTS,
      'relaxed',
      INITIAL_EASE_RULES
    );
    // Relaxed chest ease is +160mm -> 1170mm
    expect(relaxedFinished.chestMm).toBe(1010 + 160);
  });

  it('recommends the closest standard size based on chest circumference', () => {
    // With 1010mm chest + 120mm regular ease = 1130mm target chest
    // Grading: S=1040, M=1100, L=1180. Diff from M is 30mm, from L is 50mm. Closest is M.
    const rec = recommendStandardSize(
      INITIAL_BODY_MEASUREMENTS,
      'regular',
      INITIAL_GRADING_CHART,
      INITIAL_EASE_RULES
    );

    expect(rec.recommendedSize).toBe('M');
    expect(rec.isReliable).toBe(true);
  });

  it('flags warning when customer body measurements diverge excessively from standard grading', () => {
    // Unusually broad chest with narrow waist: 1300mm chest, 700mm waist
    const athleticVBody = {
      ...INITIAL_BODY_MEASUREMENTS,
      chestCircMm: 1300,
      waistCircMm: 700
    };

    const rec = recommendStandardSize(
      athleticVBody,
      'regular',
      INITIAL_GRADING_CHART,
      INITIAL_EASE_RULES
    );

    expect(rec.isReliable).toBe(false);
    expect(rec.warnings.length).toBeGreaterThan(0);
    expect(rec.warnings[0]).toContain('Custom Made-to-Measure is strongly recommended');
  });
});
