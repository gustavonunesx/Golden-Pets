'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Package } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface OrderItem {
  id: string
  quantity: number
  unit_price: number
  subtotal: number
  products: { name: string; slug: string } | null
}

interface Order {
  id: string
  total: number
  status: string
  payment_status: string
  created_at: string
  order_items: OrderItem[]
}

const statusLabels: Record<string, { label: string; color: string; bg: string }> = {
  pending: { label: 'Pendente', color: '#f97316', bg: '#fff7ed' },
  confirmed: { label: 'Confirmado', color: '#22c55e', bg: '#f0fdf4' },
  shipped: { label: 'Enviado', color: '#3b82f6', bg: '#eff6ff' },
  delivered: { label: 'Entregue', color: '#22c55e', bg: '#f0fdf4' },
  cancelled: { label: 'Cancelado', color: '#ef4444', bg: '#fef2f2' },
}

export default function MeusPedidosPage() {
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadOrders() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        router.replace('/')
        return
      }

      const { data } = await supabase
        .from('orders')
        .select(`
          id, total, status, payment_status, created_at,
          order_items (id, quantity, unit_price, subtotal, products (name, slug))
        `)
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false })

      if (data) setOrders(data as unknown as Order[])
      setLoading(false)
    }

    loadOrders()
  }, [router])

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#6b7280' }}>Carregando...</p>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '100px 16px 40px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '32px' }}>
          <Link href="/minha-conta" style={{ color: '#6b7280', display: 'flex' }}>
            <ArrowLeft size={20} />
          </Link>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1f2937' }}>Meus pedidos</h1>
        </div>

        {orders.length === 0 ? (
          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '40px', textAlign: 'center' }}>
            <Package size={48} color="#e5e7eb" style={{ margin: '0 auto 16px' }} />
            <p style={{ fontSize: '16px', fontWeight: 600, color: '#1f2937', marginBottom: '8px' }}>Nenhum pedido ainda</p>
            <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '20px' }}>Quando você fizer uma compra, seus pedidos aparecerão aqui.</p>
            <Link
              href="/produtos"
              style={{ display: 'inline-block', background: '#f97316', color: '#fff', borderRadius: '8px', padding: '10px 24px', fontSize: '14px', fontWeight: 700, textDecoration: 'none' }}
            >
              Ver produtos
            </Link>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {orders.map((order) => {
              const st = statusLabels[order.status] || { label: order.status, color: '#6b7280', bg: '#f9fafb' }
              return (
                <div key={order.id} style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                  {/* Header do pedido */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #f3f4f6' }}>
                    <div>
                      <p style={{ fontSize: '14px', fontWeight: 700, color: '#1f2937', fontFamily: 'monospace' }}>
                        Pedido #{order.id.slice(0, 8)}
                      </p>
                      <p style={{ fontSize: '12px', color: '#9ca3af' }}>
                        {new Date(order.created_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                    <span style={{ fontSize: '12px', fontWeight: 700, color: st.color, background: st.bg, padding: '4px 10px', borderRadius: '6px' }}>
                      {st.label}
                    </span>
                  </div>

                  {/* Itens */}
                  <div style={{ padding: '16px 20px' }}>
                    {order.order_items.map((item) => (
                      <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0' }}>
                        <div>
                          <p style={{ fontSize: '14px', fontWeight: 600, color: '#1f2937' }}>
                            {item.products?.name || 'Produto'}
                          </p>
                          <p style={{ fontSize: '12px', color: '#9ca3af' }}>
                            {item.quantity}x {item.unit_price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </p>
                        </div>
                        <p style={{ fontSize: '14px', fontWeight: 600, color: '#1f2937' }}>
                          {item.subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Total */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 20px', background: '#f9fafb', borderTop: '1px solid #f3f4f6' }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: '#6b7280' }}>Total</span>
                    <span style={{ fontSize: '16px', fontWeight: 800, color: '#f97316' }}>
                      {order.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
