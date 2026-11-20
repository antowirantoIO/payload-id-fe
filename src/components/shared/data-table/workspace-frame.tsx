import type { ReactNode } from 'react'

export function WorkspaceFrame({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section
      aria-label={label}
      className="min-w-0 rounded-lg border border-border bg-card shadow-xs"
    >
      <div className="space-y-4 p-3 md:p-5">
        <div className="min-w-0 overflow-hidden">{children}</div>
      </div>
    </section>
  )
}
