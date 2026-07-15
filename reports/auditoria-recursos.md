# Auditoria de recursos estaticos

Proyecto: `manga-aula-app/site`  
Fecha: 2026-07-09  
Alcance: HTML, CSS, JS, MJS y JSON de la aplicacion, excluyendo `node_modules/`, `.git/` y herramientas de desarrollo en `site/tools/`.

## Resumen ejecutivo

La auditoria detecta dos referencias locales rotas accionables, veinticinco grupos de imagenes duplicadas exactas por hash y quince imagenes por encima del umbral operativo de 300 KB. No se ha eliminado ni modificado ningun recurso visual.

Datos observados:

| metrica | resultado |
|---|---:|
| Ficheros fuente analizados | 63 |
| Recursos estaticos inventariados | 114 |
| Referencias detectadas | 539 |
| Referencias locales | 387 |
| Referencias externas | 152 |
| Referencias locales rotas | 2 |
| Grupos duplicados por hash SHA-256 | 25 |
| Duplicados por mismo nombre con distinto hash | 0 |
| Duplicados por mismo tamano con distinto hash | 0 |
| Imagenes >= 300 KB | 15 |

Limitacion: las URL externas se han inventariado, pero no se han validado por red. Esta auditoria verifica existencia local, duplicidad de ficheros y peso de recursos.

## Recursos rotos

| recurso | ruta | estado | problema | accion propuesta |
|---|---|---|---|---|
| `../recurso.html` | Referenciado desde `site/parte-i-marco.html` lineas aproximadas 57-59 | Roto | La ruta sube un nivel desde `site/`, por lo que apunta fuera del sitio. El recurso real esta en `site/recurso.html`. | Cambiar los enlaces a `recurso.html#parte-ii`, `recurso.html#parte-iii` y `recurso.html#parte-iv`, verificando navegacion desde servidor local. |
| `intro/intro.mp4` | Referenciado desde `site/index.html` linea aproximada 121 | Roto | El video no existe en `site/intro/`; solo se localizan `card.html` e `intro.html-video.yaml`. | Decidir si se incorpora el MP4 optimizado o si se sustituye el bloque por una imagen/poster existente. No retirar el `source` sin validar la experiencia de portada. |

## Recursos duplicados

Criterio: duplicado exacto por SHA-256. La accion recomendada no es borrar directamente, sino elegir una ruta canonica, actualizar referencias y comprobar `sw.js`/precache antes de retirar copias.

| recurso | ruta | estado | problema | accion propuesta |
|---|---|---|---|---|
| `kyosai-yokai.jpg` | `img/estampas/kyosai-yokai.jpg` y `img/public-domain/kyosai-yokai.jpg` | Duplicado exacto, 3440.0 KB cada copia | Doble almacenamiento de una imagen muy pesada. | Mantener una unica ruta canonica con atribucion clara; actualizar referencias y precache antes de retirar la copia redundante. |
| `sharaku-actor.jpg` | `img/estampas/sharaku-actor.jpg` y `img/sharaku-actor.jpg` | Duplicado exacto, 985.4 KB cada copia | Misma imagen en carpeta tematica y raiz de `img/`. | Consolidar en la ruta usada por la interfaz principal; conservar redireccion logica solo si hay enlaces externos documentados. |
| `hiroshige-lluvia.jpg` | `img/estampas/hiroshige-lluvia.jpg` y `img/hiroshige-lluvia.jpg` | Duplicado exacto, 975.2 KB cada copia | Copia duplicada de alto peso. | Elegir ruta canonica y reemplazar referencias internas. |
| `gw-cresta.jpg` | `img/estampas/gw-cresta.jpg` y `img/gw-cresta.jpg` | Duplicado exacto, 436.2 KB cada copia | Duplicidad de imagen didactica. | Consolidar despues de comprobar usos en `recurso.html` y scripts. |
| `hokusai-gran-ola.jpg` | `img/estampas/hokusai-gran-ola.jpg` y `img/hokusai-gran-ola.jpg` | Duplicado exacto, 423.4 KB cada copia | Duplicidad de imagen de portada/atlas. | Mantener la ruta mas estable para el contenido docente y actualizar referencias. |
| `hokusai-manga-espectro.jpg` | `img/estampas/hokusai-manga-espectro.jpg` y `img/raices-atlas/hokusai-manga-espectro.jpg` | Duplicado exacto, 400.3 KB cada copia | Misma imagen en dos familias de atlas. | Consolidar solo si no se pierde trazabilidad editorial entre `estampas` y `raices-atlas`. |
| `kuniyoshi-esqueleto.jpg` | `img/estampas/kuniyoshi-esqueleto.jpg` y `img/kuniyoshi-esqueleto.jpg` | Duplicado exacto, 355.2 KB cada copia | Doble copia local. | Unificar ruta y regenerar cache PWA. |
| `hokusai-manga-figurillas.jpg` | `img/estampas/hokusai-manga-figurillas.jpg` y `img/raices-atlas/hokusai-manga-figurillas.jpg` | Duplicado exacto, 288.0 KB cada copia | Duplicidad media. | Unificar si ambas secciones pueden compartir ruta sin romper la lectura didactica. |
| `sekiens-kodama.jpg` | `img/estampas/sekiens-kodama.jpg` y `img/public-domain/sekiens-kodama.jpg` | Duplicado exacto, 272.1 KB cada copia | Duplicidad con posible funcion de atribucion. | Mantener una unica copia y preservar creditos en `public-domain/CREDITS.md`. |
| `hokusai-manga-rostros.jpg` | `img/estampas/hokusai-manga-rostros.jpg` y `img/raices-atlas/hokusai-manga-rostros.jpg` | Duplicado exacto, 272.1 KB cada copia | Duplicidad media. | Unificar despues de revisar referencias en app y precache. |
| `gw-trama.jpg` | `img/estampas/gw-trama.jpg` y `img/gw-trama.jpg` | Duplicado exacto, 266.3 KB cada copia | Doble copia local. | Consolidar en carpeta canonica. |
| `hokusai-manga-cargadores.jpg` | `img/estampas/hokusai-manga-cargadores.jpg` y `img/raices-atlas/hokusai-manga-cargadores.jpg` | Duplicado exacto, 265.7 KB cada copia | Duplicidad entre carpetas tematicas. | Unificar si la ruta canonica mantiene sentido documental. |
| `hokusai-manga-sumo.jpg` | `img/estampas/hokusai-manga-sumo.jpg` y `img/raices-atlas/hokusai-manga-sumo.jpg` | Duplicado exacto, 249.6 KB cada copia | Duplicidad entre carpetas tematicas. | Unificar referencias tras prueba visual. |
| `gw-barca.jpg` | `img/estampas/gw-barca.jpg` y `img/gw-barca.jpg` | Duplicado exacto, 233.4 KB cada copia | Doble copia local. | Consolidar en una ruta canonica. |
| `gw-fuji.jpg` | `img/estampas/gw-fuji.jpg` y `img/gw-fuji.jpg` | Duplicado exacto, 226.0 KB cada copia | Doble copia local. | Consolidar en una ruta canonica. |
| `hiroshige-lineas.jpg` | `img/estampas/hiroshige-lineas.jpg` y `img/raices-atlas/hiroshige-lineas.jpg` | Duplicado exacto, 138.2 KB cada copia | Duplicidad menor. | Unificar si no se necesita doble ubicacion semantica. |
| `hiroshige-figuras.jpg` | `img/estampas/hiroshige-figuras.jpg` y `img/raices-atlas/hiroshige-figuras.jpg` | Duplicado exacto, 99.7 KB cada copia | Duplicidad menor. | Unificar en fase de limpieza de imagenes. |
| `sharaku-rostro.jpg` | `img/estampas/sharaku-rostro.jpg` y `img/raices-atlas/sharaku-rostro.jpg` | Duplicado exacto, 97.9 KB cada copia | Duplicidad menor. | Unificar si ambas llamadas son equivalentes. |
| `hiroshige-vigas.jpg` | `img/estampas/hiroshige-vigas.jpg` y `img/raices-atlas/hiroshige-vigas.jpg` | Duplicado exacto, 91.3 KB cada copia | Duplicidad menor. | Unificar despues de revisar referencias. |
| `sharaku-kimono.jpg` | `img/estampas/sharaku-kimono.jpg` y `img/raices-atlas/sharaku-kimono.jpg` | Duplicado exacto, 83.0 KB cada copia | Duplicidad menor. | Unificar en limpieza no destructiva. |
| `gw-cartela.jpg` | `img/estampas/gw-cartela.jpg` y `img/gw-cartela.jpg` | Duplicado exacto, 74.1 KB cada copia | Doble copia local. | Consolidar en carpeta canonica. |
| `sharaku-manos.jpg` | `img/estampas/sharaku-manos.jpg` y `img/raices-atlas/sharaku-manos.jpg` | Duplicado exacto, 73.8 KB cada copia | Duplicidad menor. | Unificar si no hay dependencia de ruta. |
| `kuniyoshi-costillar.jpg` | `img/estampas/kuniyoshi-costillar.jpg` y `img/raices-atlas/kuniyoshi-costillar.jpg` | Duplicado exacto, 55.6 KB cada copia | Duplicidad menor. | Revisar y consolidar en lote. |
| `kuniyoshi-pergamino.jpg` | `img/estampas/kuniyoshi-pergamino.jpg` y `img/raices-atlas/kuniyoshi-pergamino.jpg` | Duplicado exacto, 48.0 KB cada copia | Duplicidad menor. | Revisar y consolidar en lote. |
| `kuniyoshi-craneo.jpg` | `img/estampas/kuniyoshi-craneo.jpg` y `img/raices-atlas/kuniyoshi-craneo.jpg` | Duplicado exacto, 44.3 KB cada copia | Duplicidad menor. | Revisar y consolidar en lote. |

## Recursos pesados

Criterio operativo: imagen binaria igual o superior a 300 KB. Varias entradas son tambien duplicados exactos, por lo que la optimizacion debe priorizar primero consolidacion y despues compresion.

| recurso | ruta | estado | problema | accion propuesta |
|---|---|---|---|---|
| `kyosai-yokai.jpg` | `img/estampas/kyosai-yokai.jpg` | Pesado, 3440.0 KB | Imagen muy grande y duplicada. | Sustituir en consumo web por WebP/AVIF redimensionado; conservar original solo si se justifica como archivo maestro. |
| `kyosai-yokai.jpg` | `img/public-domain/kyosai-yokai.jpg` | Pesado, 3440.0 KB | Misma imagen pesada duplicada. | Mantener una copia canonica y generar derivado optimizado para la PWA. |
| `sharaku-actor.jpg` | `img/estampas/sharaku-actor.jpg` | Pesado, 985.4 KB | Alto peso y duplicado. | Generar WebP de calidad 75-82 y comprobar detalle visual en escritorio y movil. |
| `sharaku-actor.jpg` | `img/sharaku-actor.jpg` | Pesado, 985.4 KB | Alto peso y duplicado. | Retirar solo tras consolidar referencias hacia la ruta canonica. |
| `hiroshige-lluvia.jpg` | `img/estampas/hiroshige-lluvia.jpg` | Pesado, 975.2 KB | Alto peso y duplicado. | Crear derivado WebP/AVIF; mantener JPG como reserva si se usa en `<picture>`. |
| `hiroshige-lluvia.jpg` | `img/hiroshige-lluvia.jpg` | Pesado, 975.2 KB | Alto peso y duplicado. | Consolidar con la copia canonica antes de optimizar. |
| `logo-aula-comic.jpg` | `img/logo-aula-comic.jpg` | Pesado, 805.3 KB | Ya existe alternativa `img/logo-aula-comic.webp` de 27.2 KB referenciada en `<picture>`. | Confirmar soporte visual y mantener JPG solo como fallback; valorar compresion del JPG fallback. |
| `gw-cresta.jpg` | `img/estampas/gw-cresta.jpg` | Pesado, 436.2 KB | Imagen duplicada por hash. | Consolidar y generar variante WebP. |
| `gw-cresta.jpg` | `img/gw-cresta.jpg` | Pesado, 436.2 KB | Imagen duplicada por hash. | Consolidar antes de cualquier borrado. |
| `hokusai-gran-ola.jpg` | `img/estampas/hokusai-gran-ola.jpg` | Pesado, 423.4 KB | Imagen duplicada por hash. | Optimizar despues de decidir ruta canonica. |
| `hokusai-gran-ola.jpg` | `img/hokusai-gran-ola.jpg` | Pesado, 423.4 KB | Imagen duplicada por hash. | Sustituir referencias por derivado moderno si no hay perdida apreciable. |
| `hokusai-manga-espectro.jpg` | `img/estampas/hokusai-manga-espectro.jpg` | Pesado, 400.3 KB | Imagen duplicada entre carpetas tematicas. | Consolidar y comprimir manteniendo legibilidad del trazo. |
| `hokusai-manga-espectro.jpg` | `img/raices-atlas/hokusai-manga-espectro.jpg` | Pesado, 400.3 KB | Imagen duplicada entre carpetas tematicas. | Unificar si no afecta a creditos ni organizacion didactica. |
| `kuniyoshi-esqueleto.jpg` | `img/estampas/kuniyoshi-esqueleto.jpg` | Pesado, 355.2 KB | Imagen duplicada por hash. | Generar derivado WebP y conservar detalle fino. |
| `kuniyoshi-esqueleto.jpg` | `img/kuniyoshi-esqueleto.jpg` | Pesado, 355.2 KB | Imagen duplicada por hash. | Consolidar ruta y validar carga offline. |

## Observaciones complementarias

| recurso | ruta | estado | problema | accion propuesta |
|---|---|---|---|---|
| Recursos externos | 97 URL unicas, 152 apariciones | No verificado por red | La auditoria local no confirma disponibilidad futura, CORS ni estabilidad de enlaces externos. | Realizar una pasada especifica con red para enlaces externos, separando referencias bibliograficas, APIs y fuentes. |
| Recursos no referenciados por el barrido estatico | 23 recursos detectados, incluidos `js/app.js`, `js/datos.js` y varias imagenes en `img/estampas/` | Revision manual | Algunos no son sobrantes: `app.js` y `datos.js` son fuentes del build aunque la pagina cargue los `.min.js`. | No eliminar por este criterio. Revisar solo despues de mapear uso dinamico, build y service worker. |
| `intro/intro.html-video.yaml` | `site/intro/intro.html-video.yaml` | Relacionado con recurso roto | Parece documentar la pieza de video ausente, pero no sustituye al MP4 en navegador. | Usarlo como pista documental para reconstruir o localizar `intro/intro.mp4`. |

## Estrategia de optimizacion propuesta

1. Corregir primero las dos referencias rotas, porque afectan navegacion y experiencia de portada.
2. Definir una convencion canonica de imagenes: por ejemplo, `img/estampas/` para imagenes consumidas por la experiencia visual y `img/public-domain/` solo para originales/atribucion si se decide mantener archivo maestro.
3. Consolidar duplicados en lotes pequenos: actualizar referencias, actualizar `PRECACHE_ASSETS` si procede, ejecutar `npm run build` y comprobar `npm run check`.
4. Generar derivados WebP o AVIF sin perdida visual relevante para imagenes de mas de 300 KB. Para grabados y lineas finas, empezar por WebP calidad 80-85 y comparar visualmente al 100 %.
5. Usar `<picture>` solo donde exista fallback necesario; evitar duplicar JPG pesado si el WebP ya cubre el uso principal.
6. Mantener los originales de valor patrimonial fuera del camino critico de la PWA o en una carpeta documentada como archivo maestro, no precacheada.
7. Verificar despues de cada lote: consola limpia, `Application > Cache Storage`, modo offline y comparacion visual de las secciones con imagenes.

## Prioridad de intervencion

1. `site/index.html`: resolver `intro/intro.mp4`.
2. `site/parte-i-marco.html`: corregir enlaces `../recurso.html`.
3. Imagenes duplicadas y pesadas de mayor impacto: `kyosai-yokai.jpg`, `sharaku-actor.jpg`, `hiroshige-lluvia.jpg`.
4. Fallback pesado `img/logo-aula-comic.jpg`, ya que existe `logo-aula-comic.webp`.
5. Resto de duplicados exactos en lote, preservando atribucion y sentido didactico.
