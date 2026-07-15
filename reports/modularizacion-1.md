# Modularizacion 1: constantes, utilidades y curriculo

## Alcance

Primera fase conservadora de modularizacion de `site/js/app.js`. No se ha reescrito la aplicacion, no se ha introducido framework y no se han modificado el catalogo, el diseno visual, los flujos de IA ni las funciones de exportacion.

La carga sigue siendo mediante scripts tradicionales con `defer`; no se usan `import`/`export` de ES Modules para mantener compatibilidad con la arquitectura actual.

## Archivos creados

| Archivo | Contenido extraido | Motivo |
| --- | --- | --- |
| `site/js/core/config.js` | `window.MANGA_APP_CONFIG` con claves de almacenamiento y limites de busqueda global. | Evitar constantes dispersas en `app.js` y preparar futuras extracciones sin cambiar nombres internos. |
| `site/js/core/utils.js` | `sanitizeHtml` y `escapeHtml` bajo `window.MangaUtils`. | Separar utilidades puras/reutilizables del nucleo de interfaz y mantener la sanitizacion en un punto claro. |
| `site/js/core/curriculo.js` | Matriz normativa por etapa, funciones de consulta curricular y mapa `competenciasLomloePorUso`. | Centralizar configuracion curricular y reducir referencias curriculares dispersas en generadores. |

## Archivos modificados

| Archivo | Cambio |
| --- | --- |
| `site/js/app.js` | Sustituye definiciones locales de utilidades y constantes por alias hacia `window.MangaUtils`, `window.MANGA_APP_CONFIG` y `window.MANGA_CURRICULO`. Mantiene los nombres usados por el resto del archivo: `sanitizeHtml`, `escapeHtml`, `MANGA_ASIST_KEY`, `GLOBAL_SEARCH_MIN`, `GLOBAL_SEARCH_MAX` y `LOMLOE_COMPS`. |
| `site/recurso.html` | Carga `js/core/config.js`, `js/core/utils.js` y `js/core/curriculo.js` antes de `js/app.min.js`. |
| `site/sw.js` | Incluye los nuevos archivos `js/core/*.js` en precache para no romper la PWA offline. |
| `site/js/curriculo-normativa.js` | Queda como envoltorio de compatibilidad para la ruta historica. |
| `docs/matriz-curricular.md` | Actualiza la ruta canonica de la matriz curricular a `site/js/core/curriculo.js`. |

## Compatibilidad

- `app.js` conserva los nombres publicos e internos usados por el HTML.
- La matriz curricular sigue disponible como `window.MANGA_CURRICULO_NORMATIVO`.
- La nueva referencia canonica es `window.MANGA_CURRICULO`, pero se mantiene el alias anterior.
- Las utilidades extraidas quedan disponibles como `window.MangaUtils.sanitizeHtml` y `window.MangaUtils.escapeHtml`.

## Limites de esta fase

No se han movido `SafeStorage`, `Logger`, `FocusTrap`, `CatalogoLocal`, asistentes IA, exportaciones, quiz ni renderizado de catalogo. Esas piezas tienen efectos de DOM, almacenamiento o dependencias cruzadas y conviene tratarlas en fases posteriores con pruebas mas especificas.
