import { getFeaturedProducts } from '@/lib/queries/products'
import { Navbar } from '@/components/sections/Navbar'
import { Hero } from '@/components/sections/Hero'
import { TrustBar } from '@/components/sections/TrustBar'
import { Features } from '@/components/sections/Features'
import { FeaturedProducts } from '@/components/sections/FeaturedProducts'
import { PromoBanner } from '@/components/sections/PromoBanner'
import { Testimonials } from '@/components/sections/Testimonials'
import { CtaBanner } from '@/components/sections/CtaBanner'
import { Footer } from '@/components/sections/Footer'

export default async function Home() {
  const featuredProducts = await getFeaturedProducts(8)

  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <TrustBar />
      <Features />
      <FeaturedProducts products={featuredProducts} />
      <PromoBanner />
      <Testimonials />
      <CtaBanner />
      <Footer />
    </main>
  )
}
