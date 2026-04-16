'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetDescription,
} from '@/components/ui/sheet'
import { useCartStore, selectTotalItems, selectTotalPrice } from '@/stores/cart-store'
import { CustomButton } from '@/components/ui/custom-button'

interface CartDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CartDrawer({ open, onOpenChange }: CartDrawerProps) {
  const items = useCartStore((s) => s.items)
  const removeItem = useCartStore((s) => s.removeItem)
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const totalItems = useCartStore(selectTotalItems)
  const totalPrice = useCartStore(selectTotalPrice)

  useEffect(() => {
    useCartStore.persist.rehydrate()
  }, [])

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="flex flex-col">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2 text-lg">
            <ShoppingBag className="w-5 h-5 text-primary" />
            Carrinho ({totalItems})
          </SheetTitle>
          <SheetDescription className="sr-only">
            Itens do seu carrinho de compras
          </SheetDescription>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-4">
            <ShoppingBag className="w-16 h-16 text-gray-200 mb-4" />
            <p className="font-bold text-gray-800 mb-1">Carrinho vazio</p>
            <p className="text-sm text-gray-500">
              Adicione produtos para continuar
            </p>
          </div>
        ) : (
          <>
            {/* Items List */}
            <div className="flex-1 overflow-y-auto px-4 space-y-4">
              {items.map((item) => (
                <div
                  key={item.productId}
                  className="flex gap-3 p-3 bg-gray-50 rounded-xl"
                >
                  {/* Imagem do produto */}
                  {item.imageUrl ? (
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-16 h-16 rounded-lg shrink-0 object-cover"
                    />
                  ) : (
                    <div
                      className="w-16 h-16 rounded-lg shrink-0 flex items-center justify-center"
                      style={{ backgroundColor: item.imageColor }}
                    >
                      <span className="text-white text-xs font-bold text-center leading-tight px-1">
                        {item.name.split(' ').slice(0, 2).join(' ')}
                      </span>
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/produto/${item.slug}`}
                      onClick={() => onOpenChange(false)}
                      className="font-semibold text-sm text-gray-800 hover:text-primary transition-colors line-clamp-1"
                    >
                      {item.name}
                    </Link>
                    <p className="text-primary font-bold text-sm mt-0.5">
                      R$ {item.price.toFixed(2).replace('.', ',')}
                    </p>

                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center border border-gray-200 rounded-lg">
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                          className="p-1.5 hover:bg-gray-100 transition-colors rounded-l-lg"
                          aria-label="Diminuir quantidade"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-8 text-center text-sm font-medium">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                          className="p-1.5 hover:bg-gray-100 transition-colors rounded-r-lg"
                          aria-label="Aumentar quantidade"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeItem(item.productId)}
                        className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                        aria-label="Remover item"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <SheetFooter className="border-t border-gray-100 pt-4">
              <div className="flex items-center justify-between mb-3">
                <span className="font-bold text-gray-800">Total</span>
                <span className="text-xl font-extrabold text-primary">
                  R$ {totalPrice.toFixed(2).replace('.', ',')}
                </span>
              </div>
              <CustomButton
                variant="primary"
                size="lg"
                className="w-full"
                onClick={() => onOpenChange(false)}
              >
                Finalizar compra
              </CustomButton>
              <button
                onClick={() => onOpenChange(false)}
                className="text-sm text-gray-500 hover:text-primary transition-colors text-center mt-1"
              >
                Continuar comprando
              </button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
