# Cambios seguros en recursos estaticos

Fecha: 2026-07-09  
Origen: `reports/auditoria-recursos.md`  
Alcance: correcciones seguras de referencias, sin eliminacion de archivos fisicos y sin cambios de diseno.

## Cambios aplicados

| recurso | archivo modificado | cambio aplicado | justificacion | verificacion |
|---|---|---|---|---|
| `../recurso.html#parte-ii` | `site/parte-i-marco.html` | Cambiado a `recurso.html#parte-ii`. | `recurso.html` existe en el mismo directorio que `parte-i-marco.html`; la ruta anterior subia un nivel y quedaba fuera de `site/`. | Existencia local comprobada; `npm run check` ejecutado correctamente. |
| `../recurso.html#parte-iii` | `site/parte-i-marco.html` | Cambiado a `recurso.html#parte-iii`. | Mismo caso: recurso equivalente existente en `site/recurso.html`. | Existencia local comprobada; `npm run check` ejecutado correctamente. |
| `../recurso.html#parte-iv` | `site/parte-i-marco.html` | Cambiado a `recurso.html#parte-iv`. | Mismo caso: recurso equivalente existente en `site/recurso.html`. | Existencia local comprobada; `npm run check` ejecutado correctamente. |
| `intro/intro.mp4` | `site/index.html` | Eliminada la etiqueta `<source>` inexistente y cambiado `preload` a `none` en el `<video>`. | `intro/intro.mp4` no existe. El fallback funcional ya estaba implementado en `landing/intro-boot.js`: si el video no esta disponible, muestra `intro/card.html`. | `intro/card.html` existe; `landing/intro-boot.js` conserva la degradacion a tarjeta; `npm run check` ejecutado correctamente. |

## Cambios no aplicados

| recurso | archivo revisado | decision | motivo |
|---|---|---|---|
| `img/banner-ulpgc-aulacomic.jpg` | `site/recurso.html` y `site/sw.js` | No sustituido. | Ya se sirve `img/banner-ulpgc-aulacomic.webp` mediante `<picture>`. El JPG actua como fallback funcional; retirarlo no es una correccion estrictamente segura. |
| `img/logo-aula-comic.jpg` | `site/recurso.html` y `site/sw.js` | No sustituido. | Ya se sirve `img/logo-aula-comic.webp` mediante `<picture>`. El JPG actua como fallback funcional; retirarlo podria afectar navegadores sin WebP o escenarios offline de fallback. |

## Garantias de alcance

- No se han borrado archivos fisicos.
- No se ha alterado el catalogo de obras.
- No se ha modificado el diseno visual global.
- No se han consolidado duplicados ni cambiado rutas de imagenes patrimoniales en esta fase.
