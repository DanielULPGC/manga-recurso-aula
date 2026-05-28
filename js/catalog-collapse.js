/* ══════════════════════════════════════════════════════════════
   catalog-collapse.js — Mejoras didácticas del catálogo
   1. Catálogo oculto por defecto + banner editorial con búsquedas sugeridas
   2. Vista mínima de filtros (ODS oculto en modo colapsado)
   3. Resultados con contexto (1-3 resultados → ficha expandida)
   4. Persistencia del último filtro uso/nivel en localStorage
   ══════════════════════════════════════════════════════════════ */
(function() {
  'use strict';

  const LS_USO = 'mc_last_uso';
  const LS_NIVEL = 'mc_last_nivel';

  // Búsquedas modelo que el banner expone como chips clicables.
  // Demuestran al docente el tipo de consulta que el recurso soporta.
  const SUGGESTED = [
    { label: 'Roma antigua',         q: 'roma',      hint: 'Histórico' },
    { label: 'Tezuka',               q: 'Tezuka',    hint: 'Autor fundacional' },
    { label: 'Identidad y emociones', q: 'identidad', hint: 'Tutoría' },
    { label: 'Filosofía clásica',    q: 'filosofía', hint: 'Bachillerato' },
    { label: 'Guerra y memoria',     q: 'guerra',    hint: 'Historia s. XX' },
    { label: 'Ciencia',              q: 'ciencia',   hint: 'STEM' },
  ];

  function init() {
    const section = document.getElementById('catalogo');
    const grid = document.getElementById('catGrid');
    const search = document.getElementById('catalogSearch');
    if (!section || !grid) return;

    // ── 1. Estado inicial colapsado ──────────────────────────
    section.classList.add('catalog-collapsed');
    document.body.classList.add('minimal-filters');

    // ── Banner editorial ─────────────────────────────────────
    if (!section.querySelector('.catalog-collapsed-banner')) {
      const banner = document.createElement('div');
      banner.className = 'catalog-collapsed-banner';

      const chipsHTML = SUGGESTED.map(s =>
        `<button type="button" class="ccb-chip" data-q="${s.q.replace(/"/g, '&quot;')}">
           <span class="ccb-chip-label">${s.label}</span>
           <span class="ccb-chip-hint">${s.hint}</span>
         </button>`
      ).join('');

      banner.innerHTML = `
        <div class="ccb-eyebrow">El catálogo está oculto</div>
        <h3 class="ccb-title">279 títulos esperan tu búsqueda.</h3>
        <p class="ccb-body">Llega con una pregunta concreta: <em>"manga para historia de Roma"</em>, <em>"título sobre identidad para 4.º ESO"</em>, <em>"Tezuka"</em>. Filtra arriba por color (uso pedagógico) y nivel, o prueba uno de estos puntos de entrada:</p>
        <div class="ccb-suggested">${chipsHTML}</div>
        <div class="ccb-tips">
          <span class="ccb-tip"><span class="ccb-k">↑</span> Filtra por color de uso pedagógico</span>
          <span class="ccb-tip"><span class="ccb-k">⌕</span> Busca título, autor, tema o era</span>
          <span class="ccb-tip"><span class="ccb-k">⊕</span> Activa el catálogo completo abajo</span>
        </div>
      `;
      grid.parentNode.insertBefore(banner, grid);

      // Bind chips
      banner.querySelectorAll('.ccb-chip').forEach(chip => {
        chip.addEventListener('click', () => {
          const q = chip.dataset.q || '';
          if (search) {
            search.value = q;
            search.dispatchEvent(new Event('input', { bubbles: true }));
            search.focus();
          }
          // Scroll suave al grid de resultados
          setTimeout(() => {
            grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }, 200);
        });
      });
    }

    // ── Botón "Ver los 279 títulos" ─────────────────────────
    if (!section.querySelector('.catalog-explore-btn')) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'catalog-explore-btn';
      btn.textContent = '⊕ Ver los 279 títulos en cuadrícula';
      btn.setAttribute('aria-label', 'Mostrar el catálogo completo sin filtrar');
      btn.addEventListener('click', () => {
        section.classList.remove('catalog-collapsed');
        document.body.classList.remove('minimal-filters');
        btn.style.display = 'none';
      });
      grid.parentNode.insertBefore(btn, grid.nextSibling);
    }

    // ── 2. Toggle .catalog-searching y conteo de resultados ──
    if (search) {
      const updateSearchState = () => {
        const has = search.value && search.value.trim().length > 0;
        section.classList.toggle('catalog-searching', has);
        // Cuando se busca, mostrar filtros completos (incl. ODS)
        document.body.classList.toggle('minimal-filters', !has && section.classList.contains('catalog-collapsed'));
        updateContextualResults();
      };
      search.addEventListener('input', updateSearchState);
      updateSearchState();
    }

    // ── 3. Resultados con contexto (1-3 = ficha expandida) ──
    function updateContextualResults() {
      const matches = grid.querySelectorAll('.cat-card.search-match');
      grid.classList.toggle('few-results', matches.length > 0 && matches.length <= 3);
    }
    // app.js renderiza el catálogo de forma diferida; observar cambios
    const observer = new MutationObserver(updateContextualResults);
    observer.observe(grid, { childList: true, subtree: true, attributeFilter: ['class'] });

    // ── 4. Persistencia uso/nivel en localStorage ────────────
    try {
      const savedUso = localStorage.getItem(LS_USO);
      const savedNivel = localStorage.getItem(LS_NIVEL);

      // Aplicar filtros guardados tras un pequeño delay (app.js debe inicializarse antes)
      setTimeout(() => {
        if (savedUso && savedUso !== 'all' && typeof window.filterUso === 'function') {
          window.filterUso(savedUso);
          announceRestored('uso', savedUso);
        }
        if (savedNivel && savedNivel !== 'all' && typeof window.filterNivel === 'function') {
          window.filterNivel(savedNivel);
        }
      }, 300);
    } catch (e) { /* localStorage no disponible */ }

    // Interceptar clics en los botones de filtro para guardarlos
    document.querySelectorAll('[data-action="filterUso"]').forEach(btn => {
      btn.addEventListener('click', () => {
        try { localStorage.setItem(LS_USO, btn.dataset.arg || 'all'); } catch (e) {}
      });
    });
    document.querySelectorAll('[data-action="filterNivel"]').forEach(btn => {
      btn.addEventListener('click', () => {
        try { localStorage.setItem(LS_NIVEL, btn.dataset.arg || 'all'); } catch (e) {}
      });
    });
  }

  // Anuncia visualmente que se ha restaurado un filtro previo
  function announceRestored(kind, val) {
    const notice = document.createElement('div');
    notice.className = 'mc-restored-notice';
    notice.innerHTML = `
      <span class="mcr-icon">↻</span>
      <span class="mcr-text">Filtros restaurados de tu última visita.</span>
      <button type="button" class="mcr-clear" aria-label="Borrar filtros guardados">✕</button>
    `;
    notice.querySelector('.mcr-clear').addEventListener('click', () => {
      try {
        localStorage.removeItem('mc_last_uso');
        localStorage.removeItem('mc_last_nivel');
      } catch (e) {}
      if (typeof window.filterUso === 'function') window.filterUso('all');
      if (typeof window.filterNivel === 'function') window.filterNivel('all');
      notice.remove();
    });
    document.body.appendChild(notice);
    // Auto-dismiss tras 6s
    setTimeout(() => { notice.classList.add('mcr-fading'); }, 5500);
    setTimeout(() => { notice.remove(); }, 6500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 50);
  }
})();
