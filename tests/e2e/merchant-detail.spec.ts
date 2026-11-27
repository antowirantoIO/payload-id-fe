import { expect, test } from '@playwright/test'

test('merchant detail groups information and preserves tabs, lifecycle and responsive layout', async ({
  page,
}) => {
  await page.goto('/login')
  await page.getByLabel('Email', { exact: true }).fill('admin@payload.local')
  await page.getByLabel('Password', { exact: true }).fill('Admin12345!')
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
  await expect(page).toHaveURL(/dashboard/, { timeout: 15_000 })
  await page.goto('/merchants/demo-merchant-1')
  await expect(page.getByRole('heading', { level: 1, name: 'Retail 1' })).toBeVisible()
  for (const name of [
    'Business identity',
    'Business address',
    'Registration & website',
    'Record details',
  ]) {
    await expect(page.getByRole('heading', { name, exact: true })).toBeVisible()
  }
  await expect(page.getByRole('tabpanel')).toHaveCount(1)
  await page.getByRole('tab', { name: 'Business profile', exact: true }).focus()
  await page.keyboard.press('ArrowRight')
  await page.keyboard.press('Enter')
  await expect(page.getByRole('tab', { name: 'Settlement', exact: true })).toHaveAttribute(
    'aria-selected',
    'true',
  )
  await expect(
    page.getByRole('heading', { name: 'Settlement preferences', exact: true }),
  ).toBeVisible()
  await page.getByRole('tab', { name: 'Integration', exact: true }).click()
  await expect(
    page.getByRole('heading', { name: 'Integration settings', exact: true }),
  ).toBeVisible()
  await expect(page.getByRole('tabpanel')).toHaveCount(1)
  await page.getByRole('tab', { name: 'Business profile', exact: true }).click()
  await page.setViewportSize({ width: 1440, height: 1000 })
  await page.screenshot({ path: 'test-results/merchant-detail-desktop.png', fullPage: true })
  await page.setViewportSize({ width: 390, height: 844 })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  )
  await page.screenshot({ path: 'test-results/merchant-detail-mobile.png', fullPage: true })
  await page.getByRole('button', { name: 'PENDING KYC', exact: true }).click()
  await expect(page.getByRole('dialog')).toBeVisible()
  await page.getByRole('button', { name: 'Cancel', exact: true }).click()
  await expect(page.getByRole('dialog')).toHaveCount(0)
  await page.getByRole('button', { name: 'PENDING KYC', exact: true }).click()
  await page.getByLabel('Reason for change *', { exact: true }).fill('Begin onboarding review')
  await page.getByRole('button', { name: 'Confirm change', exact: true }).click()
  await page.getByRole('tab', { name: 'Activity', exact: true }).click()
  await expect(page.getByText(/Begin onboarding review/)).toBeVisible()
})
