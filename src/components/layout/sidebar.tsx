'use client'

import { useQuery } from '@tanstack/react-query'
import { ChevronDownIcon, ChevronsLeftIcon, LogOutIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useId, useState } from 'react'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { profileOptions } from '@/features/account/client'
import { useLogout } from '@/features/auth/client'
import { Link, usePathname } from '@/i18n/navigation'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/stores/ui-store'
import { featureNavigation } from './features'

interface SidebarProps {
  email: string
  name?: string | null
  role?: string
}

function Brand({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <Link
      href="/dashboard"
      aria-label="Payloads"
      className="flex items-center gap-2 font-semibold tracking-tight focus-visible:outline-2 focus-visible:outline-ring"
    >
      <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
        P
      </span>
      {!collapsed && (
        <span className="text-lg">
          Payloads<span className="text-primary">.</span>
        </span>
      )}
    </Link>
  )
}

function Navigation({
  collapsed = false,
  onNavigate,
}: {
  collapsed?: boolean
  onNavigate?: () => void
}) {
  const t = useTranslations('dashboardChrome')
  const pathname = usePathname()
  const { data: profile } = useQuery(profileOptions())
  const groups = featureNavigation(profile)
  const [expanded, setExpanded] = useState<Record<string, boolean>>({})
  const navigationId = useId()
  return (
    <nav
      aria-label={t('featureNavigation')}
      className="flex-1 space-y-5 overflow-y-auto px-2 py-4 [scrollbar-width:thin]"
    >
      {groups.map((group) => (
        <div key={group.label} className="space-y-0.5">
          {!collapsed && (
            <div className="mb-1.5 px-2.5 text-xs leading-4 font-medium text-muted-foreground">
              {t(group.label)}
            </div>
          )}
          {group.items.map((item) => {
            const active = pathname === item.href || pathname.startsWith(`${item.href}/`)
            const Icon = item.icon
            const open = expanded[item.href] ?? Boolean(active)
            const panelId = `${navigationId}-${item.href.replaceAll('/', '-')}`
            if (!collapsed && item.children.length > 0) {
              return (
                <div key={item.href}>
                  <button
                    type="button"
                    aria-expanded={open}
                    aria-controls={panelId}
                    onClick={() => setExpanded((previous) => ({ ...previous, [item.href]: !open }))}
                    className={cn(
                      'flex min-h-11 w-full items-center gap-2.5 rounded-md px-2.5 text-left text-sm leading-5 font-medium transition-colors focus-visible:outline-2 focus-visible:outline-ring',
                      active
                        ? 'bg-primary/10 text-primary'
                        : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                    )}
                  >
                    <Icon className="size-4 shrink-0" aria-hidden="true" />
                    <span className="flex-1">{t(item.label)}</span>
                    <ChevronDownIcon
                      aria-hidden="true"
                      className={cn('size-3.5 shrink-0 transition-transform', open && 'rotate-180')}
                    />
                  </button>
                  <div id={panelId} hidden={!open} className="ml-4 border-l border-border pl-3">
                    {item.children.map((child) => (
                      <Link
                        key={child.href}
                        href={child.href}
                        onClick={onNavigate}
                        aria-current={pathname === child.href ? 'page' : undefined}
                        className={cn(
                          'flex min-h-11 items-center rounded-md px-2 text-sm leading-5 focus-visible:outline-2 focus-visible:outline-ring',
                          pathname === child.href
                            ? 'font-medium text-primary'
                            : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                        )}
                      >
                        {t(child.label)}
                      </Link>
                    ))}
                  </div>
                </div>
              )
            }
            const link = (
              <Link
                key={item.href}
                href={item.href}
                onClick={onNavigate}
                aria-label={collapsed ? t(item.label) : undefined}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex min-h-11 items-center gap-2.5 rounded-md text-sm leading-5 font-medium transition-colors focus-visible:outline-2 focus-visible:outline-ring',
                  collapsed ? 'justify-center' : 'px-2.5',
                  active
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:bg-accent hover:text-foreground',
                )}
              >
                <Icon className="size-4 shrink-0" aria-hidden="true" />
                {!collapsed && <span>{t(item.label)}</span>}
              </Link>
            )
            return collapsed ? (
              <Tooltip key={item.href}>
                <TooltipTrigger render={<span />}>{link}</TooltipTrigger>
                <TooltipContent side="right">{t(item.label)}</TooltipContent>
              </Tooltip>
            ) : (
              <div key={item.href}>{link}</div>
            )
          })}
        </div>
      ))}
    </nav>
  )
}

function Account({ email, name, collapsed = false }: SidebarProps & { collapsed?: boolean }) {
  const t = useTranslations('dashboardChrome')
  const { logout, isPending } = useLogout()
  const initials = (name || email)
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase()
  return (
    <div className="shrink-0 border-t border-border p-2">
      {!collapsed && (
        <div className="mb-2 flex min-w-0 items-center gap-2 px-2 py-2">
          <Avatar className="size-8">
            <AvatarFallback>{initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <p className="truncate text-sm font-medium">{name || email}</p>
            <p className="truncate text-xs text-muted-foreground">{email}</p>
          </div>
        </div>
      )}
      <Button
        variant="ghost"
        onClick={logout}
        disabled={isPending}
        aria-label={t('logout')}
        className={cn('min-h-11 w-full', collapsed ? 'px-0' : 'justify-start')}
      >
        <LogOutIcon className="size-4" />
        {!collapsed && t('logout')}
      </Button>
    </div>
  )
}

export function Sidebar(props: SidebarProps) {
  const t = useTranslations('dashboardChrome')
  const open = useUIStore((state) => state.sidebar.isOpen)
  const toggle = useUIStore((state) => state.toggleSidebar)
  return (
    <TooltipProvider>
      <aside
        className={cn(
          'sticky top-0 z-20 hidden h-svh shrink-0 flex-col border-r border-border bg-[#f1f5f3] text-sidebar-foreground transition-[width] dark:bg-sidebar md:flex',
          open ? 'w-64' : 'w-[60px]',
        )}
      >
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-border px-3">
          {open && <Brand />}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggle}
            aria-label={t(open ? 'collapseSidebar' : 'expandSidebar')}
          >
            <ChevronsLeftIcon className={cn('size-4', !open && 'rotate-180')} />
          </Button>
        </div>
        <Navigation collapsed={!open} />
        <Account {...props} collapsed={!open} />
      </aside>
    </TooltipProvider>
  )
}

interface MobileSidebarProps extends SidebarProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function MobileSidebar({ open, onOpenChange, ...props }: MobileSidebarProps) {
  const t = useTranslations('dashboardChrome')
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="flex w-72 flex-col gap-0 bg-[#f1f5f3] p-0 dark:bg-sidebar"
        aria-label={t('featureNavigation')}
      >
        <SheetTitle className="sr-only">{t('featureNavigation')}</SheetTitle>
        <div className="flex h-14 shrink-0 items-center border-b border-border px-4">
          <Brand />
        </div>
        <Navigation onNavigate={() => onOpenChange(false)} />
        <Account {...props} />
      </SheetContent>
    </Sheet>
  )
}
