/* ══════════════════════════════════════════════════════════════
   vinetas-generator.js — Generador didáctico de viñetas
   Vanilla JS, sin dependencias. Compatible con CSP estricta.
   ══════════════════════════════════════════════════════════════ */
(function() {
  'use strict';

  // Composiciones disponibles
  const LAYOUTS = {
    '1':  { cols: '1fr',            rows: '1fr',       cells: ['1/1/2/2'] },
    '2h': { cols: '1fr 1fr',        rows: '1fr',       cells: ['1/1/2/2', '1/2/2/3'] },
    '2v': { cols: '1fr',            rows: '1fr 1fr',   cells: ['1/1/2/2', '2/1/3/2'] },
    '3a': { cols: '2fr 1fr',        rows: '1fr 1fr',   cells: ['1/1/3/2', '1/2/2/3', '2/2/3/3'] },
    '4':  { cols: '1fr 1fr',        rows: '1fr 1fr',   cells: ['1/1/2/2', '1/2/2/3', '2/1/3/2', '2/2/3/3'] },
    '6':  { cols: '1fr 1fr 1fr',    rows: '1fr 1fr',
            cells: ['1/1/2/2', '1/2/2/3', '1/3/2/4', '2/1/3/2', '2/2/3/3', '2/3/3/4'] },
  };
  // Para los thumbnails del selector de composición
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
    'Hoy aprenderemos\\nalgo nuevo.',
    'No entiendo\\nesta viñeta.',
    '¿Qué pasa\\nentre dos paneles?',
    'El silencio\\ntambién narra.',
  ];

  const STYLE_CYCLE = ['light', 'dark', 'shu', 'halftone'];
  // Algunas viñetas pueden además llevar líneas cinéticas
  function styleClasses(style, useLines) {
    const cls = [];
    if (style === 'dark') cls.push('dark');
    if (style === 'shu') cls.push('shu');
    if (style === 'halftone') cls.push('halftone');
    if (useLines) cls.push('speedlines');
    return cls.join(' ');
  }

  // Estado actual
  const state = {
    layout: '4',
    bubble: 'Hoy aprenderemos\\nalgo nuevo.',
    onomato: '¡SHIIING!',
    panelStyles: ['light', 'dark', 'light', 'shu'],
    panelLines:  [false, false, false, true],
  };

  function init() {
    const wrap = document.getElementById('vinetasGenerator');
    if (!wrap) return;
    wrap.innerHTML = `
      <div class="gen-controls">
        <h4>Generador de viñetas</h4>
        <p class="gen-lede">Compón una página manga en directo. Útil para enseñar la gramática del <em>koma</em> (viñeta), del <em>fukidashi</em> (bocadillo) y del <em>ma</em> (espacio entre viñetas) que define el glosario de este recurso.</p>

        <div class="gen-section">
          <div class="gen-section-label">Composición</div>
          <div class="gen-layout-grid" id="genLayoutGrid"></div>
        </div>

        <div class="gen-section">
          <div class="gen-section-label">Bocadillo (\\n para salto de línea)</div>
          <textarea class="gen-input" id="genBubble" rows="2"></textarea>
          <div class="gen-presets" id="genBubblePresets"></div>
        </div>

        <div class="gen-section">
          <div class="gen-section-label">Onomatopeya</div>
          <input class="gen-input display" id="genOnomato" />
          <div class="gen-presets" id="genOnomatoPresets"></div>
        </div>

        <div class="gen-tip">
          Pulsa cada viñeta para alternar su estilo: papel, tinta, bermellón, trama. Doble clic activa o desactiva las líneas cinéticas.
        </div>
      </div>
      <div>
        <div class="gen-stage" id="genStage" role="figure" aria-label="Página de manga compuesta por el usuario"></div>
        <div class="gen-foot">
          <span>Páginas tradicionales: lectura de <strong>derecha a izquierda</strong>, de arriba hacia abajo.</span>
          <span>Sin guardar · Recargar la página reinicia la composición.</span>
        </div>
      </div>
    `;
    renderLayoutPicker();
    renderPresets();
    bindInputs();
    render();
  }

  function renderLayoutPicker() {
    const grid = document.getElementById('genLayoutGrid');
    grid.innerHTML = '';
    Object.keys(LAYOUTS).forEach(id => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'gen-layout-btn' + (state.layout === id ? ' active' : '');
      btn.setAttribute('aria-label', 'Composición ' + id);
      btn.style.gridTemplateColumns = LAYOUTS[id].cols;
      btn.style.gridTemplateRows = LAYOUTS[id].rows;
      LAYOUT_PREVIEWS[id].forEach(c => {
        const cell = document.createElement('span');
        cell.style.gridArea = c.s;
        btn.appendChild(cell);
      });
      btn.addEventListener('click', () => {
        state.layout = id;
        // Ajustar arrays de estilo al nuevo nº de viñetas
        const n = LAYOUTS[id].cells.length;
        while (state.panelStyles.length < n) state.panelStyles.push('light');
        while (state.panelLines.length < n) state.panelLines.push(false);
        state.panelStyles = state.panelStyles.slice(0, n);
        state.panelLines = state.panelLines.slice(0, n);
        renderLayoutPicker();
        render();
      });
      grid.appendChild(btn);
    });
  }

  function renderPresets() {
    const b = document.getElementById('genBubblePresets');
    b.innerHTML = '';
    PRESETS_BUBBLE.forEach(t => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.textContent = t.replace(/\\n/g, ' / ');
      btn.title = t.replace(/\\n/g, '\n');
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
    bubble.addEventListener('input', e => {
      state.bubble = e.target.value;
      render();
    });
    const ono = document.getElementById('genOnomato');
    ono.value = state.onomato;
    ono.addEventListener('input', e => {
      state.onomato = e.target.value;
      render();
    });
  }

  function render() {
    const stage = document.getElementById('genStage');
    if (!stage) return;
    const cfg = LAYOUTS[state.layout];
    stage.style.gridTemplateColumns = cfg.cols;
    stage.style.gridTemplateRows = cfg.rows;
    stage.innerHTML = '';

    cfg.cells.forEach((area, i) => {
      const panel = document.createElement('div');
      const style = state.panelStyles[i] || 'light';
      const lines = !!state.panelLines[i];
      panel.className = 'gen-panel ' + styleClasses(style, lines);
      panel.style.gridArea = area;
      panel.setAttribute('role', 'img');
      panel.setAttribute('aria-label', 'Viñeta ' + (i + 1));

      // Caption pequeño con número
      const cap = document.createElement('div');
      cap.className = 'gen-pcap';
      cap.textContent = String(i + 1).padStart(2, '0');
      panel.appendChild(cap);

      // Primera viñeta: bocadillo. Última: onomatopeya.
      if (i === 0 && state.bubble.trim()) {
        const b = document.createElement('div');
        b.className = 'gen-bubble';
        state.bubble.split('\\n').forEach(line => {
          const ln = document.createElement('div');
          ln.textContent = line;
          b.appendChild(ln);
        });
        panel.appendChild(b);
      }
      if ((i === cfg.cells.length - 1 || cfg.cells.length === 1) && state.onomato.trim()) {
        const o = document.createElement('div');
        o.className = 'gen-onomato';
        o.textContent = state.onomato;
        panel.appendChild(o);
      }

      // Click: cicla estilo. Doble clic: alterna líneas.
      panel.addEventListener('click', () => {
        const cur = state.panelStyles[i] || 'light';
        const idx = STYLE_CYCLE.indexOf(cur);
        state.panelStyles[i] = STYLE_CYCLE[(idx + 1) % STYLE_CYCLE.length];
        render();
      });
      panel.addEventListener('dblclick', e => {
        e.preventDefault();
        state.panelLines[i] = !state.panelLines[i];
        render();
      });

      stage.appendChild(panel);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
