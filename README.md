# El manga como recurso didáctico
## Biblioteca Campus del Obelisco · Aula de Cómic · ULPGC

**Versión:** 5.10  |  **app.js:** 7.10  |  **datos.js:** 5.10

### Estructura de archivos

```
proyecto/
├── index.html          ← Portada cinematográfica (NUEVA · v5.10)
├── recurso.html        ← Recurso completo (antes index.html · ~313 KB)
├── sw.js               ← Service Worker (PWA offline)
├── manifest.json       ← Manifiesto PWA (instalable)
├── landing/
│   └── htm-app.js      ← React + htm (sin Babel) — portada cinematográfica
├── js/
│   ├── app.js          ← Lógica principal (~20.000 líneas)
│   └── datos.js        ← Catálogo de 279 títulos
├── css/
│   └── estilos.css     ← Estilos (~7.600 líneas)
└── icons/
    └── icon.svg        ← Icono PWA (maskable)
```

### Uso

Abrir `index.html` en un navegador moderno (Chrome, Firefox, Safari, Edge).
Para funcionar como PWA instalable, debe servirse desde un servidor HTTP
(GitHub Pages, servidor local con `npx serve .`, etc.).

### Mantenimiento del catálogo

El catálogo se actualiza a través del **Panel docente** (icono ✎ en el FAB):

1. **Editor** → Añadir / editar / eliminar títulos individualmente
2. **Importar** → Subir CSV o JSON (flujo Excel ↔ app)
3. **Exportar** → JSON completo o CSV local para revisión
4. **Validar** → Comprobar integridad del catálogo

Para actualizar el catálogo base en `datos.js`, editar el archivo
directamente e incrementar `CACHE_NAME` en `sw.js` (ej. `v5.9`).

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
| P8–P10 | Quiz 279 títulos · Exportación docente · Accesibilidad D3 |
| P11–P16 | Seguridad · Trampa de foco · Virtual scrolling · Backoff IA · CSP · Event delegation |
| P17–P22 | Lectura guiada 279 títulos · Historial persistente · QR pasaporte · Panel docente · Offline IA · URLs cortas |
| P23–P26 | Editor catálogo · Importador CSV/JSON · Validador esquema · Notificador novedades |
