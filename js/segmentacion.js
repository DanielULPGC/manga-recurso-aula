/* ══════════════════════════════════════════════════════════════
   segmentacion.js — Segmentación y señalización
   Fundamento: Mayer, principios de segmentación (contenido en
   segmentos a ritmo del usuario) y señalización (guiar la atención
   a lo esencial). Cambridge, Multimedia Learning,
   DOI: 10.1017/CBO9780511811678.013
   Vanilla JS, sin dependencias. CSP estricta. Mejora progresiva:
   si el JS no carga, el contenido sigue visible y completo.
   ══════════════════════════════════════════════════════════════ */
(function() {
  'use strict';

  function el(tag, cls, html) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  /* ─── A) Situaciones de aprendizaje: paso a paso ─────────────── */
  function stepSituacion(body) {
    const blocks = Array.from(body.querySelectorAll(':scope > .sa-block'));
    if (blocks.length < 2) return;

    let idx = 0;
    let stepped = true;

    blocks.forEach(b => b.classList.add('seg-block'));

    // Título de cada paso a partir del <h4> del bloque (señalización)
    const titles = blocks.map(b => {
      const h = b.querySelector('h4');
      return h ? h.textContent.trim() : 'Paso';
    });

    const bar = el('div', 'seg-bar');
    bar.setAttribute('role', 'group');
    bar.setAttribute('aria-label', 'Navegación por pasos de la situación de aprendizaje');

    const prog = el('span', 'seg-progress');
    const title = el('span', 'seg-steptitle');
    const prev = el('button', 'seg-btn', 'Anterior');
    const next = el('button', 'seg-btn', 'Siguiente');
    const all = el('button', 'seg-toggle', 'Ver todo');
    prev.type = next.type = all.type = 'button';

    const live = el('span', 'sr-only');
    live.setAttribute('aria-live', 'polite');

    const nav = el('div', 'seg-nav');
    nav.appendChild(prev);
    nav.appendChild(next);
    const head = el('div', 'seg-head');
    head.appendChild(prog);
    head.appendChild(title);
    bar.appendChild(head);
    bar.appendChild(nav);
    bar.appendChild(all);
    bar.appendChild(live);

    body.insertBefore(bar, blocks[0]);

    function paint() {
      if (stepped) {
        blocks.forEach((b, i) => {
          b.hidden = (i !== idx);
          b.classList.toggle('seg-active', i === idx);
        });
        prog.textContent = 'Paso ' + (idx + 1) + ' de ' + blocks.length;
        title.textContent = titles[idx];
        prev.disabled = (idx === 0);
        next.disabled = (idx === blocks.length - 1);
        nav.hidden = false;
        prog.hidden = false;
        title.hidden = false;
        all.textContent = 'Ver todo';
        live.textContent = prog.textContent + ': ' + titles[idx];
      } else {
        blocks.forEach(b => { b.hidden = false; b.classList.remove('seg-active'); });
        nav.hidden = true;
        prog.hidden = true;
        title.hidden = true;
        all.textContent = 'Ver por pasos';
      }
    }

    function go(n) {
      idx = Math.max(0, Math.min(blocks.length - 1, n));
      paint();
      blocks[idx].setAttribute('tabindex', '-1');
      blocks[idx].focus({ preventScroll: false });
    }

    prev.addEventListener('click', () => go(idx - 1));
    next.addEventListener('click', () => go(idx + 1));
    all.addEventListener('click', () => {
      stepped = !stepped;
      paint();
      if (stepped) { idx = 0; paint(); }
    });

    paint();
  }

  function initSituaciones() {
    document.querySelectorAll('#situaciones .sa-panel .sa-body').forEach(stepSituacion);
  }

  /* ─── B) Línea del tiempo: modo foco (señalización) ──────────── */
  function initTimeline() {
    const tl = document.getElementById('tl');
    if (!tl) return;
    const cols = Array.from(tl.querySelectorAll(':scope > .col'));
    if (cols.length < 2) return;

    let idx = 0;
    let focus = false;

    const nameOf = c => {
      const n = c.querySelector('.era-name');
      return n ? n.textContent.trim() : 'Era';
    };
    const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const bar = el('div', 'seg-tlbar');
    bar.setAttribute('role', 'group');
    bar.setAttribute('aria-label', 'Modo foco de la línea del tiempo');
    const toggle = el('button', 'seg-toggle', 'Modo foco');
    const prev = el('button', 'seg-btn', 'Era anterior');
    const next = el('button', 'seg-btn', 'Era siguiente');
    const label = el('span', 'seg-tllabel');
    toggle.type = prev.type = next.type = 'button';
    toggle.setAttribute('aria-pressed', 'false');
    const live = el('span', 'sr-only');
    live.setAttribute('aria-live', 'polite');
    bar.appendChild(toggle);
    bar.appendChild(prev);
    bar.appendChild(next);
    bar.appendChild(label);
    bar.appendChild(live);
    tl.parentNode.insertBefore(bar, tl);

    function paint() {
      tl.classList.toggle('tl-focus', focus);
      cols.forEach((c, i) => c.classList.toggle('tl-active', focus && i === idx));
      prev.hidden = next.hidden = label.hidden = !focus;
      toggle.setAttribute('aria-pressed', focus ? 'true' : 'false');
      toggle.textContent = focus ? 'Ver todo el eje' : 'Modo foco';
      if (focus) {
        prev.disabled = (idx === 0);
        next.disabled = (idx === cols.length - 1);
        label.textContent = nameOf(cols[idx]);
        live.textContent = 'Era en foco: ' + nameOf(cols[idx]);
        cols[idx].scrollIntoView({ inline: 'center', block: 'nearest', behavior: reduce ? 'auto' : 'smooth' });
      }
    }

    function go(n) {
      idx = Math.max(0, Math.min(cols.length - 1, n));
      paint();
    }

    toggle.addEventListener('click', () => { focus = !focus; if (focus) idx = 0; paint(); });
    prev.addEventListener('click', () => go(idx - 1));
    next.addEventListener('click', () => go(idx + 1));

    paint();
  }

  function init() {
    initSituaciones();
    initTimeline();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
