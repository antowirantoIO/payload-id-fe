'use client'
import type { ReactNode } from 'react'
import { Sidebar } from '@/components/layout/sidebar'
import { Topbar } from '@/components/layout/topbar'
export function ModuleShell({
  children,
  email,
  name,
}: {
  children: ReactNode
  email: string
  name?: string | null
}) {
  return (
    <div className="flex min-h-svh bg-[#f7f9f8] dark:bg-background">
      {/* biome-ignore lint/a11y/useValidAriaRole: Template navigation variant, not an ARIA role. */}
      <Sidebar email={email} name={name} role="admin" />
      <div className="flex min-w-0 flex-1 flex-col">
        {/* biome-ignore lint/a11y/useValidAriaRole: Template navigation variant, not an ARIA role. */}
        <Topbar userId="" email={email} name={name} role="admin" />
        <main className="flex-1">
          <div className="mx-auto w-full max-w-screen-2xl px-4 pt-3 pb-5 md:px-6 md:pt-4 md:pb-6 lg:px-8 lg:pt-5 lg:pb-7">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
