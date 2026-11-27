import { expect, test } from '@playwright/test'
import { features } from '../../src/lib/workspace/features'
import { productPaths } from '../../src/lib/workspace/product-paths'

// No IAM connection is needed: a registered protected route redirects anonymous requests.
test('all product destinations are registered in both supported locales', async ({ request }) => {
  test.setTimeout(180_000)
  const destinations = new Set([
    '/dashboard',
    ...Object.values(productPaths),
    ...features.map((feature) => `/${feature.slug}`),
  ])
  for (const prefix of ['', '/id']) {
    for (const path of destinations) {
      const response = await request.get(`${prefix}${path}`, { maxRedirects: 0 })
      expect(response.status(), `${prefix}${path}`).toBe(307)
      expect(response.headers().location, `${prefix}${path}`).toBe(`${prefix}/login`)
    }
  }
})

test('every rendered sidebar destination resolves in both supported locales', async ({ page }) => {
  test.setTimeout(180_000)
  await page.goto('/login')
  await page.getByLabel('Email', { exact: true }).fill('admin@payload.local')
  await page.getByLabel('Password', { exact: true }).fill('Admin12345!')
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
  await expect(page).toHaveURL(/dashboard/, { timeout: 15_000 })
  const sidebar = page.locator('aside').first()
  await expect(sidebar.getByRole('button', { name: 'Payments', exact: true })).toBeVisible()
  // Include collapsed children: their URLs must resolve before an accordion is expanded.
  const destinations = await sidebar
    .locator('nav a[href]')
    .evaluateAll((links) => [
      ...new Set(links.map((link) => new URL((link as HTMLAnchorElement).href).pathname)),
    ])
  expect(destinations).toContain('/payments/transactions')
  expect(destinations.length).toBeGreaterThan(10)
  for (const prefix of ['', '/id']) {
    for (const path of destinations) {
      const response = await page.request.get(`${prefix}${path}`)
      expect(response.status(), `${prefix}${path}`).toBe(200)
      expect(new URL(response.url()).pathname, `${prefix}${path}`).not.toMatch(/\/login$/)
    }
  }
})
