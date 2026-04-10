import { Metadata } from 'next'
import { getProducts } from '@/lib/queries/products'
import { Navbar } from '@/components/sections/Navbar'
import { Footer } from '@/components/sections/Footer'
import { ProductsGrid } from '@/components/sections/ProductsGrid'

export const metadata: Metadata = {
  title: 'Produtos | Golden Pets',
  description: 'Confira todos os produtos premium para seu pet. Coleiras, camas, brinquedos, alimentacao e muito mais com entrega rapida para todo o Brasil.'
}

export default async function ProdutosPage() {
  const products = await getProducts()

  return (
    <main className="min-h-screen">
      <Navbar />
      <ProductsGrid products={products} />
      <Footer />
    </main>
  )
}
