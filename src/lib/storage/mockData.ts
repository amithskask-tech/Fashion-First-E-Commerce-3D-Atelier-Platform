import {
  GarmentType,
  Fabric,
  CustomizationOption,
  OptionCompatibilityRule,
  GarmentMeasurementsGrading,
  SizeEaseRule,
  UserProfile,
  BodyProfile,
  BodyMeasurements
} from '../../types';

export const INITIAL_GARMENT_TYPE: GarmentType = {
  id: '11111111-1111-1111-1111-111111111111',
  code: 'men_shirt',
  name: "Men's Tailored Shirt",
  description: "Custom tailored dress and casual shirt engineered to exact anatomical measurements.",
  isActive: true
};

export const INITIAL_FABRICS: Fabric[] = [
  {
    id: '22222222-2222-2222-2222-000000000001',
    code: 'poplin_white',
    name: 'Egyptian Cotton Poplin',
    materialComposition: '100% 2-ply Long Staple Egyptian Cotton (120/2)',
    weaveType: 'Poplin',
    colorName: 'Crisp White',
    colorHex: '#ffffff',
    patternType: 'solid',
    surchargeCents: 0,
    inStock: true
  },
  {
    id: '22222222-2222-2222-2222-000000000002',
    code: 'oxford_sky',
    name: 'Royal Oxford Cotton',
    materialComposition: '100% Combed Cotton Oxford',
    weaveType: 'Oxford',
    colorName: 'Sky Blue',
    colorHex: '#bae6fd',
    patternType: 'solid',
    surchargeCents: 0,
    inStock: true
  },
  {
    id: '22222222-2222-2222-2222-000000000003',
    code: 'twill_navy',
    name: 'Herringbone Twill Navy',
    materialComposition: '100% Premium Twill (100/2)',
    weaveType: 'Twill',
    colorName: 'Midnight Navy',
    colorHex: '#1e293b',
    patternType: 'solid',
    surchargeCents: 1500,
    inStock: true
  },
  {
    id: '22222222-2222-2222-2222-000000000004',
    code: 'linen_sand',
    name: 'Normandy Washed Linen',
    materialComposition: '100% European Flax Linen',
    weaveType: 'Linen Plain',
    colorName: 'Natural Sand',
    colorHex: '#d8cdb8',
    patternType: 'solid',
    surchargeCents: 2500,
    inStock: true
  }
];

export const INITIAL_OPTIONS: CustomizationOption[] = [
  // Collar
  {
    id: '33333333-3333-3333-3333-000000000001',
    garmentTypeId: INITIAL_GARMENT_TYPE.id,
    category: 'collar',
    code: 'collar_spread',
    name: 'Classic Semi-Spread Collar',
    description: 'Versatile collar suitable for standard neckties or open collar styling.',
    surchargeCents: 0,
    defaultModelSlot: 'collar_spread',
    isDefault: true,
    isActive: true
  },
  {
    id: '33333333-3333-3333-3333-000000000002',
    garmentTypeId: INITIAL_GARMENT_TYPE.id,
    category: 'collar',
    code: 'collar_buttondown',
    name: 'Button-Down Collar',
    description: 'Casual American style with secure roll collar buttons.',
    surchargeCents: 0,
    defaultModelSlot: 'collar_buttondown',
    isDefault: false,
    isActive: true
  },
  {
    id: '33333333-3333-3333-3333-000000000003',
    garmentTypeId: INITIAL_GARMENT_TYPE.id,
    category: 'collar',
    code: 'collar_band',
    name: 'Band / Grandad Collar',
    description: 'Modern minimalist standing collar without points.',
    surchargeCents: 500,
    defaultModelSlot: 'collar_band',
    isDefault: false,
    isActive: true
  },
  {
    id: '33333333-3333-3333-3333-000000000004',
    garmentTypeId: INITIAL_GARMENT_TYPE.id,
    category: 'collar',
    code: 'collar_cutaway',
    name: 'Cutaway Italian Collar',
    description: 'Wide horizontal spread designed for contemporary tailoring.',
    surchargeCents: 0,
    defaultModelSlot: 'collar_spread',
    isDefault: false,
    isActive: true
  },

  // Cuff
  {
    id: '33333333-3333-3333-3333-000000000010',
    garmentTypeId: INITIAL_GARMENT_TYPE.id,
    category: 'cuff',
    code: 'cuff_barrel',
    name: 'Single-Button Barrel Cuff',
    description: 'Standard round barrel cuff with single adjustable button.',
    surchargeCents: 0,
    defaultModelSlot: 'cuff_barrel',
    isDefault: true,
    isActive: true
  },
  {
    id: '33333333-3333-3333-3333-000000000011',
    garmentTypeId: INITIAL_GARMENT_TYPE.id,
    category: 'cuff',
    code: 'cuff_french',
    name: 'Double French Cuff',
    description: 'Formal folded cuff requiring cufflinks.',
    surchargeCents: 1000,
    defaultModelSlot: 'cuff_french',
    isDefault: false,
    isActive: true
  },
  {
    id: '33333333-3333-3333-3333-000000000012',
    garmentTypeId: INITIAL_GARMENT_TYPE.id,
    category: 'cuff',
    code: 'cuff_none',
    name: 'No Cuff (Short Sleeve)',
    description: 'Clean hemmed sleeve edge.',
    surchargeCents: 0,
    defaultModelSlot: 'cuff_none',
    isDefault: false,
    isActive: true
  },

  // Sleeve
  {
    id: '33333333-3333-3333-3333-000000000020',
    garmentTypeId: INITIAL_GARMENT_TYPE.id,
    category: 'sleeve',
    code: 'sleeve_long',
    name: 'Long Sleeve',
    description: 'Full length tailored sleeve with forearm gauntlet button.',
    surchargeCents: 0,
    defaultModelSlot: 'sleeve_long',
    isDefault: true,
    isActive: true
  },
  {
    id: '33333333-3333-3333-3333-000000000021',
    garmentTypeId: INITIAL_GARMENT_TYPE.id,
    category: 'sleeve',
    code: 'sleeve_short',
    name: 'Short Sleeve',
    description: 'Clean warm-weather sleeve finishing at upper bicep.',
    surchargeCents: 0,
    defaultModelSlot: 'sleeve_short',
    isDefault: false,
    isActive: true
  },

  // Placket
  {
    id: '33333333-3333-3333-3333-000000000030',
    garmentTypeId: INITIAL_GARMENT_TYPE.id,
    category: 'placket',
    code: 'placket_front',
    name: 'Standard Stitched Placket',
    description: 'Classic folded and edge-stitched front placket.',
    surchargeCents: 0,
    defaultModelSlot: 'placket_front',
    isDefault: true,
    isActive: true
  },
  {
    id: '33333333-3333-3333-3333-000000000031',
    garmentTypeId: INITIAL_GARMENT_TYPE.id,
    category: 'placket',
    code: 'placket_french',
    name: 'French Front (Seamless)',
    description: 'Clean folded edge without visible stitching.',
    surchargeCents: 0,
    defaultModelSlot: 'placket_french',
    isDefault: false,
    isActive: true
  },
  {
    id: '33333333-3333-3333-3333-000000000032',
    garmentTypeId: INITIAL_GARMENT_TYPE.id,
    category: 'placket',
    code: 'placket_concealed',
    name: 'Covered / Fly Front Placket',
    description: 'Fabric flap conceals front buttons for evening formalwear.',
    surchargeCents: 800,
    defaultModelSlot: 'placket_concealed',
    isDefault: false,
    isActive: true
  },

  // Pocket
  {
    id: '33333333-3333-3333-3333-000000000040',
    garmentTypeId: INITIAL_GARMENT_TYPE.id,
    category: 'pocket',
    code: 'pocket_none',
    name: 'No Pocket',
    description: 'Sleek, minimalist chest styling.',
    surchargeCents: 0,
    defaultModelSlot: 'pocket_none',
    isDefault: true,
    isActive: true
  },
  {
    id: '33333333-3333-3333-3333-000000000041',
    garmentTypeId: INITIAL_GARMENT_TYPE.id,
    category: 'pocket',
    code: 'pocket_single_chest',
    name: 'Single Left Chest Pocket',
    description: 'Curved patch pocket on the left breast.',
    surchargeCents: 0,
    defaultModelSlot: 'pocket_single_chest',
    isDefault: false,
    isActive: true
  },

  // Buttons
  {
    id: '33333333-3333-3333-3333-000000000050',
    garmentTypeId: INITIAL_GARMENT_TYPE.id,
    category: 'buttons',
    code: 'button_mother_pearl',
    name: 'Genuine Mother of Pearl',
    description: 'Natural iridescent shell buttons with high lustre.',
    surchargeCents: 1200,
    defaultModelSlot: 'button_mop',
    isDefault: true,
    isActive: true
  },
  {
    id: '33333333-3333-3333-3333-000000000051',
    garmentTypeId: INITIAL_GARMENT_TYPE.id,
    category: 'buttons',
    code: 'button_classic_resin',
    name: 'White Resin Buttons',
    description: 'Durable, shatterproof resin buttons.',
    surchargeCents: 0,
    defaultModelSlot: 'button_resin',
    isDefault: false,
    isActive: true
  },
  {
    id: '33333333-3333-3333-3333-000000000052',
    garmentTypeId: INITIAL_GARMENT_TYPE.id,
    category: 'buttons',
    code: 'button_horn_smoke',
    name: 'Dark Smoke Horn Buttons',
    description: 'Polished horn buttons with distinctive depth of grain.',
    surchargeCents: 1500,
    defaultModelSlot: 'button_horn',
    isDefault: false,
    isActive: true
  },

  // Back Pleat
  {
    id: '33333333-3333-3333-3333-000000000060',
    garmentTypeId: INITIAL_GARMENT_TYPE.id,
    category: 'back_pleat',
    code: 'pleat_side',
    name: 'Dual Side Pleats',
    description: 'Two knife pleats behind shoulders for ergonomic arm movement.',
    surchargeCents: 0,
    defaultModelSlot: 'pleat_side',
    isDefault: true,
    isActive: true
  },
  {
    id: '33333333-3333-3333-3333-000000000061',
    garmentTypeId: INITIAL_GARMENT_TYPE.id,
    category: 'back_pleat',
    code: 'pleat_box',
    name: 'Center Box Pleat',
    description: 'Classic Ivy League styling with center box fold.',
    surchargeCents: 0,
    defaultModelSlot: 'pleat_box',
    isDefault: false,
    isActive: true
  },
  {
    id: '33333333-3333-3333-3333-000000000062',
    garmentTypeId: INITIAL_GARMENT_TYPE.id,
    category: 'back_pleat',
    code: 'pleat_plain',
    name: 'Plain Back (No Pleats)',
    description: 'Fitted profile with clean silhouette.',
    surchargeCents: 0,
    defaultModelSlot: 'pleat_plain',
    isDefault: false,
    isActive: true
  },

  // Hem
  {
    id: '33333333-3333-3333-3333-000000000070',
    garmentTypeId: INITIAL_GARMENT_TYPE.id,
    category: 'hem',
    code: 'hem_curved',
    name: 'Classic Tails Hem (Curved)',
    description: 'Curved front and rear tails engineered to remain tucked into trousers.',
    surchargeCents: 0,
    defaultModelSlot: 'hem_curved',
    isDefault: true,
    isActive: true
  },
  {
    id: '33333333-3333-3333-3333-000000000071',
    garmentTypeId: INITIAL_GARMENT_TYPE.id,
    category: 'hem',
    code: 'hem_straight',
    name: 'Straight Hem with Side Vents',
    description: 'Shortened hemline designed specifically for untucked wear.',
    surchargeCents: 0,
    defaultModelSlot: 'hem_straight',
    isDefault: false,
    isActive: true
  }
];

export const INITIAL_COMPATIBILITY_RULES: OptionCompatibilityRule[] = [
  {
    id: 'rule-french-short',
    optionAId: '33333333-3333-3333-3333-000000000011', // cuff_french
    optionBId: '33333333-3333-3333-3333-000000000021', // sleeve_short
    ruleType: 'incompatible',
    reason: 'French double cuffs require full length sleeves and cannot be tailored onto short sleeves.'
  },
  {
    id: 'rule-short-no-cuff',
    optionAId: '33333333-3333-3333-3333-000000000021', // sleeve_short
    optionBId: '33333333-3333-3333-3333-000000000012', // cuff_none
    ruleType: 'forces_default',
    reason: 'Selecting short sleeves automatically sets the cuff style to clean hem.'
  }
];

export const INITIAL_GRADING_CHART: GarmentMeasurementsGrading[] = [
  { id: 'size-xs', garmentTypeId: INITIAL_GARMENT_TYPE.id, sizeCode: 'XS', chestGarmentMm: 980, waistGarmentMm: 880, hipGarmentMm: 960, neckGarmentMm: 370, shoulderGarmentMm: 430, sleeveGarmentMm: 810, lengthGarmentMm: 740 },
  { id: 'size-s',  garmentTypeId: INITIAL_GARMENT_TYPE.id, sizeCode: 'S',  chestGarmentMm: 1040, waistGarmentMm: 940, hipGarmentMm: 1020, neckGarmentMm: 385, shoulderGarmentMm: 450, sleeveGarmentMm: 830, lengthGarmentMm: 760 },
  { id: 'size-m',  garmentTypeId: INITIAL_GARMENT_TYPE.id, sizeCode: 'M',  chestGarmentMm: 1100, waistGarmentMm: 1000, hipGarmentMm: 1080, neckGarmentMm: 400, shoulderGarmentMm: 470, sleeveGarmentMm: 850, lengthGarmentMm: 780 },
  { id: 'size-l',  garmentTypeId: INITIAL_GARMENT_TYPE.id, sizeCode: 'L',  chestGarmentMm: 1180, waistGarmentMm: 1080, hipGarmentMm: 1160, neckGarmentMm: 420, shoulderGarmentMm: 490, sleeveGarmentMm: 875, lengthGarmentMm: 800 },
  { id: 'size-xl', garmentTypeId: INITIAL_GARMENT_TYPE.id, sizeCode: 'XL', chestGarmentMm: 1260, waistGarmentMm: 1180, hipGarmentMm: 1240, neckGarmentMm: 440, shoulderGarmentMm: 510, sleeveGarmentMm: 900, lengthGarmentMm: 820 },
  { id: 'size-xxl',garmentTypeId: INITIAL_GARMENT_TYPE.id, sizeCode: 'XXL',chestGarmentMm: 1340, waistGarmentMm: 1280, hipGarmentMm: 1320, neckGarmentMm: 460, shoulderGarmentMm: 530, sleeveGarmentMm: 920, lengthGarmentMm: 840 }
];

export const INITIAL_EASE_RULES: SizeEaseRule[] = [
  { id: 'ease-slim',    garmentTypeId: INITIAL_GARMENT_TYPE.id, fitPreference: 'slim',    chestEaseMm: 80,  waistEaseMm: 60,  hipEaseMm: 60,  bicepEaseMm: 40, neckEaseMm: 15 },
  { id: 'ease-regular', garmentTypeId: INITIAL_GARMENT_TYPE.id, fitPreference: 'regular', chestEaseMm: 120, waistEaseMm: 100, hipEaseMm: 100, bicepEaseMm: 60, neckEaseMm: 15 },
  { id: 'ease-relaxed', garmentTypeId: INITIAL_GARMENT_TYPE.id, fitPreference: 'relaxed', chestEaseMm: 160, waistEaseMm: 140, hipEaseMm: 140, bicepEaseMm: 80, neckEaseMm: 20 }
];

export const INITIAL_PROFILE: UserProfile = {
  id: '44444444-4444-4444-4444-444444444444',
  email: 'alexander.vance@tailored.local',
  fullName: 'Alexander Vance',
  role: 'customer',
  createdAt: '2026-10-11T12:00:00Z',
  updatedAt: '2026-10-11T12:00:00Z'
};

export const INITIAL_BODY_PROFILES: BodyProfile[] = [
  {
    id: '55555555-5555-5555-5555-555555555555',
    profileId: INITIAL_PROFILE.id,
    profileName: 'Standard Tailored Profile',
    fitPreference: 'regular',
    preferredUnit: 'metric',
    isDefault: true,
    createdAt: '2026-10-11T12:00:00Z',
    updatedAt: '2026-10-11T12:00:00Z'
  }
];

export const INITIAL_BODY_MEASUREMENTS: BodyMeasurements = {
  id: '66666666-6666-6666-6666-666666666666',
  bodyProfileId: '55555555-5555-5555-5555-555555555555',
  version: 1,
  heightMm: 1800,  // 180 cm
  weightKg: 78.5,  // 78.5 kg
  neckCircMm: 395, // 39.5 cm
  chestCircMm: 1010, // 101.0 cm
  waistCircMm: 860,  // 86.0 cm
  hipCircMm: 990,    // 99.0 cm
  shoulderWidthMm: 465, // 46.5 cm
  sleeveLengthMm: 840,  // 84.0 cm
  bicepCircMm: 340,     // 34.0 cm
  wristCircMm: 175,     // 17.5 cm
  shirtLengthMm: 760,   // 76.0 cm
  createdAt: '2026-10-11T12:00:00Z'
};
