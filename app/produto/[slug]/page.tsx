import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { products } from '@/data/products'
import { Navbar } from '@/components/sections/Navbar'
import { Footer } from '@/components/sections/Footer'
import { ProductDetail } from '@/components/sections/ProductDetail'
import { RelatedProducts } from '@/components/sections/RelatedProducts'

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return products.map((product) => ({
    slug: product.slug
  }))
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const product = products.find((p) => p.slug === slug)

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
  const product = products.find((p) => p.slug === slug)

  if (!product) {
    notFound()
  }

  const relatedProducts = products
    .filter((p) => p.category === product.category && p.id !== product.id)
    .slice(0, 4)

  return (
    <main className="min-h-screen">
      <Navbar />
      <ProductDetail product={product} />
      {relatedProducts.length > 0 && <RelatedProducts products={relatedProducts} />}
      <Footer />
    </main>
  )
}
