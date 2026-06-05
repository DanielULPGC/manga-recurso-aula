# Arquitectura — Content Security Policy

**Estado:** en producción · v5.10
**Aplica a:** `site/recurso.html` (`<meta http-equiv="Content-Security-Policy">`)
**No aplica a:** `site/index.html` (portada · necesita CDNs externos)

## Por qué `<meta>` y no cabecera HTTP

GitHub Pages no permite configurar cabeceras HTTP arbitrarias para archivos estáticos. Si en el futuro el sitio se sirve desde un servidor con control de cabeceras, mover esta política a `Content-Security-Policy:` HTTP — es más estricto (cubre `frame-ancestors`, que `<meta>` no soporta).

## Política aplicada (recurso.html)

```
default-src 'none';
script-src   'self' https://cdnjs.cloudflare.com;
style-src    'self' 'unsafe-inline' https://fonts.googleapis.com;
font-src     'self' https://fonts.gstatic.com;
img-src      'self' data: blob: https://books.google.com https://books.googleusercontent.com https://*.googleapis.com https://chart.googleapis.com;
connect-src  'self' https://api.anthropic.com https://generativelanguage.googleapis.com https://www.googleapis.com;
worker-src   'self';
manifest-src 'self';
object-src   'none';
base-uri     'self';
form-action  'self';
```

## Decisiones

| Directiva | Valor | Por qué |
|---|---|---|
| `default-src` | `'none'` | Whitelist: cada tipo de recurso se permite explícitamente. |
| `script-src` | `'self' https://cdnjs.cloudflare.com` | Sin `'unsafe-inline'`: todos los handlers `onclick/onchange/oninput` migrados a event delegation en `app.js` (`_delegateActions()`, `_initDirectListeners()`). Sin `'unsafe-eval'`: `eval()` y `new Function()` bloqueados. |
| `style-src` | `'self' 'unsafe-inline' https://fonts.googleapis.com` | `'unsafe-inline'` necesaria por 138 atributos `style=` en HTML y 70+ asignaciones `element.style.*` en `app.js` (tooltips, modales). |
| `font-src` | `'self' https://fonts.gstatic.com` | Binarios de Google Fonts. |
| `img-src` | `'self' data: blob: + Google Books + Google APIs + Google Charts` | Portadas OPAC. |
| `connect-src` | `'self' + api.anthropic.com + generativelanguage.googleapis.com + googleapis.com` | Claude API, Gemini API, Google Books search. |
| `worker-src` | `'self'` | Service Worker PWA. |
| `manifest-src` | `'self'` | `manifest.json`. |
| `object-src` | `'none'` | Sin plugins (Flash, Java, PDF inline). |
| `base-uri` | `'self'` | Sin inyección de `<base>`. |
| `form-action` | `'self'` | Forms solo a self. |

## Lo que no cubre

- **`frame-ancestors`**: tendría que ir en cabecera HTTP. `<meta>` no lo soporta. Mitigación temporal: usar `X-Frame-Options` en el servidor cuando se migre.

## Por qué `index.html` no tiene CSP estricta

La portada cinematográfica necesita:
- `https://cdn.tailwindcss.com` (utilidades CSS runtime)
- `https://unpkg.com` (React, ReactDOM, Framer Motion, htm)

Estos CDNs no encajan en la política estricta del recurso. La portada se trata como "marketing layer" — sin estado sensible, sin APIs, sin localStorage propio.

## Cuándo actualizar

- Si se añade un nuevo CDN o API → declararlo explícitamente.
- Si se elimina una integración (ej. Claude, Gemini) → quitarla de `connect-src`.
- Si se introduce código que necesita `eval()` (no recomendado) → reconsiderar la arquitectura antes de relajar `script-src`.

## Criterios de aceptación

- [ ] `recurso.html` carga sin violaciones de CSP en consola.
- [ ] Ningún `<script>` inline ni `onclick=` inline en HTML.
- [ ] Ningún `eval()` o `new Function()` en JS local.
- [ ] Tests Playwright cargan `/recurso.html` sin errores.
