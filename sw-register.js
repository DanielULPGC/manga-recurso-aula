'use strict';

(function () {
  const SERVICE_WORKER_URL = 'sw.js';
  const SERVICE_WORKER_SCOPE = './';
  const CACHE_PREFIX = 'manga-ulpgc-';

  function debugEnabled() {
    try {
      return window.localStorage &&
        window.localStorage.getItem('manga_debug') === '1';
    } catch (_) {
      return false;
    }
  }

  function debugLog(...args) {
    if (debugEnabled() && window.console) {
      console.log('[manga-pwa]', ...args);
    }
  }

  function debugWarn(...args) {
    if (debugEnabled() && window.console) {
      console.warn('[manga-pwa]', ...args);
    }
  }

  async function clearProjectCaches() {
    if (!('caches' in window)) {
      debugWarn('Cache API no disponible.');
      return [];
    }

    const keys = await caches.keys();
    const projectKeys = keys.filter(key => key.startsWith(CACHE_PREFIX));
    await Promise.all(projectKeys.map(key => caches.delete(key)));
    debugLog('Caches eliminadas manualmente:', projectKeys);
    return projectKeys;
  }

  window.mangaPwaDebug = Object.freeze({
    clearCaches: clearProjectCaches,
  });

  if (!('serviceWorker' in navigator)) {
    debugLog('Service Worker no soportado por este navegador.');
    return;
  }

  if (!/^https?:$/.test(window.location.protocol)) {
    debugLog('Service Worker omitido: requiere HTTP, HTTPS o localhost.');
    return;
  }

  window.addEventListener('load', () => {
    navigator.serviceWorker.register(SERVICE_WORKER_URL, {
      scope: SERVICE_WORKER_SCOPE,
    })
      .then(registration => {
        debugLog('Service Worker registrado:', registration.scope);

        if (registration.waiting) {
          debugLog('Hay una version nueva esperando activacion.');
        }

        registration.addEventListener('updatefound', () => {
          const worker = registration.installing;
          if (!worker) return;

          worker.addEventListener('statechange', () => {
            debugLog('Estado del Service Worker:', worker.state);
          });
        });
      })
      .catch(error => {
        debugWarn('No se pudo registrar el Service Worker:', error);
      });
  });
})();
