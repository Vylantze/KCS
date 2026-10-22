import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  timeout: 60000,
  use: { baseURL: 'http://127.0.0.1:4173/KCS/', headless: true },
  webServer: {
    command: 'npm run preview -- --port 4173 --strictPort --base /KCS/',
    url: 'http://127.0.0.1:4173/KCS/',
    reuseExistingServer: false,
  },
  projects: [
    { name: 'desktop', use: { viewport: { width: 1280, height: 800 } } },
    { name: 'mobile', use: { viewport: { width: 390, height: 844 } } },
  ],
});
