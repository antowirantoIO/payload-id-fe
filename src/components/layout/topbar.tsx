'use client'

import { MenuIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { useState } from 'react'
import { LocaleSwitcher } from '@/components/shared/locale-switcher'
import { ThemeToggle } from '@/components/shared/theme-toggle'
import { Button } from '@/components/ui/button'
import { usePathname } from '@/i18n/navigation'
import { type WorkspaceProfile, workspaceFor } from '@/lib/auth/workspace'
import { workspacePageTitle } from '@/lib/workspace/page-title'
import { MobileSidebar } from './sidebar'
import { UserMenu } from './user-menu'

type TopbarProps = { email: string; name?: string | null; profile?: WorkspaceProfile }

function MobileNavigation(props: TopbarProps) {
  const t = useTranslations('dashboardChrome')
  const [open, setOpen] = useState(false)
  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setOpen(true)}
        aria-label={t('openMenu')}
      >
        <MenuIcon className="size-4" />
      </Button>
      <MobileSidebar {...props} open={open} onOpenChange={setOpen} />
    </>
  )
}

export function Topbar({ email, name, profile }: TopbarProps) {
  const t = useTranslations('dashboardChrome')
  const workspaceLabels = useTranslations('operationalDashboard')
  const pathname = usePathname()
  const title = workspacePageTitle(pathname)
  const workspace = profile ? workspaceFor(profile) : undefined
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between gap-4 border-b border-border bg-card px-4 md:px-6 lg:px-8">
      <div className="flex items-center gap-3">
        <MobileNavigation key={pathname} email={email} name={name} profile={profile} />
        <div className="font-semibold text-base tracking-[-0.03em]">
          {workspace && (
            <span className="mr-3 hidden text-xs font-normal text-muted-foreground lg:inline">
              {workspaceLabels(`workspace_${workspace}`)} /
            </span>
          )}
          {title ? t(title) : ''}
        </div>
      </div>
      <div className="flex items-center gap-1.5">
        <LocaleSwitcher />
        <div className="mx-0.5 hidden sm:block">
          <ThemeToggle />
        </div>
        <UserMenu email={email} name={name} />
      </div>
    </header>
  )
}
