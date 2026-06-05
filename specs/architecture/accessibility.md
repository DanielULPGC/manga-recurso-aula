# Arquitectura — Accesibilidad y auditoría UX/UI

**Estado:** auditoría cerrada · v5.10 · 23 / 23 hallazgos resueltos
**Informe completo:** `site/revision-uxui.html`

## Estándares de referencia

- **WCAG 2.1 Nivel AA** mínimo en todo el recurso.
- **Real Decreto 1112/2018** (accesibilidad de portales del sector público) — aunque la ULPGC tiene su propia política, el recurso se publica abierto.
- **Material Design / Apple HIG** para tap targets en móvil (≥ 40 px).

## Resumen de la auditoría (mayo 2026)

23 hallazgos detectados antes del cierre del sprint, agrupados:

### Críticos (6 · todos resueltos)

| ID | Hallazgo | Solución |
|---|---|---|
| C-01 | Portada promete 4 caminos, DOM entrega 11 secciones | Reorganizar en 4 PARTES con dividers (`#parte-i..iv`) |
| C-02 | Portada de 3.772 px (7 viewports móvil) | Sublinks quitados, padding ajustado → 1.360 px |
| C-03 | `#catalogo` etc. eran `<div>`, no `<section>` | 7 bloques convertidos a `<section aria-labelledby>` |
| C-04 | Salto H2→H4 | Verificado falso positivo |
| C-05 | "Mapa del recurso" al final, redundante | Eliminado; la portada es el mapa |
| C-06 | `#gtt-btn` z:9999 perforaba overlays | Escala z-index + `body.has-overlay` oculta FABs |

### Importantes (11 · todos resueltos)

| ID | Hallazgo | Solución |
|---|---|---|
| I-01 | Tap targets 22-28 px | `.fb` y `#cmpBtn` a 40 px; `.emocion-nivel-btn` a 38 px |
| I-02 | `#filterBar` sticky 200 px alto | `filter-collapse-sticky.js` colapsa a 56 px al scroll |
| I-03 | Líneas de medida de 811 px | `max-width: 65ch` en 14 selectores de cuerpo |
| I-04 | Párrafos densos | `text-wrap: pretty`, `hyphens: auto`, `line-height: 1.62` |
| I-05 | 11 elementos `fixed` compitiendo | `#gtt-btn` y `#cmpBtn` ocultos, acción al speed dial, auto-hide al scroll |
| I-06 | 31 H2 | 12 demote-d a H3 → 21 H2 (12 estructurales + 9 dialog) |
| I-07 | 1.675 botones | Verificado: todos mutan estado, semánticamente correctos |
| I-08 | `.emocion-bar` color=fondo (negro/negro) | Color forzado a `var(--paper)` |
| I-09 | 4 familias tipográficas | Cinzel + Noto JP cargadas diferidas via `lazy-fonts.js` |
| I-10 | Eyebrow a 11.2 px | Subido a 12.5 px con +letter-spacing |
| I-11 | Cuerpos a opacidad .70 | Subido a .82 (cuerpos largos) / .88 (sobre tinta) |

### Menores (6 · todos resueltos)

| ID | Hallazgo | Solución |
|---|---|---|
| M-01 | Mezcla iconografía (emojis + geométricos + kanji) | 8 emojis → geométricos editoriales (`⌕ ◉ ⊞ ❝ ⊜`) |
| M-02 | Toggle "Solo títulos" críptico | `aria-pressed` dinámico, glifo intercambia `⊟ ↔ ⊞` |
| M-03 | Visit-counter "..." sin loaded state | `<span hidden>` por defecto, desocultar solo si dato existe |
| M-04 | "4 puntos" vs "4 caminos" | Unificado a "4 caminos" |
| M-05 | CSP con formato verboso | Compactada a una línea + docs movidas a `specs/architecture/csp.md` |
| M-06 | Versiones inconsistentes (v5.6/5.8/5.9) | Unificadas a v5.10 con propagación |

## Criterios de aceptación permanentes

- [ ] **Tap targets** ≥ 40 px en filtros y botones primarios.
- [ ] **Líneas de medida** ≤ 65 caracteres en cuerpos largos.
- [ ] **Sin saltos** de jerarquía de headings (h1→h2→h3 sin saltar niveles).
- [ ] **Contraste** AA mínimo: cuerpos a 4.5:1 sobre su fondo.
- [ ] **Sin overlap** de FABs con overlays modales (`body.has-overlay`).
- [ ] **Foco visible** en todos los elementos interactivos.

## Cómo añadir un feature nuevo manteniendo accesibilidad

1. Si añade un componente interactivo, comprobar tap target ≥ 40 px.
2. Si añade texto largo, comprobar `max-width: 65ch` y `text-wrap: pretty`.
3. Si añade FAB / overlay, usar `body.has-overlay` y escala de z-index existente.
4. Si añade contenedor nuevo de bloque, usar `<section id aria-labelledby>` (no `<div>`).
5. Si añade icono, preferir geométrico Unicode (`⊕ ⊙ ✦ ⌕ ◉ ⊞ ❝`) sobre emoji.
