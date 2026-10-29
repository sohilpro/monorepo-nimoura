// playwright.config.ts
import { defineConfig, devices } from '@playwright/test'

const PORT = 3100
const swiftshader = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist']

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 60_000,
  expect: { timeout: 15_000 },
  fullyParallel: true,
  retries: process.env.CI ? 1 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: `http://127.0.0.1:${PORT}`,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  projects: [
    {
      name: 'desktop-chrome',
      use: { ...devices['Desktop Chrome'], launchOptions: { args: swiftshader } },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 7'], launchOptions: { args: swiftshader } },
    },
    // Safari-like: E2E_WEBKIT=1 pnpm test:e2e
    ...(process.env.E2E_WEBKIT ? [{ name: 'mobile-safari', use: { ...devices['iPhone 14'] } }] : []),
  ],
  webServer: {
    command: 'pnpm build && node .output/server/index.mjs',
    url: `http://127.0.0.1:${PORT}/store-3d`,
    reuseExistingServer: !process.env.CI,
    timeout: 300_000,
    env: {
      PORT: String(PORT),
      HOST: '127.0.0.1',
      NUXT_PUBLIC_SHOP3D_MODE: 'all',
      NUXT_PUBLIC_SHOP3D_PERCENT: '0',
    },
  },
})