'use client'

import { ChevronDownIcon, LogOutIcon, SettingsIcon, ShieldCheckIcon, UserIcon } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useLogout } from '@/features/auth/client'
import { useRouter } from '@/i18n/navigation'

interface UserMenuProps {
  email: string
  name?: string | null
}

import { accountInitials } from './account-initials'

export function UserMenu({ email, name }: UserMenuProps) {
  const t = useTranslations('common')
  const tc = useTranslations('dashboardChrome')
  const router = useRouter()
  const { logout: execute, isPending } = useLogout()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label={tc('userMenu')}
        className="flex min-h-11 items-center gap-1.5 rounded-lg px-1.5 outline-none transition-colors hover:bg-muted/50 focus-visible:ring-3 focus-visible:ring-ring/50"
      >
        <Avatar className="size-8 ring-2 ring-border/50 ring-offset-1 ring-offset-background">
          <AvatarFallback className="bg-primary/10 text-[11px] font-medium text-primary">
            {accountInitials(name, email)}
          </AvatarFallback>
        </Avatar>
        <ChevronDownIcon className="text-muted-foreground hidden size-3.5 sm:block" />
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" sideOffset={8} className="w-60 p-1.5">
        <DropdownMenuGroup>
          <DropdownMenuLabel className="rounded-md px-2 py-2">
            <div className="flex items-center gap-2.5">
              <Avatar className="size-9 shrink-0">
                <AvatarFallback className="bg-primary/10 text-xs font-medium text-primary">
                  {accountInitials(name, email)}
                </AvatarFallback>
              </Avatar>
              <div className="flex min-w-0 flex-col">
                <span className="truncate text-sm font-semibold">{name ?? t('myAccount')}</span>
                <span className="text-muted-foreground truncate text-xs">{email}</span>
              </div>
            </div>
          </DropdownMenuLabel>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="my-1" />

        <DropdownMenuGroup>
          <DropdownMenuItem
            className="min-h-11 cursor-pointer rounded-md"
            onSelect={() => router.push('/dashboard')}
          >
            <UserIcon className="size-4" />
            <span>{tc('profile')}</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="min-h-11 cursor-pointer rounded-md" disabled>
            <ShieldCheckIcon className="size-4" />
            <span>{t('security2FA')}</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="min-h-11 cursor-pointer rounded-md" disabled>
            <SettingsIcon className="size-4" />
            <span>{t('settings')}</span>
          </DropdownMenuItem>
        </DropdownMenuGroup>

        <DropdownMenuSeparator className="my-1" />

        <DropdownMenuItem
          onClick={() => execute()}
          disabled={isPending}
          variant="destructive"
          className="min-h-11 rounded-md"
        >
          <LogOutIcon className="size-4" />
          {isPending ? t('signingOut') : t('signOut')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
