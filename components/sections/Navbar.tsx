'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X } from 'lucide-react'
import { CustomButton } from '@/components/ui/custom-button'

const navLinks = [
  { href: '/produtos', label: 'Produtos' },
  { href: '#categorias', label: 'Categorias' },
  { href: '#sobre', label: 'Sobre' },
  { href: '#rastrear', label: 'Rastrear Pedido' },
]

export function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
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

          {/* Desktop CTA */}
          <div className="hidden md:block">
            <CustomButton variant="primary" size="md">
              Comprar agora
            </CustomButton>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-gray-800"
            aria-label={isMobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
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
              <CustomButton variant="primary" size="md" className="w-full mt-4">
                Comprar agora
              </CustomButton>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
