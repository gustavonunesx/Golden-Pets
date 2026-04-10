import { headers } from 'next/headers'
import { redirect } from 'next/navigation'
import AdminSidebar from '@/components/admin/AdminSidebar'

// Este layout só é renderizado se o middleware já validou o acesso.
// O middleware bloqueia qualquer acesso não autorizado ANTES de chegar aqui.
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Lê o role injetado pelo middleware no header
  // Assim não precisa fazer nova query ao banco
  const headersList = await headers()
  const adminRole = headersList.get('x-admin-role')
  const userId = headersList.get('x-user-id')

  // Segurança extra: se por algum motivo os headers não vieram, bloqueia
  if (!adminRole || !userId) {
    redirect('/admin/login')
  }

  return (
    <div style={{
      display: 'flex',
      minHeight: '100vh',
      background: '#f9fafb',
    }}>
      {/* Sidebar de navegação do admin */}
      <AdminSidebar role={adminRole} />

      {/* Conteúdo principal */}
      <main style={{
        flex: 1,
        padding: '32px',
        overflowY: 'auto',
        marginLeft: '240px', // largura da sidebar
      }}>
        {children}
      </main>
    </div>
  )
}