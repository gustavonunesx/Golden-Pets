import { Product } from '@/types'
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
  }
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

  return data.map((row) => mapDbProduct({
    ...row,
    category_name: row.categories?.name,
  }))
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

  const { data: imageRows } = await supabase
    .from('product_images')
    .select('id, product_id, url, position, alt_text, created_at')
    .eq('product_id', data.id)
    .order('position', { ascending: true })

  return {
    ...mapDbProduct({ ...data, category_name: data.categories?.name }),
    images: imageRows ?? [],
  }
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

  return data.map((row) => mapDbProduct({
    ...row,
    category_name: row.categories?.name,
  }))
}

export async function getFeaturedProducts(limit = 4): Promise<Product[]> {
  const supabase = await getSupabaseClient()
  if (!supabase) {
    return hardcodedProducts
      .filter((p) => p.badge)
      .slice(0, limit)
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

  return data.map((row) => mapDbProduct({
    ...row,
    category_name: row.categories?.name,
  }))
}
