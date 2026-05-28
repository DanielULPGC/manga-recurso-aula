/* ══════════════════════════════════════════════════════════════════
   overlay-fab-hide.js — v5.9 · 2026-05
   Cuando hay un overlay/modal visible, añade body.has-overlay para
   que el CSS oculte los FABs y evite el conflicto de stacking
   (#gtt-btn z:9999 perforaba #expoOverlay z:9500).

   Vigila los IDs de overlay conocidos del recurso. Es defensivo:
   si un overlay nuevo se añade en el futuro, basta con incluir su
   selector en OVERLAY_SELECTORS.
   ══════════════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  const OVERLAY_SELECTORS = [
    '#expoOverlay','#vitrineOverlay','#asist-overlay','#fichaOverlay',
    '#rubricaOverlay','#expresOverlay','#secOverlay','#mapaOverlay',
    '#compOverlay','#lecturaOverlay','#histOverlay','#guiaOverlay',
    '.panel-docente-overlay','.alumno-overlay','.vocab-overlay',
    '#vitrineDrawer','#asist-panel','#compDrawer','#aiPanel'
  ];

  function isVisible(el){
    if(!el) return false;
    if(el.hidden) return false;
    const cs = window.getComputedStyle(el);
    if(cs.display === 'none' || cs.visibility === 'hidden') return false;
    if(parseFloat(cs.opacity) < 0.05) return false;
    // Para drawers/paneles que viven en el DOM pero quedan fuera de
    // viewport vía transform — comprobamos tanto X como Y del matrix.
    const tr = cs.transform;
    if(tr && tr !== 'none' && tr.startsWith('matrix')) {
      const parts = tr.slice(7, -1).split(',').map(s => parseFloat(s.trim()));
      // matrix(a, b, c, d, tx, ty) → índices 4 y 5
      const tx = parts[4] || 0;
      const ty = parts[5] || 0;
      if(Math.abs(tx) > el.offsetWidth * 0.5)  return false;
      if(Math.abs(ty) > el.offsetHeight * 0.5) return false;
    }
    if(el.classList.contains('open')) return true;
    if(cs.display === 'flex' || cs.display === 'block' || cs.display === 'grid') {
      return true;
    }
    return false;
  }

  function check(){
    const anyOpen = OVERLAY_SELECTORS.some(sel => {
      const el = document.querySelector(sel);
      return el && isVisible(el);
    });
    document.body.classList.toggle('has-overlay', anyOpen);
  }

  // Inicial + mutaciones de style/class en cualquier elemento del documento
  function init(){
    check();
    const mo = new MutationObserver(check);
    mo.observe(document.body, {
      attributes: true,
      attributeFilter: ['style','class','hidden'],
      subtree: true
    });
    // Re-check periódico por si algún overlay se anima vía transform/opacity
    // sin disparar mutation (raro, pero defensivo y barato).
    setInterval(check, 800);
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
