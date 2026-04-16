import { NextRequest, NextResponse } from 'next/server'
import { AdminAuthError, requireAdminSession } from '@/lib/admin-auth'
import { productSchema } from '@/lib/validations/product'
import { createAdminClient } from '@/lib/supabase/admin'

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminSession()
  } catch (e) {
    if (e instanceof AdminAuthError) {
      return NextResponse.json({ error: e.code }, { status: e.code === 'UNAUTHENTICATED' ? 401 : 403 })
    }
    throw e
  }

  const { id } = await params
  const supabase = createAdminClient()

  const [productResult, imagesResult] = await Promise.all([
    supabase.from('products').select('*, categories(id, name)').eq('id', id).single(),
    supabase.from('product_images').select('*').eq('product_id', id).order('position', { ascending: true }),
  ])

  if (productResult.error || !productResult.data) {
    return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
  }

  return NextResponse.json({
    product: {
      ...productResult.data,
      images: imagesResult.data ?? [],
    },
  })
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminSession()
  } catch (e) {
    if (e instanceof AdminAuthError) {
      return NextResponse.json({ error: e.code }, { status: e.code === 'UNAUTHENTICATED' ? 401 : 403 })
    }
    throw e
  }

  const { id } = await params

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

  // Verifica slug único excluindo o próprio produto
  const { data: existing } = await supabase
    .from('products')
    .select('id')
    .eq('slug', parsed.data.slug)
    .neq('id', id)
    .maybeSingle()

  if (existing) {
    return NextResponse.json({ error: 'Slug já está em uso' }, { status: 409 })
  }

  const { error } = await supabase
    .from('products')
    .update({
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
    .eq('id', id)

  if (error) {
    console.error('Erro ao atualizar produto:', error)
    return NextResponse.json({ error: 'Erro ao atualizar produto' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await requireAdminSession()
  } catch (e) {
    if (e instanceof AdminAuthError) {
      return NextResponse.json({ error: e.code }, { status: e.code === 'UNAUTHENTICATED' ? 401 : 403 })
    }
    throw e
  }

  const { id } = await params
  const supabase = createAdminClient()

  // Soft delete: preserva histórico de pedidos
  const { error } = await supabase
    .from('products')
    .update({ active: false })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: 'Erro ao desativar produto' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
