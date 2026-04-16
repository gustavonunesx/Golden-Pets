import { NextRequest, NextResponse } from 'next/server'
import { AdminAuthError, requireAdminSession } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'
import { z } from 'zod'

const reorderSchema = z.object({
  order: z.array(z.string().uuid()).min(1),
})

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

  const { id: productId } = await params

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Corpo inválido' }, { status: 400 })
  }

  const parsed = reorderSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 422 })
  }

  const supabase = createAdminClient()

  // UPDATE individual por imagem — evita upsert que exigiria todos os campos NOT NULL
  const results = await Promise.all(
    parsed.data.order.map((imageId, index) =>
      supabase
        .from('product_images')
        .update({ position: index })
        .eq('id', imageId)
        .eq('product_id', productId) // garante que a imagem pertence ao produto
    )
  )

  const failed = results.find(r => r.error)
  if (failed?.error) {
    console.error('Erro ao reordenar imagens:', failed.error)
    return NextResponse.json({ error: failed.error.message }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
