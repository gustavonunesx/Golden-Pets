'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, User, LogOut, Package } from 'lucide-react'
import { AuthModal } from '@/components/sections/AuthModal'
import { CartDrawer } from '@/components/sections/CartDrawer'
import { CartButton } from '@/components/ui/cart-button'
import { createClient } from '@/lib/supabase/client'
import type { User as SupabaseUser } from '@supabase/supabase-js'

const navLinks = [
  { href: '/produtos', label: 'Produtos' },
  { href: '#categorias', label: 'Categorias' },
  { href: '#sobre', label: 'Sobre' },
  { href: '#rastrear', label: 'Rastrear Pedido' },
]

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [authOpen, setAuthOpen] = useState(false)
  const [authTab, setAuthTab] = useState<'login' | 'register'>('login')
  const [cartOpen, setCartOpen] = useState(false)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Carrega sessão ao montar
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })

    return () => subscription.unsubscribe()
  }, [])

  const openLogin = () => {
    setAuthTab('login')
    setAuthOpen(true)
    setIsMobileMenuOpen(false)
  }

  const openRegister = () => {
    setAuthTab('register')
    setAuthOpen(true)
    setIsMobileMenuOpen(false)
  }

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUser(null)
    setUserMenuOpen(false)
    setIsMobileMenuOpen(false)
  }

  const userName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Minha conta'

  return (
    <>
      <motion.nav
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          isScrolled ? 'bg-white shadow-md' : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2">
              <svg viewBox="0 0 40 40" className="w-8 h-8 md:w-10 md:h-10" aria-hidden="true">
                <g fill="#f97316">
                  <ellipse cx="20" cy="26" rx="10" ry="8" />
                  <ellipse cx="8" cy="14" rx="4" ry="5" transform="rotate(-20, 8, 14)" />
                  <ellipse cx="32" cy="14" rx="4" ry="5" transform="rotate(20, 32, 14)" />
                  <ellipse cx="10" cy="21" rx="3.5" ry="4.5" transform="rotate(-10, 10, 21)" />
                  <ellipse cx="30" cy="21" rx="3.5" ry="4.5" transform="rotate(10, 30, 21)" />
                </g>
              </svg>
              <span className="text-xl md:text-2xl font-black">
                <span className="text-gray-800">Golden</span>
                <span className="text-primary">Pets</span>
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-600 hover:text-primary font-medium transition-colors"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Desktop Auth Buttons / User Menu */}
            <div className="hidden md:flex items-center gap-3">
              <CartButton onClick={() => setCartOpen(true)} />

              {user ? (
                <div className="relative">
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-full border-2 border-primary text-primary font-bold text-sm hover:bg-primary/10 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    <span className="max-w-[120px] truncate">{userName}</span>
                  </motion.button>

                  <AnimatePresence>
                    {userMenuOpen && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-lg border border-gray-100 overflow-hidden z-50"
                      >
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-bold text-gray-800 truncate">{userName}</p>
                          <p className="text-xs text-gray-500 truncate">{user.email}</p>
                        </div>
                        <div className="py-1">
                          <Link
                            href="/minha-conta"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <User className="w-4 h-4 text-gray-400" />
                            Minha conta
                          </Link>
                          <Link
                            href="/minha-conta/pedidos"
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                          >
                            <Package className="w-4 h-4 text-gray-400" />
                            Meus pedidos
                          </Link>
                          <button
                            onClick={handleLogout}
                            className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <LogOut className="w-4 h-4" />
                            Sair
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ) : (
                <>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={openLogin}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-full border-2 border-primary text-primary font-bold text-sm hover:bg-primary/10 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Entrar
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={openRegister}
                    className="px-5 py-2.5 rounded-full bg-primary text-white font-bold text-sm hover:bg-orange-400 transition-colors"
                  >
                    Criar conta
                  </motion.button>
                </>
              )}
            </div>

            {/* Mobile Cart + Menu */}
            <div className="flex items-center gap-2 md:hidden">
              <CartButton onClick={() => setCartOpen(true)} />
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 text-gray-800"
                aria-label={isMobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden bg-white border-t border-gray-100 overflow-hidden"
            >
              <div className="px-4 py-6 space-y-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block text-gray-600 hover:text-primary font-medium transition-colors py-2"
                  >
                    {link.label}
                  </Link>
                ))}

                {user ? (
                  <div className="pt-2 space-y-3 border-t border-gray-100">
                    <div className="py-2">
                      <p className="font-bold text-gray-800 text-sm">{userName}</p>
                      <p className="text-xs text-gray-500">{user.email}</p>
                    </div>
                    <Link
                      href="/minha-conta"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 py-2 text-gray-600 hover:text-primary font-medium transition-colors"
                    >
                      <User className="w-4 h-4" />
                      Minha conta
                    </Link>
                    <Link
                      href="/minha-conta/pedidos"
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-3 py-2 text-gray-600 hover:text-primary font-medium transition-colors"
                    >
                      <Package className="w-4 h-4" />
                      Meus pedidos
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 w-full py-2 text-red-600 hover:text-red-700 font-medium transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sair da conta
                    </button>
                  </div>
                ) : (
                  <div className="pt-2 space-y-3">
                    <button
                      onClick={openLogin}
                      className="w-full flex items-center justify-center gap-2 py-3 rounded-full border-2 border-primary text-primary font-bold text-sm hover:bg-primary/10 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      Entrar na minha conta
                    </button>
                    <button
                      onClick={openRegister}
                      className="w-full py-3 rounded-full bg-primary text-white font-bold text-sm hover:bg-orange-400 transition-colors"
                    >
                      Criar conta grátis
                    </button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>

      <AuthModal
        isOpen={authOpen}
        onClose={() => setAuthOpen(false)}
        defaultTab={authTab}
      />

      <CartDrawer open={cartOpen} onOpenChange={setCartOpen} />
    </>
  )
}
