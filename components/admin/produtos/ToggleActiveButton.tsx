'use client'

import { useState } from 'react'

interface ToggleActiveButtonProps {
  productId: string
  initialActive: boolean
  onToggle?: (newActive: boolean) => void
}

export function ToggleActiveButton({ productId, initialActive, onToggle }: ToggleActiveButtonProps) {
  const [active, setActive] = useState(initialActive)
  const [loading, setLoading] = useState(false)

  async function handleToggle() {
    setLoading(true)
    try {
      const res = await fetch(`/api/admin/products/${productId}/toggle-active`, { method: 'PATCH' })
      if (res.ok) {
        const { active: newActive } = await res.json()
        setActive(newActive)
        onToggle?.(newActive)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      title={active ? 'Desativar produto' : 'Ativar produto'}
      style={{
        padding: '4px 10px',
        borderRadius: '20px',
        fontSize: '12px',
        fontWeight: 600,
        border: 'none',
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.6 : 1,
        background: active ? '#dcfce7' : '#fee2e2',
        color: active ? '#16a34a' : '#dc2626',
        transition: 'all 0.15s',
      }}
    >
      {active ? 'Ativo' : 'Inativo'}
    </button>
  )
}
