# Feature — Catálogo curado

**Estado:** en producción
**Versión:** v5.10
**Archivos:** `site/js/datos.js`, `site/js/app.js`, `site/css/estilos.css`

## Problema

El fondo Aula de Cómic tiene cientos de títulos. Para uso docente, la pregunta no es "¿qué libros hay?" sino "¿qué libro sirve para X en N nivel?". El catálogo necesita estructura pedagógica explícita, no orden alfabético.

## Solución

279 títulos catalogados con metadatos pedagógicos. Cada entrada incluye:

```js
{
  titulo, autor, uso, nivel, color, tip,         // base pedagógica
  periodo, badges, niveles, ods,                  // clasificación
  opac,                                           // enlace a la biblioteca
  sensitive, sens_label,                          // advertencias para etapas bajas
  vitrina,                                        // destacados rotativos
}
```

**Renderizado:** `renderCatalog()` en `app.js` construye una `.cat-card` por entrada con barra de color (uso), título, autor, badges, niveles, ODS, aviso de sensibilidad y acciones (Comparar · Ficha aula · Rúbrica IA · Lectura · Quiz · Exprés · ↓ Ficha PDF).

**Filtros cruzados:** uso pedagógico (8 colores), nivel educativo (5 etapas), ODS (10 objetivos), búsqueda libre por título/autor/tema. Se aplican en simultáneo y todos persisten en la URL (ver `04-url-state.md`).

**Modo colapsado por defecto:** el catálogo arranca oculto con un banner editorial sugiriendo búsquedas. Al pulsar "Ver los 279 títulos en cuadrícula" se expande.

## Criterios de aceptación

- [ ] El catálogo expone exactamente **279 entradas**.
- [ ] Cada entrada tiene `titulo`, `autor`, `uso`, `nivel`, `color`, `tip` como mínimo.
- [ ] Las acciones de cada tarjeta están en `<button>` con `data-action` (no inline handlers).
- [ ] Los filtros `filterUso`, `filterNivel`, `filterOds` están en `window.*` y son re-llamables.
- [ ] Los chips de filtro miden al menos 40 px de alto (tap target WCAG).
- [ ] La sticky `#filterBar` se colapsa a 56 px al scrollear más allá de 1.5× viewport.

## API global

```js
window.CATALOGO                  // array base desde datos.js (no mutar)
window.CATALOGO_EFECTIVO         // base + ediciones locales del panel docente
window.filterUso(v)              // 'all' o uno de: historia, filosofia, emocional, …
window.filterNivel(v)            // 'all' o uno de: infantil, primaria, secundaria, bachillerato, universidad
window.filterOds(v)              // 'all' o un número de ODS
window.filterByEmocion(key)      // entrada por emoción/tema
```

## No es

- **No es una base de datos.** Es un array JS plano. Editar requiere editar `datos.js` o usar el panel docente (que persiste en `localStorage`).
- **No tiene paginación servidor.** Se renderiza todo cliente y se filtra en memoria.
- **No expone la API hacia tarjeta inválida.** `filterUso('basurita')` simplemente no encuentra coincidencias.

## Tests asociados

- `tests/specs/smoke.spec.js` → `el catálogo expone exactamente 279 entradas`
