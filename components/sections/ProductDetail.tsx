'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Star, Check, Truck, ShieldCheck, RotateCcw, Minus, Plus, ChevronRight } from 'lucide-react'
import { Product } from '@/types'
import { CustomBadge } from '@/components/ui/custom-badge'
import { CustomButton } from '@/components/ui/custom-button'
import { ProductImage } from '@/components/ui/product-image'
import { fadeUp, scaleIn, staggerContainer } from '@/lib/animations'

interface ProductDetailProps {
  product: Product
}

type TabType = 'descricao' | 'especificacoes' | 'avaliacoes'

export function ProductDetail({ product }: ProductDetailProps) {
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState<TabType>('descricao')

  const hasDiscount = product.originalPrice && product.originalPrice > product.price
  const discountPercent = hasDiscount
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0

  const handleQuantityChange = (delta: number) => {
    setQuantity((prev) => Math.max(1, prev + delta))
  }

  return (
    <section className="pt-28 pb-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-500 mb-8">
          <Link href="/" className="hover:text-primary transition-colors">
            Inicio
          </Link>
          <ChevronRight className="w-4 h-4" />
          <Link href="/produtos" className="hover:text-primary transition-colors">
            Produtos
          </Link>
          <ChevronRight className="w-4 h-4" />
          <span className="text-gray-800 font-medium">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Left Column - Image */}
          <motion.div
            variants={scaleIn}
            initial="hidden"
            animate="visible"
          >
            <div className="sticky top-28">
              <ProductImage
                color={product.imageColor}
                name={product.name}
                className="w-full max-w-lg mx-auto"
              />
              {hasDiscount && (
                <div className="absolute top-4 right-4 bg-red-500 text-white text-sm font-bold px-3 py-1 rounded-full">
                  -{discountPercent}%
                </div>
              )}
            </div>
          </motion.div>

          {/* Right Column - Details */}
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
          >
            {/* Category Badge */}
            <motion.div variants={fadeUp} className="mb-4">
              <CustomBadge variant="orange">{product.category}</CustomBadge>
              {product.badge && (
                <CustomBadge
                  variant={product.badge === 'mais-vendido' ? 'blue' : product.badge === 'novo' ? 'green' : 'orange'}
                  className="ml-2"
                >
                  {product.badge === 'mais-vendido' ? 'Mais Vendido' : product.badge === 'novo' ? 'Novo' : 'Oferta'}
                </CustomBadge>
              )}
            </motion.div>

            {/* Product Name */}
            <motion.h1
              variants={fadeUp}
              className="text-3xl md:text-4xl font-extrabold text-gray-800 tracking-tight mb-4"
            >
              {product.name}
            </motion.h1>

            {/* Rating */}
            <motion.div variants={fadeUp} className="flex items-center gap-2 mb-6">
              <div className="flex items-center gap-1">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-5 h-5 ${i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`}
                  />
                ))}
              </div>
              <span className="text-gray-500">
                {product.rating.toFixed(1)} ({product.reviewCount} avaliacoes)
              </span>
            </motion.div>

            {/* Price */}
            <motion.div variants={fadeUp} className="mb-6">
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-extrabold text-primary">
                  R$ {product.price.toFixed(2).replace('.', ',')}
                </span>
                {hasDiscount && (
                  <span className="text-xl text-gray-400 line-through">
                    R$ {product.originalPrice!.toFixed(2).replace('.', ',')}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1">
                em ate 12x de R$ {(product.price / 12).toFixed(2).replace('.', ',')}
              </p>
            </motion.div>

            {/* Short Description */}
            <motion.p variants={fadeUp} className="text-gray-600 leading-relaxed mb-6">
              {product.shortDescription}
            </motion.p>

            {/* Benefits */}
            <motion.div variants={fadeUp} className="mb-8">
              <h3 className="font-bold text-gray-800 mb-3">Beneficios:</h3>
              <ul className="space-y-2">
                {product.benefits.map((benefit, index) => (
                  <li key={index} className="flex items-center gap-2 text-gray-600">
                    <Check className="w-5 h-5 text-primary shrink-0" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Quantity Selector */}
            <motion.div variants={fadeUp} className="flex items-center gap-4 mb-6">
              <span className="font-bold text-gray-800">Quantidade:</span>
              <div className="flex items-center border border-gray-200 rounded-xl">
                <button
                  onClick={() => handleQuantityChange(-1)}
                  className="p-3 hover:bg-gray-50 transition-colors"
                  aria-label="Diminuir quantidade"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-12 text-center font-bold">{quantity}</span>
                <button
                  onClick={() => handleQuantityChange(1)}
                  className="p-3 hover:bg-gray-50 transition-colors"
                  aria-label="Aumentar quantidade"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div variants={fadeUp} className="space-y-3 mb-8">
              <CustomButton variant="primary" size="lg" className="w-full">
                Adicionar ao carrinho
              </CustomButton>
              <CustomButton variant="ghost" size="lg" className="w-full">
                Comprar agora
              </CustomButton>
            </motion.div>

            {/* Trust Icons */}
            <motion.div variants={fadeUp} className="grid grid-cols-3 gap-4 p-4 bg-gray-50 rounded-2xl">
              <div className="flex flex-col items-center text-center">
                <Truck className="w-6 h-6 text-primary mb-2" />
                <span className="text-xs text-gray-600">Entrega Rapida</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <ShieldCheck className="w-6 h-6 text-primary mb-2" />
                <span className="text-xs text-gray-600">Compra Segura</span>
              </div>
              <div className="flex flex-col items-center text-center">
                <RotateCcw className="w-6 h-6 text-primary mb-2" />
                <span className="text-xs text-gray-600">30 dias garantia</span>
              </div>
            </motion.div>
          </motion.div>
        </div>

        {/* Tabs Section */}
        <div className="mt-16">
          {/* Tab Headers */}
          <div className="flex border-b border-gray-200">
            {(['descricao', 'especificacoes', 'avaliacoes'] as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-4 font-bold text-sm transition-colors border-b-2 -mb-px ${
                  activeTab === tab
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-500 hover:text-gray-800'
                }`}
              >
                {tab === 'descricao' ? 'Descrição' : tab === 'especificacoes' ? 'Especificações' : 'Avaliações'}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="py-8">
            {activeTab === 'descricao' && (
              <motion.div
                key="descricao"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="prose prose-gray max-w-none"
              >
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
              </motion.div>
            )}

            {activeTab === 'especificacoes' && (
              <motion.div
                key="especificacoes"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="grid sm:grid-cols-2 gap-4">
                  {Object.entries(product.specs).map(([key, value]) => (
                    <div key={key} className="flex justify-between p-4 bg-gray-50 rounded-xl">
                      <span className="font-medium text-gray-600">{key}</span>
                      <span className="text-gray-800">{value}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {activeTab === 'avaliacoes' && (
              <motion.div
                key="avaliacoes"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center py-8"
              >
                <div className="flex items-center justify-center gap-1 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={`w-8 h-8 ${i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`}
                    />
                  ))}
                </div>
                <p className="text-2xl font-bold text-gray-800 mb-1">{product.rating.toFixed(1)} de 5</p>
                <p className="text-gray-500">Baseado em {product.reviewCount} avaliacoes</p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
