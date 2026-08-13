import { test, expect } from '@playwright/test';

test('login redirects admin to dashboard', async ({ page }) => {
  // Mock backend so this test doesn't need the FastAPI service running.
  await page.route('**/api/auth/login', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        access_token: 'fake-jwt-token',
        token_type: 'bearer',
        user_id: 1,
        username: 'admin',
        role: 'ADMIN',
      }),
    })
  );

  await page.goto('/login');
  await expect(page.getByRole('heading', { name: 'Selamat datang' })).toBeVisible();

  await page.getByPlaceholder('Masukkan username').fill('admin');
  await page.getByPlaceholder('••••••••').fill('admin123');
  await page.locator('#login-submit-btn').click();

  await expect(page).toHaveURL('/');
});
