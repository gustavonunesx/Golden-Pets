import { createClient } from '@/lib/supabase/middleware'
import { createAdminClient } from '@/lib/supabase/admin'
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

  // ── 1. Cria o client do Supabase com suporte a cookies (SSR) ─────────────
  const { supabase, response } = createClient(request)

  // ── 2. Verifica se a rota atual é uma rota de admin ──────────────────────
  const isAdminRoute = pathname.startsWith(ADMIN_ROUTES)
  const isAdminPublic = pathname === '/admin/login' || pathname === '/403'

  // ── 3. Se não for rota admin, ou for página pública do admin, deixa passar
  if (!isAdminRoute || isAdminPublic) {
    return response
  }

  // ── 4. Rota admin detectada — verifica a sessão do usuário ───────────────
  //    getUser() é mais seguro que getSession() pois valida com o servidor
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  // ── 5. Sem usuário logado → redireciona para o login ─────────────────────
  if (authError || !user) {
    const loginUrl = new URL('/admin/login', request.url)
    // Salva a URL original para redirecionar de volta após o login
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // ── 6. Usuário logado, mas precisa verificar se é ADMIN ──────────────────
  //    Usamos a service_role key aqui para burlar o RLS e consultar admin_users
  //    ATENÇÃO: essa key nunca vai para o navegador — está só no servidor
  const supabaseAdmin = createAdminClient()

  const { data: adminRecord, error: adminError } = await supabaseAdmin
    .from('admin_users')
    .select('id, role')
    .eq('id', user.id)
    .single()

  // ── 7. Usuário autenticado mas NÃO é admin → redireciona para 403 ────────
  if (adminError || !adminRecord) {
    const forbiddenUrl = new URL('/403', request.url)
    return NextResponse.redirect(forbiddenUrl)
  }

  // ── 8. É admin: injeta o role no header para as Server Components usarem ─
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
