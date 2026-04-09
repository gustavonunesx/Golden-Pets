import { Metadata } from 'next'
import { Navbar } from '@/components/sections/Navbar'
import { Footer } from '@/components/sections/Footer'
import { ProductsGrid } from '@/components/sections/ProductsGrid'

export const metadata: Metadata = {
  title: 'Produtos | Golden Pets',
  description: 'Confira todos os produtos premium para seu pet. Coleiras, camas, brinquedos, alimentacao e muito mais com entrega rapida para todo o Brasil.'
}

export default function ProdutosPage() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <ProductsGrid />
      <Footer />
    </main>
  )
}
