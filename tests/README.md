# Tests de regresión

Suite Playwright para el recurso *Manga como recurso para el aula* · ULPGC.

## Qué cubre

**`specs/smoke.spec.js`** — Smoke tests para cada página principal:
- Carga sin errores de consola
- Estructura semántica básica (`<h1>`, `<title>`, `viewport`)
- Invariantes del catálogo (279 entradas, 4 dividers de partes, secciones con `aria-labelledby`, anchors no rotos)
- Portada cinematográfica (no se queda en blanco, links a `#parte-i..iv`)
- Deck claustro (8 slides)

**`specs/url-state.spec.js`** — Tests del feature *Estado del catálogo en la URL*:
- Lectura inicial: `?uso=`, `?nivel=`, `?ods=`, `?q=` aplican filtros al cargar
- Combinación de varios filtros
- Escritura: pulsar filtros / escribir en buscador refleja en URL
- Volver a "all" / vaciar buscador limpia el param
- Back/Forward del navegador restaura estado anterior
- API pública `window.__urlState.{read,write,apply}`

**`specs/ficha-pdf.spec.js`** — Tests del feature *Ficha PDF por título*:
- Botón ↓ Ficha PDF inyectado en cada una de las 279 tarjetas
- Template `#fichaPDFTemplate` existe pero oculto por defecto
- `window.printFichaPDF(titulo)` puebla el template y llama a `print()`
- El template incluye título, autor, descripción, badges, niveles, ODS y OPAC
- Click en el botón de una tarjeta puebla con los datos correctos
- 3 sugerencias de aula adaptadas al uso pedagógico

## Instalación (una sola vez)

```sh
cd tests
npm install
npm run install:browsers      # baja Chromium (~120 MB)
```

## Correr los tests

**Contra servidor local (autoarranca):**

```sh
npm test                       # headless
npm run test:headed            # con UI del navegador visible
npm run test:ui                # modo interactivo Playwright UI
```

**Contra deploy real:**

```sh
BASE_URL=https://biblioteca.ulpgc.es/manga npm test
```

Saltea el `webServer` y apunta directamente a la URL que pases.

## Salida

Resumen en consola + reporte HTML en `tests/report/`. Para abrirlo:

```sh
npm run test:report
```

En caso de fallo se generan screenshots automáticamente en `tests/test-results/`.

## Servidor estático

`serve.mjs` arranca un HTTP mínimo (Node nativo, sin dependencias) en
`http://127.0.0.1:4173` sirviendo la carpeta `../site`. Lo usa la
configuración de Playwright a través de `webServer`. Para arrancarlo a mano:

```sh
node serve.mjs           # PORT=4174 node serve.mjs para otro puerto
```

## Mantenimiento

- Cuando añadas títulos a `datos.js`, actualiza el invariante de 279 en
  `smoke.spec.js` y la spec `specs/features/03-catalogo.md`.
- Cuando añadas un nuevo `<section id="x">`, añádelo a la lista
  `targets` del test `secciones clave son <section>` y a la spec
  `specs/features/02-recurso-arquitectura.md`.
- Cuando añadas un nuevo path de filtro (ej. `?genero=...`), añade tests
  análogos en `url-state.spec.js` y actualiza la tabla de schema en
  `specs/features/04-url-state.md`.
- Cuando añadas un feature nuevo, **escribe la spec primero** en
  `specs/features/NN-nombre.md` siguiendo la plantilla de `specs/README.md`.
