import { notFound } from 'next/navigation'
import { createAdminClient } from '@/lib/supabase/admin'
import { ProductForm } from '@/components/admin/produtos/ProductForm'
import { ImageUploader } from '@/components/admin/produtos/ImageUploader'

interface Props {
  params: Promise<{ id: string }>
}

export default async function AdminEditarProduto({ params }: Props) {
  const { id } = await params
  const supabase = createAdminClient()

  const [productResult, imagesResult, categoriesResult] = await Promise.all([
    supabase.from('products').select('*, categories(id, name)').eq('id', id).single(),
    supabase.from('product_images').select('*').eq('product_id', id).order('position', { ascending: true }),
    supabase.from('categories').select('id, name').order('name', { ascending: true }),
  ])

  if (productResult.error || !productResult.data) {
    notFound()
  }

  const product = productResult.data
  const images = imagesResult.data ?? []
  const categories = categoriesResult.data ?? []

  const initialData = {
    name: product.name,
    slug: product.slug,
    category_id: product.category_id,
    price: product.price,
    original_price: product.original_price ?? null,
    short_description: product.short_description,
    description: product.description,
    benefits: product.benefits ?? [''],
    specs: product.specs ?? {},
    badge: product.badge ?? null,
    in_stock: product.in_stock,
    image_color: product.image_color ?? '#f97316',
    active: product.active,
  }

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1f2937', marginBottom: '4px' }}>
          Editar produto
        </h1>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>{product.name}</p>
      </div>

      {/* Imagens */}
      <div style={{
        background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb',
        padding: '32px', marginBottom: '24px',
      }}>
        <ImageUploader productId={id} initialImages={images} />
      </div>

      {/* Dados do produto */}
      <div style={{
        background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '32px',
      }}>
        <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#111', marginBottom: '24px' }}>
          Dados do produto
        </h2>
        <ProductForm
          mode="edit"
          productId={id}
          initialData={initialData}
          categories={categories}
        />
      </div>
    </div>
  )
}
