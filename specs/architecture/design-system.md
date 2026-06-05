# Arquitectura — Sistema de diseño

**Estado:** en producción · v5.10

## Paleta

```
--ink:    #1a1410  ← cuerpo de texto en pantalla; tinta editorial
--ink2:   #0e0a04  ← negro más profundo para portada cinematográfica
--paper:  #f3ede1  ← fondo principal (recurso)
--paper2: #e8ddc8  ← variante más cálida para superficies elevadas
--red:    #b8341d  ← énfasis, eyebrows, alertas suaves
--gold:   #b8860b  ← decoración, separadores, ODS, kanji
--grey:   #6b6255  ← texto secundario
--rule:   #c8b89a  ← líneas finas, separadores en pantalla
```

**Stacks de variantes** para la línea del tiempo (`--v1` a `--v12`): tonos por área pedagógica (historia, filosofía, emocional, lengua, inclusión, visual, ciencia, género, primeros lectores).

## Tipografía

| Familia | Uso | Peso | Carga |
|---|---|---|---|
| **Shippori Mincho B1** | Cuerpo y headings principales | 400, 500, 600, 700 | Crítica · primer paint |
| **JetBrains Mono** | Eyebrows, mono, metadatos | 400, 500 | Crítica |
| **Cinzel** | Etiquetas decorativas, badges de filtros | 400, 700 | Diferida (`lazy-fonts.js`) |
| **Noto Serif JP** | Kanji y términos japoneses (glosario) | 400, 700 | Diferida (`lazy-fonts.js`) |
| **EB Garamond** | Variantes editoriales (manual docente) | 400, 600, italic | Crítica solo en manual |

## Escala

```
H1 portada cinematográfica: clamp(3rem, 9vw, 7.5rem)
H1 recurso (parte-divider): 3.4rem desktop / 2.2rem móvil
H2 sec-title:               2.4rem desktop / 1.8rem móvil
H3 (sub-bloques):           1.5-2rem
Body (cuerpos largos):      1rem / 16 px · line-height 1.55-1.62
Body (cards densos):        0.96-1rem
Eyebrow / mono:             0.78rem (~12.5 px) · letter-spacing 0.16em
Caption / metadata:         0.7rem-0.78rem
```

**Mínimos legibles:** ningún cuerpo de párrafo por debajo de 0.92 rem (~14.5 px). Etiquetas mono pueden bajar a 0.65 rem solo si decorativas, no si transmiten información primaria.

## Layout

- **Anchos**: `max-width: 1400px` en contenedores principales. `max-width: 65ch` en cuerpos largos.
- **Grid principal**: CSS Grid con `gap`, nunca márgenes ad-hoc.
- **Flex con gap** para grupos de elementos hermanos (chips, badges, botones).
- **Bordes**: hairline `1px solid var(--rule)` o tinta plena `1.5px solid var(--ink)`.

## Componentes

### `.cat-card` (tarjeta del catálogo)

Barra de color de uso + título + autor + badges + niveles + ODS + acciones. Hover sube z-index local (no global).

### `.parte-divider`

Block a tinta llena que separa las 4 PARTES del recurso. Featured (Parte II) usa rojo. Animaciones de entrada con IntersectionObserver.

### `.liquid-glass` (portada)

Glass primitive con borde gradient enmascarado. Variante `.liquid-glass-strong` con más blur y opacidad para CTAs primarios.

### FABs

Speed dial bottom-right (`#tools-fab`) consolida todas las acciones flotantes. Auto-hide al scroll hacia abajo. `body.has-overlay` los oculta cuando hay un modal abierto.

## Animaciones

- **Entrada**: blur(10px) → blur(0) + translateY(20-50) + opacity. Duración 0.6-0.85 s, ease `easeOut`.
- **Hover de cards**: translateY(-4px), transición 0.18 s.
- **Sticky compacto**: transición de 0.22 s en `max-height`.
- **Speed dial hide**: 0.28 s con `cubic-bezier(.4,0,.2,1)`.

## Iconografía

Sólo geométricos Unicode (editoriales):

```
⊕  acción primaria, añadir
⊙  toggle
✦  destacado, premium
⌕  buscar (en lugar de 🔍)
◉  quiz / target (en lugar de 🎯)
⊞  guía / documento (en lugar de 📄)
❝  reflexión / cita (en lugar de 💬)
⊜  adaptaciones / paralelo (en lugar de 📚)
✱  exprés / rápido (en lugar de ⚡)
⎙  imprimir
↓  descargar
↺  reiniciar
```

**Excepciones permitidas:** 🌊 (eje Canarias en línea del tiempo) y 📡 (modo offline IA) — donde la metáfora emoji es semánticamente única.

**Kanji decorativo:** `漫画` (manga), `辞書` (glosario), `教室の漫画` (manga en aula) — solo en cabeceras de sección japonesa. Carga diferida.

## Espaciado

Escala 8/4 (múltiplos de 8 px, sub-pasos de 4 px). Padding interno generoso en bloques editoriales (88-120 px deck, 48-64 px web).

## Cuándo romper el sistema

- **Print stylesheets** sobreescriben tipografía y color para máxima legibilidad en papel.
- **Modo proyección** del recurso fuerza max font-size y oculta micro-tipografía.
- **Editorial liberty**: una sola palabra puede usar tipografía/color disonante si es el énfasis del titular (ej. *viñetas* en italic rojo en `Leer en viñetas también es leer`).
