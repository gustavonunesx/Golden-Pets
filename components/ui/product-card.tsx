'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { Product } from '@/types'
import { CustomBadge } from './custom-badge'
import { ProductImage } from './product-image'

interface ProductCardProps {
  product: Product
}

const badgeLabels = {
  'mais-vendido': 'Mais Vendido',
  'novo': 'Novo',
  'oferta': 'Oferta'
}

export function ProductCard({ product }: ProductCardProps) {
  const hasDiscount = product.originalPrice && product.originalPrice > product.price
  const discountPercent = hasDiscount
    ? Math.round(((product.originalPrice! - product.price) / product.originalPrice!) * 100)
    : 0

  return (
    <motion.div
      whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.12)' }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className="group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden h-full"
    >
      <Link href={`/produto/${product.slug}`} className="flex flex-col h-full">
        <div className="relative overflow-hidden">
          <ProductImage color={product.imageColor} name={product.name} src={product.images?.[0]?.url} />
          
          <div className="absolute top-2 left-2 sm:top-3 sm:left-3 flex flex-wrap gap-1 sm:gap-2">
            <CustomBadge variant="orange" className="text-[10px] sm:text-xs px-1.5 py-0.5 sm:px-2 sm:py-1">{product.category}</CustomBadge>
            {product.badge && (
              <CustomBadge 
                variant={product.badge === 'mais-vendido' ? 'blue' : product.badge === 'novo' ? 'green' : 'orange'}
                className="text-[10px] sm:text-xs px-1.5 py-0.5 sm:px-2 sm:py-1"
              >
                {badgeLabels[product.badge]}
              </CustomBadge>
            )}
          </div>

          {hasDiscount && (
            <div className="absolute top-2 right-2 sm:top-3 sm:right-3 bg-red-500 text-white text-[10px] sm:text-xs font-bold px-1.5 py-0.5 sm:px-2 sm:py-1 rounded-full">
              -{discountPercent}%
            </div>
          )}
        </div>

        <div className="flex flex-col flex-1 p-2.5 sm:p-4">
          <h3 className="font-bold text-gray-800 text-sm sm:text-lg mb-1 sm:mb-2 line-clamp-2 group-hover:text-primary transition-colors min-h-[2.5rem] sm:min-h-[3.5rem]">
            {product.name}
          </h3>

          <div className="flex items-center gap-0.5 sm:gap-1 mb-2 sm:mb-3">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                className={`w-3 h-3 sm:w-4 sm:h-4 ${i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'fill-gray-200 text-gray-200'}`}
              />
            ))}
            <span className="text-[10px] sm:text-sm text-gray-500 ml-0.5 sm:ml-1">({product.reviewCount})</span>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-baseline gap-0.5 sm:gap-2 min-h-[2.5rem] sm:min-h-[2rem]">
            <span className="text-base sm:text-2xl font-extrabold text-primary">
              R$ {product.price.toFixed(2).replace('.', ',')}
            </span>
            {hasDiscount ? (
              <span className="text-[10px] sm:text-sm text-gray-400 line-through">
                R$ {product.originalPrice!.toFixed(2).replace('.', ',')}
              </span>
            ) : (
              <span className="text-[10px] sm:text-sm text-transparent select-none">-</span>
            )}
          </div>

          <p className="hidden sm:block text-sm text-gray-500 mt-2 line-clamp-2 min-h-[2.5rem]">
            {product.shortDescription}
          </p>

          <div className="mt-auto pt-2.5 sm:pt-4">
            <div className="py-1.5 sm:py-2 text-center bg-gray-50 -mx-2.5 sm:-mx-4 -mb-2.5 sm:-mb-4 group-hover:bg-primary group-hover:text-white transition-colors font-bold text-xs sm:text-base">
              
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
