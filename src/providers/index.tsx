'use client'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SessionProvider } from 'next-auth/react'
import { NuqsAdapter } from 'nuqs/adapters/next/app'
import { type ReactNode, useState } from 'react'
import { Toaster } from '@/components/ui/sonner'
import { DocumentLanguage } from './document-language'
import { ThemeProvider } from './theme-provider'
export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: { staleTime: 30_000, retry: false, refetchOnWindowFocus: false },
          mutations: { retry: false },
        },
      }),
  )
  return (
    <NuqsAdapter>
      <DocumentLanguage />
      <SessionProvider>
        <ThemeProvider>
          <QueryClientProvider client={client}>
            {children}
            <Toaster richColors position="top-right" />
          </QueryClientProvider>
        </ThemeProvider>
      </SessionProvider>
    </NuqsAdapter>
  )
}
