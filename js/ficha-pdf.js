/* ══════════════════════════════════════════════════════════════════
   ficha-pdf.js — Generador de ficha PDF por título
   v5.10 · 2026-05

   Idea 4 de mejoras evolutivas. Añade a cada tarjeta del catálogo un
   botón «↓ Ficha PDF» que abre el diálogo de impresión del navegador
   con UNA ficha A4 formateada para el título seleccionado. El usuario
   elige «Guardar como PDF» en el destino.

   Por qué impresión nativa (no jsPDF):
   1. Cero dependencias externas — respeta la CSP estricta.
   2. El navegador genera mejor texto (selecciónable, kerning, hyphens).
   3. El usuario controla el destino: PDF, papel, vista previa.
   4. Cero KB JS adicional para una librería de PDF.

   Estrategia:
   - Inyectar botón via MutationObserver (patrón usado por Quiz / Exprés).
   - Al click: poblar el template oculto #fichaPDFTemplate con datos del
     título, añadir body.printing-ficha-pdf, window.print().
   - El bloque @media print en editorial-extras.css oculta todo lo demás
     y reformatea el template a A4.
   ══════════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  const TEMPLATE_ID = 'fichaPDFTemplate';
  const BODY_CLASS  = 'printing-ficha-pdf';

  // ── Inserta el template oculto una sola vez ─────────────────
  function ensureTemplate() {
    let tpl = document.getElementById(TEMPLATE_ID);
    if (tpl) return tpl;
    tpl = document.createElement('aside');
    tpl.id = TEMPLATE_ID;
    tpl.setAttribute('aria-hidden', 'true');
    tpl.hidden = true;          // oculto por defecto en pantalla
    tpl.innerHTML = `
      <header class="fpdf-header">
        <div class="fpdf-eyebrow">Ficha pedagógica · Aula de Cómic · Biblioteca Campus del Obelisco · ULPGC</div>
        <h1 class="fpdf-title"></h1>
        <p class="fpdf-author"></p>
        <p class="fpdf-period"></p>
      </header>
      <section class="fpdf-section fpdf-badges">
        <div class="fpdf-badges-row"></div>
        <div class="fpdf-niveles-row"></div>
        <div class="fpdf-ods-row"></div>
        <div class="fpdf-sensible-row"></div>
      </section>
      <section class="fpdf-section">
        <h2 class="fpdf-h2">Descripción pedagógica</h2>
        <p class="fpdf-desc"></p>
      </section>
      <section class="fpdf-section fpdf-suggest">
        <h2 class="fpdf-h2">Sugerencias de aula</h2>
        <ul class="fpdf-suggest-list"></ul>
      </section>
      <footer class="fpdf-footer">
        <div class="fpdf-foot-l">
          <div class="fpdf-foot-eyebrow">Localización en el fondo</div>
          <a class="fpdf-opac" href="#" target="_blank" rel="noopener noreferrer"></a>
        </div>
        <div class="fpdf-foot-r">
          <div class="fpdf-foot-eyebrow">Generado</div>
          <span class="fpdf-date"></span>
          <span class="fpdf-version">El manga como recurso didáctico · v5.10 · CC BY-NC 4.0</span>
        </div>
      </footer>
    `;
    document.body.appendChild(tpl);
    return tpl;
  }

  // ── Mapeo uso → sugerencias de aula (1 línea cada una) ──────
  const SUGERENCIAS_POR_USO = {
    historia: [
      'Contraste con fuentes históricas: contrastar lo narrado con un manual o documento de la época.',
      'Línea del tiempo en clase: situar el título en su era con el eje cronológico del recurso.',
      'Investigación complementaria: pedir al alumnado que verifique un dato concreto.',
    ],
    filosofia: [
      'Texto detonador para un debate ético en pequeño grupo.',
      'Análisis de dilema: identificar el conflicto moral central y los argumentos en juego.',
      'Comparativa con un texto filosófico clásico breve del mismo problema.',
    ],
    emocional: [
      'Identificación de emoción: marcar viñetas que expresan un estado emocional.',
      'Diario de lector: una entrada breve por sesión sobre qué ha movilizado la lectura.',
      'Coloquio en círculo de 20 min al cierre de la lectura.',
    ],
    lenguas: [
      'Vocabulario contextual: glosario de términos nuevos del propio título.',
      'Lectura comparada (RTL vs LTR) — observar la diferencia de ritmo.',
      'Traducción comentada de una página: comparar versiones si están disponibles.',
    ],
    ciencia: [
      'Verificación científica: identificar lo plausible vs lo ficticio.',
      'Conexión con currículo STEM del nivel correspondiente.',
      'Investigación corta sobre un concepto científico que aparezca.',
    ],
    visual: [
      'Anatomía de la página: aplicar la lámina del manual docente.',
      'Composición: pedir que recomponer una página y discutir efectos.',
      'Vocabulario gráfico: viñeta, calle, líneas cinéticas, onomatopeya.',
    ],
    genero: [
      'Mapa de personajes: roles y agencia narrativa por género.',
      'Análisis de mirada: punto de vista, sujeto y objeto en la página.',
      'Comparativa con un título del mismo período y otro enfoque.',
    ],
    inclusion: [
      'Identificar la barrera principal que el título visibiliza.',
      'Vincular con la realidad del entorno escolar o comunitario.',
      'Producción propia: un proyecto que aborde la misma barrera.',
    ],
  };

  function pickSuggestions(t) {
    const uso = (t.uso || '').split(' ')[0]; // primer uso si hay varios
    return SUGERENCIAS_POR_USO[uso] || [
      'Lectura guiada con protocolo en tres fases (antes / durante / después).',
      'Conexión explícita con un objetivo curricular del nivel.',
      'Cierre con una producción breve del alumnado.',
    ];
  }

  // ── Render del template con datos del título ────────────────
  function populate(t) {
    const tpl = ensureTemplate();

    // textContent en todo lo que viene del catálogo (XSS-safe)
    tpl.querySelector('.fpdf-title').textContent = t.titulo || '(Sin título)';
    tpl.querySelector('.fpdf-author').textContent = t.autor || '';
    tpl.querySelector('.fpdf-period').textContent = t.periodo || '';
    tpl.querySelector('.fpdf-desc').textContent = t.tip || 'Sin descripción pedagógica.';

    // Badges de uso
    const badgesRow = tpl.querySelector('.fpdf-badges-row');
    badgesRow.innerHTML = '';
    (t.badges || []).forEach(b => {
      const s = document.createElement('span');
      s.className = 'fpdf-badge';
      s.style.background = t.color || '#1a1410';
      s.textContent = b;
      badgesRow.appendChild(s);
    });

    // Niveles
    const nivelesRow = tpl.querySelector('.fpdf-niveles-row');
    nivelesRow.innerHTML = '';
    (t.niveles || []).forEach(n => {
      const s = document.createElement('span');
      s.className = 'fpdf-niv';
      s.textContent = n;
      nivelesRow.appendChild(s);
    });

    // ODS
    const odsRow = tpl.querySelector('.fpdf-ods-row');
    odsRow.innerHTML = '';
    if (Array.isArray(t.ods) && t.ods.length) {
      const label = document.createElement('span');
      label.className = 'fpdf-ods-label';
      label.textContent = 'ODS:';
      odsRow.appendChild(label);
      const ODS_COLORS = window.ODS_COLORES || {};
      t.ods.forEach(n => {
        const s = document.createElement('span');
        s.className = 'fpdf-ods';
        s.style.background = ODS_COLORS[n] || '#888';
        s.textContent = n;
        odsRow.appendChild(s);
      });
    }

    // Aviso de sensibilidad (si aplica)
    const sensRow = tpl.querySelector('.fpdf-sensible-row');
    sensRow.innerHTML = '';
    if (t.sensitive) {
      const s = document.createElement('span');
      s.className = 'fpdf-sensible';
      s.textContent = '⚠ ' + (t.sens_label || 'Contenido sensible — leer en aula con mediación');
      sensRow.appendChild(s);
    }

    // Sugerencias de aula
    const ul = tpl.querySelector('.fpdf-suggest-list');
    ul.innerHTML = '';
    pickSuggestions(t).forEach(s => {
      const li = document.createElement('li');
      li.textContent = s;
      ul.appendChild(li);
    });

    // OPAC
    const opac = tpl.querySelector('.fpdf-opac');
    if (t.opac) {
      opac.href = t.opac;
      opac.textContent = 'OPAC ULPGC — consulta y solicitud de préstamo';
    } else {
      opac.removeAttribute('href');
      opac.textContent = 'Consultar disponibilidad en la Biblioteca Campus del Obelisco.';
    }

    // Fecha de generación
    tpl.querySelector('.fpdf-date').textContent = new Date().toLocaleDateString('es-ES', {
      day: '2-digit', month: 'long', year: 'numeric',
    });
  }

  // ── Lanzar impresión ────────────────────────────────────────
  function print(t) {
    populate(t);
    const tpl = ensureTemplate();
    tpl.hidden = false;
    document.body.classList.add(BODY_CLASS);

    // Restaurar después de imprimir (cubre cancelar y aceptar).
    const restore = () => {
      document.body.classList.remove(BODY_CLASS);
      tpl.hidden = true;
      window.removeEventListener('afterprint', restore);
    };
    window.addEventListener('afterprint', restore);
    // Fallback por si afterprint no dispara (Safari, algunos kioskos)
    setTimeout(() => {
      if (document.body.classList.contains(BODY_CLASS)) restore();
    }, 30_000);

    // Disparar el diálogo
    setTimeout(() => window.print(), 50);
  }

  // ── Encontrar la entrada del catálogo desde un click ────────
  function entryFromCard(card) {
    if (!card) return null;
    const cat = (typeof window.CATALOGO_EFECTIVO !== 'undefined' && window.CATALOGO_EFECTIVO.length)
      ? window.CATALOGO_EFECTIVO
      : (window.CATALOGO || []);
    const titleEl = card.querySelector('.cat-title');
    if (!titleEl) return null;
    const titulo = titleEl.textContent.trim();
    return cat.find(t => t.titulo === titulo) || null;
  }

  // ── Inyectar botón en cada .cat-card-actions ────────────────
  function injectButtons(root) {
    (root || document).querySelectorAll('.cat-card').forEach(card => {
      const actions = card.querySelector('.cat-card-actions');
      if (!actions || actions.querySelector('.cat-pdf-btn')) return;
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'cat-pdf-btn cat-ficha-btn';
      btn.setAttribute('data-action', 'printFichaCard');
      btn.title = 'Descargar ficha en PDF (imprimir)';
      btn.textContent = '↓ Ficha PDF';
      actions.appendChild(btn);
    });
  }

  // ── Hook del data-action="printFichaCard" ───────────────────
  function hookDelegation() {
    document.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-action="printFichaCard"]');
      if (!btn) return;
      const card = btn.closest('.cat-card');
      const t = entryFromCard(card);
      if (t) print(t);
    });
  }

  // ── API pública (para acceso desde otras vistas / tests) ────
  window.printFichaPDF = function (titulo) {
    const cat = window.CATALOGO_EFECTIVO?.length ? window.CATALOGO_EFECTIVO : (window.CATALOGO || []);
    const t = cat.find(x => x.titulo === titulo);
    if (t) print(t);
  };

  // ── Init ────────────────────────────────────────────────────
  function init() {
    ensureTemplate();
    hookDelegation();
    injectButtons();
    const catGrid = document.getElementById('catGrid') || document.getElementById('catalogo');
    if (catGrid && window.MutationObserver) {
      new MutationObserver(() => injectButtons(catGrid))
        .observe(catGrid, { childList: true, subtree: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
