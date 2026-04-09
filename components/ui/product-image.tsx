'use client'

import { motion } from 'framer-motion'

interface ProductImageProps {
  color: string
  name: string
  className?: string
}

export function ProductImage({ color, name, className = '' }: ProductImageProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      className={`relative w-full aspect-square rounded-xl overflow-hidden ${className}`}
      style={{ backgroundColor: `${color}15` }}
    >
      <svg
        viewBox="0 0 200 200"
        className="w-full h-full"
        aria-label={`Imagem de ${name}`}
      >
        {/* Paw print icon */}
        <g transform="translate(50, 50)" fill={color} opacity="0.8">
          {/* Main pad */}
          <ellipse cx="50" cy="70" rx="30" ry="25" />
          {/* Top left toe */}
          <ellipse cx="20" cy="35" rx="12" ry="15" transform="rotate(-20, 20, 35)" />
          {/* Top right toe */}
          <ellipse cx="80" cy="35" rx="12" ry="15" transform="rotate(20, 80, 35)" />
          {/* Bottom left toe */}
          <ellipse cx="25" cy="55" rx="10" ry="13" transform="rotate(-10, 25, 55)" />
          {/* Bottom right toe */}
          <ellipse cx="75" cy="55" rx="10" ry="13" transform="rotate(10, 75, 55)" />
        </g>
      </svg>
    </motion.div>
  )
}
