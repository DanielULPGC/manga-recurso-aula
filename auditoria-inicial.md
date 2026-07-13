# Auditoria tecnica inicial

**Proyecto:** El manga como recurso didactico  
**Fecha:** 2026-07-09  
**Alcance:** analisis estatico del repositorio `outputs/manga-aula-app/`, sin modificar archivos del aplicativo.  
**Rol de revision:** arquitectura frontend senior especializada en PWA educativas.

## 1. Estructura real del proyecto

La aplicacion se encuentra dentro de `outputs/manga-aula-app/`, con esta estructura funcional:

```text
outputs/manga-aula-app/
├── AGENTS.md
├── docs/
│   └── README.md
├── reports/
│   ├── README.md
│   └── auditoria-inicial.md
└── site/
    ├── index.html
    ├── recurso.html
    ├── manifest.json
    ├── sw.js
    ├── sw-register.js
    ├── version.json
    ├── css/
    ├── js/
    ├── img/
    ├── icons/
    ├── landing/
    ├── intro/
    ├── tools/
    └── assets/libs/
```

Metrica observada de `site/`: 131 archivos, 25,5 MB. Distribucion principal: 52 `.jpg`, 41 `.js`, 14 `.css`, 9 `.html`, 5 `.png`, 2 `.webp`, 2 `.json`, 2 `.md`, 1 `.mjs`, 1 `.yaml`, 1 `.svg`, 1 `.pdf`.

## 2. Incoherencias entre README, manifest, service worker, scripts y HTML

### Hallazgo 1. Versionado no unificado

**Evidencia:**

- `site/README.md:4`: declara `Version: 5.11`, `app.js: 7.10`, `datos.js: 5.10`.
- `site/version.json:2`: declara `version: 5.55.0`.
- `site/sw.js:4`: cabecera `Version: 5.55.0`.
- `site/sw.js:27`: `CACHE_NAME = 'manga-ulpgc-v5.55.2-f1'`.
- `site/recurso.html:4347`: pie visible con `Ultima actualizacion: 21 de mayo de 2026 · v5.9`.
- `site/recurso.html:4843`: `guia-fix.js?v=5.55.1`.
- `site/recurso.html:5056`: `sw-register.js?v=5.55.2`.

**Impacto:** dificulta saber cual es la version publicable y puede impedir invalidaciones de cache previsibles. Tambien complica la trazabilidad documental del recurso.

### Hallazgo 2. La PWA se declara, pero el registro del service worker la desactiva

**Evidencia:**

- `site/index.html:11` y `site/recurso.html:13`: enlazan `manifest.json`.
- `site/sw.js:31-103`: define `PRECACHE_ASSETS`.
- `site/sw-register.js:4-9`: obtiene registros, ejecuta `reg.unregister()` y borra todas las caches.
- `site/index.html:132` y `site/recurso.html:5056`: cargan `sw-register.js`.

**Impacto:** la instalacion/offline PWA queda rota o, como minimo, neutralizada en cada carga. Es el riesgo funcional mas importante detectado.

### Hallazgo 3. Cache-Control HTML contradice la estrategia offline

**Evidencia:**

- `site/recurso.html:17-19`: `no-cache`, `no-store`, `must-revalidate`, `Pragma: no-cache`, `Expires: 0`.
- `site/sw.js:119-121`: intenta precachear activos durante `install`.

**Impacto:** aunque el service worker funcionara, las directivas HTML y el borrado de caches generan una politica dificil de razonar para un despliegue educativo offline.

### Hallazgo 4. Fuentes externas y uso offline incompleto

**Evidencia:**

- `site/index.html:16-18`, `site/recurso.html:137`, `site/jardin-de-tinta.html:9-11`, `site/parte-i-marco.html:4`: usan Google Fonts.
- `site/sw.js:110-114`: incluye `googleapis.com` en `NETWORK_ONLY_PATTERNS`.

**Impacto:** la primera carga sin red no puede recuperar CSS de fuentes desde Google Fonts. Hay librerias JS vendorizadas, pero no las fuentes.

## 3. Archivos excesivamente grandes o dificiles de mantener

Archivos de texto con mayor deuda:

| Archivo | Lineas | Tamano | Observacion |
|---|---:|---:|---|
| `site/js/app.js` | 19051 | 1.417.784 bytes | Logica principal monolitica. |
| `site/js/app.min.js` | 19051 | 1.417.784 bytes | Identico a `app.js`; no parece minificado. |
| `site/css/estilos.css` | 7374 | 274.021 bytes | Hoja principal muy extensa. |
| `site/recurso.html` | 4743 | 418.231 bytes | HTML con contenido, estilos inline y estructura interactiva concentrada. |
| `site/css/editorial-extras.css` | 3948 | 117.638 bytes | Bloque editorial adicional grande. |
| `site/js/datos.js` | 3781 | 165.607 bytes | Catalogo embebido, razonable pero acoplado. |
| `site/deck-stage.js` | 1636 | 71.934 bytes | Logica de presentacion separada. |

**Evidencia adicional:**

- Hash SHA-256 de `site/js/app.js` y `site/js/app.min.js`: identico.
- `site/recurso.html:4822`: carga `js/app.min.js?v=5.55.0`; por tanto el usuario descarga el mismo peso que el fuente.

## 4. Referencias rotas a recursos inexistentes

Se ejecuto una comprobacion estatica de `src` y `href` locales en HTML, `manifest.json` y `sw.js`.

Referencias locales inexistentes:

| Archivo | Linea | Referencia |
|---|---:|---|
| `site/index.html` | 121 | `intro/intro.mp4` |
| `site/parte-i-marco.html` | 57 | `../recurso.html#parte-ii` |
| `site/parte-i-marco.html` | 58 | `../recurso.html#parte-iii` |
| `site/parte-i-marco.html` | 59 | `../recurso.html#parte-iv` |

**Impacto:** la intro en video fallara en `index.html`; los enlaces de `parte-i-marco.html` salen de `site/` por usar `../`, aunque `recurso.html` esta en la misma carpeta.

## 5. Build actual y artefactos reales

### Hallazgo 5. El script de build existe, pero no es reproducible con el repositorio actual

**Evidencia:**

- `site/tools/build.mjs:24`: importa `terser`.
- No se detecta `package.json`, `package-lock.json`, `pnpm-lock.yaml` ni `yarn.lock` dentro de `site/`.
- `node` no esta disponible en el `PATH` del entorno de auditoria (`NODE_NOT_FOUND_IN_PATH`).

**Impacto:** el comando esperado `node tools/build.mjs` no puede reproducirse solo con los archivos presentes. Falta declarar dependencias y version de Node.

### Hallazgo 6. El build modifica archivos fuente/publicables

**Evidencia:**

- `site/tools/build.mjs:101`: escribe `js/app.min.js` y `js/datos.min.js`.
- `site/tools/build.mjs:113`: escribe transformaciones sobre `sw.js`, `recurso.html` e `index.html`.
- `site/tools/build.mjs:121-128`: propaga versiones a `sw.js`, `recurso.html` e `index.html`.

**Impacto:** no se ejecuto el build durante esta auditoria para respetar la restriccion de no modificar archivos. El script no genera una carpeta `dist/`; sobrescribe artefactos dentro de `site/`.

### Hallazgo 7. Artefacto minificado sospechoso

**Evidencia:**

- `site/js/app.js`: 19051 lineas, 1.417.784 bytes.
- `site/js/app.min.js`: 19051 lineas, 1.417.784 bytes.
- Hash SHA-256 identico entre ambos archivos.

**Impacto:** el recurso carga `app.min.js`, pero actualmente no hay reduccion de peso. Esto afecta rendimiento inicial, cache y depuracion de releases.

## 6. Riesgos de seguridad frontend

### Hallazgo 8. Llamadas directas desde navegador a APIs de IA

**Evidencia:**

- `site/js/app.js:1168`: `fetch('https://api.anthropic.com/v1/messages'...)`.
- `site/js/app.js:1173`: usa cabecera `anthropic-dangerous-direct-browser-access`.
- `site/js/app.js:4408`: construye URL de Gemini con `?key=${api_key}`.
- `site/js/app.js:4769`: guarda clave Gemini en `sessionStorage`.

**Impacto:** no se observan claves hardcodeadas, pero el diseno expone llamadas IA desde frontend y traslada al navegador la custodia de credenciales de usuario. En un contexto educativo con equipos compartidos, debe tratarse como riesgo alto de privacidad, cuota y abuso.

### Hallazgo 9. Inserciones HTML dinamicas numerosas

**Evidencia:**

- `site/js/app.js:383-439`: existe `sanitizeHtml()`, con allowlist.
- `site/js/app.js:4674` y `site/js/app.js:8244`: respuestas IA pasan por sanitizacion tras render Markdown.
- `site/js/app.js:8837`: inserta `html` generado en `content.innerHTML` tras retirar fences Markdown, sin llamada visible a `sanitizeHtml()` en ese punto.
- Busqueda estatica: uso extenso de `innerHTML` en `site/js/app.js` y modulos auxiliares.

**Impacto:** hay una mitigacion relevante, pero no parece aplicada uniformemente. El punto de `site/js/app.js:8837` requiere revision prioritaria porque inserta contenido HTML generado.

### Hallazgo 10. CSP parcial y estilos inline

**Evidencia:**

- `site/index.html:5` y `site/recurso.html:6`: CSP restrictiva, sin `unsafe-eval`.
- `site/index.html:5` y `site/recurso.html:6`: `style-src` permite `'unsafe-inline'`.
- `site/manual-docente.html:718`: incluye script inline y no se observo CSP equivalente en esa pagina.
- `site/recurso.html:367-379`, `site/recurso.html:1392-1421` y multiples bloques posteriores contienen estilos inline.

**Impacto:** la CSP de las paginas principales es una buena base, pero la dependencia de estilos inline impide endurecer `style-src`; paginas secundarias pueden quedar con politica menos controlada.

## 7. Problemas de accesibilidad visibles

### Aspectos positivos observados

- `site/index.html:2` y `site/recurso.html:2`: `lang="es"`.
- `site/recurso.html:291`: enlace de salto a `#main-content`.
- `site/recurso.html:1446`: `main id="main-content"`.
- Uso amplio de `aria-label`, `aria-live`, botones nativos y `aria-pressed`.
- `site/css/estilos.css:1469-1471`: regla global `:focus-visible`.
- `site/css/estilos.css:1488` y otros CSS: presencia de `prefers-reduced-motion`.

### Riesgos y deudas

1. **Portada sin landmarks principales visibles:** `site/index.html` monta la experiencia en `div id="root"` (`site/index.html:129`) y no muestra en HTML base un `main` o `h1` accesible antes de React/HTM.
2. **Dialogo de intro incompleto:** `site/index.html:119` usa `role="dialog"`, pero no se observa `aria-modal="true"` ni gestion estatica de foco; el video referenciado falta (`site/index.html:121`).
3. **Boton de salto de intro sin etiqueta contextual:** `site/index.html:125` tiene texto visible, pero convendria verificar foco inicial y orden de tabulacion.
4. **Exceso de estilos inline:** dificulta revisar contraste y estados de foco de forma sistematica; ejemplos en `site/recurso.html:367-379`, `site/recurso.html:1392-1421`.
5. **`outline: none` en CSS:** aparecen multiples casos, por ejemplo `site/css/estilos.css:1221`, `2217`, `2272`, `2590`, `3137`, `4343`, `4693`, `4903`, `4929`, `5001`, `5058`, `5151`, `6776`, `6962`, aunque tambien hay reglas `focus-visible`. Debe comprobarse que todos los controles afectados recuperan foco visible.
6. **Animaciones/transiciones muy abundantes:** hay `prefers-reduced-motion`, pero se detectan muchas transiciones y animaciones en `site/css/estilos.css`; requiere prueba manual de reduccion de movimiento.

## 8. Priorizacion de intervencion, maximo 10 tareas

1. **Restaurar estrategia PWA real:** sustituir `sw-register.js` para registrar `sw.js` y dejar de desregistrar/borrar caches automaticamente.
2. **Unificar versionado:** definir `version.json` como fuente unica y alinear README, `sw.js`, query strings, pie visible y cache name.
3. **Reparar referencias rotas:** resolver `intro/intro.mp4` y corregir `../recurso.html#...` en `parte-i-marco.html`.
4. **Hacer reproducible el build:** anadir manifiesto de dependencias, version de Node y documentacion de instalacion; separar build de auditoria para que no sobrescriba sin control.
5. **Regenerar minificados reales:** comprobar `terser` y producir `app.min.js` menor que `app.js`; validar `datos.min.js`.
6. **Revisar seguridad IA:** mover llamadas a IA a backend/proxy o documentar explicitamente el modo BYOK; eliminar cualquier fallback que sugiera uso sin clave si no hay backend seguro.
7. **Auditar todos los `innerHTML`:** clasificar fuentes confiables/no confiables y aplicar `sanitizeHtml()` o `textContent` de forma uniforme, especialmente `site/js/app.js:8837`.
8. **Modularizar el monolito:** dividir `app.js`, `estilos.css` y `recurso.html` por dominios funcionales para reducir riesgo de regresion.
9. **Completar auditoria de accesibilidad manual:** teclado, foco, dialogo de intro, reduccion de movimiento, contraste de filtros y controles generados dinamicamente.
10. **Preparar modo offline verificable:** vendorizar fuentes criticas o definir fallback local, revisar `PRECACHE_ASSETS` y probar instalacion en navegador real.

## 9. Verificacion ejecutada

- Mapeo de archivos con `rg --files`.
- Recuento de archivos, extensiones, tamanos y lineas mediante PowerShell.
- Comparacion SHA-256 de `app.js`, `app.min.js`, `datos.js`, `datos.min.js`.
- Busqueda estatica de versionado, CSP, service worker, scripts, `innerHTML`, APIs IA, ARIA, foco y movimiento reducido con `rg`.
- Comprobacion estatica de referencias locales en HTML, `manifest.json` y `sw.js`.

## 10. No verificado

- No se ejecuto `node tools/build.mjs` porque el script modifica archivos publicables y la auditoria debia ser diagnostica.
- No se ejecuto prueba en navegador real ni Lighthouse.
- No se verificaron enlaces externos por red.
- No se validaron contrastes con herramienta automatizada.
- No se realizo prueba de instalacion PWA en Chrome/Edge.
