#!/usr/bin/env node
/**
 * Release build for "El manga como recurso didactico".
 *
 * Single source of version truth: version.json.
 *
 * Build mode:
 *   - verifies text encoding before release;
 *   - minifies js/app.js and js/datos.js with Terser;
 *   - propagates version to sw.js and versioned HTML entry points;
 *   - verifies generated artifact sizes and version coherence.
 *
 * Check mode:
 *   - run with --check;
 *   - verifies encoding, generated minified output, current artifacts and
 *     version propagation without writing files.
 */

import { readFile, readdir, stat, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { minify } from 'terser';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CHECK_ONLY = process.argv.includes('--check');
const VERSIONED_HTML = ['index.html', 'recurso.html', 'ficha-trabajo-manga.html'];
const MINIFIED_TARGETS = [
  ['js/app.js', 'js/app.min.js'],
  ['js/datos.js', 'js/datos.min.js'],
];

const TEXT_EXT = /\.(js|mjs|html|css|json|md|yaml|yml|svg|txt)$/i;
const EXCLUDE = /(^|[\\/])(node_modules|assets[\\/]libs|\.git)([\\/]|$)/;
const DERIVED = new Set(['js/app.min.js', 'js/datos.min.js']);
const SECOND_BYTE = '[\\u0080-\\u00BF\\u00A0-\\u00FF\\u0152\\u0153\\u0160\\u0161\\u017D\\u017E\\u0178\\u0192\\u02C6\\u02DC\\u2013\\u2014\\u2018\\u2019\\u201A\\u201C\\u201D\\u201E\\u2020\\u2021\\u2022\\u2026\\u2030\\u2039\\u203A\\u20AC\\u2122]';
const MOJIBAKE = new RegExp('[\\u00C3\\u00C2\\u00E2]' + SECOND_BYTE);

const terserOptions = {
  compress: {
    drop_debugger: true,
    passes: 2,
  },
  mangle: true,
  format: {
    comments: false,
  },
};

const p = (...segments) => join(ROOT, ...segments);
const rel = file => file.slice(ROOT.length + 1).replace(/\\/g, '/');
const kb = bytes => `${(bytes / 1024).toFixed(1)} KB`;

function fail(message) {
  console.error(`\n  ERROR: ${message}\n`);
  process.exit(1);
}

async function* walk(dir) {
  for (const name of await readdir(dir)) {
    const full = join(dir, name);
    if (EXCLUDE.test(full)) continue;
    const info = await stat(full);
    if (info.isDirectory()) yield* walk(full);
    else if (TEXT_EXT.test(name)) yield full;
  }
}

async function textForMojibakeScan(file, relativePath) {
  const txt = await readFile(file, 'utf8');

  if (relativePath !== 'version.json') return txt;

  // version.json is the source of the release version. Its legacy changelog
  // can mention mojibake patterns literally, so scan only release metadata.
  const json = JSON.parse(txt);
  delete json.historial;
  return JSON.stringify(json);
}

async function verifyEncoding() {
  const infected = [];

  for await (const file of walk(ROOT)) {
    const relativePath = rel(file);
    if (DERIVED.has(relativePath)) continue;

    const txt = await textForMojibakeScan(file, relativePath);
    const match = txt.match(MOJIBAKE);
    if (match) infected.push({ file: relativePath, sample: match[0] });
  }

  if (infected.length) {
    console.error('\n  ERROR: mojibake detected in text files:');
    for (const { file, sample } of infected) {
      console.error(`      ${file}  sample: "${sample}"`);
    }
    fail('repair encoding before publishing.');
  }

  console.log('  encoding: ok');
}

async function readVersion() {
  const json = JSON.parse(await readFile(p('version.json'), 'utf8'));
  if (!/^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(json.version)) {
    fail(`invalid version in version.json: ${json.version}`);
  }
  return json.version;
}

async function minifyTarget(src, dst) {
  const source = await readFile(p(src), 'utf8');
  const result = await minify(source, terserOptions);

  if (result.error) throw result.error;
  if (!result.code) fail(`Terser returned empty output for ${src}`);
  if (Buffer.byteLength(result.code, 'utf8') >= Buffer.byteLength(source, 'utf8')) {
    fail(`${dst} is not smaller than ${src}`);
  }

  if (CHECK_ONLY) {
    const current = await readFile(p(dst), 'utf8');
    if (current !== result.code) {
      fail(`${dst} is not up to date. Run npm run build.`);
    }
  } else {
    await writeFile(p(dst), result.code, 'utf8');
  }

  console.log(`  minify: ${src} ${kb(Buffer.byteLength(source, 'utf8'))} -> ${dst} ${kb(Buffer.byteLength(result.code, 'utf8'))}`);
}

function replaceAllChecked(txt, file, replacements) {
  let out = txt;

  for (const [pattern, replacement, label] of replacements) {
    if (!pattern.test(out)) {
      fail(`${file}: pattern not found for ${label}`);
    }
    out = out.replace(pattern, replacement);
  }

  return out;
}

async function patchFile(file, replacements) {
  const before = await readFile(p(file), 'utf8');
  const after = replaceAllChecked(before, file, replacements);

  if (!CHECK_ONLY && after !== before) {
    await writeFile(p(file), after, 'utf8');
  }

  console.log(`  version: ${file}`);
}

async function propagateVersion(version) {
  const cacheName = `manga-ulpgc-v${version}`;

  await patchFile('sw.js', [
    [
      /(const\s+CACHE_NAME\s*=\s*['"])manga-ulpgc-v[^'"]+(['"])/,
      `$1${cacheName}$2`,
      'CACHE_NAME',
    ],
    [
      /(Versi.n:\s*)[\dA-Za-z.+-]+(\s*\([^)]*\))/,
      `$1${version}$2`,
      'service worker header version',
    ],
  ]);

  for (const file of VERSIONED_HTML) {
    await patchFile(file, [
      [/\?v=[0-9A-Za-z.+-]+/g, `?v=${version}`, 'asset query strings'],
    ]);
  }
}

async function verifyVersion(version) {
  const cacheName = `manga-ulpgc-v${version}`;
  const sw = await readFile(p('sw.js'), 'utf8');
  if (!sw.includes(`const CACHE_NAME = '${cacheName}'`) && !sw.includes(`const CACHE_NAME = "${cacheName}"`)) {
    fail(`sw.js CACHE_NAME is not ${cacheName}`);
  }

  for (const file of VERSIONED_HTML) {
    const txt = await readFile(p(file), 'utf8');
    const mismatches = [...txt.matchAll(/\?v=([0-9A-Za-z.+-]+)/g)]
      .map(match => match[1])
      .filter(found => found !== version);
    if (mismatches.length) {
      fail(`${file} contains query strings not matching ${version}: ${[...new Set(mismatches)].join(', ')}`);
    }
  }

  console.log('  version coherence: ok');
}

async function verifyMinifiedSizes() {
  for (const [src, dst] of MINIFIED_TARGETS) {
    const sourceSize = (await stat(p(src))).size;
    const minifiedSize = (await stat(p(dst))).size;
    if (minifiedSize >= sourceSize) {
      fail(`${dst} (${minifiedSize} bytes) is not smaller than ${src} (${sourceSize} bytes)`);
    }
  }

  console.log('  artifact sizes: ok');
}

console.log(`\n  ${CHECK_ONLY ? 'Check' : 'Build'} manga-aula-app`);
console.log('  ----------------------------------------');

await verifyEncoding();
const version = await readVersion();
console.log(`  version: ${version}`);

for (const [src, dst] of MINIFIED_TARGETS) {
  await minifyTarget(src, dst);
}

await propagateVersion(version);
await verifyVersion(version);
await verifyMinifiedSizes();
await verifyEncoding();

console.log(`  ----------------------------------------`);
console.log(`  ${CHECK_ONLY ? 'Check complete.' : 'Build complete.'}\n`);
