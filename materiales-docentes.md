# Informe de materiales docentes exportables

Fecha de revision: 2026-07-13

## Alcance

Se revisan el PDF estatico `site/ficha_trabajo_manga.pdf` y los flujos de generacion o exportacion relacionados con fichas docentes en `site/js/ficha-pdf.js`, `site/recurso.html`, `site/css/editorial-extras.css` y `site/js/app.js`.

No se modifica el PDF binario porque no se ha localizado un flujo fuente claro de generacion que permita reconstruirlo de forma trazable.

Actualizacion de cierre: se incorpora `site/ficha-trabajo-manga.html` como alternativa accesible, editable e imprimible. El PDF estatico se mantiene sin cambios.

## Hallazgos

| Elemento | Ruta | Lineas aprox. | Estado | Observacion | Accion propuesta |
|---|---|---:|---|---|---|
| PDF estatico de ficha de trabajo | `site/ficha_trabajo_manga.pdf` | n/a | Funcional, con limitaciones de accesibilidad | Archivo PDF 1.4 de 124,4 KB. La inspeccion textual no detecta `/Title`, `/Lang`, `/StructTreeRoot`, `/MarkInfo` ni `/Alt`, por lo que no hay evidencias de etiquetado semantico, idioma declarado o texto alternativo embebido. | Mantenerlo mientras no exista fuente editable. Crear una alternativa HTML accesible y, si se desea PDF, generar el PDF desde esa fuente HTML. |
| Alternativa HTML imprimible | `site/ficha-trabajo-manga.html`, `site/css/ficha-trabajo.css`, `site/js/ficha-trabajo.js` | n/a | Implementada | Documento con `lang="es"`, titulo, formulario semantico, etiquetas explicitas, foco visible, aviso de privacidad local, revision docente y estilos A4. | Mantenerla como fuente accesible y evolucionarla solo con cambios editoriales documentados. |
| Enlace al PDF estatico | `site/recurso.html` | 3351-3355 | Correcto | El enlace abre `ficha_trabajo_manga.pdf` en una pestana nueva con `rel="noopener noreferrer"`. | Mantener. Anadir en una fase posterior un enlace paralelo a la version HTML imprimible cuando exista. |
| Generador "Ficha PDF" por titulo | `site/js/ficha-pdf.js` | 2-20, 273-281 | Correcto tecnicamente | No genera un PDF binario: inyecta una plantilla HTML oculta, la rellena con datos de catalogo y llama a `window.print()` para que el navegador permita guardar como PDF. | Documentar en interfaz o README como "imprimir/guardar como PDF". Evolucionar hacia una vista HTML imprimible persistente. |
| Plantilla dinamica de ficha | `site/js/ficha-pdf.js` | 34-68, 132-207 | Parcialmente accesible | Usa estructura semantica basica (`header`, `section`, `h1`, `h2`, lista y enlace OPAC). Los datos del catalogo se insertan con `textContent` y creacion de nodos, lo que reduce riesgo XSS. | Mantener el patron de insercion segura. Si se crea alternativa HTML, conservar jerarquia de encabezados y listas. |
| Estado oculto de plantilla | `site/js/ficha-pdf.js` | 34-37 | Limitacion | La plantilla se crea como `aside` con `aria-hidden="true"` y `hidden=true`; es razonable para no duplicar contenido en pantalla, pero no constituye una alternativa HTML navegable por tecnologias de apoyo. | Crear una ruta HTML imprimible accesible, no oculta, para consulta previa e impresion. |
| CSS de impresion de ficha | `site/css/editorial-extras.css` | 2727-2765 | Correcto para impresion visual | Oculta toda la aplicacion salvo la ficha cuando `body.printing-ficha-pdf` esta activo y define pagina A4. | Mantener. Revisar contraste en papel si se consolidan colores de badges y ODS. |
| Exportacion HTML de lectura guiada | `site/recurso.html`, `site/js/app.js` | 4868, 20414-20506 | Buen precedente | Existe un boton `Exportar HTML` y una funcion que genera un documento HTML independiente con `lang="es"`, titulo y estilos de impresion. | Reutilizar este patron para una ficha de trabajo general accesible. |
| Otras salidas imprimibles | `site/js/app.js` | 3151-3216, 8463-8507, 8833-8856, 20319-20377 | Varias | Hay varios flujos de impresion/clonado y exportacion HTML. Resuelven casos concretos, pero no comparten una utilidad comun para documentos imprimibles accesibles. | En una fase posterior, extraer una utilidad minima de documento imprimible con metadatos, idioma, foco y sanitizacion. |

## Evaluacion de accesibilidad

### PDF estatico

El archivo `site/ficha_trabajo_manga.pdf` parece ser un PDF estatico distribuido como recurso descargable. La inspeccion tecnica basica indica:

- Cabecera valida `%PDF-1.4`.
- Sin evidencia textual de titulo embebido (`/Title`).
- Sin evidencia textual de idioma (`/Lang`).
- Sin evidencia textual de arbol estructural (`/StructTreeRoot`) ni marcas de accesibilidad (`/MarkInfo`).
- Sin evidencia textual de textos alternativos (`/Alt`).

Esta comprobacion no sustituye una auditoria con PAC, Acrobat Preflight u otra herramienta PDF/UA, pero es suficiente para marcar el documento como candidato a mejora accesible.

### Ficha dinamica imprimible

El flujo de `site/js/ficha-pdf.js` es razonable para una aplicacion sin dependencias externas:

- Evita librerias pesadas de PDF.
- Deja al navegador la generacion final del PDF.
- Inserta datos del catalogo mediante `textContent` o nodos DOM, no mediante HTML de usuario.
- Mantiene una jerarquia logica de encabezados y secciones.

Sus principales limites son:

- La ficha no existe como pagina HTML permanente navegable antes de imprimir.
- La accesibilidad del PDF final depende del navegador y del sistema operativo.
- No hay metadatos de documento controlados cuando el usuario guarda como PDF desde el dialogo del navegador.
- La plantilla esta oculta con `aria-hidden`, por lo que no sirve como alternativa accesible en pantalla.

## Version HTML imprimible accesible

La alternativa HTML se ha implementado con los siguientes criterios:

1. Documento independiente con `<!doctype html>`, idioma español, titulo y descripcion.
2. Formulario organizado en cinco bloques de lectura y una seccion de revision docente.
3. Etiquetas accesibles para todos los controles y navegacion por teclado.
4. CSS propio para pantalla, movil e impresion A4, sin fuentes externas.
5. Accion explicita para imprimir o guardar como PDF mediante el dialogo nativo.
6. Aviso de que los datos no se envian ni se guardan automaticamente.
7. Enlace paralelo en `recurso.html`, sin retirar el PDF existente.
8. Precarga PWA de la pagina, su CSS y su JavaScript.

## Priorizacion

1. Revisar el PDF estatico con una herramienta especifica de accesibilidad PDF y decidir si se mantiene como legado o se regenera desde HTML.
2. Valorar si la ficha dinamica por titulo debe compartir estructura con la nueva ficha general.
3. Ajustar en una fase editorial el texto de los botones "Ficha PDF" hacia "Imprimir / guardar como PDF".
4. Mantener pruebas de enlaces, recursos, version y cache para la nueva ruta.

## Verificacion manual recomendada

- Abrir `site/recurso.html` por HTTP local.
- Entrar en el catalogo y pulsar "Ficha PDF" en una obra.
- Confirmar que la vista previa de impresion contiene solo la ficha seleccionada.
- Guardar como PDF y comprobar que el texto es seleccionable.
- Abrir `site/ficha_trabajo_manga.pdf` y revisar metadatos, idioma y etiquetas con una herramienta PDF/UA.

## Verificacion de la alternativa HTML

- Estructura semantica inspeccionada en navegador: encabezados, regiones, grupos y nombres accesibles correctos.
- Fecha local inicializada por `site/js/ficha-trabajo.js`.
- Sin errores de consola observados en la ficha.
- Sin desbordamiento horizontal a 1365 px ni a 390 px.
- Service worker activado y recursos de la ficha presentes en `manga-ulpgc-v5.56.0`.
