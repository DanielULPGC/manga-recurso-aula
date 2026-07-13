(function (global) {
  'use strict';

  // Compatibilidad historica: la matriz curricular se ha movido a
  // js/core/curriculo.js. Este archivo queda para no romper referencias
  // externas antiguas que esperasen la ruta previa.
  if (!global.MANGA_CURRICULO_NORMATIVO && global.MANGA_CURRICULO) {
    global.MANGA_CURRICULO_NORMATIVO = global.MANGA_CURRICULO;
  }
})(window);
