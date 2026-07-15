# Accesibilidad basica - Sprint de mejora verificable

Fecha: 2026-07-09

## Alcance

Se ha realizado una mejora conservadora de accesibilidad en la interfaz principal del aplicativo, centrada en navegacion por teclado, foco visible, nombres accesibles, estados ARIA y comportamiento de dialogos. No se ha modificado el catalogo de obras ni se han sustituido textos docentes.

## Cambios aplicados

| Area | Archivo | Linea aprox. | Cambio | Verificacion |
|---|---|---:|---|---|
| Trampa de foco | `site/js/app.js` | 555 | `FocusTrap` ahora puede cerrar el dialogo activo mediante `data-close-action` al pulsar Escape. | Los dialogos con accion declarada cierran de forma consistente y devuelven el foco. |
| Vitrina lateral | `site/js/app.js` | 3432, 3546 | Apertura y cierre pasan por `FocusTrap.activate()` y `FocusTrap.deactivate()`. | El foco queda retenido en el panel y vuelve a la tarjeta de origen. |
| Asistente IA | `site/js/app.js` | 8050, 8885 | El boton flotante sincroniza `aria-expanded`; el panel activa trampa de foco al abrir y la desactiva al cerrar. | El panel se puede cerrar con Escape y conserva el foco dentro. |
| Asistente IA heredado | `site/js/app.js` | 4708-4756 | El panel inyectado dinamicamente recibe `data-close-action`; sus campos tienen nombre accesible y el area de mensajes usa `aria-live`. | Los controles dinamicos no quedan sin etiqueta. |
| Paneles dinamicos | `site/js/app.js` | 20605, 20712 | Ranking y test de vocabulario activan trampa de foco, se cierran por Escape y devuelven foco al elemento de origen. | Dialogos dinamicos no dejan el foco perdido. |
| Filtros y chips | `site/js/app.js` | 2928, 2938, 5936 | Los filtros actualizan `aria-pressed` segun el estado activo. | La seleccion es perceptible para tecnologias de apoyo. |
| Pestanas | `site/js/app.js` | 3218 | Las pestanas sincronizan `aria-selected`, `tabindex` y, cuando existe, `aria-expanded`. | Navegacion por teclado y estado activo mas coherentes. |
| Estrellas de implicacion | `site/recurso.html` | 4427 | Cada estrella tiene `aria-label` explicito. | No dependen solo del simbolo visual de estrella. |
| Estrellas de implicacion | `site/js/app.js` | 4007 | Se sincroniza `aria-pressed` con la puntuacion guardada o seleccionada. | La valoracion queda expuesta como estado activo. |
| Selector de emociones | `site/recurso.html` | 268 | Se anade `aria-label` al boton `#emocionToggle`. | Auditoria estatica: 197 botones, 0 sin nombre accesible. |
| FAB y controles flotantes | `site/recurso.html` | 4777, 4902 | Se completan `aria-controls` y `aria-expanded` en FAB y asistente IA. | Los controles declaran el panel que gobiernan. |
| Dialogos estaticos | `site/recurso.html` | 4676, 4857, 4875, 4911 | Mapa, lectura, historial y asistente declaran `data-close-action`. | Escape puede cerrar el dialogo activo mediante `FocusTrap`. |
| Foco visible | `site/css/estilos.css` | 1473 | Se refuerza `:focus-visible` para botones, enlaces, campos, elementos con `tabindex` y botones flotantes. | Navegacion por teclado con indicador visible. |
| Movimiento reducido | `site/css/estilos.css` | 1509 | Se mantiene y respeta la regla existente `prefers-reduced-motion: reduce`; no se anadieron nuevas animaciones obligatorias. | Usuarios con reduccion de movimiento conservan una experiencia sin transiciones forzadas. |

## Pruebas ejecutadas

| Prueba | Resultado |
|---|---|
| `node --check js/app.js` | Correcto. |
| `npm run build` | Correcto; genera `app.min.js` y `datos.min.js`. |
| `npm run check` | Correcto. |
| `node --check js/app.min.js` | Correcto. |
| Carga local con Chrome headless de `recurso.html` via `file:///` | Correcto, sin fallo de carga del documento. |
| Auditoria estatica de botones en `recurso.html` | 197 botones detectados; 0 sin nombre accesible por texto, `aria-label` o `title`. |
| `git diff --check` | Correcto; solo avisos de normalizacion LF/CRLF ya existentes en el entorno. |

## Resultado frente a criterios

- Navegacion principal posible con teclado: mejorada mediante foco visible, estados de filtros y controles flotantes con relacion `aria-controls`.
- Botones sin nombre accesible evidente: no se detectan en la auditoria estatica de `recurso.html`.
- Modales sin foco perdido: los paneles principales ahora activan trampa de foco, cierran con Escape y devuelven el foco al origen.
- Contenido visual: no se ha eliminado contenido visible.
- Textos docentes y catalogo: no se han sustituido ni reinterpretado contenidos didacticos.

## Limitaciones

La revision es basica y verificable por inspeccion estatica y pruebas de carga. No sustituye una auditoria completa con lector de pantalla real, contraste pixel a pixel o pruebas manuales en todos los navegadores objetivo.
