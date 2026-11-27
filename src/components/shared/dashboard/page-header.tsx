import type { ReactNode } from 'react'
import { WorkspaceHeader } from './workspace-header'

/** Backward-compatible entry point; all workspace headings share one visual baseline. */
export function DashboardPageHeader(props: {
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
}) {
  return <WorkspaceHeader {...props} />
}
