import { access, readFile, readdir, stat } from 'node:fs/promises';
import { constants } from 'node:fs';
import { dirname, join, normalize, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

export const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

export function rel(file) {
  return relative(ROOT, file).replace(/\\/g, '/');
}

export function sitePath(...parts) {
  return join(ROOT, ...parts);
}

export async function readText(path) {
  return readFile(path, 'utf8');
}

export async function exists(path) {
  try {
    await access(path, constants.F_OK);
    return true;
  } catch {
    return false;
  }
}

export async function isFile(path) {
  try {
    return (await stat(path)).isFile();
  } catch {
    return false;
  }
}

export async function* walk(dir, predicate = () => true) {
  for (const name of await readdir(dir)) {
    const full = join(dir, name);
    const info = await stat(full);
    if (info.isDirectory()) {
      if (!/(^|[\\/])(node_modules|\.git)([\\/]|$)/.test(full)) {
        yield* walk(full, predicate);
      }
    } else if (predicate(full)) {
      yield full;
    }
  }
}

export function stripQueryHash(value) {
  return String(value).split('#')[0].split('?')[0];
}

export function isSkippableUrl(value) {
  const trimmed = String(value || '').trim();
  return !trimmed ||
    trimmed === '#' ||
    /^(https?:|mailto:|tel:|javascript:|data:|blob:|about:)/i.test(trimmed) ||
    trimmed.includes('${') ||
    trimmed.startsWith('{{');
}

export function resolveLocalRef(fromFile, value) {
  const clean = stripQueryHash(value).trim();
  if (!clean) return null;

  let decoded = clean;
  try {
    decoded = decodeURIComponent(clean);
  } catch {
    decoded = clean;
  }

  const base = dirname(fromFile);
  const resolved = resolve(base, decoded);
  const root = resolve(ROOT);
  if (resolved !== root && !resolved.startsWith(root + sep)) return null;
  return normalize(resolved);
}

export function failWithFindings(title, findings) {
  if (!findings.length) return;
  console.error(`\n${title}`);
  for (const item of findings) {
    console.error(`- ${item.file}: ${item.message}`);
  }
  process.exitCode = 1;
}

export function ok(label) {
  console.log(`  ok: ${label}`);
}
