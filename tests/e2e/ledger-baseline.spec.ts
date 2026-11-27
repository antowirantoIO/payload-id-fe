import { expect, test } from '@playwright/test'

test('ledger surfaces stay consistent across themes and viewport sizes', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
  await page.goto('/login')
  await page.getByRole('button', { name: 'Light', exact: true }).click()
  await page.screenshot({ path: 'test-results/ledger-login.png', fullPage: true })
  await page.getByLabel('Email', { exact: true }).fill('admin@payload.local')
  await page.getByLabel('Password', { exact: true }).fill('Admin12345!')
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
  await expect(page).toHaveURL(/dashboard/, { timeout: 15_000 })
  await expect(
    page.getByRole('heading', { name: 'Backoffice overview', exact: true }),
  ).toBeVisible()
  await page.screenshot({ path: 'test-results/ledger-overview.png', fullPage: true })
  await page.goto('/payments/transactions')
  await expect(page.locator('tbody tr')).toHaveCount(10)
  await page.getByRole('button', { name: 'Dark', exact: true }).click()
  await expect(page.locator('html')).toHaveClass(/dark/)
  const firstCell = page.locator('tbody tr').first().locator('td').nth(1)
  // Resolve the intended token independently of the cell, then check its rendered opacity.
  const cardColor = await page.evaluate(() => {
    const probe = document.createElement('span')
    probe.style.backgroundColor = 'var(--card)'
    document.body.append(probe)
    const color = getComputedStyle(probe).backgroundColor
    probe.remove()
    return color
  })
  await expect(firstCell).toHaveCSS('background-color', cardColor)
  expect(cardColor).toMatch(/^rgb\(/)
  expect(
    await firstCell.evaluate((cell) => {
      let node: Element | null = cell
      while (node) {
        if (Number(getComputedStyle(node).opacity) !== 1) return false
        node = node.parentElement
      }
      return true
    }),
  ).toBe(true)
  await page.evaluate(() => window.scrollTo(0, 0))
  await page.screenshot({ path: 'test-results/ledger-transactions-dark.png', fullPage: true })
  await page.getByRole('button', { name: 'Light', exact: true }).click()
  await page.goto('/merchants/demo-merchant-1')
  await expect(page.getByRole('heading', { name: 'Retail 1', exact: true })).toBeVisible()
  for (const width of [1440, 768, 390]) {
    await page.setViewportSize({ width, height: 1000 })
    await page.evaluate(() => window.scrollTo(0, 0))
    expect(
      await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth),
    ).toBe(true)
    await page.screenshot({ path: `test-results/ledger-merchant-${width}.png`, fullPage: true })
  }
})
