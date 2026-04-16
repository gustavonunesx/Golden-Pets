import { NextRequest, NextResponse } from 'next/server'
import { AdminAuthError, requireAdminSession } from '@/lib/admin-auth'
import { createAdminClient } from '@/lib/supabase/admin'

export async function PATCH(
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

  const { data: current, error: fetchError } = await supabase
    .from('products')
    .select('active')
    .eq('id', id)
    .single()

  if (fetchError || !current) {
    return NextResponse.json({ error: 'Produto não encontrado' }, { status: 404 })
  }

  const { error } = await supabase
    .from('products')
    .update({ active: !current.active })
    .eq('id', id)

  if (error) {
    return NextResponse.json({ error: 'Erro ao atualizar produto' }, { status: 500 })
  }

  return NextResponse.json({ active: !current.active })
}
