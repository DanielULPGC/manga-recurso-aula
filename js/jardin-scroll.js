/* ══════════════════════════════════════════════════════════════
   jardin-scroll.js — Reveals + nav sobre fondo oscuro
   v5.11 · Jardín de tinta
   ══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  function init() {
    // Reveals al entrar en viewport. Los que ya son visibles al cargar
    // se marcan directamente (algunos navegadores no entregan entries
    // iniciales de forma fiable antes del primer scroll).
    var obs = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (e.isIntersecting) {
          e.target.classList.add('in');
          obs.unobserve(e.target);
        }
      });
    }, { threshold: 0.18 });
    document.querySelectorAll('.rev').forEach(function (el) {
      var r = el.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) {
        el.classList.add('in');
      } else {
        obs.observe(el);
      }
    });

    // Nav cambia a claro sobre la sección oscura
    var nav = document.getElementById('jnav');
    var cierre = document.getElementById('cierre');
    if (nav && cierre) {
      var navObs = new IntersectionObserver(function (entries) {
        entries.forEach(function (e) {
          nav.classList.toggle('sobre-oscuro', e.isIntersecting);
        });
      }, { rootMargin: '-40px 0px -85% 0px' });
      navObs.observe(cierre);
    }

    // Parallax suave de la rama del hero
    var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var rama = document.getElementById('ramaCanvas');
    if (rama && !reduced) {
      window.addEventListener('scroll', function () {
        var y = window.scrollY;
        if (y < window.innerHeight * 1.2) {
          rama.style.transform = 'translateY(' + y * 0.18 + 'px)';
        }
      }, { passive: true });
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
