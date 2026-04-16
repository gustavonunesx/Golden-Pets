import { Product, ProductImage } from '@/types'
import { products as hardcodedProducts } from '@/data/products'

async function getSupabaseClient() {
  try {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return null
    }
    const { createClient } = await import('@/lib/supabase/server')
    return await createClient()
  } catch {
    return null
  }
}

function mapDbProduct(row: Record<string, unknown>): Product {
  return {
    id: String(row.id),
    slug: row.slug as string,
    name: row.name as string,
    category: row.category_name as string ?? row.category as string ?? '',
    price: Number(row.price),
    originalPrice: row.original_price ? Number(row.original_price) : undefined,
    rating: Number(row.rating ?? 0),
    reviewCount: Number(row.review_count ?? 0),
    description: row.description as string ?? '',
    shortDescription: row.short_description as string ?? '',
    benefits: (row.benefits as string[]) ?? [],
    specs: (row.specs as Record<string, string>) ?? {},
    badge: row.badge as Product['badge'] ?? undefined,
    inStock: row.in_stock !== false,
    imageColor: row.image_color as string ?? '#f97316',
    images: [],
  }
}

// Busca imagens de uma lista de product IDs em uma única query
async function attachImages(
  supabase: Awaited<ReturnType<typeof getSupabaseClient>>,
  products: Product[]
): Promise<Product[]> {
  if (!supabase || products.length === 0) return products

  const ids = products.map((p) => p.id)
  const { data: imageRows, error: imgError } = await supabase
    .from('product_images')
    .select('id, product_id, url, position, alt_text')
    .in('product_id', ids)
    .order('position', { ascending: true })

  if (imgError) {
    console.error('[attachImages] Erro ao buscar imagens:', imgError.message, imgError.code)
  }

  if (!imageRows || imageRows.length === 0) return products

  const imagesByProduct = new Map<string, ProductImage[]>()
  for (const img of imageRows) {
    const list = imagesByProduct.get(img.product_id) ?? []
    list.push({
      id: img.id,
      product_id: img.product_id,
      url: img.url,
      position: img.position,
      alt_text: img.alt_text ?? undefined,
    })
    imagesByProduct.set(img.product_id, list)
  }

  return products.map((p) => ({
    ...p,
    images: imagesByProduct.get(p.id) ?? [],
  }))
}

export async function getProducts(): Promise<Product[]> {
  const supabase = await getSupabaseClient()
  if (!supabase) return hardcodedProducts

  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name)')
    .eq('active', true)
    .order('created_at', { ascending: false })

  if (error || !data || data.length === 0) return hardcodedProducts

  const products = data.map((row) => mapDbProduct({
    ...row,
    category_name: row.categories?.name,
  }))

  return attachImages(supabase, products)
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  const supabase = await getSupabaseClient()
  if (!supabase) {
    return hardcodedProducts.find((p) => p.slug === slug) ?? null
  }

  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name)')
    .eq('slug', slug)
    .single()

  if (error || !data) {
    return hardcodedProducts.find((p) => p.slug === slug) ?? null
  }

  const product = mapDbProduct({ ...data, category_name: data.categories?.name })
  const [withImages] = await attachImages(supabase, [product])
  return withImages
}

export async function getProductsByCategory(
  category: string,
  excludeId?: string,
  limit = 4
): Promise<Product[]> {
  const supabase = await getSupabaseClient()
  if (!supabase) {
    return hardcodedProducts
      .filter((p) => p.category === category && p.id !== excludeId)
      .slice(0, limit)
  }

  let query = supabase
    .from('products')
    .select('*, categories(name)')
    .eq('active', true)
    .eq('categories.name', category)
    .limit(limit)

  if (excludeId) {
    query = query.neq('id', excludeId)
  }

  const { data, error } = await query

  if (error || !data || data.length === 0) {
    return hardcodedProducts
      .filter((p) => p.category === category && p.id !== excludeId)
      .slice(0, limit)
  }

  const products = data.map((row) => mapDbProduct({
    ...row,
    category_name: row.categories?.name,
  }))

  return attachImages(supabase, products)
}

export async function getFeaturedProducts(limit = 4): Promise<Product[]> {
  const supabase = await getSupabaseClient()
  if (!supabase) {
    return hardcodedProducts.filter((p) => p.badge).slice(0, limit)
  }

  const { data, error } = await supabase
    .from('products')
    .select('*, categories(name)')
    .eq('active', true)
    .not('badge', 'is', null)
    .limit(limit)

  if (error || !data || data.length === 0) {
    return hardcodedProducts.filter((p) => p.badge).slice(0, limit)
  }

  const products = data.map((row) => mapDbProduct({
    ...row,
    category_name: row.categories?.name,
  }))

  return attachImages(supabase, products)
}
