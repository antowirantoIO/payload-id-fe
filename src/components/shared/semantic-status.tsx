import { CheckCircle2, Circle, Clock3, Info, TriangleAlert } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

export type StatusTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info'
const icons = {
  neutral: Circle,
  success: CheckCircle2,
  warning: Clock3,
  danger: TriangleAlert,
  info: Info,
}
const styles: Record<StatusTone, string> = {
  neutral: 'border-border bg-muted text-muted-foreground',
  success: 'border-success/20 bg-success/10 text-success',
  warning: 'border-warning/20 bg-warning/10 text-warning',
  danger: 'border-destructive/20 bg-destructive/10 text-destructive',
  info: 'border-info/20 bg-info/10 text-info',
}

/** Domain code determines the tone; presentation never infers business eligibility. */
export function SemanticStatus({
  label,
  tone = 'neutral',
  className,
}: {
  label: string
  tone?: StatusTone
  className?: string
}) {
  const Icon = icons[tone]
  return (
    <Badge
      variant="outline"
      className={cn('h-6 gap-1.5 rounded-sm px-2 text-xs font-medium', styles[tone], className)}
    >
      <Icon aria-hidden="true" className="size-3" />
      {label}
    </Badge>
  )
}
