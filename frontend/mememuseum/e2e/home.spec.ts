import { test, expect } from '@playwright/test';

test.describe('Home Component - Guest User', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
  });

  test('should search by tag and verify pagination', async ({ page }) => {
    await page.fill('input[formcontrolname="tags"]', 'funny');

    await page.click('button.search-btn');

    await page.waitForTimeout(2000);

    const memeGrid = page.locator('div.meme-grid');
    await expect(memeGrid).toBeVisible();

    const memeCards = await page.locator('app-meme-card').count();
    expect(memeCards).toBeLessThanOrEqual(10);
  });

  test('should display Meme Of The Day link in footer and navigate to page', async ({
    page,
  }) => {
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));

    const footer = page.locator('footer.app-footer');
    await expect(footer).toBeVisible();

    const memeOfTheDayLink = footer.locator('a:has-text("Meme Of The Day")');
    await expect(memeOfTheDayLink).toBeVisible();

    await memeOfTheDayLink.click();

    await expect(page).toHaveURL(/.*meme-of-the-day/);

    const pageHeader = page.locator(
      '.page-header h1:has-text("Meme Of The Day")'
    );
    await expect(pageHeader).toBeVisible();
  });

  test('should show login required for commenting', async ({ page }) => {
    await page.waitForTimeout(2000);

    const firstMemeCard = page.locator('app-meme-card').first();
    await expect(firstMemeCard).toBeVisible();

    const upvoteButton = firstMemeCard.locator('button.upvote');
    const downvoteButton = firstMemeCard.locator('button.downvote');
    const commentButton = firstMemeCard.locator('button.comment');

    await expect(upvoteButton).not.toBeVisible();
    await expect(downvoteButton).not.toBeVisible();
    await expect(commentButton).not.toBeVisible();
  });

  test('should navigate to login when clicking login button', async ({
    page,
  }) => {
    const loginButton = page.locator('a.auth-btn:has-text("Login")');
    await expect(loginButton).toBeVisible();

    await loginButton.click();

    await expect(page).toHaveURL(/.*login/);
  });

  test('should navigate to register when clicking register button', async ({
    page,
  }) => {
    const registerButton = page.locator(
      'a.auth-btn.accent:has-text("Register")'
    );
    await expect(registerButton).toBeVisible();

    await registerButton.click();

    await expect(page).toHaveURL(/.*register/);
  });

  test('should show advanced filters when clicking toggle button', async ({
    page,
  }) => {
    const toggleFiltersButton = page.locator('button.toggle-filters-btn');
    await expect(toggleFiltersButton).toBeVisible();

    const filtersSection = page.locator('section.filters-section');
    await expect(filtersSection).not.toBeVisible();

    await toggleFiltersButton.click();

    await expect(filtersSection).toBeVisible();

    await expect(page.locator('input#dateRangeStart')).toBeVisible();
    await expect(page.locator('input#dateRangeEnd')).toBeVisible();
    await expect(page.locator('select#sortBy')).toBeVisible();
  });

  test('should apply advanced filters', async ({ page }) => {
    await page.click('button.toggle-filters-btn');

    await page.fill('input#dateRangeStart', '2023-01-01');
    await page.fill('input#dateRangeEnd', '2023-12-31');

    await page.selectOption('select#sortBy', 'dateDesc');

    await page.click('button.apply-btn');

    await page.waitForTimeout(2000);

    const memeGrid = page.locator('div.meme-grid');
    await expect(memeGrid).toBeVisible();
  });

  test('should reset advanced filters', async ({ page }) => {
    await page.click('button.toggle-filters-btn');

    await page.fill('input#dateRangeStart', '2023-01-01');
    await page.fill('input#dateRangeEnd', '2023-12-31');
    await page.selectOption('select#sortBy', 'dateAsc');

    await page.click('button.reset-btn');

    await expect(page.locator('input#dateRangeStart')).toHaveValue('');
    await expect(page.locator('input#dateRangeEnd')).toHaveValue('');
    await expect(page.locator('select#sortBy')).toHaveValue('ratingDesc');
  });

  test('should navigate to upload page when logged in (but this should redirect to login for guest)', async ({
    page,
  }) => {
    const uploadButton = page.locator('a.upload-btn');
    await expect(uploadButton).not.toBeVisible();
  });

  test('should navigate to profile page when logged in (but this should redirect to login for guest)', async ({
    page,
  }) => {
    const userAvatar = page.locator('a.user-avatar');
    await expect(userAvatar).not.toBeVisible();
  });
});

test.describe('Home Component - Logged In User', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('[data-testid="username-input"]', 'user_one');
    await page.fill('[data-testid="password-input"]', 'pass_user_one');
    await page.click('[data-testid="login-button"]');
    await page.waitForURL(/.*home/);

    await page.goto('/');
  });

  test('should add comment to a meme', async ({ page }) => {
    await page.waitForTimeout(2000);

    const firstMemeCard = page.locator('app-meme-card').first();
    await expect(firstMemeCard).toBeVisible();

    const commentButton = firstMemeCard.locator('button.comment');
    await commentButton.click();

    const commentForm = firstMemeCard.locator('form.new-comment-form');
    await expect(commentForm).toBeVisible();

    const commentInput = commentForm.locator('textarea[name="newComment"]');
    await commentInput.fill('Test comment from Playwright');

    const submitButton = commentForm.locator('button.submit-comment-btn');
    await submitButton.click();

    await page.waitForTimeout(2000);

    const successToast = page.locator(
      '.toast--success:has-text("Comment posted successfully.")'
    );
    await expect(successToast).toBeVisible({ timeout: 10000 });
  });

  test('should interact with vote buttons on a meme', async ({ page }) => {
    await page.waitForTimeout(2000);

    const firstMemeCard = page.locator('app-meme-card').first();
    await expect(firstMemeCard).toBeVisible();

    const upvoteButton = firstMemeCard.locator('button.upvote');
    const downvoteButton = firstMemeCard.locator('button.downvote');

    await expect(upvoteButton).toBeVisible();
    await expect(downvoteButton).toBeVisible();

    await upvoteButton.click();

    await expect(page.locator('.toast--success')).toBeVisible({
      timeout: 10000,
    });

    await page.waitForTimeout(1000);

    const toastCloseButtons = page.locator('button.toast__close-btn');
    const count = await toastCloseButtons.count();
    for (let i = 0; i < count; i++) {
      const closeButton = toastCloseButtons.nth(0);
      if (await closeButton.isVisible()) {
        await closeButton.click();
        await page.waitForTimeout(100);
      }
    }

    await page.waitForTimeout(1000);

    await downvoteButton.click();

    await expect(page.locator('.toast--success')).toBeVisible({
      timeout: 10000,
    });
  });

  test('should navigate to upload page', async ({ page }) => {
    const uploadButton = page.locator('a.upload-btn');
    await expect(uploadButton).toBeVisible();

    await uploadButton.click();

    await expect(page).toHaveURL(/.*upload/);
  });

  test('should navigate to profile page', async ({ page }) => {
    const userAvatar = page.locator('a.user-avatar');
    await expect(userAvatar).toBeVisible();

    await userAvatar.click();

    await expect(page).toHaveURL(/.*profile/);
  });

  test('should navigate to profile page and verify logout button', async ({
    page,
  }) => {
    const userAvatar = page.locator('a.user-avatar');
    await expect(userAvatar).toBeVisible();

    await userAvatar.click();

    await expect(page).toHaveURL(/.*profile/);

    const profileHeader = page.locator('h2:has-text("Profile")');
    await expect(profileHeader).toBeVisible();

    const userInfoSection = page.locator('.user-info-section');
    await expect(userInfoSection).toBeVisible();

    const logoutButton = page.locator(
      'button.logout-button:has-text("Logout")'
    );
    await expect(logoutButton).toBeVisible();

    await expect(logoutButton).not.toBeDisabled();
  });
});
