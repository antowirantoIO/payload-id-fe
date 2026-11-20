import { expect, test } from '@playwright/test'

test('feature accordions open their workspaces and label unfinished integrations', async ({
  page,
}) => {
  await page.goto('/login')
  await page.getByLabel('Email', { exact: true }).fill('admin@payload.local')
  await page.getByLabel('Password', { exact: true }).fill('Admin12345!')
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
  await expect(page).toHaveURL(/dashboard/, { timeout: 15_000 })
  await expect(
    page.getByRole('heading', { name: 'Backoffice overview', exact: true }),
  ).toBeVisible()
  const dashboard = await page.request.get('/api/dashboard')
  expect(dashboard.status()).toBe(200)
  expect((await dashboard.json()).workspace).toBe('platform')
  await expect(page.getByRole('heading', { name: 'Operational alerts', exact: true })).toBeVisible()
  const sidebar = page.locator('aside').first()
  const payments = sidebar.getByRole('button', { name: 'Payments', exact: true })
  await payments.click()
  await expect(payments).toHaveAttribute('aria-expanded', 'true')
  await expect(sidebar.getByRole('link', { name: 'Overview', exact: true })).toHaveCount(0)
  await sidebar.getByRole('link', { name: 'Transactions', exact: true }).click()
  await expect(page).toHaveURL(/payments\/transactions/, { timeout: 15_000 })
  await expect(
    page.getByRole('heading', { name: 'Payment transactions', exact: true }),
  ).toBeVisible()
  await expect(sidebar.getByRole('link', { name: 'Transactions', exact: true })).toHaveAttribute(
    'aria-current',
    'page',
  )
  await expect(sidebar.getByText('Internal infrastructure', { exact: true })).toHaveCount(0)
  await sidebar.getByRole('button', { name: 'Disbursements', exact: true }).click()
  await expect(payments).toHaveAttribute('aria-expanded', 'true')
  await sidebar.getByRole('link', { name: 'Payout batches', exact: true }).click()
  await expect(page).toHaveURL(/payouts\/batches/, { timeout: 15_000 })
  await expect(page.getByRole('heading', { name: 'Payout batches', exact: true })).toBeVisible()
  await page.goto('/payments')
  await expect(page).toHaveURL(/\/payments\/transactions$/)
  await page.goto('/modules/payment/transactions')
  await expect(page).toHaveURL(/\/payments\/transactions$/)
  await page.goto('/id/features/payments')
  await expect(page).toHaveURL(/\/id\/payments\/transactions$/)
})
