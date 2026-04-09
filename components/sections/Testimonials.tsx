'use client'

import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { testimonials } from '@/data/testimonials'
import { fadeUp, staggerContainer } from '@/lib/animations'

export function Testimonials() {
  // Duplicate testimonials for infinite scroll effect
  const duplicatedTestimonials = [...testimonials, ...testimonials]

  return (
    <section className="py-20 bg-blue-50 overflow-hidden">
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
            Depoimentos
          </motion.span>
          <motion.h2
            variants={fadeUp}
            className="text-4xl md:text-5xl font-extrabold tracking-tight text-gray-800"
          >
            O que dizem <span className="text-primary">nossos clientes</span>
          </motion.h2>
        </motion.div>
      </div>

      {/* Marquee Container */}
      <div className="relative">
        <motion.div
          animate={{ x: [0, -1920] }}
          transition={{
            x: {
              repeat: Infinity,
              repeatType: 'loop',
              duration: 30,
              ease: 'linear'
            }
          }}
          className="flex gap-6"
        >
          {duplicatedTestimonials.map((testimonial, index) => (
            <div
              key={`${testimonial.id}-${index}`}
              className="shrink-0 w-80 bg-white rounded-2xl p-6 shadow-sm"
            >
              {/* Stars */}
              <div className="flex items-center gap-1 mb-4">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${i < testimonial.rating ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`}
                  />
                ))}
              </div>

              {/* Text */}
              <p className="text-gray-600 italic mb-4 leading-relaxed">
                &quot;{testimonial.text}&quot;
              </p>

              {/* Author */}
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold"
                  style={{ backgroundColor: testimonial.avatarColor }}
                >
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <p className="font-bold text-gray-800">{testimonial.name}</p>
                  <p className="text-sm text-gray-500">
                    {testimonial.petName} - {testimonial.petType}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  )
}
