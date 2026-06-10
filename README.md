# El manga como recurso didactico
## Biblioteca Campus del Obelisco | Aula de Comic | ULPGC

**Version del recurso:** 5.51.0

---

## Novedades de la v5.51.0 (refinado visual)

Cinco mejoras visuales sobre los bloques incorporados en v5.49-v5.50,
todas dentro del sistema institucional (pergamino #f5efe0, tinta #1a1008,
rojo hanko #8b1a1a, oro #b8860b; Cinzel / EB Garamond / Noto Serif JP).
Sin !important: css/v551-visual.css se carga el ultimo y gana cascada.

1. **Tabla editorial.** Las tablas de demografias y de puentes lectores
   sustituyen sus estilos en linea por un componente comun: cabecera en
   tinta con filete dorado, zebra sutil, hover, y colapso responsive a
   tarjetas apiladas (<768 px) donde cada celda muestra su etiqueta de
   columna via data-label. Estilos de impresion incluidos.
2. **Sello hanko (firma visual).** En cada tarjeta de mitos, el enunciado
   del mito aparece con tachado caligrafico rojo y un sello 真 (verdad)
   rotado en la esquina, estilo hanko, que marca la refutacion.
3. **Kickers japoneses.** Las cabeceras de las secciones nuevas adoptan el
   patron del glosario (辞書): 誤解 mitos, 架け橋 puentes lectores,
   引用 como citar, 文献 referencias.
4. **Panel de preguntas por era.** Los titulos del fondo se muestran como
   chips dorados sobre tinta; las preguntas de cronologia comparada llevan
   un filete lateral dorado que las distingue sin nuevo acento cromatico.
5. **Revelado sobrio.** Tarjetas de mitos, tablas y bloque de cita entran
   con un fundido de 240 ms al alcanzar el viewport (IntersectionObserver).
   Sin JS todo es visible; prefers-reduced-motion lo desactiva por completo.

---

## Novedades de la v5.50.0 (contenido didactico y guardarrail de build)

0. **Verificacion automatica de codificacion.** `tools/build.mjs` recorre
   ahora todos los ficheros de texto del proyecto antes de la release y
   ABORTA (exit 1) si detecta mojibake (doble codificacion UTF-8), con
   listado de ficheros y muestra. Excluye node_modules y assets/libs.
   Probada con caso limpio y caso infectado.
1. **Intro mas pausada.** La secuencia de tarjetas pasa de 3,3 s a 4 s por
   era (~37 s en total); si algun dia existe intro/intro.mp4, se reproducira
   a playbackRate 0.85. Especificacion YAML actualizada.
2. **Correcciones de exactitud historica.** El termino "manga" circulaba ya
   a finales del s. XVIII: Hokusai lo fijo y popularizo en 1814, no lo
   acuno (corregido en intro de la linea del tiempo, glosario y catalogo).
   El gekiga se data ahora a finales de los anos cincuenta (Tatsumi, 1957).
   Auditoria automatizada del catalogo sin incidencias (los dos "Romeo y
   Julieta" son adaptaciones distintas: edicion 2020 e Igarashi 2022).
3. **Mitos y malentendidos sobre el manga.** Nueva seccion para claustros y
   familias: cinco objeciones frecuentes con refutacion apoyada en los
   datos reales del fondo (59 de 280 titulos con etiqueta sensible) y en la
   bibliografia del marco pedagogico.
4. **Demografias editoriales y etapas.** Tabla orientativa kodomo/shonen/
   shojo/seinen/josei con etapa espanola equivalente y cautela de mediacion,
   al cierre de "Como elegir".
5. **De la pregunta a la lectura.** Los paneles de preguntas detonadoras
   listan ahora los titulos presentes en la columna de su era (derivados del
   DOM de la linea del tiempo, sin datos duplicados).
6. **Autocomprobacion "Raices: del ukiyo-e a la vineta".** Cuarto banco
   formativo (4 preguntas), montado tras la coda visual de raices.
7. **Puentes lectores.** Tabla de nueve correspondencias verificadas entre
   adaptaciones manga del fondo y sus obras literarias de partida
   (Cervantes, Shakespeare, Dostoievski, Kafka, Austen, Homero, Dumas,
   Poe/Lovecraft, Soseki), con sugerencia de aula por fila.

---

## Novedades de la v5.49.0 (auditoria de contenido)

0. **Reparacion critica de codificacion.** `js/app.js`, `js/datos.js`, sus
   `.min`, `manual-docente.html` y `deck-claustro.html` estaban danados por
   doble codificacion UTF-8 (17.830 y 1.352 secuencias mojibake en app.js y
   datos.js): todo el texto inyectado por JS se mostraba corrupto. Revertido
   sin perdidas y verificado con validacion sintactica.
1. **Glosario ampliado.** Seis terminos que el recurso usaba sin definir:
   ukiyo-e, kamishibai, bushido, samurai/shogun, kabuki y mecha.
2. **Cronologia comparada.** Tercera pregunta detonadora por era (las nueve),
   con el marcador "En paralelo", que conecta cada era japonesa con los hitos
   del Eje Canario (sakoku frente a apertura atlantica, posguerra frente a
   emigracion a Venezuela...).
3. **Autocomprobacion "Las eras de Japon".** Nuevo banco formativo de cinco
   preguntas con realimentacion explicativa, montado tras la linea del tiempo
   (practica de recuperacion, Roediger y Karpicke, 2006).
4. **Bibliografia academica visible.** Seccion plegable "Para profundizar" al
   cierre del marco pedagogico: nueve referencias en APA 7, con DOI
   verificados (Delgado-Algarra, 2017; Pare y Soto-Pallares, 2017; Schwartz y
   Rubinstein-Avila, 2006).
5. **Citabilidad e interoperabilidad.** Bloque "Como citar este recurso"
   (APA 7) antes del pie; metadatos Dublin Core y JSON-LD
   (schema.org/LearningResource) en la cabecera de recurso.html.

---

## Novedades de la v5.48.0 (auditoria de ingenieria)

1. **Minificacion real + version unica.** `js/app.min.js` y `js/datos.min.js`
   se generan con Terser (antes eran copias sin minificar). La version vive
   solo en `version.json` y se propaga con `tools/build.mjs`.
2. **Higiene del desplegable.** El material de revision interno se ha movido
   a `dev/` (fuera de este paquete). El desplegable solo contiene produccion.
3. **Soberania offline.** React, ReactDOM, framer-motion, htm y d3 se sirven
   localmente desde `assets/libs/`; Tailwind se compila a `landing/tailwind.css`.
   La portada ya no depende de CDN externos y funciona sin conexion. CSP de
   `index.html` y `recurso.html` con `script-src 'self'`.
4. **PWA instalable en iOS/Android.** Iconos PNG 180/192/512 (`any` y
   `maskable`) ademas del SVG. `manifest.json` corregido.
5. **Carga de scripts unificada a `defer`** (orden de documento, sin
   dependencias implicitas de orden). El grafo de dependencias esta
   documentado en `recurso.html`.

> Nota tecnica: el CSS NO se ha migrado a `@layer` de forma deliberada. El
> proyecto usa ~880 declaraciones `!important` cuya precedencia depende del
> orden de fuente; `@layer` invertiria esa precedencia y romperia reglas
> (incluidas las de contraste de accesibilidad). La consolidacion del CSS
> requiere QA visual regla a regla y queda como trabajo futuro.

---

## Estructura de archivos

```
proyecto/
├── version.json            <- FUENTE UNICA DE VERSION (editar aqui)
├── tools/
│   ├── build.mjs            <- release: minifica JS + propaga version
│   ├── tailwind.config.js   <- config de Tailwind (tema institucional)
│   └── tw-input.css         <- entrada de Tailwind (@tailwind ...)
├── index.html               <- portada (React + htm, stack local)
├── recurso.html             <- recurso completo (~4.750 lineas)
├── sw.js                    <- Service Worker (PWA offline)
├── sw-register.js
├── manifest.json
├── landing/
│   ├── htm-app.js           <- logica de la portada
│   ├── portada-bind.js      <- enlace de globales de las librerias
│   ├── intro-boot.js        <- arranque de la intro (con degradacion)
│   └── tailwind.css         <- Tailwind compilado (generado)
├── assets/libs/             <- librerias vendorizadas (offline)
│   ├── react.production.min.js
│   ├── react-dom.production.min.js
│   ├── framer-motion.js
│   ├── htm.js
│   └── d3.min.js
├── js/
│   ├── app.js / app.min.js          <- nucleo (editar app.js)
│   ├── datos.js / datos.min.js      <- catalogo (editar datos.js)
│   └── (modulos auxiliares)
├── css/                     <- 10 hojas (ver nota sobre @layer arriba)
├── icons/                   <- icon.svg + PNG 180/192/512 any+maskable
├── img/  ·  intro/
├── deck-claustro.html · deck-stage.js · manual-docente.html
├── pagina-vacia.html        <- plantillas A4 (enlazado desde el panel docente)
└── ficha_trabajo_manga.pdf
```

El material de revision (`extras-revision-*`, `revision-uxui.html`) vive en la
carpeta `dev/` del repositorio de trabajo y NO forma parte del desplegable.

---

## Flujo de publicacion

1. Editar el codigo en `js/app.js` y `js/datos.js` (NUNCA los `.min`).
2. Si se tocan clases de Tailwind de la portada, recompilar el CSS:
   `npx tailwindcss -c tools/tailwind.config.js -i tools/tw-input.css -o landing/tailwind.css --minify`
3. Subir la version en `version.json`.
4. Ejecutar:  `npm install terser && node tools/build.mjs`
   (minifica y propaga la version a sw.js, recurso.html e index.html).
5. Publicar. El cambio de `CACHE_NAME` en sw.js invalida la cache previa.

## Uso

Abrir `index.html` en un navegador moderno. Para PWA instalable, servir desde
HTTP (GitHub Pages o `npx serve .`).

## Modo DEBUG

En la consola (F12): `localStorage.setItem('manga_debug','1'); location.reload();`
