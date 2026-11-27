import { expect, it } from 'vitest'
import type { WorkspaceProfile } from '@/lib/auth/workspace'
import { canViewFeature, featureNavigation, features } from '@/lib/workspace/features'
import { serviceNavigation } from '@/lib/workspace/navigation'
import { featureMessages } from '@/messages/features'

const profile: WorkspaceProfile = {
  id: '1',
  email: 'a@example.com',
  name: 'A',
  tenant_id: '1',
  tenant_type: 'PLATFORM',
  merchant_id: undefined,
  roles: [],
  permissions: [
    'transaction.read',
    'payout.read',
    'issuer.view',
    'tenant.view',
    'merchant.view',
    'user.view',
    'fee.read',
  ],
}

it('assigns every non-internal backend module to exactly one feature', () => {
  const expected = serviceNavigation
    .filter((service) => service.slug !== 'vault')
    .flatMap((service) => service.modules.map((module) => `${service.slug}/${module.slug}`))
    .sort()
  const actual = features.flatMap((feature) => feature.modules).sort()
  expect(actual).toEqual(expected)
  expect(new Set(features.map((feature) => feature.slug)).size).toBe(features.length)
})
it('uses feature roots with permitted submenus and fails closed without a known workspace', () => {
  expect(featureNavigation(undefined)).toEqual([])
  expect(featureNavigation({ ...profile, tenant_type: 'UNKNOWN' })).toEqual([])
  for (const group of featureNavigation(profile))
    for (const item of group.items) {
      for (const child of item.children) expect(child.href.startsWith(`${item.href}/`)).toBe(true)
      expect(
        item.href === '/dashboard' || features.some((feature) => item.href === `/${feature.slug}`),
      ).toBe(true)
    }
})
it('separates merchant and reseller product boundaries from platform permissions', () => {
  const merchant = { ...profile, merchant_id: 'm' }
  const reseller = { ...profile, tenant_type: 'RESELLER' }
  for (const slug of ['partners', 'resellers', 'approvals', 'platform-settings', 'audit']) {
    const feature = features.find((feature) => feature.slug === slug)!
    expect(canViewFeature(merchant, feature)).toBe(false)
    expect(canViewFeature(reseller, feature)).toBe(false)
  }
  expect(
    canViewFeature(
      merchant,
      features.find((feature) => feature.slug === 'payments')!,
    ),
  ).toBe(true)
  expect(
    canViewFeature(
      { ...merchant, permissions: [] },
      features.find((feature) => feature.slug === 'payments')!,
    ),
  ).toBe(false)
})
it('translates every feature in all supported locales', () => {
  for (const messages of Object.values(featureMessages))
    for (const feature of features) expect(messages).toHaveProperty(feature.label)
})

it('does not manufacture overview children or single-child accordions', () => {
  const items = featureNavigation(profile).flatMap((group) => group.items)
  for (const item of items) {
    expect(item.children.length).not.toBe(1)
    expect(item.children.some((child) => child.label === 'overview')).toBe(false)
  }
  for (const slug of ['payment-links', 'resellers', 'merchants']) {
    const item = items.find((item) => item.href === `/${slug}`)
    expect(item?.children).toEqual([])
  }
  const restricted = featureNavigation({ ...profile, permissions: ['transaction.read'] }).flatMap(
    (group) => group.items,
  )
  expect(restricted.find((item) => item.href === '/payments')?.children).toHaveLength(2)
  const oneCapability = featureNavigation({ ...profile, permissions: ['payout.read'] }).flatMap(
    (group) => group.items,
  )
  expect(oneCapability.find((item) => item.href === '/payment-links')).toBeUndefined()
})
