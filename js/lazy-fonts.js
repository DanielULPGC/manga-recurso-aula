/* ══════════════════════════════════════════════════════════════════
   lazy-fonts.js — v5.9 · 2026-05
   Carga diferida de Cinzel y Noto Serif JP (~150 KB combinadas).
   Estas fuentes se usan en bloques específicos (etiquetas decorativas
   con Cinzel, glosario japonés con Noto Serif JP), no en el cuerpo
   principal. Diferirlas mejora el Largest Contentful Paint y reduce
   el bloqueo de renderizado inicial.

   Estrategia:
   1. Tras el evento `load` (recursos críticos ya cargados),
   2. Insertar el <link> diferido en el <head>.
   3. font-display:swap hace que el navegador renderice con la
   fuente fallback hasta que llegue la real.
   ══════════════════════════════════════════════════════════════════ */
(function(){
  'use strict';
  function loadDeferred(){
    if(document.querySelector('link[data-lazy-fonts]')) return;
    const link = document.createElement('link');
    link.rel  = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Cinzel:wght@400;700&family=Noto+Serif+JP:wght@400;700&display=swap';
    link.setAttribute('data-lazy-fonts', '');
    document.head.appendChild(link);
  }
  if(document.readyState === 'complete'){
    // Pequeño delay para no competir con tareas de boot
    setTimeout(loadDeferred, 100);
  } else {
    window.addEventListener('load', () => setTimeout(loadDeferred, 100), {once: true});
  }
})();
