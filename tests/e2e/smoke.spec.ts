import { test, expect } from '@playwright/test'

test.describe('Landing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display hero heading', async ({ page }) => {
    await expect(page.locator('h1')).toContainText('Forms that feel like a game')
  })

  test('should have navigation links', async ({ page }) => {
    await expect(page.locator('nav a[href="/login"]')).toBeVisible()
    await expect(page.locator('nav a[href="/signup"]')).toBeVisible()
  })

  test('should navigate to signup from Get Started button', async ({ page }) => {
    await page.locator('nav a[href="/signup"]').click()
    await expect(page).toHaveURL(/\/signup/)
  })

  test('should navigate to login from Sign in link', async ({ page }) => {
    await page.locator('nav a[href="/login"]').click()
    await expect(page).toHaveURL(/\/login/)
  })

  test('should have a single h1 element', async ({ page }) => {
    const h1Count = await page.locator('h1').count()
    expect(h1Count).toBe(1)
  })
})

test.describe('Login Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('should render login form with email and password fields', async ({ page }) => {
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
  })

  test('should have a sign-in submit button', async ({ page }) => {
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('should have OAuth buttons for Google and GitHub', async ({ page }) => {
    await expect(page.locator('button', { hasText: 'Google' })).toBeVisible()
    await expect(page.locator('button', { hasText: 'GitHub' })).toBeVisible()
  })

  test('should have link to signup page', async ({ page }) => {
    const signupLink = page.locator('a[href="/signup"]')
    await expect(signupLink).toBeVisible()
  })

  test('should have forgot password link', async ({ page }) => {
    const forgotLink = page.locator('a[href="/reset-password"]')
    await expect(forgotLink).toBeVisible()
  })
})

test.describe('Signup Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/signup')
  })

  test('should render signup form with name, email, password, and confirm password fields', async ({ page }) => {
    await expect(page.locator('input[autocomplete="name"]')).toBeVisible()
    await expect(page.locator('input[type="email"]')).toBeVisible()

    const passwordFields = page.locator('input[type="password"]')
    await expect(passwordFields).toHaveCount(2)
  })

  test('should have a submit button', async ({ page }) => {
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('should have OAuth buttons for Google and GitHub', async ({ page }) => {
    await expect(page.locator('button', { hasText: 'Google' })).toBeVisible()
    await expect(page.locator('button', { hasText: 'GitHub' })).toBeVisible()
  })

  test('should have link to login page', async ({ page }) => {
    const loginLink = page.locator('a[href="/login"]')
    await expect(loginLink).toBeVisible()
  })

  test('should show validation errors for weak password on submit', async ({ page }) => {
    await page.locator('input[autocomplete="name"]').fill('Test User')
    await page.locator('input[type="email"]').fill('test@example.com')

    const passwordFields = page.locator('input[type="password"]')
    await passwordFields.nth(0).fill('short')
    await passwordFields.nth(1).fill('short')

    await page.locator('button[type="submit"]').click()

    // Should show a password validation error (too short / missing requirements)
    await expect(page.locator('.text-error', { hasText: /password/i })).toBeVisible()
  })
})

test.describe('Non-existent Form URL', () => {
  test('should show error or 404 for non-existent public form', async ({ page }) => {
    const response = await page.goto('/to/nonexistent-workspace/nonexistent-form')

    const status = response?.status() ?? 0
    if (status === 404) {
      // Server-side 404 — test passes
      return
    }

    // Client-side rendered page: wait for loading to finish and error to appear
    await expect(
      page.locator('text=/not found|does not exist|failed to load/i')
    ).toBeVisible({ timeout: 10000 })
  })
})
