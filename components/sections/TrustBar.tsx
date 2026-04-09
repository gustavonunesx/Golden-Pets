'use client'

import { motion } from 'framer-motion'
import { Truck, ShieldCheck, CreditCard, Headphones } from 'lucide-react'
import { fadeUp, staggerContainer } from '@/lib/animations'

const trustItems = [
  {
    icon: Truck,
    title: 'Entrega Rapida',
    description: 'Para todo o Brasil'
  },
  {
    icon: ShieldCheck,
    title: 'Compra Segura',
    description: 'Dados protegidos'
  },
  {
    icon: CreditCard,
    title: 'Pague como quiser',
    description: 'Pix, cartao ou boleto'
  },
  {
    icon: Headphones,
    title: 'Suporte 24h',
    description: 'Sempre disponivel'
  }
]

export function TrustBar() {
  return (
    <section className="bg-primary py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {trustItems.map((item) => (
            <motion.div
              key={item.title}
              variants={fadeUp}
              className="flex items-center gap-3 text-white"
            >
              <div className="shrink-0">
                <item.icon className="w-6 h-6 md:w-8 md:h-8" strokeWidth={1.5} />
              </div>
              <div>
                <p className="font-bold text-sm md:text-base">{item.title}</p>
                <p className="text-xs md:text-sm opacity-80">{item.description}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
