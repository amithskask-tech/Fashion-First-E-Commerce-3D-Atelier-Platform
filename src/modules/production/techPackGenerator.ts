import {
  BodyMeasurements,
  FinishedGarmentMeasurements,
  Fabric,
  CustomizationOption,
  ProductionSpec,
  StandardSizeCode,
  FitPreference
} from '../../types';

export interface TechPackInput {
  orderItemId: string;
  orderNumber: string;
  customerProfileId: string;
  garmentName: string;
  fabric: Fabric;
  selectedOptions: CustomizationOption[];
  bodyMeasurements: BodyMeasurements;
  finishedMeasurements: FinishedGarmentMeasurements;
  recommendedSize: StandardSizeCode;
  fitPreference: FitPreference;
  quantity: number;
}

/**
 * Generates an immutable, pseudonymized tailoring production specification.
 */
export function generateProductionSpec(input: TechPackInput): ProductionSpec {
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomSuffix = Math.random().toString(36).substring(2, 8).toUpperCase();
  const specNumber = `SPEC-${dateStr}-${randomSuffix}`;
  const customerRef = `CUST-${input.customerProfileId.slice(0, 8).toUpperCase()}`;

  const seamAllowanceMm = 12; // Standard 1/2" (12mm) tailoring seam allowance
  const hemAllowanceMm = 25;  // 1" bottom hem fold

  const cutDimensions = {
    chestCutMm: Math.round(input.finishedMeasurements.chestMm / 2) + seamAllowanceMm * 2,
    waistCutMm: Math.round(input.finishedMeasurements.waistMm / 2) + seamAllowanceMm * 2,
    hipCutMm: Math.round(input.finishedMeasurements.hipMm / 2) + seamAllowanceMm * 2,
    collarCutMm: input.finishedMeasurements.neckMm + seamAllowanceMm * 2,
    shoulderCutMm: input.finishedMeasurements.shoulderWidthMm + seamAllowanceMm * 2,
    sleeveCutMm: input.finishedMeasurements.sleeveLengthMm + seamAllowanceMm * 2,
    bicepCutMm: input.finishedMeasurements.bicepMm + seamAllowanceMm * 2,
    wristCutMm: input.finishedMeasurements.wristMm + seamAllowanceMm * 2,
    shirtLengthCutMm: input.finishedMeasurements.shirtLengthMm + hemAllowanceMm + seamAllowanceMm,
    seamAllowanceMm,
    hemAllowanceMm
  };

  const sleeveOpt = input.selectedOptions.find((o) => o.category === 'sleeve');
  const isShortSleeve = sleeveOpt?.code === 'sleeve_short';
  const fabricConsumption = isShortSleeve ? '1.80 meters' : '2.20 meters';

  const buttonOpt = input.selectedOptions.find((o) => o.category === 'buttons');
  const buttonType = buttonOpt?.name || 'Standard 18L Resin';

  const collarOpt = input.selectedOptions.find((o) => o.category === 'collar');
  const cuffOpt = input.selectedOptions.find((o) => o.category === 'cuff');
  const placketOpt = input.selectedOptions.find((o) => o.category === 'placket');
  const pocketOpt = input.selectedOptions.find((o) => o.category === 'pocket');

  const billOfMaterials = [
    {
      item: 'Shell Fabric',
      spec: `${input.fabric.name} (${input.fabric.materialComposition}, Weave: ${input.fabric.weaveType}, Color: ${input.fabric.colorName})`,
      quantity: fabricConsumption
    },
    {
      item: 'Interlining (Collar & Cuffs)',
      spec: 'Medium-firm woven cotton fusible interlining (90 gsm)',
      quantity: '0.40 meters'
    },
    {
      item: 'Buttons',
      spec: `Size 18L (Front placket & gauntlet) + 14L (Collar band if applicable) - ${buttonType}`,
      quantity: '11 units'
    },
    {
      item: 'Sewing Thread',
      spec: '100% Core-spun polyester 120/2 matching shell color',
      quantity: '1 spool'
    }
  ];

  const constructionInstructions = [
    `Stitch Density: Maintain 18-20 stitches per inch (SPI) throughout for luxury fine-tailoring finish.`,
    `Seams: Single needle construction with twin-needle flat-felled side seams (6mm gauge).`,
    `Collar: Construct ${collarOpt?.name || 'Standard Collar'} with fused upper and unfused lower collar band. Include collar stay pockets.`,
    `Cuffs: Construct ${cuffOpt?.name || 'Standard Cuff'} with 12mm topstitching.`,
    `Placket: ${placketOpt?.name || 'Standard Placket'} with 35mm finished width. Keyhole buttonholes.`,
    `Pocket: ${pocketOpt?.name || 'No Pocket'}.`,
    `Bottom Hem: ${cutDimensions.hemAllowanceMm}mm narrow hand-rolled or clean double-folded finish.`,
    `Quality Tolerance: Maximum cutting tolerance allowance is ±8mm.`
  ];

  return {
    id: crypto.randomUUID(),
    orderItemId: input.orderItemId,
    specNumber,
    version: 1,
    customerRef,
    garmentType: input.garmentName,
    cutDimensions,
    billOfMaterials,
    constructionInstructions,
    unit: 'mm',
    status: 'ready_for_cutting',
    generatedAt: new Date().toISOString()
  };
}
