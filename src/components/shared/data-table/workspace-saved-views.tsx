'use client'

import type { ComponentProps } from 'react'
import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { DataTableSavedViews } from './data-table-saved-views'

type Props = ComponentProps<typeof DataTableSavedViews> & { label: string; hint: string }

export function WorkspaceSavedViews({ label, hint, ...props }: Props) {
  return (
    <Popover>
      <PopoverTrigger
        render={
          <Button variant="outline" size="sm" className="h-9">
            {props.views.find((view) => view.id === props.activeViewId)?.name ?? label}
          </Button>
        }
      />
      <PopoverContent align="end" className="w-[min(30rem,calc(100vw-2rem))]">
        <p className="text-sm font-medium">{label}</p>
        <div className="overflow-x-auto">
          <DataTableSavedViews {...props} />
        </div>
        <p className="mt-3 text-xs text-muted-foreground">{hint}</p>
      </PopoverContent>
    </Popover>
  )
}
