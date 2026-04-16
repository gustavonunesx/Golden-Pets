'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useCartStore, selectTotalPrice, selectTotalItems, CartItem } from '@/stores/cart-store'
import { checkoutSchema, type CheckoutInput } from '@/lib/validations/checkout'

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatPrice(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
      <label style={{ fontSize: '13px', fontWeight: 600, color: '#374151' }}>{label}</label>
      {children}
      {error && <span style={{ fontSize: '12px', color: '#dc2626' }}>{error}</span>}
    </div>
  )
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: '8px',
  border: '1px solid #d1d5db',
  fontSize: '14px',
  outline: 'none',
  boxSizing: 'border-box',
  background: '#fff',
}

const inputErrorStyle: React.CSSProperties = {
  ...inputStyle,
  border: '1px solid #dc2626',
}

// ── Componente principal ──────────────────────────────────────────────────────
export default function CheckoutPage() {
  const router = useRouter()
  const items = useCartStore((s) => s.items)
  const clearCart = useCartStore((s) => s.clearCart)
  const totalPrice = useCartStore(selectTotalPrice)
  const totalItems = useCartStore(selectTotalItems)
  const [hydrated, setHydrated] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  useEffect(() => {
    useCartStore.persist.rehydrate()
    setHydrated(true)
  }, [])

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<CheckoutInput>({
    resolver: zodResolver(checkoutSchema),
  })

  // Auto-busca CEP
  const zipCode = watch('address.zip_code')
  useEffect(() => {
    if (!zipCode || zipCode.length !== 8) return
    fetch(`https://viacep.com.br/ws/${zipCode}/json/`)
      .then((r) => r.json())
      .then((data) => {
        if (data.erro) return
        setValue('address.street', data.logradouro || '')
        setValue('address.neighborhood', data.bairro || '')
        setValue('address.city', data.localidade || '')
        setValue('address.state', data.uf || '')
      })
      .catch(() => null)
  }, [zipCode, setValue])

  if (!hydrated) return null

  // Redireciona se carrinho vazio
  if (hydrated && items.length === 0) {
    router.replace('/produtos')
    return null
  }

  async function onSubmit(data: CheckoutInput) {
    setServerError(null)
    setSubmitting(true)

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          items: items.map((i: CartItem) => ({
            productId: i.productId,
            quantity: i.quantity,
          })),
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setServerError(result.error || 'Erro ao processar pedido')
        return
      }

      clearCart()
      // Redireciona para o MercadoPago
      window.location.href = result.initPoint
    } catch {
      setServerError('Erro de conexão. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#f9fafb', padding: '24px 16px' }}>
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '32px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1f2937', marginBottom: '4px' }}>
            Finalizar compra
          </h1>
          <p style={{ fontSize: '14px', color: '#6b7280' }}>
            {totalItems} {totalItems === 1 ? 'item' : 'itens'} no carrinho
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '24px', alignItems: 'start' }}>

            {/* ── Coluna esquerda: formulário ───────────────────────────────── */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

              {/* Dados pessoais */}
              <section style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '24px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1f2937', marginBottom: '20px' }}>
                  Dados pessoais
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <Field label="Nome completo" error={errors.customer?.name?.message}>
                      <input
                        {...register('customer.name')}
                        placeholder="João da Silva"
                        style={errors.customer?.name ? inputErrorStyle : inputStyle}
                      />
                    </Field>
                  </div>
                  <div style={{ gridColumn: '1 / -1' }}>
                    <Field label="E-mail" error={errors.customer?.email?.message}>
                      <input
                        {...register('customer.email')}
                        type="email"
                        placeholder="joao@email.com"
                        style={errors.customer?.email ? inputErrorStyle : inputStyle}
                      />
                    </Field>
                  </div>
                  <Field label="Telefone (só números)" error={errors.customer?.phone?.message}>
                    <input
                      {...register('customer.phone')}
                      placeholder="11999998888"
                      maxLength={11}
                      style={errors.customer?.phone ? inputErrorStyle : inputStyle}
                    />
                  </Field>
                  <Field label="CPF (só números)" error={errors.customer?.cpf?.message}>
                    <input
                      {...register('customer.cpf')}
                      placeholder="12345678901"
                      maxLength={11}
                      style={errors.customer?.cpf ? inputErrorStyle : inputStyle}
                    />
                  </Field>
                </div>
              </section>

              {/* Endereço */}
              <section style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '24px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1f2937', marginBottom: '20px' }}>
                  Endereço de entrega
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                  <Field label="CEP (só números)" error={errors.address?.zip_code?.message}>
                    <input
                      {...register('address.zip_code')}
                      placeholder="01310100"
                      maxLength={8}
                      style={errors.address?.zip_code ? inputErrorStyle : inputStyle}
                    />
                  </Field>
                  <div />

                  <div style={{ gridColumn: '1 / -1' }}>
                    <Field label="Rua / Avenida" error={errors.address?.street?.message}>
                      <input
                        {...register('address.street')}
                        placeholder="Av. Paulista"
                        style={errors.address?.street ? inputErrorStyle : inputStyle}
                      />
                    </Field>
                  </div>

                  <Field label="Número" error={errors.address?.number?.message}>
                    <input
                      {...register('address.number')}
                      placeholder="1578"
                      style={errors.address?.number ? inputErrorStyle : inputStyle}
                    />
                  </Field>
                  <Field label="Complemento (opcional)" error={errors.address?.complement?.message}>
                    <input
                      {...register('address.complement')}
                      placeholder="Apto 42"
                      style={inputStyle}
                    />
                  </Field>

                  <Field label="Bairro" error={errors.address?.neighborhood?.message}>
                    <input
                      {...register('address.neighborhood')}
                      placeholder="Bela Vista"
                      style={errors.address?.neighborhood ? inputErrorStyle : inputStyle}
                    />
                  </Field>
                  <Field label="Cidade" error={errors.address?.city?.message}>
                    <input
                      {...register('address.city')}
                      placeholder="São Paulo"
                      style={errors.address?.city ? inputErrorStyle : inputStyle}
                    />
                  </Field>
                  <Field label="Estado (sigla)" error={errors.address?.state?.message}>
                    <input
                      {...register('address.state')}
                      placeholder="SP"
                      maxLength={2}
                      style={{ ...(errors.address?.state ? inputErrorStyle : inputStyle), textTransform: 'uppercase' }}
                    />
                  </Field>
                </div>
              </section>

              {/* Erro do servidor */}
              {serverError && (
                <div style={{
                  background: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '8px',
                  padding: '12px 16px',
                  fontSize: '14px',
                  color: '#991b1b',
                }}>
                  {serverError}
                </div>
              )}
            </div>

            {/* ── Coluna direita: resumo ────────────────────────────────────── */}
            <div style={{ position: 'sticky', top: '24px' }}>
              <section style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '24px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#1f2937', marginBottom: '20px' }}>
                  Resumo do pedido
                </h2>

                {/* Itens */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
                  {items.map((item: CartItem) => (
                    <div key={item.productId} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                        {item.imageUrl ? (
                          <img
                            src={item.imageUrl}
                            alt={item.name}
                            style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover', flexShrink: 0 }}
                          />
                        ) : (
                          <div style={{
                            width: '36px',
                            height: '36px',
                            borderRadius: '8px',
                            background: item.imageColor,
                            flexShrink: 0,
                          }} />
                        )}
                        <div style={{ minWidth: 0 }}>
                          <div style={{ fontSize: '13px', fontWeight: 600, color: '#1f2937', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                            {item.name}
                          </div>
                          <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                            Qtd: {item.quantity}
                          </div>
                        </div>
                      </div>
                      <div style={{ fontSize: '13px', fontWeight: 600, color: '#1f2937', flexShrink: 0 }}>
                        {formatPrice(item.price * item.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Divisor */}
                <div style={{ height: '1px', background: '#f3f4f6', marginBottom: '16px' }} />

                {/* Total */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <span style={{ fontSize: '15px', fontWeight: 700, color: '#1f2937' }}>Total</span>
                  <span style={{ fontSize: '18px', fontWeight: 800, color: '#f97316' }}>
                    {formatPrice(totalPrice)}
                  </span>
                </div>

                {/* Botão */}
                <button
                  type="submit"
                  disabled={submitting}
                  style={{
                    width: '100%',
                    background: submitting ? '#fdba74' : '#f97316',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '14px',
                    fontSize: '15px',
                    fontWeight: 700,
                    cursor: submitting ? 'not-allowed' : 'pointer',
                    transition: 'background 0.2s',
                  }}
                >
                  {submitting ? 'Processando...' : 'Pagar com MercadoPago'}
                </button>

                <p style={{ fontSize: '11px', color: '#9ca3af', textAlign: 'center', marginTop: '12px' }}>
                  Você será redirecionado para o MercadoPago para concluir o pagamento com segurança.
                </p>
              </section>
            </div>

          </div>
        </form>
      </div>
    </div>
  )
}
