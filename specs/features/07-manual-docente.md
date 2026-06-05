# Feature — Manual docente imprimible

**Estado:** en producción
**Versión:** v5.10
**Archivos:** `site/manual-docente.html`

## Problema

Hay docentes que prefieren llevarse al aula una versión impresa del marco pedagógico (por qué, decálogo, protocolo, anatomía). El recurso interactivo no se imprime bien porque incluye filtros, modales, FABs, generadores y catálogo de 279 fichas.

## Solución

Versión paralela del marco pedagógico (Bloques I–IV del recurso) maquetada como **manual A4 imprimible**, con `@media print` afinado para que salga limpio sin retoques.

**5 láminas:**

1. **Portada** — eyebrow + título + lede + stats clave.
2. **Por qué** — 6 razones pedagógicas en grid 2×3.
3. **Decálogo** — 10 pautas de mediación en grid 2×5.
4. **Protocolo** — 3 fases (antes/durante/después) en columnas.
5. **Anatomía** — los 6 elementos básicos con maqueta visual.

**Volver al recurso:** botón `← Volver al recurso` en la toolbar superior apunta a `recurso.html` (cambiado en v5.10 al renombrar `index.html → recurso.html`).

**Imprimir:** botón `⎙ Imprimir / Guardar PDF` usa `data-action="printPage"` + listener (no inline onclick, consistente con CSP del resto).

## Criterios de aceptación

- [ ] Tiene `<meta name="viewport">` (escala en móvil).
- [ ] Tiene `<meta name="theme-color">` y `<meta name="description">`.
- [ ] El botón Imprimir usa `data-action="printPage"` (no onclick inline).
- [ ] `@media print` configurado: una sheet por página, sin sombras, sin chrome.
- [ ] Enlace "Volver al recurso" apunta a `recurso.html` (no `index.html`).
- [ ] Tipografía mínima en papel: 11 pt cuerpo (legible a brazo).

## No es

- **No es un PDF estático.** Es HTML que el navegador imprime.
- **No incluye el catálogo** ni las situaciones LOMLOE. Para esas, ficha PDF individual o entrar al recurso.

## Tests asociados

- `tests/specs/smoke.spec.js` → smoke + viewport meta de `/manual-docente.html`
