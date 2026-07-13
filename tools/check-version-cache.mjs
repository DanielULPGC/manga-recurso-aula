#!/usr/bin/env node
import { failWithFindings, ok, readText, sitePath } from './check-utils.mjs';

const findings = [];
const versionJson = JSON.parse(await readText(sitePath('version.json')));
const version = versionJson.version;

if (!/^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(version)) {
  findings.push({ file: 'version.json', message: `version no semver: ${version}` });
}

const sw = await readText(sitePath('sw.js'));
const cacheMatch = sw.match(/const\s+CACHE_NAME\s*=\s*['"]([^'"]+)['"]/);
const expectedCache = `manga-ulpgc-v${version}`;
if (!cacheMatch) {
  findings.push({ file: 'sw.js', message: 'no se encontro CACHE_NAME' });
} else if (cacheMatch[1] !== expectedCache) {
  findings.push({ file: 'sw.js', message: `CACHE_NAME ${cacheMatch[1]} no coincide con ${expectedCache}` });
}

for (const file of ['index.html', 'recurso.html', 'ficha-trabajo-manga.html']) {
  const html = await readText(sitePath(file));
  const mismatches = [...html.matchAll(/\?v=([0-9A-Za-z.+-]+)/g)]
    .map(match => match[1])
    .filter(found => found !== version);
  if (mismatches.length) {
    findings.push({ file, message: `query strings no coinciden con ${version}: ${[...new Set(mismatches)].join(', ')}` });
  }
}

failWithFindings('Errores de version/cache', findings);
if (!process.exitCode) ok('version y cache');
