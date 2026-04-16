'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

interface DeleteProductDialogProps {
  productId: string
  productName: string
}

export function DeleteProductDialog({ productId, productName }: DeleteProductDialogProps) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/products/${productId}`, { method: 'DELETE' })
      if (res.ok) {
        setOpen(false)
        router.refresh()
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        style={{
          padding: '6px 12px',
          background: 'transparent',
          border: '1px solid #fca5a5',
          borderRadius: '6px',
          color: '#dc2626',
          fontSize: '13px',
          cursor: 'pointer',
        }}
      >
        Desativar
      </button>

      {open && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 50,
          background: 'rgba(0,0,0,0.4)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          <div style={{
            background: '#fff', borderRadius: '12px', padding: '32px',
            maxWidth: '420px', width: '90%', boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
          }}>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '12px', color: '#111' }}>
              Desativar produto
            </h3>
            <p style={{ color: '#6b7280', marginBottom: '24px', lineHeight: 1.6 }}>
              O produto <strong>"{productName}"</strong> será desativado e não aparecerá mais na loja.
              Pedidos existentes não serão afetados.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setOpen(false)}
                style={{
                  padding: '8px 20px', background: '#f3f4f6', border: 'none',
                  borderRadius: '8px', cursor: 'pointer', fontWeight: 600, color: '#374151',
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={loading}
                style={{
                  padding: '8px 20px', background: '#dc2626', border: 'none',
                  borderRadius: '8px', cursor: loading ? 'not-allowed' : 'pointer',
                  fontWeight: 600, color: '#fff', opacity: loading ? 0.7 : 1,
                }}
              >
                {loading ? 'Desativando...' : 'Confirmar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
