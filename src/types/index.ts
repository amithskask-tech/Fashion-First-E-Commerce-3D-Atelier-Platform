// ============================================================================
// Core Domain Types & Data Contracts
// ============================================================================

export type UserRole = 'customer' | 'staff' | 'admin';
export type FitPreference = 'slim' | 'regular' | 'relaxed';
export type DisplayUnit = 'metric' | 'imperial';
export type OptionCategory =
  | 'collar'
  | 'cuff'
  | 'sleeve'
  | 'placket'
  | 'pocket'
  | 'buttons'
  | 'back_pleat'
  | 'hem';

export type CompatibilityRuleType = 'incompatible' | 'requires' | 'forces_default';

export type OrderStatus =
  | 'draft'
  | 'confirmed'
  | 'accepted_production'
  | 'in_production'
  | 'quality_check'
  | 'ready_dispatch'
  | 'completed'
  | 'cancelled'
  | 'rejected';

export type StandardSizeCode = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL' | 'CUSTOM';

// Profile & Customer
export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
}

export interface BodyProfile {
  id: string;
  profileId: string;
  profileName: string;
  fitPreference: FitPreference;
  preferredUnit: DisplayUnit;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

// Canonical Measurements (Internal: integer millimetres & numeric kilograms)
export interface BodyMeasurements {
  id?: string;
  bodyProfileId?: string;
  version?: number;
  heightMm: number;        // 1200 - 2400 mm
  weightKg: number;        // 30.0 - 300.0 kg
  neckCircMm: number;      // 280 - 650 mm
  chestCircMm: number;     // 650 - 1900 mm
  waistCircMm: number;     // 500 - 1900 mm
  hipCircMm: number;       // 650 - 1900 mm
  shoulderWidthMm: number; // 300 - 700 mm
  sleeveLengthMm: number;  // 400 - 1000 mm
  bicepCircMm: number;     // 180 - 650 mm
  wristCircMm: number;     // 100 - 350 mm
  shirtLengthMm: number;   // 500 - 1100 mm
  additional?: Record<string, number>;
  createdAt?: string;
}

// Garment Catalog & Customization
export interface GarmentType {
  id: string;
  code: string;
  name: string;
  description: string;
  isActive: boolean;
}

export interface Fabric {
  id: string;
  code: string;
  name: string;
  materialComposition: string;
  weaveType: string;
  colorName: string;
  colorHex: string;
  patternType: 'solid' | 'stripes' | 'checks';
  textureAssetPath?: string;
  surchargeCents: number;
  inStock: boolean;
}

export interface CustomizationOption {
  id: string;
  garmentTypeId: string;
  category: OptionCategory;
  code: string;
  name: string;
  description: string;
  surchargeCents: number;
  defaultModelSlot: string;
  isDefault: boolean;
  isActive: boolean;
}

export interface OptionCompatibilityRule {
  id: string;
  optionAId: string;
  optionBId: string;
  ruleType: CompatibilityRuleType;
  reason: string;
}

// Design State
export interface DesignSelectionState {
  garmentTypeId: string;
  fabricId: string;
  selections: Record<OptionCategory, string>; // category -> optionId
  version: number;
}

export interface CustomerDesign {
  id: string;
  profileId: string;
  garmentTypeId: string;
  bodyProfileId?: string;
  name: string;
  version: number;
  isFinalized: boolean;
  selections: DesignSelectionState;
  createdAt: string;
  updatedAt: string;
}

// Sizing & Ease
export interface GarmentMeasurementsGrading {
  id: string;
  garmentTypeId: string;
  sizeCode: StandardSizeCode;
  chestGarmentMm: number;
  waistGarmentMm: number;
  hipGarmentMm: number;
  neckGarmentMm: number;
  shoulderGarmentMm: number;
  sleeveGarmentMm: number;
  lengthGarmentMm: number;
}

export interface SizeEaseRule {
  id: string;
  garmentTypeId: string;
  fitPreference: FitPreference;
  chestEaseMm: number;
  waistEaseMm: number;
  hipEaseMm: number;
  bicepEaseMm: number;
  neckEaseMm: number;
}

export interface FinishedGarmentMeasurements {
  chestMm: number;
  waistMm: number;
  hipMm: number;
  neckMm: number;
  shoulderWidthMm: number;
  sleeveLengthMm: number;
  shirtLengthMm: number;
  bicepMm: number;
  wristMm: number;
}

export interface SizeRecommendation {
  recommendedSize: StandardSizeCode;
  fitPreference: FitPreference;
  targetMeasurements: FinishedGarmentMeasurements;
  standardSizeDiffs?: Record<StandardSizeCode, Record<string, number>>;
  isReliable: boolean;
  warnings: string[];
}

// Pricing
export interface PriceLineItem {
  code: string;
  description: string;
  amountCents: number;
  type: 'base' | 'fabric_surcharge' | 'customization' | 'custom_fit';
}

export interface PriceBreakdown {
  basePriceCents: number;
  fabricSurchargeCents: number;
  customizationSurchargeCents: number;
  customFitSurchargeCents: number;
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
  currency: string;
  lineItems: PriceLineItem[];
  appliedRuleVersion: number;
}

// Order & Production
export interface OrderItemSnapshot {
  design: {
    garmentName: string;
    fabric: Fabric;
    options: Array<{
      category: OptionCategory;
      name: string;
      code: string;
      surchargeCents: number;
    }>;
  };
  measurements: BodyMeasurements;
  calculatedGarmentMeasurements: FinishedGarmentMeasurements;
  recommendedSize: StandardSizeCode;
  pricing: PriceBreakdown;
}

export interface ProductionSpec {
  id: string;
  orderItemId: string;
  specNumber: string;
  version: number;
  customerRef: string;
  garmentType: string;
  cutDimensions: {
    chestCutMm: number;
    waistCutMm: number;
    hipCutMm: number;
    collarCutMm: number;
    shoulderCutMm: number;
    sleeveCutMm: number;
    bicepCutMm: number;
    wristCutMm: number;
    shirtLengthCutMm: number;
    seamAllowanceMm: number;
    hemAllowanceMm: number;
  };
  billOfMaterials: Array<{
    item: string;
    spec: string;
    quantity: string;
  }>;
  constructionInstructions: string[];
  unit: 'mm';
  status: string;
  generatedAt: string;
}

export interface Order {
  id: string;
  profileId: string;
  orderNumber: string;
  status: OrderStatus;
  totalPriceCents: number;
  currency: string;
  idempotencyKey?: string;
  createdAt: string;
  updatedAt: string;
  items?: Array<{
    id: string;
    quantity: number;
    unitPriceCents: number;
    designSnapshot: OrderItemSnapshot;
    productionSpec?: ProductionSpec;
  }>;
}

export interface ProductionEvent {
  id: string;
  orderId: string;
  fromStatus: OrderStatus;
  toStatus: OrderStatus;
  actorProfileId?: string;
  notes?: string;
  createdAt: string;
}
