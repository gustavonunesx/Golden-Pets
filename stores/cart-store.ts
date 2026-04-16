import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface CartItem {
  productId: string
  slug: string
  name: string
  price: number
  imageColor: string
  imageUrl?: string
  quantity: number
}

interface CartStore {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
}

export const useCartStore = create<CartStore>()(
  persist(
    (set) => ({
      items: [],

      addItem: (item, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.productId === item.productId)
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.productId === item.productId
                  ? { ...i, quantity: i.quantity + quantity }
                  : i
              ),
            }
          }
          return { items: [...state.items, { ...item, quantity }] }
        }),

      removeItem: (productId) =>
        set((state) => ({
          items: state.items.filter((i) => i.productId !== productId),
        })),

      updateQuantity: (productId, quantity) =>
        set((state) => {
          if (quantity <= 0) {
            return { items: state.items.filter((i) => i.productId !== productId) }
          }
          return {
            items: state.items.map((i) =>
              i.productId === productId ? { ...i, quantity } : i
            ),
          }
        }),

      clearCart: () => set({ items: [] }),
    }),
    {
      name: 'golden-pets-cart',
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    }
  )
)

// Selectors
export const selectTotalItems = (state: { items: CartItem[] }) =>
  state.items.reduce((sum, item) => sum + item.quantity, 0)

export const selectTotalPrice = (state: { items: CartItem[] }) =>
  state.items.reduce((sum, item) => sum + item.price * item.quantity, 0)
