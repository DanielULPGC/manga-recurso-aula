/* ══════════════════════════════════════════════════════════════
   etapa-selector.js — Entrada por rol docente
   Filtra el recurso según la etapa seleccionada y persiste la elección.
   Compatible con CSP estricta.
   ══════════════════════════════════════════════════════════════ */
(function() {
  'use strict';

  const LS_ETAPA = 'mc_etapa';

  // Para qué sección lleva cada etapa (entrada didáctica)
  const ETAPA_DESTINO = {
    infantil:    { ancla: '#itinerarios',  tab: 'itin-inf', label: 'itinerarios de Infantil' },
    primaria:    { ancla: '#itinerarios',  tab: 'itin-p1',  label: 'itinerarios de Primaria' },
    secundaria:  { ancla: '#situaciones',  tab: 'sa-sa3',   label: 'situaciones de Secundaria' },
    bachillerato:{ ancla: '#situaciones',  tab: 'sa-sa5',   label: 'situaciones de Bachillerato' },
    universidad: { ancla: '#universidad',  tab: 'univ-eprim', label: 'recorridos universitarios' },
    all:         { ancla: null,            tab: null,       label: 'todo el recurso' },
  };

  function applyEtapa(etapa, opts = {}) {
    const valid = Object.keys(ETAPA_DESTINO);
    if (!valid.includes(etapa)) return;

    // 1. Actualizar UI del selector
    document.querySelectorAll('.es-btn').forEach(btn => {
      const active = btn.dataset.etapa === etapa;
      btn.classList.toggle('active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });

    // 2. Activar filtro nivel via función existente
    if (typeof window.filterNivel === 'function') {
      window.filterNivel(etapa);
    }
    // Guardar también en la key compartida con catalog-collapse
    try { localStorage.setItem('mc_last_nivel', etapa); } catch (e) {}
    try { localStorage.setItem(LS_ETAPA, etapa); } catch (e) {}

    // 3. Modo aula automático para Infantil/Primaria (oculta sensibles)
    const isYoung = (etapa === 'infantil' || etapa === 'primaria');
    document.body.classList.toggle('etapa-joven', isYoung);

    // 4. Activar modo aula si existe la función (esconde sensitive)
    if (isYoung && typeof window.toggleModoAula === 'function') {
      const btn = document.querySelector('.modo-aula-btn');
      if (btn && btn.getAttribute('aria-pressed') !== 'true') {
        // No fuerzo el toggle: solo lo sugiero visualmente
      }
    }

    // 5. Feedback visual
    const feedback = document.getElementById('etapaSelectorFeedback');
    if (feedback) {
      if (etapa === 'all') {
        feedback.innerHTML = '';
        feedback.classList.remove('visible');
      } else {
        const d = ETAPA_DESTINO[etapa];
        const youngWarning = isYoung
          ? `<span class="esf-warning">⚠ Los 21 títulos con advertencia se filtran al recorrer el recurso.</span>`
          : '';
        feedback.innerHTML = `
          <span class="esf-arrow">→</span>
          <span class="esf-text">
            Recurso filtrado para <strong>${labelEtapa(etapa)}</strong>.
            ${d.ancla ? `Punto de entrada recomendado: <a href="${d.ancla}">${d.label}</a>.` : ''}
            ${youngWarning}
          </span>
          <button type="button" class="esf-close" aria-label="Cerrar aviso">✕</button>
        `;
        feedback.classList.add('visible');
        feedback.querySelector('.esf-close')?.addEventListener('click', () => {
          feedback.classList.remove('visible');
        });
      }
    }

    // 6. Scroll suave al destino solo si lo pidió el usuario explícitamente
    if (opts.scroll && ETAPA_DESTINO[etapa].ancla) {
      const target = document.querySelector(ETAPA_DESTINO[etapa].ancla);
      if (target) {
        setTimeout(() => {
          target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 350);
      }
    }
  }

  function labelEtapa(e) {
    return ({
      infantil: 'Infantil',
      primaria: 'Primaria',
      secundaria: 'Secundaria (ESO)',
      bachillerato: 'Bachillerato',
      universidad: 'Universidad',
      all: 'todas las etapas',
    })[e] || e;
  }

  function init() {
    const root = document.getElementById('etapaSelector');
    if (!root) return;

    // Bind clicks
    root.querySelectorAll('.es-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        applyEtapa(btn.dataset.etapa, { scroll: btn.dataset.etapa !== 'all' });
      });
    });

    // Restaurar elección previa sin scroll
    try {
      const saved = localStorage.getItem(LS_ETAPA);
      if (saved && saved !== 'all') {
        setTimeout(() => applyEtapa(saved, { scroll: false }), 320);
      }
    } catch (e) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 60);
  }
})();
