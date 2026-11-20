import type { ReactNode } from 'react'

interface DashboardPageHeaderProps {
  title: ReactNode
  description?: ReactNode
  actions?: ReactNode
}

export function DashboardPageHeader({ title, description, actions }: DashboardPageHeaderProps) {
  return (
    <header className="flex flex-col items-start justify-between gap-3 border-b border-border pb-3 sm:flex-row sm:items-end">
      <div className="min-w-0 space-y-1">
        <div className="flex items-center gap-2 text-xs leading-4 font-medium text-muted-foreground">
          <span className="h-px w-4 bg-primary" />
          Operations workspace
        </div>
        <div className="flex flex-wrap items-baseline gap-x-3 gap-y-0.5">
          <h1 className="text-balance text-2xl leading-8 font-semibold tracking-tight">{title}</h1>
          {description && (
            <p className="max-w-2xl text-sm leading-6 text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      {actions && <div className="w-full sm:w-auto sm:shrink-0">{actions}</div>}
    </header>
  )
}
