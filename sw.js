/**
 * sw.js — Service Worker para El manga como recurso didáctico
 * Biblioteca Campus del Obelisco · Aula de Cómic · ULPGC
 * Versión: 5.57.0  (minificacion real, script de release, version unica)
 *
 * ── PROTOCOLO DE MANTENIMIENTO ─────────────────────────────────
 * Cada vez que se publique una nueva versión del recurso:
 *   1. Incrementar version.json.
 *   2. Ejecutar npm run build para actualizar CACHE_NAME y la cabecera.
 *   3. Verificar que PRECACHE_ASSETS incluye todos los assets nuevos.
 * Sin este paso, los usuarios con caché previa no recibirán
 * las actualizaciones hasta que limpien el navegador manualmente.
 * ───────────────────────────────────────────────────────────────
 *
 * Estrategia de caché:
 *   · Cache First  → assets estáticos propios (HTML, CSS, JS, datos).
 *   · Network Only → APIs de IA (Claude, Gemini) — nunca se cachean.
 *   · Cache First  → fuentes Google (fonts.gstatic.com) — se cachean
 *     en primera visita para habilitar uso offline. Si Google actualiza
 *     los binarios de fuente, la invalidación ocurrirá en la siguiente
 *     visita con red cuando se bump-ee CACHE_NAME.
 */

'use strict';

/* ── VERSIÓN DE CACHÉ ── generada desde version.json ── */
const CACHE_NAME = 'manga-ulpgc-v5.57.0';

/* ── Assets precacheados en la instalación del SW ─────────────────
   Incluir aquí cualquier archivo nuevo que se añada al proyecto. */
const PRECACHE_ASSETS = [
  './',
  './index.html',
  './recurso.html',
  './ficha-trabajo-manga.html',
  './landing/htm-app.js',
  './css/estilos.css',
  './css/editorial.css',
  './css/editorial-extras.css',
  './css/ficha-trabajo.css',
  './js/core/config.js',
  './js/core/utils.js',
  './js/core/curriculo.js',
  './js/app.min.js',
  './js/curriculo-normativa.js',
  './js/guia-fix.js',
  './js/datos.min.js',
  './js/vinetas-generator.js',
  './js/actividad-vinetas.js',
  './js/autocomprobacion-datos.js',
  './js/autocomprobacion.js',
  './js/segmentacion.js',
  './js/mediacion.js',
  './js/planificador.js',
  './js/catalog-collapse.js',
  './js/etapa-selector.js',
  './js/left-dock.js',
  './js/overlay-fab-hide.js',
  './js/filter-collapse-sticky.js',
  './js/timeline-jump.js',
  './js/lazy-fonts.js',
  './js/url-state.js',
  './js/ficha-pdf.js',
  './js/ficha-trabajo.js',
  './js/modo-lectura.js',
  './jardin-de-tinta.html',
  './js/jardin-arte.js',
  './js/jardin-scroll.js',
  './img/estampas/hokusai-gran-ola.jpg',
  './img/estampas/hiroshige-lluvia.jpg',
  './img/estampas/sharaku-actor.jpg',
  './img/estampas/kuniyoshi-esqueleto.jpg',
  './img/estampas/hokusai-manga-rostros.jpg',
  './manifest.json',
  './sw-register.js',
  './icons/icon.svg',
  './intro/card.html',
  './img/banner-ulpgc-aulacomic.jpg',
  './img/banner-ulpgc-aulacomic.webp',
  './img/logo-aula-comic.jpg',
  './img/logo-aula-comic.webp',
  './ficha_trabajo_manga.pdf',
  './assets/libs/react.production.min.js',
  './assets/libs/react-dom.production.min.js',
  './assets/libs/framer-motion.js',
  './assets/libs/htm.js',
  './assets/libs/d3.min.js',
  './landing/portada-bind.js',
  './landing/intro-boot.js',
  './landing/tailwind.css',
  './icons/icon-180.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-192-maskable.png',
  './icons/icon-512-maskable.png',
  './css/marco-bloques.css',
  './css/marco-bloques-2.css',
  './css/estructura.css',
  './css/pendientes.css',
  './css/a11y-contrast.css',
  './css/preferencias.css',
  './css/andamiaje-lectura.css',
  './css/v551-visual.css',
  './css/orden-lectura.css',
  './js/parte-nav.js',
  './js/preferencias.js',
  './js/andamiaje-lectura.js',
  './js/v551-reveal.js',
  './js/orden-lectura.js',
];

/* ── Dominios que van SIEMPRE a red (nunca se cachean) ────────────
   · api.anthropic.com              → Claude API
   · googleapis.com                 → Google Fonts CSS + Gemini
   · generativelanguage.googleapis.com → Gemini API (explícito)
   fonts.gstatic.com se omite intencionalmente: los binarios de
   fuente se cachean para permitir uso offline en el aula. */
const NETWORK_ONLY_PATTERNS = [
  'api.anthropic.com',
  'googleapis.com',
  'generativelanguage.googleapis.com',
];

/* ── INSTALACIÓN: precachear assets estáticos ─────────────────── */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_ASSETS))
      .then(() => self.skipWaiting())   // activa el SW nuevo inmediatamente
  );
});

/* ── ACTIVACIÓN: limpiar cachés de versiones anteriores ──────── */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(k => k !== CACHE_NAME)   // conserva solo la versión actual
            .map(k => caches.delete(k))
        )
      )
      .then(() => self.clients.claim())      // toma control de pestañas abiertas
  );
});

/* ── FETCH: Cache First para assets, Network Only para IA ───── */
self.addEventListener('fetch', event => {
  const url = event.request.url;

  // Network Only: nunca cachear llamadas a APIs de IA
  if (NETWORK_ONLY_PATTERNS.some(pattern => url.includes(pattern))) return;

  // Solo interceptar peticiones GET
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      // Cache hit → responder desde caché
      if (cached) return cached;

      // Cache miss → ir a red y cachear la respuesta
      return fetch(event.request)
        .then(response => {
          // Cachear solo respuestas válidas del propio origen o CORS anónimo
          if (response.ok && response.type !== 'opaque') {
            const clone = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => cache.put(event.request, clone));
          }
          return response;
        })
        .catch(() => {
          // Fallback offline: devolver index.html para navegación SPA
          if (event.request.mode === 'navigate') {
            return caches.match('./index.html');
          }
          // Para otros recursos (imágenes, fuentes), fallo silencioso
        });
    })
  );
});
