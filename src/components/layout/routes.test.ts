import { readdirSync, readFileSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'
import type { WorkspaceProfile } from '@/lib/auth/workspace'
import { canViewFeature, featureNavigation, features } from '@/lib/workspace/features'
import { serviceNavigation } from '@/lib/workspace/navigation'
import { productPath, productPaths } from '@/lib/workspace/product-paths'

const root = join(process.cwd(), 'src/app/[locale]')

function collectPages(directory: string): Map<string, string> {
  const pages = new Map<string, string>()
  function visit(current: string) {
    for (const entry of readdirSync(current, { withFileTypes: true })) {
      const path = join(current, entry.name)
      if (entry.isDirectory()) visit(path)
      else if (entry.name === 'page.tsx') {
        const segments = relative(root, current)
          .split('/')
          .filter((part) => part && !part.startsWith('('))
        const url = `/${segments.join('/')}`
        if (pages.has(url)) throw new Error(`Duplicate product page: ${url}`)
        pages.set(url, readFileSync(path, 'utf8'))
      }
    }
  }
  visit(directory)
  return pages
}

const pages = collectPages(root)

describe('explicit product routes', () => {
  it('has an explicitly authorized landing for every feature', () => {
    for (const feature of features) {
      const source = pages.get(`/${feature.slug}`)
      expect(source, feature.slug).toBeDefined()
      expect(source).toContain(
        feature.slug === 'merchants'
          ? "requireCapability(locale, 'iam/merchants')"
          : `resolveFeatureLanding((await params).locale, '${feature.slug}')`,
      )
    }
  })

  it('has a dedicated authorized page for every capability', () => {
    expect(new Set(Object.values(productPaths)).size).toBe(Object.keys(productPaths).length)
    for (const service of serviceNavigation) {
      for (const module of service.modules) {
        const capability = `${service.slug}/${module.slug}`
        const source = pages.get(productPath(capability))
        expect(source, capability).toBeDefined()
        expect(source).toMatch(new RegExp(`requireCapability\\([^\\n]*'${capability}'\\)`))
      }
    }
  })

  it('aligns every visible sidebar URL with an explicit page for each workspace', () => {
    const policy = readFileSync(join(process.cwd(), 'src/lib/auth/workspace.ts'), 'utf8')
    const permissions = [
      ...new Set([...policy.matchAll(/'([a-z_]+\.[a-z_.]+)'/g)].map((match) => match[1])),
    ]
    const base: WorkspaceProfile = {
      id: 'test',
      email: 'test@example.com',
      name: 'Test',
      tenant_id: 'tenant',
      tenant_type: 'PLATFORM',
      merchant_id: undefined,
      roles: [{ code: 'SUPER_ADMIN' }],
      permissions,
    }
    for (const profile of [
      base,
      { ...base, tenant_type: 'RESELLER' },
      { ...base, merchant_id: 'merchant' },
    ]) {
      for (const group of featureNavigation(profile)) {
        for (const item of group.items) {
          expect(pages.has(item.href), item.href).toBe(true)
          for (const child of item.children) {
            expect(pages.has(child.href), child.href).toBe(true)
            expect(Object.values(productPaths)).toContain(child.href)
          }
          if (item.href === '/dashboard') continue
          const feature = features.find((entry) => entry.slug === item.key)
          expect(feature).toBeDefined()
          expect(canViewFeature(profile, feature!)).toBe(true)
        }
      }
    }
  })

  it('does not introduce a generic dynamic feature/module dispatcher', () => {
    expect(
      [...pages.keys()].some(
        (path) => path.startsWith('/features/') || path.startsWith('/modules/'),
      ),
    ).toBe(false)
  })

  it('guards the dashboard independently and mounts chrome only in the workspace layout', () => {
    expect(pages.get('/dashboard')).toContain('requireSession(')
    const layout = readFileSync(join(root, '(workspace)/layout.tsx'), 'utf8')
    expect(layout).toContain('requireSession(')
    expect(layout).toContain('<WorkspaceShell')
    for (const source of pages.values()) expect(source).not.toContain('<WorkspaceShell')
  })
})
