import { expect, test } from '@playwright/test'

async function login(page: import('@playwright/test').Page) {
  await page.goto('/login')
  await page.getByLabel('Email', { exact: true }).fill('admin@payload.local')
  await page.getByLabel('Password', { exact: true }).fill('Admin12345!')
  await page.getByRole('button', { name: 'Sign in', exact: true }).click()
  await expect(page).toHaveURL(/dashboard/, { timeout: 15_000 })
}

test('provider local create edit status archive and restore', async ({ page }) => {
  await login(page)
  const calls: string[] = []
  page.on('request', (request) => {
    if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method())) calls.push(request.url())
  })
  await page.goto('/partners/providers')
  await page.getByRole('button', { name: 'Add provider', exact: true }).click()
  await page.getByLabel('Provider code *', { exact: true }).fill('E2E_PROVIDER')
  await page.getByLabel('Provider name *', { exact: true }).fill('Workspace Provider')
  await page.getByLabel('Base URL *', { exact: true }).fill('https://workspace-provider.example')
  await page.getByRole('button', { name: 'Save provider', exact: true }).click()
  await page.getByRole('button', { name: 'E2E_PROVIDER', exact: true }).click()
  await page.getByRole('button', { name: 'Edit provider', exact: true }).click()
  await page.getByLabel('Provider name *', { exact: true }).fill('Updated Workspace Provider')
  await page.getByRole('button', { name: 'Save provider', exact: true }).click()
  await expect(
    page.getByRole('heading', { name: 'Updated Workspace Provider', exact: true }),
  ).toBeVisible()
  await page.getByRole('button', { name: 'Maintenance', exact: true }).click()
  await page
    .getByRole('dialog')
    .last()
    .getByRole('button', { name: 'Confirm', exact: true })
    .click()
  await page.getByRole('button', { name: 'Delete provider', exact: true }).click()
  await page
    .getByRole('dialog')
    .last()
    .getByRole('button', { name: 'Confirm', exact: true })
    .click()
  await page.getByRole('tab', { name: 'Archived', exact: true }).click()
  await page.getByRole('button', { name: 'E2E_PROVIDER', exact: true }).click()
  await page.getByRole('button', { name: 'Restore provider', exact: true }).click()
  await page
    .getByRole('dialog')
    .last()
    .getByRole('button', { name: 'Confirm', exact: true })
    .click()
  await page.keyboard.press('Escape')
  await page.getByRole('tab', { name: 'All providers', exact: true }).click()
  await expect(page.getByRole('button', { name: 'E2E_PROVIDER', exact: true })).toBeVisible()
  expect(calls).toEqual([])
})

test('partner saved views and local endpoint checks do not call providers', async ({ page }) => {
  await login(page)
  const writes: string[] = []
  page.on('request', (request) => {
    if (['POST', 'PATCH', 'PUT', 'DELETE'].includes(request.method())) writes.push(request.url())
  })
  await page.goto('/partners/providers')
  await page.getByRole('button', { name: 'ISSUER_01', exact: true }).click()
  await page.getByRole('button', { name: 'Test connection', exact: true }).click()
  await expect(page.getByRole('dialog').last()).toContainText(
    'does not contact the external provider',
  )
  await page
    .getByRole('dialog')
    .last()
    .getByRole('button', { name: 'Confirm', exact: true })
    .click()
  await expect(
    page.getByText('Endpoint configuration checked in this workspace.', { exact: true }),
  ).toBeVisible()
  await page.keyboard.press('Escape')
  await page.getByRole('textbox', { name: 'Search providers', exact: true }).fill('Nusantara')
  await page.getByRole('button', { name: 'Saved views', exact: true }).click()
  await page.getByRole('button', { name: 'New view', exact: true }).click()
  await page.getByRole('dialog').getByLabel('Name', { exact: true }).fill('Nusantara view')
  await page.getByRole('dialog').getByRole('button', { name: 'Save view', exact: true }).click()
  await page.keyboard.press('Escape')
  await page.getByRole('textbox', { name: 'Search providers', exact: true }).fill('not-found')
  await page.getByRole('button', { name: 'Saved views', exact: true }).click()
  await page.getByRole('button', { name: 'Nusantara view', exact: true }).click()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('textbox', { name: 'Search providers', exact: true })).toHaveValue(
    'Nusantara',
  )
  await expect(page.getByRole('button', { name: 'ISSUER_01', exact: true })).toBeVisible()
  expect(writes).toEqual([])
})
test('channel local create edit status archive and restore', async ({ page }) => {
  await login(page)
  await page.goto('/partners/channels')
  await page.getByRole('button', { name: 'Add channel', exact: true }).click()
  await page.getByLabel('Code', { exact: true }).fill('E2E_CHANNEL')
  await page.getByLabel('Name', { exact: true }).fill('Workspace Channel')
  await page.getByRole('button', { name: 'Save changes', exact: true }).click()
  await page.getByRole('button', { name: 'E2E_CHANNEL', exact: true }).click()
  await page.getByRole('button', { name: 'Edit channel', exact: true }).click()
  await page.getByLabel('Name', { exact: true }).fill('Updated Channel')
  await page.getByRole('button', { name: 'Save changes', exact: true }).click()
  await expect(page.getByRole('dialog').getByText('Updated Channel', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Maintenance', exact: true }).click()
  await page
    .getByRole('dialog')
    .last()
    .getByRole('button', { name: 'Confirm', exact: true })
    .click()
  await page.getByRole('button', { name: 'E2E_CHANNEL', exact: true }).click()
  await page.getByRole('button', { name: 'Delete', exact: true }).click()
  await page
    .getByRole('dialog')
    .last()
    .getByRole('button', { name: 'Confirm', exact: true })
    .click()
  await page.getByRole('tab', { name: 'Archived', exact: true }).click()
  await page.getByRole('button', { name: 'E2E_CHANNEL', exact: true }).click()
  await page.getByRole('button', { name: 'Restore', exact: true }).click()
  await page
    .getByRole('dialog')
    .last()
    .getByRole('button', { name: 'Confirm', exact: true })
    .click()
  await page.getByRole('tab', { name: 'All channels', exact: true }).click()
  await expect(page.getByRole('button', { name: 'E2E_CHANNEL', exact: true })).toBeVisible()
})

test('routing rules support local lifecycle without broken detail navigation', async ({ page }) => {
  await login(page)
  await page.goto('/partners/routing')
  await page.getByRole('button', { name: 'Add routing rule', exact: true }).click()
  for (const [label, value] of Object.entries({
    'Provider code': 'E2E',
    'Provider name': 'Workspace Provider',
    'Channel code': 'E2E_TRANSFER',
    'Channel name': 'Workspace Channel',
    'Issuer channel code': 'E2E_RULE',
  }))
    await page.getByLabel(label, { exact: true }).fill(value)
  await page.getByRole('button', { name: 'Save rule', exact: true }).click()
  await page.getByRole('button', { name: 'E2E_RULE', exact: true }).click()
  await expect(page).toHaveURL(/\/partners\/routing$/)
  await page.getByRole('button', { name: 'Edit routing rule', exact: true }).click()
  await page.getByLabel('Maximum amount', { exact: true }).fill('2500000.50')
  await page.getByRole('button', { name: 'Save rule', exact: true }).click()
  await expect(page.getByRole('dialog').getByText('2500000.50', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: 'Disable rule', exact: true }).click()
  await page
    .getByRole('dialog')
    .last()
    .getByRole('button', { name: 'Confirm', exact: true })
    .click()
  await page.getByRole('button', { name: 'E2E_RULE', exact: true }).click()
  await page.getByRole('button', { name: 'Archive rule', exact: true }).click()
  await page
    .getByRole('dialog')
    .last()
    .getByRole('button', { name: 'Confirm', exact: true })
    .click()
  await page.getByRole('tab', { name: 'Archived rules', exact: true }).click()
  await page.getByRole('button', { name: 'E2E_RULE', exact: true }).click()
  await page.getByRole('button', { name: 'Restore rule', exact: true }).click()
  await page
    .getByRole('dialog')
    .last()
    .getByRole('button', { name: 'Confirm', exact: true })
    .click()
  await page.getByRole('tab', { name: 'All rules', exact: true }).click()
  await expect(page.getByRole('button', { name: 'E2E_RULE', exact: true })).toBeVisible()
  await page.setViewportSize({ width: 390, height: 844 })
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.screenshot({ path: 'test-results/partners-routing-mobile.png', fullPage: true })
})
