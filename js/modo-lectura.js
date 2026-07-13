/* ══════════════════════════════════════════════════════════════
   modo-lectura.js — Modo lectura accesible
   v5.11 · El manga como recurso para el aula

   Alterna la clase .modo-lectura en <html>:
   vista plana (todas las pestañas expandidas), alto contraste,
   sin animaciones ni transiciones, cuerpo de texto mayor.
   Persistencia: SafeStorage 'manga_modo_lectura' ('1' | ausente).
   Depende de: app.js (SafeStorage). Si no está, degrada sin romper.
   ══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var KEY  = 'manga_modo_lectura';
  var root = document.documentElement;

  function storage() {
    return (typeof SafeStorage !== 'undefined') ? SafeStorage : {
      getItem: function () { return null; },
      setItem: function () {},
      removeItem: function () {}
    };
  }

  function apply(on, btn) {
    root.classList.toggle('modo-lectura', on);
    if (btn) {
      btn.classList.toggle('active', on);
      btn.setAttribute('aria-pressed', String(on));
      btn.setAttribute('aria-label', on
        ? 'Desactivar modo lectura accesible'
        : 'Activar modo lectura accesible');
    }
    // Aviso para lectores de pantalla (reutiliza el live region del modo aula)
    var notice = document.querySelector('.modo-aula-notice');
    if (notice) {
      notice.textContent = on
        ? 'Modo lectura accesible activado: todas las pestañas están expandidas y las animaciones desactivadas.'
        : 'Modo lectura accesible desactivado.';
    }
  }

  function init() {
    var btn = document.getElementById('modoLecturaBtn');
    var saved = storage().getItem(KEY) === '1';
    if (saved) apply(true, btn);

    if (!btn) return;
    btn.addEventListener('click', function () {
      var on = !root.classList.contains('modo-lectura');
      apply(on, btn);
      if (on) storage().setItem(KEY, '1');
      else    storage().removeItem(KEY);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
