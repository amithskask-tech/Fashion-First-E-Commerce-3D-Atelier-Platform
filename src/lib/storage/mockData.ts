import {
  GarmentType,
  Fabric,
  CustomizationOption,
  OptionCompatibilityRule,
  GarmentMeasurementsGrading,
  SizeEaseRule,
  UserProfile,
  BodyProfile,
  BodyMeasurements,
  Product
} from '../../types';

// ============================================================================
// 1. Garment Types (Indian Fashion Primary, Western Wear Secondary)
// ============================================================================

export const INITIAL_GARMENT_TYPES: GarmentType[] = [
  {
    id: '11111111-1111-1111-1111-000000000001',
    code: 'men_kurta',
    name: "Men's Tailored Kurta",
    description: "Classic & contemporary Indian knee-length kurta engineered for celebration, ceremony, and festive elegance.",
    category: 'traditional',
    gender: 'men',
    occasion: 'festive',
    region: 'All India',
    isReadyMade: true,
    isCustomizable: true,
    isActive: true
  },
  {
    id: '11111111-1111-1111-1111-000000000002',
    code: 'men_nehru_jacket',
    name: "Men's Royal Nehru Jacket",
    description: "Tailored sleeveless ethnic waistcoat with mandarin band collar, structured chest, and welt pockets.",
    category: 'contemporary_indo_western',
    gender: 'men',
    occasion: 'wedding',
    region: 'North India',
    isReadyMade: true,
    isCustomizable: true,
    isActive: true
  },
  {
    id: '11111111-1111-1111-1111-000000000003',
    code: 'mundu_set',
    name: "Kerala Kasavu Mundu & Kurta Set",
    description: "Authentic double mundu and matching kurta woven with metallic gold kasavu zari border from Kerala.",
    category: 'traditional',
    gender: 'men',
    occasion: 'ceremony',
    region: 'Kerala',
    isReadyMade: true,
    isCustomizable: false,
    isActive: true
  },
  {
    id: '11111111-1111-1111-1111-000000000004',
    code: 'women_kurti',
    name: "Women's Chanderi Festive Kurti",
    description: "Contemporary straight-cut ethnic kurti in lustrous Chanderi silk with side slits and zari accents.",
    category: 'contemporary_indo_western',
    gender: 'women',
    occasion: 'festive',
    region: 'Central India',
    isReadyMade: true,
    isCustomizable: false,
    isActive: true
  },
  {
    id: '11111111-1111-1111-1111-111111111111',
    code: 'men_shirt',
    name: "Men's Tailored Dress Shirt",
    description: "Custom tailored Western dress shirt engineered with precision collars, cuffs, and plackets.",
    category: 'western',
    gender: 'men',
    occasion: 'office',
    region: 'Western',
    isReadyMade: true,
    isCustomizable: true,
    isActive: true
  }
];

export const INITIAL_GARMENT_TYPE: GarmentType = INITIAL_GARMENT_TYPES[0]; // Men's Kurta default!
export const KURTA_GARMENT_TYPE: GarmentType = INITIAL_GARMENT_TYPES[0];
export const SHIRT_GARMENT_TYPE: GarmentType = INITIAL_GARMENT_TYPES.find((g) => g.code === 'men_shirt') || INITIAL_GARMENT_TYPES[4];

// ============================================================================
// 2. Rich Indian & International Fabrics
// ============================================================================

export const INITIAL_FABRICS: Fabric[] = [
  {
    id: '22222222-2222-2222-2222-000000000010',
    code: 'kasavu_kerala',
    name: 'Kerala Kasavu Handloom Cotton',
    regionalTradeName: 'Balaramapuram Kasavu',
    regionOfOrigin: 'Kerala, South India',
    materialComposition: '100% Fine Combed Handloom Cotton with Metallic Gold Zari Weft',
    weaveType: 'Fine Plain Handloom with Jacquard Zari Border',
    weightGsm: 115,
    drapeCharacteristics: 'crisp',
    colorName: 'Natural Ivory & Gold',
    colorHex: '#faf7ee',
    patternType: 'zari_border',
    borderPatternType: 'kasavu_gold',
    borderWidthMm: 45,
    surchargeCents: 0,
    surchargePaise: 0,
    suitableGarmentTypes: ['men_kurta', 'mundu_set', 'women_kurti'],
    careInstructions: 'Gentle hand wash in cold water or mild dry clean. Iron reverse side.',
    inStock: true,
    isAuthenticityVerified: true
  },
  {
    id: '22222222-2222-2222-2222-000000000011',
    code: 'raw_silk_navy',
    name: 'Chanderi Raw Silk Midnight',
    regionalTradeName: 'Chanderi Raw Silk',
    regionOfOrigin: 'Madhya Pradesh, India',
    materialComposition: '80% Natural Mulberry Silk, 20% Fine Cotton with Natural Slubs',
    weaveType: 'Textured Raw Silk Plain Weave',
    weightGsm: 140,
    drapeCharacteristics: 'structured',
    colorName: 'Midnight Navy',
    colorHex: '#1e293b',
    patternType: 'solid',
    borderPatternType: 'none',
    surchargeCents: 1500,
    surchargePaise: 60000, // ₹600.00
    suitableGarmentTypes: ['men_kurta', 'men_nehru_jacket'],
    careInstructions: 'Professional dry clean only.',
    inStock: true,
    isAuthenticityVerified: true
  },
  {
    id: '22222222-2222-2222-2222-000000000012',
    code: 'khadi_natural',
    name: 'Handspun Khadi Organic Cotton',
    regionalTradeName: 'Ambar Charkha Khadi',
    regionOfOrigin: 'Gujarat, India',
    materialComposition: '100% Hand-Spun & Hand-Woven Organic Cotton',
    weaveType: 'Breathable Handloom Slub',
    weightGsm: 130,
    drapeCharacteristics: 'soft',
    colorName: 'Natural Sand',
    colorHex: '#e2d9cc',
    patternType: 'solid',
    borderPatternType: 'none',
    surchargeCents: 500,
    surchargePaise: 20000, // ₹200.00
    suitableGarmentTypes: ['men_kurta', 'men_nehru_jacket', 'men_shirt'],
    careInstructions: 'Gentle machine wash with mild detergent.',
    inStock: true,
    isAuthenticityVerified: true
  },
  {
    id: '22222222-2222-2222-2222-000000000013',
    code: 'chikankari_emerald',
    name: 'Lucknowi Embroidered Cotton',
    regionalTradeName: 'Lucknow Chikankari Lawn',
    regionOfOrigin: 'Lucknow, Uttar Pradesh',
    materialComposition: '100% Fine Lawn Cotton with Tone-on-Tone Thread Shadow Embroidery',
    weaveType: 'Embroidered Fine Lawn',
    weightGsm: 125,
    drapeCharacteristics: 'fluid',
    colorName: 'Royal Emerald',
    colorHex: '#064e3b',
    patternType: 'solid',
    borderPatternType: 'none',
    surchargeCents: 2000,
    surchargePaise: 90000, // ₹900.00
    suitableGarmentTypes: ['men_kurta', 'women_kurti'],
    careInstructions: 'Dry clean recommended to preserve hand embroidery.',
    inStock: true,
    isAuthenticityVerified: true
  },
  // Retained Western Shirt Fabrics
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
    surchargePaise: 0,
    suitableGarmentTypes: ['men_shirt', 'men_kurta'],
    careInstructions: 'Machine wash warm, warm iron.',
    inStock: true,
    isAuthenticityVerified: true
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
    surchargePaise: 0,
    suitableGarmentTypes: ['men_shirt'],
    careInstructions: 'Machine wash warm.',
    inStock: true,
    isAuthenticityVerified: true
  },
  {
    id: '22222222-2222-2222-2222-000000000003',
    code: 'twill_navy',
    name: 'Fine Twill Cotton',
    materialComposition: '100% Compact Cotton Twill',
    weaveType: 'Twill',
    colorName: 'Midnight Navy',
    colorHex: '#1e293b',
    patternType: 'solid',
    surchargeCents: 1500,
    surchargePaise: 60000,
    suitableGarmentTypes: ['men_shirt'],
    careInstructions: 'Machine wash warm, tumble dry low.',
    inStock: true,
    isAuthenticityVerified: true
  },
  {
    id: '22222222-2222-2222-2222-000000000004',
    code: 'linen_sand',
    name: 'Bespoke Pure Linen',
    materialComposition: '100% French Flax Linen',
    weaveType: 'Plain Linen',
    colorName: 'Sand Beige',
    colorHex: '#d6c7b2',
    patternType: 'solid',
    surchargeCents: 2500,
    surchargePaise: 100000,
    suitableGarmentTypes: ['men_shirt', 'men_kurta'],
    careInstructions: 'Gentle cycle, line dry recommended.',
    inStock: true,
    isAuthenticityVerified: true
  }
];

// ============================================================================
// 3. Customization Options (Men's Kurta & Western Shirt)
// ============================================================================

export const INITIAL_OPTIONS: CustomizationOption[] = [
  // ---------------- MEN'S KURTA OPTIONS ----------------
  // Silhouette
  {
    id: '33333333-4444-1111-1111-000000000001',
    garmentTypeId: '11111111-1111-1111-1111-000000000001', // men_kurta
    category: 'silhouette',
    code: 'kurta_sil_straight',
    name: 'Classic Straight Cut',
    description: 'Traditional clean vertical silhouette with straight side falls.',
    surchargeCents: 0,
    surchargePaise: 0,
    defaultModelSlot: 'kurta_straight',
    isDefault: true,
    isActive: true
  },
  {
    id: '33333333-4444-1111-1111-000000000002',
    garmentTypeId: '11111111-1111-1111-1111-000000000001',
    category: 'silhouette',
    code: 'kurta_sil_aline',
    name: 'Subtle A-Line Flare',
    description: 'Modern relaxed flare below the waist for extra drape and ease.',
    surchargeCents: 0,
    surchargePaise: 0,
    defaultModelSlot: 'kurta_aline',
    isDefault: false,
    isActive: true
  },
  {
    id: '33333333-4444-1111-1111-000000000003',
    garmentTypeId: '11111111-1111-1111-1111-000000000001',
    category: 'silhouette',
    code: 'kurta_sil_short',
    name: 'Short Casual Kurta',
    description: 'Modern mid-thigh cut designed to pair casually with jeans or trousers.',
    surchargeCents: 0,
    surchargePaise: 0,
    defaultModelSlot: 'kurta_short',
    isDefault: false,
    isActive: true
  },

  // Length & Slits
  {
    id: '33333333-4444-1111-1111-000000000010',
    garmentTypeId: '11111111-1111-1111-1111-000000000001',
    category: 'length_slits',
    code: 'kurta_len_knee',
    name: 'Knee Length (1020mm) • 320mm Slits',
    description: 'Standard festive knee length with traditional 320mm side slits.',
    surchargeCents: 0,
    surchargePaise: 0,
    defaultModelSlot: 'len_knee',
    isDefault: true,
    isActive: true
  },
  {
    id: '33333333-4444-1111-1111-000000000011',
    garmentTypeId: '11111111-1111-1111-1111-000000000001',
    category: 'length_slits',
    code: 'kurta_len_calf',
    name: 'Calf Length (1140mm) • 380mm Slits',
    description: 'Formal royal length extending past the knee with high side slits.',
    surchargeCents: 0,
    surchargePaise: 0,
    defaultModelSlot: 'len_calf',
    isDefault: false,
    isActive: true
  },
  {
    id: '33333333-4444-1111-1111-000000000012',
    garmentTypeId: '11111111-1111-1111-1111-000000000001',
    category: 'length_slits',
    code: 'kurta_len_short',
    name: 'Mid-Thigh (860mm) • 180mm Slits',
    description: 'Shorter length with compact side vents.',
    surchargeCents: 0,
    surchargePaise: 0,
    defaultModelSlot: 'len_short',
    isDefault: false,
    isActive: true
  },

  // Neckline & Collar
  {
    id: '33333333-4444-1111-1111-000000000020',
    garmentTypeId: '11111111-1111-1111-1111-000000000001',
    category: 'neckline',
    code: 'kurta_neck_mandarin',
    name: 'Classic Mandarin Band (35mm)',
    description: 'Traditional standing band collar with softly rounded front corners.',
    surchargeCents: 0,
    surchargePaise: 0,
    defaultModelSlot: 'neck_mandarin',
    isDefault: true,
    isActive: true
  },
  {
    id: '33333333-4444-1111-1111-000000000021',
    garmentTypeId: '11111111-1111-1111-1111-000000000001',
    category: 'neckline',
    code: 'kurta_neck_nehru',
    name: 'Nehru High Standing Collar (42mm)',
    description: 'Structured royal high collar with stiffened interlining.',
    surchargeCents: 0,
    surchargePaise: 0,
    defaultModelSlot: 'neck_nehru',
    isDefault: false,
    isActive: true
  },
  {
    id: '33333333-4444-1111-1111-000000000022',
    garmentTypeId: '11111111-1111-1111-1111-000000000001',
    category: 'neckline',
    code: 'kurta_neck_round',
    name: 'Collarless Round Neck (Piping)',
    description: 'Minimalist round neckline finished with clean self-fabric piping.',
    surchargeCents: 0,
    surchargePaise: 0,
    defaultModelSlot: 'neck_round',
    isDefault: false,
    isActive: true
  },

  // Kurta Patti (Front Placket)
  {
    id: '33333333-4444-1111-1111-000000000030',
    garmentTypeId: '11111111-1111-1111-1111-000000000001',
    category: 'kurta_patti',
    code: 'kurta_patti_classic',
    name: 'Classic Buttoned Patti (280mm)',
    description: 'Standard tailored front chest placket with visible 4-button closure.',
    surchargeCents: 0,
    surchargePaise: 0,
    defaultModelSlot: 'patti_classic',
    isDefault: true,
    isActive: true
  },
  {
    id: '33333333-4444-1111-1111-000000000031',
    garmentTypeId: '11111111-1111-1111-1111-000000000001',
    category: 'kurta_patti',
    code: 'kurta_patti_concealed',
    name: 'Concealed Fly Front Patti',
    description: 'Clean seamless front placket concealing closure hooks/buttons.',
    surchargeCents: 0,
    surchargePaise: 0,
    defaultModelSlot: 'patti_concealed',
    isDefault: false,
    isActive: true
  },
  {
    id: '33333333-4444-1111-1111-000000000032',
    garmentTypeId: '11111111-1111-1111-1111-000000000001',
    category: 'kurta_patti',
    code: 'kurta_patti_contrast',
    name: 'Gold Zari Trimmed Patti',
    description: 'Placket edged with intricate metallic gold zari piping.',
    surchargeCents: 500,
    surchargePaise: 25000, // ₹250.00
    defaultModelSlot: 'patti_contrast',
    isDefault: false,
    isActive: true
  },

  // Sleeves
  {
    id: '33333333-4444-1111-1111-000000000040',
    garmentTypeId: '11111111-1111-1111-1111-000000000001',
    category: 'sleeve',
    code: 'kurta_sleeve_full',
    name: 'Full Length Straight Sleeve',
    description: 'Traditional straight fall sleeve finishing at the wrist.',
    surchargeCents: 0,
    surchargePaise: 0,
    defaultModelSlot: 'sleeve_full',
    isDefault: true,
    isActive: true
  },
  {
    id: '33333333-4444-1111-1111-000000000041',
    garmentTypeId: '11111111-1111-1111-1111-000000000001',
    category: 'sleeve',
    code: 'kurta_sleeve_rollup',
    name: 'Full Sleeve with Roll-up Tab',
    description: 'Versatile sleeve with buttoned interior strap to secure folded cuff.',
    surchargeCents: 0,
    surchargePaise: 0,
    defaultModelSlot: 'sleeve_rollup',
    isDefault: false,
    isActive: true
  },
  {
    id: '33333333-4444-1111-1111-000000000042',
    garmentTypeId: '11111111-1111-1111-1111-000000000001',
    category: 'sleeve',
    code: 'kurta_sleeve_short',
    name: 'Short Sleeve (Mid-Bicep)',
    description: 'Casual summer length tailored clean at bicep level.',
    surchargeCents: 0,
    surchargePaise: 0,
    defaultModelSlot: 'sleeve_short',
    isDefault: false,
    isActive: true
  },

  // Pockets
  {
    id: '33333333-4444-1111-1111-000000000050',
    garmentTypeId: '11111111-1111-1111-1111-000000000001',
    category: 'pocket',
    code: 'kurta_pocket_dual_inseam',
    name: 'Dual Inseam Side Pockets',
    description: 'Two deep functional pockets concealed seamlessly inside side seams.',
    surchargeCents: 0,
    surchargePaise: 0,
    defaultModelSlot: 'pocket_inseam',
    isDefault: true,
    isActive: true
  },
  {
    id: '33333333-4444-1111-1111-000000000051',
    garmentTypeId: '11111111-1111-1111-1111-000000000001',
    category: 'pocket',
    code: 'kurta_pocket_chest',
    name: 'Left Chest Kurta Pocket',
    description: 'Classic welt pocket on left chest for pocket square or spectacles.',
    surchargeCents: 0,
    surchargePaise: 0,
    defaultModelSlot: 'pocket_chest',
    isDefault: false,
    isActive: true
  },
  {
    id: '33333333-4444-1111-1111-000000000052',
    garmentTypeId: '11111111-1111-1111-1111-000000000001',
    category: 'pocket',
    code: 'kurta_pocket_none',
    name: 'No Pockets (Clean Flow)',
    description: 'Pure unbroken silhouette without pocket insertions.',
    surchargeCents: 0,
    surchargePaise: 0,
    defaultModelSlot: 'pocket_none',
    isDefault: false,
    isActive: true
  },

  // Borders & Zari Trim
  {
    id: '33333333-4444-1111-1111-000000000060',
    garmentTypeId: '11111111-1111-1111-1111-000000000001',
    category: 'borders_zari',
    code: 'kurta_border_kasavu',
    name: 'Kerala Kasavu Gold Zari Border',
    description: 'Authentic 45mm woven metallic gold zari border on hem and cuffs.',
    surchargeCents: 800,
    surchargePaise: 40000, // ₹400.00
    defaultModelSlot: 'border_kasavu',
    isDefault: true,
    isActive: true
  },
  {
    id: '33333333-4444-1111-1111-000000000061',
    garmentTypeId: '11111111-1111-1111-1111-000000000001',
    category: 'borders_zari',
    code: 'kurta_border_plain',
    name: 'Clean Plain Hem (No Zari)',
    description: 'Simple hand-rolled hem finish without metallic border.',
    surchargeCents: 0,
    surchargePaise: 0,
    defaultModelSlot: 'border_plain',
    isDefault: false,
    isActive: true
  },

  // Buttons
  {
    id: '33333333-4444-1111-1111-000000000070',
    garmentTypeId: '11111111-1111-1111-1111-000000000001',
    category: 'buttons',
    code: 'kurta_btn_brass',
    name: 'Antique Brass Kurta Buttons',
    description: 'Handcrafted metallic brass buttons with floral engraving.',
    surchargeCents: 500,
    surchargePaise: 25000, // ₹250.00
    defaultModelSlot: 'btn_brass',
    isDefault: true,
    isActive: true
  },
  {
    id: '33333333-4444-1111-1111-000000000071',
    garmentTypeId: '11111111-1111-1111-1111-000000000001',
    category: 'buttons',
    code: 'kurta_btn_wooden',
    name: 'Carved Sheesham Wood Buttons',
    description: 'Natural hand-carved Indian rosewood buttons.',
    surchargeCents: 0,
    surchargePaise: 0,
    defaultModelSlot: 'btn_wooden',
    isDefault: false,
    isActive: true
  },
  {
    id: '33333333-4444-1111-1111-000000000072',
    garmentTypeId: '11111111-1111-1111-1111-000000000001',
    category: 'buttons',
    code: 'kurta_btn_potli',
    name: 'Handmade Fabric Potli Buttons',
    description: 'Artisanal stuffed fabric potli buttons stitched in matching fabric.',
    surchargeCents: 300,
    surchargePaise: 15000, // ₹150.00
    defaultModelSlot: 'btn_potli',
    isDefault: false,
    isActive: true
  },

  // ---------------- RETAINED WESTERN SHIRT OPTIONS ----------------
  {
    id: '33333333-3333-3333-3333-000000000001',
    garmentTypeId: '11111111-1111-1111-1111-111111111111', // men_shirt
    category: 'collar',
    code: 'collar_spread',
    name: 'Classic Semi-Spread Collar',
    description: 'Versatile collar suitable for standard neckties or open collar styling.',
    surchargeCents: 0,
    surchargePaise: 0,
    defaultModelSlot: 'collar_spread',
    isDefault: true,
    isActive: true
  },
  {
    id: '33333333-3333-3333-3333-000000000003',
    garmentTypeId: '11111111-1111-1111-1111-111111111111',
    category: 'collar',
    code: 'collar_band',
    name: 'Band / Grandad Collar',
    description: 'Modern minimalist standing collar without points.',
    surchargeCents: 500,
    surchargePaise: 25000,
    defaultModelSlot: 'collar_band',
    isDefault: false,
    isActive: true
  },
  {
    id: '33333333-3333-3333-3333-000000000010',
    garmentTypeId: '11111111-1111-1111-1111-111111111111',
    category: 'cuff',
    code: 'cuff_barrel',
    name: 'Single-Button Barrel Cuff',
    description: 'Standard round barrel cuff with single adjustable button.',
    surchargeCents: 0,
    surchargePaise: 0,
    defaultModelSlot: 'cuff_barrel',
    isDefault: true,
    isActive: true
  },
  {
    id: '33333333-3333-3333-3333-000000000011',
    garmentTypeId: '11111111-1111-1111-1111-111111111111',
    category: 'cuff',
    code: 'cuff_french',
    name: 'Double French Cuff',
    description: 'Formal folded cuff requiring cufflinks.',
    surchargeCents: 1000,
    surchargePaise: 50000,
    defaultModelSlot: 'cuff_french',
    isDefault: false,
    isActive: true
  },
  {
    id: '33333333-3333-3333-3333-000000000012',
    garmentTypeId: '11111111-1111-1111-1111-111111111111',
    category: 'cuff',
    code: 'cuff_none',
    name: 'No Cuff (Clean Hem)',
    description: 'Clean hemmed sleeve edge.',
    surchargeCents: 0,
    surchargePaise: 0,
    defaultModelSlot: 'cuff_none',
    isDefault: false,
    isActive: true
  },
  {
    id: '33333333-3333-3333-3333-000000000020',
    garmentTypeId: '11111111-1111-1111-1111-111111111111',
    category: 'sleeve',
    code: 'sleeve_long',
    name: 'Long Sleeve',
    description: 'Full length tailored sleeve.',
    surchargeCents: 0,
    surchargePaise: 0,
    defaultModelSlot: 'sleeve_long',
    isDefault: true,
    isActive: true
  },
  {
    id: '33333333-3333-3333-3333-000000000021',
    garmentTypeId: '11111111-1111-1111-1111-111111111111',
    category: 'sleeve',
    code: 'sleeve_short',
    name: 'Short Sleeve',
    description: 'Clean warm-weather sleeve.',
    surchargeCents: 0,
    surchargePaise: 0,
    defaultModelSlot: 'sleeve_short',
    isDefault: false,
    isActive: true
  },
  {
    id: '33333333-3333-3333-3333-000000000030',
    garmentTypeId: '11111111-1111-1111-1111-111111111111',
    category: 'placket',
    code: 'placket_front',
    name: 'Standard Stitched Placket',
    description: 'Classic folded and edge-stitched front placket.',
    surchargeCents: 0,
    surchargePaise: 0,
    defaultModelSlot: 'placket_front',
    isDefault: true,
    isActive: true
  },
  {
    id: '33333333-3333-3333-3333-000000000040',
    garmentTypeId: '11111111-1111-1111-1111-111111111111',
    category: 'pocket',
    code: 'pocket_none',
    name: 'No Pocket',
    description: 'Sleek chest styling.',
    surchargeCents: 0,
    surchargePaise: 0,
    defaultModelSlot: 'pocket_none',
    isDefault: true,
    isActive: true
  },
  {
    id: '33333333-3333-3333-3333-000000000050',
    garmentTypeId: '11111111-1111-1111-1111-111111111111',
    category: 'buttons',
    code: 'button_mother_pearl',
    name: 'Genuine Mother of Pearl',
    description: 'Natural iridescent shell buttons.',
    surchargeCents: 1200,
    surchargePaise: 60000,
    defaultModelSlot: 'button_mop',
    isDefault: true,
    isActive: true
  },
  {
    id: '33333333-3333-3333-3333-000000000060',
    garmentTypeId: '11111111-1111-1111-1111-111111111111',
    category: 'back_pleat',
    code: 'pleat_side',
    name: 'Dual Side Pleats',
    description: 'Two knife pleats behind shoulders.',
    surchargeCents: 0,
    surchargePaise: 0,
    defaultModelSlot: 'pleat_side',
    isDefault: true,
    isActive: true
  },
  {
    id: '33333333-3333-3333-3333-000000000070',
    garmentTypeId: '11111111-1111-1111-1111-111111111111',
    category: 'hem',
    code: 'hem_curved',
    name: 'Classic Tails Hem (Curved)',
    description: 'Curved tails engineered to remain tucked into trousers.',
    surchargeCents: 0,
    surchargePaise: 0,
    defaultModelSlot: 'hem_curved',
    isDefault: true,
    isActive: true
  }
];

// ============================================================================
// 4. Compatibility Rules (Kurta + Shirt)
// ============================================================================

export const INITIAL_COMPATIBILITY_RULES: OptionCompatibilityRule[] = [
  // Kurta Rule 1: Roll-up sleeve tab is incompatible with short sleeves
  {
    id: 'rule-kurta-rollup-short',
    optionAId: '33333333-4444-1111-1111-000000000041', // kurta_sleeve_rollup
    optionBId: '33333333-4444-1111-1111-000000000042', // kurta_sleeve_short
    ruleType: 'incompatible',
    reason: 'Roll-up sleeve tabs require full length sleeves and cannot be crafted on short sleeves.'
  },
  // Kurta Rule 2: Short silhouette forces short length
  {
    id: 'rule-kurta-short-sil-len',
    optionAId: '33333333-4444-1111-1111-000000000003', // kurta_sil_short
    optionBId: '33333333-4444-1111-1111-000000000012', // kurta_len_short
    ruleType: 'forces_default',
    reason: 'Selecting casual short silhouette automatically sets mid-thigh length with compact side slits.'
  },
  // Shirt Rule 1: French Cuffs are incompatible with Short Sleeves
  {
    id: 'rule-french-short',
    optionAId: '33333333-3333-3333-3333-000000000011', // cuff_french
    optionBId: '33333333-3333-3333-3333-000000000021', // sleeve_short
    ruleType: 'incompatible',
    reason: 'French double cuffs require full length sleeves and cannot be tailored onto short sleeves.'
  },
  // Shirt Rule 2: Short Sleeves require No Cuff
  {
    id: 'rule-short-no-cuff',
    optionAId: '33333333-3333-3333-3333-000000000021', // sleeve_short
    optionBId: '33333333-3333-3333-3333-000000000012', // cuff_none
    ruleType: 'forces_default',
    reason: 'Selecting short sleeves automatically sets the cuff style to clean hem.'
  }
];

// ============================================================================
// 5. Grading Charts & Ease Rules (Kurta + Shirt)
// ============================================================================

export const INITIAL_GRADING_CHART: GarmentMeasurementsGrading[] = [
  // Kurta Grading Chart (Knee length 1020-1080mm, generous chest & seat)
  { id: 'kurta-xs', garmentTypeId: '11111111-1111-1111-1111-000000000001', sizeCode: 'XS', chestGarmentMm: 1020, waistGarmentMm: 960,  hipGarmentMm: 1040, neckGarmentMm: 375, shoulderGarmentMm: 440, sleeveGarmentMm: 810, lengthGarmentMm: 980 },
  { id: 'kurta-s',  garmentTypeId: '11111111-1111-1111-1111-000000000001', sizeCode: 'S',  chestGarmentMm: 1080, waistGarmentMm: 1020, hipGarmentMm: 1100, neckGarmentMm: 390, shoulderGarmentMm: 460, sleeveGarmentMm: 830, lengthGarmentMm: 1000 },
  { id: 'kurta-m',  garmentTypeId: '11111111-1111-1111-1111-000000000001', sizeCode: 'M',  chestGarmentMm: 1140, waistGarmentMm: 1080, hipGarmentMm: 1160, neckGarmentMm: 405, shoulderGarmentMm: 480, sleeveGarmentMm: 850, lengthGarmentMm: 1020 },
  { id: 'kurta-l',  garmentTypeId: '11111111-1111-1111-1111-000000000001', sizeCode: 'L',  chestGarmentMm: 1220, waistGarmentMm: 1160, hipGarmentMm: 1240, neckGarmentMm: 425, shoulderGarmentMm: 500, sleeveGarmentMm: 875, lengthGarmentMm: 1050 },
  { id: 'kurta-xl', garmentTypeId: '11111111-1111-1111-1111-000000000001', sizeCode: 'XL', chestGarmentMm: 1300, waistGarmentMm: 1240, hipGarmentMm: 1320, neckGarmentMm: 445, shoulderGarmentMm: 520, sleeveGarmentMm: 900, lengthGarmentMm: 1080 },
  { id: 'kurta-xxl',garmentTypeId: '11111111-1111-1111-1111-000000000001', sizeCode: 'XXL',chestGarmentMm: 1380, waistGarmentMm: 1320, hipGarmentMm: 1400, neckGarmentMm: 465, shoulderGarmentMm: 540, sleeveGarmentMm: 920, lengthGarmentMm: 1100 },

  // Shirt Grading Chart (Retained)
  { id: 'size-xs', garmentTypeId: '11111111-1111-1111-1111-111111111111', sizeCode: 'XS', chestGarmentMm: 980,  waistGarmentMm: 880,  hipGarmentMm: 960,  neckGarmentMm: 370, shoulderGarmentMm: 430, sleeveGarmentMm: 810, lengthGarmentMm: 740 },
  { id: 'size-s',  garmentTypeId: '11111111-1111-1111-1111-111111111111', sizeCode: 'S',  chestGarmentMm: 1040, waistGarmentMm: 940,  hipGarmentMm: 1020, neckGarmentMm: 385, shoulderGarmentMm: 450, sleeveGarmentMm: 830, lengthGarmentMm: 760 },
  { id: 'size-m',  garmentTypeId: '11111111-1111-1111-1111-111111111111', sizeCode: 'M',  chestGarmentMm: 1100, waistGarmentMm: 1000, hipGarmentMm: 1080, neckGarmentMm: 400, shoulderGarmentMm: 470, sleeveGarmentMm: 850, lengthGarmentMm: 780 },
  { id: 'size-l',  garmentTypeId: '11111111-1111-1111-1111-111111111111', sizeCode: 'L',  chestGarmentMm: 1180, waistGarmentMm: 1080, hipGarmentMm: 1160, neckGarmentMm: 420, shoulderGarmentMm: 490, sleeveGarmentMm: 875, lengthGarmentMm: 800 },
  { id: 'size-xl', garmentTypeId: '11111111-1111-1111-1111-111111111111', sizeCode: 'XL', chestGarmentMm: 1260, waistGarmentMm: 1180, hipGarmentMm: 1240, neckGarmentMm: 440, shoulderGarmentMm: 510, sleeveGarmentMm: 900, lengthGarmentMm: 820 },
  { id: 'size-xxl',garmentTypeId: '11111111-1111-1111-1111-111111111111', sizeCode: 'XXL',chestGarmentMm: 1340, waistGarmentMm: 1280, hipGarmentMm: 1320, neckGarmentMm: 460, shoulderGarmentMm: 530, sleeveGarmentMm: 920, lengthGarmentMm: 840 }
];

export const INITIAL_EASE_RULES: SizeEaseRule[] = [
  // Kurta Ease Rules (generous allowance for comfort, cross-legged sitting & side slits)
  { id: 'ease-kurta-slim',    garmentTypeId: '11111111-1111-1111-1111-000000000001', fitPreference: 'slim',    chestEaseMm: 100, waistEaseMm: 100, hipEaseMm: 120, bicepEaseMm: 50, neckEaseMm: 15 },
  { id: 'ease-kurta-regular', garmentTypeId: '11111111-1111-1111-1111-000000000001', fitPreference: 'regular', chestEaseMm: 130, waistEaseMm: 140, hipEaseMm: 160, bicepEaseMm: 70, neckEaseMm: 20 },
  { id: 'ease-kurta-relaxed', garmentTypeId: '11111111-1111-1111-1111-000000000001', fitPreference: 'relaxed', chestEaseMm: 170, waistEaseMm: 180, hipEaseMm: 200, bicepEaseMm: 90, neckEaseMm: 25 },

  // Shirt Ease Rules (Retained)
  { id: 'ease-slim',    garmentTypeId: '11111111-1111-1111-1111-111111111111', fitPreference: 'slim',    chestEaseMm: 80,  waistEaseMm: 60,  hipEaseMm: 60,  bicepEaseMm: 40, neckEaseMm: 15 },
  { id: 'ease-regular', garmentTypeId: '11111111-1111-1111-1111-111111111111', fitPreference: 'regular', chestEaseMm: 120, waistEaseMm: 100, hipEaseMm: 100, bicepEaseMm: 60, neckEaseMm: 15 },
  { id: 'ease-relaxed', garmentTypeId: '11111111-1111-1111-1111-111111111111', fitPreference: 'relaxed', chestEaseMm: 160, waistEaseMm: 140, hipEaseMm: 140, bicepEaseMm: 80, neckEaseMm: 20 }
];

// ============================================================================
// 6. Ready-Made Products Catalog (Authentic Indian Fashion)
// ============================================================================

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-001',
    garmentTypeId: '11111111-1111-1111-1111-000000000001', // men_kurta
    sku: 'IK-KL-KAS-01',
    title: 'Kerala Kasavu Handloom Festive Kurta',
    description: 'Fine Balaramapuram handloom cotton kurta with 45mm woven metallic gold zari border and mandarin collar.',
    category: 'kurtas',
    gender: 'men',
    occasion: 'festive',
    region: 'Kerala',
    fabricName: 'Kerala Kasavu Handloom Cotton',
    colorName: 'Natural Ivory & Gold',
    colorHex: '#faf7ee',
    pricePaise: 249900, // ₹2,499.00
    isReadyMade: true,
    isCustomizable: true,
    variants: [
      { id: 'var-001-s', productId: 'prod-001', sizeCode: 'S', stockQuantity: 8 },
      { id: 'var-001-m', productId: 'prod-001', sizeCode: 'M', stockQuantity: 15 },
      { id: 'var-001-l', productId: 'prod-001', sizeCode: 'L', stockQuantity: 12 },
      { id: 'var-001-xl', productId: 'prod-001', sizeCode: 'XL', stockQuantity: 6 }
    ]
  },
  {
    id: 'prod-002',
    garmentTypeId: '11111111-1111-1111-1111-000000000001', // men_kurta
    sku: 'IK-UP-CHK-02',
    title: 'Lucknowi Chikankari Embroidered Kurta',
    description: 'Bespoke royal emerald lawn cotton kurta detailed with authentic hand-stitched tone-on-tone Chikankari embroidery.',
    category: 'kurtas',
    gender: 'men',
    occasion: 'wedding',
    region: 'Uttar Pradesh',
    fabricName: 'Lucknowi Embroidered Cotton',
    colorName: 'Royal Emerald',
    colorHex: '#064e3b',
    pricePaise: 329900, // ₹3,299.00
    isReadyMade: true,
    isCustomizable: true,
    variants: [
      { id: 'var-002-s', productId: 'prod-002', sizeCode: 'S', stockQuantity: 5 },
      { id: 'var-002-m', productId: 'prod-002', sizeCode: 'M', stockQuantity: 10 },
      { id: 'var-002-l', productId: 'prod-002', sizeCode: 'L', stockQuantity: 7 }
    ]
  },
  {
    id: 'prod-003',
    garmentTypeId: '11111111-1111-1111-1111-000000000002', // men_nehru_jacket
    sku: 'IN-MP-RSK-03',
    title: 'Chanderi Raw Silk Royal Nehru Jacket',
    description: 'Structured midnight blue ethnic waistcoat with brass buttons, chest welt pocket, and fine cotton lining.',
    category: 'nehru_jackets',
    gender: 'men',
    occasion: 'ceremony',
    region: 'North India',
    fabricName: 'Chanderi Raw Silk Midnight',
    colorName: 'Midnight Navy',
    colorHex: '#1e293b',
    pricePaise: 399900, // ₹3,999.00
    isReadyMade: true,
    isCustomizable: false,
    variants: [
      { id: 'var-003-m', productId: 'prod-003', sizeCode: 'M', stockQuantity: 9 },
      { id: 'var-003-l', productId: 'prod-003', sizeCode: 'L', stockQuantity: 11 }
    ]
  },
  {
    id: 'prod-004',
    garmentTypeId: '11111111-1111-1111-1111-000000000003', // mundu_set
    sku: 'IM-KL-MND-04',
    title: 'Kerala Kasavu Double Mundu & Angavastram Set',
    description: 'Traditional 4-meter double mundu handwoven with pure metallic zari border paired with matching angavastram.',
    category: 'dhotis_mundu',
    gender: 'men',
    occasion: 'ceremony',
    region: 'Kerala',
    fabricName: 'Kerala Kasavu Handloom Cotton',
    colorName: 'Off-White & Gold',
    colorHex: '#faf7ee',
    pricePaise: 189900, // ₹1,899.00
    isReadyMade: true,
    isCustomizable: false,
    variants: [
      { id: 'var-004-free', productId: 'prod-004', sizeCode: 'M', stockQuantity: 20 }
    ]
  },
  {
    id: 'prod-005',
    garmentTypeId: '11111111-1111-1111-1111-000000000004', // women_kurti
    sku: 'IW-CI-KRT-05',
    title: 'Women’s Chanderi Silk Festive Kurti',
    description: 'Contemporary A-line kurti in lightweight Chanderi silk with elegant side slits and zari border cuffs.',
    category: 'kurtas',
    gender: 'women',
    occasion: 'festive',
    region: 'Central India',
    fabricName: 'Chanderi Raw Silk Midnight',
    colorName: 'Midnight Blue',
    colorHex: '#1e293b',
    pricePaise: 279900, // ₹2,799.00
    isReadyMade: true,
    isCustomizable: false,
    variants: [
      { id: 'var-005-s', productId: 'prod-005', sizeCode: 'S', stockQuantity: 6 },
      { id: 'var-005-m', productId: 'prod-005', sizeCode: 'M', stockQuantity: 14 }
    ]
  },
  {
    id: 'prod-006',
    garmentTypeId: '11111111-1111-1111-1111-111111111111', // men_shirt (Western)
    sku: 'WS-EG-POP-06',
    title: 'Tailored Egyptian Cotton Poplin Shirt',
    description: 'Crisp white 2-ply Egyptian cotton dress shirt with semi-spread collar and barrel cuffs.',
    category: 'western',
    gender: 'men',
    occasion: 'office',
    region: 'Western',
    fabricName: 'Egyptian Cotton Poplin',
    colorName: 'Crisp White',
    colorHex: '#ffffff',
    pricePaise: 249900, // ₹2,499.00
    isReadyMade: true,
    isCustomizable: true,
    variants: [
      { id: 'var-006-m', productId: 'prod-006', sizeCode: 'M', stockQuantity: 10 },
      { id: 'var-006-l', productId: 'prod-006', sizeCode: 'L', stockQuantity: 8 }
    ]
  }
];

// ============================================================================
// 7. Sample Profile & Measurements
// ============================================================================

export const INITIAL_PROFILE: UserProfile = {
  id: '44444444-4444-4444-4444-444444444444',
  email: 'arjun.nair@bespoke-india.local',
  fullName: 'Arjun Nair',
  role: 'customer',
  createdAt: '2026-10-11T12:00:00Z',
  updatedAt: '2026-10-11T12:00:00Z'
};

export const INITIAL_BODY_PROFILES: BodyProfile[] = [
  {
    id: '55555555-5555-5555-5555-555555555555',
    profileId: INITIAL_PROFILE.id,
    profileName: 'Festive Tailored Profile',
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
  shirtLengthMm: 760,   // 76.0 cm (Standard shirt length)
  createdAt: '2026-10-11T12:00:00Z'
};

export const INITIAL_KURTA_BODY_MEASUREMENTS: BodyMeasurements = {
  ...INITIAL_BODY_MEASUREMENTS,
  id: '66666666-6666-6666-6666-000000000001',
  shirtLengthMm: 1020  // 102 cm (Authentic Kurta knee-length)
};
