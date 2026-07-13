#!/usr/bin/env node
import { basename, join } from 'node:path';
import { exists, failWithFindings, isFile, isSkippableUrl, ok, readText, rel, resolveLocalRef, ROOT, sitePath } from './check-utils.mjs';

const HTML_FILES = ['index.html', 'recurso.html', 'ficha-trabajo-manga.html', 'manual-docente.html', 'pagina-vacia.html', 'deck-claustro.html', 'jardin-de-tinta.html'];
const findings = [];

function collectIds(html) {
  const ids = new Set();
  for (const match of html.matchAll(/\bid\s*=\s*["']([^"']+)["']/gi)) {
    ids.add(match[1]);
  }
  return ids;
}

const htmlCache = new Map();
async function htmlInfo(file) {
  if (!htmlCache.has(file)) {
    const html = await readText(file);
    htmlCache.set(file, { html, ids: collectIds(html) });
  }
  return htmlCache.get(file);
}

for (const name of HTML_FILES) {
  const file = sitePath(name);
  if (!(await exists(file))) continue;
  const { html } = await htmlInfo(file);

  for (const match of html.matchAll(/\bhref\s*=\s*["']([^"']+)["']/gi)) {
    const href = match[1].trim();
    if (isSkippableUrl(href)) continue;

    const [pathPart, hashPart] = href.split('#');
    const targetFile = pathPart ? resolveLocalRef(file, pathPart) : file;
    if (!targetFile) continue;

    if (!(await isFile(targetFile))) {
      findings.push({ file: rel(file), message: `enlace interno sin archivo destino: ${href}` });
      continue;
    }

    if (hashPart) {
      const ext = basename(targetFile).toLowerCase();
      if (ext.endsWith('.html')) {
        const { ids } = await htmlInfo(targetFile);
        if (!ids.has(hashPart)) {
          findings.push({ file: rel(file), message: `ancla no encontrada: ${href}` });
        }
      }
    }
  }
}

failWithFindings('Errores de enlaces internos', findings);
if (!process.exitCode) ok('enlaces internos');
