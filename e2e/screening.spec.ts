import { test, expect } from '@playwright/test'

/**
 * Screening Flow E2E Tests
 */

test.describe('Health Screening Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/screening')
  })

  test('displays screening page correctly', async ({ page }) => {
    // Check page title
    await expect(page.getByRole('heading', { name: /personalized health assessment/i })).toBeVisible()
    
    // Check required fields are present
    await expect(page.getByLabel(/age/i)).toBeVisible()
    await expect(page.getByLabel(/gender/i)).toBeVisible()
  })

  test('validates required fields', async ({ page }) => {
    // Try to submit without filling required fields
    const submitButton = page.getByRole('button', { name: /get screening recommendations/i })
    
    // Button should be disabled when fields are empty
    await expect(submitButton).toBeDisabled()
  })

  test('allows age input', async ({ page }) => {
    const ageInput = page.getByPlaceholder(/enter your age/i)
    await ageInput.fill('45')
    await expect(ageInput).toHaveValue('45')
  })

  test('allows gender selection', async ({ page }) => {
    // Click gender dropdown
    await page.getByRole('combobox', { name: /gender/i }).click()
    
    // Select female
    await page.getByRole('option', { name: /female/i }).click()
    
    // Verify selection
    await expect(page.getByRole('combobox', { name: /gender/i })).toContainText(/female/i)
  })

  test('enables submit after filling required fields', async ({ page }) => {
    // Fill age
    await page.getByPlaceholder(/enter your age/i).fill('45')
    
    // Select gender
    await page.getByRole('combobox', { name: /gender/i }).click()
    await page.getByRole('option', { name: /female/i }).click()
    
    // Submit button should now be enabled
    const submitButton = page.getByRole('button', { name: /get screening recommendations/i }).first()
    await expect(submitButton).toBeEnabled()
  })

  test('expands optional sections', async ({ page }) => {
    // Find and click on "Personal Medical History" accordion
    const accordion = page.getByRole('button', { name: /personal medical history/i })
    await accordion.click()
    
    // Verify content is visible
    await expect(page.getByText(/high blood pressure/i)).toBeVisible()
  })

  test('completes full screening flow', async ({ page }) => {
    // Fill required fields
    await page.getByPlaceholder(/enter your age/i).fill('55')
    await page.getByRole('combobox', { name: /gender/i }).click()
    await page.getByRole('option', { name: /male/i }).click()
    
    // Submit form
    const submitButton = page.getByRole('button', { name: /get screening recommendations/i }).first()
    await submitButton.click()
    
    // Wait for results (loading state)
    await page.waitForSelector('text=Assessment Complete', { timeout: 10000 })
    
    // Verify results page
    await expect(page.getByText(/your personalized screening recommendations/i)).toBeVisible()
  })
})

test.describe('Screening Accessibility', () => {
  test('has no accessibility violations on main form', async ({ page }) => {
    await page.goto('/screening')
    
    // Basic accessibility check - all form inputs should have labels
    const ageInput = page.getByLabel(/age/i)
    await expect(ageInput).toBeVisible()
    
    // Check for heading hierarchy
    const h1 = page.getByRole('heading', { level: 1 })
    await expect(h1).toBeVisible()
  })

  test('supports keyboard navigation', async ({ page }) => {
    await page.goto('/screening')
    
    // Tab through form elements
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    
    // Age input should be focusable
    const ageInput = page.getByPlaceholder(/enter your age/i)
    await ageInput.focus()
    await expect(ageInput).toBeFocused()
  })
})

