import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { WorkspaceProfile } from './workspace'

const mocks = vi.hoisted(() => ({ session: vi.fn(), profile: vi.fn() }))
vi.mock('server-only', () => ({}))
vi.mock('./server-session', () => ({ getServerSession: mocks.session }))
vi.mock('./server-profile', () => ({ getServerProfile: mocks.profile }))
vi.mock('@/i18n/navigation', () => ({
  redirect: ({ href, locale }: { href: string; locale: string }) => {
    throw new Error(`redirect:${locale}:${href}`)
  },
}))
vi.mock('next/navigation', () => ({
  notFound: () => {
    throw new Error('not-found')
  },
}))

import { requireCapability, requireSession, resolveFeatureLanding } from './access'

const profile: WorkspaceProfile = {
  id: 'test',
  email: 'test@example.com',
  name: 'Test',
  tenant_id: 'tenant',
  tenant_type: 'PLATFORM',
  roles: [],
  permissions: ['transaction.read'],
  merchant_id: undefined,
}

beforeEach(() => {
  mocks.session.mockResolvedValue({ user: { email: profile.email } })
  mocks.profile.mockResolvedValue(profile)
})

describe('explicit server access guards', () => {
  it('redirects missing or expired sessions without requiring a profile', async () => {
    for (const session of [null, { error: 'SessionExpired' }]) {
      mocks.session.mockResolvedValue(session)
      await expect(requireSession('id')).rejects.toThrow('redirect:id:/login')
    }
    expect(mocks.profile).not.toHaveBeenCalled()
  })
  it('keeps the session-only dashboard boundary independent from workspace recognition', async () => {
    mocks.profile.mockResolvedValue({ ...profile, tenant_type: 'UNKNOWN' })
    await expect(requireSession('en')).resolves.toBeDefined()
    expect(mocks.profile).not.toHaveBeenCalled()
    await expect(requireCapability('en', 'payment/transactions')).rejects.toThrow('not-found')
  })
  it('preserves login redirect for failed module profiles and 404 for denied permissions', async () => {
    mocks.profile.mockResolvedValue(null)
    await expect(requireCapability('en', 'payment/transactions')).rejects.toThrow(
      'redirect:en:/login',
    )
    mocks.profile.mockResolvedValue({ ...profile, permissions: [] })
    await expect(requireCapability('en', 'payment/transactions')).rejects.toThrow('not-found')
  })
  it('returns pending-page metadata without tokens and redirects feature roots in existing order', async () => {
    const access = await requireCapability('en', 'payment/transactions')
    expect(access.title).toBe('transactions')
    expect(access.related.map((item) => item.href)).toContain('/payments/refunds')
    expect(access).not.toHaveProperty('backendToken')
    await expect(resolveFeatureLanding('en', 'payments')).rejects.toThrow(
      'redirect:en:/payments/transactions',
    )
  })
  it('does not conflate direct capability permission with feature visibility', async () => {
    mocks.profile.mockResolvedValue({
      ...profile,
      tenant_type: 'RESELLER',
      permissions: ['workflow.view'],
    })
    await expect(requireCapability('en', 'iam/workflows')).resolves.toMatchObject({
      title: 'workflows',
    })
    await expect(resolveFeatureLanding('en', 'approvals')).rejects.toThrow('not-found')
  })
})
