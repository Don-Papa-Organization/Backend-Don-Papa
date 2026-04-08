import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e/tests',
  fullyParallel: false,
  retries: 1,
  timeout: 45_000,
  expect: {
    timeout: 10_000
  },
  use: {
    baseURL: 'http://localhost:4200',
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
    video: 'retain-on-failure'
  },
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  projects: [
    {
      name: 'mobile',
      use: {
        ...devices['Pixel 5']
      }
    },
    {
      name: 'tablet',
      use: {
        viewport: { width: 768, height: 1024 },
        userAgent:
          'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.0 Mobile/15E148 Safari/604.1'
      }
    },
    {
      name: 'desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1366, height: 768 }
      }
    }
  ]
});
