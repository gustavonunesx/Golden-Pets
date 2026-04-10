<div align="center">

# Golden Pets

**E-commerce moderno para produtos pet, feito com Next.js e Supabase**

[![Next.js](https://img.shields.io/badge/Next.js-16.2-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-Database%20%26%20Auth-3ECF8E?style=flat-square&logo=supabase)](https://supabase.com/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4-38BDF8?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)

</div>

---

## Sobre o Projeto

Golden Pets é uma loja virtual completa voltada para produtos pet, construída com as tecnologias mais modernas do ecossistema React. O projeto conta com vitrine de produtos, carrinho de compras persistente, autenticação de usuários e painel administrativo protegido.

### Funcionalidades

- 🛍️ **Catálogo de produtos** com página de detalhes e slugs amigáveis
- 🛒 **Carrinho de compras** persistente via Zustand + localStorage
- 🔐 **Autenticação** de clientes via Supabase Auth (modal de login/cadastro)
- 🖥️ **Painel Admin** protegido com gerenciamento de produtos, pedidos e clientes
- 💳 **Integração com MercadoPago** *(planejado)*
- 📧 **E-mails transacionais com Resend** *(planejado)*
- 📊 **Analytics** integrado via Vercel Analytics
- 🎨 Animações fluidas com **Framer Motion**
- 🌙 Suporte a **dark mode** (preparado)

---

## Como Iniciar

### Pré-requisitos

- [Node.js](https://nodejs.org/) 18+
- [pnpm](https://pnpm.io/) (recomendado) ou npm
- Conta no [Supabase](https://supabase.com/) *(opcional — o projeto funciona com dados locais de fallback)*

### 1. Clone o repositório

```bash
git clone https://github.com/seu-usuario/golden-pets.git
cd golden-pets
```

### 2. Instale as dependências

```bash
pnpm install
# ou
npm install
```

### 3. Configure as variáveis de ambiente

Crie um arquivo `.env.local` na raiz do projeto:

```env
# Públicas (expostas ao browser)
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_key

# MercadoPago (planejado)
NEXT_PUBLIC_MP_PUBLIC_KEY=sua_mp_public_key

# Secretas — NUNCA use NEXT_PUBLIC_ aqui
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key
MP_ACCESS_TOKEN=seu_mp_access_token
MP_WEBHOOK_SECRET=seu_webhook_secret
RESEND_API_KEY=sua_resend_api_key
```

> **Sem Supabase?** O projeto funciona normalmente com produtos e depoimentos hardcoded em `data/`. Configure o Supabase apenas quando quiser persistência real.

### 4. Inicie o servidor de desenvolvimento

```bash
pnpm dev
# ou
npm run dev
```

Acesse [http://localhost:3000](http://localhost:3000) no navegador.

---

## Estrutura do Projeto

```
golden-pets/
├── app/
│   ├── page.tsx                  # Home — vitrine com produtos em destaque
│   ├── produtos/                 # Catálogo completo
│   ├── produto/[slug]/           # Página de produto individual
│   └── admin/
│       ├── login/                # Login do admin
│       ├── 403/                  # Acesso negado
│       └── (protected)/          # Área protegida
│           ├── page.tsx          # Dashboard
│           ├── produtos/
│           ├── pedidos/
│           └── clientes/
├── components/
│   ├── sections/                 # Componentes de seção (Hero, Navbar, Footer…)
│   ├── admin/                    # Componentes do painel admin
│   └── ui/                      # Primitivos shadcn/ui + componentes custom
├── lib/
│   ├── queries/products.ts       # Queries server-side para produtos
│   ├── supabase/                 # Clientes Supabase (server, client, admin)
│   └── animations.ts             # Variantes Framer Motion reutilizáveis
├── stores/
│   └── cart-store.ts             # Estado do carrinho (Zustand)
├── data/
│   ├── products.ts               # Produtos de fallback (sem Supabase)
│   └── testimonials.ts           # Depoimentos hardcoded
└── types/
    └── index.ts                  # Interfaces TypeScript (Product, Category…)
```

---

## Scripts Disponíveis

| Comando | Descrição |
|---|---|
| `pnpm dev` | Inicia o servidor de desenvolvimento |
| `pnpm build` | Gera o build de produção |
| `pnpm start` | Inicia o servidor de produção |
| `pnpm lint` | Executa o ESLint no projeto |

---

## Banco de Dados (Supabase)

O projeto utiliza **8 tabelas** com RLS habilitado em todas:

| Tabela | Descrição |
|---|---|
| `categories` | Categorias de produtos |
| `products` | Catálogo de produtos (FK → categories) |
| `product_images` | Imagens dos produtos (CASCADE) |
| `customers` | Clientes (vinculados ao auth.users) |
| `addresses` | Endereços dos clientes (CASCADE) |
| `orders` | Pedidos (somente server via service_role) |
| `order_items` | Itens dos pedidos |
| `admin_users` | Usuários com acesso ao painel admin |

---

## Segurança

- `SUPABASE_SERVICE_ROLE_KEY` usada **somente no servidor** (middleware e API routes)
- Preços dos produtos sempre validados no servidor, nunca confiados do front-end
- Webhook do MercadoPago valida assinatura antes de processar
- Zod valida o corpo de todas as API routes que recebem dados do usuário
- `.env.local` está no `.gitignore`

---

## Tecnologias

| Categoria | Tecnologia |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19 + shadcn/ui + Radix UI |
| Estilo | Tailwind CSS v4 |
| Animações | Framer Motion |
| Estado | Zustand |
| Backend/Auth | Supabase |
| Formulários | React Hook Form + Zod |
| Pagamentos | MercadoPago *(planejado)* |
| E-mail | Resend *(planejado)* |
| Analytics | Vercel Analytics |

---

## Licença

Este projeto é privado e de uso pessoal/comercial do autor.

---

<div align="center">

</div>
