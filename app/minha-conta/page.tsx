'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { User, MapPin, Package, ChevronRight, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { User as SupabaseUser } from '@supabase/supabase-js'

interface CustomerData {
  full_name: string | null
  email: string
  phone: string | null
  cpf: string | null
}

interface AddressData {
  id: string
  cep: string
  street: string
  number: string
  complement: string | null
  neighborhood: string
  city: string
  state: string
  is_default: boolean
}

interface OrderData {
  id: string
  total: number
  status: string
  payment_status: string
  created_at: string
}

const statusLabels: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pendente', color: '#f97316' },
  confirmed: { label: 'Confirmado', color: '#22c55e' },
  shipped: { label: 'Enviado', color: '#3b82f6' },
  delivered: { label: 'Entregue', color: '#22c55e' },
  cancelled: { label: 'Cancelado', color: '#ef4444' },
}

export default function MinhaContaPage() {
  const router = useRouter()
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [customer, setCustomer] = useState<CustomerData | null>(null)
  const [addresses, setAddresses] = useState<AddressData[]>([])
  const [orders, setOrders] = useState<OrderData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function loadData() {
      const supabase = createClient()
      const { data: { user: authUser } } = await supabase.auth.getUser()

      if (!authUser) {
        router.replace('/')
        return
      }

      setUser(authUser)

      // Busca dados do cliente
      const { data: customerData } = await supabase
        .from('customers')
        .select('full_name, email, phone, cpf')
        .eq('id', authUser.id)
        .maybeSingle()

      if (customerData) {
        setCustomer(customerData)
      } else {
        setCustomer({
          full_name: authUser.user_metadata?.full_name || null,
          email: authUser.email || '',
          phone: null,
          cpf: null,
        })
      }

      // Busca endereços
      const { data: addressData } = await supabase
        .from('addresses')
        .select('*')
        .eq('customer_id', authUser.id)
        .order('is_default', { ascending: false })

      if (addressData) setAddresses(addressData)

      // Busca pedidos
      const { data: orderData } = await supabase
        .from('orders')
        .select('id, total, status, payment_status, created_at')
        .eq('customer_id', authUser.id)
        .order('created_at', { ascending: false })
        .limit(10)

      if (orderData) setOrders(orderData)

      setLoading(false)
    }

    loadData()
  }, [router])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.replace('/')
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: '#6b7280' }}>Carregando...</p>
      </div>
    )
  }

  const userName = customer?.full_name || user?.user_metadata?.full_name || 'Cliente'

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '100px 16px 40px' }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#1f2937', marginBottom: '4px' }}>
            Olá, {userName}
          </h1>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>{user?.email}</p>
        </div>

        {/* Cards grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#fff7ed', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Package size={20} color="#f97316" />
              </div>
              <div>
                <p style={{ fontSize: '24px', fontWeight: 800, color: '#1f2937' }}>{orders.length}</p>
                <p style={{ fontSize: '12px', color: '#6b7280' }}>Pedidos</p>
              </div>
            </div>
          </div>
          <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#f0fdf4', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <MapPin size={20} color="#22c55e" />
              </div>
              <div>
                <p style={{ fontSize: '24px', fontWeight: 800, color: '#1f2937' }}>{addresses.length}</p>
                <p style={{ fontSize: '12px', color: '#6b7280' }}>Endereços</p>
              </div>
            </div>
          </div>
        </div>

        {/* Dados pessoais */}
        <section style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '24px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <User size={18} color="#f97316" />
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1f2937' }}>Dados pessoais</h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
            <div>
              <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '2px' }}>Nome</p>
              <p style={{ fontSize: '14px', fontWeight: 600, color: '#1f2937' }}>{customer?.full_name || '—'}</p>
            </div>
            <div>
              <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '2px' }}>E-mail</p>
              <p style={{ fontSize: '14px', fontWeight: 600, color: '#1f2937' }}>{customer?.email || '—'}</p>
            </div>
            <div>
              <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '2px' }}>Telefone</p>
              <p style={{ fontSize: '14px', fontWeight: 600, color: '#1f2937' }}>{customer?.phone || '—'}</p>
            </div>
            <div>
              <p style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '2px' }}>CPF</p>
              <p style={{ fontSize: '14px', fontWeight: 600, color: '#1f2937' }}>{customer?.cpf || '—'}</p>
            </div>
          </div>
        </section>

        {/* Endereços */}
        <section style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '24px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <MapPin size={18} color="#f97316" />
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1f2937' }}>Endereços</h2>
          </div>
          {addresses.length === 0 ? (
            <p style={{ fontSize: '14px', color: '#6b7280' }}>Nenhum endereço salvo. Ele será preenchido automaticamente na próxima compra.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {addresses.map((addr) => (
                <div key={addr.id} style={{ padding: '14px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #f3f4f6' }}>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: '#1f2937' }}>
                    {addr.street}, {addr.number}
                    {addr.complement && ` — ${addr.complement}`}
                  </p>
                  <p style={{ fontSize: '13px', color: '#6b7280' }}>
                    {addr.neighborhood} — {addr.city}/{addr.state} — CEP {addr.cep}
                  </p>
                  {addr.is_default && (
                    <span style={{ display: 'inline-block', marginTop: '6px', fontSize: '11px', fontWeight: 700, color: '#f97316', background: '#fff7ed', padding: '2px 8px', borderRadius: '4px' }}>
                      Padrão
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Pedidos */}
        <section style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '24px', marginBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Package size={18} color="#f97316" />
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1f2937' }}>Últimos pedidos</h2>
            </div>
            {orders.length > 0 && (
              <Link
                href="/minha-conta/pedidos"
                style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '13px', fontWeight: 600, color: '#f97316', textDecoration: 'none' }}
              >
                Ver todos <ChevronRight size={14} />
              </Link>
            )}
          </div>
          {orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <p style={{ fontSize: '14px', color: '#6b7280', marginBottom: '12px' }}>Você ainda não fez nenhum pedido.</p>
              <Link
                href="/produtos"
                style={{
                  display: 'inline-block',
                  background: '#f97316',
                  color: '#fff',
                  borderRadius: '8px',
                  padding: '10px 20px',
                  fontSize: '14px',
                  fontWeight: 700,
                  textDecoration: 'none',
                }}
              >
                Ver produtos
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {orders.map((order) => {
                const st = statusLabels[order.status] || { label: order.status, color: '#6b7280' }
                return (
                  <div key={order.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px', background: '#f9fafb', borderRadius: '8px', border: '1px solid #f3f4f6' }}>
                    <div>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: '#1f2937', fontFamily: 'monospace' }}>
                        #{order.id.slice(0, 8)}
                      </p>
                      <p style={{ fontSize: '12px', color: '#9ca3af' }}>
                        {new Date(order.created_at).toLocaleDateString('pt-BR')}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '14px', fontWeight: 700, color: '#1f2937' }}>
                        {order.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </p>
                      <span style={{ fontSize: '11px', fontWeight: 700, color: st.color }}>
                        {st.label}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* Logout */}
        <button
          onClick={handleLogout}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: 'transparent',
            border: 'none',
            color: '#ef4444',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            padding: '8px 0',
          }}
        >
          <LogOut size={16} />
          Sair da conta
        </button>
      </div>
    </div>
  )
}
