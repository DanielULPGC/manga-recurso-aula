#!/usr/bin/env node

import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const PORT = Number.parseInt(process.env.PORT || '8080', 10);
const HOST = process.env.HOST || '127.0.0.1';

const TYPES = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.js', 'application/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.svg', 'image/svg+xml'],
  ['.png', 'image/png'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.webp', 'image/webp'],
  ['.mp4', 'video/mp4'],
  ['.pdf', 'application/pdf'],
]);

function contentType(file) {
  return TYPES.get(extname(file).toLowerCase()) || 'application/octet-stream';
}

function resolveRequestPath(url) {
  const parsed = new URL(url, `http://${HOST}:${PORT}`);
  const pathname = decodeURIComponent(parsed.pathname);
  const relative = pathname === '/' ? 'index.html' : pathname.replace(/^\/+/, '');
  const file = resolve(ROOT, normalize(relative));

  if (file !== ROOT && !file.startsWith(ROOT + sep)) {
    return null;
  }

  if (existsSync(file) && statSync(file).isDirectory()) {
    return join(file, 'index.html');
  }

  return file;
}

const server = createServer((req, res) => {
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.writeHead(405, { Allow: 'GET, HEAD' });
    res.end();
    return;
  }

  const file = resolveRequestPath(req.url || '/');
  if (!file) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Forbidden');
    return;
  }

  if (!existsSync(file) || !statSync(file).isFile()) {
    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
    return;
  }

  const info = statSync(file);
  res.writeHead(200, {
    'Content-Length': info.size,
    'Content-Type': contentType(file),
  });

  if (req.method === 'HEAD') {
    res.end();
    return;
  }

  createReadStream(file).pipe(res);
});

server.listen(PORT, HOST, () => {
  console.log(`Serving ${ROOT} at http://${HOST}:${PORT}/`);
});
