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

  // Atualiza todas as posições em uma única chamada upsert
  const updates = parsed.data.order.map((imageId, index) => ({
    id: imageId,
    product_id: productId,
    position: index,
  }))

  const { error } = await supabase
    .from('product_images')
    .upsert(updates, { onConflict: 'id' })

  if (error) {
    console.error('Erro ao reordenar imagens:', error)
    return NextResponse.json({ error: 'Erro ao reordenar imagens' }, { status: 500 })
  }

  return NextResponse.json({ ok: true })
}
