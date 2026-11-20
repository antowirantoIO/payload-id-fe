'use client'

import { GlobeIcon } from 'lucide-react'
import { useLocale } from 'next-intl'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { usePathname, useRouter } from '@/i18n/navigation'
import { type Locale, localeNames, locales } from '@/i18n/routing'

export function LocaleSwitcher() {
  const locale = useLocale() as Locale
  const router = useRouter()
  const pathname = usePathname()

  function switchLocale(next: Locale) {
    router.replace(pathname, { locale: next })
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <Button variant="ghost" size="sm" className="gap-1.5">
            <GlobeIcon className="size-4" />
            <span className="text-xs font-medium uppercase">{locale}</span>
          </Button>
        }
      />
      <DropdownMenuContent align="end">
        {locales.map((l) => (
          <DropdownMenuItem
            key={l}
            onClick={() => switchLocale(l)}
            className={l === locale ? 'font-semibold' : ''}
          >
            {localeNames[l]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
