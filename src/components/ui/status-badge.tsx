'use client'

import type { LucideIcon } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export function StatusBadge({
  label,
  color = 'var(--foreground)',
  code,
  icon,
  className,
}: {
  label: string
  color?: string
  code: string | null | undefined
  icon?: LucideIcon
  className?: string
}) {
  if (!code) return <span className="text-muted-foreground/40 text-sm">—</span>
  const Icon = icon
  return (
    <Badge
      variant="outline"
      className={cn('gap-1.5 border text-[11px] font-medium transition-colors', className)}
      style={{
        backgroundColor: `color-mix(in oklch, ${color} 10%, transparent)`,
        borderColor: `color-mix(in oklch, ${color} 25%, transparent)`,
        color,
      }}
    >
      {Icon ? (
        <Icon className="size-3" />
      ) : (
        <span
          className="size-1.5 rounded-full ring-2 ring-current/15"
          style={{ backgroundColor: color }}
        />
      )}
      {label}
    </Badge>
  )
}
