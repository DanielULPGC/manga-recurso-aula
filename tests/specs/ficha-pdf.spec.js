// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Tests para el feature "Ficha PDF por título" (idea 4).
 * Verifica que:
 *   - El botón ↓ Ficha PDF se inyecta en cada tarjeta del catálogo.
 *   - Al pulsarlo se prepara el template oculto con los datos del
 *     título (sin disparar realmente el diálogo de impresión).
 *   - El template contiene los campos esperados (título, autor,
 *     descripción, badges, niveles, ODS, OPAC, sugerencias, fecha).
 *   - La API pública window.printFichaPDF está expuesta.
 */

const RECURSO = '/recurso.html';

async function waitForCatalog(page) {
  // El catálogo se renderiza vía renderCatalog(); esperamos a que
  // aparezcan tarjetas Y a que el observer haya inyectado los botones.
  await page.waitForFunction(() => {
    const cards = document.querySelectorAll('.cat-card');
    if (cards.length < 100) return false;
    return Array.from(cards).every(c => c.querySelector('.cat-pdf-btn'));
  }, { timeout: 10_000 });
}

test.describe('Ficha PDF · inyección de botón', () => {
  test('cada tarjeta del catálogo tiene su botón ↓ Ficha PDF', async ({ page }) => {
    await page.goto(RECURSO);
    await waitForCatalog(page);
    const cards = await page.locator('.cat-card').count();
    const buttons = await page.locator('.cat-card .cat-pdf-btn').count();
    expect(cards).toBe(279);
    expect(buttons).toBe(279);
  });

  test('el template #fichaPDFTemplate existe pero está oculto', async ({ page }) => {
    await page.goto(RECURSO);
    await waitForCatalog(page);
    const tpl = page.locator('#fichaPDFTemplate');
    await expect(tpl).toBeAttached();
    // Comprueba que NO es visible (hidden + display:none por CSS)
    const visible = await tpl.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return cs.display !== 'none' && !el.hidden;
    });
    expect(visible).toBe(false);
  });
});

test.describe('Ficha PDF · API pública y populate', () => {
  // Evitamos que el diálogo real se abra durante los tests
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      // Mockear window.print para que no abra diálogo en headless
      // @ts-ignore
      window.__printCalls = 0;
      const origPrint = window.print;
      window.print = function () {
        // @ts-ignore
        window.__printCalls++;
        // No llamar al original — diálogo nativo bloquea Playwright
      };
    });
  });

  test('window.printFichaPDF(titulo) puebla el template y llama a print', async ({ page }) => {
    await page.goto(RECURSO);
    await waitForCatalog(page);

    await page.evaluate(() => {
      // @ts-ignore
      window.printFichaPDF('Vagabond');
    });
    // Esperar al setTimeout(50) del módulo
    await page.waitForTimeout(150);

    // El body debe haberse marcado como printing (aunque restore puede haber
    // ocurrido si afterprint dispara; aquí print está mockeado, sin afterprint)
    const printCalls = await page.evaluate(() => /** @type any */ (window).__printCalls);
    expect(printCalls).toBeGreaterThanOrEqual(1);

    // Verificar que el template está poblado con el título
    const title = await page.locator('#fichaPDFTemplate .fpdf-title').textContent();
    expect(title).toBe('Vagabond');

    const author = await page.locator('#fichaPDFTemplate .fpdf-author').textContent();
    expect(author).toContain('Takehiko Inoue');

    const desc = await page.locator('#fichaPDFTemplate .fpdf-desc').textContent();
    expect(desc?.length).toBeGreaterThan(50);
  });

  test('template incluye badges, niveles y ODS del título', async ({ page }) => {
    await page.goto(RECURSO);
    await waitForCatalog(page);

    await page.evaluate(() => {
      // @ts-ignore
      window.printFichaPDF('Pluto');
    });
    await page.waitForTimeout(150);

    const badges = await page.locator('#fichaPDFTemplate .fpdf-badge').count();
    expect(badges).toBeGreaterThan(0);

    const niveles = await page.locator('#fichaPDFTemplate .fpdf-niv').count();
    expect(niveles).toBeGreaterThan(0);

    const ods = await page.locator('#fichaPDFTemplate .fpdf-ods').count();
    expect(ods).toBeGreaterThan(0); // Pluto tiene ODS 9, 16
  });

  test('template incluye enlace OPAC cuando el título lo tiene', async ({ page }) => {
    await page.goto(RECURSO);
    await waitForCatalog(page);

    await page.evaluate(() => {
      // @ts-ignore
      window.printFichaPDF('Pluto');
    });
    await page.waitForTimeout(150);

    const opacHref = await page.locator('#fichaPDFTemplate .fpdf-opac').getAttribute('href');
    expect(opacHref).toMatch(/opac\.ulpgc\.es/);
  });

  test('al pulsar el botón de una tarjeta se puebla con su título', async ({ page }) => {
    await page.goto(RECURSO);
    await waitForCatalog(page);

    // Click el botón PDF de la primera tarjeta visible
    const firstCard = page.locator('.cat-card').first();
    const titulo = await firstCard.locator('.cat-title').textContent();
    expect(titulo?.length).toBeGreaterThan(0);

    await firstCard.locator('.cat-pdf-btn').click();
    await page.waitForTimeout(150);

    const populated = await page.locator('#fichaPDFTemplate .fpdf-title').textContent();
    expect(populated).toBe(titulo);
  });

  test('genera 3 sugerencias de aula adaptadas al uso pedagógico', async ({ page }) => {
    await page.goto(RECURSO);
    await waitForCatalog(page);

    await page.evaluate(() => {
      // @ts-ignore
      window.printFichaPDF('Pluto');
    });
    await page.waitForTimeout(150);

    const suggestions = await page.locator('#fichaPDFTemplate .fpdf-suggest-list li').count();
    expect(suggestions).toBe(3);
  });
});
