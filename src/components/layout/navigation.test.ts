import { describe, expect, it } from 'vitest'
import { findModule, serviceNavigation } from '@/lib/workspace/navigation'
import { productPaths } from '@/lib/workspace/product-paths'
import { moduleMessages, navigationMessages } from '@/messages/navigation'

describe('service navigation', () => {
  it('retains every backend module once in task-oriented navigation', () => {
    const expected = serviceNavigation
      .flatMap((service) => service.modules.map((module) => `${service.slug}/${module.slug}`))
      .sort()
    expect(Object.keys(productPaths).sort()).toEqual(expected)
    expect(new Set(Object.values(productPaths)).size).toBe(expected.length)
  })
  it('covers all six backend services with unique resolvable routes', () => {
    expect(serviceNavigation.map((service) => service.slug)).toEqual([
      'iam',
      'payment',
      'issuer',
      'accounting',
      'open',
      'vault',
    ])
    const paths = serviceNavigation.flatMap((service) =>
      service.modules.map((module) => {
        expect(findModule(service.slug, module.slug)).toBeDefined()
        expect(module.endpoints.length).toBeGreaterThan(0)
        return `${service.slug}/${module.slug}`
      }),
    )
    expect(new Set(paths).size).toBe(paths.length)
    expect(findModule('missing', 'missing')).toBeUndefined()
  })
  it('has translated labels and placeholder copy for every module', () => {
    for (const locale of ['en', 'id'] as const) {
      expect(Object.keys(navigationMessages[locale]).sort()).toEqual(
        Object.keys(navigationMessages.en).sort(),
      )
      expect(Object.keys(moduleMessages[locale]).sort()).toEqual(
        Object.keys(moduleMessages.en).sort(),
      )
      for (const service of serviceNavigation) {
        for (const module of service.modules) {
          expect(navigationMessages[locale]).toHaveProperty(module.label)
        }
      }
    }
  })
})
