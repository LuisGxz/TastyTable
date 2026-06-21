import { Page, expect } from '@playwright/test';

export type DemoRole = 'Diner' | 'Restaurant';

/** Sign in via a demo-account button; suppress the auto-tour for deterministic runs. */
export async function loginAs(page: Page, role: DemoRole = 'Diner'): Promise<void> {
  await page.addInitScript(() => {
    try {
      localStorage.setItem('tt-tour-seen', '1');
      localStorage.setItem('tt-lang', 'en');
    } catch {
      /* ignore */
    }
  });
  await page.goto('/login');
  await page.getByRole('button', { name: role }).click();
  const dest = role === 'Restaurant' ? '**/tabs/restaurant' : '**/tabs/discover';
  await page.waitForURL(dest, { timeout: 20_000 });
}
