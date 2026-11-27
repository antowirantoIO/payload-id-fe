import { expect, test } from '@playwright/test'

test('payout demo supports tabs, masked detail and local transitions', async ({ page }) => {
  await page.goto('/login')
  await page.getByLabel('Email', { exact: true }).fill('admin@payload.local')
  await page.getByLabel('Password', { exact: true }).fill('Admin12345!')
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
  await expect(page).toHaveURL(/dashboard/, { timeout: 15_000 })
  await page.goto('/payouts/transactions')
  await expect(
    page.getByRole('heading', { name: 'Payout transactions', exact: true }),
  ).toBeVisible()
  await expect(page.getByText(/no funds are transferred/i)).toBeVisible()
  await expect(page.getByRole('tab', { name: 'All payouts', exact: true })).toBeVisible()
  await expect(page.getByRole('cell', { name: /DEMO-PAY/ }).first()).toBeVisible()
  await page.locator('tbody button').first().click()
  await expect(page.getByRole('heading', { name: 'Payout details', exact: true })).toBeVisible()
  await expect(page.getByText(/\*{3,}\d{4}/)).toBeVisible()
  await page.keyboard.press('Escape')
  await page.getByRole('tab', { name: 'Awaiting approval', exact: true }).click()
  await expect(page.getByRole('tab', { name: 'Awaiting approval', exact: true })).toHaveAttribute(
    'aria-selected',
    'true',
  )
  await expect(page.locator('tbody tr')).toHaveCount(5)
})
