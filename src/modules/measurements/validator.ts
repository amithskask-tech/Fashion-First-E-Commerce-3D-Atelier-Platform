import { z } from 'zod';
import { BodyMeasurements } from '../../types';

export const BodyMeasurementsZodSchema = z.object({
  heightMm: z
    .number()
    .int('Height must be an integer millimetre')
    .min(1200, 'Height must be at least 120 cm (47")')
    .max(2400, 'Height must not exceed 240 cm (94")'),

  weightKg: z
    .number()
    .min(30, 'Weight must be at least 30 kg (66 lbs)')
    .max(300, 'Weight must not exceed 300 kg (660 lbs)'),

  neckCircMm: z
    .number()
    .int('Neck must be an integer millimetre')
    .min(280, 'Neck circumference must be at least 28 cm (11")')
    .max(650, 'Neck circumference must not exceed 65 cm (25.5")'),

  chestCircMm: z
    .number()
    .int('Chest must be an integer millimetre')
    .min(650, 'Chest circumference must be at least 65 cm (25.5")')
    .max(1900, 'Chest circumference must not exceed 190 cm (75")'),

  waistCircMm: z
    .number()
    .int('Waist must be an integer millimetre')
    .min(500, 'Waist circumference must be at least 50 cm (19.5")')
    .max(1900, 'Waist circumference must not exceed 190 cm (75")'),

  hipCircMm: z
    .number()
    .int('Hip must be an integer millimetre')
    .min(650, 'Hip circumference must be at least 65 cm (25.5")')
    .max(1900, 'Hip circumference must not exceed 190 cm (75")'),

  shoulderWidthMm: z
    .number()
    .int('Shoulder width must be an integer millimetre')
    .min(300, 'Shoulder width must be at least 30 cm (12")')
    .max(700, 'Shoulder width must not exceed 70 cm (27.5")'),

  sleeveLengthMm: z
    .number()
    .int('Sleeve length must be an integer millimetre')
    .min(400, 'Sleeve length must be at least 40 cm (15.7")')
    .max(1000, 'Sleeve length must not exceed 100 cm (39.4")'),

  bicepCircMm: z
    .number()
    .int('Bicep must be an integer millimetre')
    .min(180, 'Bicep circumference must be at least 18 cm (7")')
    .max(650, 'Bicep circumference must not exceed 65 cm (25.5")'),

  wristCircMm: z
    .number()
    .int('Wrist must be an integer millimetre')
    .min(100, 'Wrist circumference must be at least 10 cm (4")')
    .max(350, 'Wrist circumference must not exceed 35 cm (13.7")'),

  shirtLengthMm: z
    .number()
    .int('Shirt length must be an integer millimetre')
    .min(500, 'Shirt length must be at least 50 cm (19.7")')
    .max(1100, 'Shirt length must not exceed 110 cm (43.3")'),

  additional: z.record(z.string(), z.number()).optional()
});

export interface ConsistencyWarning {
  field: keyof BodyMeasurements;
  message: string;
  severity: 'warning' | 'error';
}

/**
 * Validates anatomical proportions between related measurements to flag potential tape-measure mistakes.
 */
export function checkMeasurementConsistency(m: BodyMeasurements): ConsistencyWarning[] {
  const warnings: ConsistencyWarning[] = [];

  // 1. Wrist vs Bicep: Wrist cannot be larger than or equal to bicep
  if (m.wristCircMm >= m.bicepCircMm) {
    warnings.push({
      field: 'wristCircMm',
      message: `Wrist circumference (${m.wristCircMm}mm) cannot be greater than or equal to bicep circumference (${m.bicepCircMm}mm). Please verify tape measurement.`,
      severity: 'error'
    });
  }

  // 2. Sleeve Length relative to Height
  const expectedMinSleeve = m.heightMm * 0.38;
  const expectedMaxSleeve = m.heightMm * 0.55;
  if (m.sleeveLengthMm < expectedMinSleeve || m.sleeveLengthMm > expectedMaxSleeve) {
    warnings.push({
      field: 'sleeveLengthMm',
      message: `Sleeve length (${m.sleeveLengthMm}mm) seems unusual for a height of ${m.heightMm}mm. Typical range is ${Math.round(expectedMinSleeve)}-${Math.round(expectedMaxSleeve)}mm.`,
      severity: 'warning'
    });
  }

  // 3. Shirt Length relative to Height
  const expectedMinShirt = m.heightMm * 0.35;
  const expectedMaxShirt = m.heightMm * 0.52;
  if (m.shirtLengthMm < expectedMinShirt || m.shirtLengthMm > expectedMaxShirt) {
    warnings.push({
      field: 'shirtLengthMm',
      message: `Shirt length (${m.shirtLengthMm}mm) seems unusual for height ${m.heightMm}mm. Typical range is ${Math.round(expectedMinShirt)}-${Math.round(expectedMaxShirt)}mm.`,
      severity: 'warning'
    });
  }

  // 4. Shoulder width relative to chest
  if (m.shoulderWidthMm > m.chestCircMm * 0.6) {
    warnings.push({
      field: 'shoulderWidthMm',
      message: `Shoulder width (${m.shoulderWidthMm}mm) appears exceptionally wide compared to chest circumference (${m.chestCircMm}mm).`,
      severity: 'warning'
    });
  }

  // 5. Neck relative to chest
  if (m.neckCircMm > m.chestCircMm * 0.52) {
    warnings.push({
      field: 'neckCircMm',
      message: `Neck circumference (${m.neckCircMm}mm) is more than 52% of chest circumference (${m.chestCircMm}mm). Please re-check neck tape position.`,
      severity: 'warning'
    });
  }

  return warnings;
}
