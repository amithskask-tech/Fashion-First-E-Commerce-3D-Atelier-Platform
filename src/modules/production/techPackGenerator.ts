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

  const isKurta =
    input.garmentName.toLowerCase().includes('kurta') ||
    input.selectedOptions.some((o) => o.category === 'kurta_patti' || o.category === 'borders_zari');

  const sleeveOpt = input.selectedOptions.find((o) => o.category === 'sleeve');
  const isShortSleeve = sleeveOpt?.code?.includes('short');
  const fabricConsumption = isKurta
    ? (isShortSleeve ? '2.40 meters' : '3.10 meters')
    : (isShortSleeve ? '1.80 meters' : '2.20 meters');

  const buttonOpt = input.selectedOptions.find((o) => o.category === 'buttons');
  const buttonType = buttonOpt?.name || (isKurta ? 'Antique Brass Kurta Buttons' : 'Standard 18L Resin');

  const collarOpt = input.selectedOptions.find((o) => o.category === 'collar' || o.category === 'neckline');
  const cuffOpt = input.selectedOptions.find((o) => o.category === 'cuff');
  const placketOpt = input.selectedOptions.find((o) => o.category === 'placket' || o.category === 'kurta_patti');
  const pocketOpt = input.selectedOptions.find((o) => o.category === 'pocket');
  const borderOpt = input.selectedOptions.find((o) => o.category === 'borders_zari');

  const billOfMaterials = [
    {
      item: 'Shell Fabric',
      spec: `${input.fabric.name} (${input.fabric.materialComposition}, Weave: ${input.fabric.weaveType}, Color: ${input.fabric.colorName})`,
      quantity: fabricConsumption
    },
    {
      item: isKurta ? 'Interlining (Mandarin Collar & Patti)' : 'Interlining (Collar & Cuffs)',
      spec: 'Medium-firm woven cotton fusible interlining (90 gsm)',
      quantity: isKurta ? '0.30 meters' : '0.40 meters'
    },
    {
      item: 'Buttons',
      spec: isKurta
        ? `Size 16L Front Kurta Patti - ${buttonType}`
        : `Size 18L (Front placket & gauntlet) + 14L (Collar band if applicable) - ${buttonType}`,
      quantity: isKurta ? '4 units (+1 spare)' : '11 units'
    },
    ...(isKurta && borderOpt?.code?.includes('kasavu')
      ? [
          {
            item: 'Metallic Zari Border',
            spec: 'Authentic 45mm Kerala Kasavu metallic gold zari border band',
            quantity: '2.50 meters'
          }
        ]
      : []),
    {
      item: 'Sewing Thread',
      spec: '100% Core-spun polyester 120/2 matching shell color',
      quantity: '1 spool'
    }
  ];

  const constructionInstructions = isKurta
    ? [
        `Stitch Density: 16-18 stitches per inch (SPI) for artisanal ethnic tailoring.`,
        `Side Slits (Chak): Construct 320mm side slits measured up from hemline. Reinforce slit opening junction with concealed hand-tack or triangle stay stitch.`,
        `Kurta Patti: Construct ${placketOpt?.name || 'Classic Front Patti'} with 35mm finished width and 280mm length from collar seam.`,
        `Neckline: Tailor ${collarOpt?.name || 'Classic Mandarin Band Collar'} with reinforced interlining.`,
        `Pockets: ${pocketOpt?.name || 'Dual Inseam Side Pockets'}. Conceal pocket openings inside side seams.`,
        `Border Finish: ${borderOpt?.name || 'Clean Finished Hem'}. If Kasavu Zari selected, apply with mitered corner fold at side slit base.`,
        `Quality Tolerance: Maximum cutting tolerance allowance is ±8mm.`
      ]
    : [
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
