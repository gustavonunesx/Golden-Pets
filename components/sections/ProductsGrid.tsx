'use client'

import { motion } from 'framer-motion'
import { Product } from '@/types'
import { ProductCard } from '@/components/ui/product-card'
import { fadeUp, staggerContainer } from '@/lib/animations'

interface ProductsGridProps {
  products: Product[]
}

export function ProductsGrid({ products }: ProductsGridProps) {
  return (
    <section className="py-32 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="text-center mb-12"
        >
          <motion.span
            variants={fadeUp}
            className="inline-block text-xs font-bold tracking-widest text-primary uppercase mb-4"
          >
            Catalogo Completo
          </motion.span>
          <motion.h1
            variants={fadeUp}
            className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-800 mb-4"
          >
            Todos os <span className="text-primary">Produtos</span>
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="text-gray-500 max-w-2xl mx-auto"
          >
            Encontre o produto perfeito para o seu pet. Qualidade garantida e entrega rapida para todo o Brasil.
          </motion.p>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-6"
        >
          {products.map((product) => (
            <motion.div key={product.id} variants={fadeUp}>
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
