import Link from 'next/link'

export default function ForbiddenPage() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f9fafb',
      textAlign: 'center',
      padding: '24px',
    }}>
      <div style={{
        fontSize: '80px',
        fontWeight: 800,
        color: '#ef4444',
        lineHeight: 1,
        marginBottom: '16px',
      }}>
        403
      </div>
      <h1 style={{ fontSize: '22px', fontWeight: 700, color: '#1f2937', marginBottom: '8px' }}>
        Acesso negado
      </h1>
      <p style={{ fontSize: '15px', color: '#6b7280', marginBottom: '32px', maxWidth: '360px' }}>
        Você está autenticado, mas não tem permissão para acessar o painel administrativo.
      </p>
      <Link
        href="/"
        style={{
          background: '#f97316',
          color: '#fff',
          padding: '12px 28px',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: 700,
          textDecoration: 'none',
        }}
      >
        Voltar para a loja
      </Link>
    </div>
  )
}