import { NextRequest, NextResponse } from 'next/server'
import { AdminAuthError, requireAdminSession } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { z } from 'zod'

const categorySchema = z.object({
  name: z.string().min(2, 'Nome deve ter ao menos 2 caracteres').max(60),
})

export async function GET() {
  try {
    await requireAdminSession()
  } catch (e) {
    if (e instanceof AdminAuthError) {
      return NextResponse.json({ error: e.code }, { status: e.code === 'UNAUTHENTICATED' ? 401 : 403 })
    }
    throw e
  }

  const supabase = createAdminClient()
  const { data, error } = await supabase
    .from('categories')
    .select('id, name')
    .order('name', { ascending: true })

  if (error) {
    return NextResponse.json({ error: 'Erro ao buscar categorias' }, { status: 500 })
  }

  return NextResponse.json({ categories: data ?? [] })
}

export async function POST(request: NextRequest) {
  try {
    await requireAdminSession()
  } catch (e) {
    if (e instanceof AdminAuthError) {
      return NextResponse.json({ error: e.code }, { status: e.code === 'UNAUTHENTICATED' ? 401 : 403 })
    }
    throw e
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Corpo inválido' }, { status: 400 })
  }

  const parsed = categorySchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors.name?.[0] ?? 'Dados inválidos' }, { status: 422 })
  }

  const supabase = createAdminClient()

  // Gera slug a partir do nome
  const slug = parsed.data.name
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '')

  // Tenta inserir sem icon primeiro (caso a coluna não exista ou não aceite emoji)
  const insertPayload: Record<string, unknown> = { name: parsed.data.name, slug }

  // Verifica se a tabela tem coluna icon fazendo um select primeiro
  const { data, error } = await supabase
    .from('categories')
    .insert(insertPayload)
    .select('id, name')
    .single()

  if (error || !data) {
    console.error('Erro ao criar categoria — código:', error?.code, '— mensagem:', error?.message, '— detalhes:', error?.details)
    // Retorna o erro real do Supabase para facilitar diagnóstico
    return NextResponse.json({
      error: error?.message ?? 'Erro ao criar categoria',
      code: error?.code,
    }, { status: 500 })
  }

  return NextResponse.json({ category: data }, { status: 201 })
}
