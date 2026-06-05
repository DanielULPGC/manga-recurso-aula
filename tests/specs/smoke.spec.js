// @ts-check
import { test, expect } from '@playwright/test';

/**
 * Smoke tests — cargar cada página principal del recurso y comprobar
 * que rinde sin errores críticos. Cualquier regresión en datos.js,
 * app.js o el HTML las hace saltar.
 */

const PAGES = [
  { path: '/',                   title: /Portada|recurso did[áa]ctico/i },
  { path: '/recurso.html',       title: /Las eras de Jap[óo]n|recurso did[áa]ctico/i },
  { path: '/manual-docente.html', title: /Manual docente/i },
  { path: '/deck-claustro.html', title: /Manga en el aula|formaci[óo]n docente/i },
];

for (const p of PAGES) {
  test.describe(`Smoke · ${p.path}`, () => {
    test('carga sin errores de consola críticos', async ({ page }) => {
      const consoleErrors = [];
      page.on('pageerror', (e) => consoleErrors.push('pageerror: ' + e.message));
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          const text = msg.text();
          // Ignorar warnings benignos
          if (text.includes('manifest.json') && text.includes('404')) return;
          if (text.includes('Failed to load resource') && text.toLowerCase().includes('favicon')) return;
          consoleErrors.push('console: ' + text);
        }
      });

      await page.goto(p.path);
      await expect(page).toHaveTitle(p.title);

      // Esperar layout estable
      await page.waitForLoadState('networkidle');

      expect(consoleErrors, 'Errores de consola: ' + consoleErrors.join('\n')).toHaveLength(0);
    });

    test('estructura semántica básica', async ({ page }) => {
      await page.goto(p.path);
      // Tiene al menos un h1
      const h1Count = await page.locator('h1').count();
      expect(h1Count, 'Debe existir al menos un <h1>').toBeGreaterThanOrEqual(1);

      // Tiene un title no vacío
      const title = await page.title();
      expect(title.length).toBeGreaterThan(10);

      // Tiene viewport meta — fix de cabecera técnica (2026-05)
      const viewport = await page.locator('meta[name="viewport"]').getAttribute('content');
      expect(viewport, 'meta[viewport] requerido en ' + p.path).toMatch(/width=device-width/);
    });
  });
}

test.describe('Recurso · invariantes del catálogo', () => {
  test('el catálogo expone exactamente 279 entradas', async ({ page }) => {
    await page.goto('/recurso.html');
    // datos.js define un array global CATALOGO
    const n = await page.evaluate(() => {
      // @ts-ignore
      return Array.isArray(window.CATALOGO) ? window.CATALOGO.length : -1;
    });
    expect(n, 'Catálogo no encontrado o cantidad cambió').toBe(279);
  });

  test('las 4 partes de la portada existen en el DOM', async ({ page }) => {
    await page.goto('/recurso.html');
    for (const id of ['parte-i', 'parte-ii', 'parte-iii', 'parte-iv']) {
      await expect(page.locator('#' + id), 'Falta divider ' + id).toBeAttached();
    }
  });

  test('las secciones clave son <section> con aria-labelledby (C-03)', async ({ page }) => {
    await page.goto('/recurso.html');
    const targets = ['catalogo', 'curriculo', 'itinerarios', 'universidad', 'situaciones', 'recursos', 'glosario'];
    for (const id of targets) {
      const el = page.locator('#' + id);
      const tag = await el.evaluate((n) => n.tagName.toLowerCase());
      expect(tag, id + ' debe ser <section>').toBe('section');
      const lbl = await el.getAttribute('aria-labelledby');
      expect(lbl, id + ' debe tener aria-labelledby').toBe(id + '-heading');
    }
  });

  test('no hay enlaces #anchor rotos', async ({ page }) => {
    await page.goto('/recurso.html');
    const broken = await page.evaluate(() => {
      const ids = new Set([...document.querySelectorAll('[id]')].map(e => e.id));
      const hashes = [...document.querySelectorAll('a[href^="#"]')]
        .map(a => a.getAttribute('href').slice(1))
        .filter(Boolean);
      return [...new Set(hashes.filter(h => !ids.has(h)))];
    });
    expect(broken, 'Anchors rotos: ' + broken.join(', ')).toHaveLength(0);
  });
});

test.describe('Portada · cinemática', () => {
  test('renderiza la app React (no se queda en blanco)', async ({ page }) => {
    await page.goto('/');
    // El componente App vive bajo #root
    await page.waitForSelector('#root > *', { timeout: 5000 });
    const rootChildren = await page.locator('#root > *').count();
    expect(rootChildren).toBeGreaterThan(0);
  });

  test('los 4 caminos enlazan a recurso.html#parte-i .. iv', async ({ page }) => {
    await page.goto('/');
    await page.waitForSelector('#root > *');
    const hrefs = await page.locator('a[href*="recurso.html#parte"]').evaluateAll(
      (as) => as.map(a => a.getAttribute('href'))
    );
    expect(hrefs).toEqual(expect.arrayContaining([
      'recurso.html#parte-i',
      'recurso.html#parte-ii',
      'recurso.html#parte-iii',
      'recurso.html#parte-iv',
    ]));
  });
});

test.describe('Deck claustro', () => {
  test('tiene 8 slides', async ({ page }) => {
    await page.goto('/deck-claustro.html');
    const n = await page.locator('deck-stage > section').count();
    expect(n).toBe(8);
  });
});
