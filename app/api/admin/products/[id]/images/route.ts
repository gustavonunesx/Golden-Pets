import { NextRequest, NextResponse } from 'next/server'
import { AdminAuthError, requireAdminSession } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'

const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB

export async function POST(
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
  const supabase = createAdminClient()

  // Verifica se produto existe
  const { data: product, error: productError } = await supabase
    .from('products')
    .select('id')
    .eq('id', productId)
    .single()

  if (productError || !product) {
    return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
  }

  let formData: FormData
  try {
    formData = await request.formData()
  } catch {
    return NextResponse.json({ error: 'FormData inválido' }, { status: 400 })
  }

  const file = formData.get('file')
  if (!file || !(file instanceof File)) {
    return NextResponse.json({ error: 'Arquivo não encontrado no campo "file"' }, { status: 400 })
  }

  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return NextResponse.json({ error: 'Tipo de arquivo não permitido. Use JPEG, PNG, WebP ou GIF.' }, { status: 415 })
  }

  if (file.size > MAX_SIZE_BYTES) {
    return NextResponse.json({ error: 'Arquivo muito grande. Máximo 5 MB.' }, { status: 413 })
  }

  const ext = file.type.split('/')[1].replace('jpeg', 'jpg')
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`
  const storagePath = `${productId}/${filename}`

  const arrayBuffer = await file.arrayBuffer()
  const buffer = new Uint8Array(arrayBuffer)

  const { error: uploadError } = await supabase.storage
    .from('product-images')
    .upload(storagePath, buffer, { contentType: file.type, upsert: false })

  if (uploadError) {
    console.error('Erro no upload:', uploadError)
    return NextResponse.json({ error: 'Erro ao fazer upload da imagem' }, { status: 500 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const publicUrl = `${supabaseUrl}/storage/v1/object/public/product-images/${storagePath}`

  // Determina a próxima posição
  const { data: lastImage } = await supabase
    .from('product_images')
    .select('position')
    .eq('product_id', productId)
    .order('position', { ascending: false })
    .limit(1)
    .maybeSingle()

  const nextPosition = lastImage ? lastImage.position + 1 : 0

  const { data: imageRecord, error: dbError } = await supabase
    .from('product_images')
    .insert({ product_id: productId, url: publicUrl, position: nextPosition })
    .select('id, url, position')
    .single()

  if (dbError || !imageRecord) {
    // Tenta remover o arquivo do storage se o DB falhou
    await supabase.storage.from('product-images').remove([storagePath])
    console.error('Erro ao salvar imagem no banco:', dbError)
    return NextResponse.json({ error: 'Erro ao salvar imagem' }, { status: 500 })
  }

  return NextResponse.json({ image: imageRecord }, { status: 201 })
}
