# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Instruções para o Claude

**IMPORTANTE:** Sempre que fizer qualquer alteração no projeto — criar arquivos, mover rotas, instalar dependências, refatorar componentes, alterar arquitetura — atualize este CLAUDE.md na mesma sessão, antes de terminar a resposta. Não espere o usuário pedir. As seções a verificar/atualizar são: Routing & Pages, Component Structure, Key Libraries, Utilities, Build Notes e qualquer seção afetada pela mudança.

## Commands

```bash
npm run dev      # Start local development server
npm run build    # Production build
npm run start    # Start production server
npm run lint     # Lint with ESLint
```

No test suite is configured.

## Architecture

**Golden Pets** is a pet e-commerce built with Next.js App Router (React 19), backed by Supabase (database + auth) with MercadoPago payment integration planned.

### Database (Supabase)

8 tables with RLS enabled on all:

| Table | Dependencies | RLS Policy |
|-------|-------------|------------|
| `categories` | none | SELECT public |
| `products` | FK → categories | SELECT public |
| `product_images` | FK → products (CASCADE) | SELECT public |
| `customers` | FK → auth.users | owner only (auth.uid() = id) |
| `addresses` | FK → customers (CASCADE) | owner only |
| `orders` | FK → customers, addresses | no client policy (server only via service_role) |
| `order_items` | FK → orders, products | no client policy (server only via service_role) |
| `admin_users` | FK → auth.users | admin reads own record only |

### Authentication & Admin Protection

- **Middleware** (`middleware.ts`): Intercepts all routes. For `/admin/*` (except `/admin/login` and `/403`): validates session with `supabase.auth.getUser()`, checks `admin_users` table via service_role, injects `x-admin-role` and `x-user-id` headers for Server Components.
- **Admin Login** (`app/admin/login/page.tsx`): Email/password via `signInWithPassword()`, verifies admin_users record, logout if not admin. `useSearchParams` wrapped in `Suspense` to allow static prerender.
- **Admin Layout** (`app/admin/(protected)/layout.tsx`): Reads injected headers, redirects to login if missing. Only applies to protected pages — login and 403 are outside this layout.
- **AdminSidebar** (`components/admin/AdminSidebar.tsx`): Navigation (Dashboard, Produtos, Pedidos, Clientes) + logout.
- **403 Page** (`app/admin/403/page.tsx`): Shown when authenticated but not admin.

### Supabase Client Utilities

- `lib/supabase/server.ts` — Server Components and Route Handlers (uses `cookies()` from next/headers)
- `lib/supabase/client.ts` — Client Components (singleton `createBrowserClient`)
- `lib/supabase/middleware.ts` — Middleware-specific helper (receives request, returns `{supabase, response}`)
- `lib/supabase/admin.ts` — Service-role client (server-only, bypasses RLS)

### Routing & Pages

- `/` — Home page (server component, fetches featured products via `getFeaturedProducts()`)
- `/produtos` — Product catalog (server component, fetches via `getProducts()`)
- `/produto/[slug]` — Product detail (server component, fetches via `getProductBySlug()`)
- `/admin/login` — Admin login (public, outside protected layout)
- `/admin/403` — Forbidden access page (public, outside protected layout)
- `/admin` — Admin dashboard (protected via `(protected)` route group)
- `/admin/produtos` — Product management (protected)
- `/admin/pedidos` — Order management (protected)
- `/admin/clientes` — Customer management (protected)

#### Admin Route Structure

```
app/admin/
├── login/page.tsx          ← sem layout admin, acesso livre
├── 403/page.tsx            ← sem layout admin, acesso livre
└── (protected)/
    ├── layout.tsx          ← verifica x-admin-role header, renderiza sidebar
    ├── page.tsx            ← dashboard
    ├── produtos/page.tsx
    ├── pedidos/page.tsx
    └── clientes/page.tsx
```

### Cart System

- `stores/cart-store.ts` — Zustand store with `persist` middleware (localStorage key: `golden-pets-cart`). Use `skipHydration: true` + `useCartStore.persist.rehydrate()` in `useEffect` to avoid SSR mismatch.
- `components/sections/CartDrawer.tsx` — Slide-out drawer (shadcn Sheet) with item list, quantity controls, total, and checkout button.
- `components/ui/cart-button.tsx` — Navbar button with animated badge showing item count.
- Cart is integrated in `Navbar` (desktop + mobile) and `ProductDetail` ("Adicionar ao carrinho" / "Comprar agora").

### Product Data Layer

- `lib/queries/products.ts` — Server-side query functions: `getProducts()`, `getProductBySlug()`, `getProductsByCategory()`, `getFeaturedProducts()`. Each falls back to hardcoded `data/products.ts` if Supabase is unreachable or returns empty.
- `data/products.ts` — 10 hardcoded products kept as fallback. Being migrated to Supabase.

### Component Structure

- `components/sections/` — Large page-section components (Navbar, Hero, FeaturedProducts, ProductDetail, AuthModal, CartDrawer, Footer, etc.). Most are `'use client'` for interactivity.
- `components/admin/` — Admin panel components (AdminSidebar).
- `components/ui/` — shadcn/ui components plus custom ones (`product-card.tsx`, `product-image.tsx`, `custom-badge.tsx`, `custom-button.tsx`, `cart-button.tsx`).

### Data & Types

- `data/products.ts` — 10 hardcoded products (fallback when Supabase is not configured).
- `data/testimonials.ts` — 8 hardcoded testimonials.
- `types/index.ts` — TypeScript interfaces: `Product`, `Testimonial`, `Category`.

### Key Libraries

- **Framer Motion** — Animations throughout. Reusable variants centralized in `lib/animations.ts`.
- **shadcn/ui** (new-york style) — UI primitives via Radix UI + Tailwind.
- **react-hook-form + Zod** — Form validation.
- **Tailwind CSS v4** — Primary styling. Brand color is orange (`#f97316`).
- **@supabase/ssr + @supabase/supabase-js** — Database and auth.
- **next-themes** — Dark mode support (prepared but not actively used).
- **@vercel/analytics** — Included in root layout.
- **Zustand** — Cart state management with localStorage persistence.
- **MercadoPago SDK** — Payment processing (planned).
- **Resend** — Transactional emails (planned).

### Utilities

- `lib/utils.ts` — `cn()` helper (clsx + tailwind-merge).
- `hooks/use-mobile.ts` — Detects mobile viewport at 768px breakpoint.

### Environment Variables

```
# Public (browser)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_MP_PUBLIC_KEY=

# Secret (server only — NEVER with NEXT_PUBLIC_)
SUPABASE_SERVICE_ROLE_KEY=
MP_ACCESS_TOKEN=
MP_WEBHOOK_SECRET=
RESEND_API_KEY=
```

### Security Rules

- `SUPABASE_SERVICE_ROLE_KEY` used only in server context (middleware, API routes), never exposed to client.
- Product prices always fetched from database inside API routes, never trusted from front-end.
- MercadoPago webhook validates signature before processing.
- Zod validates the body of all API routes that receive user data.
- `.env.local` is in `.gitignore`.

### Build Notes

`next.config.mjs` has `ignoreBuildErrors: true` for TypeScript and `unoptimized: true` for images — this is intentional; product images use colored SVG placeholders instead of real image files.
