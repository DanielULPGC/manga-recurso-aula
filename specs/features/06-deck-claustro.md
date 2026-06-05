# Feature — Deck claustro (8 slides)

**Estado:** en producción
**Versión:** v5.10
**Archivos:** `site/deck-claustro.html`, `site/deck-stage.js`

## Problema

Una docente o bibliotecaria necesita presentar el recurso al claustro o departamento en ≈ 15 minutos. Necesita un material visual independiente del navegador del recurso completo, proyectable en pantalla de aula (1920×1080) y exportable a PDF.

## Solución

Deck de 8 slides usando `<deck-stage>` (web component starter), cada slide a 1920×1080 con padding generoso y la misma paleta editorial del recurso.

**Estructura:**

| N  | Slide                                       |
|----|---------------------------------------------|
| 01 | Portada — título + stats                    |
| 02 | Por qué — 6 razones (grid 3×2)              |
| 03 | Decálogo I — pautas 01-05                   |
| 04 | Decálogo II — pautas 06-10                  |
| 05 | Protocolo — antes / durante / después       |
| 06 | Anatomía — koma, fukidashi, ma, RTL         |
| 07 | El fondo — 279 títulos, 9 eras, datos clave |
| 08 | Cierre — recurso + créditos                 |

Cada slide tiene `data-screen-label` para identificarla en comentarios. Speaker notes en `<script type="application/json" id="speaker-notes">`.

## Criterios de aceptación

- [ ] El deck tiene exactamente **8 slides**.
- [ ] Cada slide es `<section>` dentro de `<deck-stage>`.
- [ ] Cada slide tiene `data-screen-label="NN Nombre"`.
- [ ] El cuerpo de las cards (`.gb`) cabe dentro del grid sin desbordar al `.s-foot`.
- [ ] El `<title>` y `<meta name="viewport">` están presentes.
- [ ] Texto del cuerpo a 19 px mínimo (proyectable desde 4ª fila de aula).
- [ ] Etiquetas eyebrow ≥ 18 px (compromiso editorial; eyebrows muy decorativos pueden bajar a 14-16 px).
- [ ] Sin errores de consola al cargar.

## Cómo presentar

- **Teclado:** flechas para avanzar/retroceder.
- **Click derecho en thumbnail rail:** saltar / mover / reordenar slides.
- **Imprimir como PDF:** Cmd+P → "Guardar como PDF". `deck-stage.js` formatea 1 slide por página.
- **Speaker notes:** se exponen via `postMessage` del componente.

## No es

- **No es responsive móvil.** Está fijado a 1920×1080 con scale. En móvil se ve letterboxed.
- **No incluye el catálogo completo.** Es un material introductorio; el detalle está en `recurso.html`.

## Tests asociados

- `tests/specs/smoke.spec.js` → `Deck claustro · tiene 8 slides`
