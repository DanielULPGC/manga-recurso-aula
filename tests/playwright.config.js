// @ts-check
import { defineConfig, devices } from '@playwright/test';

/**
 * Configuración de tests de regresión.
 * Arranca un servidor estático en ../site sobre el puerto 4173 antes de
 * correr las suites. Para correr contra deploy real, exportar BASE_URL.
 */
export default defineConfig({
  testDir: './specs',
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: 'report' }],
  ],

  use: {
    baseURL: process.env.BASE_URL || 'http://127.0.0.1:4173',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    locale: 'es-ES',
    timezoneId: 'Atlantic/Canary',
  },

  projects: [
    {
      name: 'chromium-desktop',
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
      },
    },
    {
      name: 'chromium-mobile',
      use: {
        ...devices['Pixel 5'],
      },
    },
  ],

  // Si no se está corriendo contra deploy externo, levantar servidor local.
  webServer: process.env.BASE_URL ? undefined : {
    command: 'node serve.mjs',
    port: 4173,
    reuseExistingServer: !process.env.CI,
    timeout: 15_000,
  },
});
