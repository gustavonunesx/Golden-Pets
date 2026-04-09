# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev      # Start local development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Lint with ESLint
```

No test suite is configured.

## Architecture

**Golden Pets** is a pet e-commerce marketing site built with Next.js App Router (React 19). The app is entirely static — all product and testimonial data is hardcoded in `/data`, with no backend or API calls.

### Routing & Pages

- `/` — Home page composed of section components in sequence
- `/produtos` — Full product catalog grid
- `/produto/[slug]` — Product detail with static generation via `generateStaticParams`

### Component Structure

- `components/sections/` — Large page-section components (Navbar, Hero, FeaturedProducts, ProductDetail, AuthModal, Footer, etc.). Most are `'use client'` for interactivity.
- `components/ui/` — shadcn/ui components plus custom ones (`product-card.tsx`, `product-image.tsx`, `custom-badge.tsx`, `custom-button.tsx`).

### Data & Types

- `data/products.ts` — 10 hardcoded products; each has a `slug`, `imageColor` (used for placeholder backgrounds), badge, price, category, and specs.
- `data/testimonials.ts` — 8 hardcoded testimonials.
- `types/index.ts` — TypeScript interfaces: `Product`, `Testimonial`, `Category`.

### Key Libraries

- **Framer Motion** — Animations throughout. Reusable variants (`fadeUp`, `scaleIn`, stagger, etc.) are centralized in `lib/animations.ts`.
- **shadcn/ui** (new-york style) — UI primitives via Radix UI + Tailwind. Components live in `components/ui/`.
- **react-hook-form + Zod** — Used in `AuthModal` for login/register form validation.
- **Tailwind CSS v4** — Primary styling. Brand color is orange (`#f97316`). CSS custom properties defined in `app/globals.css`.
- **next-themes** — Dark mode support (prepared but not actively used in UI).
- **@vercel/analytics** — Included in root layout.

### Utilities

- `lib/utils.ts` — `cn()` helper (clsx + tailwind-merge).
- `hooks/use-mobile.ts` — Detects mobile viewport at 768px breakpoint.

### Build Notes

`next.config.mjs` has `ignoreBuildErrors: true` for TypeScript and `unoptimized: true` for images — this is intentional; product images use colored SVG placeholders instead of real image files.
