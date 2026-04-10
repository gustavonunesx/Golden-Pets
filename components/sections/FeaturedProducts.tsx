'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import { Product } from '@/types'
import { ProductCard } from '@/components/ui/product-card'
import { CustomButton } from '@/components/ui/custom-button'
import { fadeUp, staggerContainer } from '@/lib/animations'

interface FeaturedProductsProps {
  products: Product[]
}

export function FeaturedProducts({ products: featuredProducts }: FeaturedProductsProps) {

  return (
    <section className="py-20 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="text-center mb-16"
        >
          <motion.span
            variants={fadeUp}
            className="inline-block text-xs font-bold tracking-widest text-primary uppercase mb-4"
          >
            Destaques da Semana
          </motion.span>
          <motion.h2
            variants={fadeUp}
            className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-800"
          >
            Mais vendidos <span className="text-primary">esta semana</span>
          </motion.h2>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6"
        >
          {featuredProducts.map((product) => (
            <motion.div key={product.id} variants={fadeUp}>
              <ProductCard product={product} />
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.4 }}
          className="text-center mt-12"
        >
          <Link href="/produtos">
            <CustomButton variant="ghost" size="lg">
              Ver todos os produtos
              <ArrowRight className="w-5 h-5 ml-2" />
            </CustomButton>
          </Link>
        </motion.div>
      </div>
    </section>
  )
}
