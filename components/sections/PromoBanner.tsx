'use client'

import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Gift, Truck, Shield, ArrowRight } from 'lucide-react'
import { CustomButton } from '@/components/ui/custom-button'
import { fadeUp } from '@/lib/animations'

export function PromoBanner() {
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-gradient-to-br from-orange-50 via-white to-orange-50 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative bg-gradient-to-r from-primary to-orange-500 rounded-2xl sm:rounded-3xl overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
              <pattern id="paw-pattern" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="10" r="2" fill="white" />
                <circle cx="6" cy="5" r="1.5" fill="white" />
                <circle cx="14" cy="5" r="1.5" fill="white" />
                <circle cx="4" cy="10" r="1.5" fill="white" />
                <circle cx="16" cy="10" r="1.5" fill="white" />
              </pattern>
              <rect width="100%" height="100%" fill="url(#paw-pattern)" />
            </svg>
          </div>

          <div className="relative grid lg:grid-cols-2 gap-6 lg:gap-8 items-center p-6 sm:p-8 lg:p-12">
            {/* Content */}
            <motion.div
              variants={fadeUp}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="text-white text-center lg:text-left order-2 lg:order-1"
            >
              <span className="inline-block bg-white/20 backdrop-blur-sm text-white text-xs sm:text-sm font-bold px-3 py-1.5 sm:px-4 sm:py-2 rounded-full mb-4 sm:mb-6">
                Oferta Especial
              </span>
              
              <h2 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-extrabold mb-3 sm:mb-4 leading-tight text-balance">
                Primeira Compra com
                <span className="block text-yellow-300">15% de Desconto</span>
              </h2>
              
              <p className="text-sm sm:text-base lg:text-lg text-white/90 mb-6 sm:mb-8 max-w-md mx-auto lg:mx-0">
                Cadastre-se agora e ganhe desconto exclusivo na sua primeira compra. Seu pet merece o melhor!
              </p>

              {/* Benefits */}
              <div className="flex flex-wrap justify-center lg:justify-start gap-3 sm:gap-4 mb-6 sm:mb-8">
                <div className="flex items-center gap-1.5 sm:gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 sm:px-4 sm:py-2">
                  <Truck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm font-medium">Frete Grátis</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 sm:px-4 sm:py-2">
                  <Shield className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm font-medium">Garantia 30 dias</span>
                </div>
                <div className="flex items-center gap-1.5 sm:gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 sm:px-4 sm:py-2">
                  <Gift className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="text-xs sm:text-sm font-medium">Brindes</span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center lg:justify-start">
                <Link href="/produtos">
                  <CustomButton variant="secondary" size="lg" className="w-full sm:w-auto group">
                    Aproveitar Oferta
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </CustomButton>
                </Link>
                <div className="flex items-center justify-center gap-2 text-white/80 text-xs sm:text-sm">
                  <span className="font-mono bg-white/20 px-2 py-1 rounded font-bold">GOLDEN15</span>
                  <span>Use o cupom</span>
                </div>
              </div>
            </motion.div>

            {/* Image */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="relative flex justify-center order-1 lg:order-2"
            >
              <div className="relative w-48 h-48 sm:w-64 sm:h-64 lg:w-80 lg:h-80 xl:w-96 xl:h-96">
                {/* Glow effect */}
                <div className="absolute inset-0 bg-yellow-300/30 rounded-full blur-3xl scale-75" />
                
                <Image
                  src="/images/promo-dog-banner.jpg"
                  alt="Pets felizes Golden Pets"
                  fill
                  className="object-cover rounded-2xl sm:rounded-3xl shadow-2xl relative z-10"
                />
                
                {/* Floating discount badge */}
                <motion.div
                  animate={{ rotate: [0, 5, 0, -5, 0], scale: [1, 1.05, 1] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                  className="absolute -top-2 -right-2 sm:-top-4 sm:-right-4 bg-yellow-400 text-gray-900 rounded-full w-14 h-14 sm:w-20 sm:h-20 flex flex-col items-center justify-center shadow-lg z-20"
                >
                  <span className="text-lg sm:text-2xl font-extrabold leading-none">15%</span>
                  <span className="text-[10px] sm:text-xs font-bold">OFF</span>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  )
}
