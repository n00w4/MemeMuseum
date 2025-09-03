import { test, expect } from '@playwright/test';

test.describe('Login Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
  });

  test('should login successfully with valid credentials', async ({ page }) => {
    await page.fill('[data-testid="username-input"]', 'user_one');
    await page.fill('[data-testid="password-input"]', 'pass_user_one');
    await page.click('[data-testid="login-button"]');

    await page.waitForURL(/.*home/);
    await expect(page).toHaveURL(/.*home/);
  });

  test('should show error message with invalid credentials', async ({
    page,
  }) => {
    await page.fill('[data-testid="username-input"]', 'wrong_user');
    await page.fill('[data-testid="password-input"]', 'wrong_pass');
    await page.click('[data-testid="login-button"]');

    await page.waitForTimeout(1000);
    await expect(page.locator('.error')).toBeVisible();
  });

  test('should show validation errors for empty fields', async ({ page }) => {
    await page.locator('input[formcontrolname="username"]').focus();
    await page.locator('input[formcontrolname="password"]').focus();
    await page.locator('h2').click();

    await expect(
      page.locator('input[formcontrolname="username"] ~ .error')
    ).toBeVisible({ timeout: 5000 });
    await expect(
      page.locator('input[formcontrolname="password"] ~ .error')
    ).toBeVisible({ timeout: 5000 });
  });
});
