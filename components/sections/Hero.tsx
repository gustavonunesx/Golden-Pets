'use client'

import Link from 'next/link'
import Image from 'next/image'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Zap, ShieldCheck, RotateCcw, Star } from 'lucide-react'
import { CustomButton } from '@/components/ui/custom-button'
import { fadeUp, staggerContainer } from '@/lib/animations'

export function Hero() {
  const { scrollY } = useScroll()
  const blobY = useTransform(scrollY, [0, 500], [0, 200])

  const titleWords = ['Seu', 'pet', 'merece', 'o', 'melhor.']

  return (
    <section className="relative min-h-screen flex items-center pt-20 overflow-hidden">
      {/* Background decorative blob with parallax */}
      <motion.div
        style={{ y: blobY }}
        className="absolute top-0 right-0 w-96 h-96 md:w-[600px] md:h-[600px] bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"
      />
      <motion.div
        style={{ y: blobY }}
        className="absolute bottom-0 left-0 w-64 h-64 md:w-96 md:h-96 bg-blue-500/5 rounded-full blur-3xl translate-y-1/2 -translate-x-1/3"
      />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
          {/* Left Column - Text Content */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="text-center lg:text-left"
          >
            {/* Eyebrow */}
            <motion.div
              variants={fadeUp}
              className="inline-flex items-center gap-2 bg-orange-100 text-orange-600 px-4 py-2 rounded-full text-sm font-bold mb-6"
            >
              <Star className="w-4 h-4 fill-current" />
              +500 tutores satisfeitos este mes
            </motion.div>

            {/* Main Title - Word by Word Animation */}
            <motion.h1 variants={fadeUp} className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight leading-none mb-6">
              {titleWords.map((word, index) => (
                <motion.span
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + index * 0.1, duration: 0.5 }}
                  className={`inline-block mr-3 ${word === 'melhor.' ? 'text-primary' : 'text-gray-800'}`}
                >
                  {word}
                </motion.span>
              ))}
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={fadeUp}
              className="text-lg md:text-xl text-gray-500 max-w-lg mx-auto lg:mx-0 mb-8 leading-relaxed"
            >
              Produtos premium para cachorros e gatos com entrega rapida para todo o Brasil. 
              Qualidade garantida e precos que cabem no seu bolso.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
              <Link href="/produtos">
                <CustomButton variant="primary" size="lg">
                  Ver produtos
                </CustomButton>
              </Link>
              <CustomButton variant="ghost" size="lg">
                Como funciona
              </CustomButton>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              variants={fadeUp}
              className="flex flex-wrap items-center justify-center lg:justify-start gap-6 text-sm text-gray-500"
            >
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-primary" />
                <span>Entrega rapida</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-primary" />
                <span>Compra segura</span>
              </div>
              <div className="flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-primary" />
                <span>30 dias garantia</span>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Column - Golden Retriever Image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative flex justify-center lg:justify-end"
          >
            {/* Decorative Blob behind image */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-200 to-orange-100 rounded-full blur-3xl opacity-40 scale-75" />
            
            {/* Image Container */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
              className="relative"
            >
              <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 lg:w-[450px] lg:h-[450px]">
                <Image
                  src="/images/golden-retriever-hero.jpg"
                  alt="Golden Retriever feliz"
                  fill
                  className="object-cover rounded-3xl shadow-2xl"
                  priority
                />
                
                {/* Floating badge */}
                <motion.div
                  animate={{ y: [0, 5, 0], rotate: [0, 2, 0, -2, 0] }}
                  transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                  className="absolute -bottom-4 -left-4 sm:-bottom-6 sm:-left-6 bg-white rounded-2xl shadow-xl p-3 sm:p-4"
                >
                  <div className="flex items-center gap-1 sm:gap-2 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3 h-3 sm:w-4 sm:h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs sm:text-sm text-gray-600 font-medium">+2.500 pets felizes</p>
                </motion.div>
                
                {/* Floating price tag */}
                <motion.div
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                  className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4 bg-primary text-white rounded-full px-3 py-1.5 sm:px-4 sm:py-2 shadow-lg"
                >
                  <p className="text-xs sm:text-sm font-bold">Frete Gratis</p>
                </motion.div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
