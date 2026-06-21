import { expect, test } from '@playwright/test';
import { loginAs } from './helpers';

test.describe('Booking flow', () => {
  test('discover → detail → pick slot → confirm → ticket', async ({ page }) => {
    await loginAs(page, 'Diner');

    await page.getByText('Casa Brasa').click();
    await page.waitForURL('**/restaurant/casa-brasa', { timeout: 15_000 });
    await expect(page.getByText('From the menu')).toBeVisible();

    // Pick tomorrow to avoid past-time, then the first available slot.
    await page.getByText('Tomorrow').click();
    const slot = page.locator('.grid.grid-cols-4 button:not([disabled])').first();
    await slot.click();

    await page.locator('button:has-text("Confirm reservation")').click();
    await expect(page.locator('tt-ticket')).toBeVisible({ timeout: 10_000 });
    await expect(page.getByText('Table confirmed!')).toBeVisible();
    await expect(page.getByText(/TT-\d{5}-PDX/)).toBeVisible();
  });

  test('a confirmed booking appears in my reservations and can be cancelled', async ({ page }) => {
    await loginAs(page, 'Diner');
    await page.locator('ion-tab-button[tab="reservations"]').click();
    await page.waitForURL('**/tabs/reservations');
    await expect(page.getByText('Casa Brasa').first()).toBeVisible({ timeout: 15_000 });

    // View ticket from history.
    await page.locator('button:has-text("View ticket")').first().click();
    await expect(page.locator('tt-ticket')).toBeVisible({ timeout: 8_000 });
    await page.locator('tt-ticket button:has-text("Close")').click();

    // Cancel → confirm dialog → keep it (non-destructive smoke).
    await page.locator('button:has-text("Cancel")').first().click();
    await expect(page.getByText('Cancel this reservation?')).toBeVisible();
    await page.locator('.alert-button:has-text("Keep it")').click();
  });
});
