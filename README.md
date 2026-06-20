# Wyze Bundle Builder

A production-quality multi-step security system bundle builder built with Next.js, TypeScript, Tailwind CSS, and Redux Toolkit.

## Run Instructions

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

```bash
# Build for production
npm run build
npm start
```

Requires Node.js 18+.

## Stack

- **Next.js 15** (App Router) — React framework
- **TypeScript** — static typing throughout
- **Tailwind CSS** — utility-first styling
- **Redux Toolkit** — state management (all cart/selection state lives in a single Redux slice)
- **Lucide React** — icons
- **localStorage** — client-side persistence for "Save my system for later"

## Architecture Decisions

**Data-driven from JSON.** All products, variants, prices, and step configuration live in [`src/data/products.json`](src/data/products.json). The UI renders entirely from that data — no per-product markup. Swapping in a real API endpoint would only touch the data-loading layer in `page.tsx`.

**Per-variant quantity tracking.** Each (productId, variantId) pair is its own `LineItem` in the Redux store. Switching color chips on a card changes which variant's count is displayed in the stepper, but other variants' counts are preserved. The review panel shows every variant with qty > 0 as its own line.

**Seeding and persistence.** On first load, items are seeded from `initialQty` fields in the JSON (matching the design's pre-populated state). On subsequent loads, the persisted localStorage state is restored. Clicking "Save my system for later" explicitly serialises the current store to localStorage under key `wyze_bundle_v2`.

**Sticky review panel.** On desktop the review panel is `position: sticky` so it stays in view while the user scrolls through steps. On mobile it collapses below the builder.

**Responsive layout.** Desktop: two-column (builder left, review right). Tablet: stacked. Mobile: single-column with the review panel below.

## Tradeoffs / What I'd Do With More Time

- **Real product images.** SVG placeholders stand in for the actual Wyze product photos. In production these would be hosted images or imported assets.
- **Backend API (bonus).** The spec called out a small backend as a bonus. With more time I'd add a Next.js Route Handler (`/api/products`) serving the JSON and add an optional flag in `page.tsx` to fetch from it rather than import statically.
- **Animations.** The accordion open/close would benefit from a smooth height transition (`overflow: hidden` + `max-height` animation or Framer Motion).
- **Error boundaries.** The client components don't have explicit error boundaries; adding them would improve resilience.
- **Variant image swap.** A nice-to-have: switching a color chip could update the card's product image to match the selected color.
- **Accessibility audit.** Basic ARIA labels are in place (stepper buttons, variant chips), but a full a11y pass (focus management on accordion open, live region for review panel updates) would be needed before production.
