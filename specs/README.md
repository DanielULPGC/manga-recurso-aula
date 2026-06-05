# Specs — Manga como recurso para el aula

Documentación canónica del proyecto siguiendo **Spec-Driven Development**.

## Qué es SDD aquí

Cada feature tiene **tres documentos**:

1. **Spec** (`specs/features/NN-nombre.md`) — qué hace, por qué, criterios de aceptación.
2. **Test** (`tests/specs/nombre.spec.js`) — criterios de aceptación ejecutables.
3. **Implementación** (`site/js/nombre.js`, CSS, HTML) — código que pasa los tests.

La spec manda. Cuando el código y la spec discrepen, decidir cuál tiene razón antes de tocar nada — si la spec es ambigua, actualizarla; si el código está mal, arreglarlo y dejar que el test falle hasta corregirlo.

## Plantilla de spec

```markdown
# Feature — Nombre

**Estado:** propuesto / en producción / deprecado
**Versión:** v5.x

## Problema
Qué pretende resolver, para quién.

## Solución
Cómo lo resuelve, decisiones clave y trade-offs.

## Criterios de aceptación
- [ ] Lista de cosas que el feature DEBE cumplir.
- [ ] Cada criterio se valida con un test concreto.

## API (si aplica)
Funciones globales, eventos, atributos data-*, URL params, etc.

## No es
Lo que el feature explícitamente NO hace, para evitar scope creep.

## Tests asociados
Referencias a tests/specs/nombre.spec.js
```

## Índice

### Visión

- [`overview.md`](./overview.md) — Vision, arquitectura, paths principales

### Features

- [`features/01-portada.md`](./features/01-portada.md) — Landing cinematográfica
- [`features/02-recurso-arquitectura.md`](./features/02-recurso-arquitectura.md) — Recurso principal: 4 partes coherentes con portada
- [`features/03-catalogo.md`](./features/03-catalogo.md) — Catálogo curado de 279 títulos
- [`features/04-url-state.md`](./features/04-url-state.md) — Estado del catálogo en URL
- [`features/05-ficha-pdf.md`](./features/05-ficha-pdf.md) — Generador de ficha PDF por título
- [`features/06-deck-claustro.md`](./features/06-deck-claustro.md) — Presentación de 8 slides
- [`features/07-manual-docente.md`](./features/07-manual-docente.md) — Manual imprimible
- [`features/08-pwa.md`](./features/08-pwa.md) — Service Worker y caché offline

### Arquitectura (transversal)

- [`architecture/csp.md`](./architecture/csp.md) — Content Security Policy
- [`architecture/accessibility.md`](./architecture/accessibility.md) — Accesibilidad y auditoría UX/UI
- [`architecture/design-system.md`](./architecture/design-system.md) — Tipografía, color, layout
