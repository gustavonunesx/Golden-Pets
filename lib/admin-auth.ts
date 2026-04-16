import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'

export class AdminAuthError extends Error {
  constructor(public code: 'UNAUTHENTICATED' | 'FORBIDDEN') {
    super(code)
  }
}

export interface AdminSession {
  userId: string
  role: string
}

export async function requireAdminSession(): Promise<AdminSession> {
  const supabase = await createClient()
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    throw new AdminAuthError('UNAUTHENTICATED')
  }

  const adminClient = createAdminClient()
  const { data: adminRecord } = await adminClient
    .from('admin_users')
    .select('id, role')
    .eq('id', user.id)
    .single()

  if (!adminRecord) {
    throw new AdminAuthError('FORBIDDEN')
  }

  return { userId: user.id, role: adminRecord.role }
}
