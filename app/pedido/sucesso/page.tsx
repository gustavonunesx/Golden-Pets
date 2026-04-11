import Link from 'next/link'
import { CheckCircle, Clock, Package } from 'lucide-react'

interface Props {
  searchParams: Promise<{ order?: string; status?: string }>
}

export default async function PedidoSucessoPage({ searchParams }: Props) {
  const { order, status } = await searchParams
  const isPending = status === 'pending'

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f9fafb',
      padding: '24px',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '16px',
        border: '1px solid #e5e7eb',
        padding: '48px 40px',
        width: '100%',
        maxWidth: '480px',
        textAlign: 'center',
      }}>
        {/* Ícone */}
        <div style={{ marginBottom: '24px' }}>
          {isPending ? (
            <Clock size={64} color="#f97316" style={{ margin: '0 auto' }} />
          ) : (
            <CheckCircle size={64} color="#22c55e" style={{ margin: '0 auto' }} />
          )}
        </div>

        {/* Título */}
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1f2937', marginBottom: '12px' }}>
          {isPending ? 'Pagamento em análise' : 'Pedido confirmado!'}
        </h1>

        <p style={{ fontSize: '15px', color: '#6b7280', lineHeight: 1.6, marginBottom: '24px' }}>
          {isPending
            ? 'Seu pagamento está sendo processado. Assim que confirmado, você receberá um e-mail.'
            : 'Seu pagamento foi aprovado. Você receberá um e-mail com os detalhes do pedido em breve.'}
        </p>

        {/* Número do pedido */}
        {order && (
          <div style={{
            background: '#f9fafb',
            border: '1px solid #e5e7eb',
            borderRadius: '10px',
            padding: '14px 20px',
            marginBottom: '32px',
          }}>
            <div style={{ fontSize: '12px', color: '#9ca3af', marginBottom: '4px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Número do pedido
            </div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#374151', fontFamily: 'monospace' }}>
              {order}
            </div>
          </div>
        )}

        {/* Próximos passos */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          marginBottom: '32px',
          textAlign: 'left',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <Package size={18} color="#f97316" style={{ marginTop: '2px', flexShrink: 0 }} />
            <span style={{ fontSize: '14px', color: '#374151' }}>
              Seu pedido será preparado e enviado em até 2 dias úteis após a confirmação do pagamento.
            </span>
          </div>
        </div>

        {/* Botões */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <Link
            href="/produtos"
            style={{
              display: 'block',
              background: '#f97316',
              color: '#fff',
              borderRadius: '8px',
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: 700,
              textDecoration: 'none',
              textAlign: 'center',
            }}
          >
            Continuar comprando
          </Link>
          <Link
            href="/"
            style={{
              display: 'block',
              background: 'transparent',
              color: '#6b7280',
              borderRadius: '8px',
              padding: '10px 24px',
              fontSize: '14px',
              textDecoration: 'none',
              textAlign: 'center',
            }}
          >
            Voltar ao início
          </Link>
        </div>
      </div>
    </div>
  )
}
