'use client'

import Link from 'next/link'
import { ToggleActiveButton } from './ToggleActiveButton'
import { DeleteProductDialog } from './DeleteProductDialog'

interface ProductRow {
  id: string
  name: string
  slug: string
  price: number
  original_price: number | null
  badge: string | null
  in_stock: boolean
  active: boolean
  created_at: string
  categories: { name: string } | null
}

interface ProductsTableProps {
  products: ProductRow[]
}

export function ProductsTable({ products }: ProductsTableProps) {
  if (products.length === 0) {
    return (
      <div style={{
        background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb',
        padding: '48px', textAlign: 'center', color: '#9ca3af',
      }}>
        <p style={{ fontSize: '16px', marginBottom: '8px' }}>Nenhum produto cadastrado ainda.</p>
        <Link href="/admin/produtos/novo" style={{
          color: '#f97316', textDecoration: 'none', fontWeight: 600,
        }}>
          Cadastrar primeiro produto →
        </Link>
      </div>
    )
  }

  return (
    <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', overflow: 'hidden' }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
              {['Produto', 'Categoria', 'Preço', 'Badge', 'Estoque', 'Status', 'Ações'].map(col => (
                <th key={col} style={{
                  padding: '12px 16px', textAlign: 'left',
                  fontSize: '12px', fontWeight: 600, color: '#6b7280', textTransform: 'uppercase',
                  letterSpacing: '0.05em', whiteSpace: 'nowrap',
                }}>
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map((product, i) => (
              <tr
                key={product.id}
                style={{
                  borderBottom: i < products.length - 1 ? '1px solid #f3f4f6' : 'none',
                  background: '#fff',
                }}
              >
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ fontWeight: 600, color: '#111', fontSize: '14px', marginBottom: '2px' }}>
                    {product.name}
                  </div>
                  <div style={{ fontSize: '12px', color: '#9ca3af' }}>{product.slug}</div>
                </td>
                <td style={{ padding: '14px 16px', fontSize: '14px', color: '#374151' }}>
                  {product.categories?.name ?? '—'}
                </td>
                <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                  <div style={{ fontSize: '14px', fontWeight: 700, color: '#f97316' }}>
                    R$ {product.price.toFixed(2).replace('.', ',')}
                  </div>
                  {product.original_price && (
                    <div style={{ fontSize: '12px', color: '#9ca3af', textDecoration: 'line-through' }}>
                      R$ {product.original_price.toFixed(2).replace('.', ',')}
                    </div>
                  )}
                </td>
                <td style={{ padding: '14px 16px' }}>
                  {product.badge ? (
                    <span style={{
                      padding: '3px 8px', borderRadius: '20px', fontSize: '11px', fontWeight: 600,
                      background: product.badge === 'mais-vendido' ? '#dbeafe' : product.badge === 'novo' ? '#dcfce7' : '#ffedd5',
                      color: product.badge === 'mais-vendido' ? '#1d4ed8' : product.badge === 'novo' ? '#16a34a' : '#ea580c',
                    }}>
                      {product.badge === 'mais-vendido' ? 'Mais vendido' : product.badge === 'novo' ? 'Novo' : 'Oferta'}
                    </span>
                  ) : (
                    <span style={{ color: '#9ca3af', fontSize: '13px' }}>—</span>
                  )}
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <span style={{
                    padding: '3px 8px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
                    background: product.in_stock ? '#dcfce7' : '#fee2e2',
                    color: product.in_stock ? '#16a34a' : '#dc2626',
                  }}>
                    {product.in_stock ? 'Em estoque' : 'Sem estoque'}
                  </span>
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <ToggleActiveButton productId={product.id} initialActive={product.active} />
                </td>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <Link
                      href={`/admin/produtos/${product.id}`}
                      style={{
                        padding: '6px 12px', background: '#f3f4f6', borderRadius: '6px',
                        fontSize: '13px', fontWeight: 600, color: '#374151',
                        textDecoration: 'none',
                      }}
                    >
                      Editar
                    </Link>
                    <DeleteProductDialog productId={product.id} productName={product.name} />
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
