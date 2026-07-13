# Verificacion PWA

Fecha de verificacion: 2026-07-13

## Alcance

Se verifica el comportamiento PWA del aplicativo servido por HTTP local desde `site/`, con foco en:

- carga de `index.html`, `recurso.html`, `sw.js` y `manifest.json`;
- registro y activacion del service worker;
- existencia de Cache Storage;
- navegacion offline hacia el recurso principal.

## Entorno

- Servidor local: `http://127.0.0.1:8099/`.
- Navegador: Chrome headless 148 mediante Chrome DevTools Protocol.
- Ruta servida: `outputs/manga-aula-app/site/`.
- Runtime auxiliar: Node integrado de Codex para servidor estatico y conexion CDP.

## Resultado observado

| Comprobacion | Resultado |
|---|---|
| `index.html` por HTTP local | 200 OK |
| `recurso.html` por HTTP local | 200 OK |
| `sw.js` por HTTP local | 200 OK |
| `manifest.json` por HTTP local | 200 OK |
| Soporte `navigator.serviceWorker` | Disponible |
| Scope del service worker | `http://127.0.0.1:8099/` |
| Script del service worker | `http://127.0.0.1:8099/sw.js` |
| Estado del service worker | `activated` |
| Pagina controlada tras carga/recarga | Si |
| Cache Storage | `manga-ulpgc-v5.55.0` |
| Navegacion offline a `recurso.html` | Correcta |

## Evidencia de carga offline

Con red emulada como offline, Chrome navego a:

`http://127.0.0.1:8099/recurso.html`

Titulo observado:

`Las eras de Japon y el manga - Recurso didactico · Biblioteca ULPGC`

Texto inicial observado:

`AULA DE COMIC · BIBLIOTECA CAMPUS DEL OBELISCO · ULPGC`

Esto confirma que `recurso.html` queda disponible mediante el service worker y la cache `manga-ulpgc-v5.55.0`.

## Incidencias no bloqueantes

La consola de Chrome registro errores de red asociados a hojas de estilo externas de Google Fonts. En este entorno la red externa esta restringida y, durante la simulacion offline, esas peticiones fallan de forma esperable.

No se observaron errores que impidan:

- registrar el service worker;
- activar el service worker;
- crear la cache versionada;
- cargar `recurso.html` sin conexion.

## Conclusion

El comportamiento PWA basico queda verificado: el aplicativo registra `sw.js`, crea la cache versionada esperada y permite abrir el recurso principal en modo offline. Como mejora futura, si se desea una consola completamente limpia en entornos sin red, conviene estudiar la eliminacion o autohospedaje de fuentes externas.

