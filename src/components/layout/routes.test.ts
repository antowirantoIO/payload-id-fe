import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { features } from './features'
import { serviceNavigation } from './navigation'
import { productPath, productPaths } from './product-paths'

const app = join(process.cwd(), 'src/app/[locale]')

describe('explicit app routes', () => {
  it('has a dedicated page for every feature', () => {
    for (const feature of features) {
      const page = join(app, feature.slug, 'page.tsx')
      expect(existsSync(page), page).toBe(true)
      const source = readFileSync(page, 'utf8')
      if (feature.slug === 'merchants') {
        expect(source).toContain('module="merchants"')
        expect(source).toContain('<MerchantsWorkspace />')
      } else {
        expect(source).toContain(`slug="${feature.slug}"`)
      }
    }
  })
  it('has one dedicated product page for every backend capability', () => {
    expect(new Set(Object.values(productPaths)).size).toBe(Object.keys(productPaths).length)
    for (const service of serviceNavigation) {
      for (const module of service.modules) {
        const page = join(app, productPath(`${service.slug}/${module.slug}`), 'page.tsx')
        expect(existsSync(page), page).toBe(true)
        const source = readFileSync(page, 'utf8')
        expect(source).toContain(`service="${service.slug}"`)
        expect(source).toContain(`module="${module.slug}"`)
      }
    }
  })
  it('does not expose a generic dynamic feature/module page', () => {
    expect(existsSync(join(app, 'features/[feature]/page.tsx'))).toBe(false)
    expect(existsSync(join(app, 'modules/[service]/page.tsx'))).toBe(false)
    expect(existsSync(join(app, 'modules/[service]/[module]/page.tsx'))).toBe(false)
  })
})
