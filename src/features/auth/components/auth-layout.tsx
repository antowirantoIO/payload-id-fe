import { ArrowLeft, Package, ShieldCheck, Ship, Waypoints } from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import type { ReactNode } from 'react'
import { LocaleSwitcher } from '@/components/shared/locale-switcher'
import { ThemeToggle } from '@/components/shared/theme-toggle'
import { Link } from '@/i18n/navigation'

export default async function AuthLayout({ children }: { children: ReactNode }) {
  const t = await getTranslations('auth.layout')
  const app = await getTranslations('app')

  return (
    <div className="grid min-h-svh w-full max-w-full overflow-x-hidden bg-[#f4f1ea] dark:bg-[#171a18] lg:grid-cols-[minmax(0,0.9fr)_1.1fr]">
      <aside className="relative hidden min-h-svh min-w-0 overflow-hidden border-r border-white/10 bg-[#1b2520] p-10 text-white lg:flex lg:flex-col lg:justify-between xl:p-14">
        <div aria-hidden className="absolute inset-0 bg-grid opacity-[0.08]" />
        <div aria-hidden className="absolute top-0 right-0 h-full w-px bg-primary/60" />

        <Link href="/" className="relative z-10 flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-sm bg-primary">
            <span className="font-bold text-primary-foreground text-xs tracking-tight">P</span>
          </div>
          <span className="font-semibold text-lg tracking-[-0.04em]">
            Payloads<span className="text-primary">.</span>
          </span>
        </Link>

        <div className="relative z-10 max-w-lg py-16">
          <div className="mb-6 flex items-center gap-3 text-xs leading-4 font-medium text-primary">
            <span className="h-px w-8 bg-primary" />
            {t('eyebrow')}
          </div>
          <h2 className="max-w-md text-balance font-semibold text-4xl leading-[1.02] tracking-[-0.055em] xl:text-6xl">
            {t('heading')}
          </h2>
          <p className="mt-6 max-w-md text-sm leading-7 text-white/60 xl:text-base">
            {t('description')}
          </p>

          <div className="mt-10 grid grid-cols-2 border-y border-white/15">
            {[
              { icon: Package, label: app('overview'), index: '01' },
              { icon: Waypoints, label: app('tenant'), index: '02' },
              { icon: Ship, label: app('merchant'), index: '03' },
              { icon: ShieldCheck, label: app('profile'), index: '04' },
            ].map(({ icon: Icon, label, index }) => (
              <div
                key={index}
                className="border-r border-b border-white/15 p-4 even:border-r-0 nth-[n+3]:border-b-0"
              >
                <div className="flex items-center justify-between">
                  <Icon className="size-4 text-primary" />
                  <span className="font-mono text-[9px] text-white/30">{index}</span>
                </div>
                <div className="mt-4 text-sm font-medium text-white/80">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 max-w-md border-t border-white/15 pt-5 text-sm text-white/65">
          {t('regionLabel')}
        </div>
      </aside>

      <div className="flex min-h-svh min-w-0 flex-col">
        <header className="flex h-[4.5rem] w-full min-w-0 shrink-0 items-center justify-between gap-2 border-b border-foreground/10 px-4 md:px-8">
          <Link href="/" className="flex min-w-0 items-center gap-2.5 lg:hidden">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-sm bg-primary">
              <span className="font-bold text-primary-foreground text-xs">P</span>
            </div>
            <span className="truncate font-semibold text-sm tracking-[-0.03em]">
              Payloads<span className="text-primary">.</span>
            </span>
          </Link>
          <Link
            href="/"
            className="hidden min-w-0 items-center gap-2 text-xs leading-4 text-muted-foreground transition-colors hover:text-primary lg:flex"
          >
            <ArrowLeft className="size-3.5 shrink-0" />
            <span className="truncate">{t('backToHome')}</span>
          </Link>
          <div className="flex shrink-0 items-center gap-1">
            <LocaleSwitcher />
            <ThemeToggle />
          </div>
        </header>

        <main className="flex w-full min-w-0 flex-1 items-center justify-center px-4 py-10 sm:px-8 md:py-16">
          <div className="w-full min-w-0 max-w-115">{children}</div>
        </main>

        <footer className="flex w-full min-w-0 flex-wrap items-center justify-between gap-x-3 gap-y-1 border-t border-foreground/10 px-4 py-4 text-xs leading-4 text-muted-foreground sm:px-8">
          <span>{t('secureAccess')}</span>
          <span>{t('regionLabel')}</span>
        </footer>
      </div>
    </div>
  )
}
