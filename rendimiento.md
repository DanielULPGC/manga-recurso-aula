# Auditoria de rendimiento frontend

Fecha: 2026-07-13

## Alcance

Se revisan la portada `site/index.html`, el recurso completo `site/recurso.html`, recursos JS/CSS, imagenes y carga percibida. No se modifica catalogo ni diseno.

## Portada `index.html`

| Tipo | Recurso | Estado | Observacion |
|---|---|---|---|
| CSS | `landing/tailwind.css?v=5.55.0` | Critico | Hoja principal de la portada. |
| JS | `assets/libs/react.production.min.js` | Bloqueante antes de la mejora | Libreria necesaria para `landing/htm-app.js`; puede cargarse con `defer` manteniendo orden. |
| JS | `assets/libs/react-dom.production.min.js` | Bloqueante antes de la mejora | Necesaria para portada React/HTM. |
| JS | `assets/libs/framer-motion.js` | Bloqueante antes de la mejora | Coste alto para animaciones de portada; revisar uso real en fase moderada. |
| JS | `assets/libs/htm.js` | Bloqueante antes de la mejora | Necesaria para plantillas HTM. |
| JS | `landing/portada-bind.js?v=5.55.0` | Bloqueante antes de la mejora | Glue de portada. |
| JS | `landing/intro-boot.js?v=5.55.0` | En body | Controla intro; puede diferirse si se acepta pequena demora en inicializacion. |
| JS | `landing/htm-app.js?v=5.55.0` | En body | Monta la portada. |
| JS | `sw-register.js` | No critico | Registro PWA; puede diferirse. |

## Recurso completo `recurso.html`

| Tipo | Recurso | Estado | Observacion |
|---|---|---|---|
| CSS | `css/estilos.css?v=5.55.0` (~268 KB) | Critico | Hoja principal; candidata futura a particionado, no seguro en esta fase. |
| CSS | `css/editorial.css`, `editorial-extras.css`, `marco-bloques*.css`, etc. | Critico/modular | Varias hojas pequenas y medianas; fusionar o cargar por seccion seria moderado. |
| JS | `assets/libs/d3.min.js?v=5.55.0` (~273 KB) | Diferido | Necesario para graficos/timeline; carga diferida correcta. |
| JS | `js/datos.min.js?v=5.55.0` (~128 KB) | Diferido | Catalogo base. |
| JS | `js/app.min.js?v=5.55.0` (~1091 KB) | Diferido pero pesado | Principal coste JS. Requiere modularizacion/lazy loading por funciones. |
| JS | Modulos `vinetas`, `catalog-collapse`, `ficha-pdf`, `planificador`, etc. | Diferidos | Correcto en carga inicial; algunos podrian cargarse bajo demanda en fase moderada. |
| JS | `sw-register.js?v=5.55.0` | No diferido antes de la mejora | Registro PWA no critico. |

## Recursos pesados observados

| Recurso | Peso aprox. | Observacion |
|---|---:|---|
| `img/public-domain/kyosai-yokai.jpg` | 3440 KB | Muy pesado y duplicado por contenido con `img/estampas/kyosai-yokai.jpg`. |
| `img/estampas/kyosai-yokai.jpg` | 3440 KB | Muy pesado. No se sustituye sin version optimizada existente. |
| `img/sharaku-actor.jpg` | 985 KB | Pesado y duplicado con `img/estampas/sharaku-actor.jpg`. |
| `img/hiroshige-lluvia.jpg` | 975 KB | Pesado y duplicado con `img/estampas/hiroshige-lluvia.jpg`. |
| `img/logo-aula-comic.jpg` | 805 KB | Hay `img/logo-aula-comic.webp`; sustitucion segura si mantiene dimensiones. |
| `img/banner-ulpgc-aulacomic.jpg` | 275 KB | Hay `img/banner-ulpgc-aulacomic.webp`; sustitucion segura. |
| `js/app.min.js` | 1091 KB | Carga diferida, pero sigue siendo el principal coste de parse/ejecucion. |

## Mejoras seguras

1. Anadir `defer` a scripts de la portada manteniendo el orden relativo.
2. Diferir `sw-register.js` en portada y recurso completo.
3. Sustituir `banner-ulpgc-aulacomic.jpg` y `logo-aula-comic.jpg` por WebP existentes.
4. Anadir `decoding="async"` a imagenes no criticas y conservar `loading="lazy"` donde ya existe.
5. No tocar el catalogo ni eliminar assets duplicados en esta fase.

## Mejoras moderadas

1. Cargar `d3.min.js` solo cuando se necesiten timeline/grafos.
2. Particionar `app.js` por dominios ya identificados: catalogo, IA, exportacion, alumno, lectura, quiz.
3. Cargar modulos de herramientas (`ficha-pdf`, `planificador`, `vinetas`) bajo demanda desde los botones/FAB.
4. Convertir imagenes grandes de estampas a WebP/AVIF con control visual y mantener JPG como fallback.
5. Revisar si `framer-motion.js` es imprescindible en portada o si puede sustituirse por CSS/transiciones ya existentes.

## Mejoras arriesgadas

1. Fusionar o reorganizar CSS global: puede alterar cascada y diseno.
2. Cambiar la arquitectura de portada React/HTM: puede romper identidad visual cinematografica.
3. Eliminar duplicados fisicos de imagenes: requiere mapa de referencias y pruebas visuales.
4. Sustituir `app.min.js` por carga modular real: deseable, pero requiere fases y pruebas amplias.

## Conclusiones

La mejora inmediata debe centrarse en reducir bloqueo de la portada y evitar decodificacion sincronica de imagenes no criticas. El gran margen de rendimiento esta en modularizar `app.js` y optimizar imagenes historicas pesadas, pero esas acciones requieren una fase especifica para no romper comportamiento ni diseno.
