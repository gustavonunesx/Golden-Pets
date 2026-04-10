'use client'

import { useEffect, useState } from 'react'
import { ShoppingCart } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useCartStore, selectTotalItems } from '@/stores/cart-store'

interface CartButtonProps {
  onClick: () => void
}

export function CartButton({ onClick }: CartButtonProps) {
  const totalItems = useCartStore(selectTotalItems)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    useCartStore.persist.rehydrate()
    setHydrated(true)
  }, [])

  const count = hydrated ? totalItems : 0

  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className="relative p-2.5 rounded-full border-2 border-gray-200 hover:border-primary text-gray-600 hover:text-primary transition-colors"
      aria-label={`Carrinho com ${count} itens`}
    >
      <ShoppingCart className="w-5 h-5" />
      <AnimatePresence>
        {count > 0 && (
          <motion.span
            key="badge"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-primary text-white text-[10px] font-bold rounded-full flex items-center justify-center"
          >
            {count > 99 ? '99+' : count}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  )
}
