(function (global) {
  'use strict';

  const etapas = {
    infantil: {
      id: 'infantil',
      etiqueta: 'Educacion Infantil',
      estatal: {
        nombre: 'Real Decreto 95/2022, de 1 de febrero',
        abreviado: 'RD 95/2022',
        descripcion: 'ordenacion y ensenanzas minimas de Educacion Infantil',
        url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2022-1654',
      },
      canaria: {
        nombre: 'Decreto 196/2022, de 13 de octubre',
        abreviado: 'Decreto 196/2022',
        descripcion: 'ordenacion y curriculo de Educacion Infantil en Canarias',
        url: 'https://www.gobiernodecanarias.org/boc/2022/212/001.html',
      },
      enfoque: 'Areas: Crecimiento en Armonia, Descubrimiento y Exploracion del Entorno, Comunicacion y Representacion de la Realidad. Metodologia: aprendizaje globalizado, rincones y juego simbolico.',
    },
    primaria: {
      id: 'primaria',
      etiqueta: 'Educacion Primaria',
      estatal: {
        nombre: 'Real Decreto 157/2022, de 1 de marzo',
        abreviado: 'RD 157/2022',
        descripcion: 'ordenacion y ensenanzas minimas de Educacion Primaria',
        url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2022-3296',
      },
      canaria: {
        nombre: 'Decreto 211/2022, de 10 de noviembre',
        abreviado: 'Decreto 211/2022',
        descripcion: 'ordenacion y curriculo de Educacion Primaria en Canarias',
        url: 'https://www.gobiernodecanarias.org/boc/2022/231/001.html',
      },
      enfoque: 'Enfasis en entorno insular, patrimonio natural, social y cultural canario, situaciones de aprendizaje contextualizadas e interdisciplinariedad.',
    },
    eso: {
      id: 'eso',
      etiqueta: 'Educacion Secundaria Obligatoria',
      estatal: {
        nombre: 'Real Decreto 217/2022, de 29 de marzo',
        abreviado: 'RD 217/2022',
        descripcion: 'ordenacion y ensenanzas minimas de Educacion Secundaria Obligatoria',
        url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2022-4975',
      },
      canaria: {
        nombre: 'Decreto 30/2023, de 16 de marzo',
        abreviado: 'Decreto 30/2023',
        descripcion: 'ordenacion y curriculo de Educacion Secundaria Obligatoria en Canarias',
        url: 'https://www.gobiernodecanarias.org/boc/2023/058/001.html',
      },
      enfoque: 'Situaciones de aprendizaje, ODS, ciudadania global, lectura multimodal y enfoque competencial.',
    },
    bachillerato: {
      id: 'bachillerato',
      etiqueta: 'Bachillerato',
      estatal: {
        nombre: 'Real Decreto 243/2022, de 5 de abril',
        abreviado: 'RD 243/2022',
        descripcion: 'ordenacion y ensenanzas minimas del Bachillerato',
        url: 'https://www.boe.es/buscar/act.php?id=BOE-A-2022-5521',
      },
      canaria: {
        nombre: 'Decreto 30/2023, de 16 de marzo',
        abreviado: 'Decreto 30/2023',
        descripcion: 'ordenacion y curriculo de Bachillerato en Canarias',
        url: 'https://www.gobiernodecanarias.org/boc/2023/058/001.html',
      },
      enfoque: 'Pensamiento critico, investigacion, madurez academica, argumentacion y preparacion para estudios posteriores.',
    },
  };

  const competenciasLomloePorUso = Object.freeze({
    historia: 'CCL, CPSAA, CC',
    filosofia: 'CCL, CPSAA, CE',
    emocional: 'CPSAA, CC, CCL',
    lenguas: 'CCL, CP, CPSAA',
    inclusion: 'CPSAA, CC, CE',
    visual: 'CCEC, CCL, CD',
    ciencia: 'STEM, CCL, CD',
    genero: 'CC, CPSAA, CCEC',
  });

  function normalizarEtapa(etapa) {
    const texto = String(etapa || '').toLowerCase();
    if (texto.includes('bachiller')) return 'bachillerato';
    if (texto.includes('eso') || texto.includes('secundaria')) return 'eso';
    if (texto.includes('primaria')) return 'primaria';
    if (texto.includes('infantil')) return 'infantil';
    return null;
  }

  function getNormativaEtapa(etapa) {
    const clave = normalizarEtapa(etapa);
    return clave ? etapas[clave] : null;
  }

  function textoNormativoEtapa(etapa) {
    const norma = getNormativaEtapa(etapa);
    if (!norma) return 'Marco general LOMLOE. Selecciona una etapa para concretar reales decretos y normativa canaria.';
    return `${norma.canaria.nombre} (${norma.canaria.descripcion}) + ${norma.estatal.nombre} (${norma.estatal.descripcion}). ${norma.enfoque}`;
  }

  function enlacesNormativosHtml(etapa) {
    const norma = getNormativaEtapa(etapa);
    if (!norma) return 'LOMLOE y normativa curricular aplicable a la etapa seleccionada.';
    return `<a href="${norma.estatal.url}" target="_blank" rel="noopener noreferrer">${norma.estatal.abreviado}</a> y <a href="${norma.canaria.url}" target="_blank" rel="noopener noreferrer">${norma.canaria.abreviado}</a>`;
  }

  const curriculo = Object.freeze({
    etapas: Object.freeze(etapas),
    competenciasLomloePorUso,
    normalizarEtapa,
    getNormativaEtapa,
    textoNormativoEtapa,
    enlacesNormativosHtml,
  });

  global.MANGA_CURRICULO = curriculo;
  global.MANGA_CURRICULO_NORMATIVO = curriculo;
})(window);
