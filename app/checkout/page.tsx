'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { ArrowLeft, ShieldCheck, Truck, Sparkles, Lock } from 'lucide-react'
import { useCartStore, selectTotalPrice, selectTotalItems, CartItem } from '@/stores/cart-store'
import { checkoutSchema, type CheckoutInput } from '@/lib/validations/checkout'
import { createClient } from '@/lib/supabase/client'

// ── Helpers ───────────────────────────────────────────────────────────────────
function formatPrice(value: number) {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

type FieldProps = {
  label: string
  error?: string
  hint?: string
  children: React.ReactNode
  className?: string
}

function Field({ label, error, hint, children, className = '' }: FieldProps) {
  return (
    <div className={`flex flex-col gap-1.5 ${className}`}>
      <label className="text-[11px] uppercase tracking-[0.14em] font-bold text-stone-500">
        {label}
      </label>
      {children}
      {error ? (
        <span className="text-xs text-red-600 font-medium flex items-center gap-1">
          <span className="inline-block w-1 h-1 rounded-full bg-red-600" />
          {error}
        </span>
      ) : hint ? (
        <span className="text-[11px] text-stone-400 italic">{hint}</span>
      ) : null}
    </div>
  )
}

const inputBase =
  'w-full px-4 py-3 rounded-xl border bg-white text-[15px] text-stone-900 placeholder:text-stone-300 outline-none transition-all duration-200 focus:border-orange-400 focus:ring-4 focus:ring-orange-100'
const inputOk = `${inputBase} border-stone-200 hover:border-stone-300`
const inputErr = `${inputBase} border-red-300 bg-red-50/30 focus:border-red-400 focus:ring-red-100`

type SectionCardProps = {
  title: string
  subtitle?: string
  children: React.ReactNode
  delay?: number
}

function SectionCard({ title, subtitle, children, delay = 0 }: SectionCardProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: [0.16, 1, 0.3, 1] }}
      className="relative bg-white rounded-3xl border border-stone-200/70 p-6 sm:p-8 shadow-[0_4px_24px_-8px_rgba(120,90,60,0.08)]"
    >
      <div className="mb-6">
        <h2 className="font-[family-name:var(--font-fraunces)] text-2xl sm:text-[26px] font-semibold text-stone-900 leading-tight tracking-tight">
          {title}
        </h2>
        {subtitle && (
          <span className="block text-xs text-stone-500 mt-1">{subtitle}</span>
        )}
        <div className="mt-4 h-px w-12 bg-orange-400" />
      </div>
      {children}
    </motion.section>
  )
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

  // Pré-preenche dados se o cliente estiver logado
  useEffect(() => {
    async function loadUserData() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: customer } = await supabase
        .from('customers')
        .select('full_name, email, phone, cpf')
        .eq('id', user.id)
        .maybeSingle()

      if (customer) {
        if (customer.full_name) setValue('customer.name', customer.full_name)
        if (customer.email) setValue('customer.email', customer.email)
        if (customer.phone) setValue('customer.phone', customer.phone)
        if (customer.cpf) setValue('customer.cpf', customer.cpf)
      } else {
        if (user.user_metadata?.full_name) setValue('customer.name', user.user_metadata.full_name)
        if (user.email) setValue('customer.email', user.email)
      }

      const { data: address } = await supabase
        .from('addresses')
        .select('cep, street, number, complement, neighborhood, city, state')
        .eq('customer_id', user.id)
        .order('is_default', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (address) {
        if (address.cep) setValue('address.zip_code', address.cep)
        if (address.street) setValue('address.street', address.street)
        if (address.number) setValue('address.number', address.number)
        if (address.complement) setValue('address.complement', address.complement)
        if (address.neighborhood) setValue('address.neighborhood', address.neighborhood)
        if (address.city) setValue('address.city', address.city)
        if (address.state) setValue('address.state', address.state)
      }
    }
    loadUserData()
  }, [setValue])

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
      window.location.href = result.initPoint
    } catch {
      setServerError('Erro de conexão. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-[#FBF7F1] overflow-hidden pb-12 sm:pb-16">
      {/* Background decorative pattern */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23f97316'%3E%3Cellipse cx='40' cy='48' rx='12' ry='9'/%3E%3Cellipse cx='22' cy='28' rx='5' ry='6' transform='rotate(-20 22 28)'/%3E%3Cellipse cx='58' cy='28' rx='5' ry='6' transform='rotate(20 58 28)'/%3E%3Cellipse cx='12' cy='40' rx='4' ry='5' transform='rotate(-10 12 40)'/%3E%3Cellipse cx='68' cy='40' rx='4' ry='5' transform='rotate(10 68 40)'/%3E%3C/g%3E%3C/svg%3E\")",
          backgroundSize: '180px 180px',
        }}
      />
      {/* Soft top blob */}
      <div className="pointer-events-none absolute -top-48 -right-32 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-orange-200/40 to-amber-100/0 blur-3xl" />
      <div className="pointer-events-none absolute top-32 -left-40 w-[400px] h-[400px] rounded-full bg-gradient-to-tr from-amber-200/30 to-orange-100/0 blur-3xl" />

      <div className="relative max-w-[1180px] mx-auto px-4 sm:px-6 lg:px-10 pt-6 sm:pt-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 sm:mb-12"
        >
          <Link
            href="/produtos"
            className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-stone-500 hover:text-orange-500 transition-colors mb-6 group"
          >
            <ArrowLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
            Continuar comprando
          </Link>

          <div className="flex flex-col items-center text-center gap-4">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-orange-500">
              Checkout · Golden Pets
            </p>
            <h1
              className="font-[family-name:var(--font-fraunces)] text-[42px] sm:text-[58px] leading-[0.95] font-medium text-stone-900 tracking-[-0.02em]"
              style={{ fontVariationSettings: '"opsz" 144, "SOFT" 100' }}
            >
              Finalizar <span className="italic font-light text-orange-500">compra</span>
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-stone-200/70 text-xs text-stone-500">
              <Lock className="w-3 h-3 text-emerald-600" />
              Pagamento criptografado
            </span>
          </div>
        </motion.div>

        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-6 lg:gap-10 items-start">

            {/* ── Coluna esquerda: formulário ───────────────────────────────── */}
            <div className="flex flex-col gap-5">

              {/* Dados pessoais */}
              <SectionCard
                title="Quem está comprando?"
                subtitle="Para emitir a nota e enviar atualizações do pedido"
                delay={0.05}
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Field
                    label="Nome completo"
                    error={errors.customer?.name?.message}
                    className="sm:col-span-2"
                  >
                    <input
                      {...register('customer.name')}
                      placeholder="João da Silva"
                      className={errors.customer?.name ? inputErr : inputOk}
                    />
                  </Field>
                  <Field
                    label="E-mail"
                    error={errors.customer?.email?.message}
                    className="sm:col-span-2"
                  >
                    <input
                      {...register('customer.email')}
                      type="email"
                      placeholder="joao@email.com"
                      className={errors.customer?.email ? inputErr : inputOk}
                    />
                  </Field>
                  <Field label="Telefone" error={errors.customer?.phone?.message} hint="11 dígitos, só números">
                    <input
                      {...register('customer.phone')}
                      placeholder="11999998888"
                      maxLength={11}
                      inputMode="numeric"
                      className={errors.customer?.phone ? inputErr : inputOk}
                    />
                  </Field>
                  <Field label="CPF" error={errors.customer?.cpf?.message} hint="11 dígitos, só números">
                    <input
                      {...register('customer.cpf')}
                      placeholder="12345678901"
                      maxLength={11}
                      inputMode="numeric"
                      className={errors.customer?.cpf ? inputErr : inputOk}
                    />
                  </Field>
                </div>
              </SectionCard>

              {/* Endereço */}
              <SectionCard
                title="Onde entregamos?"
                subtitle="Preenchemos automaticamente quando você digita o CEP"
                delay={0.12}
              >
                <div className="grid grid-cols-1 sm:grid-cols-6 gap-4">
                  <Field
                    label="CEP"
                    error={errors.address?.zip_code?.message}
                    className="sm:col-span-2"
                  >
                    <input
                      {...register('address.zip_code')}
                      placeholder="01310100"
                      maxLength={8}
                      inputMode="numeric"
                      className={errors.address?.zip_code ? inputErr : inputOk}
                    />
                  </Field>

                  <Field
                    label="Rua / Avenida"
                    error={errors.address?.street?.message}
                    className="sm:col-span-4"
                  >
                    <input
                      {...register('address.street')}
                      placeholder="Av. Paulista"
                      className={errors.address?.street ? inputErr : inputOk}
                    />
                  </Field>

                  <Field
                    label="Número"
                    error={errors.address?.number?.message}
                    className="sm:col-span-2"
                  >
                    <input
                      {...register('address.number')}
                      placeholder="1578"
                      className={errors.address?.number ? inputErr : inputOk}
                    />
                  </Field>
                  <Field
                    label="Complemento"
                    error={errors.address?.complement?.message}
                    hint="opcional"
                    className="sm:col-span-4"
                  >
                    <input
                      {...register('address.complement')}
                      placeholder="Apto 42, bloco B"
                      className={inputOk}
                    />
                  </Field>

                  <Field
                    label="Bairro"
                    error={errors.address?.neighborhood?.message}
                    className="sm:col-span-3"
                  >
                    <input
                      {...register('address.neighborhood')}
                      placeholder="Bela Vista"
                      className={errors.address?.neighborhood ? inputErr : inputOk}
                    />
                  </Field>
                  <Field
                    label="Cidade"
                    error={errors.address?.city?.message}
                    className="sm:col-span-2"
                  >
                    <input
                      {...register('address.city')}
                      placeholder="São Paulo"
                      className={errors.address?.city ? inputErr : inputOk}
                    />
                  </Field>
                  <Field
                    label="UF"
                    error={errors.address?.state?.message}
                    className="sm:col-span-1"
                  >
                    <input
                      {...register('address.state')}
                      placeholder="SP"
                      maxLength={2}
                      className={`${errors.address?.state ? inputErr : inputOk} uppercase tracking-widest text-center`}
                    />
                  </Field>
                </div>
              </SectionCard>

              {/* Pagamento */}
              <SectionCard
                title="Como você quer pagar?"
                subtitle="A forma de pagamento é escolhida por você direto no MercadoPago"
                delay={0.19}
              >
                <div className="rounded-2xl border-2 border-orange-200 bg-gradient-to-br from-orange-50 via-amber-50/50 to-white p-5">
                  <div className="flex items-start gap-4">
                    <div className="shrink-0 w-12 h-12 rounded-xl bg-white border border-orange-200 grid place-items-center">
                      <Sparkles className="w-5 h-5 text-orange-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-stone-900 text-[15px] mb-1">
                        Pagamento seguro com MercadoPago
                      </p>
                      <p className="text-[13px] text-stone-600 leading-relaxed">
                        Ao clicar em <strong>Pagar com segurança</strong>, você é redirecionado para o ambiente do MercadoPago e <strong>escolhe ali</strong> a forma que preferir — Pix, cartão de crédito (até 12x), débito ou boleto.
                      </p>
                      <div className="flex flex-wrap items-center gap-1.5 mt-3">
                        {['Pix', 'Crédito', 'Débito', 'Boleto'].map((m) => (
                          <span
                            key={m}
                            className="text-[11px] font-medium text-orange-700 bg-white border border-orange-200/70 px-2.5 py-1 rounded-full"
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </SectionCard>

              {/* Erro do servidor */}
              <AnimatePresence>
                {serverError && (
                  <motion.div
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    className="rounded-2xl border border-red-200 bg-red-50/80 backdrop-blur-sm px-5 py-4 text-sm text-red-800 font-medium flex items-start gap-3"
                  >
                    <span className="inline-block w-1.5 h-1.5 rounded-full bg-red-500 mt-1.5 shrink-0" />
                    {serverError}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Trust strip
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.6 }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3 mt-2"
              >
                {[
                  { icon: ShieldCheck, label: 'Compra protegida' },
                  { icon: Truck, label: 'Frete para todo Brasil' },
                  { icon: Lock, label: 'Dados criptografados' },
                ].map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="flex items-center gap-2.5 text-xs sm:text-[11px] text-stone-600 sm:text-stone-500 font-medium px-4 py-3 sm:px-3 sm:py-2.5 rounded-xl bg-white/70 border border-stone-200/60"
                  >
                    <Icon className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-orange-500 shrink-0" />
                    <span>{label}</span>
                  </div>
                ))}
              </motion.div> */}
            </div>

            {/* ── Coluna direita: resumo ────────────────────────────────────── */}
            <motion.aside
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="lg:sticky lg:top-6"
            >
              <div className="relative bg-white rounded-3xl border border-stone-200/70 overflow-hidden shadow-[0_8px_32px_-8px_rgba(120,90,60,0.10)]">
                {/* Decorative top border */}
                <div className="h-1.5 bg-gradient-to-r from-orange-400 via-orange-500 to-amber-400" />

                <div className="p-6 sm:p-7">
                  <div className="flex items-baseline justify-between mb-5">
                    <h2 className="font-[family-name:var(--font-fraunces)] text-2xl font-semibold text-stone-900 tracking-tight">
                      Seu pedido
                    </h2>
                    <span className="text-[11px] uppercase tracking-[0.18em] font-bold text-stone-400">
                      {totalItems} {totalItems === 1 ? 'item' : 'itens'}
                    </span>
                  </div>

                  {/* Itens */}
                  <div className="flex flex-col gap-3 mb-5 max-h-80 lg:max-h-[420px] overflow-y-auto pr-1 -mr-1">
                    {items.map((item: CartItem, idx) => (
                      <motion.div
                        key={item.productId}
                        initial={{ opacity: 0, x: 10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.15 + idx * 0.04 }}
                        className="flex items-center gap-3 group"
                      >
                        <div className="relative shrink-0">
                          {item.imageUrl ? (
                            <img
                              src={item.imageUrl}
                              alt={item.name}
                              className="w-14 h-14 rounded-xl object-cover bg-stone-100 border border-stone-200/70"
                            />
                          ) : (
                            <div
                              className="w-14 h-14 rounded-xl border border-stone-200/70"
                              style={{ background: item.imageColor }}
                            />
                          )}
                          <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 rounded-full bg-stone-900 text-white text-[10px] font-bold grid place-items-center tabular-nums">
                            {item.quantity}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-semibold text-stone-900 truncate leading-tight">
                            {item.name}
                          </p>
                          <p className="text-[11px] text-stone-500 mt-0.5">
                            {formatPrice(item.price)} · und
                          </p>
                        </div>
                        <p className="text-[13px] font-bold text-stone-900 tabular-nums shrink-0">
                          {formatPrice(item.price * item.quantity)}
                        </p>
                      </motion.div>
                    ))}
                  </div>

                  {/* Subtotal lines */}
                  <div className="border-t border-dashed border-stone-200 pt-4 space-y-2 mb-5">
                    <div className="flex justify-between text-[13px] text-stone-600">
                      <span>Subtotal</span>
                      <span className="tabular-nums">{formatPrice(totalPrice)}</span>
                    </div>
                    <div className="flex justify-between text-[13px] text-stone-600">
                      <span>Frete</span>
                      <span className="text-emerald-600 font-semibold uppercase text-[11px] tracking-wider">
                        a calcular
                      </span>
                    </div>
                  </div>

                  {/* Total */}
                  <div className="flex items-baseline justify-between mb-6 pt-4 border-t border-stone-200">
                    <span className="text-sm font-bold uppercase tracking-[0.16em] text-stone-700">
                      Total
                    </span>
                    <span className="text-[26px] font-extrabold text-stone-900 tabular-nums tracking-tight">
                      {formatPrice(totalPrice)}
                    </span>
                  </div>

                  {/* CTA */}
                  <motion.button
                    type="submit"
                    disabled={submitting}
                    whileHover={{ scale: submitting ? 1 : 1.01 }}
                    whileTap={{ scale: submitting ? 1 : 0.99 }}
                    className={`flex w-full items-center justify-center gap-2 rounded-2xl py-4 px-5 text-[15px] font-bold text-white transition-all duration-200 ${
                      submitting
                        ? 'bg-orange-300 cursor-not-allowed'
                        : 'bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-500 hover:to-orange-700 shadow-[0_8px_24px_-8px_rgba(249,115,22,0.6)] hover:shadow-[0_12px_32px_-8px_rgba(249,115,22,0.7)]'
                    }`}
                  >
                    {submitting ? (
                      <>
                        <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        Pagar com segurança
                      </>
                    )}
                  </motion.button>

                  <p className="block text-[11px] text-stone-400 text-center mt-3 italic font-[family-name:var(--font-fraunces)]">
                    feito com carinho para o seu pet ✦
                  </p>
                </div>
              </div>
            </motion.aside>

          </div>
        </form>
      </div>
    </div>
  )
}
