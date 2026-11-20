import type { ReactNode } from 'react'
import { MerchantDemoProvider } from '@/features/merchants/client'

export default function MerchantsLayout({ children }: { children: ReactNode }) {
  return <MerchantDemoProvider>{children}</MerchantDemoProvider>
}
