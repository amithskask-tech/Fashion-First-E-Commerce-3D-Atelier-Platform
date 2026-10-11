# Custom Clothing Platform — V1 MVP

A full-stack, modular, zero-cost custom tailoring web application engineered for functional correctness, data integrity, and bespoke manufacturing workflows.

---

## 1. Key Capabilities

- **Module A (Customer Profiles & Auth)**: Multi-profile management, unit preferences (metric/imperial), and fit preferences (slim/regular/relaxed).
- **Module B (Body Measurement Engine)**: 11 canonical body measurements stored internally in integer millimetres and kilograms. Zod schema validation, precision conversion, and anatomical consistency checks.
- **Module C (3D Parametric Avatar)**: Decoupled anatomical mannequin viewer with proportional scaling derived from customer measurements and prominent disclosure.
- **Module D & E (Garment Catalog & Customization Engine)**: Declarative compatibility graph with auto-corrections (e.g. short sleeve forces clean hem cuff) and strict rejection of unfeasible combinations (e.g. French cuffs on short sleeves).
- **Module F (Real-Time 3D Garment Visualization)**: Three.js + React Three Fiber 3D shirt viewer mapping all collar styles, cuffs, sleeves, plackets, buttons, pockets, and hem cuts. Procedural PBR fabric textures for Poplin, Oxford, Twill, and Linen.
- **Module G (Size & Fit Engine)**: Calculates garment ease across fit preferences, compares measurements against standard grading tables (XS–XXL), and flags tailor fit warnings.
- **Module H (Server-Authoritative Pricing)**: Integer minor unit arithmetic (cents) with itemized line items and zero rounding error.
- **Module I (Design Confirmation)**: Pre-order manufacturing review showing full design specs, tailoring measurements comparison, size recommendation, and price breakdown.
- **Module J & K (Order & Production Specification Engine)**: Frozen JSON snapshot storage, pseudonymized cutting specs, Bill of Materials, step-by-step assembly guide, exportable JSON, printable tech packs, and lifecycle state machine.

---

## 2. Zero-Cost Offline Development Strategy

The platform operates **100% offline out-of-the-box** without requiring paid services, external 3D APIs, or cloud credentials:
- **Local Storage Adapter**: Implements the identical data contracts as PostgreSQL/Supabase.
- **Seed Data**: Pre-seeded with authentic fabrics, collar types, sleeve types, cuff types, grading tables, and test customer profiles.
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
# Run Vitest test suites (26 unit tests covering all core engines)
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
