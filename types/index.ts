export interface ProductImage {
  id: string
  product_id: string
  url: string
  position: number
  alt_text?: string
  created_at: string
}

export interface Product {
  id: string
  slug: string
  name: string
  category: string
  price: number
  originalPrice?: number
  rating: number
  reviewCount: number
  description: string
  shortDescription: string
  benefits: string[]
  specs: Record<string, string>
  badge?: 'mais-vendido' | 'novo' | 'oferta'
  inStock: boolean
  imageColor: string
  images?: ProductImage[]
}

export interface Testimonial {
  id: string
  name: string
  petName: string
  petType: string
  text: string
  rating: number
  avatarColor: string
}

export interface Category {
  id: string
  name: string
  slug: string
  icon: string
}
