'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { fadeUp, staggerContainer } from '@/lib/animations'

export function CtaBanner() {
  return (
    <section className="relative py-20 bg-gradient-to-br from-primary to-orange-600 overflow-hidden">
      {/* Decorative Paw Prints */}
      <div className="absolute inset-0 pointer-events-none">
        <svg className="absolute top-10 left-10 w-24 h-24 text-white opacity-10" viewBox="0 0 100 100">
          <g fill="currentColor">
            <ellipse cx="50" cy="60" rx="20" ry="16" />
            <ellipse cx="25" cy="35" rx="8" ry="10" transform="rotate(-20, 25, 35)" />
            <ellipse cx="75" cy="35" rx="8" ry="10" transform="rotate(20, 75, 35)" />
            <ellipse cx="30" cy="48" rx="7" ry="9" transform="rotate(-10, 30, 48)" />
            <ellipse cx="70" cy="48" rx="7" ry="9" transform="rotate(10, 70, 48)" />
          </g>
        </svg>
        <svg className="absolute bottom-10 right-10 w-32 h-32 text-white opacity-10" viewBox="0 0 100 100">
          <g fill="currentColor">
            <ellipse cx="50" cy="60" rx="20" ry="16" />
            <ellipse cx="25" cy="35" rx="8" ry="10" transform="rotate(-20, 25, 35)" />
            <ellipse cx="75" cy="35" rx="8" ry="10" transform="rotate(20, 75, 35)" />
            <ellipse cx="30" cy="48" rx="7" ry="9" transform="rotate(-10, 30, 48)" />
            <ellipse cx="70" cy="48" rx="7" ry="9" transform="rotate(10, 70, 48)" />
          </g>
        </svg>
        <svg className="absolute top-1/2 left-1/4 w-16 h-16 text-white opacity-5" viewBox="0 0 100 100">
          <g fill="currentColor">
            <ellipse cx="50" cy="60" rx="20" ry="16" />
            <ellipse cx="25" cy="35" rx="8" ry="10" transform="rotate(-20, 25, 35)" />
            <ellipse cx="75" cy="35" rx="8" ry="10" transform="rotate(20, 75, 35)" />
            <ellipse cx="30" cy="48" rx="7" ry="9" transform="rotate(-10, 30, 48)" />
            <ellipse cx="70" cy="48" rx="7" ry="9" transform="rotate(10, 70, 48)" />
          </g>
        </svg>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
        >
          <motion.h2
            variants={fadeUp}
            className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white tracking-tight mb-6"
          >
            Seu pet nao pode esperar.
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="text-lg md:text-xl text-white/80 max-w-2xl mx-auto mb-10"
          >
            Aproveite nossas ofertas exclusivas e de o melhor para quem faz parte da sua familia. Frete gratis acima de R$ 199.
          </motion.p>
          <motion.div variants={fadeUp}>
            <Link href="/produtos">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="bg-white text-primary font-bold px-8 py-4 rounded-full text-lg shadow-lg hover:shadow-xl transition-shadow"
              >
                Comprar agora
              </motion.button>
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}
