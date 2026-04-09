'use client'

import { motion } from 'framer-motion'
import { Heart, Award, Truck, Clock } from 'lucide-react'
import { fadeUp, staggerContainer } from '@/lib/animations'

const features = [
  {
    icon: Heart,
    title: 'Produtos Selecionados',
    description: 'Cada item e escolhido pensando no bem-estar e felicidade do seu pet. Qualidade garantida.'
  },
  {
    icon: Award,
    title: 'Marcas Premium',
    description: 'Trabalhamos apenas com marcas reconhecidas e confiadas por veterinarios.'
  },
  {
    icon: Truck,
    title: 'Entrega Express',
    description: 'Receba seus produtos em casa com rapidez e seguranca. Rastreamento em tempo real.'
  },
  {
    icon: Clock,
    title: 'Atendimento Dedicado',
    description: 'Time de especialistas prontos para ajudar voce e seu pet 24 horas por dia.'
  }
]

export function Features() {
  return (
    <section className="py-20 bg-gray-50">
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
            Nossos Diferenciais
          </motion.span>
          <motion.h2
            variants={fadeUp}
            className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-800"
          >
            Por que escolher a <span className="text-primary">Golden Pets</span>?
          </motion.h2>
        </motion.div>

        <motion.div
          variants={staggerContainer}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-8"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={fadeUp}
              className="bg-white rounded-xl sm:rounded-2xl p-3 sm:p-6 shadow-sm hover:shadow-lg transition-shadow"
            >
              <div className="w-10 h-10 sm:w-14 sm:h-14 bg-orange-100 rounded-xl sm:rounded-2xl flex items-center justify-center mb-3 sm:mb-5">
                <feature.icon className="w-5 h-5 sm:w-7 sm:h-7 text-primary" />
              </div>
              <h3 className="text-sm sm:text-lg font-bold text-gray-800 mb-1 sm:mb-2">{feature.title}</h3>
              <p className="text-xs sm:text-base text-gray-500 leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
