'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { useRouter } from 'next/navigation'
import { productSchema, ProductInput } from '@/lib/validations/product'

interface Category {
  id: string
  name: string
}

interface ProductFormProps {
  mode: 'create' | 'edit'
  productId?: string
  initialData?: Partial<ProductInput>
  categories: Category[]
}

function slugify(text: string): string {
  return text
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
}

const inputStyle = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid #d1d5db',
  borderRadius: '8px',
  fontSize: '14px',
  color: '#111',
  background: '#fff',
  boxSizing: 'border-box' as const,
  outline: 'none',
}

const labelStyle = {
  display: 'block' as const,
  fontSize: '13px',
  fontWeight: 600,
  color: '#374151',
  marginBottom: '6px',
}

const errorStyle = {
  fontSize: '12px',
  color: '#dc2626',
  marginTop: '4px',
}

export function ProductForm({ mode, productId, initialData, categories }: ProductFormProps) {
  const router = useRouter()
  const [slugManuallyEdited, setSlugManuallyEdited] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  // Categoria inline
  const [localCategories, setLocalCategories] = useState<Category[]>(categories)
  const [showNewCategory, setShowNewCategory] = useState(categories.length === 0)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [creatingCategory, setCreatingCategory] = useState(false)
  const [categoryError, setCategoryError] = useState<string | null>(null)

  async function handleCreateCategory() {
    if (!newCategoryName.trim()) return
    setCreatingCategory(true)
    setCategoryError(null)
    try {
      const res = await fetch('/api/admin/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: newCategoryName.trim() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setCategoryError(data.error ?? 'Erro ao criar categoria')
        return
      }
      const created: Category = data.category
      setLocalCategories(prev => [...prev, created])
      setValue('category_id', created.id)
      setNewCategoryName('')
      setShowNewCategory(false)
    } finally {
      setCreatingCategory(false)
    }
  }

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductInput>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: initialData?.name ?? '',
      slug: initialData?.slug ?? '',
      category_id: initialData?.category_id ?? (categories[0]?.id ?? ''),
      price: initialData?.price ?? 0,
      original_price: initialData?.original_price ?? null,
      short_description: initialData?.short_description ?? '',
      description: initialData?.description ?? '',
      benefits: initialData?.benefits ?? [''],
      specs: initialData?.specs ?? {},
      badge: initialData?.badge ?? null,
      in_stock: initialData?.in_stock ?? true,
      image_color: initialData?.image_color ?? '#f97316',
      active: initialData?.active ?? true,
    },
  })

  const nameValue = watch('name')
  const benefits = watch('benefits')
  const specs = watch('specs')

  // Auto-gera slug a partir do nome
  useEffect(() => {
    if (mode === 'create' && !slugManuallyEdited) {
      setValue('slug', slugify(nameValue ?? ''))
    }
  }, [nameValue, mode, slugManuallyEdited, setValue])

  // Helpers para benefits
  function addBenefit() {
    setValue('benefits', [...(benefits ?? []), ''])
  }
  function removeBenefit(index: number) {
    const updated = (benefits ?? []).filter((_, i) => i !== index)
    setValue('benefits', updated.length > 0 ? updated : [''])
  }
  function updateBenefit(index: number, value: string) {
    const updated = [...(benefits ?? [])]
    updated[index] = value
    setValue('benefits', updated)
  }

  // Helpers para specs
  const specsEntries = Object.entries(specs ?? {})
  function addSpec() {
    setValue('specs', { ...(specs ?? {}), '': '' })
  }
  function removeSpec(key: string) {
    const updated = { ...(specs ?? {}) }
    delete updated[key]
    setValue('specs', updated)
  }
  function updateSpec(oldKey: string, newKey: string, newValue: string) {
    const updated: Record<string, string> = {}
    for (const [k, v] of Object.entries(specs ?? {})) {
      if (k === oldKey) {
        if (newKey) updated[newKey] = newValue
      } else {
        updated[k] = v
      }
    }
    setValue('specs', updated)
  }

  async function onSubmit(data: ProductInput) {
    setSubmitting(true)
    setSubmitError(null)

    const payload = { ...data, image_color: data.image_color.toLowerCase() }
    const url = mode === 'create' ? '/api/admin/products' : `/api/admin/products/${productId}`
    const method = mode === 'create' ? 'POST' : 'PUT'

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      const result = await res.json()

      if (!res.ok) {
        setSubmitError(result.error ?? 'Erro ao salvar produto')
        return
      }

      if (mode === 'create') {
        router.push(`/admin/produtos/${result.product.id}`)
      } else {
        router.refresh()
      }
    } catch {
      setSubmitError('Erro ao conectar com o servidor')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>

        {/* Nome */}
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={labelStyle}>Nome do produto *</label>
          <input {...register('name')} style={inputStyle} placeholder="Ex: Coleira Anti-Pulgas Premium" />
          {errors.name && <p style={errorStyle}>{errors.name.message}</p>}
        </div>

        {/* Slug */}
        <div>
          <label style={labelStyle}>Slug (URL) *</label>
          <input
            {...register('slug')}
            style={inputStyle}
            placeholder="coleira-anti-pulgas-premium"
            onChange={e => {
              setSlugManuallyEdited(true)
              setValue('slug', e.target.value)
            }}
          />
          {errors.slug && <p style={errorStyle}>{errors.slug.message}</p>}
        </div>

        {/* Categoria */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <label style={{ ...labelStyle, marginBottom: 0 }}>Categoria *</label>
            <button
              type="button"
              onClick={() => setShowNewCategory(v => !v)}
              style={{
                fontSize: '12px', color: '#f97316', background: 'none', border: 'none',
                cursor: 'pointer', fontWeight: 600, padding: 0,
              }}
            >
              {showNewCategory ? 'Cancelar' : '+ Nova categoria'}
            </button>
          </div>

          {showNewCategory ? (
            <div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input
                  value={newCategoryName}
                  onChange={e => setNewCategoryName(e.target.value)}
                  style={{ ...inputStyle, flex: 1 }}
                  placeholder="Ex: Coleiras"
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleCreateCategory())}
                />
                <button
                  type="button"
                  onClick={handleCreateCategory}
                  disabled={creatingCategory || !newCategoryName.trim()}
                  style={{
                    padding: '0 16px', background: '#f97316', border: 'none', borderRadius: '8px',
                    color: '#fff', fontWeight: 600, cursor: creatingCategory ? 'not-allowed' : 'pointer',
                    opacity: creatingCategory || !newCategoryName.trim() ? 0.6 : 1, fontSize: '14px',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {creatingCategory ? '...' : 'Criar'}
                </button>
              </div>
              {categoryError && <p style={errorStyle}>{categoryError}</p>}
            </div>
          ) : (
            <div>
              {localCategories.length === 0 ? (
                <p style={{ ...errorStyle, marginTop: 0 }}>
                  Nenhuma categoria. Clique em "+ Nova categoria" para criar.
                </p>
              ) : (
                <select {...register('category_id')} style={inputStyle}>
                  {localCategories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              )}
            </div>
          )}
          {errors.category_id && <p style={errorStyle}>{errors.category_id.message}</p>}
        </div>

        {/* Preço */}
        <div>
          <label style={labelStyle}>Preço (R$) *</label>
          <input
            type="number"
            step="0.01"
            min="0"
            style={inputStyle}
            {...register('price', { valueAsNumber: true })}
            placeholder="99.90"
          />
          {errors.price && <p style={errorStyle}>{errors.price.message}</p>}
        </div>

        {/* Preço original */}
        <div>
          <label style={labelStyle}>Preço original (R$) <span style={{ color: '#9ca3af', fontWeight: 400 }}>opcional</span></label>
          <input
            type="number"
            step="0.01"
            min="0"
            style={inputStyle}
            {...register('original_price', {
              setValueAs: v => (v === '' || v === null || isNaN(Number(v)) ? null : Number(v))
            })}
            placeholder="129.90"
          />
          {errors.original_price && <p style={errorStyle}>{errors.original_price.message}</p>}
        </div>

        {/* Descrição curta */}
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={labelStyle}>Descrição curta *</label>
          <textarea
            {...register('short_description')}
            rows={2}
            style={{ ...inputStyle, resize: 'vertical' }}
            placeholder="Proteção completa por até 8 meses contra pulgas e carrapatos."
          />
          {errors.short_description && <p style={errorStyle}>{errors.short_description.message}</p>}
        </div>

        {/* Descrição completa */}
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={labelStyle}>Descrição completa *</label>
          <textarea
            {...register('description')}
            rows={5}
            style={{ ...inputStyle, resize: 'vertical' }}
            placeholder="Descreva detalhadamente o produto..."
          />
          {errors.description && <p style={errorStyle}>{errors.description.message}</p>}
        </div>

        {/* Benefícios */}
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={labelStyle}>Benefícios *</label>
          {(benefits ?? []).map((benefit, i) => (
            <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <input
                value={benefit}
                onChange={e => updateBenefit(i, e.target.value)}
                style={{ ...inputStyle, flex: 1 }}
                placeholder={`Benefício ${i + 1}`}
              />
              <button
                type="button"
                onClick={() => removeBenefit(i)}
                style={{
                  padding: '0 12px', background: '#fee2e2', border: 'none',
                  borderRadius: '8px', color: '#dc2626', cursor: 'pointer', fontWeight: 700,
                }}
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addBenefit}
            style={{
              padding: '8px 14px', background: '#f3f4f6', border: '1px dashed #d1d5db',
              borderRadius: '8px', color: '#6b7280', cursor: 'pointer', fontSize: '13px',
              width: '100%',
            }}
          >
            + Adicionar benefício
          </button>
          {errors.benefits && <p style={errorStyle}>Adicione ao menos 1 benefício</p>}
        </div>

        {/* Especificações */}
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={labelStyle}>Especificações <span style={{ color: '#9ca3af', fontWeight: 400 }}>opcional</span></label>
          {specsEntries.map(([key, value], i) => (
            <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
              <input
                value={key}
                onChange={e => updateSpec(key, e.target.value, value)}
                style={{ ...inputStyle, flex: 1 }}
                placeholder="Ex: Duração"
              />
              <input
                value={value}
                onChange={e => updateSpec(key, key, e.target.value)}
                style={{ ...inputStyle, flex: 2 }}
                placeholder="Ex: 8 meses"
              />
              <button
                type="button"
                onClick={() => removeSpec(key)}
                style={{
                  padding: '0 12px', background: '#fee2e2', border: 'none',
                  borderRadius: '8px', color: '#dc2626', cursor: 'pointer', fontWeight: 700,
                }}
              >
                ×
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={addSpec}
            style={{
              padding: '8px 14px', background: '#f3f4f6', border: '1px dashed #d1d5db',
              borderRadius: '8px', color: '#6b7280', cursor: 'pointer', fontSize: '13px',
              width: '100%',
            }}
          >
            + Adicionar especificação
          </button>
        </div>

        {/* Badge */}
        <div>
          <label style={labelStyle}>Badge <span style={{ color: '#9ca3af', fontWeight: 400 }}>opcional</span></label>
          <select
            {...register('badge')}
            style={inputStyle}
          >
            <option value="">Nenhum</option>
            <option value="mais-vendido">Mais vendido</option>
            <option value="novo">Novo</option>
            <option value="oferta">Oferta</option>
          </select>
        </div>

        {/* Cor do placeholder */}
        <div>
          <label style={labelStyle}>Cor do placeholder (fallback)</label>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input
              type="color"
              {...register('image_color')}
              style={{ width: '48px', height: '40px', padding: '2px', border: '1px solid #d1d5db', borderRadius: '6px', cursor: 'pointer' }}
            />
            <input
              {...register('image_color')}
              style={{ ...inputStyle, flex: 1 }}
              placeholder="#f97316"
            />
          </div>
          {errors.image_color && <p style={errorStyle}>{errors.image_color.message}</p>}
        </div>

        {/* Em estoque */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <input
            type="checkbox"
            id="in_stock"
            {...register('in_stock')}
            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
          />
          <label htmlFor="in_stock" style={{ ...labelStyle, marginBottom: 0, cursor: 'pointer' }}>
            Em estoque
          </label>
        </div>

        {/* Ativo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <input
            type="checkbox"
            id="active"
            {...register('active')}
            style={{ width: '18px', height: '18px', cursor: 'pointer' }}
          />
          <label htmlFor="active" style={{ ...labelStyle, marginBottom: 0, cursor: 'pointer' }}>
            Produto ativo (visível na loja)
          </label>
        </div>
      </div>

      {submitError && (
        <div style={{
          marginTop: '24px', background: '#fee2e2', border: '1px solid #fca5a5',
          borderRadius: '8px', padding: '12px 16px', color: '#dc2626', fontSize: '14px',
        }}>
          {submitError}
        </div>
      )}

      <div style={{ marginTop: '32px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
        <button
          type="button"
          onClick={() => router.push('/admin/produtos')}
          style={{
            padding: '10px 24px', background: '#f3f4f6', border: 'none',
            borderRadius: '8px', fontWeight: 600, color: '#374151', cursor: 'pointer', fontSize: '14px',
          }}
        >
          Cancelar
        </button>
        <button
          type="submit"
          disabled={submitting}
          style={{
            padding: '10px 24px', background: '#f97316', border: 'none',
            borderRadius: '8px', fontWeight: 600, color: '#fff',
            cursor: submitting ? 'not-allowed' : 'pointer',
            opacity: submitting ? 0.7 : 1, fontSize: '14px',
          }}
        >
          {submitting ? 'Salvando...' : mode === 'create' ? 'Criar produto' : 'Salvar alterações'}
        </button>
      </div>
    </form>
  )
}
