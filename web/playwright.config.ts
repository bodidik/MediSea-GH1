import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',

  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,

  reporter: [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL: process.env.PW_BASE_URL || 'http://localhost:3000',
    trace: 'on-first-retry',
    actionTimeout: 15000,
    navigationTimeout: 30000,
    video: 'retain-on-failure',
    screenshot: 'only-on-failure',
    headless: true,
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox',  use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit',   use: { ...devices['Desktop Safari'] } },
  ],

  webServer: process.env.PW_START_SERVER
    ? {
        command: 'npm run dev',
        url: 'http://localhost:3000',
        timeout: 120000,
        reuseExistingServer: !process.env.CI,
      }
    : undefined,
});
