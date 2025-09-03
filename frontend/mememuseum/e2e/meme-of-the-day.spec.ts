import { test, expect } from '@playwright/test';

test.describe('Meme Of The Day Component', () => {
  test('should display meme of the day for guest user', async ({ page }) => {
    await page.goto('/meme-of-the-day');

    const pageHeader = page.locator(
      '.page-header h1:has-text("Meme Of The Day")'
    );
    await expect(pageHeader).toBeVisible();

    await page.waitForTimeout(3000);

    const memeCard = page.locator('app-meme-card');
    await expect(memeCard).toBeVisible();

    const memeImage = memeCard.locator('.meme-image img');
    await expect(memeImage).toBeVisible();

    const memeTitle = memeCard.locator('.meme-title');
    await expect(memeTitle).toBeVisible();

    const upvoteButton = memeCard.locator('button.upvote');
    const downvoteButton = memeCard.locator('button.downvote');
    const commentButton = memeCard.locator('button.comment');

    await expect(upvoteButton).not.toBeVisible();
    await expect(downvoteButton).not.toBeVisible();
    await expect(commentButton).not.toBeVisible();
  });

  test('should handle loading state', async ({ page }) => {
    await page.goto('/meme-of-the-day');

    const loadingSpinner = page.locator('.spinner');

    await page.waitForTimeout(3000);

    await expect(loadingSpinner).not.toBeVisible();
  });

  test('should handle error state', async ({ page }) => {
    await page.goto('/meme-of-the-day');

    await page.waitForTimeout(3000);

    const retryButton = page.locator('button.retry-btn');
    if (await retryButton.isVisible()) {
      await retryButton.click();

      const loadingSpinner = page.locator('.spinner');
      await expect(loadingSpinner).toBeVisible();
    }
  });
});
