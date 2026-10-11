# AURA ETHNICS — Indian Fashion-First E-Commerce & 3D Atelier Platform

A full-stack, modular, zero-cost Indian fashion clothing e-commerce web application engineered for authentic regional textiles, ready-to-wear shopping, real-time 3D made-to-measure customization, and master-tailor manufacturing specifications.

---

## 1. Key Capabilities

- **Indian Fashion-First Catalog**:
  - Authentic product categories: Kurtas & Sets, Royal Nehru Jackets, Kasavu Mundu & Veshti Sets, Women's Kurtis, and Western Shirts.
  - Multi-dimensional filters: Gender (Men, Women, Unisex), Occasion (Festive, Wedding, Ceremony, Everyday), Region (Kerala, Uttar Pradesh, Madhya Pradesh, Gujarat, Western), and full-text search.
  - Unified commerce model: Shop ready-made off-the-rack (SKUs, inventory, XS–XXL) or launch interactive 3D Made-to-Measure customization from any product card.
- **Unified Slide-Over Cart & Checkout Drawer**:
  - Single cart containing both ready-made sizes and bespoke made-to-measure designs with personal tailoring measurements.
  - Minor currency units integer arithmetic (INR paise / USD cents) with zero rounding error.
  - Transparent dispatch timelines (ready-made 24–48h vs bespoke 7–10 days).
- **Module B (Body Measurement & Fit Engine)**:
  - 11 canonical body measurements stored in integer millimetres and kilograms. Zod schema validation, unit conversions, and anatomical consistency checks accommodating knee-length Kurtas (up to 65% height).
- **Module C (3D Parametric Avatar)**:
  - Anatomical mannequin viewer with proportional scaling derived from customer measurements and prominent disclosure.
- **Module D & E (Customization Compatibility Engine)**:
  - Declarative compatibility graph with auto-corrections and strict rejection of unfeasible combinations across Indian Kurtas and Western shirts.
- **Module F (Real-Time 3D Garment Visualization & Procedural Weaves)**:
  - Dynamic garment rendering:
    - **Men's Kurta 3D (`KurtaModel3D`)**: Knee-length tunic, authentic side slit cuts (Chak), standing Mandarin/Nehru collars, front Kurta Patti placket, artisanal buttons (Brass, Carved Wood, Hand Fabric Potli), and 45mm Kerala Kasavu metallic gold zari borders.
    - **Western Dress Shirt 3D (`ShirtModel3D`)**: Tailored dress shirts with spread/band collars, barrel/French cuffs, and plackets.
  - Procedural PBR CanvasTexture generators: Kerala Kasavu woven gold zari with temple motifs, Chanderi raw silk with natural slubs, organic Gujarat Khadi, Lucknowi tone-on-tone Chikankari, and classic Poplin/Oxford/Twill.
- **Module G (Size & Fit Engine)**:
  - Garment ease rules: Indian Kurta cultural drape ease (+130mm chest, +140mm waist, +160mm hip for sitting comfort and side slit movement) vs Western shirt ease.
  - Standard grading chart recommendation for both Kurta and Shirt tables.
- **Module H (Server-Authoritative Pricing)**:
  - Integer minor unit arithmetic in INR paise (₹) and USD cents ($) with zero rounding error.
- **Module J & K (Master Tailor Production Specification & Tech Pack)**:
  - Generates immutable tailoring specs with 320mm side slit depth, 280mm kurta patti placket dimensions, Kasavu zari border specifications, Bill of Materials, and cutting dimensions.

---

## 2. Zero-Cost Offline Development Strategy

The platform operates **100% offline out-of-the-box** without requiring paid services, external 3D APIs, or cloud credentials:
- **Local Storage Adapter**: Implements identical data contracts as PostgreSQL/Supabase.
- **Seed Data**: Pre-seeded with authentic Indian garments, handloom fabrics, customization options, grading charts, and customer profiles.
- **Procedural PBR Textures**: Generates fabric weave textures in-browser with zero external asset downloads.

---

## 3. Quick Start & Local Development

### Prerequisites
- Node.js `v20.16.0` or higher
- npm `10.8.1` or higher

### Installation & Running Locally
```bash
# 1. Install dependencies
npm install

# 2. Start local development server
npm run dev

# 3. Open in browser
# http://localhost:5173
```

### Running Automated Test Suite
```bash
# Run Vitest test suites (33 unit tests covering all core engines)
npm test

# Run Vitest in watch mode
npm run test:watch
```

### Production Build & Type Checking
```bash
npm run build
```

---

## 4. Supabase Cloud Configuration (Optional)

When ready to connect to a live Supabase PostgreSQL database:

1. Create a free project at [supabase.com](https://supabase.com).
2. Copy `.env.example` to `.env`:
   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-public-key
   VITE_APP_ENV=production
   ```
3. Apply SQL migrations located in `supabase/migrations/` in sequential order:
   - `20261011000001_initial_core_schema.sql`
   - `20261011000002_garments_and_customization.sql`
   - `20261011000003_sizing_and_pricing.sql`
   - `20261011000004_orders_and_production.sql`
   - `20261011000005_row_level_security.sql`
   - `20261011000006_order_checkout_function.sql`
4. Run `supabase/seed.sql` to populate the catalog.

---

## 5. Tailoring Standards & Engineering Assumptions

| Dimension | Specification | Notes |
| :--- | :--- | :--- |
| **Length Units** | Millimetres (`INTEGER`) | Eliminates floating-point rounding errors |
| **Weight Units** | Kilograms (`NUMERIC(5,2)`) | Stored canonically; converted on display |
| **Monetary Units** | Minor units / Cents (`INTEGER`) | e.g. `$119.00 = 11900` |
| **Seam Allowance** | $12\text{ mm}$ ($1/2"$) | Standard luxury shirt single-needle seam |
| **Hem Allowance** | $25\text{ mm}$ ($1"$) | Folded hem allowance |
| **Cutting Tolerance** | $\pm 8\text{ mm}$ | Documented tailoring cutting tolerance |
| **Avatar Disclosure** | Stylized mannequin | Proportion indicator; not a photogrammetric scan |

---

## 6. Directory Structure

```
├── public/                     # Static assets
├── src/
│   ├── modules/
│   │   ├── avatar/             # 3D Avatar mannequin viewer
│   │   ├── customization/      # Compatibility rules & customizer UI
│   │   ├── designs/            # Design review & confirmation modal
│   │   ├── measurements/       # Measurement engine, Zod validator, units
│   │   ├── orders/             # Order tracking, FSM & Tech Pack view
│   │   ├── pricing/            # Server-authoritative integer pricing
│   │   ├── production/         # Production specification generator
│   │   ├── sizing/             # Garment ease & size recommendation
│   │   └── visualization/      # 3D Three.js canvas & procedural PBR model
│   ├── lib/
│   │   ├── storage/            # Unified repository & seed mock data
│   │   └── supabase/           # Supabase client wrapper
│   ├── types/                  # Typed TypeScript data contracts
│   ├── tests/                  # Vitest test setup
│   ├── App.tsx                 # Application shell & orchestration
│   ├── main.tsx                # React entry point
│   └── index.css               # Tailwind CSS directives & base styles
├── supabase/
│   ├── migrations/             # 6 production-ready PostgreSQL migrations
│   └── seed.sql                # Complete initial catalog and rules seed
├── tailwind.config.js          # Tailwind CSS styling configuration
├── vite.config.ts              # Vite & Vitest configuration
└── package.json                # Dependencies & scripts
```
