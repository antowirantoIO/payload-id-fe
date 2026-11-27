import {
  Building2Icon,
  CreditCardIcon,
  FileTextIcon,
  GlobeIcon,
  HistoryIcon,
  LandmarkIcon,
  LayoutDashboardIcon,
  LinkIcon,
  RefreshCwIcon,
  SettingsIcon,
  ShieldCheckIcon,
  UsersIcon,
  WalletIcon,
  WaypointsIcon,
} from 'lucide-react'

export const workspaceIcons = {
  dashboard: LayoutDashboardIcon,
  payments: CreditCardIcon,
  payouts: WalletIcon,
  'payment-links': LinkIcon,
  approvals: ShieldCheckIcon,
  merchants: Building2Icon,
  resellers: UsersIcon,
  partners: WaypointsIcon,
  balances: LandmarkIcon,
  settlements: WalletIcon,
  reconciliation: RefreshCwIcon,
  pricing: SettingsIcon,
  reports: FileTextIcon,
  'business-profile': Building2Icon,
  integrations: GlobeIcon,
  access: UsersIcon,
  audit: HistoryIcon,
  'platform-settings': SettingsIcon,
} satisfies Record<string, typeof LayoutDashboardIcon>

export function workspaceIcon(key: string) {
  return workspaceIcons[key as keyof typeof workspaceIcons] ?? LayoutDashboardIcon
}
