import { expect, test } from '@playwright/test'

test('root entry renders a valid localized document', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/')
  await expect(page).toHaveURL(/login/)
  await expect(page.locator('html')).toHaveCount(1)
  await expect(page.locator('body')).toHaveCount(1)
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  await expect(page.locator('html')).toHaveAttribute('lang', 'en')
  await page.goto('/id/login')
  await expect(page.locator('html')).toHaveAttribute('lang', 'id')
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  expect(errors).toEqual([])
})
