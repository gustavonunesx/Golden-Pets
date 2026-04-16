import { createAdminClient } from '@/lib/supabase/admin'
import { ProductForm } from '@/components/admin/produtos/ProductForm'

export default async function AdminNovoProduto() {
  const supabase = createAdminClient()
  const { data: categories } = await supabase
    .from('categories')
    .select('id, name')
    .order('name', { ascending: true })

  return (
    <div>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1f2937', marginBottom: '4px' }}>
          Novo produto
        </h1>
        <p style={{ color: '#6b7280', fontSize: '14px' }}>Preencha os dados para cadastrar um novo produto na loja.</p>
      </div>

      {/* Aviso sobre imagens */}
      <div style={{
        background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: '10px',
        padding: '14px 18px', marginBottom: '20px',
        display: 'flex', gap: '10px', alignItems: 'flex-start',
      }}>
        <span style={{ fontSize: '18px', flexShrink: 0 }}>🖼️</span>
        <p style={{ fontSize: '14px', color: '#9a3412', margin: 0, lineHeight: 1.5 }}>
          <strong>Imagens são adicionadas após criar o produto.</strong> Preencha os dados abaixo,
          salve e você será redirecionado para a tela de edição onde poderá fazer upload das fotos.
        </p>
      </div>

      <div style={{
        background: '#fff', borderRadius: '12px', border: '1px solid #e5e7eb', padding: '32px',
      }}>
        <ProductForm
          mode="create"
          categories={categories ?? []}
        />
      </div>
    </div>
  )
}
