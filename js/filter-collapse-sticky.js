/* ══════════════════════════════════════════════════════════════════
   filter-collapse-sticky.js — v5.9 · 2026-05
   Cuando el usuario scroll\u00f3 lejos del \u00e1rea de la l\u00ednea del tiempo,
   colapsa la sticky filter-bar (que mide ~200 px de alto = 1/3 del
   viewport m\u00f3vil) a una versi\u00f3n compacta de ~56 px. Al pasar el rat\u00f3n
   por encima o al hacer focus en cualquier control, se expande de
   vuelta autom\u00e1ticamente.

   El threshold se calibra con la posici\u00f3n inicial del filterBar:
   se colapsa cuando el usuario ha scrolleado al menos 1.5 \u00d7 viewport
   por debajo de esa posici\u00f3n. Re-expande al volver cerca.
   \u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550\u2550 */
(function(){
  'use strict';

  function init(){
    const bar = document.getElementById('filterBar');
    if(!bar) return;

    let baseTop = 0;       // posici\u00f3n absoluta inicial del filterBar
    let collapsed = false; // estado actual
    let ticking = false;

    function measure(){
      // Posici\u00f3n absoluta inicial \u2014 medida antes de cualquier scroll
      const r = bar.getBoundingClientRect();
      baseTop = r.top + window.scrollY;
    }

    function update(){
      const y = window.scrollY;
      const vh = window.innerHeight;
      // Colapsar si scrolleamos m\u00e1s de 1.5 viewports por debajo del bar
      const threshold = baseTop + vh * 1.5;
      const shouldCollapse = y > threshold;
      if(shouldCollapse !== collapsed){
        collapsed = shouldCollapse;
        bar.classList.toggle('is-compact', collapsed);
      }
      ticking = false;
    }

    function onScroll(){
      if(!ticking){
        window.requestAnimationFrame(update);
        ticking = true;
      }
    }

    // Esperar a que el layout est\u00e9 estable antes de medir
    setTimeout(() => {
      measure();
      update();
      window.addEventListener('scroll', onScroll, {passive: true});
      window.addEventListener('resize', () => { measure(); update(); }, {passive: true});
    }, 500);
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
