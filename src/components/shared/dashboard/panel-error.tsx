import { AlertTriangleIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface DashboardPanelErrorProps {
  onRetry?: () => void
  className?: string
}

export function DashboardPanelError({ onRetry, className }: DashboardPanelErrorProps) {
  return (
    <div
      className={cn(
        'flex min-h-52 flex-col items-center justify-center gap-3 px-6 text-center',
        className,
      )}
    >
      <div className="flex size-10 items-center justify-center bg-destructive/10 text-destructive">
        <AlertTriangleIcon className="size-4" />
      </div>
      <div className="space-y-1">
        <p className="font-semibold text-foreground text-sm">Unable to load this panel</p>
        <p className="max-w-xs text-muted-foreground text-xs">
          The dashboard data could not be retrieved. Try again in a moment.
        </p>
      </div>
      {onRetry && (
        <Button type="button" variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  )
}
