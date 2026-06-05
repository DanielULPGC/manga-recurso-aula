# Feature — Ficha PDF por título

**Estado:** en producción
**Versión:** v5.10
**Archivos:** `site/js/ficha-pdf.js`, `site/css/editorial-extras.css`

## Problema

Una docente que prepara su programación quiere imprimir la ficha de un título concreto (con descripción pedagógica, badges, sugerencias de uso, enlace al préstamo) para llevarla al claustro, repartirla en su departamento, o adjuntarla a un dosier ICUS.

Las fichas existen ya en navegador. Lo que falta es un paso para tener cada una como **una hoja A4 imprimible**.

## Solución

Botón "↓ Ficha PDF" en cada `.cat-card-actions`. Al pulsarlo, popula un template oculto con los datos del título, activa una clase en el `<body>` y dispara `window.print()`. El CSS de `@media print` oculta todo lo demás y formatea el template a A4.

**Por qué impresión nativa y no jsPDF:**

| Decisión | Razón |
|---|---|
| Sin lib de PDF | Cero KB extra, sin violar CSP estricta. |
| Impresión del navegador | Texto seleccionable, kerning real, búsqueda dentro del PDF, hyphens. |
| Template HTML + CSS | El usuario edita estilos sin tocar JS. |
| Sugerencias por `uso` | 8 conjuntos predefinidos + fallback genérico. |

## Estructura de la ficha generada

```
┌─ FICHA PEDAGÓGICA · AULA DE CÓMIC · ULPGC ─┐
│ Vagabond                                   │ ← título h1, italic
│ Takehiko Inoue · 2013                      │ ← autor en serif italic
│ EDAD MODERNA · JAPÓN EDO S. XVII           │ ← período mono caps
│                                            │
│ [Historia] [Bachillerato] [Universidad]    │ ← badges + niveles
│ ODS: ④ ⑯                                  │
│                                            │
│ ── DESCRIPCIÓN PEDAGÓGICA ──               │
│ Biografía de Miyamoto Musashi (1584–1645)… │
│                                            │
│ ── SUGERENCIAS DE AULA ──                  │
│ · Contraste con fuentes históricas         │
│ · Línea del tiempo en clase                │
│ · Investigación complementaria             │
│                                            │
│ ── LOCALIZACIÓN ──    ── GENERADO ──       │
│ OPAC ULPGC →          28 mayo 2026         │
│                       v5.10 · CC BY-NC 4.0 │
└────────────────────────────────────────────┘
```

## Criterios de aceptación

- [ ] El botón ↓ Ficha PDF se inyecta en **cada una de las 279 tarjetas**.
- [ ] El template `#fichaPDFTemplate` existe en el DOM y está oculto por defecto.
- [ ] `window.printFichaPDF('Título exacto')` puebla el template y llama a `window.print()`.
- [ ] Tras `printFichaPDF`, el template contiene: título, autor, período, descripción no vacía.
- [ ] Para títulos con `ods`, se renderizan los círculos ODS de color.
- [ ] Para títulos con `opac`, el enlace OPAC aparece en el footer.
- [ ] Se renderizan **3 sugerencias de aula** adaptadas al `uso`.
- [ ] Click en el botón `.cat-pdf-btn` de una tarjeta puebla el template con su título exacto.
- [ ] `afterprint` o fallback de 30 s restaura el estado: `body.printing-ficha-pdf` se elimina y el template vuelve a `[hidden]`.

## API pública

```js
window.printFichaPDF(titulo)   // dispara el flujo desde JS (testable)
```

## No es

- **No genera el PDF en JS** — el navegador hace el trabajo via window.print.
- **No descarga directamente.** El usuario tiene que seleccionar "Guardar como PDF" en el destino del diálogo de impresión.
- **No incluye situaciones LOMLOE asociadas** — la spec original lo mencionaba, pero esa información vive en `#situaciones` y enlazarla desde la ficha por título individual no aporta valor (las SA son agregadas por nivel, no por título). Si surgiera demanda, se añadiría una sección "SA donde aparece este título".

## Tests asociados

- `tests/specs/ficha-pdf.spec.js` (6 tests):
  - inyección de botón en 279 tarjetas
  - template oculto por defecto
  - `printFichaPDF` puebla y llama print
  - badges + niveles + ODS
  - OPAC link
  - 3 sugerencias
