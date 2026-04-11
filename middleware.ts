import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // ── 1. PRIMEIRA coisa: verifica se é rota admin ──────────────────────────
  //    Se não for, retorna imediatamente sem criar nada, sem verificar nada.
  //    Visitantes normais da loja nunca passam daqui.
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next()
  }

  // ── 2. Rota /admin confirmada — agora sim cria o client do Supabase ──────
  //    O client SÓ é criado aqui, nunca para rotas públicas.
  let response = NextResponse.next({
    request: { headers: request.headers },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // ── 3. Rota de login é a única exceção dentro de /admin ──────────────────
  //    Se já está na página de login, deixa passar para não criar loop.
  if (pathname === '/admin/login') {
    // Mas se já estiver logado como admin, redireciona para o dashboard
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      return NextResponse.redirect(new URL('/admin', request.url))
    }
    return response
  }

  // ── 4. Valida sessão com o servidor ──────────────────────────────────────
  //    getUser() é mais seguro que getSession() — valida o token no servidor
  //    do Supabase, não apenas lendo o cookie local.
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  // ── 5. Sem sessão válida → redireciona para login ────────────────────────
  if (authError || !user) {
    const loginUrl = new URL('/admin/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // ── 6. Sessão válida — verifica se é admin de verdade ────────────────────
  //    Usa service_role para burlar RLS e consultar admin_users.
  //    Essa chave NUNCA chega ao navegador — está apenas aqui no servidor.
  const supabaseAdmin = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
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

  // ── 7. Autenticado mas não é admin → 403 ─────────────────────────────────
  if (adminError || !adminRecord) {
    return NextResponse.redirect(new URL('/403', request.url))
  }

  // ── 8. É admin válido — injeta dados nos headers para o layout usar ───────
  //    O layout lê esses headers sem precisar fazer nova query ao banco.
  response.headers.set('x-admin-role', adminRecord.role)
  response.headers.set('x-user-id', user.id)

  return response
}

// ── Matcher: intercepta APENAS rotas /admin ──────────────────────────────────
//
//    ANTES (problema): interceptava tudo — qualquer erro nas envs ou no
//    Supabase quebrava o site inteiro para qualquer visitante.
//
//    AGORA (correto): só /admin/* é interceptado — a loja pública nunca
//    é afetada, independente do estado das variáveis de ambiente.
//
export const config = {
  matcher: ['/admin', '/admin/:path*'],
}