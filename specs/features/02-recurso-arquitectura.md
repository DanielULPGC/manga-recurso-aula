# Feature — Recurso: arquitectura de 4 partes

**Estado:** en producción
**Versión:** v5.10
**Archivo:** `site/recurso.html`

## Problema

La página original mezclaba 11 secciones inconexas sin estructura visible. La portada prometía 4 caminos, pero el DOM no los reflejaba: un usuario que pulsaba "El fondo" recorría 23.000 px sin saber por qué.

## Solución

Reorganizar el recurso en **4 PARTES coherentes con los 4 caminos de la portada**, separadas por *dividers* visuales a tinta llena.

```
PORTADA  →  recurso.html
            │
            ├─ #parte-i   ── MARCO PEDAGÓGICO
            │              porque · decálogo · protocolo · anatomía
            │
            ├─ #parte-ii  ── PARA ETAPAS BAJAS  (featured · rojo)
            │              garantía · cómo-elegir · protocolo-primaria · errores
            │
            ├─ #parte-iii ── EL FONDO
            │              línea del tiempo · catálogo · currículo · glosario · generador
            │
            └─ #parte-iv  ── LLEVAR AL AULA
                           situaciones LOMLOE · itinerarios · universidad · recursos
```

Cada bloque temático dentro de las partes es un `<section id="X" aria-labelledby="X-heading">` con su `<h2 id="X-heading">` correspondiente.

## Criterios de aceptación

- [ ] Existen `#parte-i`, `#parte-ii`, `#parte-iii`, `#parte-iv` en el DOM.
- [ ] Cada divider tiene `data-screen-label` para identificar a qué parte pertenece cualquier elemento bajo él (para `<mentioned-element>`).
- [ ] Las 7 secciones clave (`#catalogo`, `#curriculo`, `#itinerarios`, `#universidad`, `#situaciones`, `#recursos`, `#glosario`) son `<section>`, no `<div>`.
- [ ] Cada una lleva `aria-labelledby="X-heading"` y su h2 lleva `id="X-heading"`.
- [ ] El recurso tiene 21 `<h2>` (no 33) — los sub-bloques son `<h3>`.
- [ ] Cero anchors rotos (`<a href="#x">` con x inexistente).
- [ ] El divider de Parte II usa estilo *featured* (background rojo).

## Invariante de coherencia portada↔recurso

Las 4 path-cards de `index.html` apuntan, respectivamente, a `recurso.html#parte-{i,ii,iii,iv}`. Si cambian los anchors, hay que actualizar:

1. `index.html` o `landing/htm-app.js` (el array `PATHS`).
2. Los dividers en `recurso.html`.
3. Los tests `tests/specs/smoke.spec.js` (Recurso · invariantes / Portada · cinemática).

## No es

- **No es una navegación con tabs.** Las 4 partes son scroll lineal con anchors; no se cargan dinámicamente.
- **No es un sistema multi-página.** Todo vive en `recurso.html`.

## Tests asociados

- `tests/specs/smoke.spec.js` → describe **Recurso · invariantes del catálogo**:
  - `las 4 partes de la portada existen en el DOM`
  - `las secciones clave son <section> con aria-labelledby (C-03)`
  - `no hay enlaces #anchor rotos`
