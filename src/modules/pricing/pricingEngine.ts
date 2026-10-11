import {
  Fabric,
  CustomizationOption,
  PriceBreakdown,
  PriceLineItem,
  DesignSelectionState
} from '../../types';

export interface PricingContext {
  basePriceCents: number;
  customFitSurchargeCents: number;
  isCustomFit: boolean;
  garmentName?: string;
  currency?: string;
  appliedRuleVersion?: number;
}

/**
 * Server-authoritative price calculator operating strictly in minor currency units (cents / paise).
 */
export function calculatePrice(
  design: DesignSelectionState,
  fabric: Fabric,
  options: CustomizationOption[],
  context: PricingContext
): PriceBreakdown {
  const lineItems: PriceLineItem[] = [];

  // 1. Base Garment Price
  lineItems.push({
    code: 'BASE_GARMENT',
    description: context.garmentName
      ? `${context.garmentName} Base Construction`
      : "Garment Base Construction",
    amountCents: context.basePriceCents,
    type: 'base'
  });

  const isINR = context.currency === 'INR';

  // 2. Fabric Surcharge
  let fabricSurchargeCents = 0;
  const fabricCharge = isINR
    ? (fabric.surchargePaise ?? fabric.surchargeCents)
    : fabric.surchargeCents;

  if (fabricCharge > 0) {
    fabricSurchargeCents = fabricCharge;
    lineItems.push({
      code: `FABRIC_${fabric.code.toUpperCase()}`,
      description: `Fabric Surcharge: ${fabric.name} (${fabric.weaveType})`,
      amountCents: fabricCharge,
      type: 'fabric_surcharge'
    });
  }

  // 3. Customization Option Surcharges
  let customizationSurchargeCents = 0;
  const optionMap = new Map<string, CustomizationOption>(options.map((o) => [o.id, o]));

  for (const [category, optionId] of Object.entries(design.selections)) {
    const opt = optionMap.get(optionId);
    if (opt) {
      const optCharge = isINR
        ? (opt.surchargePaise ?? opt.surchargeCents)
        : opt.surchargeCents;

      if (optCharge > 0) {
        customizationSurchargeCents += optCharge;
        lineItems.push({
          code: `OPT_${opt.code.toUpperCase()}`,
          description: `Customization: ${opt.name} (${category})`,
          amountCents: optCharge,
          type: 'customization'
        });
      }
    }
  }

  // 4. Custom Made-to-Measure Pattern Drafting Surcharge
  let customFitSurchargeCents = 0;
  if (context.isCustomFit && context.customFitSurchargeCents > 0) {
    customFitSurchargeCents = context.customFitSurchargeCents;
    lineItems.push({
      code: 'CUSTOM_FIT_MTM',
      description: 'Individual Made-To-Measure Pattern Drafting',
      amountCents: context.customFitSurchargeCents,
      type: 'custom_fit'
    });
  }

  const subtotalCents =
    context.basePriceCents +
    fabricSurchargeCents +
    customizationSurchargeCents +
    customFitSurchargeCents;

  const taxCents = 0; // Tax calculation placeholder for V1 configuration
  const totalCents = subtotalCents + taxCents;

  return {
    basePriceCents: context.basePriceCents,
    fabricSurchargeCents,
    customizationSurchargeCents,
    customFitSurchargeCents,
    subtotalCents,
    taxCents,
    totalCents,
    currency: context.currency || 'USD',
    lineItems,
    appliedRuleVersion: context.appliedRuleVersion || 1
  };
}

/**
 * Formats minor currency units (cents / paise) into localized currency string.
 */
export function formatCurrency(minorUnits: number, currency: string = 'INR'): string {
  const value = minorUnits / 100;
  const locale = currency === 'INR' ? 'en-IN' : 'en-US';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}
