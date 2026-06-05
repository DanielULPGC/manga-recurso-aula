/* ══════════════════════════════════════════════════════════════
   planificador.js — "Mi selección" (planificador persistente)
   Permite al profesorado curar una selección de títulos y
   conservarla/compartirla por enlace, reutilizando url-state.js
   (persistencia en la URL, parámetro ?sel=). No invade el render
   del catálogo: el botón "guardar" se engancha en el modal estable
   #fichaModal y la selección se identifica por índice en CATALOGO.
   Vanilla JS, sin dependencias. CSP estricta.
   ══════════════════════════════════════════════════════════════ */
(function() {
  'use strict';

  const sel = new Set();          // índices en window.CATALOGO
  let currentIdx = -1;            // ficha abierta actualmente
  let addBtn = null, countBtns = [], panel = null;

  function el(tag, cls, html) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  const norm = s => (s || '').toString().trim().toLowerCase();
  const cat = () => (Array.isArray(window.CATALOGO) ? window.CATALOGO : []);
  const tituloDe = i => { const o = cat()[i]; return o ? (o.titulo || 'Título') : 'Título'; };
  const autorDe = i => { const o = cat()[i]; return o ? (o.autor || o.auto || '') : ''; };

  // ── Persistencia en la URL (reutiliza url-state si está) ──────
  function writeUrl() {
    const val = Array.from(sel).sort((a, b) => a - b).join(',');
    const patch = { sel: val };
    if (window.__urlState && typeof window.__urlState.write === 'function') {
      window.__urlState.write(patch);
    } else {
      const u = new URL(window.location.href);
      if (val) u.searchParams.set('sel', val); else u.searchParams.delete('sel');
      history.replaceState(null, '', u.pathname + (u.search || '') + u.hash);
    }
  }
  function readUrl() {
    const v = new URL(window.location.href).searchParams.get('sel');
    sel.clear();
    if (v) v.split(',').forEach(x => {
      const n = parseInt(x, 10);
      if (!isNaN(n) && n >= 0 && n < cat().length) sel.add(n);
    });
  }

  function idxFromCard(card) {
    if (!card || !card.dataset) return -1;
    const t = norm(card.dataset.titulo);
    let i = cat().findIndex(o => norm(o.titulo) === t);
    if (i < 0) { const n = parseInt(card.dataset.id, 10); if (!isNaN(n)) i = n; }
    return i;
  }

  // ── Sincronizar la interfaz con el estado ────────────────────
  function refresh() {
    const n = sel.size;
    countBtns.forEach(b => {
      b.textContent = 'Mi selección (' + n + ')';
      b.setAttribute('aria-label', 'Mi selección, ' + n + ' título' + (n === 1 ? '' : 's'));
    });
    if (addBtn) {
      const inSel = currentIdx >= 0 && sel.has(currentIdx);
      addBtn.textContent = inSel ? 'Quitar de mi selección' : 'Guardar en mi selección';
      addBtn.setAttribute('aria-pressed', inSel ? 'true' : 'false');
      addBtn.disabled = (currentIdx < 0);
    }
    if (panel) renderPanel();
  }

  function toggleCurrent() {
    if (currentIdx < 0) return;
    if (sel.has(currentIdx)) sel.delete(currentIdx); else sel.add(currentIdx);
    writeUrl(); refresh();
  }

  // ── Panel "Mi selección" ─────────────────────────────────────
  function renderPanel() {
    const list = panel.querySelector('.plan-list');
    list.innerHTML = '';
    if (sel.size === 0) {
      list.appendChild(el('li', 'plan-empty', 'Aún no has guardado títulos. Abre una ficha del catálogo y pulsa «Guardar en mi selección».'));
    } else {
      Array.from(sel).sort((a, b) => a - b).forEach(i => {
        const li = el('li', 'plan-item');
        const meta = el('div', 'plan-meta');
        meta.appendChild(el('span', 'plan-titulo', tituloDe(i)));
        const au = autorDe(i);
        if (au) meta.appendChild(el('span', 'plan-autor', au));
        li.appendChild(meta);
        const rm = el('button', 'plan-rm', '✕');
        rm.type = 'button';
        rm.setAttribute('aria-label', 'Quitar ' + tituloDe(i) + ' de mi selección');
        rm.addEventListener('click', () => { sel.delete(i); writeUrl(); refresh(); });
        li.appendChild(rm);
        list.appendChild(li);
      });
    }
    panel.querySelector('.plan-clear').disabled = (sel.size === 0);
    panel.querySelector('.plan-copy').disabled = (sel.size === 0);
  }

  function buildPanel() {
    const p = el('div', 'plan-panel');
    p.id = 'planPanel';
    p.setAttribute('role', 'region');
    p.setAttribute('aria-label', 'Mi selección de títulos');
    p.hidden = true;
    p.appendChild(el('p', 'plan-intro', 'Tu selección se guarda en el enlace de esta página: cópialo para conservarla o compartirla con el equipo.'));
    p.appendChild(el('ul', 'plan-list'));
    const actions = el('div', 'plan-actions');
    const copy = el('button', 'seg-btn plan-copy', 'Copiar enlace');
    const clear = el('button', 'seg-toggle plan-clear', 'Vaciar');
    copy.type = clear.type = 'button';
    const fb = el('span', 'plan-fb');
    fb.setAttribute('aria-live', 'polite');
    copy.addEventListener('click', () => {
      const url = window.location.href;
      const done = () => { fb.textContent = 'Enlace copiado'; setTimeout(() => fb.textContent = '', 2500); };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(url).then(done).catch(() => { fb.textContent = url; });
      } else { fb.textContent = url; }
    });
    clear.addEventListener('click', () => { sel.clear(); writeUrl(); refresh(); });
    actions.appendChild(copy); actions.appendChild(clear); actions.appendChild(fb);
    p.appendChild(actions);
    return p;
  }

  function mountHeaderButton() {
    const heading = document.getElementById('catalogo-heading');
    const host = heading ? heading.parentNode : document.getElementById('catalogo');
    if (!host) return;
    const wrap = el('div', 'plan-bar');
    const btn = el('button', 'seg-toggle plan-count', 'Mi selección (0)');
    btn.type = 'button';
    btn.setAttribute('aria-expanded', 'false');
    btn.setAttribute('aria-controls', 'planPanel');
    countBtns.push(btn);
    panel = buildPanel();
    btn.addEventListener('click', () => {
      const open = panel.hidden;
      panel.hidden = !open;
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) renderPanel();
    });
    wrap.appendChild(btn);
    wrap.appendChild(panel);
    if (heading && heading.nextSibling) host.insertBefore(wrap, heading.nextSibling);
    else host.appendChild(wrap);
  }

  function mountModalButton() {
    const modal = document.getElementById('fichaModal');
    if (!modal || modal.querySelector('.plan-add-btn')) return;
    addBtn = el('button', 'seg-btn plan-add-btn', 'Guardar en mi selección');
    addBtn.type = 'button';
    addBtn.addEventListener('click', toggleCurrent);
    modal.appendChild(addBtn);
  }

  function wrapOpenFicha() {
    if (typeof window.openFicha !== 'function' || window.__planWrapped) return false;
    const original = window.openFicha;
    window.openFicha = function(card) {
      const r = original.apply(this, arguments);
      try { currentIdx = idxFromCard(card); refresh(); } catch (e) {}
      return r;
    };
    window.__planWrapped = true;
    return true;
  }

  function init() {
    mountHeaderButton();
    mountModalButton();
    // openFicha y CATALOGO los define app.min.js (defer): reintentar.
    let tries = 0;
    const tick = () => {
      const ok = wrapOpenFicha();
      if (cat().length) readUrl();
      refresh();
      if ((!ok || !cat().length) && tries++ < 60) setTimeout(tick, 100);
    };
    tick();
    window.addEventListener('popstate', () => { readUrl(); refresh(); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
