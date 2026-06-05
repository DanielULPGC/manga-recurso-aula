# Overview — Manga como recurso para el aula

**Estado:** en producción · **Versión:** v5.34 · **Fecha:** mayo 2026

## Visión

Recurso interactivo para profesorado que convierte el fondo de manga del Aula de Cómic de la Biblioteca del Campus del Obelisco (ULPGC) en herramienta didáctica con criterio pedagógico explícito.

No es un catálogo bibliográfico. No es una guía de lectura. Es un **instrumento de planificación pedagógica** que combina:

- **Marco**: por qué el manga funciona en el aula, cómo mediar la lectura.
- **Fondo**: catálogo de 279 títulos con metadatos pedagógicos.
- **Aula**: situaciones LOMLOE listas, itinerarios por etapa, recorridos universitarios.

## Audiencia

- **Docentes de Infantil, Primaria, ESO, Bachillerato y Universidad** que quieren llevar el manga al aula con criterio.
- **Biblioteca y direcciones de centro** que necesitan justificar la decisión en claustro.
- **Investigadores** en educación, narrativa gráfica y didáctica de la lectura.

## Cuatro caminos de entrada

La portada (`index.html`) abre cuatro caminos que coinciden con cuatro PARTES del recurso (`recurso.html`):

1. **Marco pedagógico** — por qué, decálogo de mediación, protocolo, anatomía.
2. **Para etapas bajas** — selección garantía, criterios, mediación en Primaria.
3. **El fondo** — línea del tiempo, catálogo, currículo→manga, glosario.
4. **Llevar al aula** — situaciones LOMLOE, itinerarios, recorridos universitarios, recursos.

Esta correspondencia portada↔contenido se fija como invariante de arquitectura (ver `features/02-recurso-arquitectura.md`).

## Arquitectura técnica

Sitio web estático, mobile-first, PWA instalable. Cero backend, cero base de datos.

- **`index.html`** — portada cinematográfica con React + htm + Framer Motion vía CDN. Sin CSP estricta porque carga CDNs externos.
- **`recurso.html`** — recurso completo con CSP estricta (sin `unsafe-eval`, sin scripts inline). Todo el JS local.
- **`manual-docente.html`** — versión imprimible (manual de 5 láminas A4).
- **`deck-claustro.html`** — presentación de 8 slides con `deck-stage.js`.

Catálogo y lógica en `js/datos.js` (~2.000 líneas con 279 fichas) + `js/app.js` (~20.000 líneas con renderizado, modales, filtros, IA opcional).

## Decisiones de fondo

| Decisión | Por qué |
|---|---|
| **Sitio estático** | Despliegue en GitHub Pages o servidor institucional sin DevOps. |
| **PWA con SW** | Funciona offline en el aula (Wi-Fi escolar inestable). |
| **CSP estricta en recurso** | Reduce superficie de ataque; obliga a delegación de eventos. |
| **Catálogo en JS plano** | Editable sin build step; el panel docente lo extiende. |
| **HTM en lugar de Babel para landing** | Babel-standalone tiene bugs con bundles grandes; HTM compila en runtime. |
| **Tipografía editorial mixta** | Shippori (cuerpo) + Cinzel (etiquetas) + JetBrains (mono) + Noto Serif JP (kanji). Cinzel y Noto se cargan diferidos. |

## Estado

- ✅ Auditoría UX/UI completa cerrada — **23/23 hallazgos resueltos** (ver `architecture/accessibility.md` y `site/revision-uxui.html`).
- ✅ Portada cinematográfica en producción.
- ✅ Catálogo de 279 títulos validado.
- ✅ Tests de regresión Playwright (smoke + url-state + ficha-pdf).
- ✅ PWA con service worker v5.34.

## Roadmap

Ideas evolutivas no incluidas todavía (priorizables si surge demanda):
- **Modo lectura accesible** — vista plana, alto contraste, sin animaciones.
- **Vista grafo del fondo** — D3 con clústeres por autor / era / temática.
- **Bilingüe (EN)** — para alcance académico internacional.
- **Analítica privacy-first** — qué títulos abre más la gente, qué SA descargan.
