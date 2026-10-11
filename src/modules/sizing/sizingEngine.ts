import {
  BodyMeasurements,
  FitPreference,
  GarmentMeasurementsGrading,
  SizeEaseRule,
  FinishedGarmentMeasurements,
  SizeRecommendation,
  StandardSizeCode
} from '../../types';

/**
 * Calculates target finished garment cut measurements from body measurements and fit preference.
 */
export function calculateFinishedGarmentMeasurements(
  body: BodyMeasurements,
  fit: FitPreference,
  easeRules: SizeEaseRule[]
): FinishedGarmentMeasurements {
  const ease = easeRules.find((r) => r.fitPreference === fit) || {
    chestEaseMm: 120,
    waistEaseMm: 100,
    hipEaseMm: 100,
    bicepEaseMm: 60,
    neckEaseMm: 15
  };

  return {
    chestMm: body.chestCircMm + ease.chestEaseMm,
    waistMm: body.waistCircMm + ease.waistEaseMm,
    hipMm: body.hipCircMm + ease.hipEaseMm,
    neckMm: body.neckCircMm + ease.neckEaseMm,
    shoulderWidthMm: body.shoulderWidthMm,
    sleeveLengthMm: body.sleeveLengthMm,
    shirtLengthMm: body.shirtLengthMm,
    bicepMm: body.bicepCircMm + ease.bicepEaseMm,
    wristMm: body.wristCircMm + 65 // standard 65mm allowance for cuff closure & watch clearance
  };
}

/**
 * Evaluates standard off-the-rack size fit vs custom made-to-measure.
 */
export function recommendStandardSize(
  body: BodyMeasurements,
  fit: FitPreference,
  gradingChart: GarmentMeasurementsGrading[],
  easeRules: SizeEaseRule[]
): SizeRecommendation {
  const target = calculateFinishedGarmentMeasurements(body, fit, easeRules);
  const warnings: string[] = [];

  // Minimum required measurements for reliable recommendation
  if (!body.chestCircMm || !body.neckCircMm || !body.waistCircMm) {
    return {
      recommendedSize: 'CUSTOM',
      fitPreference: fit,
      targetMeasurements: target,
      isReliable: false,
      warnings: ['Insufficient measurements provided to formulate a standard size recommendation.']
    };
  }

  let bestSize: StandardSizeCode = 'M';
  let minChestDiff = Number.MAX_SAFE_INTEGER;
  const standardSizeDiffs: Record<StandardSizeCode, Record<string, number>> = {} as any;

  for (const grade of gradingChart) {
    const chestDiff = Math.abs(grade.chestGarmentMm - target.chestMm);
    const waistDiff = Math.abs(grade.waistGarmentMm - target.waistMm);
    const neckDiff = Math.abs(grade.neckGarmentMm - target.neckMm);

    standardSizeDiffs[grade.sizeCode] = {
      chestDiffMm: chestDiff,
      waistDiffMm: waistDiff,
      neckDiffMm: neckDiff
    };

    if (chestDiff < minChestDiff) {
      minChestDiff = chestDiff;
      bestSize = grade.sizeCode;
    }
  }

  const bestGrade = gradingChart.find((g) => g.sizeCode === bestSize);
  let isReliable = true;

  if (bestGrade) {
    const chestDeviation = Math.abs(bestGrade.chestGarmentMm - target.chestMm);
    const waistDeviation = Math.abs(bestGrade.waistGarmentMm - target.waistMm);
    const neckDeviation = Math.abs(bestGrade.neckGarmentMm - target.neckMm);

    // If chest deviation exceeds 40mm (~1.6") or waist exceeds 50mm (~2")
    if (chestDeviation > 40 || waistDeviation > 50) {
      isReliable = false;
      warnings.push(
        `Standard size ${bestSize} deviates by ${chestDeviation}mm on chest and ${waistDeviation}mm on waist from your target fit. Custom Made-to-Measure is strongly recommended for optimal comfort.`
      );
    }

    if (neckDeviation > 25) {
      warnings.push(
        `Standard collar circumference on size ${bestSize} (${bestGrade.neckGarmentMm}mm) deviates by ${neckDeviation}mm from target (${target.neckMm}mm).`
      );
    }
  }

  return {
    recommendedSize: bestSize,
    fitPreference: fit,
    targetMeasurements: target,
    standardSizeDiffs,
    isReliable,
    warnings
  };
}
