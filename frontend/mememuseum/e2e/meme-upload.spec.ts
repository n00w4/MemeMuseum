import { test, expect } from '@playwright/test';

test.describe('Meme Upload Component - Error Cases', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="username-input"]', 'user_one');
    await page.fill('[data-testid="password-input"]', 'pass_user_one');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(/.*home/);

    await page.goto('/upload');
  });

  test('should show error when title is empty and submit is attempted', async ({
    page,
  }) => {
    await page.fill('#title', ' ');
    await page.fill('#title', '');

    await page.locator('#title').blur();

    const titleError = page.locator(
      '.form-group:has(#title) .error-message:has-text("Title is required")'
    );
    await expect(titleError).toBeVisible();
  });

  test('should disable submit button when form is invalid', async ({
    page,
  }) => {
    const submitButton = page.locator('button:has-text("Upload Meme")');
    await expect(submitButton).toBeDisabled();

    await page.fill('#title', 'Test Title');

    await expect(submitButton).toBeDisabled();

    await page.fill('#title', '');

    await expect(submitButton).toBeDisabled();
  });

  test('should show validation errors for all required fields', async ({
    page,
  }) => {
    await page.locator('#title').focus();
    await page.locator('#title').blur();

    const titleError = page.locator(
      '.form-group:has(#title) .error-message:has-text("Title is required")'
    );
    await expect(titleError).toBeVisible();
  });

  test('should cancel upload and navigate to home page', async ({ page }) => {
    const cancelButton = page.locator('button:has-text("Cancel")');
    await cancelButton.click();

    await expect(page).toHaveURL(/.*home/);
  });

  test('should show character counter for title field', async ({ page }) => {
    const charCounter = page.locator('.char-counter:has-text("0/100")');
    await expect(charCounter).toBeVisible();

    await page.fill('#title', 'Test Title');

    const updatedCharCounter = page.locator('.char-counter:has-text("10/100")');
    await expect(updatedCharCounter).toBeVisible();
  });

  test('should show file type restrictions', async ({ page }) => {
    const fileInput = page.locator('#imageInput');
    const acceptAttribute = await fileInput.getAttribute('accept');

    expect(acceptAttribute).toContain('image/jpeg');
    expect(acceptAttribute).toContain('image/png');
    expect(acceptAttribute).toContain('image/gif');
    expect(acceptAttribute).toContain('image/webp');
  });
});
