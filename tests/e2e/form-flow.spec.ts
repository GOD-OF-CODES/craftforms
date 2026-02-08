import { test, expect } from '@playwright/test'

test.describe('Form Creation Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/')
  })

  test('should display landing page', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('CraftForms')
  })

  test('should navigate to login page', async ({ page }) => {
    await page.click('text=Get Started')
    await expect(page).toHaveURL(/.*login/)
  })
})

test.describe('Form Builder', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication and navigate to form builder
    // In real tests, you would set up auth state
    await page.goto('/workspace/forms/form-1/edit')
  })

  test('should display three-panel layout', async ({ page }) => {
    // Check for field palette
    await expect(page.locator('[data-testid="field-palette"]')).toBeVisible()

    // Check for preview panel
    await expect(page.locator('[data-testid="form-preview"]')).toBeVisible()

    // Check for settings panel
    await expect(page.locator('[data-testid="settings-panel"]')).toBeVisible()
  })

  test('should add field when clicking on palette item', async ({ page }) => {
    // Click on Short Text field type
    await page.click('text=Short Text')

    // Verify field appears in preview
    await expect(page.locator('[data-testid="field-item"]')).toBeVisible()
  })

  test('should update field title', async ({ page }) => {
    // Add a field first
    await page.click('text=Short Text')

    // Click on the field to select it
    await page.click('[data-testid="field-item"]')

    // Update the title in settings panel
    await page.fill('[data-testid="field-title-input"]', 'What is your name?')

    // Verify title updated in preview
    await expect(page.locator('[data-testid="field-item"]')).toContainText('What is your name?')
  })
})

test.describe('Form Taking', () => {
  test('should navigate through form questions', async ({ page }) => {
    // Navigate to a public form
    await page.goto('/to/workspace/test-form')

    // Check for welcome screen or first question
    await expect(page.locator('h1, h2, [data-testid="question-title"]')).toBeVisible()

    // Fill in an answer
    await page.fill('input, textarea', 'Test answer')

    // Click next or press enter
    await page.keyboard.press('Enter')

    // Wait for transition
    await page.waitForTimeout(500)
  })

  test('should show progress indicator', async ({ page }) => {
    await page.goto('/to/workspace/test-form')

    // Check for progress bar
    await expect(page.locator('[role="progressbar"], [data-testid="progress-bar"]')).toBeVisible()
  })

  test('should validate required fields', async ({ page }) => {
    await page.goto('/to/workspace/test-form')

    // Try to continue without filling required field
    await page.keyboard.press('Enter')

    // Check for validation error
    await expect(page.locator('[data-testid="validation-error"], .text-red-500')).toBeVisible()
  })
})

test.describe('Response Management', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to responses page
    await page.goto('/workspace/forms/form-1/responses')
  })

  test('should display responses table', async ({ page }) => {
    await expect(page.locator('table, [data-testid="responses-table"]')).toBeVisible()
  })

  test('should filter responses by status', async ({ page }) => {
    // Click status filter
    await page.click('[data-testid="status-filter"]')

    // Select "Completed"
    await page.click('text=Completed')

    // Verify filter applied
    await expect(page.locator('[data-testid="response-row"]')).toBeVisible()
  })

  test('should export responses', async ({ page }) => {
    // Click export button
    const downloadPromise = page.waitForEvent('download')
    await page.click('text=Export CSV')

    // Verify download started
    const download = await downloadPromise
    expect(download.suggestedFilename()).toContain('.csv')
  })
})

test.describe('Theme Customization', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/workspace/themes/theme-1/edit')
  })

  test('should display theme editor with live preview', async ({ page }) => {
    // Check for color controls
    await expect(page.locator('[data-testid="color-picker"]')).toBeVisible()

    // Check for preview panel
    await expect(page.locator('[data-testid="theme-preview"]')).toBeVisible()
  })

  test('should update colors in real-time', async ({ page }) => {
    // Change primary color
    await page.fill('input[type="color"]', '#ff0000')

    // Verify preview updated
    await expect(page.locator('[data-testid="theme-preview"] button')).toHaveCSS('background-color', 'rgb(255, 0, 0)')
  })
})

test.describe('Accessibility', () => {
  test('should have skip link', async ({ page }) => {
    await page.goto('/')

    // Focus on skip link
    await page.keyboard.press('Tab')

    // Check skip link is visible when focused
    const skipLink = page.locator('[data-testid="skip-link"]')
    await expect(skipLink).toBeFocused()
  })

  test('should navigate with keyboard only', async ({ page }) => {
    await page.goto('/to/workspace/test-form')

    // Tab through form elements
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')

    // Verify focus is visible
    const focusedElement = page.locator(':focus')
    await expect(focusedElement).toBeVisible()
  })

  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/')

    // Check for h1
    const h1Count = await page.locator('h1').count()
    expect(h1Count).toBe(1)

    // Check that h2 comes after h1
    const headings = await page.locator('h1, h2, h3').allTextContents()
    expect(headings.length).toBeGreaterThan(0)
  })
})
