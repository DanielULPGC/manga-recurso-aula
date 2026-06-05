/* ══════════════════════════════════════════════════════════════
   vinetas-generator.js — Generador didáctico de viñetas
   Vanilla JS, sin dependencias. Compatible con CSP estricta.
   v5.11 — Auditoría: accesible por teclado (WCAG 2.1.1), sin
   ambigüedad clic/doble clic, sentido de lectura RTL coherente,
   saltos de línea reales, colocación libre de bocadillo/onomatopeya.
   ══════════════════════════════════════════════════════════════ */
(function() {
  'use strict';

  // Composiciones disponibles. cells: "rowStart/colStart/rowEnd/colEnd".
  const LAYOUTS = {
    '1':  { cols: '1fr',            rows: '1fr',       cells: ['1/1/2/2'] },
    '2h': { cols: '1fr 1fr',        rows: '1fr',       cells: ['1/1/2/2', '1/2/2/3'] },
    '2v': { cols: '1fr',            rows: '1fr 1fr',   cells: ['1/1/2/2', '2/1/3/2'] },
    '3a': { cols: '2fr 1fr',        rows: '1fr 1fr',   cells: ['1/1/3/2', '1/2/2/3', '2/2/3/3'] },
    '4':  { cols: '1fr 1fr',        rows: '1fr 1fr',   cells: ['1/1/2/2', '1/2/2/3', '2/1/3/2', '2/2/3/3'] },
    '6':  { cols: '1fr 1fr 1fr',    rows: '1fr 1fr',
            cells: ['1/1/2/2', '1/2/2/3', '1/3/2/4', '2/1/3/2', '2/2/3/3', '2/3/3/4'] },
  };
  const LAYOUT_PREVIEWS = {
    '1':  [{ s: '1/1/3/3' }],
    '2h': [{ s: '1/1/3/2' }, { s: '1/2/3/3' }],
    '2v': [{ s: '1/1/2/3' }, { s: '2/1/3/3' }],
    '3a': [{ s: '1/1/3/2' }, { s: '1/2/2/3' }, { s: '2/2/3/3' }],
    '4':  [{ s: '1/1/2/2' }, { s: '1/2/2/3' }, { s: '2/1/3/2' }, { s: '2/2/3/3' }],
    '6':  [{ s: '1/1/2/2' }, { s: '1/2/2/3' }, { s: '1/3/2/4' },
           { s: '2/1/3/2' }, { s: '2/2/3/3' }, { s: '2/3/3/4' }],
  };

  const PRESETS_ONOMATO = ['¡PUM!', '¡SHIIING!', '¡BAM!', 'ドキドキ', 'シーン', 'ゴゴゴ', '¡ZAS!', '…'];
  const PRESETS_BUBBLE = [
    'Hoy aprenderemos\nalgo nuevo.',
    'No entiendo\nesta viñeta.',
    '¿Qué pasa\nentre dos paneles?',
    'El silencio\ntambién narra.',
  ];

  const STYLE_CYCLE  = ['light', 'dark', 'shu', 'halftone'];
  const STYLE_NOMBRE = { light: 'papel', dark: 'tinta', shu: 'bermellón', halftone: 'trama' };

  function styleClasses(style, useLines) {
    const cls = [];
    if (style === 'dark') cls.push('dark');
    if (style === 'shu') cls.push('shu');
    if (style === 'halftone') cls.push('halftone');
    if (useLines) cls.push('speedlines');
    return cls.join(' ');
  }

  // Orden de lectura: por filas (arriba→abajo); dentro de cada fila,
  // derecha→izquierda si rtl, izquierda→derecha si no.
  function readingOrder(layoutId, rtl) {
    const cells = LAYOUTS[layoutId].cells.map((area, i) => {
      const p = area.split('/').map(Number); // [rowStart, colStart, rowEnd, colEnd]
      return { i, r: p[0], c: p[1] };
    });
    cells.sort((a, b) => (a.r - b.r) || (rtl ? b.c - a.c : a.c - b.c));
    return cells.map(o => o.i); // order[k] = índice de celda original k-ésima en lectura
  }

  const state = {
    layout: '4',
    rtl: true,                 // el manga tradicional se lee de derecha a izquierda
    bubble: 'Hoy aprenderemos\nalgo nuevo.',
    bubblePos: 0,              // posición en ORDEN DE LECTURA (0 = primera viñeta leída)
    onomato: '¡SHIIING!',
    onomatoPos: null,          // null = última viñeta leída
    panelStyles: ['light', 'dark', 'light', 'shu'],
    panelLines:  [false, false, false, true],
    focusCell: null,           // índice de celda a re-enfocar tras render (teclado)
  };

  function nCells() { return LAYOUTS[state.layout].cells.length; }

  function init() {
    const wrap = document.getElementById('vinetasGenerator');
    if (!wrap) return;
    wrap.innerHTML = `
      <div class="gen-controls">
        <h4>Generador de viñetas</h4>
        <p class="gen-lede">Compón una página manga en directo. Útil para enseñar la gramática del <em>koma</em> (viñeta), del <em>fukidashi</em> (bocadillo) y del <em>ma</em> (espacio entre viñetas) que define el glosario de este recurso.</p>

        <div class="gen-section">
          <div class="gen-section-label">Composición</div>
          <div class="gen-layout-grid" id="genLayoutGrid" role="group" aria-label="Elegir composición de la página"></div>
        </div>

        <div class="gen-section">
          <div class="gen-section-label">Sentido de lectura</div>
          <div class="gen-presets" id="genRtl"></div>
        </div>

        <div class="gen-section">
          <label class="gen-section-label" for="genBubble">Bocadillo (pulsa Intro para salto de línea)</label>
          <textarea class="gen-input" id="genBubble" rows="2"></textarea>
          <div class="gen-presets" id="genBubblePresets"></div>
          <div class="gen-section-label" id="genBubblePosLabel">Colocar el bocadillo en la viñeta</div>
          <div class="gen-presets" id="genBubblePos" role="group" aria-labelledby="genBubblePosLabel"></div>
        </div>

        <div class="gen-section">
          <label class="gen-section-label" for="genOnomato">Onomatopeya</label>
          <input class="gen-input display" id="genOnomato" />
          <div class="gen-presets" id="genOnomatoPresets"></div>
          <div class="gen-section-label" id="genOnomatoPosLabel">Colocar la onomatopeya en la viñeta</div>
          <div class="gen-presets" id="genOnomatoPos" role="group" aria-labelledby="genOnomatoPosLabel"></div>
        </div>

        <div class="gen-section">
          <div class="gen-section-label">Líneas cinéticas por viñeta</div>
          <div class="gen-presets" id="genLines" role="group" aria-label="Activar o desactivar líneas cinéticas en cada viñeta"></div>
        </div>

        <div class="gen-tip">
          Pulsa una viñeta (o usa Intro/Espacio con el teclado) para alternar su estilo: papel, tinta, bermellón, trama. Las líneas cinéticas y la posición del texto se controlan con los botones de arriba.
        </div>

        <div class="gen-section">
          <div class="gen-presets">
            <button type="button" id="genReset">Reiniciar composición</button>
          </div>
        </div>
      </div>
      <div>
        <div class="gen-stage" id="genStage" role="figure" aria-label="Página de manga compuesta por el usuario"></div>
        <div class="gen-foot">
          <span id="genFootDir"></span>
          <span>Sin guardar · Reiniciar o recargar la página restablece la composición.</span>
        </div>
      </div>
    `;
    renderLayoutPicker();
    renderRtlToggle();
    renderPresets();
    bindInputs();
    document.getElementById('genReset').addEventListener('click', resetState);
    render();
  }

  function resetState() {
    state.layout = '4';
    state.rtl = true;
    state.bubble = 'Hoy aprenderemos\nalgo nuevo.';
    state.bubblePos = 0;
    state.onomato = '¡SHIIING!';
    state.onomatoPos = null;
    state.panelStyles = ['light', 'dark', 'light', 'shu'];
    state.panelLines  = [false, false, false, true];
    state.focusCell = null;
    document.getElementById('genBubble').value = state.bubble;
    document.getElementById('genOnomato').value = state.onomato;
    renderLayoutPicker();
    renderRtlToggle();
    render();
  }

  function renderLayoutPicker() {
    const grid = document.getElementById('genLayoutGrid');
    grid.innerHTML = '';
    Object.keys(LAYOUTS).forEach(id => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'gen-layout-btn' + (state.layout === id ? ' active' : '');
      btn.setAttribute('aria-label', 'Composición de ' + LAYOUTS[id].cells.length + ' viñeta(s)');
      btn.setAttribute('aria-pressed', state.layout === id ? 'true' : 'false');
      btn.style.gridTemplateColumns = LAYOUTS[id].cols;
      btn.style.gridTemplateRows = LAYOUTS[id].rows;
      LAYOUT_PREVIEWS[id].forEach(c => {
        const cell = document.createElement('span');
        cell.style.gridArea = c.s;
        btn.appendChild(cell);
      });
      btn.addEventListener('click', () => {
        state.layout = id;
        const n = LAYOUTS[id].cells.length;
        while (state.panelStyles.length < n) state.panelStyles.push('light');
        while (state.panelLines.length < n) state.panelLines.push(false);
        state.panelStyles = state.panelStyles.slice(0, n);
        state.panelLines = state.panelLines.slice(0, n);
        if (state.bubblePos >= n) state.bubblePos = 0;
        if (state.onomatoPos !== null && state.onomatoPos >= n) state.onomatoPos = null;
        state.focusCell = null;
        renderLayoutPicker();
        render();
      });
      grid.appendChild(btn);
    });
  }

  function renderRtlToggle() {
    const box = document.getElementById('genRtl');
    box.innerHTML = '';
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.setAttribute('aria-pressed', state.rtl ? 'true' : 'false');
    btn.textContent = state.rtl ? 'Derecha a izquierda (manga)' : 'Izquierda a derecha';
    btn.addEventListener('click', () => {
      state.rtl = !state.rtl;
      state.focusCell = null;
      renderRtlToggle();
      render();
    });
    box.appendChild(btn);
  }

  // Botones de posición 1..n (en orden de lectura). cur = posición seleccionada.
  function renderPosButtons(containerId, cur, onPick, allowLast) {
    const box = document.getElementById(containerId);
    box.innerHTML = '';
    const n = nCells();
    for (let k = 0; k < n; k++) {
      const isLast = (k === n - 1);
      const selected = (cur === k) || (allowLast && cur === null && isLast);
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = String(k + 1);
      btn.setAttribute('aria-label', 'Viñeta ' + (k + 1) + ' (orden de lectura)');
      btn.setAttribute('aria-pressed', selected ? 'true' : 'false');
      if (selected) btn.classList.add('active');
      btn.addEventListener('click', () => { onPick(k); });
      box.appendChild(btn);
    }
  }

  function renderPresets() {
    const b = document.getElementById('genBubblePresets');
    b.innerHTML = '';
    PRESETS_BUBBLE.forEach(t => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = t.replace(/\n/g, ' / ');
      btn.title = t;
      btn.addEventListener('click', () => {
        state.bubble = t;
        document.getElementById('genBubble').value = t;
        render();
      });
      b.appendChild(btn);
    });
    const o = document.getElementById('genOnomatoPresets');
    o.innerHTML = '';
    PRESETS_ONOMATO.forEach(t => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = t;
      btn.addEventListener('click', () => {
        state.onomato = t;
        document.getElementById('genOnomato').value = t;
        render();
      });
      o.appendChild(btn);
    });
  }

  function bindInputs() {
    const bubble = document.getElementById('genBubble');
    bubble.value = state.bubble;
    bubble.addEventListener('input', e => { state.bubble = e.target.value; render(); });
    const ono = document.getElementById('genOnomato');
    ono.value = state.onomato;
    ono.addEventListener('input', e => { state.onomato = e.target.value; render(); });
  }

  function render() {
    const stage = document.getElementById('genStage');
    if (!stage) return;
    const cfg = LAYOUTS[state.layout];
    const order = readingOrder(state.layout, state.rtl); // celdas originales en orden de lectura
    const posOf = [];                                    // celda original -> posición de lectura (0-based)
    order.forEach((cellIdx, k) => { posOf[cellIdx] = k; });

    const bubbleCell  = order[Math.min(state.bubblePos, order.length - 1)];
    const onoPos      = (state.onomatoPos === null) ? order.length - 1 : state.onomatoPos;
    const onomatoCell = order[Math.min(onoPos, order.length - 1)];

    // Controles dependientes del nº de viñetas / sentido
    renderPosButtons('genBubblePos', state.bubblePos, k => { state.bubblePos = k; render(); }, false);
    renderPosButtons('genOnomatoPos', state.onomatoPos, k => { state.onomatoPos = k; render(); }, true);
    renderLinesButtons(order);

    document.getElementById('genFootDir').textContent = state.rtl
      ? 'Lectura tradicional: de derecha a izquierda, de arriba hacia abajo.'
      : 'Lectura occidental: de izquierda a derecha, de arriba hacia abajo.';

    stage.style.gridTemplateColumns = cfg.cols;
    stage.style.gridTemplateRows = cfg.rows;
    stage.innerHTML = '';

    cfg.cells.forEach((area, i) => {
      const style = state.panelStyles[i] || 'light';
      const lines = !!state.panelLines[i];
      const num = posOf[i] + 1;

      const panel = document.createElement('button');
      panel.type = 'button';
      panel.className = 'gen-panel ' + styleClasses(style, lines);
      panel.style.gridArea = area;
      panel.setAttribute('aria-label',
        'Viñeta ' + num + ', estilo ' + STYLE_NOMBRE[style] + '. Activar para cambiar de estilo.');

      const cap = document.createElement('div');
      cap.className = 'gen-pcap';
      cap.textContent = String(num).padStart(2, '0');
      panel.appendChild(cap);

      if (i === bubbleCell && state.bubble.trim()) {
        const b = document.createElement('div');
        b.className = 'gen-bubble';
        state.bubble.split('\n').forEach(line => {
          const ln = document.createElement('div');
          ln.textContent = line;
          b.appendChild(ln);
        });
        panel.appendChild(b);
      }
      if (i === onomatoCell && state.onomato.trim()) {
        const o = document.createElement('div');
        o.className = 'gen-onomato';
        o.textContent = state.onomato;
        panel.appendChild(o);
      }

      // Activar (clic / Intro / Espacio, nativo en <button>) cicla el estilo.
      panel.addEventListener('click', () => {
        const cur = state.panelStyles[i] || 'light';
        const idx = STYLE_CYCLE.indexOf(cur);
        state.panelStyles[i] = STYLE_CYCLE[(idx + 1) % STYLE_CYCLE.length];
        state.focusCell = i; // conservar el foco de teclado tras el re-render
        render();
      });

      stage.appendChild(panel);

      if (state.focusCell === i) {
        panel.focus();
        state.focusCell = null;
      }
    });
  }

  function renderLinesButtons(order) {
    const box = document.getElementById('genLines');
    box.innerHTML = '';
    order.forEach((cellIdx, k) => {
      const on = !!state.panelLines[cellIdx];
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = String(k + 1);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
      btn.setAttribute('aria-label',
        'Líneas cinéticas en la viñeta ' + (k + 1) + ': ' + (on ? 'activadas' : 'desactivadas'));
      if (on) btn.classList.add('active');
      btn.addEventListener('click', () => {
        state.panelLines[cellIdx] = !state.panelLines[cellIdx];
        render();
      });
      box.appendChild(btn);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
