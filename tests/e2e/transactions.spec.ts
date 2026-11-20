import { expect, test } from '@playwright/test'

test('mock transactions support filters, detail, export, errors and responsive layouts', async ({
  page,
}) => {
  const errors: string[] = []
  page.on('pageerror', (error) => errors.push(error.message))
  await page.goto('/login')
  await page.getByLabel('Email', { exact: true }).fill('admin@payload.local')
  await page.getByLabel('Password', { exact: true }).fill('Admin12345!')
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
  await expect(page).toHaveURL(/dashboard/, { timeout: 15_000 })
  await page.goto('/payments/transactions')
  await expect(
    page.getByRole('heading', { name: 'Payment transactions', exact: true }),
  ).toBeVisible()
  await expect(page.getByText('Showing 1–10 of 36 transactions', { exact: true })).toBeVisible()
  await expect(page.locator('thead th')).toHaveCount(13)
  expect(
    await page
      .getByRole('heading', { name: 'Payment transactions', exact: true })
      .evaluate((element) => getComputedStyle(element).fontSize),
  ).toBe('24px')
  expect(
    await page
      .getByRole('button', { name: 'Merchant', exact: true })
      .evaluate((element) => getComputedStyle(element).fontSize),
  ).toBe('14px')
  const firstRow = page.locator('tbody tr').first()
  await expect(firstRow.locator('td').nth(1)).not.toContainText('DEMO-ORDER')
  await expect(
    page.getByRole('columnheader', { name: 'External ID', exact: true }),
  ).not.toBeVisible()
  await expect(
    page.getByRole('status').filter({ hasText: 'Showing 1–10 of 36 transactions' }),
  ).toBeVisible()
  await expect(page.getByRole('button', { name: 'Next page', exact: true })).toBeEnabled()
  await page.getByRole('button', { name: 'Next page', exact: true }).click()
  await expect(page.getByText('Showing 11–20 of 36 transactions', { exact: true })).toBeVisible()
  await page.getByRole('combobox', { name: 'Rows per page', exact: true }).click()
  await page.getByRole('option', { name: '20', exact: true }).click()
  await expect(page.getByText('Showing 1–20 of 36 transactions', { exact: true })).toBeVisible()
  await expect(
    page.getByRole('navigation', { name: 'Transaction pagination', exact: true }),
  ).toContainText('Page 1 of 2')
  await page.getByRole('combobox', { name: 'Rows per page', exact: true }).click()
  await page.getByRole('option', { name: '10', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Previous page', exact: true })).toBeDisabled()
  await expect(page.getByRole('button', { name: 'Reset filters', exact: true })).not.toBeVisible()
  await page.getByRole('button', { name: 'Merchant', exact: true }).click()
  await expect(
    page.getByRole('combobox', { name: 'Sort transactions', exact: true }),
  ).toContainText('Custom sort')
  await page.getByRole('combobox', { name: 'Sort transactions', exact: true }).click()
  await page.getByRole('option', { name: 'Newest first', exact: true }).click()
  const tableScroller = page.locator('[data-slot="table-container"]')
  const referenceHeader = page.locator('thead th').nth(1)
  const headerBefore = await referenceHeader.boundingBox()
  await tableScroller.evaluate((element) => {
    element.scrollTop = 200
  })
  const headerAfter = await referenceHeader.boundingBox()
  expect(Math.abs((headerAfter?.y ?? 0) - (headerBefore?.y ?? 0))).toBeLessThan(2)
  await tableScroller.evaluate((element) => {
    element.scrollTop = 0
  })
  const referenceBefore = await firstRow.locator('td').nth(1).boundingBox()
  await tableScroller.evaluate((element) => {
    element.scrollLeft = 500
  })
  const referenceAfter = await firstRow.locator('td').nth(1).boundingBox()
  expect(Math.abs((referenceAfter?.x ?? 0) - (referenceBefore?.x ?? 0))).toBeLessThan(2)
  await tableScroller.evaluate((element) => {
    element.scrollLeft = 0
  })
  await page.getByRole('tab', { name: 'Needs review', exact: true }).click()
  await expect(page.getByRole('tab', { name: 'Needs review', exact: true })).toHaveAttribute(
    'aria-selected',
    'true',
  )
  await expect(page.getByText('Showing 1–10 of 36 transactions', { exact: true })).not.toBeVisible()
  await page.getByRole('tab', { name: 'All transactions', exact: true }).click()
  await page.getByRole('button', { name: 'Multi-search', exact: true }).click()
  await page
    .getByLabel('References or customers', { exact: true })
    .fill('DEMO-ORDER-00001\nDEMO-ORDER-00002\nDEMO-ORDER-00001')
  await expect(page.getByText('2 unique values', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Cancel', exact: true }).click()
  await expect(page.getByText('Showing 1–10 of 36 transactions', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Multi-search', exact: true }).click()
  await page
    .getByLabel('References or customers', { exact: true })
    .fill('DEMO-ORDER-00001;DEMO-ORDER-00002')
  await page.getByRole('button', { name: 'Search transactions', exact: true }).click()
  await expect(page.getByText('Showing 1–2 of 2 transactions', { exact: true })).toBeVisible()
  await page.locator('tbody button').first().click()
  await page.getByRole('button', { name: 'Next transaction', exact: true }).click()
  await expect(
    page.getByRole('button', { name: 'Previous transaction', exact: true }),
  ).toBeEnabled()
  await page.keyboard.press('Escape')
  await page.getByRole('button', { name: 'Reset filters', exact: true }).click()
  await page.getByRole('button', { name: 'Period: All dates', exact: true }).click()
  await page.getByLabel('Start date & time (UTC)', { exact: true }).fill('2026-11-14T10:44')
  await page.getByLabel('End date & time (UTC)', { exact: true }).fill('2026-11-14T10:46')
  await page.getByRole('button', { name: 'Cancel', exact: true }).click()
  await expect(page.getByText('Showing 1–10 of 36 transactions', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Period: All dates', exact: true }).click()
  await page.getByLabel('Start date & time (UTC)', { exact: true }).fill('2026-11-14T10:44')
  await page.getByLabel('End date & time (UTC)', { exact: true }).fill('2026-11-14T10:46')
  await page.getByRole('button', { name: 'Apply filters', exact: true }).click()
  await expect(page.getByText('Showing 1–2 of 2 transactions', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Reset filters', exact: true }).click()
  await page
    .getByLabel('Search transactions', { exact: true })
    .fill('DEMO-ORDER-00001, DEMO-ORDER-00002')
  await expect(page.getByText('Showing 1–2 of 2 transactions', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Clear search', exact: true }).click()
  await page.getByLabel('Search transactions', { exact: true }).fill('DEMO-ORDER-00001')
  await expect(page.getByText('Showing 1–1 of 1 transactions', { exact: true })).toBeVisible()
  await page.locator('tbody button').first().click()
  await expect(page.getByRole('heading', { name: 'Transaction details' })).toBeVisible()
  await expect(page.getByText('customer1@example.com', { exact: true })).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('heading', { name: 'Transaction details' })).not.toBeVisible()
  const download = page.waitForEvent('download')
  await page.getByRole('button', { name: 'Export CSV', exact: true }).click()
  expect((await download).suggestedFilename()).toBe('payment-transactions.csv')
  await page.getByLabel('Search transactions', { exact: true }).fill('not-a-transaction')
  await expect(
    page.getByText('No transactions match these filters. Adjust your search or reset the filters.'),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Reset filters', exact: true }).click()
  await page.getByRole('button', { name: 'View', exact: true }).click()
  await expect(page.getByRole('menuitemradio', { name: 'Normal', exact: true })).toHaveAttribute(
    'aria-checked',
    'true',
  )
  await page.getByRole('menuitemradio', { name: 'Compact', exact: true }).click()
  await page.keyboard.press('Escape')
  await page.getByRole('checkbox', { name: 'Select page', exact: true }).check()
  await page.getByRole('button', { name: 'Bulk callback', exact: true }).click()
  await expect(page.getByRole('dialog')).toContainText('10 selected transactions')
  await page.getByRole('button', { name: 'Cancel', exact: true }).click()
  await expect(page.getByRole('checkbox', { name: 'Select page', exact: true })).toBeChecked()
  await page.getByRole('button', { name: 'Bulk resync provider', exact: true }).click()
  await expect(page.getByRole('dialog')).toContainText('This action is not available yet.')
  await expect(page.getByRole('dialog').getByRole('button', { name: /run|confirm/i })).toHaveCount(
    0,
  )
  await page.getByRole('button', { name: 'Cancel', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Export selected CSV', exact: true })).toBeVisible()
  await page.getByRole('checkbox', { name: 'Select page', exact: true }).uncheck()
  await page.getByRole('button', { name: 'Advanced filters', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Add condition', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Add condition', exact: true }).click()
  await page.getByRole('combobox', { name: 'Filter field', exact: true }).click()
  await page.getByRole('option', { name: 'Created (UTC)', exact: true }).click()
  await page.getByRole('combobox', { name: 'Filter operator', exact: true }).click()
  await page.getByRole('option', { name: 'between', exact: true }).click()
  await page.getByLabel('Created (UTC) start (UTC)', { exact: true }).fill('2026-11-14T10:44')
  await page.getByLabel('Created (UTC) end (UTC)', { exact: true }).fill('2026-11-14T10:46')
  await page.keyboard.press('Escape')
  await expect(page.getByText('Showing 1–2 of 2 transactions', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Reset filters', exact: true }).click()
  await page.getByRole('button', { name: 'Saved views', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Default view', exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'New view', exact: true }).click()
  await page.getByPlaceholder('My active leads…').fill('Mock review')
  await page.getByRole('button', { name: 'Save view', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Mock review', exact: true }).first()).toBeVisible()
  await page.keyboard.press('Escape')
  await expect(page.getByText('Preview tools', { exact: true })).toHaveCount(0)
  await expect(page.getByRole('button', { name: 'Simulate error' })).toHaveCount(0)
  await expect(page.getByText(/mock data|UI preview|no live transactions/i)).toHaveCount(0)
  await expect(page.getByText('Showing 1–10 of 36 transactions', { exact: true })).toBeVisible()
  await page.screenshot({ path: 'test-results/transactions-desktop.png', fullPage: true })
  await page.evaluate(() => document.documentElement.classList.add('dark'))
  await page.screenshot({ path: 'test-results/transactions-dark.png', fullPage: true })
  await page.setViewportSize({ width: 390, height: 844 })
  await page.screenshot({ path: 'test-results/transactions-mobile.png', fullPage: true })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(
    true,
  )
  expect(errors).toEqual([])
})
