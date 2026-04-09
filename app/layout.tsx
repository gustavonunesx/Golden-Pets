import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import './globals.css'

const inter = Inter({ 
  subsets: ['latin'],
  weight: ['400', '700', '800', '900'],
  variable: '--font-inter'
})

export const metadata: Metadata = {
  title: 'Golden Pets - Cuidado que seu pet merece',
  description: 'Loja de produtos premium para pets. Coleiras, camas, brinquedos, alimentação e muito mais para seu cachorro ou gato. Entrega rápida para todo o Brasil.',
  keywords: 'pet shop, produtos para pets, cachorro, gato, coleira, cama pet, brinquedos pet, ração',
  authors: [{ name: 'Golden Pets' }],
  creator: 'Golden Pets',
  icons: {
    icon: '/favicon.ico',
  },
}

export const viewport: Viewport = {
  themeColor: '#f97316',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
