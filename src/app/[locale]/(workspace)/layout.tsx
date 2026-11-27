import type { ReactNode } from 'react'
import { WorkspaceShell } from '@/components/layout/workspace-shell'
import { requireSession } from '@/lib/auth/access'

export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: ReactNode
  params: Promise<{ locale: string }>
}) {
  const session = await requireSession((await params).locale)
  return <WorkspaceShell identity={session.user}>{children}</WorkspaceShell>
}
