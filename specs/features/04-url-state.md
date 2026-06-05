# Feature — Estado del catálogo en URL

**Estado:** en producción
**Versión:** v5.10
**Archivo:** `site/js/url-state.js`

## Problema

Si filtras "Lengua extranjera · Primaria · ODS 4" y recargas, pierdes el filtro. No puedes compartir un catálogo filtrado por email/WhatsApp ni dejarlo en un programación de departamento como enlace. La url siempre es `recurso.html`, sin estado.

## Solución

Persistir los filtros del catálogo y la búsqueda en query params, sincronizando bidireccionalmente con el estado interno de `app.js`.

**Schema:**

```
recurso.html?uso=historia&nivel=primaria&ods=4&q=tezuka&emocion=esperanza
```

| Param    | Valores                                             | Función             |
|----------|-----------------------------------------------------|---------------------|
| `uso`    | `historia`, `filosofia`, `emocional`, `lenguas`, `inclusion`, `visual`, `ciencia`, `genero` | `filterUso()`       |
| `nivel`  | `infantil`, `primaria`, `secundaria`, `bachillerato`, `universidad` | `filterNivel()`     |
| `ods`    | número de ODS (`3`, `4`, `5`, `8`, `9`, `10`, `11`, `13`, `15`, `16`) | `filterOds()`       |
| `q`      | string libre (búsqueda)                             | `#catalogSearch.value` |
| `emocion`| key de `EMOCIONES`                                  | `filterByEmocion()` |

**Mecánica:**

1. Al cargar: leer params → aplicar filtros vía las funciones globales.
2. Al cambiar: monkey-patch de las funciones para escribir en URL con `history.replaceState`.
3. `popstate` (back/forward) → re-aplicar params actuales.
4. Buscador con debounce 200 ms para no saturar el history.
5. Valor `all` → eliminar el param (URL limpia).

## Criterios de aceptación

- [ ] `?uso=historia` al cargar deja el botón `[data-uso="historia"]` con clase `.active`.
- [ ] Idem para `?nivel=`, `?ods=`, `?q=`, `?emocion=`.
- [ ] Combinación de varios params se aplica simultáneamente.
- [ ] Llamar `filterUso('historia')` añade `?uso=historia` a la URL.
- [ ] Llamar `filterUso('all')` elimina el param.
- [ ] Escribir 'tezuka' en `#catalogSearch` añade `?q=tezuka` tras 200 ms.
- [ ] Back del navegador restaura los filtros del estado anterior.
- [ ] `window.__urlState.read()` devuelve `{uso, nivel, ods, q, emocion}` filtrado por presencia.

## API pública (para tests y debugging)

```js
window.__urlState.read()       // → { uso?, nivel?, ods?, q?, emocion? }
window.__urlState.write(patch) // escribe params (valor 'all' borra)
window.__urlState.apply()      // re-aplica el estado de la URL al DOM
```

## No es

- **No persiste en localStorage.** Solo en la URL. La etapa SÍ se persiste por separado (`mc_etapa`) por `etapa-selector.js`.
- **No usa history.pushState para cambios de filtro.** Solo `replaceState` — no contamina el historial con cada click. El `pushState` queda reservado para navegación intencional (back/forward sigue funcionando porque popstate también dispara en replace navigation).
- **No valida valores.** Si la URL trae `?ods=999`, el filterOds simplemente no encontrará coincidencias.

## Tests asociados

- `tests/specs/url-state.spec.js` (13 tests):
  - Lectura inicial · escritura desde UI · back/forward · API pública
