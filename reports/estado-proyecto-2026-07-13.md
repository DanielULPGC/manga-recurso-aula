# Estado del proyecto · Manga aula · 2026-07-13

**Version / hito actual:** `version.json` 5.56.1; aplicativo PWA educativo organizado en `outputs/manga-aula-app/site/`.

## Hecho en esta sesion

- Corregido el registro PWA: `sw-register.js` registra `sw.js` sin borrar caches en cada carga y con mensajes solo bajo `localStorage.manga_debug === "1"`.
- Reforzado el sistema de build: `tools/build.mjs` genera `js/app.min.js` y `js/datos.min.js`, propaga version a `sw.js`, `index.html` y `recurso.html`, y comprueba coherencia.
- Aniadida capa minima de comprobaciones: enlaces internos, recursos referenciados, version/cache y validacion formal del catalogo.
- Centralizada normativa curricular y documentada en `docs/matriz-curricular.md`.
- Iniciada modularizacion conservadora en `js/core/` sin convertir la aplicacion a framework.
- Mejorada accesibilidad basica: foco visible, ARIA en controles, modales con retorno de foco y respeto a movimiento reducido.
- Reducido riesgo XSS en salidas de IA mediante sanitizacion y aviso visible de revision docente.
- Auditados recursos, rendimiento, seguridad/IA, catalogo y materiales docentes exportables.
- Aplicadas mejoras seguras de rendimiento: scripts diferidos, imagenes no criticas con `loading="lazy"`/`decoding="async"` y sustitucion por WebP existente donde procedia.
- Incorporada navegacion por perfiles en la portada con fallback `noscript`.
- Verificado comportamiento PWA basico por HTTP local con Chrome headless: service worker activado, cache versionada creada y `recurso.html` disponible en modo offline.
- Incorporada `site/ficha-trabajo-manga.html` como alternativa accesible, editable e imprimible al PDF estatico, sin sustituirlo.
- Aniadida `tools/check-browser.mjs` como comprobacion opcional de navegador, PWA y navegacion offline sin framework externo.
- Corregida la identificacion institucional de la portada: el bloque `Institucion` muestra `Facultad de Ciencias de la Educacion`.

## Decisiones tomadas

- No se elimina ningun archivo fisico de recursos: las auditorias proponen optimizacion, pero las acciones destructivas quedan para una fase posterior.
- No se modifica el PDF binario `ficha_trabajo_manga.pdf` porque no se localizo una fuente editable o flujo de generacion trazable.
- La nueva ficha HTML no persiste ni envia los datos introducidos; la privacidad local prima sobre la comodidad de autoguardado.
- La IA sigue disponible, pero sus salidas HTML pasan por sanitizacion y se seniala la necesidad de revision docente.
- Las comprobaciones se mantienen sin navegador y sin framework complejo para ajustarse a una aplicacion HTML/CSS/JS tradicional.

## Verificacion ejecutada

Ejecutada con el runtime Node integrado de Codex, porque `node`/`npm` no aparecen en el PATH de PowerShell de esta sesion:

- `tools/build.mjs`
- `tools/build.mjs --check`
- `tools/check-version-cache.mjs`
- `tools/check-links.mjs`
- `tools/check-resources.mjs`
- `tools/validate-catalog.mjs`
- Analisis de sintaxis de `landing/htm-app.js`
- Verificacion PWA con Chrome headless por CDP: `navigator.serviceWorker.ready`, Cache Storage y navegacion offline a `recurso.html`.
- Inspeccion de la ficha HTML en navegador integrado: estructura accesible, fecha inicializada, consola sin errores y ausencia de desbordamiento a 1365 px y 390 px.
- Comprobacion de Cache Storage para `ficha-trabajo-manga.html`, `css/ficha-trabajo.css` y `js/ficha-trabajo.js`.
- `git diff --check`

Resultado observado: build correcto, cache y version coherentes, enlaces internos correctos, 227 recursos referenciados existentes, catalogo con 280 registros y 0 advertencias.
La verificacion PWA de cierre observo la cache `manga-ulpgc-v5.56.0` y los recursos de la ficha precacheados. La navegacion offline a `recurso.html` se comprobo previamente con la misma estrategia de service worker en v5.55.0.

## Pendiente priorizado

1. Ejecutar literalmente `npm run build`, `npm run check` y `npm run check:browser` en un entorno con Node instalado en PATH y Chrome o Edge sin restricciones de proceso grafico.
2. Revisar con herramienta PDF/UA externa el PDF `ficha_trabajo_manga.pdf`.
3. Decidir en una fase especifica si se eliminan duplicados o recursos pesados, con copia de seguridad y justificacion.
4. Valorar autohospedar o retirar dependencias externas de fuentes si se requiere consola limpia en entornos sin red.
5. Continuar la modularizacion conservadora de `js/app.js` por dominios funcionales.

## Riesgos / deuda conocida

- `js/app.js` sigue siendo un archivo muy grande; la modularizacion solo ha iniciado la extraccion de configuracion y utilidades.
- Persisten numerosos usos de `innerHTML` historicos; los puntos criticos ligados a IA se han mitigado, pero conviene seguir reduciendo superficie.
- La accesibilidad de PDFs generados por impresion depende del navegador y del sistema operativo.
- La verificacion visual completa de la portada y recurso requiere navegador real no headless.
- Las fuentes externas de Google Fonts generan errores de red en entornos sin conexion o con red bloqueada; no impiden la carga offline del recurso.
- `tools/check-browser.mjs` depende de un ejecutable Chrome o Edge. En el entorno aislado de esta sesion, esos binarios cierran su proceso grafico; la verificacion equivalente se completo mediante el navegador integrado.

## No verificado

- Etiquetado PDF/UA mediante herramienta especializada.
- Ejecucion literal de `npm run build` y `npm run check` en una terminal con Node disponible en PATH.
- Ejecucion satisfactoria de `npm run check:browser` con un binario externo de Chrome o Edge; el script supera analisis sintactico y falla de forma explicita si el navegador no puede iniciarse.
