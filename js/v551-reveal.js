/* ══════════════════════════════════════════════════════════════
   v551-reveal.js — Revelado sobrio al entrar en viewport.
   Función pedagógica: transición de estado (el bloque "llega" al
   hilo de lectura). Sin JS, todo es visible: la clase rv-armed
   solo se añade aquí, y prefers-reduced-motion lo desactiva por
   completo (ni se observa ni se anima).
   ══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  if (!('IntersectionObserver' in window)) return;

  function init() {
    var targets = document.querySelectorAll(
      '#mitos .mito-card, #demografias-etapas .tabla-editorial, #puentes-lectores .tabla-editorial, #como-citar blockquote'
    );
    if (!targets.length) return;
    document.documentElement.classList.add('rv-armed');
    targets.forEach(function (el) { el.classList.add('rv'); });

    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('rv-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.12 });

    targets.forEach(function (el) { io.observe(el); });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
