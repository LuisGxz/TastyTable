import { defineConfig, devices } from '@playwright/test';

/**
 * E2E config. The Angular dev server is started automatically. The NestJS API (http://localhost:3013)
 * must be running separately (it needs MongoDB), e.g.
 *   docker compose up -d mongo
 *   cd ../backend && npm run start:dev
 */
export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  workers: 1,
  retries: process.env['CI'] ? 1 : 0,
  reporter: process.env['CI'] ? 'line' : 'list',
  timeout: 45_000,
  use: {
    baseURL: 'http://localhost:8113',
    locale: 'en-US',
    trace: 'on-first-retry',
    ...devices['iPhone 13'],
  },
  projects: [{ name: 'mobile-chrome', use: { ...devices['Pixel 7'] } }],
  webServer: {
    command: 'npm start -- --port 8113',
    url: 'http://localhost:8113',
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
