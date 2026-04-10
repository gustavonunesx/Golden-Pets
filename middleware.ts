import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

// ─── Rotas que exigem estar LOGADO como admin ───────────────────────────────
const ADMIN_ROUTES = '/admin'

// ─── Rotas públicas que NÃO precisam de nenhuma verificação ─────────────────
const PUBLIC_ROUTES = [
  '/',
  '/produtos',
  '/produto',
  '/contato',
  '/sobre',
  '/politica-de-privacidade',
  '/termos-de-uso',
  '/trocas-e-devolucoes',
  '/pedido/sucesso',
  '/api/checkout',
  '/api/webhook',
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── 1. Cria a response base que pode ser modificada ──────────────────────
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // ── 2. Cria o client do Supabase com suporte a cookies (SSR) ─────────────
  //    Necessário para o middleware conseguir ler a sessão do usuário
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // Atualiza os cookies tanto na request quanto na response
          // Isso é necessário para renovar o token de sessão automaticamente
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // ── 3. Verifica se a rota atual é uma rota de admin ──────────────────────
  const isAdminRoute = pathname.startsWith(ADMIN_ROUTES)

  // ── 4. Se não for rota admin, deixa passar sem verificação ───────────────
  if (!isAdminRoute) {
    return response
  }

  // ── 5. Rota admin detectada — verifica a sessão do usuário ───────────────
  //    getUser() é mais seguro que getSession() pois valida com o servidor
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  // ── 6. Sem usuário logado → redireciona para o login ─────────────────────
  if (authError || !user) {
    const loginUrl = new URL('/admin/login', request.url)
    // Salva a URL original para redirecionar de volta após o login
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // ── 7. Usuário logado, mas precisa verificar se é ADMIN ──────────────────
  //    Usamos a service_role key aqui para burlar o RLS e consultar admin_users
  //    ATENÇÃO: essa key nunca vai para o navegador — está só no servidor
  const supabaseAdmin = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: adminRecord, error: adminError } = await supabaseAdmin
    .from('admin_users')
    .select('id, role')
    .eq('id', user.id)
    .single()

  // ── 8. Usuário autenticado mas NÃO é admin → redireciona para 403 ────────
  if (adminError || !adminRecord) {
    const forbiddenUrl = new URL('/403', request.url)
    return NextResponse.redirect(forbiddenUrl)
  }

  // ── 9. É admin: injeta o role no header para as Server Components usarem ─
  //    Assim as páginas sabem o role sem precisar fazer nova query
  response.headers.set('x-admin-role', adminRecord.role)
  response.headers.set('x-user-id', user.id)

  return response
}

// ── Configuração do matcher ──────────────────────────────────────────────────
// Define QUAIS rotas o middleware vai interceptar
// Exclui arquivos estáticos e assets para não impactar performance
export const config = {
  matcher: [
    /*
     * Intercepta tudo EXCETO:
     * - _next/static  → arquivos JS/CSS buildados
     * - _next/image   → imagens otimizadas pelo Next.js
     * - favicon.ico   → ícone do site
     * - arquivos com extensão (png, jpg, svg, etc.)
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}