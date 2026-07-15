# Auditoria de seguridad frontend e IA

Fecha: 2026-07-13

## Alcance

Se revisa el riesgo frontend asociado a HTML dinamico, contenido generado por IA, claves de proveedor y llamadas externas. La intervencion mantiene la funcion de IA, no introduce claves ni endpoints nuevos y conserva el catalogo.

## Resumen ejecutivo

- Se localizaron 167 usos de `innerHTML` en HTML/JS no minificado.
- No se localizaron usos de `insertAdjacentHTML`.
- No se encontraron claves API reales hardcodeadas con patrones `AIza...`, `sk-ant...` o `sk-...` en fuentes no minificadas.
- La clave de Gemini se gestiona en `sessionStorage` y se borra al cerrar la sesion del navegador, pero sigue siendo visible para el frontend mientras se usa.
- Hay llamadas directas desde frontend a Anthropic, Gemini y Google Books. Esto es funcional para una PWA estatica, pero no es la arquitectura recomendada para produccion institucional.
- Se corrigio el punto critico objetivo: las salidas HTML de IA de rubrica, secuencia y generador unificado pasan ahora por `sanitizeAiHtml()`.
- Se mantiene y refuerza el aviso visible de revision docente en salidas generadas por IA.

## Cambios aplicados

| Archivo | Linea aprox. | Cambio | Motivo |
|---|---:|---|---|
| `site/js/core/utils.js` | 5 | El sanitizador permite `table`, `thead`, `tbody`, `tr`, `th`, `td`. | Las rubricas y secuencias piden tablas HTML; se conservan estructuras docentes utiles sin permitir atributos peligrosos. |
| `site/js/app.js` | 2486 | Nueva funcion `sanitizeAiHtml(html)`. | Centraliza retirada de cercas Markdown y sanitizacion antes de `innerHTML`. |
| `site/js/app.js` | 4409 | Rubricas IA pasan por `sanitizeAiHtml()`. | Evita insertar HTML de proveedor externo sin filtrado. |
| `site/js/app.js` | 4544 | Secuencias IA pasan por `sanitizeAiHtml()`. | Evita XSS por HTML generado por IA. |
| `site/js/app.js` | 8792 | Generador unificado del asistente pasa por `sanitizeAiHtml()`. | Evita XSS en ficha/SA/rubrica/actividad expres generadas con Gemini. |
| `site/js/app.js` | 8794 | El generador unificado anade aviso visible de revision docente. | Transparencia y supervision humana antes del uso en aula. |
| `site/js/app.js` | 8407-8460 | La guia imprimible escapa titulo introducido por usuario y campos del catalogo al construir HTML exportable. | Reduce riesgo si el catalogo local editado incorpora texto no confiable. |

## Inventario de HTML dinamico

| Grupo | Rutas | Clasificacion | Justificacion |
|---|---|---|---|
| Plantillas de interfaz estaticas | `site/js/app.js` panel docente, vitrina, modales; `catalog-collapse.js`; `left-dock.js`; `vinetas-generator.js` | Seguro por contenido estatico | Construyen controles propios de la app. No consumen IA ni entrada libre sin escape en los puntos revisados. |
| Datos de catalogo renderizados en tarjetas, fichas, historial y guias | `site/js/app.js`, `site/js/guia-fix.js`, `site/js/ficha-pdf.js` | Seguro por escape en puntos principales; algunos usos siguen siendo revisables | Los bloques principales usan `escapeHtml()` o DOM APIs. Se reforzo la guia imprimible. Mantener revision en futuras ediciones del catalogo local. |
| Mensajes de error, estado y placeholders | `site/js/app.js`, modulos pequenos | Seguro por contenido estatico o escape | Los mensajes propios son literales; los errores interpolados usan `escapeHtml(err.message)`. |
| Chat IA renderizado como Markdown minimo | `site/js/app.js` `renderMd()` y `_renderMd()` | Seguro por sanitizacion | Markdown se convierte a HTML basico y pasa por `sanitizeHtml()`. |
| Rubrica IA | `site/js/app.js` `generarRubrica()` | Seguro por sanitizacion tras cambio | Antes era peligroso; ahora usa `sanitizeAiHtml()` antes de insertar. |
| Secuencia IA | `site/js/app.js` `generarSecuencia()` | Seguro por sanitizacion tras cambio | Antes era peligroso; ahora usa `sanitizeAiHtml()` antes de insertar. |
| Generador unificado IA | `site/js/app.js` `runGenerar()` | Seguro por sanitizacion tras cambio | Antes era peligroso; ahora usa `sanitizeAiHtml()` y aviso visible. |
| HTML exportado en ventana nueva | `site/js/app.js` `generarGuia()` | Seguro por escape tras cambio, con riesgo moderado residual | La guia se escribe con `document.write()` en ventana nueva. No usa IA directa, pero conviene migrar a una plantilla DOM o HTML imprimible dedicada. |

## Sanitizacion existente

`site/js/core/utils.js` define:

- `sanitizeHtml(dirtyHtml)`: parsea HTML con `DOMParser`, elimina etiquetas no permitidas, limpia atributos no permitidos y bloquea `javascript:`, `data:` y `vbscript:` en enlaces.
- `escapeHtml(str)`: escapa texto para interpolarlo como contenido plano dentro de HTML.

Lista permitida tras la mejora: parrafos, saltos, enfasis, listas, encabezados `h1-h4`, tablas basicas, citas, codigo, `mark`, `span` y enlaces. No se permiten atributos de evento, `style`, `iframe`, `script`, `img`, `svg`, formularios ni atributos arbitrarios.

## Proveedores externos y claves

| Proveedor | Ruta | Uso actual | Riesgo |
|---|---|---|---|
| Anthropic Claude | `site/js/app.js:1077` | `fetch('https://api.anthropic.com/v1/messages')` desde navegador con `anthropic-dangerous-direct-browser-access`. | Alto para produccion: proveedor visible, control limitado, dependencia de proxy/contexto externo y exposicion de trafico del prompt. |
| Google Gemini | `site/js/app.js:4338` | `fetch` a `generativelanguage.googleapis.com` con clave del docente en query string. | Medio/alto: no hay clave hardcodeada, pero la clave aportada por usuario queda visible en cliente, red/devtools e historial de sesion. |
| Google Books | `site/js/app.js:8394` y otros | Busqueda de portadas/metadatos. | Bajo/medio: llamada externa sin clave; impacto de privacidad por consultas de titulos. |
| Google Chart QR | `site/js/app.js:20213` | Generacion remota de QR. | Medio: envia URL codificada a servicio externo; considerar generador local ya existente como ruta preferente. |

No se han anadido proveedores ni endpoints falsos.

## Avisos de uso responsable

Ya existian avisos visibles en:

- `site/recurso.html:4927`: badge del asistente IA con proveedor y revision docente.
- `site/js/app.js:8177`: mensajes de chat con `ia-oversight-notice`.
- `site/js/app.js:4413` y `4548`: rubrica y secuencia con nota de revision.
- `site/js/app.js:8681`: panel de generacion con aviso EU AI Act.
- `site/js/app.js:8853`: historial/exportacion con aviso.

Se anadio/reforzo aviso en:

- `site/js/app.js:8794`: salida del generador unificado.

## Arquitectura futura recomendada

1. Crear una funcion serverless institucional, por ejemplo `POST /api/ai/generate`, detras de autenticacion o control de cuota.
2. Guardar claves de Anthropic/Gemini solo en variables de entorno del backend, nunca en el frontend.
3. Enviar desde la PWA solo: tipo de documento, etapa, titulo, competencias y contexto minimo necesario.
4. Aplicar en backend: validacion de payload, rate limit, registro de proveedor usado, timeout, filtros de longitud y bloqueo de HTML no permitido.
5. Devolver una respuesta estructurada, preferiblemente JSON con campos (`titulo`, `bloques`, `tabla`, `advertencias`) en lugar de HTML libre.
6. Renderizar en frontend desde JSON con DOM APIs o plantillas escapadas; permitir HTML solo si pasa por sanitizacion central.
7. Mantener un modo local sin IA para rubricas/secuencias basicas cuando no haya backend o red.

## Riesgos residuales

- La aplicacion sigue siendo una PWA estatica con llamadas directas a proveedores externos.
- `innerHTML` permanece muy extendido en la aplicacion. El riesgo se reduce en salidas de IA, pero futuras funciones deben usar `textContent`, DOM APIs o `escapeHtml()/sanitizeHtml()`.
- El sanitizador es propio. Para un despliegue institucional con mas entradas no confiables, conviene evaluar DOMPurify o una sanitizacion server-side equivalente, documentando la dependencia.
- La CSP permite `style-src 'unsafe-inline'` por el volumen de estilos inline existentes. Reducirlo requeriria una refactorizacion visual amplia.

## Verificacion

- Build ejecutado correctamente con `tools/build.mjs`.
- Suite de comprobaciones ejecutada por piezas: build `--check`, version/cache, enlaces, recursos y catalogo.
- No se detectaron claves API reales en fuentes no minificadas con los patrones revisados.
- `insertAdjacentHTML`: 0 usos.
