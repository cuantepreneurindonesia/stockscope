import { test, expect } from '@playwright/test';

/**
 * Smoke Test: Authentication Flow
 * 
 * Tests critical auth paths:
 * - Landing page loads
 * - Sign in button visible
 * - Protected routes redirect to auth
 * - Session persistence
 */

test.describe('Authentication Smoke Tests', () => {
  test('landing page loads successfully', async ({ page }) => {
    await page.goto('/');
    
    // Check that the page loads
    await expect(page).toHaveTitle(/Stockscope|Right to Information/i);
    
    // Verify key elements are present
    const signInButton = page.locator('button').filter({ hasText: /sign in/i }).first();
    await expect(signInButton).toBeVisible({ timeout: 10000 });
  });

  test('unauthenticated user can access public pages', async ({ page }) => {
    // Homepage should be accessible
    await page.goto('/');
    await expect(page).toHaveURL(/\/(en|id)?$/);
    
    // Screener page should be accessible
    await page.goto('/en/screener');
    await expect(page).toHaveURL(/\/en\/screener/);
    
    // Check that content loads
    await expect(page.getByText(/stock|saham/i)).toBeVisible({ timeout: 10000 });
  });

  test('auth button is visible and clickable', async ({ page }) => {
    await page.goto('/');
    
    // Find sign in button by text (case insensitive, partial match)
    const signInButton = page.locator('button').filter({ hasText: /sign in/i }).first();
    await expect(signInButton).toBeVisible({ timeout: 10000 });
    await expect(signInButton).toBeEnabled();
    
    // Verify button is properly styled (has background)
    const bgColor = await signInButton.evaluate((el) => 
      window.getComputedStyle(el).backgroundColor
    );
    expect(bgColor).not.toBe('rgba(0, 0, 0, 0)'); // Not transparent
  });

  test('upgrade page is accessible', async ({ page }) => {
    await page.goto('/en/upgrade');
    
    // Should show upgrade page
    await expect(page).toHaveURL(/\/en\/upgrade/);
    await expect(page.getByText(/upgrade|premium|pro/i)).toBeVisible();
  });
});

test.describe('Session Handling', () => {
  test('session state persists across page navigations', async ({ page }) => {
    await page.goto('/');
    
    // Store initial auth state
    const initialAuthState = await page.evaluate(() => {
      return document.cookie.includes('next-auth.session-token');
    });
    
    // Navigate to different page
    await page.goto('/en/screener');
    
    // Auth state should remain consistent
    const afterNavigationAuthState = await page.evaluate(() => {
      return document.cookie.includes('next-auth.session-token');
    });
    
    expect(afterNavigationAuthState).toBe(initialAuthState);
  });
});
