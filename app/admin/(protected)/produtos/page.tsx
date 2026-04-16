import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase/admin'
import { ProductsTable } from '@/components/admin/produtos/ProductsTable'

export default async function AdminProdutos() {
  const supabase = createAdminClient()
  const { data: products } = await supabase
    .from('products')
    .select('*, categories(id, name)')
    .order('created_at', { ascending: false })

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1f2937', marginBottom: '4px' }}>
            Produtos
          </h1>
          <p style={{ color: '#6b7280', fontSize: '14px' }}>
            {products?.length ?? 0} produto{(products?.length ?? 0) !== 1 ? 's' : ''} cadastrado{(products?.length ?? 0) !== 1 ? 's' : ''}
          </p>
        </div>
        <Link
          href="/admin/produtos/novo"
          style={{
            padding: '10px 20px', background: '#f97316', color: '#fff',
            borderRadius: '8px', textDecoration: 'none', fontWeight: 600, fontSize: '14px',
          }}
        >
          + Novo produto
        </Link>
      </div>

      <ProductsTable products={products ?? []} />
    </div>
  )
}
