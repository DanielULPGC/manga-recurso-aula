/* ══════════════════════════════════════════════════════════════
   preferencias.js — Panel de preferencias de accesibilidad (DUA)
   El manga como recurso didáctico · Aula de Cómic · ULPGC
   Versión del componente: 1.0.0  ·  Capa: G2

   Depende de (todos opcionales con degradación elegante):
     · SafeStorage  (de app.min.js) — persistencia robusta; si no está,
       cae a localStorage directo y, en último término, a memoria.
     · FocusTrap    (de app.min.js) — accesibilidad del modal; si no está,
       el panel sigue funcionando sin trampa de foco.
     · #fabItems    (speed-dial) — punto de anclaje del botón disparador;
       si no existe, se crea un botón flotante propio.

   CSP estricta: cero HTML inline con handlers; toda interacción se
   conecta con addEventListener en JS. El panel se inserta por DOM.
   ══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /** Claves de persistencia. */
  var K = { fs: 'pref.fontSize', motion: 'pref.motion', lectura: 'pref.lectura' };

  /** Valores válidos por preferencia (defensa frente a datos corruptos). */
  var VALID = {
    fs:      ['md', 'lg', 'xl'],
    motion:  ['on', 'off'],
    lectura: ['off', 'on']
  };

  /* ── Almacenamiento robusto (espejo mínimo de SafeStorage) ─────── */
  var store = (function () {
    function get(k) {
      try {
        if (window.SafeStorage && typeof SafeStorage.getItem === 'function') {
          return SafeStorage.getItem(k);
        }
        return window.localStorage ? localStorage.getItem(k) : null;
      } catch (e) { return null; }
    }
    function set(k, v) {
      try {
        if (window.SafeStorage && typeof SafeStorage.setItem === 'function') {
          SafeStorage.setItem(k, v); return;
        }
        if (window.localStorage) localStorage.setItem(k, v);
      } catch (e) { /* modo privado: se ignora silenciosamente */ }
    }
    return { get: get, set: set };
  })();

  /**
   * Lee una preferencia validada o devuelve su valor por defecto.
   * @param {'fs'|'motion'|'lectura'} pref
   * @returns {string}
   */
  function read(pref) {
    var raw = store.get(K[pref]);
    var def = VALID[pref][0];
    return VALID[pref].indexOf(raw) >= 0 ? raw : def;
  }

  /**
   * Aplica el estado actual al documento (atributos data-* en <html>).
   * Idempotente: puede llamarse en cualquier momento.
   * @param {{fs:string, motion:string, lectura:string}} s
   */
  function apply(s) {
    var root = document.documentElement;
    // Tamaño de texto: solo se marca cuando no es el predeterminado
    if (s.fs === 'md') root.removeAttribute('data-fs');
    else root.setAttribute('data-fs', s.fs);
    // Movimiento
    if (s.motion === 'off') root.setAttribute('data-motion', 'off');
    else root.removeAttribute('data-motion');
    // Modo lectura
    if (s.lectura === 'on') root.setAttribute('data-lectura', 'on');
    else root.removeAttribute('data-lectura');
  }

  /** Estado en memoria, sembrado desde almacenamiento. */
  var state = { fs: read('fs'), motion: read('motion'), lectura: read('lectura') };

  /** ¿Hay alguna preferencia distinta del valor por defecto? (para el badge). */
  function anyActive() {
    return state.fs !== 'md' || state.motion !== 'on' || state.lectura !== 'on';
  }

  /* Aplicación temprana: en cuanto el módulo se evalúa, para minimizar
     el parpadeo (FOUC) del tamaño de texto y el modo lectura. */
  apply(state);

  /* ── Construcción del panel ────────────────────────────────────── */
  var overlay = null, panel = null, triggerBtn = null;

  /**
   * Crea un grupo de botones tipo "segmented control" accesible.
   * @param {string} pref      clave de preferencia ('fs'|'motion'|'lectura')
   * @param {string} legend    título del grupo
   * @param {Array<{val:string,label:string}>} opts opciones
   * @param {string} [hint]    texto de ayuda opcional
   * @returns {HTMLElement}
   */
  function buildGroup(pref, legend, opts, hint) {
    var g = document.createElement('div');
    g.className = 'pref-group';
    g.setAttribute('role', 'group');
    g.setAttribute('aria-label', legend);

    var lg = document.createElement('span');
    lg.className = 'pref-legend';
    lg.textContent = legend;
    g.appendChild(lg);

    var seg = document.createElement('div');
    seg.className = 'pref-seg';
    opts.forEach(function (o) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'pref-btn';
      b.textContent = o.label;
      b.setAttribute('data-val', o.val);
      b.setAttribute('aria-pressed', String(state[pref] === o.val));
      b.addEventListener('click', function () {
        state[pref] = o.val;
        store.set(K[pref], o.val);
        apply(state);
        // Refrescar estados aria-pressed del grupo
        Array.prototype.forEach.call(seg.children, function (c) {
          c.setAttribute('aria-pressed', String(c.getAttribute('data-val') === o.val));
        });
        refreshBadge();
      });
      seg.appendChild(b);
    });
    g.appendChild(seg);

    if (hint) {
      var h = document.createElement('p');
      h.className = 'pref-hint';
      h.textContent = hint;
      g.appendChild(h);
    }
    return g;
  }

  /** Construye (una sola vez) el overlay + panel y lo añade al body. */
  function buildPanel() {
    if (panel) return;

    overlay = document.createElement('div');
    overlay.className = 'pref-overlay';
    overlay.hidden = true;

    panel = document.createElement('div');
    panel.className = 'pref-panel';
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-modal', 'true');
    panel.setAttribute('aria-labelledby', 'prefTitle');

    // Cabecera
    var head = document.createElement('div');
    head.className = 'pref-header';
    var h2 = document.createElement('h2');
    h2.id = 'prefTitle';
    h2.textContent = '⊙ Preferencias de accesibilidad';
    var close = document.createElement('button');
    close.type = 'button';
    close.className = 'pref-close';
    close.setAttribute('aria-label', 'Cerrar preferencias');
    close.textContent = '✕';
    close.addEventListener('click', closePanel);
    head.appendChild(h2);
    head.appendChild(close);
    panel.appendChild(head);

    // Cuerpo
    var body = document.createElement('div');
    body.className = 'pref-body';

    var intro = document.createElement('p');
    intro.className = 'pref-intro';
    intro.textContent = 'Ajusta la lectura a tus necesidades. Tus preferencias se guardan en este dispositivo y se aplican a todo el recurso.';
    body.appendChild(intro);

    body.appendChild(buildGroup('fs', 'Tamaño de texto', [
      { val: 'md', label: 'Normal' },
      { val: 'lg', label: 'Grande' },
      { val: 'xl', label: 'Muy grande' }
    ], 'Aumenta el cuerpo de texto de todo el recurso.'));

    body.appendChild(buildGroup('motion', 'Animaciones', [
      { val: 'on',  label: 'Activadas' },
      { val: 'off', label: 'Reducir' }
    ], 'Desactiva animaciones y transiciones para reducir la fatiga visual.'));

    body.appendChild(buildGroup('lectura', 'Modo lectura accesible', [
      { val: 'off', label: 'Normal' },
      { val: 'on',  label: 'Activar' }
    ], 'Vista plana y de alto contraste: refuerza bordes, subraya enlaces y elimina sombras y fondos decorativos.'));

    // Restablecer
    var reset = document.createElement('button');
    reset.type = 'button';
    reset.className = 'pref-reset';
    reset.textContent = '↺ Restablecer valores por defecto';
    reset.addEventListener('click', function () {
      state = { fs: 'md', motion: 'on', lectura: 'off' };
      store.set(K.fs, 'md'); store.set(K.motion, 'on'); store.set(K.lectura, 'off');
      apply(state);
      // Re-sincronizar todos los grupos
      Array.prototype.forEach.call(panel.querySelectorAll('.pref-group'), function (g) {
        var pref = g.getAttribute('aria-label');
        // Mapeo inverso por legend → no fiable; re-pintamos por data-val vs state
      });
      syncButtons();
      refreshBadge();
    });
    body.appendChild(reset);

    panel.appendChild(body);
    overlay.appendChild(panel);

    // Cerrar al pulsar fuera del panel
    overlay.addEventListener('click', function (e) {
      if (e.target === overlay) closePanel();
    });

    document.body.appendChild(overlay);
  }

  /** Re-sincroniza el estado aria-pressed de todos los botones. */
  function syncButtons() {
    if (!panel) return;
    var groups = panel.querySelectorAll('.pref-group');
    // Recorremos por orden conocido: fs, motion, lectura
    var order = ['fs', 'motion', 'lectura'];
    Array.prototype.forEach.call(groups, function (g, i) {
      var pref = order[i];
      Array.prototype.forEach.call(g.querySelectorAll('.pref-btn'), function (b) {
        b.setAttribute('aria-pressed', String(b.getAttribute('data-val') === state[pref]));
      });
    });
  }

  /** Actualiza el indicador visual (badge) en el botón disparador. */
  function refreshBadge() {
    if (triggerBtn) triggerBtn.classList.toggle('has-active', anyActive());
  }

  /* ── Apertura / cierre con FocusTrap ───────────────────────────── */
  function openPanel() {
    buildPanel();
    syncButtons();
    overlay.hidden = false;
    document.body.classList.add('has-overlay'); // oculta los FAB (patrón del proyecto)
    if (window.FocusTrap && typeof FocusTrap.activate === 'function') {
      FocusTrap.activate(panel, triggerBtn);
    } else {
      // Degradación: foco al primer control
      var first = panel.querySelector('.pref-close');
      if (first) first.focus();
    }
  }

  function closePanel() {
    if (!overlay) return;
    overlay.hidden = true;
    document.body.classList.remove('has-overlay');
    if (window.FocusTrap && typeof FocusTrap.deactivate === 'function') {
      FocusTrap.deactivate();
    } else if (triggerBtn) {
      triggerBtn.focus();
    }
  }

  /* ── Inserción del disparador en el speed-dial ─────────────────── */
  function mountTrigger() {
    var fabItems = document.getElementById('fabItems');
    if (fabItems && !document.getElementById('prefFabBtn')) {
      var wrap = document.createElement('div');
      wrap.className = 'fab-item';
      var b = document.createElement('button');
      b.type = 'button';
      b.id = 'prefFabBtn';
      b.className = 'fab-action';
      b.setAttribute('aria-label', 'Preferencias de accesibilidad');
      b.setAttribute('title', 'Accesibilidad');
      b.textContent = '⊙';
      b.addEventListener('click', openPanel);
      wrap.appendChild(b);
      fabItems.appendChild(wrap);
      triggerBtn = b;
    } else if (!document.getElementById('prefFabBtn')) {
      // Sin speed-dial: botón flotante propio (degradación elegante)
      var fb = document.createElement('button');
      fb.type = 'button';
      fb.id = 'prefFabBtn';
      fb.className = 'fab-action';
      fb.setAttribute('aria-label', 'Preferencias de accesibilidad');
      fb.style.cssText = 'position:fixed;bottom:16px;left:16px;z-index:99990;width:48px;height:48px;border-radius:50%;';
      fb.textContent = '⊙';
      fb.addEventListener('click', openPanel);
      document.body.appendChild(fb);
      triggerBtn = fb;
    } else {
      triggerBtn = document.getElementById('prefFabBtn');
    }
    refreshBadge();
  }

  /* ── Init ──────────────────────────────────────────────────────── */
  function init() {
    apply(state);   // re-asegura el estado tras cargar el DOM
    mountTrigger();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
