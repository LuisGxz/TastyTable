import { expect, test } from '@playwright/test';
import { loginAs } from './helpers';

test.describe('Owner panel', () => {
  test('owner sees tables and incoming bookings', async ({ page }) => {
    await loginAs(page, 'Restaurant');
    await expect(page.getByText('Casa Brasa')).toBeVisible();
    await expect(page.getByText('seats').first()).toBeVisible({ timeout: 15_000 });

    await page.locator('ion-segment-button[value="bookings"]').click();
    // The "Add table" affordance only exists on the Tables tab — its absence confirms the switch.
    await expect(page.getByText('Add table')).toHaveCount(0);
  });

  test('owner can open the add-table form', async ({ page }) => {
    await loginAs(page, 'Restaurant');
    await page.locator('[data-tour="owner-add"]').click();
    await expect(page.getByText('Label')).toBeVisible();
    await expect(page.getByText('Capacity')).toBeVisible();
  });
});

test.describe('Guided demo', () => {
  test('help sheet opens, shows the role, and starts the tour', async ({ page }) => {
    await loginAs(page, 'Diner');
    await page.locator('[data-tour="help"]').click();
    await expect(page.getByText('How to explore')).toBeVisible();
    await expect(page.getByText(/exploring as a Diner/i)).toBeVisible();

    await page.getByRole('button', { name: 'Take the quick tour' }).click();
    await expect(page.getByText('Welcome to TastyTable')).toBeVisible();
    await page.getByRole('button', { name: 'Next' }).click();
    await expect(page.getByText('Find your spot')).toBeVisible();
    await page.getByRole('button', { name: 'Skip' }).click();
    await expect(page.getByText('Find your spot')).toHaveCount(0);
  });

  test('about page is reachable from the account tab', async ({ page }) => {
    await loginAs(page, 'Diner');
    await page.locator('ion-tab-button[tab="account"]').click();
    await page.getByText('About this app').click();
    await page.waitForURL('**/about');
    await expect(page.getByText(/installable PWA|NestJS/i).first()).toBeVisible();
  });
});
