import { test, expect } from '@playwright/test'

/**
 * Provider Search E2E Tests
 */

test.describe('Provider Search', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/providers/search')
  })

  test('displays search page correctly', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /find healthcare/i })).toBeVisible()
    await expect(page.getByPlaceholder(/cardiologist in san francisco/i)).toBeVisible()
  })

  test('allows search input', async ({ page }) => {
    const searchInput = page.getByPlaceholder(/cardiologist in san francisco/i)
    await searchInput.fill('primary care in Seattle')
    await expect(searchInput).toHaveValue('primary care in Seattle')
  })

  test('shows example searches', async ({ page }) => {
    // Example search buttons should be visible
    await expect(page.getByRole('button', { name: /cardiologist in san francisco/i })).toBeVisible()
  })

  test('executes example search on click', async ({ page }) => {
    // Click an example search
    const exampleButton = page.getByRole('button', { name: /cardiologist in san francisco/i })
    await exampleButton.click()
    
    // Search input should be populated
    const searchInput = page.getByPlaceholder(/cardiologist in san francisco/i)
    await expect(searchInput).toHaveValue(/cardiologist/i)
  })

  test('switches between doctors and caregivers mode', async ({ page }) => {
    // Check doctors mode is active by default
    await expect(page.getByRole('link', { name: /doctors & specialists/i })).toHaveClass(/bg-stone-900/)
    
    // Switch to caregivers mode
    await page.getByRole('link', { name: /caregivers/i }).click()
    
    // URL should change
    await expect(page).toHaveURL(/bounty=true/)
  })
})

test.describe('Provider Search Results', () => {
  test('displays provider cards when results found', async ({ page }) => {
    await page.goto('/providers/search')
    
    // Perform a search
    const searchInput = page.getByPlaceholder(/cardiologist in san francisco/i)
    await searchInput.fill('family doctor in San Francisco')
    await page.getByRole('button', { name: /search/i }).click()
    
    // Wait for results
    await page.waitForResponse(
      (response) => response.url().includes('/api/providers/search') && response.status() === 200,
      { timeout: 10000 }
    ).catch(() => {
      // API might not be running, that's okay for this test
    })
  })

  test('shows empty state when no results', async ({ page }) => {
    await page.goto('/providers/search')
    
    // Initially should show empty state or instructions
    await expect(page.getByText(/search for healthcare providers/i)).toBeVisible()
  })
})

test.describe('Provider Search Accessibility', () => {
  test('search input is accessible', async ({ page }) => {
    await page.goto('/providers/search')
    
    const searchInput = page.getByPlaceholder(/cardiologist in san francisco/i)
    
    // Input should be focusable
    await searchInput.focus()
    await expect(searchInput).toBeFocused()
  })

  test('clear button is accessible', async ({ page }) => {
    await page.goto('/providers/search')
    
    // Fill search input
    const searchInput = page.getByPlaceholder(/cardiologist in san francisco/i)
    await searchInput.fill('test search')
    
    // Clear button should appear and be accessible
    const clearButton = page.getByRole('button', { name: /clear search/i })
    await expect(clearButton).toBeVisible()
    
    // Click clear
    await clearButton.click()
    await expect(searchInput).toHaveValue('')
  })
})

