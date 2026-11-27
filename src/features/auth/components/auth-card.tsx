import type { LucideIcon } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import type { ReactNode } from 'react'

interface AuthCardProps {
  title: string
  description?: string
  icon?: LucideIcon
  children: ReactNode
  footer?: ReactNode
}

export async function AuthCard({
  title,
  description,
  icon: Icon,
  children,
  footer,
}: AuthCardProps) {
  const t = await getTranslations('auth.access')
  return (
    <div className="w-full min-w-0 space-y-6 rounded-lg border bg-card shadow-sm p-6 text-card-foreground sm:p-8">
      {/* Header */}
      <div className="min-w-0 space-y-5">
        {Icon && (
          <div className="flex min-w-0 items-center gap-3 text-xs leading-4 font-medium text-muted-foreground">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-md border bg-background text-primary">
              <Icon className="size-4" />
            </span>
            <span className="min-w-0 truncate">{t('secureAccess')}</span>
          </div>
        )}
        <div className="min-w-0 space-y-2.5">
          <h1 className="text-balance break-words text-2xl leading-8 font-semibold tracking-tight">
            {title}
          </h1>
          {description && (
            <p className="break-words text-muted-foreground text-sm leading-relaxed">
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="min-w-0 border-t pt-6 [&_button]:rounded-md [&_button.w-full]:h-auto [&_button.w-full]:min-h-11 [&_button.w-full]:whitespace-normal [&_input]:h-10 [&_input]:rounded-md [&_input]:bg-background [&_input]:shadow-none [&_[data-slot=select-trigger]]:rounded-md [&_[data-slot=select-value]]:truncate">
        {children}
      </div>

      {/* Footer */}
      {footer && (
        <div className="min-w-0 break-words border-t pt-5 text-center text-muted-foreground text-sm [&_a]:text-foreground [&_a]:decoration-primary [&_a]:decoration-2 [&_a]:underline-offset-4 hover:[&_a]:text-primary">
          {footer}
        </div>
      )}
    </div>
  )
}
