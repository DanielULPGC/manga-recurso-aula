// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Tests para el feature "Estado del catálogo en la URL" (idea 2).
 * Cubre:
 *   - Aplicar filtros desde query params al cargar
 *   - Reflejar cambios de filtro en la URL
 *   - Persistir búsqueda en la URL (debounced)
 *   - Restaurar estado al navegar atrás/adelante
 */

const RECURSO = '/recurso.html';

async function waitForApp(page) {
  await page.waitForFunction(() => typeof window.filterUso === 'function');
  await page.waitForFunction(() => typeof window.__urlState === 'object');
}

test.describe('URL state · lectura inicial', () => {
  test('aplica ?uso=historia al cargar', async ({ page }) => {
    await page.goto(RECURSO + '?uso=historia');
    await waitForApp(page);
    // Botón uso=historia debe quedar activo
    const isActive = await page.locator('[data-uso="historia"]').first().evaluate(
      (el) => el.classList.contains('active')
    );
    expect(isActive).toBe(true);
  });

  test('aplica ?nivel=primaria al cargar', async ({ page }) => {
    await page.goto(RECURSO + '?nivel=primaria');
    await waitForApp(page);
    const isActive = await page.locator('[data-nivel="primaria"]').first().evaluate(
      (el) => el.classList.contains('active')
    );
    expect(isActive).toBe(true);
  });

  test('aplica ?ods=4 al cargar', async ({ page }) => {
    await page.goto(RECURSO + '?ods=4');
    await waitForApp(page);
    const isActive = await page.locator('[data-ods="4"]').first().evaluate(
      (el) => el.classList.contains('active')
    );
    expect(isActive).toBe(true);
  });

  test('aplica ?q=tezuka al cargar (puebla el input)', async ({ page }) => {
    await page.goto(RECURSO + '?q=tezuka');
    await waitForApp(page);
    const input = page.locator('#catalogSearch');
    await expect(input).toHaveValue('tezuka');
  });

  test('combina varios filtros: uso + nivel + ods + q', async ({ page }) => {
    await page.goto(RECURSO + '?uso=historia&nivel=primaria&ods=4&q=tezuka');
    await waitForApp(page);
    await expect(page.locator('[data-uso="historia"]').first()).toHaveClass(/active/);
    await expect(page.locator('[data-nivel="primaria"]').first()).toHaveClass(/active/);
    await expect(page.locator('[data-ods="4"]').first()).toHaveClass(/active/);
    await expect(page.locator('#catalogSearch')).toHaveValue('tezuka');
  });
});

test.describe('URL state · escritura desde UI', () => {
  test('al pulsar un filtro de uso se refleja en la URL', async ({ page }) => {
    await page.goto(RECURSO);
    await waitForApp(page);
    await page.evaluate(() => window.filterUso('historia'));
    await page.waitForTimeout(50);
    const url = new URL(page.url());
    expect(url.searchParams.get('uso')).toBe('historia');
  });

  test('volver a "all" elimina el param de la URL', async ({ page }) => {
    await page.goto(RECURSO + '?uso=historia');
    await waitForApp(page);
    await page.evaluate(() => window.filterUso('all'));
    await page.waitForTimeout(50);
    const url = new URL(page.url());
    expect(url.searchParams.has('uso')).toBe(false);
  });

  test('escribir en el buscador escribe q en la URL (debounced)', async ({ page }) => {
    await page.goto(RECURSO);
    await waitForApp(page);
    await page.locator('#catalogSearch').fill('urasawa');
    // El hook tiene debounce de 200ms
    await page.waitForTimeout(350);
    const url = new URL(page.url());
    expect(url.searchParams.get('q')).toBe('urasawa');
  });

  test('vaciar el buscador elimina q de la URL', async ({ page }) => {
    await page.goto(RECURSO + '?q=urasawa');
    await waitForApp(page);
    await page.locator('#catalogSearch').fill('');
    await page.waitForTimeout(350);
    const url = new URL(page.url());
    expect(url.searchParams.has('q')).toBe(false);
  });
});

test.describe('URL state · navegación del navegador', () => {
  test('back/forward restaura el estado anterior', async ({ page }) => {
    await page.goto(RECURSO);
    await waitForApp(page);

    // Estado 1: uso=historia
    await page.evaluate(() => window.filterUso('historia'));
    await page.waitForTimeout(50);

    // Forzamos un pushState explícito vía la API pública para crear historial
    await page.evaluate(() => {
      const u = new URL(window.location.href);
      u.searchParams.set('uso', 'filosofia');
      history.pushState(null, '', u.toString());
      window.__urlState.apply();
    });
    await page.waitForTimeout(100);
    await expect(page.locator('[data-uso="filosofia"]').first()).toHaveClass(/active/);

    // Back
    await page.goBack();
    await page.waitForTimeout(150);
    await expect(page.locator('[data-uso="historia"]').first()).toHaveClass(/active/);
  });
});

test.describe('URL state · API pública', () => {
  test('window.__urlState.read() devuelve params actuales', async ({ page }) => {
    await page.goto(RECURSO + '?uso=historia&q=tezuka');
    await waitForApp(page);
    const s = await page.evaluate(() => window.__urlState.read());
    expect(s).toEqual({ uso: 'historia', q: 'tezuka' });
  });

  test('window.__urlState.write() patch parcial', async ({ page }) => {
    await page.goto(RECURSO + '?uso=historia');
    await waitForApp(page);
    await page.evaluate(() => window.__urlState.write({ ods: '4' }));
    const url = new URL(page.url());
    expect(url.searchParams.get('uso')).toBe('historia');
    expect(url.searchParams.get('ods')).toBe('4');
  });

  test('window.__urlState.write({k:"all"}) borra el param', async ({ page }) => {
    await page.goto(RECURSO + '?uso=historia&ods=4');
    await waitForApp(page);
    await page.evaluate(() => window.__urlState.write({ uso: 'all' }));
    const url = new URL(page.url());
    expect(url.searchParams.has('uso')).toBe(false);
    expect(url.searchParams.get('ods')).toBe('4');
  });
});
