import { Metadata } from 'next'

export const revalidate = 60
import { notFound } from 'next/navigation'
import { getProducts, getProductBySlug, getProductsByCategory } from '@/lib/queries/products'
import { Navbar } from '@/components/sections/Navbar'
import { Footer } from '@/components/sections/Footer'
import { ProductDetail } from '@/components/sections/ProductDetail'
import { RelatedProducts } from '@/components/sections/RelatedProducts'

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  const products = await getProducts()
  return products.map((product) => ({
    slug: product.slug
  }))
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) {
    return {
      title: 'Produto nao encontrado | Golden Pets'
    }
  }

  return {
    title: `${product.name} | Golden Pets`,
    description: product.shortDescription
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params
  const product = await getProductBySlug(slug)

  if (!product) {
    notFound()
  }

  const relatedProducts = await getProductsByCategory(product.category, product.id)

  return (
    <main className="min-h-screen">
      <Navbar />
      <ProductDetail product={product} />
      {relatedProducts.length > 0 && <RelatedProducts products={relatedProducts} />}
      <Footer />
    </main>
  )
}
