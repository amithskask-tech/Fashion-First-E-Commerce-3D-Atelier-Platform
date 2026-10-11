// ============================================================================
// Core Domain Types & Data Contracts — Indian Fashion E-Commerce Platform
// ============================================================================

export type UserRole = 'customer' | 'staff' | 'admin';
export type FitPreference = 'slim' | 'regular' | 'relaxed';
export type DisplayUnit = 'metric' | 'imperial';

export type GarmentCategoryType =
  | 'traditional'
  | 'contemporary_indo_western'
  | 'everyday'
  | 'western';

export type GenderType = 'men' | 'women' | 'unisex';

export type OccasionType =
  | 'festive'
  | 'wedding'
  | 'ceremony'
  | 'everyday'
  | 'office';

// Dynamic option categories supporting Kurtas, Nehru Jackets, Blouses, and Western Shirts
export type OptionCategory =
  | 'collar'
  | 'cuff'
  | 'sleeve'
  | 'placket'
  | 'pocket'
  | 'buttons'
  | 'back_pleat'
  | 'hem'
  // Indian Fashion Categories
  | 'silhouette'
  | 'length_slits'
  | 'neckline'
  | 'kurta_patti'
  | 'borders_zari'
  | 'jacket_opening'
  | 'blouse_back'
  | 'blouse_closure';

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
  shirtLengthMm: number;   // 500 - 1400 mm (supports Kurtas up to 1400mm)
  additional?: Record<string, number>;
  createdAt?: string;
}

// Garment Catalog & Customization
export interface GarmentType {
  id: string;
  code: string; // 'men_kurta', 'men_shirt', 'men_nehru_jacket', 'women_blouse'
  name: string;
  description: string;
  category: GarmentCategoryType;
  gender: GenderType;
  occasion: OccasionType;
  region: string;
  isReadyMade: boolean;
  isCustomizable: boolean;
  isActive: boolean;
}

// Rich Indian Textile Specification
export interface Fabric {
  id: string;
  code: string;
  name: string;
  regionalTradeName?: string;
  regionOfOrigin?: string;
  materialComposition: string;
  weaveType: string;
  weightGsm?: number;
  drapeCharacteristics?: 'fluid' | 'structured' | 'crisp' | 'soft';
  colorName: string;
  colorHex: string;
  patternType: 'solid' | 'stripes' | 'checks' | 'zari_border' | 'block_print';
  borderPatternType?: 'kasavu_gold' | 'temple_zari' | 'ikat_geometric' | 'none';
  borderWidthMm?: number;
  textureAssetPath?: string;
  surchargeCents: number; // For backward compatibility / USD
  surchargePaise: number; // INR minor units (1 INR = 100 paise)
  suitableGarmentTypes?: string[];
  careInstructions?: string;
  inStock: boolean;
  isAuthenticityVerified: boolean;
}

export interface CustomizationOption {
  id: string;
  garmentTypeId: string;
  category: OptionCategory;
  code: string;
  name: string;
  description: string;
  surchargeCents: number;
  surchargePaise?: number;
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

// Ready-Made Product & Inventory Models
export interface ProductVariant {
  id: string;
  productId: string;
  sizeCode: StandardSizeCode;
  stockQuantity: number;
}

export type IndianCategory = 'kurtas' | 'nehru_jackets' | 'sherwanis' | 'dhotis_mundu' | 'sarees' | 'blouses' | 'western';
export type GenderCategory = GenderType;
export type CulturalOccasion = OccasionType;

export interface Product {
  id: string;
  garmentTypeId?: string;
  sku: string;
  title: string;
  description: string;
  category: IndianCategory;
  gender: GenderType;
  occasion: OccasionType;
  region: string;
  fabricName: string;
  colorName: string;
  colorHex: string;
  pricePaise: number;
  isReadyMade: boolean;
  isCustomizable: boolean;
  imagePlaceholder?: string;
  variants: ProductVariant[];
}

// Unified Cart Item (Supports both Ready-Made and Custom Made-To-Measure)
export type CartItemType = 'ready_made' | 'custom_tailored';

export interface CartItem {
  id: string;
  itemType?: CartItemType;
  title: string;
  subtitle?: string;
  unitPricePaise: number;
  currency?: string;
  quantity: number;
  // Ready-Made fields:
  productVariantId?: string;
  productId?: string;
  sizeCode?: StandardSizeCode;
  fabricName?: string;
  isCustom?: boolean;
  customSummary?: string;
  designState?: DesignSelectionState;
  // Custom Tailored fields:
  customDesign?: {
    garmentTypeId: string;
    garmentCode: string;
    fabric: Fabric;
    selections: Record<string, string>;
    optionsSummary: Array<{ category: string; name: string }>;
    measurements: BodyMeasurements;
    finishedMeasurements: FinishedGarmentMeasurements;
    sizeRecommendation: StandardSizeCode;
    pricingBreakdown: PriceBreakdown;
  };
}

// Design State
export interface DesignSelectionState {
  garmentTypeId: string;
  fabricId: string;
  selections: Record<string, string>; // category -> optionId
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
  shirtLengthMm: number; // Garment length (e.g. 1040mm for Kurta, 760mm for shirt)
  bicepMm: number;
  wristMm: number;
  sideSlitLengthMm?: number; // Kurta side slit opening
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
  amountPaise?: number;
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
  // INR Values in paise
  basePricePaise?: number;
  totalPaise?: number;
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
      category: string;
      name: string;
      code: string;
      surchargeCents: number;
      surchargePaise?: number;
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
    sideSlitCutMm?: number;
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
  totalPricePaise?: number;
  currency: string;
  idempotencyKey?: string;
  createdAt: string;
  updatedAt: string;
  items?: Array<{
    id: string;
    quantity: number;
    unitPriceCents: number;
    unitPricePaise?: number;
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
