#!/usr/bin/env node

import { spawn } from 'node:child_process';
import { randomBytes } from 'node:crypto';
import { EventEmitter } from 'node:events';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { get as httpGet, createServer } from 'node:http';
import { connect as netConnect } from 'node:net';
import { tmpdir } from 'node:os';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(new URL('..', import.meta.url)));
const versionJson = JSON.parse(await readFile(join(ROOT, 'version.json'), 'utf8'));
const expectedCache = `manga-ulpgc-v${versionJson.version}`;

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

function browserCandidates() {
  const home = process.env.LOCALAPPDATA || '';
  const programFiles = process.env.PROGRAMFILES || 'C:\\Program Files';
  const programFilesX86 = process.env['PROGRAMFILES(X86)'] || 'C:\\Program Files (x86)';

  if (process.platform === 'win32') {
    return [
      process.env.CHROME_PATH,
      join(programFiles, 'Google', 'Chrome', 'Application', 'chrome.exe'),
      join(programFilesX86, 'Google', 'Chrome', 'Application', 'chrome.exe'),
      home && join(home, 'Google', 'Chrome', 'Application', 'chrome.exe'),
      join(programFiles, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
      join(programFilesX86, 'Microsoft', 'Edge', 'Application', 'msedge.exe'),
    ].filter(Boolean);
  }

  if (process.platform === 'darwin') {
    return [
      process.env.CHROME_PATH,
      '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
      '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge',
    ].filter(Boolean);
  }

  return [
    process.env.CHROME_PATH,
    '/usr/bin/google-chrome',
    '/usr/bin/google-chrome-stable',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/usr/bin/microsoft-edge',
  ].filter(Boolean);
}

function resolveRequestPath(url) {
  const parsed = new URL(url, 'http://127.0.0.1');
  const relative = decodeURIComponent(parsed.pathname).replace(/^\/+/, '') || 'index.html';
  const file = resolve(ROOT, normalize(relative));
  if (file !== ROOT && !file.startsWith(ROOT + sep)) return null;
  return file;
}

function startServer() {
  const server = createServer((req, res) => {
    const file = resolveRequestPath(req.url || '/');
    if (!file || !existsSync(file) || !statSync(file).isFile()) {
      res.writeHead(file ? 404 : 403, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end(file ? 'Not found' : 'Forbidden');
      return;
    }

    const info = statSync(file);
    res.writeHead(200, {
      'Content-Length': info.size,
      'Content-Type': TYPES.get(extname(file).toLowerCase()) || 'application/octet-stream',
    });
    createReadStream(file).pipe(res);
  });

  return new Promise((resolvePromise, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', () => resolvePromise(server));
  });
}

async function reservePort() {
  const server = createServer();
  await new Promise((resolvePromise, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolvePromise);
  });
  const address = server.address();
  const port = typeof address === 'object' && address ? address.port : 0;
  await new Promise(resolvePromise => server.close(resolvePromise));
  return port;
}

function readJson(url) {
  return new Promise((resolvePromise, reject) => {
    const req = httpGet(url, res => {
      let body = '';
      res.setEncoding('utf8');
      res.on('data', chunk => { body += chunk; });
      res.on('end', () => {
        try {
          resolvePromise(JSON.parse(body));
        } catch (error) {
          reject(error);
        }
      });
    });
    req.once('error', reject);
    req.setTimeout(1000, () => req.destroy(new Error('timeout')));
  });
}

async function waitForDebugger(port, chrome, stderr) {
  const deadline = Date.now() + 15_000;
  while (Date.now() < deadline) {
    if (chrome.exitCode !== null) {
      throw new Error(`el navegador terminó antes de iniciar DevTools: ${stderr.value.trim()}`);
    }
    try {
      const info = await readJson(`http://127.0.0.1:${port}/json/version`);
      if (info.webSocketDebuggerUrl) return info.webSocketDebuggerUrl;
    } catch {
      // El puerto todavía no está listo.
    }
    await new Promise(resolvePromise => setTimeout(resolvePromise, 100));
  }
  throw new Error(`DevTools no respondió a tiempo: ${stderr.value.trim()}`);
}

class WebSocketConnection extends EventEmitter {
  constructor(url) {
    super();
    this.url = new URL(url);
    this.socket = null;
    this.buffer = Buffer.alloc(0);
    this.handshakeComplete = false;
  }

  connect() {
    return new Promise((resolvePromise, reject) => {
      const key = randomBytes(16).toString('base64');
      const socket = netConnect(Number(this.url.port), this.url.hostname);
      this.socket = socket;
      socket.once('error', reject);
      socket.once('connect', () => {
        socket.write([
          `GET ${this.url.pathname}${this.url.search} HTTP/1.1`,
          `Host: ${this.url.host}`,
          'Upgrade: websocket',
          'Connection: Upgrade',
          `Sec-WebSocket-Key: ${key}`,
          'Sec-WebSocket-Version: 13',
          '\r\n',
        ].join('\r\n'));
      });
      socket.on('data', chunk => {
        this.buffer = Buffer.concat([this.buffer, chunk]);
        if (!this.handshakeComplete) {
          const end = this.buffer.indexOf('\r\n\r\n');
          if (end === -1) return;
          const header = this.buffer.subarray(0, end).toString('utf8');
          if (!/^HTTP\/1\.1 101\b/m.test(header)) {
            reject(new Error(`falló el WebSocket de DevTools: ${header.split('\r\n')[0]}`));
            socket.destroy();
            return;
          }
          this.handshakeComplete = true;
          this.buffer = this.buffer.subarray(end + 4);
          socket.removeListener('error', reject);
          socket.on('error', error => this.emit('error', error));
          resolvePromise();
        }
        this.parseFrames();
      });
      socket.on('close', () => this.emit('close'));
    });
  }

  parseFrames() {
    while (this.buffer.length >= 2) {
      const first = this.buffer[0];
      const second = this.buffer[1];
      const opcode = first & 0x0f;
      const masked = Boolean(second & 0x80);
      let length = second & 0x7f;
      let offset = 2;

      if (length === 126) {
        if (this.buffer.length < 4) return;
        length = this.buffer.readUInt16BE(2);
        offset = 4;
      } else if (length === 127) {
        if (this.buffer.length < 10) return;
        length = Number(this.buffer.readBigUInt64BE(2));
        offset = 10;
      }

      const maskLength = masked ? 4 : 0;
      if (this.buffer.length < offset + maskLength + length) return;
      const mask = masked ? this.buffer.subarray(offset, offset + 4) : null;
      offset += maskLength;
      const payload = Buffer.from(this.buffer.subarray(offset, offset + length));
      this.buffer = this.buffer.subarray(offset + length);

      if (mask) {
        for (let i = 0; i < payload.length; i += 1) payload[i] ^= mask[i % 4];
      }

      if (opcode === 0x1) this.emit('message', payload.toString('utf8'));
      else if (opcode === 0x8) this.socket?.end();
      else if (opcode === 0x9) this.sendFrame(payload, 0x0a);
    }
  }

  sendFrame(payload, opcode = 0x1) {
    const data = Buffer.isBuffer(payload) ? payload : Buffer.from(payload, 'utf8');
    const mask = randomBytes(4);
    let header;

    if (data.length < 126) {
      header = Buffer.from([0x80 | opcode, 0x80 | data.length]);
    } else if (data.length <= 0xffff) {
      header = Buffer.alloc(4);
      header[0] = 0x80 | opcode;
      header[1] = 0x80 | 126;
      header.writeUInt16BE(data.length, 2);
    } else {
      header = Buffer.alloc(10);
      header[0] = 0x80 | opcode;
      header[1] = 0x80 | 127;
      header.writeBigUInt64BE(BigInt(data.length), 2);
    }

    const masked = Buffer.alloc(data.length);
    for (let i = 0; i < data.length; i += 1) masked[i] = data[i] ^ mask[i % 4];
    this.socket.write(Buffer.concat([header, mask, masked]));
  }

  sendJson(message) {
    this.sendFrame(JSON.stringify(message));
  }

  close() {
    if (this.socket && !this.socket.destroyed) {
      try {
        this.sendFrame(Buffer.alloc(0), 0x08);
      } finally {
        this.socket.destroy();
      }
    }
  }
}

class CdpClient {
  constructor(connection) {
    this.connection = connection;
    this.nextId = 1;
    this.pending = new Map();
    this.waiters = new Set();
    connection.on('message', text => this.onMessage(text));
    connection.on('close', () => this.rejectPending(new Error('conexión CDP cerrada')));
    connection.on('error', error => this.rejectPending(error));
  }

  onMessage(text) {
    const message = JSON.parse(text);
    if (message.id) {
      const pending = this.pending.get(message.id);
      if (!pending) return;
      this.pending.delete(message.id);
      clearTimeout(pending.timer);
      if (message.error) pending.reject(new Error(message.error.message));
      else pending.resolve(message.result);
      return;
    }

    for (const waiter of [...this.waiters]) {
      if (waiter.method === message.method && (!waiter.sessionId || waiter.sessionId === message.sessionId)) {
        this.waiters.delete(waiter);
        clearTimeout(waiter.timer);
        waiter.resolve(message.params || {});
      }
    }
  }

  rejectPending(error) {
    for (const pending of this.pending.values()) pending.reject(error);
    this.pending.clear();
    for (const waiter of this.waiters) waiter.reject(error);
    this.waiters.clear();
  }

  send(method, params = {}, sessionId) {
    const id = this.nextId++;
    return new Promise((resolvePromise, reject) => {
      const timer = setTimeout(() => {
        this.pending.delete(id);
        reject(new Error(`tiempo agotado en CDP: ${method}`));
      }, 20_000);
      this.pending.set(id, { resolve: resolvePromise, reject, timer });
      this.connection.sendJson({ id, method, params, ...(sessionId ? { sessionId } : {}) });
    });
  }

  waitFor(method, sessionId, timeout = 20_000) {
    return new Promise((resolvePromise, reject) => {
      const waiter = { method, sessionId, resolve: resolvePromise, reject, timer: null };
      waiter.timer = setTimeout(() => {
        this.waiters.delete(waiter);
        reject(new Error(`evento CDP no recibido: ${method}`));
      }, timeout);
      this.waiters.add(waiter);
    });
  }
}

async function navigate(cdp, sessionId, url) {
  const loaded = cdp.waitFor('Page.loadEventFired', sessionId);
  const result = await cdp.send('Page.navigate', { url }, sessionId);
  if (result.errorText) throw new Error(`navegación fallida: ${result.errorText}`);
  await loaded;
}

async function evaluate(cdp, sessionId, expression) {
  const response = await cdp.send('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true,
  }, sessionId);
  if (response.exceptionDetails) {
    throw new Error(response.exceptionDetails.exception?.description || response.exceptionDetails.text || 'error de evaluación');
  }
  return response.result?.value;
}

const browserPath = browserCandidates().find(candidate => existsSync(candidate));
if (!browserPath) {
  console.error('ERROR: no se encontró Chrome o Edge. Define CHROME_PATH para ejecutar esta comprobación.');
  process.exit(1);
}

const profileDir = await mkdtemp(join(tmpdir(), 'manga-browser-check-'));
const server = await startServer();
const serverAddress = server.address();
const sitePort = typeof serverAddress === 'object' && serverAddress ? serverAddress.port : 0;
const debugPort = await reservePort();
const stderr = { value: '' };
const chrome = spawn(browserPath, [
  '--headless=new',
  '--disable-gpu',
  '--no-first-run',
  '--no-default-browser-check',
  `--remote-debugging-port=${debugPort}`,
  `--user-data-dir=${profileDir}`,
  'about:blank',
], { stdio: ['ignore', 'ignore', 'pipe'], windowsHide: true });
chrome.stderr.on('data', chunk => { stderr.value = (stderr.value + chunk.toString()).slice(-8000); });

let connection;
try {
  const debuggerUrl = await waitForDebugger(debugPort, chrome, stderr);
  connection = new WebSocketConnection(debuggerUrl);
  await connection.connect();
  const cdp = new CdpClient(connection);

  const { targetId } = await cdp.send('Target.createTarget', { url: 'about:blank' });
  const { sessionId } = await cdp.send('Target.attachToTarget', { targetId, flatten: true });
  await Promise.all([
    cdp.send('Page.enable', {}, sessionId),
    cdp.send('Runtime.enable', {}, sessionId),
    cdp.send('Network.enable', {}, sessionId),
  ]);

  const origin = `http://127.0.0.1:${sitePort}`;
  await navigate(cdp, sessionId, `${origin}/index.html`);
  const pwa = await evaluate(cdp, sessionId, `(async () => {
    const registration = await Promise.race([
      navigator.serviceWorker.ready,
      new Promise((_, reject) => setTimeout(() => reject(new Error('service worker timeout')), 15000))
    ]);
    const cacheNames = await caches.keys();
    const required = ['index.html', 'recurso.html', 'ficha-trabajo-manga.html', 'css/ficha-trabajo.css', 'js/ficha-trabajo.js'];
    const hits = {};
    for (const path of required) hits[path] = Boolean(await caches.match(path));
    return {
      active: registration.active ? registration.active.state : null,
      cacheNames,
      controller: Boolean(navigator.serviceWorker.controller),
      hits,
      rootChildren: document.querySelector('#root')?.childElementCount || 0
    };
  })()`);

  if (!pwa.controller) {
    await navigate(cdp, sessionId, `${origin}/index.html`);
    pwa.controller = await evaluate(cdp, sessionId, 'Boolean(navigator.serviceWorker.controller)');
  }
  if (!pwa.controller || pwa.active !== 'activated') throw new Error('el service worker no controla la página');
  if (!pwa.cacheNames.includes(expectedCache)) throw new Error(`no existe la caché ${expectedCache}`);
  const missing = Object.entries(pwa.hits).filter(([, hit]) => !hit).map(([path]) => path);
  if (missing.length) throw new Error(`recursos sin precaché: ${missing.join(', ')}`);
  if (!pwa.rootChildren) throw new Error('la portada no se renderizó');

  await navigate(cdp, sessionId, `${origin}/recurso.html`);
  const resourceReady = await evaluate(cdp, sessionId, `Boolean(document.querySelector('#main-content'))`);
  if (!resourceReady) throw new Error('recurso.html no contiene el área principal');

  await navigate(cdp, sessionId, `${origin}/ficha-trabajo-manga.html`);
  const worksheet = await evaluate(cdp, sessionId, `({
    fields: document.querySelectorAll('input, select, textarea').length,
    hasMain: Boolean(document.querySelector('#ficha')),
    date: document.querySelector('#worksheetDate')?.value || '',
    overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth
  })`);
  if (!worksheet.hasMain || worksheet.fields < 10 || !worksheet.date || worksheet.overflow) {
    throw new Error('la ficha no supera la comprobación de render y layout');
  }

  await cdp.send('Network.emulateNetworkConditions', {
    offline: true,
    latency: 0,
    downloadThroughput: 0,
    uploadThroughput: 0,
    connectionType: 'none',
  }, sessionId);
  await navigate(cdp, sessionId, `${origin}/recurso.html`);
  const offlineReady = await evaluate(cdp, sessionId, `Boolean(document.querySelector('#main-content'))`);
  if (!offlineReady) throw new Error('recurso.html no cargó sin conexión');

  await cdp.send('Network.emulateNetworkConditions', {
    offline: false,
    latency: 0,
    downloadThroughput: -1,
    uploadThroughput: -1,
    connectionType: 'wifi',
  }, sessionId);
  await cdp.send('Target.closeTarget', { targetId });
  console.log(`  ok: navegador, render, PWA y navegación offline (${expectedCache})`);
} catch (error) {
  const browserDetail = stderr.value.trim().split(/\r?\n/).slice(-3).join(' | ');
  console.error(`ERROR: comprobación de navegador fallida: ${error.message}${browserDetail ? `\n  navegador: ${browserDetail}` : ''}`);
  process.exitCode = 1;
} finally {
  connection?.close();
  if (chrome.exitCode === null) {
    const exited = new Promise(resolvePromise => chrome.once('exit', resolvePromise));
    chrome.kill();
    await Promise.race([exited, new Promise(resolvePromise => setTimeout(resolvePromise, 2000))]);
  }
  await new Promise(resolvePromise => server.close(resolvePromise));
  try {
    await rm(profileDir, { recursive: true, force: true, maxRetries: 3, retryDelay: 200 });
  } catch (error) {
    console.warn(`AVISO: no se pudo retirar el perfil temporal del navegador: ${error.message}`);
  }
}
