/* ══════════════════════════════════════════════════════════════════
   url-state.js — Persistencia de filtros del catálogo en la URL
   v5.10 · 2026-05

   Permite compartir un catálogo filtrado por enlace:
   recurso.html?uso=lenguas&nivel=primaria&ods=4&q=tezuka&emocion=esperanza

   Cómo funciona:
   1. Al cargar la página, lee los query params y aplica los filtros
      existentes (filterUso, filterNivel, filterOds, filterByEmocion,
      catalogSearch.value).
   2. Wrappea las funciones globales filter* para que, además de su
      lógica, escriban en la URL con history.replaceState.
   3. Escucha popstate para que ← / → del navegador sincronicen el
      estado de la página.
   4. Hookea el input #catalogSearch en su evento "input" (debounced).

   No-op si window.filterUso etc. no existen (otras páginas).
   ══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const PARAM_KEYS = ['uso', 'nivel', 'ods', 'q', 'emocion'];

  // ── Lectura/escritura de la URL ─────────────────────────────
  function readUrl() {
    const u = new URL(window.location.href);
    const out = {};
    for (const k of PARAM_KEYS) {
      const v = u.searchParams.get(k);
      if (v != null && v !== '') out[k] = v;
    }
    return out;
  }

  function writeUrl(patch) {
    const u = new URL(window.location.href);
    for (const k of Object.keys(patch)) {
      const v = patch[k];
      if (v == null || v === '' || v === 'all') {
        u.searchParams.delete(k);
      } else {
        u.searchParams.set(k, v);
      }
    }
    history.replaceState(null, '', u.pathname + (u.search ? u.search : '') + u.hash);
  }

  // ── Wrap de las funciones filter* globales ──────────────────
  function wrap(name, urlKey) {
    const original = window[name];
    if (typeof original !== 'function') return false;
    window[name] = function (v) {
      const r = original.apply(this, arguments);
      try { writeUrl({ [urlKey]: v }); } catch (e) {}
      return r;
    };
    return true;
  }

  // ── Aplicar estado desde URL ────────────────────────────────
  function applyFromUrl() {
    const s = readUrl();
    // Aplicamos por orden — cada filterX en app.js dispara applyFilters,
    // así que el último gana la última invalidación. Es deliberado.
    if (s.uso && typeof window.filterUso === 'function') {
      window.filterUso(s.uso);
    }
    if (s.nivel && typeof window.filterNivel === 'function') {
      window.filterNivel(s.nivel);
    }
    if (s.ods && typeof window.filterOds === 'function') {
      window.filterOds(s.ods);
    }
    if (s.emocion && typeof window.filterByEmocion === 'function') {
      // emocion-bar a veces se inicializa más tarde — esperamos al picker
      const expand = () => {
        const toggle = document.getElementById('emocionToggle');
        if (toggle && toggle.getAttribute('aria-expanded') !== 'true') {
          toggle.click();
        }
        window.filterByEmocion(s.emocion);
      };
      // Si los botones ya están inyectados, ejecutar inmediatamente; si no,
      // reintentar un par de veces.
      let tries = 0;
      const tick = () => {
        const ready = document.querySelector('.emocion-btn[data-key="' + s.emocion + '"]');
        if (ready) {
          expand();
        } else if (tries++ < 20) {
          setTimeout(tick, 150);
        }
      };
      tick();
    }
    if (s.q != null) {
      const input = document.getElementById('catalogSearch');
      if (input) {
        input.value = s.q;
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }
    }
  }

  // ── Hook del input de búsqueda ──────────────────────────────
  function hookSearchInput() {
    const input = document.getElementById('catalogSearch');
    if (!input) return;
    let t = null;
    input.addEventListener('input', () => {
      clearTimeout(t);
      t = setTimeout(() => {
        writeUrl({ q: input.value });
      }, 200);
    });
  }

  // ── popstate (botones ← / → del navegador) ─────────────────
  function hookPopstate() {
    window.addEventListener('popstate', () => {
      applyFromUrl();
    });
  }

  // ── Init ────────────────────────────────────────────────────
  function init() {
    // 1. Wrap de las globals — pueden no existir aún al cargar; reintentamos.
    let attempts = 0;
    const ready = () =>
      typeof window.filterUso === 'function' &&
      typeof window.filterNivel === 'function' &&
      typeof window.filterOds === 'function';
    const onReady = () => {
      wrap('filterUso', 'uso');
      wrap('filterNivel', 'nivel');
      wrap('filterOds', 'ods');
      wrap('filterByEmocion', 'emocion');
      hookSearchInput();
      hookPopstate();
      // 2. Aplicar lo que venga en la URL al cargar.
      applyFromUrl();
    };
    const tick = () => {
      if (ready()) onReady();
      else if (attempts++ < 60) setTimeout(tick, 100);
    };
    tick();

    // API pública para tests
    window.__urlState = {
      read: readUrl,
      write: writeUrl,
      apply: applyFromUrl,
    };
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
