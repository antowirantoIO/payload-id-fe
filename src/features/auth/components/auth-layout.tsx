import { ArrowLeft } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import type { ReactNode } from 'react'
import { LocaleSwitcher } from '@/components/shared/locale-switcher'
import { ThemeToggle } from '@/components/shared/theme-toggle'
import { Link } from '@/i18n/navigation'

export default async function AuthLayout({ children }: { children: ReactNode }) {
  const t = await getTranslations('auth.layout')
  const app = await getTranslations('app')

  return (
    <div className="flex min-h-svh w-full max-w-full overflow-x-hidden bg-background text-foreground">
      <aside className="hidden min-h-svh min-w-0 w-2/5 flex-col justify-between border-r bg-sidebar p-10 lg:flex xl:p-14">
        <Link href="/" className="flex min-h-11 items-center gap-2.5 self-start">
          <div className="flex size-8 items-center justify-center rounded-md bg-primary">
            <span className="font-bold text-primary-foreground text-xs tracking-tight">P</span>
          </div>
          <span className="font-semibold text-lg tracking-[-0.04em]">
            Payloads<span className="text-primary">.</span>
          </span>
        </Link>

        <div className="max-w-md py-16">
          <div className="mb-5 text-xs leading-4 font-medium text-muted-foreground">
            {t('eyebrow')}
          </div>
          <h2 className="text-balance text-3xl leading-tight font-semibold tracking-tight xl:text-4xl">
            {t('heading')}
          </h2>
          <p className="mt-5 text-sm leading-7 text-muted-foreground">{t('description')}</p>

          <ul className="mt-8 space-y-3 border-t pt-6 text-sm text-muted-foreground">
            {['overview', 'tenant', 'merchant', 'profile'].map((key) => (
              <li key={key}>{app(key)}</li>
            ))}
          </ul>
        </div>

        <div className="max-w-md border-t pt-5 text-xs leading-5 text-muted-foreground">
          {t('regionLabel')}
        </div>
      </aside>

      <div className="flex min-h-svh min-w-0 flex-1 flex-col">
        <header className="flex h-16 w-full min-w-0 shrink-0 items-center justify-between gap-2 border-b bg-card px-6">
          <Link href="/" className="flex min-h-11 min-w-0 items-center gap-2.5 lg:hidden">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary">
              <span className="font-bold text-primary-foreground text-xs">P</span>
            </div>
            <span className="truncate font-semibold text-sm tracking-[-0.03em]">
              Payloads<span className="text-primary">.</span>
            </span>
          </Link>
          <Link
            href="/"
            className="hidden min-h-11 min-w-0 items-center gap-2 text-xs leading-4 text-muted-foreground transition-colors hover:text-foreground lg:flex"
          >
            <ArrowLeft className="size-3.5 shrink-0" />
            <span className="truncate">{t('backToHome')}</span>
          </Link>
          <div className="flex shrink-0 items-center gap-1 [&_button]:min-h-11 [&_button]:min-w-11">
            <LocaleSwitcher />
            <ThemeToggle />
          </div>
        </header>

        <main className="flex w-full min-w-0 flex-1 items-center justify-center px-4 py-10 sm:px-8 md:py-16">
          <div className="w-full min-w-0 max-w-115">{children}</div>
        </main>

        <footer className="flex w-full min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t px-6 py-4 text-xs leading-4 text-muted-foreground">
          <span>{t('secureAccess')}</span>
          <span>{t('regionLabel')}</span>
        </footer>
      </div>
    </div>
  )
}
