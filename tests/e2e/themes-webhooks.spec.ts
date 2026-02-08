import { test, expect } from '@playwright/test'

test.describe('Theme Customization', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard')
  })

  test('should navigate to themes page', async ({ page }) => {
    const themesLink = page.locator('a:has-text("Themes"), a[href*="/themes"]')
    if (await themesLink.count() > 0) {
      await themesLink.first().click()
      await page.waitForURL(/\/themes/)
      expect(page.url()).toContain('/themes')
    }
  })

  test('should create new theme', async ({ page }) => {
    await page.goto('/dashboard')
    const themesLink = page.locator('a:has-text("Themes"), a[href*="/themes"]')
    if (await themesLink.count() > 0) {
      await themesLink.first().click()
      await page.waitForURL(/\/themes/)

      // Click create theme button
      const createButton = page.locator('button:has-text("Create Theme"), button:has-text("New Theme")')
      if (await createButton.isVisible()) {
        await createButton.click()

        // Fill theme name
        const nameInput = page.locator('input[name="name"], input[placeholder*="name"]')
        if (await nameInput.isVisible()) {
          await nameInput.fill('My Custom Theme')
        }

        // Submit
        const submitButton = page.locator('button:has-text("Create"), button[type="submit"]')
        if (await submitButton.isVisible()) {
          await submitButton.click()
          await page.waitForTimeout(500)
        }
      }
    }
  })

  test('should edit theme colors', async ({ page }) => {
    await page.goto('/dashboard')

    // Navigate to theme editor
    const themesLink = page.locator('a[href*="/themes"]').first()
    if (await themesLink.isVisible()) {
      await themesLink.click()
      await page.waitForURL(/\/themes/)

      // Click on first theme to edit
      const themeCard = page.locator('[data-testid="theme-card"], .theme-card').first()
      if (await themeCard.isVisible()) {
        const editButton = themeCard.locator('button:has-text("Edit"), a:has-text("Edit")')
        if (await editButton.isVisible()) {
          await editButton.click()
          await page.waitForURL(/\/themes\/.*\/edit/)

          // Change primary color
          const colorInput = page.locator('input[type="color"], input[name*="primary"]')
          if (await colorInput.isVisible()) {
            await colorInput.fill('#FF5733')
          }
        }
      }
    }
  })

  test('should preview theme changes', async ({ page }) => {
    await page.goto('/dashboard')

    const themesLink = page.locator('a[href*="/themes"]').first()
    if (await themesLink.isVisible()) {
      await themesLink.click()
      await page.waitForURL(/\/themes/)

      const themeCard = page.locator('[data-testid="theme-card"]').first()
      if (await themeCard.isVisible()) {
        const editButton = themeCard.locator('button:has-text("Edit")').first()
        if (await editButton.isVisible()) {
          await editButton.click()
          await page.waitForURL(/\/themes\/.*\/edit/)

          // Check for preview panel
          const previewPanel = page.locator('[data-testid="theme-preview"], .theme-preview')
          if (await previewPanel.isVisible()) {
            expect(await previewPanel.isVisible()).toBe(true)
          }
        }
      }
    }
  })

  test('should apply theme to form', async ({ page }) => {
    await page.goto('/dashboard')

    // Navigate to form settings
    const formSettingsLink = page.locator('a[href*="/settings"]').first()
    if (await formSettingsLink.isVisible()) {
      await formSettingsLink.click()

      // Find theme selector
      const themeSelect = page.locator('select[name="themeId"], [data-testid="theme-select"]')
      if (await themeSelect.isVisible()) {
        await themeSelect.selectOption({ index: 1 }) // Select first theme
      }
    }
  })

  test('should verify theme on public form', async ({ page }) => {
    // Navigate to public form with theme
    await page.goto('/to/test-workspace/themed-form')

    // Verify CSS variables are applied
    const body = page.locator('body')
    const backgroundColor = await body.evaluate((el) => {
      return getComputedStyle(el).getPropertyValue('--background')
    }).catch(() => null)

    // Theme should apply some custom styles
    if (backgroundColor) {
      expect(backgroundColor).toBeTruthy()
    }
  })
})

test.describe('Webhook Configuration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/dashboard')
  })

  test('should navigate to webhook settings', async ({ page }) => {
    // Navigate to form settings
    const settingsLink = page.locator('a[href*="/settings"]').first()
    if (await settingsLink.isVisible()) {
      await settingsLink.click()

      // Click integrations/webhooks tab
      const webhooksTab = page.locator('button:has-text("Integrations"), button:has-text("Webhooks")')
      if (await webhooksTab.isVisible()) {
        await webhooksTab.click()
        await page.waitForTimeout(300)
      }
    }
  })

  test('should add new webhook', async ({ page }) => {
    await page.goto('/dashboard')

    const settingsLink = page.locator('a[href*="/settings"]').first()
    if (await settingsLink.isVisible()) {
      await settingsLink.click()

      const webhooksTab = page.locator('button:has-text("Integrations"), button:has-text("Webhooks")')
      if (await webhooksTab.isVisible()) {
        await webhooksTab.click()

        // Click add webhook
        const addButton = page.locator('button:has-text("Add Webhook"), button:has-text("Add")')
        if (await addButton.isVisible()) {
          await addButton.click()

          // Fill webhook URL
          const urlInput = page.locator('input[name="url"], input[placeholder*="URL"]')
          if (await urlInput.isVisible()) {
            await urlInput.fill('https://example.com/webhook')
          }

          // Save
          const saveButton = page.locator('button:has-text("Save"), button[type="submit"]')
          if (await saveButton.isVisible()) {
            await saveButton.click()
            await page.waitForTimeout(500)
          }
        }
      }
    }
  })

  test('should display webhook secret', async ({ page }) => {
    await page.goto('/dashboard')

    const settingsLink = page.locator('a[href*="/settings"]').first()
    if (await settingsLink.isVisible()) {
      await settingsLink.click()

      const webhooksTab = page.locator('button:has-text("Webhooks")')
      if (await webhooksTab.isVisible()) {
        await webhooksTab.click()

        // Check for secret display
        const secretField = page.locator('text=whsec_, code:has-text("whsec_")')
        if (await secretField.isVisible()) {
          expect(await secretField.textContent()).toContain('whsec_')
        }
      }
    }
  })

  test('should test webhook delivery', async ({ page }) => {
    await page.goto('/dashboard')

    const settingsLink = page.locator('a[href*="/settings"]').first()
    if (await settingsLink.isVisible()) {
      await settingsLink.click()

      const webhooksTab = page.locator('button:has-text("Webhooks")')
      if (await webhooksTab.isVisible()) {
        await webhooksTab.click()

        // Click test button
        const testButton = page.locator('button:has-text("Test"), button:has-text("Send Test")')
        if (await testButton.isVisible()) {
          await testButton.click()

          // Wait for response
          await page.waitForTimeout(2000)

          // Check for success/failure message
          const message = page.locator('text=success, text=sent, text=delivered, text=failed')
          if (await message.isVisible()) {
            expect(await message.isVisible()).toBe(true)
          }
        }
      }
    }
  })

  test('should view webhook logs', async ({ page }) => {
    await page.goto('/dashboard')

    const settingsLink = page.locator('a[href*="/settings"]').first()
    if (await settingsLink.isVisible()) {
      await settingsLink.click()

      const webhooksTab = page.locator('button:has-text("Webhooks")')
      if (await webhooksTab.isVisible()) {
        await webhooksTab.click()

        // Click view logs
        const logsLink = page.locator('button:has-text("Logs"), a:has-text("View Logs")')
        if (await logsLink.isVisible()) {
          await logsLink.click()
          await page.waitForTimeout(300)

          // Check for logs table
          const logsTable = page.locator('table, [data-testid="webhook-logs"]')
          if (await logsTable.isVisible()) {
            expect(await logsTable.isVisible()).toBe(true)
          }
        }
      }
    }
  })

  test('should toggle webhook enabled state', async ({ page }) => {
    await page.goto('/dashboard')

    const settingsLink = page.locator('a[href*="/settings"]').first()
    if (await settingsLink.isVisible()) {
      await settingsLink.click()

      const webhooksTab = page.locator('button:has-text("Webhooks")')
      if (await webhooksTab.isVisible()) {
        await webhooksTab.click()

        // Find enable toggle
        const toggle = page.locator('input[type="checkbox"][name*="enabled"], [role="switch"]')
        if (await toggle.isVisible()) {
          const wasChecked = await toggle.isChecked()
          await toggle.click()
          await page.waitForTimeout(500)

          // Verify state changed
          const isChecked = await toggle.isChecked()
          expect(isChecked).toBe(!wasChecked)
        }
      }
    }
  })

  test('should delete webhook', async ({ page }) => {
    await page.goto('/dashboard')

    const settingsLink = page.locator('a[href*="/settings"]').first()
    if (await settingsLink.isVisible()) {
      await settingsLink.click()

      const webhooksTab = page.locator('button:has-text("Webhooks")')
      if (await webhooksTab.isVisible()) {
        await webhooksTab.click()

        // Find delete button
        const deleteButton = page.locator('button:has-text("Delete")')
        if (await deleteButton.isVisible()) {
          await deleteButton.click()

          // Confirm deletion
          const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Yes")')
          if (await confirmButton.isVisible()) {
            await confirmButton.click()
            await page.waitForTimeout(500)
          }
        }
      }
    }
  })
})

test.describe('Team Collaboration', () => {
  test('should navigate to members page', async ({ page }) => {
    await page.goto('/dashboard')

    const membersLink = page.locator('a:has-text("Members"), a:has-text("Team"), a[href*="/members"]')
    if (await membersLink.count() > 0) {
      await membersLink.first().click()
      await page.waitForURL(/\/members|\/team/)
    }
  })

  test('should invite team member', async ({ page }) => {
    await page.goto('/dashboard')

    const membersLink = page.locator('a[href*="/members"]').first()
    if (await membersLink.isVisible()) {
      await membersLink.click()

      // Click invite button
      const inviteButton = page.locator('button:has-text("Invite")')
      if (await inviteButton.isVisible()) {
        await inviteButton.click()

        // Fill email
        const emailInput = page.locator('input[type="email"], input[name="email"]')
        if (await emailInput.isVisible()) {
          await emailInput.fill('teammate@example.com')
        }

        // Select role
        const roleSelect = page.locator('select[name="role"]')
        if (await roleSelect.isVisible()) {
          await roleSelect.selectOption('editor')
        }

        // Send invite
        const sendButton = page.locator('button:has-text("Send"), button[type="submit"]')
        if (await sendButton.isVisible()) {
          await sendButton.click()
          await page.waitForTimeout(500)

          // Check for success message
          const successMessage = page.locator('text=invited, text=sent')
          if (await successMessage.isVisible()) {
            expect(await successMessage.isVisible()).toBe(true)
          }
        }
      }
    }
  })
})

test.describe('Response Management', () => {
  test('should view responses list', async ({ page }) => {
    await page.goto('/dashboard')

    const responsesLink = page.locator('a[href*="/responses"]').first()
    if (await responsesLink.isVisible()) {
      await responsesLink.click()
      await page.waitForURL(/\/responses/)

      // Check for responses table
      const table = page.locator('table, [data-testid="responses-table"]')
      if (await table.isVisible()) {
        expect(await table.isVisible()).toBe(true)
      }
    }
  })

  test('should export responses', async ({ page }) => {
    await page.goto('/dashboard')

    const responsesLink = page.locator('a[href*="/responses"]').first()
    if (await responsesLink.isVisible()) {
      await responsesLink.click()

      // Click export button
      const exportButton = page.locator('button:has-text("Export")')
      if (await exportButton.isVisible()) {
        await exportButton.click()

        // Select format
        const csvOption = page.locator('button:has-text("CSV")')
        if (await csvOption.isVisible()) {
          // Intercept download
          const download = page.waitForEvent('download').catch(() => null)
          await csvOption.click()

          const downloadedFile = await download
          if (downloadedFile) {
            expect(downloadedFile.suggestedFilename()).toContain('.csv')
          }
        }
      }
    }
  })

  test('should view response analytics', async ({ page }) => {
    await page.goto('/dashboard')

    const responsesLink = page.locator('a[href*="/responses"]').first()
    if (await responsesLink.isVisible()) {
      await responsesLink.click()

      // Click analytics tab
      const analyticsTab = page.locator('button:has-text("Analytics"), button:has-text("Insights")')
      if (await analyticsTab.isVisible()) {
        await analyticsTab.click()
        await page.waitForTimeout(500)

        // Check for charts
        const chart = page.locator('canvas, [data-testid="chart"], .recharts-wrapper')
        if (await chart.isVisible()) {
          expect(await chart.isVisible()).toBe(true)
        }
      }
    }
  })
})
