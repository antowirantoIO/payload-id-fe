'use client'

import { Drawer as DrawerPrimitive } from '@base-ui/react/drawer'
import { XIcon } from 'lucide-react'
import type * as React from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * Sheet — side panel built on base-ui Drawer.
 *
 * Drawer dipakai dgn `swipeDirection="right"` agar slide-in dari kanan.
 * Default modal=true (focus trap + scroll lock). Set modal="trap-focus" kalau
 * ingin tetap bisa interact dgn page di belakang (mis. inline edit row di table
 * sambil panel terbuka).
 */

function Sheet({ ...props }: DrawerPrimitive.Root.Props) {
  return <DrawerPrimitive.Root data-slot="sheet" swipeDirection="right" {...props} />
}

function SheetTrigger({ ...props }: DrawerPrimitive.Trigger.Props) {
  return <DrawerPrimitive.Trigger data-slot="sheet-trigger" {...props} />
}

function SheetClose({ ...props }: DrawerPrimitive.Close.Props) {
  return <DrawerPrimitive.Close data-slot="sheet-close" {...props} />
}

function SheetPortal({ ...props }: DrawerPrimitive.Portal.Props) {
  return <DrawerPrimitive.Portal data-slot="sheet-portal" {...props} />
}

function SheetOverlay({ className, ...props }: DrawerPrimitive.Backdrop.Props) {
  return (
    <DrawerPrimitive.Backdrop
      data-slot="sheet-overlay"
      className={cn(
        'fixed inset-0 z-50 bg-foreground/30 backdrop-blur-sm data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0',
        className,
      )}
      {...props}
    />
  )
}

interface SheetContentProps extends DrawerPrimitive.Popup.Props {
  side?: 'right' | 'left'
  showCloseButton?: boolean
}

function SheetContent({
  className,
  children,
  side = 'right',
  showCloseButton = true,
  ...props
}: SheetContentProps) {
  return (
    <SheetPortal>
      <SheetOverlay />
      <DrawerPrimitive.Viewport className="pointer-events-none fixed inset-0 z-50">
        <DrawerPrimitive.Popup
          data-slot="sheet-content"
          data-side={side}
          className={cn(
            'pointer-events-auto fixed inset-y-0 z-50 flex h-full w-full max-w-lg flex-col gap-0 overflow-hidden border-border/60 bg-background shadow-2xl outline-none transition ease-in-out',
            'data-open:animate-in data-open:duration-200 data-closed:animate-out data-closed:duration-150',
            side === 'right' &&
              'right-0 data-open:slide-in-from-right data-closed:slide-out-to-right border-l',
            side === 'left' &&
              'left-0 data-open:slide-in-from-left data-closed:slide-out-to-left border-r',
            className,
          )}
          {...props}
        >
          {children}
          {showCloseButton && (
            <DrawerPrimitive.Close
              data-slot="sheet-close-button"
              render={<Button variant="ghost" size="icon-sm" className="absolute top-3 right-3" />}
            >
              <XIcon className="size-4" />
              <span className="sr-only">Close</span>
            </DrawerPrimitive.Close>
          )}
        </DrawerPrimitive.Popup>
      </DrawerPrimitive.Viewport>
    </SheetPortal>
  )
}

function SheetHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sheet-header"
      className={cn('flex flex-col gap-1.5 border-b border-border/60 px-6 py-4', className)}
      {...props}
    />
  )
}

function SheetFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sheet-footer"
      className={cn(
        'mt-auto flex flex-col-reverse gap-2 border-t border-border/60 bg-surface/50 px-6 py-4 sm:flex-row sm:justify-end',
        className,
      )}
      {...props}
    />
  )
}

function SheetTitle({ className, ...props }: DrawerPrimitive.Title.Props) {
  return (
    <DrawerPrimitive.Title
      data-slot="sheet-title"
      className={cn('text-base font-semibold leading-none tracking-tight', className)}
      {...props}
    />
  )
}

function SheetDescription({ className, ...props }: DrawerPrimitive.Description.Props) {
  return (
    <DrawerPrimitive.Description
      data-slot="sheet-description"
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  )
}

function SheetBody({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="sheet-body"
      className={cn('flex-1 overflow-y-auto px-6 py-4', className)}
      {...props}
    />
  )
}

export {
  Sheet,
  SheetBody,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetOverlay,
  SheetPortal,
  SheetTitle,
  SheetTrigger,
}
