# El manga como recurso didáctico
## Biblioteca Campus del Obelisco · Aula de Cómic · ULPGC

**Versión pública:** definida exclusivamente en `version.json`

### Estructura de archivos

```
proyecto/
├── index.html          ← Portada cinematográfica (NUEVA · v5.10)
├── recurso.html        ← Recurso completo (antes index.html · ~313 KB)
├── ficha-trabajo-manga.html ← Ficha accesible, editable e imprimible
├── sw.js               ← Service Worker (PWA offline)
├── manifest.json       ← Manifiesto PWA (instalable)
├── landing/
│   └── htm-app.js      ← React + htm (sin Babel) — portada cinematográfica
├── js/
│   ├── app.js          ← Lógica principal (~20.000 líneas)
│   └── datos.js        ← Catálogo de 280 títulos
├── css/
│   └── estilos.css     ← Estilos (~7.600 líneas)
└── icons/
    └── icon.svg        ← Icono PWA (maskable)
```

### Uso

Abrir `index.html` en un navegador moderno (Chrome, Firefox, Safari, Edge).
Para funcionar como PWA instalable, debe servirse desde un servidor HTTP
(GitHub Pages, servidor local con `npx serve .`, etc.).

### PWA y service worker

`sw-register.js` registra `sw.js` cuando la app se sirve por HTTP o HTTPS. Si el
recurso se abre directamente como archivo local (`file://`), el registro se omite
sin mostrar errores de consola para que la app siga cargando como sitio estatico.

El registrador no elimina caches durante la carga normal. Para tareas de
depuracion existe una funcion explicita en consola:

```js
window.mangaPwaDebug.clearCaches()
```

Los mensajes de registro solo aparecen con el modo DEBUG activo:

```js
localStorage.setItem('manga_debug', '1')
location.reload()
```

### Build y release

La version publica se edita solo en `version.json`. Para preparar una release:

```bash
npm install
npm run build
npm run check
```

`npm run build` minifica `js/app.js` y `js/datos.js`, regenera
`js/app.min.js` y `js/datos.min.js`, actualiza `CACHE_NAME` en `sw.js` y propaga
la version a las query strings `?v=` de `index.html`, `recurso.html` y
`ficha-trabajo-manga.html`.

`npm run check` ejecuta una suite minima sin navegador:

- `tools/build.mjs --check`: codificacion, artefactos minificados actualizados,
  tamanos menores que las fuentes, `CACHE_NAME` y query strings coherentes con
  `version.json`.
- `tools/check-version-cache.mjs`: coherencia explicita entre `version.json`,
  `sw.js` e HTML versionado.
- `tools/check-links.mjs`: enlaces internos y anclas de HTML principal.
- `tools/check-resources.mjs`: existencia de CSS, JS, imagenes, PDF, iconos,
  manifest y assets precacheados por el service worker.
- `tools/validate-catalog.mjs`: integridad formal de `js/datos.js`; genera
  `../reports/catalogo-validacion.md` con errores, advertencias y
  recomendaciones, sin modificar datos del catalogo.

Cada comprobacion puede ejecutarse por separado con:

```bash
npm run check:build
npm run check:version
npm run check:links
npm run check:resources
npm run check:catalog
```

La comprobacion opcional con navegador real requiere Chrome o Edge instalado:

```bash
npm run check:browser
```

Esta prueba levanta un servidor local efimero, comprueba la portada, el recurso y
la ficha, verifica el service worker y la cache versionada, y navega a
`recurso.html` con la red emulada como desconectada. Si el navegador no esta en
una ruta habitual, puede indicarse mediante `CHROME_PATH`.

Para probar en local:

```bash
npm run serve
```

Por defecto sirve el sitio en `http://127.0.0.1:8080/`. Puede cambiarse con las
variables `PORT` y `HOST`.

### Materiales imprimibles

`ficha-trabajo-manga.html` es la alternativa accesible y editable al PDF
estatico `ficha_trabajo_manga.pdf`. Puede completarse en pantalla y el boton
"Imprimir o guardar como PDF" abre el dialogo nativo del navegador. La pagina
no envia ni persiste los datos introducidos.

El PDF estatico se conserva como material legado hasta que exista una fuente de
generacion trazable o se complete una revision especializada PDF/UA.

### Mantenimiento del catálogo

El catálogo se actualiza a través del **Panel docente** (icono ✎ en el FAB):

1. **Editor** → Añadir / editar / eliminar títulos individualmente
2. **Importar** → Subir CSV o JSON (flujo Excel ↔ app)
3. **Exportar** → JSON completo o CSV local para revisión
4. **Validar** → Comprobar integridad del catálogo

Para actualizar el catálogo base en `datos.js`, editar el archivo,
incrementar `version.json` y ejecutar `npm run build`. El build actualiza
`CACHE_NAME` y las query strings de recursos versionados.

### Activar modo DEBUG

En la consola del navegador (F12):
```js
localStorage.setItem('manga_debug', '1')
location.reload()
```

Para desactivar: `localStorage.removeItem('manga_debug')` + recargar.

### Historial de versiones (ciclo de mejoras 2026)

| Sprint | Mejora |
|--------|--------|
| P1–P3  | SW sincronizado · SafeStorage · PWA manifest |
| P4–P5  | Logger DEBUG · Sanitización XSS |
| P6–P7  | @media print · Dark mode completo |
| P8–P10 | Quiz 280 títulos · Exportación docente · Accesibilidad D3 |
| P11–P16 | Seguridad · Trampa de foco · Virtual scrolling · Backoff IA · CSP · Event delegation |
| P17–P22 | Lectura guiada 280 títulos · Historial persistente · QR pasaporte · Panel docente · Offline IA · URLs cortas |
| P23–P26 | Editor catálogo · Importador CSV/JSON · Validador esquema · Notificador novedades |
