# Matriz curricular normativa

## Objetivo

Centralizar las referencias normativas que usa el aplicativo para generar fichas, rubricas, situaciones de aprendizaje y orientaciones didacticas. La matriz evita textos normativos dispersos dentro de funciones largas y reduce el riesgo de citar una norma estatal o canaria en una etapa equivocada.

No se ha modificado el catalogo de obras ni el enfoque didactico general del recurso.

## Fuentes de referencia

| Etapa | Norma estatal | Norma canaria | Uso en la aplicacion |
| --- | --- | --- | --- |
| Educacion Infantil | RD 95/2022, de 1 de febrero. BOE-A-2022-1654. https://www.boe.es/buscar/act.php?id=BOE-A-2022-1654 | Decreto 196/2022, de 13 de octubre. BOC 2022/212. https://www.gobiernodecanarias.org/boc/2022/212/001.html | Se mantiene como soporte para prompts cuando se selecciona Infantil. |
| Educacion Primaria | RD 157/2022, de 1 de marzo. BOE-A-2022-3296. https://www.boe.es/buscar/act.php?id=BOE-A-2022-3296 | Decreto 211/2022, de 10 de noviembre. BOC 2022/231. https://www.gobiernodecanarias.org/boc/2022/231/001.html | Sustituye referencias previas incorrectas usadas para Primaria Canarias. |
| ESO | RD 217/2022, de 29 de marzo. BOE-A-2022-4975. https://www.boe.es/buscar/act.php?id=BOE-A-2022-4975 | Decreto 30/2023, de 16 de marzo. BOC 2023/058. https://www.gobiernodecanarias.org/boc/2023/058/001.html | Se usa para Secundaria/ESO. |
| Bachillerato | RD 243/2022, de 5 de abril. BOE-A-2022-5521. https://www.boe.es/buscar/act.php?id=BOE-A-2022-5521 | Decreto 30/2023, de 16 de marzo. BOC 2023/058. https://www.gobiernodecanarias.org/boc/2023/058/001.html | Sustituye referencias estatales previas incorrectas para esta etapa. |

## Implementacion

La matriz centralizada esta en `site/js/core/curriculo.js` y expone `window.MANGA_CURRICULO` y `window.MANGA_CURRICULO_NORMATIVO` con estas funciones:

| Funcion | Proposito |
| --- | --- |
| `normalizarEtapa(etapa)` | Convierte etiquetas como `Primaria`, `ESO`, `Secundaria` o `Bachillerato` en una clave estable. |
| `getNormativaEtapa(etapa)` | Devuelve el bloque normativo estatal y canario de la etapa. |
| `textoNormativoEtapa(etapa)` | Devuelve un resumen textual para prompts de generacion didactica. |
| `enlacesNormativosHtml(etapa)` | Devuelve enlaces HTML seguros a BOE/BOC para rubricas locales. |

`site/recurso.html` carga `js/core/curriculo.js` antes de `js/app.min.js`, de modo que las funciones de generacion pueden consultar la matriz antes de construir prompts o rubricas. `site/sw.js` incluye tambien este archivo en la lista de recursos precacheados para mantener coherencia PWA. `site/js/curriculo-normativa.js` queda como envoltorio de compatibilidad para la ruta historica.

## Correcciones aplicadas

| Referencia anterior | Problema | Referencia corregida |
| --- | --- | --- |
| Norma canaria previa usada para Primaria | No corresponde al curriculo LOMLOE de Educacion Primaria en Canarias. | Decreto 211/2022 + RD 157/2022. |
| Norma estatal previa usada para Bachillerato | Correspondia a otra etapa educativa. | RD 243/2022. |
| Referencia estatal conjunta para ESO y Bachillerato | Mezclaba en una misma referencia estatal dos etapas con reales decretos distintos. | Norma estatal de ESO separada de la norma estatal de Bachillerato. |
| Enlaces locales previos para RD 217/2022 | Identificador BOE no alineado con el real decreto curricular de ESO usado por la matriz. | BOE-A-2022-4975 para RD 217/2022. |

## Puntos de consumo en el aplicativo

| Archivo | Cambio funcional |
| --- | --- |
| `site/js/app.js` | Los generadores de rubrica, secuencia didactica, ficha de aula, situacion de aprendizaje y actividad expres toman el marco normativo desde `window.MANGA_CURRICULO_NORMATIVO`. |
| `site/recurso.html` | Corrige los textos y enlaces normativos visibles y carga la matriz curricular antes del nucleo de la aplicacion. |
| `site/sw.js` | Precachea `js/core/curriculo.js` para que la PWA conserve la matriz normativa. |

## Criterio editorial

La intervencion se limita a referencias normativas y curriculares. No se han cambiado descripciones de obras, clasificaciones pedagogicas del catalogo, ODS, niveles recomendados ni textos culturales sobre manga.
