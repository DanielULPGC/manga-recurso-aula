#!/usr/bin/env node
import { dirname, join } from 'node:path';
import { failWithFindings, isFile, isSkippableUrl, ok, readText, rel, resolveLocalRef, ROOT, sitePath, stripQueryHash, walk } from './check-utils.mjs';

const findings = [];
const references = [];

function addRef(fromFile, raw, kind) {
  if (isSkippableUrl(raw)) return;
  const clean = stripQueryHash(raw);
  if (!clean || clean === './' || clean === '/' || clean.startsWith('#') || clean.startsWith('%23')) return;
  references.push({ fromFile, raw, kind });
}

for await (const file of walk(ROOT, full => /\.(html|css)$/i.test(full))) {
  const txt = await readText(file);
  if (/\.html$/i.test(file)) {
    for (const match of txt.matchAll(/\b(?:src|href|poster)\s*=\s*["']([^"']+)["']/gi)) {
      addRef(file, match[1], 'html');
    }
    for (const match of txt.matchAll(/\bsrcset\s*=\s*["']([^"']+)["']/gi)) {
      for (const candidate of match[1].split(',')) {
        addRef(file, candidate.trim().split(/\s+/)[0], 'srcset');
      }
    }
  }

  for (const match of txt.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/gi)) {
    addRef(file, match[1], 'css-url');
  }
}

const manifestFile = sitePath('manifest.json');
const manifest = JSON.parse(await readText(manifestFile));
for (const icon of manifest.icons || []) addRef(manifestFile, icon.src, 'manifest-icon');
for (const shortcut of manifest.shortcuts || []) {
  addRef(manifestFile, shortcut.url, 'manifest-shortcut');
  for (const icon of shortcut.icons || []) addRef(manifestFile, icon.src, 'manifest-shortcut-icon');
}

const swFile = sitePath('sw.js');
const sw = await readText(swFile);
const precache = sw.match(/const\s+PRECACHE_ASSETS\s*=\s*\[([\s\S]*?)\];/);
if (precache) {
  for (const match of precache[1].matchAll(/['"]([^'"]+)['"]/g)) addRef(swFile, match[1], 'service-worker-precache');
}

for (const ref of references) {
  const target = resolveLocalRef(ref.fromFile, ref.raw);
  if (!target) continue;
  if (!(await isFile(target))) {
    findings.push({
      file: rel(ref.fromFile),
      message: `${ref.kind} referencia recurso inexistente: ${ref.raw}`,
    });
  }
}

failWithFindings('Errores de recursos referenciados', findings);
if (!process.exitCode) ok(`recursos referenciados (${references.length})`);
