import { NextRequest, NextResponse } from 'next/server'
import { AdminAuthError, requireAdminSession } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  try {
    await requireAdminSession()
  } catch (e) {
    if (e instanceof AdminAuthError) {
      return NextResponse.json({ error: e.code }, { status: e.code === 'UNAUTHENTICATED' ? 401 : 403 })
    }
    throw e
  }

  const { id: productId, imageId } = await params
  const supabase = createAdminClient()

  // Busca a imagem verificando que pertence ao produto correto
  const { data: image, error: fetchError } = await supabase
    .from('product_images')
    .select('id, url, product_id')
    .eq('id', imageId)
    .eq('product_id', productId)
    .single()

  if (fetchError || !image) {
    return NextResponse.json({ error: 'Imagem não encontrada' }, { status: 404 })
  }

  // Extrai o path do storage a partir da URL pública
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const prefix = `${supabaseUrl}/storage/v1/object/public/product-images/`
  const storagePath = image.url.startsWith(prefix) ? image.url.slice(prefix.length) : null

  // Remove do banco
  const { error: dbError } = await supabase
    .from('product_images')
    .delete()
    .eq('id', imageId)

  if (dbError) {
    return NextResponse.json({ error: 'Erro ao remover imagem' }, { status: 500 })
  }

  // Remove do storage (melhor esforço)
  if (storagePath) {
    await supabase.storage.from('product-images').remove([storagePath])
  }

  return NextResponse.json({ ok: true })
}
