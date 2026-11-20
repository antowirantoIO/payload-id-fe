import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'

interface AuthCardProps {
  title: string
  description?: string
  icon?: LucideIcon
  children: ReactNode
  footer?: ReactNode
}

export function AuthCard({ title, description, icon: Icon, children, footer }: AuthCardProps) {
  return (
    <div className="w-full min-w-0 space-y-8">
      {/* Header */}
      <div className="min-w-0 space-y-5">
        {Icon && (
          <div className="flex min-w-0 items-center gap-3 text-xs leading-4 font-medium text-primary">
            <span className="flex size-9 shrink-0 items-center justify-center bg-primary text-primary-foreground">
              <Icon className="size-4" />
            </span>
            <span className="min-w-0 truncate">Secure account access</span>
          </div>
        )}
        <div className="min-w-0 space-y-2.5">
          <h1 className="text-balance break-words text-3xl leading-10 font-semibold tracking-tight">
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
      <div className="min-w-0 border-t border-foreground/15 pt-7 [&_button]:rounded-none [&_button.w-full]:h-auto [&_button.w-full]:min-h-10 [&_button.w-full]:whitespace-normal [&_input]:rounded-none [&_[data-slot=select-trigger]]:rounded-none [&_[data-slot=select-value]]:truncate">
        {children}
      </div>

      {/* Footer */}
      {footer && (
        <div className="min-w-0 break-words border-t border-foreground/15 pt-5 text-center text-muted-foreground text-sm [&_a]:text-foreground [&_a]:decoration-primary [&_a]:decoration-2 [&_a]:underline-offset-4 hover:[&_a]:text-primary">
          {footer}
        </div>
      )}
    </div>
  )
}
