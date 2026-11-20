'use client'

import { Collapsible } from '@base-ui/react/collapsible'
import { ChevronDownIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

function CollapsibleRoot({ className, ...props }: Collapsible.Root.Props & { className?: string }) {
  return <Collapsible.Root data-slot="collapsible" className={cn(className)} {...props} />
}

function CollapsibleTrigger({
  className,
  children,
  ...props
}: Collapsible.Trigger.Props & { className?: string }) {
  return (
    <Collapsible.Trigger
      data-slot="collapsible-trigger"
      className={cn('group/collapsible flex w-full items-center', className)}
      {...props}
    >
      {children}
      <ChevronDownIcon className="text-muted-foreground ml-auto size-4 shrink-0 transition-transform duration-200 group-data-[panel-open]/collapsible:rotate-180" />
    </Collapsible.Trigger>
  )
}

function CollapsibleContent({
  className,
  ...props
}: Collapsible.Panel.Props & { className?: string }) {
  return (
    <Collapsible.Panel
      data-slot="collapsible-content"
      className={cn('overflow-hidden transition-[height] duration-200', className)}
      {...props}
    />
  )
}

export { CollapsibleContent, CollapsibleRoot as Collapsible, CollapsibleTrigger }
