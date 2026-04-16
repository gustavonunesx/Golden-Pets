# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Instruções para o Claude

**IMPORTANTE:** Quando o que o usuário requisitou estiver funcionando corretamente e sem erros, **sempre pergunte** se ele quer atualizar o CLAUDE.md antes de encerrar. Não atualize o arquivo durante o desenvolvimento (enquanto há erros ou ajustes em andamento) — espere tudo estar funcionando e então pergunte. As seções a verificar/atualizar são: Routing & Pages, Component Structure, Key Libraries, Utilities, Build Notes e qualquer seção afetada pela mudança.

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
- `/checkout` — Checkout form (client component, react-hook-form + Zod, auto-fills address via ViaCEP API)
- `/pedido/sucesso` — Order confirmation page (receives `?order=<id>&status=pending` params)

#### Admin Route Structure

```
app/admin/
├── login/page.tsx                         ← sem layout admin, acesso livre
├── 403/page.tsx                           ← sem layout admin, acesso livre
└── (protected)/
    ├── layout.tsx                         ← verifica x-admin-role header, renderiza sidebar
    ├── page.tsx                           ← dashboard
    ├── produtos/
    │   ├── page.tsx                       ← lista produtos via createAdminClient()
    │   ├── novo/page.tsx                  ← busca categorias, renderiza ProductForm mode="create"
    │   └── [id]/page.tsx                  ← busca produto+imagens+categorias, renderiza ImageUploader + ProductForm mode="edit"
    ├── pedidos/page.tsx
    └── clientes/page.tsx
```

#### Admin API Routes

```
app/api/admin/
├── categories/route.ts                    ← GET lista, POST criar (auto-slug do nome)
└── products/
    ├── route.ts                           ← GET lista, POST criar (valida slug único)
    └── [id]/
        ├── route.ts                       ← GET um, PUT editar, DELETE (soft: active=false)
        ├── toggle-active/route.ts         ← PATCH alterna active true/false
        └── images/
            ├── route.ts                   ← POST upload (FormData → Storage → product_images)
            ├── [imageId]/route.ts         ← DELETE imagem (remove Storage + DB)
            └── reorder/route.ts           ← PUT reordenar (array de IDs → UPDATE individual por posição)
```

Todas as routes de admin chamam `requireAdminSession()` (de `lib/admin-auth.ts`) no início — retorna 401 se sem sessão, 403 se não for admin.

### Cart System

- `stores/cart-store.ts` — Zustand store with `persist` middleware (localStorage key: `golden-pets-cart`). Use `skipHydration: true` + `useCartStore.persist.rehydrate()` in `useEffect` to avoid SSR mismatch. `CartItem` has `imageUrl?: string` — shows product photo in drawer/checkout when available, falls back to `imageColor`.
- `components/sections/CartDrawer.tsx` — Slide-out drawer (shadcn Sheet) with item list (shows `<img>` if `imageUrl` present, else color placeholder), quantity controls, total, and checkout button.
- `components/ui/cart-button.tsx` — Navbar button with animated badge showing item count.
- Cart is integrated in `Navbar` (desktop + mobile) and `ProductDetail` ("Adicionar ao carrinho" / "Comprar agora"). `ProductDetail` passes `imageUrl: product.images?.[0]?.url` on `addItem`.

### Checkout & Payments

- `lib/validations/checkout.ts` — Zod schemas: `customerSchema`, `addressSchema`, `checkoutSchema`. Input: name, email, phone (digits only), CPF (11 digits), full address.
- `lib/mercadopago.ts` — Lazy-initialized MercadoPago client. `getPreferenceClient()` creates Preference, `getPaymentClient()` fetches payment details for webhooks.
- `app/checkout/page.tsx` — Client component form. Auto-fills address on CEP input via ViaCEP API. Submits to `/api/checkout`, redirects to `initPoint` URL on success.
- `app/api/checkout/route.ts` — POST: validates with Zod, fetches prices from DB (never trusts frontend), creates customer/address/order/order_items in Supabase via service_role, creates MP Preference, returns `{ orderId, initPoint }`.
- `app/api/webhook/mercadopago/route.ts` — POST: validates HMAC-SHA256 signature (`MP_WEBHOOK_SECRET`), fetches payment from MP API, maps status to internal status, updates `orders` table.
- `app/pedido/sucesso/page.tsx` — Confirmation page, reads `?order` and `?status` params. Shows green checkmark for approved, orange clock for pending.

#### Database column mapping (real column names differ from intuitive names)

| Code field | DB column | Table |
|---|---|---|
| `customerInput.name` | `full_name` | customers |
| `addressInput.zip_code` | `cep` | addresses |
| `totalAmount` | `total` | orders |
| `i.total_price` | `subtotal` | order_items |

#### Schema requirements

```sql
-- customers: remove FK to auth.users (guest checkout) + add UUID default
ALTER TABLE customers DROP CONSTRAINT customers_id_fkey;
ALTER TABLE customers ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- orders: add payment columns if missing
ALTER TABLE orders
  ADD COLUMN IF NOT EXISTS payment_id text,
  ADD COLUMN IF NOT EXISTS payment_status text NOT NULL DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS paid_at timestamptz;
```

#### Localhost behavior
`auto_return: 'approved'` is disabled on localhost (MP rejects it without HTTPS). After paying in test mode, user must click "Voltar ao site" manually. In production with HTTPS it redirects automatically.

### Product Data Layer

- `lib/queries/products.ts` — Server-side query functions: `getProducts()`, `getProductBySlug()`, `getProductsByCategory()`, `getFeaturedProducts()`. Each falls back to hardcoded `data/products.ts` if Supabase is unreachable or returns empty. **Importante:** imagens são buscadas em query separada via `attachImages()` (não como join aninhado) para evitar referência circular no RLS de `product_images`.
- `data/products.ts` — 10 hardcoded products kept as fallback. Being migrated to Supabase.
- `app/produto/[slug]/page.tsx` — tem `export const revalidate = 60` (ISR de 60s).

### Component Structure

- `components/sections/` — Large page-section components (Navbar, Hero, FeaturedProducts, ProductDetail, AuthModal, CartDrawer, Footer, etc.). Most are `'use client'` for interactivity. `ProductDetail` exibe galeria de imagens com troca de imagem principal quando `product.images` existir.
- `components/admin/` — Admin panel components:
  - `AdminSidebar.tsx` — navegação + logout
  - `produtos/ProductForm.tsx` — form completo (react-hook-form + zodResolver); suporta mode="create" e mode="edit"; criação de categoria inline
  - `produtos/ImageUploader.tsx` — upload (POST FormData), drag-to-reorder (PUT reorder), delete por imagem; badge "CAPA" na primeira imagem
  - `produtos/ProductsTable.tsx` — tabela com ações (editar, toggle active, deletar)
  - `produtos/ToggleActiveButton.tsx` — botão PATCH com UI otimista
  - `produtos/DeleteProductDialog.tsx` — modal de confirmação de soft-delete
- `components/ui/` — shadcn/ui components plus custom ones (`product-card.tsx`, `product-image.tsx`, `custom-badge.tsx`, `custom-button.tsx`, `cart-button.tsx`). `product-image.tsx` aceita prop `src?`: quando presente renderiza `<img>`, senão exibe SVG paw print colorido.

### Data & Types

- `data/products.ts` — 10 hardcoded products (fallback when Supabase is not configured).
- `data/testimonials.ts` — 8 hardcoded testimonials.
- `types/index.ts` — TypeScript interfaces: `Product`, `ProductImage`, `Testimonial`, `Category`. `Product` tem campo `images?: ProductImage[]`. `ProductImage` tem `id, product_id, url, position, alt_text?, created_at?` — nota: `created_at` é opcional pois a tabela pode não ter essa coluna.

### Key Libraries

- **Framer Motion** — Animations throughout. Reusable variants centralized in `lib/animations.ts`.
- **shadcn/ui** (new-york style) — UI primitives via Radix UI + Tailwind.
- **react-hook-form + Zod** — Form validation.
- **Tailwind CSS v4** — Primary styling. Brand color is orange (`#f97316`).
- **@supabase/ssr + @supabase/supabase-js** — Database and auth.
- **next-themes** — Dark mode support (prepared but not actively used).
- **@vercel/analytics** — Included in root layout.
- **Zustand** — Cart state management with localStorage persistence.
- **MercadoPago SDK** — Payment processing. `getPreferenceClient()` / `getPaymentClient()` in `lib/mercadopago.ts`.
- **Resend** — Transactional emails (planned).

### Utilities

- `lib/utils.ts` — `cn()` helper (clsx + tailwind-merge).
- `lib/admin-auth.ts` — `requireAdminSession()`: valida sessão Supabase + membership em `admin_users`; lança `AdminAuthError('UNAUTHENTICATED' | 'FORBIDDEN')` usado em todas as API routes de admin.
- `lib/validations/checkout.ts` — Zod schemas for checkout form.
- `lib/validations/product.ts` — Zod schema do produto (`productSchema`), compartilhado entre API e ProductForm.
- `lib/mercadopago.ts` — MercadoPago SDK wrapper.
- `hooks/use-mobile.ts` — Detects mobile viewport at 768px breakpoint.

### Environment Variables

```
# Public (browser)
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_MP_PUBLIC_KEY=
NEXT_PUBLIC_SITE_URL=        # ex: https://goldenpets.com.br (used in checkout back_urls)

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

`next.config.mjs` has `ignoreBuildErrors: true` for TypeScript and `unoptimized: true` for images — this is intentional. Product images são servidas do Supabase Storage (URLs públicas) e exibidas via `<img>` nativo; o SVG colorido é apenas fallback quando não há imagem cadastrada.

### Product Image Upload Flow

```
Admin seleciona arquivo (max 5MB, JPEG/PNG/WebP/GIF)
  → POST /api/admin/products/[id]/images  (FormData)
      1. requireAdminSession()
      2. Valida MIME + tamanho server-side
      3. createAdminClient() (service_role)
      4. Storage.upload → bucket "product-images" (público)
         path: {productId}/{timestamp}-{random}.{ext}
      5. URL pública: {SUPABASE_URL}/storage/v1/object/public/product-images/{path}
      6. INSERT product_images (product_id, url, position = MAX+1)
      7. Retorna { image: { id, url, position } }
  → ImageUploader appenda imagem no estado local
```

**Soft delete de produto**: `active=false` (preserva histórico de pedidos). Imagens do produto permanecem no Storage.

**Reordenar imagens**: UPDATE individual por imagem via `Promise.all` — NÃO usar upsert (exigiria todos os campos NOT NULL incluindo `url`).
