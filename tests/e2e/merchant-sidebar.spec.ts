import { expect, test } from '@playwright/test'

test('merchant sees its workspace and cannot access platform modules directly', async ({
  page,
}) => {
  await page.goto('/login')
  await page.getByLabel('Email', { exact: true }).fill('owner@demo.local')
  await page.getByLabel('Password', { exact: true }).fill('Owner12345!')
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
  await expect(page).toHaveURL(/dashboard/, { timeout: 15_000 })
  await expect(page.getByText('Merchant /', { exact: true })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Merchant overview', exact: true })).toBeVisible()
  const dashboard = await page.request.get('/api/dashboard')
  expect(dashboard.status()).toBe(200)
  expect((await dashboard.json()).workspace).toBe('merchant')
  await expect(page.getByText('Transactions today', { exact: true })).toBeVisible()
  const sidebar = page.locator('aside').first()
  await expect(sidebar.getByRole('button', { name: 'Payments', exact: true })).toBeVisible()
  await expect(
    sidebar.getByRole('button', { name: 'Partners & channels', exact: true }),
  ).toHaveCount(0)
  await expect(
    sidebar.getByRole('button', { name: 'Internal infrastructure', exact: true }),
  ).toHaveCount(0)
  const response = await page.goto('/partners/providers')
  expect(response?.status()).toBe(404)
  const featureResponse = await page.goto('/partners')
  expect(featureResponse?.status()).toBe(404)
  await page.goto('/business-profile')
  await expect(page.getByRole('heading', { name: 'Business profile', exact: true })).toBeVisible()
})
