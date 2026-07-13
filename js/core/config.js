(function (global) {
  'use strict';

  const config = Object.freeze({
    storageKeys: Object.freeze({
      asistenteApi: 'manga_asist_apikey',
    }),
    busquedaGlobal: Object.freeze({
      minCaracteres: 2,
      maxResultadosPorSeccion: 8,
    }),
  });

  global.MANGA_APP_CONFIG = config;
})(window);
