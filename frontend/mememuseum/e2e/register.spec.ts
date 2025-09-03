import { test, expect } from '@playwright/test';

test.describe('Register Component', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/register');
  });

  test('should register successfully with valid data', async ({ page }) => {
    await page.fill('input[formcontrolname="username"]', 'test_user');
    await page.fill('input[formcontrolname="email"]', 'test@example.com');
    await page.fill('input[formcontrolname="password"]', 'password123');
    await page.fill('input[formcontrolname="confirmPassword"]', 'password123');

    await page.click('button[type="submit"]');

    await page.waitForTimeout(2500);
    await expect(page).toHaveURL(/.*login/);
  });

  test('should show validation errors for empty fields', async ({ page }) => {
    await page.locator('input[formcontrolname="username"]').focus();
    await page.locator('input[formcontrolname="email"]').focus();
    await page.locator('input[formcontrolname="password"]').focus();
    await page.locator('input[formcontrolname="confirmPassword"]').focus();
    
    await page.locator('h3').click();
    
    await page.waitForTimeout(1000);
    
    await expect(page.locator('input[formcontrolname="username"] ~ .error')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('input[formcontrolname="email"] ~ .error')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('input[formcontrolname="password"] ~ .error')).toBeVisible({ timeout: 5000 });
    
    const passwordError = await page.locator('input[formcontrolname="password"] ~ .error').isVisible();
    expect(passwordError).toBeTruthy();
  });

  test('should show validation error for invalid email', async ({ page }) => {
    await page.fill('input[formcontrolname="username"]', 'testuser');
    await page.fill('input[formcontrolname="email"]', 'invalid-email');
    await page.fill('input[formcontrolname="password"]', 'password123');
    await page.fill('input[formcontrolname="confirmPassword"]', 'password123');
    
    await page.locator('input[formcontrolname="email"]').blur();
    
    await expect(page.locator('input[formcontrolname="email"] ~ .error')).toContainText('Invalid email format');
  });

  test('should show validation error for password mismatch', async ({ page }) => {
    await page.fill('input[formcontrolname="username"]', 'testuser');
    await page.fill('input[formcontrolname="email"]', 'test@example.com');
    await page.fill('input[formcontrolname="password"]', 'password123');
    await page.fill('input[formcontrolname="confirmPassword"]', 'differentpassword');
    
    await page.locator('input[formcontrolname="confirmPassword"]').blur();
    
    const confirmPasswordError = page.locator('input[formcontrolname="confirmPassword"] ~ .error');
    const passwordError = page.locator('input[formcontrolname="password"] ~ .error');
    
    const hasConfirmPasswordError = await confirmPasswordError.isVisible();
    const hasPasswordError = await passwordError.isVisible();
    
    expect(hasConfirmPasswordError || hasPasswordError).toBeTruthy();
    
    if (hasConfirmPasswordError) {
      await expect(confirmPasswordError).toContainText('Passwords do not match');
    }
  });

  test('should show validation error for username too short', async ({ page }) => {
    await page.fill('input[formcontrolname="username"]', 'ab');
    await page.fill('input[formcontrolname="email"]', 'test@example.com');
    await page.fill('input[formcontrolname="password"]', 'password123');
    await page.fill('input[formcontrolname="confirmPassword"]', 'password123');
    
    await page.locator('input[formcontrolname="username"]').blur();
    
    await expect(page.locator('input[formcontrolname="username"] ~ .error')).toContainText('Username must be at least 3 characters');
  });

  test('should show validation error for password too short', async ({ page }) => {
    await page.fill('input[formcontrolname="username"]', 'testuser');
    await page.fill('input[formcontrolname="email"]', 'test@example.com');
    await page.fill('input[formcontrolname="password"]', 'short');
    await page.fill('input[formcontrolname="confirmPassword"]', 'short');
    
    await page.locator('input[formcontrolname="password"]').blur();
    
    await expect(page.locator('input[formcontrolname="password"] ~ .error')).toContainText('Password must be at least 8 characters');
  });

  test('should navigate to login page when clicking sign in link', async ({ page }) => {
    await page.click('a.link');
    await expect(page).toHaveURL(/.*login/);
  });

  test('should remain on register page after registration attempt', async ({ page }) => {
    await page.fill('input[formcontrolname="username"]', 'test_user');
    await page.fill('input[formcontrolname="email"]', 'test@example.com');
    await page.fill('input[formcontrolname="password"]', 'password123');
    await page.fill('input[formcontrolname="confirmPassword"]', 'password123');
    
    await page.click('button[type="submit"]');
    
    await page.waitForTimeout(3000);
    const currentUrl = await page.url();
    const isOnRegisterPage = currentUrl.includes('register');
    
    expect(isOnRegisterPage).toBeTruthy();
  });
});