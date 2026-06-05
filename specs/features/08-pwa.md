# Feature — PWA (Service Worker + Manifest)

**Estado:** en producción
**Versión:** v5.10 · CACHE_NAME `manga-ulpgc-v5.10`
**Archivos:** `site/sw.js`, `site/sw-register.js`, `site/manifest.json`

## Problema

Wi-Fi escolar es notoriamente inestable. Una docente que prepara una sesión en el aula no debería ver una página rota si se cae la conexión a mitad de proyección. Y el recurso entero (con 279 fichas, situaciones LOMLOE, glosario, manual) puede dejarse instalado en la tablet del centro como app autónoma.

## Solución

Service Worker con caché stale-while-revalidate para todo el recurso. Manifest declarado para que iOS / Android permitan instalación en pantalla de inicio.

**Estrategia de cache:**

1. **Install:** precachea `PRECACHE_ASSETS` (HTML, CSS, JS, manifest, iconos).
2. **Activate:** elimina cachés viejas que no coincidan con `CACHE_NAME` actual.
3. **Fetch:** sirve del cache si hay; si no, va a red y cachea para próxima visita.
4. **Network-only:** APIs externas (`api.anthropic.com`, `generativelanguage.googleapis.com`, `googleapis.com`) nunca se cachean.

## Cómo desplegar una nueva versión

1. Editar archivos.
2. Incrementar `CACHE_NAME` en `sw.js` (`manga-ulpgc-vX.Y`).
3. Sincronizar versión en `recurso.html` (footer + comentario CSP).
4. Sincronizar versión en `README.md` + `specs/overview.md`.
5. Verificar que `PRECACHE_ASSETS` incluye archivos nuevos.

## Criterios de aceptación

- [ ] `sw.js` declara `CACHE_NAME` con versión.
- [ ] `manifest.json` accesible en raíz y enlazado en `recurso.html`.
- [ ] `PRECACHE_ASSETS` incluye `recurso.html`, `index.html`, `landing/htm-app.js`, todos los `.css` y todos los `.js` críticos.
- [ ] APIs externas no se cachean.
- [ ] Una visita exitosa permite uso offline en la siguiente.

## Lista actual de assets precacheados (v5.10)

```js
'./',
'./index.html',
'./recurso.html',
'./landing/htm-app.js',
'./css/estilos.css',
'./css/editorial.css',
'./css/editorial-extras.css',
'./js/app.js',
'./js/datos.js',
'./js/vinetas-generator.js',
'./js/catalog-collapse.js',
'./js/etapa-selector.js',
'./js/left-dock.js',
'./js/overlay-fab-hide.js',
'./js/filter-collapse-sticky.js',
'./js/lazy-fonts.js',
'./js/url-state.js',
'./js/ficha-pdf.js',
'./manifest.json',
'./icons/icon.svg',
```

## No es

- **No es offline-first end-to-end.** Las CDN de Google Fonts, Tailwind, React y Framer (usadas por la portada `index.html`) no entran en el caché. Si el usuario quiere offline real, debe abrir `recurso.html` directamente la primera vez.
- **No sincroniza datos.** No hay backend ni storage de servidor. Lo que el panel docente edita vive en `localStorage`.

## Tests asociados

Validación manual: instalar como PWA en Android/iOS, desconectar Wi-Fi, abrir el recurso, comprobar que catálogo y situaciones LOMLOE están operativos.
