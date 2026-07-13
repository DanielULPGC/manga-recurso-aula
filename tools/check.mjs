#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const node = process.execPath;
const checks = [
  ['tools/build.mjs', '--check'],
  ['tools/check-version-cache.mjs'],
  ['tools/check-links.mjs'],
  ['tools/check-resources.mjs'],
  ['tools/validate-catalog.mjs'],
];

function run(args) {
  return new Promise(resolve => {
    const child = spawn(node, args, { cwd: ROOT, stdio: 'inherit' });
    child.on('close', code => resolve(code));
  });
}

let failed = 0;
console.log('\n  Check suite manga-aula-app');
console.log('  ----------------------------------------');

for (const args of checks) {
  console.log(`\n  > node ${args.join(' ')}`);
  const code = await run(args);
  if (code !== 0) failed += 1;
}

console.log('\n  ----------------------------------------');
if (failed) {
  console.error(`  Check suite failed: ${failed} bloque(s) con errores.\n`);
  process.exit(1);
}

console.log('  Check suite complete.\n');
