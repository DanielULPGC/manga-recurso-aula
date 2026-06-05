# Feature — Portada cinematográfica

**Estado:** en producción
**Versión:** v5.10
**Archivo:** `site/index.html` + `site/landing/htm-app.js`

## Problema

El recurso necesita una **puerta de entrada institucional** que comunique en 5 segundos:
- Qué es (recurso didáctico sobre manga).
- Quién lo hace (Aula de Cómic · ULPGC).
- Por dónde entrar (cuatro caminos según rol y etapa).
- Qué tamaño tiene (279 títulos, 9 eras, 5 niveles).

La portada original integrada en `recurso.html` ocupaba 3.772 px (≈ 7 viewports móviles) antes del primer contenido. Demasiado ruido y demasiada altura.

## Solución

Nueva portada standalone (`index.html`) con estética cinematográfica adaptada al brand editorial del recurso. El recurso completo se mueve a `recurso.html`.

**Stack:**
- React 18 + htm 3 (tagged template literals → React.createElement, sin Babel).
- Framer Motion v10 para entrance animations.
- Tailwind CDN para utilidades.
- Tipografía editorial (Shippori Mincho · Cinzel · JetBrains · Noto Serif JP).

**Secciones:**
1. **Hero** — vídeo CSS multicapa (Ken Burns sobre banner ULPGC + tinte rojo + Hokusai waves + grain + partículas doradas) + título palabra-por-palabra con blur-in + stat cards (279/9/5) + nav fija.
2. **4 caminos** — glass cards apuntando a `recurso.html#parte-i .. iv`.
3. **3 capabilities** — Línea del tiempo · Catálogo · Situaciones LOMLOE.
4. **CTA final + créditos institucionales** con segundo fondo en tinte oro.

## Criterios de aceptación

- [ ] La portada renderiza la app React (no se queda en blanco).
- [ ] Los 4 path-cards apuntan exactamente a `recurso.html#parte-i`, `…#parte-ii`, `…#parte-iii`, `…#parte-iv`.
- [ ] El logo 漫 en la nav lleva a `#top` (anchor).
- [ ] Stats card muestra `279`, `9`, `5` correctamente.
- [ ] Mobile: el nav colapsa, mantiene logo + botón Entrar.
- [ ] Sin errores de consola al cargar.

## API / atributos

Ninguna API global. La portada no expone funciones a `window` salvo `window.Motion` (Framer).

## No es

- **No es un index del catálogo.** Para buscar títulos hay que entrar al recurso.
- **No es accesible offline.** Requiere CDNs externos (React, Framer, Tailwind). Si se pierde conexión en la primera carga, no funciona. El recurso (`recurso.html`) sí cachea y funciona offline.
- **No tiene CSP estricta.** Necesita CDNs. La CSP estricta se aplica a `recurso.html`.

## Tests asociados

- `tests/specs/smoke.spec.js` → describe **Portada · cinemática**:
  - `renderiza la app React (no se queda en blanco)`
  - `los 4 caminos enlazan a recurso.html#parte-i .. iv`
