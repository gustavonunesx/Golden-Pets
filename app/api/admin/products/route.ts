import { NextRequest, NextResponse } from 'next/server'
import { AdminAuthError, requireAdminSession } from '@/lib/admin-auth'
import { productSchema } from '@/lib/validations/product'
import { createAdminClient } from '@/lib/supabase/admin'

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
    .from('products')
    .select('*, categories(id, name)')
    .order('created_at', { ascending: false })

  if (error) {
    return NextResponse.json({ error: 'Erro ao buscar produtos' }, { status: 500 })
  }

  return NextResponse.json({ products: data ?? [] })
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

  const parsed = productSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Dados inválidos', details: parsed.error.flatten() }, { status: 422 })
  }

  const supabase = createAdminClient()

  // Verifica slug único
  const { data: existing } = await supabase
    .from('products')
    .select('id')
    .eq('slug', parsed.data.slug)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ error: 'Slug já está em uso' }, { status: 409 })
  }

  const { data, error } = await supabase
    .from('products')
    .insert({
      name: parsed.data.name,
      slug: parsed.data.slug,
      category_id: parsed.data.category_id,
      price: parsed.data.price,
      original_price: parsed.data.original_price ?? null,
      short_description: parsed.data.short_description,
      description: parsed.data.description,
      benefits: parsed.data.benefits,
      specs: parsed.data.specs,
      badge: parsed.data.badge ?? null,
      in_stock: parsed.data.in_stock,
      image_color: parsed.data.image_color.toLowerCase(),
      active: parsed.data.active,
    })
    .select('id, slug')
    .single()

  if (error || !data) {
    console.error('Erro ao criar produto — código:', error?.code, '— mensagem:', error?.message, '— detalhes:', error?.details, '— hint:', error?.hint)
    return NextResponse.json({
      error: error?.message ?? 'Erro ao criar produto',
      code: error?.code,
      details: error?.details,
      hint: error?.hint,
    }, { status: 500 })
  }

  return NextResponse.json({ product: data }, { status: 201 })
}
