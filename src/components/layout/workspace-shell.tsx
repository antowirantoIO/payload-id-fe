'use client'

import { useQuery } from '@tanstack/react-query'
import type { ReactNode } from 'react'
import { profileOptions } from '@/features/account/client'
import { Sidebar } from './sidebar'
import { Topbar } from './topbar'

export type WorkspaceIdentity = { email?: string | null; name?: string | null }

/** Persistent chrome only; page and API access is enforced independently on the server. */
export function WorkspaceShell({
  children,
  identity,
}: {
  children: ReactNode
  identity?: WorkspaceIdentity
}) {
  const { data: profile } = useQuery(profileOptions())
  const account = {
    email: profile?.email ?? identity?.email ?? '',
    name: profile?.name ?? identity?.name,
    profile,
  }
  return (
    <div className="flex min-h-svh bg-background">
      <Sidebar {...account} />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar {...account} />
        <main id="main" className="flex-1">
          <div className="mx-auto w-full max-w-screen-2xl px-4 py-5 md:px-6 md:py-6 lg:px-8 lg:py-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}
