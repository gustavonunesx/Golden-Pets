import { NextRequest, NextResponse } from 'next/server'
import { checkoutSchema } from '@/lib/validations/checkout'
import { createAdminClient } from '@/lib/supabase/admin'
import { getPreferenceClient } from '@/lib/mercadopago'

export async function POST(request: NextRequest) {
  // ── 1. Valida o corpo da requisição ──────────────────────────────────────
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Corpo da requisição inválido' }, { status: 400 })
  }

  const parsed = checkoutSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Dados inválidos', details: parsed.error.flatten() },
      { status: 422 }
    )
  }

  // ── 2. Lê os itens do carrinho enviados pelo cliente ─────────────────────
  const { customer: customerInput, address: addressInput } = parsed.data
  const rawItems = (body as Record<string, unknown>).items
  if (!Array.isArray(rawItems) || rawItems.length === 0) {
    return NextResponse.json({ error: 'Carrinho vazio' }, { status: 422 })
  }

  const supabase = createAdminClient()

  // ── 3. Busca os preços reais dos produtos no banco ───────────────────────
  //    NUNCA confia no preço enviado pelo front-end.
  const productIds: string[] = rawItems.map((i: unknown) => (i as { productId: string }).productId)
  const { data: dbProducts, error: productsError } = await supabase
    .from('products')
    .select('id, name, price')
    .in('id', productIds)

  if (productsError || !dbProducts || dbProducts.length === 0) {
    return NextResponse.json({ error: 'Produtos não encontrados' }, { status: 404 })
  }

  // ── 4. Monta itens com preços confiáveis ─────────────────────────────────
  const orderItems = rawItems.map((i: unknown) => {
    const cartItem = i as { productId: string; quantity: number; name: string }
    const product = dbProducts.find((p) => p.id === cartItem.productId)
    if (!product) throw new Error(`Produto ${cartItem.productId} não encontrado`)
    return {
      product_id: product.id,
      quantity: cartItem.quantity,
      unit_price: product.price,
      total_price: product.price * cartItem.quantity,
      name: product.name,
    }
  })

  const totalAmount = orderItems.reduce((sum, i) => sum + i.total_price, 0)

  // ── 5. Cria ou busca customer ─────────────────────────────────────────────
  const { data: existingCustomer } = await supabase
    .from('customers')
    .select('id')
    .eq('email', customerInput.email)
    .maybeSingle()

  let customerId: string
  if (existingCustomer) {
    customerId = existingCustomer.id
    await supabase
      .from('customers')
      .update({
        name: customerInput.name,
        phone: customerInput.phone,
        cpf: customerInput.cpf,
      })
      .eq('id', customerId)
  } else {
    const { data: newCustomer, error: customerError } = await supabase
      .from('customers')
      .insert({
        name: customerInput.name,
        email: customerInput.email,
        phone: customerInput.phone,
        cpf: customerInput.cpf,
      })
      .select('id')
      .single()

    if (customerError || !newCustomer) {
      console.error('Erro ao criar customer:', customerError)
      return NextResponse.json({ error: 'Erro ao salvar dados do cliente' }, { status: 500 })
    }
    customerId = newCustomer.id
  }

  // ── 6. Cria endereço ──────────────────────────────────────────────────────
  const { data: address, error: addressError } = await supabase
    .from('addresses')
    .insert({
      customer_id: customerId,
      ...addressInput,
    })
    .select('id')
    .single()

  if (addressError || !address) {
    console.error('Erro ao criar endereço:', addressError)
    return NextResponse.json({ error: 'Erro ao salvar endereço' }, { status: 500 })
  }

  // ── 7. Cria pedido ────────────────────────────────────────────────────────
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      customer_id: customerId,
      address_id: address.id,
      total_amount: totalAmount,
      status: 'pending',
      payment_status: 'pending',
    })
    .select('id')
    .single()

  if (orderError || !order) {
    console.error('Erro ao criar pedido:', orderError)
    return NextResponse.json({ error: 'Erro ao criar pedido' }, { status: 500 })
  }

  // ── 8. Cria itens do pedido ───────────────────────────────────────────────
  const { error: itemsError } = await supabase.from('order_items').insert(
    orderItems.map((i) => ({
      order_id: order.id,
      product_id: i.product_id,
      quantity: i.quantity,
      unit_price: i.unit_price,
      total_price: i.total_price,
    }))
  )

  if (itemsError) {
    console.error('Erro ao criar itens:', itemsError)
    return NextResponse.json({ error: 'Erro ao salvar itens do pedido' }, { status: 500 })
  }

  // ── 9. Cria Preference no MercadoPago ────────────────────────────────────
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'

  try {
    const preference = await getPreferenceClient().create({
      body: {
        external_reference: order.id,
        items: orderItems.map((i) => ({
          id: i.product_id,
          title: i.name,
          quantity: i.quantity,
          unit_price: i.unit_price,
          currency_id: 'BRL',
        })),
        payer: {
          name: customerInput.name,
          email: customerInput.email,
        },
        back_urls: {
          success: `${baseUrl}/pedido/sucesso?order=${order.id}`,
          failure: `${baseUrl}/checkout?error=pagamento`,
          pending: `${baseUrl}/pedido/sucesso?order=${order.id}&status=pending`,
        },
        auto_return: 'approved',
        notification_url: `${baseUrl}/api/webhook/mercadopago`,
      },
    })

    return NextResponse.json({
      orderId: order.id,
      initPoint: preference.init_point,
    })
  } catch (mpError) {
    console.error('Erro MercadoPago:', mpError)
    // Pedido criado mas pagamento falhou — deixa no banco como pending
    return NextResponse.json({ error: 'Erro ao criar pagamento' }, { status: 502 })
  }
}
