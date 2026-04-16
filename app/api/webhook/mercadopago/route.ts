import { NextRequest, NextResponse } from 'next/server'
import { createHmac } from 'crypto'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPaymentClient } from '@/lib/mercadopago'

// Verifica a assinatura do webhook do MercadoPago
// Docs: https://www.mercadopago.com.br/developers/pt/docs/notifications/webhooks
function verifySignature(request: NextRequest, rawBody: string): boolean {
  const secret = process.env.MP_WEBHOOK_SECRET
  // Em desenvolvimento sem secret configurado, aceita tudo (apenas para testes locais)
  if (!secret) return process.env.NODE_ENV !== 'production'

  const xSignature = request.headers.get('x-signature')
  const xRequestId = request.headers.get('x-request-id')
  if (!xSignature || !xRequestId) return false

  // Extrai ts e v1 do header x-signature
  const parts = Object.fromEntries(
    xSignature.split(',').map((part) => part.trim().split('=') as [string, string])
  )
  const { ts, v1 } = parts
  if (!ts || !v1) return false

  const manifest = `id:${new URL(request.url).searchParams.get('data.id') ?? ''};request-id:${xRequestId};ts:${ts};`
  const expected = createHmac('sha256', secret).update(manifest).digest('hex')

  return expected === v1
}

export async function POST(request: NextRequest) {
  let rawBody: string
  try {
    rawBody = await request.text()
  } catch {
    return NextResponse.json({ error: 'Corpo inválido' }, { status: 400 })
  }

  // ── 1. Verifica assinatura ───────────────────────────────────────────────
  if (!verifySignature(request, rawBody)) {
    console.warn('Webhook MP: assinatura inválida')
    return NextResponse.json({ error: 'Assinatura inválida' }, { status: 401 })
  }

  const body = JSON.parse(rawBody) as { type: string; data?: { id?: string } }

  // ── 2. Só processa eventos de pagamento ──────────────────────────────────
  if (body.type !== 'payment') {
    return NextResponse.json({ received: true })
  }

  const paymentId = body.data?.id
  if (!paymentId) {
    return NextResponse.json({ error: 'ID de pagamento ausente' }, { status: 400 })
  }

  // ── 3. Busca detalhes do pagamento via API do MP ─────────────────────────
  let payment: Awaited<ReturnType<ReturnType<typeof getPaymentClient>['get']>>
  try {
    payment = await getPaymentClient().get({ id: paymentId })
  } catch (err) {
    console.error('Erro ao buscar pagamento MP:', err)
    return NextResponse.json({ error: 'Erro ao consultar pagamento' }, { status: 502 })
  }

  const orderId = payment.external_reference
  if (!orderId) {
    return NextResponse.json({ error: 'external_reference ausente' }, { status: 400 })
  }

  // ── 4. Mapeia status do MP para status interno ────────────────────────────
  const statusMap: Record<string, { payment_status: string; status: string }> = {
    approved: { payment_status: 'paid', status: 'confirmed' },
    pending: { payment_status: 'pending', status: 'pending' },
    in_process: { payment_status: 'pending', status: 'pending' },
    rejected: { payment_status: 'failed', status: 'cancelled' },
    cancelled: { payment_status: 'failed', status: 'cancelled' },
    refunded: { payment_status: 'refunded', status: 'cancelled' },
    charged_back: { payment_status: 'refunded', status: 'cancelled' },
  }

  const newStatus = statusMap[payment.status ?? '']
  if (!newStatus) {
    // Status desconhecido — ignora silenciosamente
    return NextResponse.json({ received: true })
  }

  // ── 5. Atualiza o pedido no banco ─────────────────────────────────────────
  const supabase = createAdminClient()
  const { error } = await supabase
    .from('orders')
    .update({
      payment_status: newStatus.payment_status,
      status: newStatus.status,
      payment_id: paymentId,
      paid_at: newStatus.payment_status === 'paid' ? new Date().toISOString() : null,
    })
    .eq('id', orderId)

  if (error) {
    console.error('Erro ao atualizar pedido:', error)
    return NextResponse.json({ error: 'Erro ao atualizar pedido' }, { status: 500 })
  }

  return NextResponse.json({ received: true })
}
