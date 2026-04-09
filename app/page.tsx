import { Navbar } from '@/components/sections/Navbar'
import { Hero } from '@/components/sections/Hero'
import { TrustBar } from '@/components/sections/TrustBar'
import { Features } from '@/components/sections/Features'
import { FeaturedProducts } from '@/components/sections/FeaturedProducts'
import { PromoBanner } from '@/components/sections/PromoBanner'
import { Testimonials } from '@/components/sections/Testimonials'
import { CtaBanner } from '@/components/sections/CtaBanner'
import { Footer } from '@/components/sections/Footer'

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <TrustBar />
      <Features />
      <FeaturedProducts />
      <PromoBanner />
      <Testimonials />
      <CtaBanner />
      <Footer />
    </main>
  )
}
