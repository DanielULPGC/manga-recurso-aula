/* ══════════════════════════════════════════════════════════════
   left-dock.js — Dock izquierdo: solo «Volver arriba»
   El asistente IA ha sido retirado a petición del equipo docente.
   ══════════════════════════════════════════════════════════════ */
(function() {
  'use strict';

  function init() {
    // Limpieza si ya existía
    const existing = document.getElementById('leftDock');
    if (existing) existing.remove();

    const dock = document.createElement('div');
    dock.id = 'leftDock';
    dock.setAttribute('role', 'toolbar');
    dock.setAttribute('aria-label', 'Atajos rápidos');
    dock.innerHTML = `
      <div class="ld-slot ld-slot-top">
        <button type="button" class="ld-btn ld-btn-top" id="ldTop" aria-label="Volver arriba">↑</button>
        <span class="ld-note ld-note-faint">Volver arriba</span>
      </div>
    `;
    document.body.appendChild(dock);

    document.getElementById('ldTop').addEventListener('click', (e) => {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Ocultar los originales de IA y "volver arriba" para no duplicar
    function hideOrig(selector) {
      const el = typeof selector === 'string'
        ? document.querySelector(selector)
        : selector;
      if (!el) return;
      const slot = el.closest('.fab-item');
      if (slot) slot.style.display = 'none';
      else el.style.display = 'none';
    }
    hideOrig('#asist-fab');
    hideOrig('#aiFloatingBtn');
    hideOrig('#tools-fab [data-action="scrollToSc"]');
    // Fix I-05 — Consolidar FABs: ocultar duplicados
    hideOrig('#gtt-btn');     // redundante con #ldTop del leftDock
    hideOrig('#cmpBtn');      // movido al speed dial (data-action="toggleCompact")

    // Fix I-05 — Insertar la acción «Vista compacta» dentro de #tools-fab
    // si no existe ya, antes del primer fab-item visible.
    const fabItems = document.getElementById('fabItems');
    if (fabItems && !fabItems.querySelector('[data-action="toggleCompact"]')) {
      const wrap = document.createElement('div');
      wrap.className = 'fab-item';
      wrap.innerHTML = '<button type="button" class="fab-action" data-action="toggleCompact" aria-label="Alternar vista panorámica / solo títulos" title="Vista compacta">⊟</button>';
      fabItems.insertBefore(wrap, fabItems.firstChild);
    }

    // Fix I-05 — Auto-hide del speed dial al scroll hacia abajo (patrón Material).
    const toolsFab = document.getElementById('tools-fab');
    if (toolsFab) {
      let lastY = window.scrollY;
      let hidden = false;
      let ticking = false;
      function update() {
        const y = window.scrollY;
        const dy = y - lastY;
        // Si el menú está abierto, no escondemos
        const isOpen = document.getElementById('tools-fab-toggle')?.classList.contains('open');
        if (!isOpen) {
          if (dy > 6 && y > 400 && !hidden) {
            toolsFab.classList.add('fab-hidden');
            hidden = true;
          } else if (dy < -6 && hidden) {
            toolsFab.classList.remove('fab-hidden');
            hidden = false;
          }
        }
        lastY = y;
        ticking = false;
      }
      window.addEventListener('scroll', () => {
        if (!ticking) {
          window.requestAnimationFrame(update);
          ticking = true;
        }
      }, { passive: true });
    }

    // Eliminar también el panel IA si está en DOM
    const asistPanel = document.getElementById('asistPanel');
    if (asistPanel) asistPanel.style.display = 'none';
    const asistOverlay = document.getElementById('asist-overlay');
    if (asistOverlay) asistOverlay.style.display = 'none';
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 250);
  }
})();
