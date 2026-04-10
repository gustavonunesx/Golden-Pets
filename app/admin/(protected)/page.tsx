export default function AdminDashboard() {
  return (
    <div>
      <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1f2937', marginBottom: '8px' }}>
        Dashboard
      </h1>
      <p style={{ color: '#6b7280', marginBottom: '32px' }}>
        Bem-vindo ao painel administrativo do Golden Pets.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
        {[
          { label: 'Pedidos', value: '—', color: '#f97316' },
          { label: 'Receita Total', value: '—', color: '#10b981' },
          { label: 'Pedidos Pendentes', value: '—', color: '#f59e0b' },
          { label: 'Produtos Ativos', value: '—', color: '#6366f1' },
        ].map((card) => (
          <div
            key={card.label}
            style={{
              background: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '12px',
              padding: '24px',
            }}
          >
            <p style={{ fontSize: '13px', color: '#6b7280', marginBottom: '8px' }}>{card.label}</p>
            <p style={{ fontSize: '28px', fontWeight: 800, color: card.color }}>{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
