'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const NAV_ITEMS = [
  { href: '/admin', label: 'Dashboard', icon: '◻' },
  { href: '/admin/produtos', label: 'Produtos', icon: '◻' },
  { href: '/admin/pedidos', label: 'Pedidos', icon: '◻' },
  { href: '/admin/clientes', label: 'Clientes', icon: '◻' },
]

export default function AdminSidebar({ role }: { role: string }) {
  const pathname = usePathname()
  const router = useRouter()

  const supabase = createClient()

  async function handleLogout() {
    await supabase.auth.signOut()
    router.push('/admin/login')
    router.refresh()
  }

  return (
    <aside style={{
      width: '240px',
      background: '#1f2937',
      position: 'fixed',
      top: 0,
      left: 0,
      height: '100vh',
      display: 'flex',
      flexDirection: 'column',
      padding: '24px 16px',
    }}>
      {/* Logo */}
      <div style={{ marginBottom: '32px', paddingLeft: '8px' }}>
        <div style={{ fontSize: '18px', fontWeight: 800, letterSpacing: '0.05em' }}>
          <span style={{ color: '#f97316' }}>GOLDEN</span>
          <span style={{ color: '#fff' }}>PETS</span>
        </div>
        <div style={{
          fontSize: '10px',
          color: '#6b7280',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          marginTop: '2px',
        }}>
          {role === 'super_admin' ? 'Super Admin' : 'Admin'}
        </div>
      </div>

      {/* Navegação */}
      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
        {NAV_ITEMS.map(item => {
          const isActive = pathname === item.href ||
            (item.href !== '/admin' && pathname.startsWith(item.href))

          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 12px',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: isActive ? 600 : 400,
                color: isActive ? '#fff' : '#9ca3af',
                background: isActive ? '#374151' : 'transparent',
                textDecoration: 'none',
                transition: 'all 0.15s',
              }}
            >
              <span style={{ fontSize: '16px' }}>{item.icon}</span>
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Botão de logout */}
      <button
        onClick={handleLogout}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          padding: '10px 12px',
          borderRadius: '8px',
          fontSize: '14px',
          color: '#ef4444',
          background: 'transparent',
          border: '1px solid #374151',
          cursor: 'pointer',
          width: '100%',
          transition: 'background 0.15s',
        }}
      >
        ⬡ Sair
      </button>
    </aside>
  )
}