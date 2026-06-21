import { expect, test } from '@playwright/test';
import { loginAs } from './helpers';

test.describe('Auth', () => {
  test('diner signs in and sees the discovery list', async ({ page }) => {
    await loginAs(page, 'Diner');
    await expect(page.getByText('Portland, OR')).toBeVisible();
    await expect(page.getByText('Casa Brasa')).toBeVisible({ timeout: 15_000 });
  });

  test('restaurant signs in and lands on the owner panel', async ({ page }) => {
    await loginAs(page, 'Restaurant');
    await expect(page.getByText('Add table')).toBeVisible({ timeout: 15_000 });
  });

  test('invalid credentials are rejected', async ({ page }) => {
    await page.addInitScript(() => localStorage.setItem('tt-tour-seen', '1'));
    await page.goto('/login');
    await page.getByPlaceholder('Email').fill('diner@tastytable.app');
    await page.getByPlaceholder('Password').fill('wrong-password');
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page.getByText('Invalid email or password.')).toBeVisible();
  });
});
