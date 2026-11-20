'use client'

import { Checkbox as CheckboxPrimitive } from '@base-ui/react/checkbox'
import { CheckIcon, MinusIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

function Checkbox({ className, ...props }: CheckboxPrimitive.Root.Props) {
  return (
    <CheckboxPrimitive.Root
      data-slot="checkbox"
      className={cn(
        'peer flex size-4 shrink-0 items-center justify-center rounded-[2px] border border-input bg-background outline-none transition-[color,background-color,border-color] duration-150 hover:border-primary/50 focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/25 disabled:cursor-not-allowed disabled:opacity-50 data-[checked]:border-primary data-[checked]:bg-primary data-[checked]:text-primary-foreground data-[indeterminate]:border-primary data-[indeterminate]:bg-primary data-[indeterminate]:text-primary-foreground',
        className,
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        data-slot="checkbox-indicator"
        className="flex items-center justify-center text-current"
        render={(indicatorProps, state) => (
          <span {...indicatorProps}>
            {state.indeterminate ? (
              <MinusIcon className="size-3" />
            ) : (
              <CheckIcon className="size-3" />
            )}
          </span>
        )}
      />
    </CheckboxPrimitive.Root>
  )
}

export { Checkbox }
