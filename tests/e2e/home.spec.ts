import { test, expect } from '@playwright/test';

test.describe('Home Page', () => {
  test('should display the home page', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveTitle(/Webapp Template/);
  });

  test('should have API health link', async ({ page }) => {
    await page.goto('/');
    const healthLink = page.getByRole('link', { name: /API Health/i });
    await expect(healthLink).toBeVisible();
  });
});
