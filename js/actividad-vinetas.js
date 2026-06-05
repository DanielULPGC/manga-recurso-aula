/* ══════════════════════════════════════════════════════════════
   actividad-vinetas.js — Tarjeta de actividad del generador
   Convierte el generador en una tarea productiva: consigna, pasos,
   criterios de logro (autoseguimiento) y un ejemplo modelado.
   Fundamento: aprendizaje generativo y análisis multimodal del manga
   (Tejuelo, 2026, 43, 31-68, DOI: 10.17398/1988-8430.43.31).
   Vanilla JS, sin dependencias. CSP estricta. El <details> nativo
   hace el plegado accesible por teclado sin JS adicional.
   ══════════════════════════════════════════════════════════════ */
(function() {
  'use strict';

  const CRITERIOS = [
    'La composición elegida ayuda a contar lo que quiero (no es decorativa).',
    'El orden de lectura es coherente con el sentido marcado (derecha a izquierda en manga).',
    'El bocadillo está en la viñeta donde tiene sentido leerlo.',
    'La onomatopeya y las líneas cinéticas refuerzan un momento concreto.',
    'Puedo explicar por qué el lector pasa de una viñeta a la siguiente (el papel del ma).',
  ];

  function el(tag, cls, html) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  function build() {
    const card = el('section', 'actividad-card');
    card.setAttribute('role', 'region');
    card.setAttribute('aria-label', 'Actividad: componer y explicar una página de manga');

    card.appendChild(el('div', 'actividad-eyebrow', 'Actividad'));
    card.appendChild(el('h3', 'actividad-title', 'Compón una página y explica su lectura'));
    card.appendChild(el('p', 'actividad-consigna',
      'Usa el generador para componer una página breve. No se trata de "decorar": cada decisión (composición, sentido de lectura, posición del bocadillo, líneas cinéticas) debe servir para contar algo. Después, explica en voz alta o por escrito cómo se lee tu página y por qué.'));

    // Pasos
    const pasos = el('ol', 'actividad-pasos');
    [
      'Elige una composición y fija el sentido de lectura.',
      'Coloca el bocadillo (<em>fukidashi</em>) en la viñeta que el lector debe leer primero o en el momento clave.',
      'Aplica estilo y líneas cinéticas solo donde aporten intención.',
      'Numera mentalmente el recorrido del ojo y comprueba que el <em>ma</em> (el salto entre viñetas) tiene sentido.',
    ].forEach(t => pasos.appendChild(el('li', null, t)));
    card.appendChild(el('div', 'actividad-sub', 'Pasos'));
    card.appendChild(pasos);

    // Criterios de logro (autoseguimiento, no puntúa)
    card.appendChild(el('div', 'actividad-sub', 'Criterios de logro (marca lo que ya cumples)'));
    const fs = el('fieldset', 'actividad-criterios');
    fs.appendChild(el('legend', 'sr-only', 'Criterios de logro de la actividad'));
    CRITERIOS.forEach((t, i) => {
      const row = el('label', 'actividad-crit');
      const cb = el('input');
      cb.type = 'checkbox';
      cb.id = 'crit-' + i;
      const span = el('span', null, t);
      row.appendChild(cb);
      row.appendChild(span);
      fs.appendChild(row);
    });
    card.appendChild(fs);

    // Ejemplo modelado (plegable, accesible con <details> nativo)
    const det = el('details', 'actividad-ejemplo');
    const sum = el('summary', null, 'Ver un ejemplo modelado de lectura');
    det.appendChild(sum);
    det.appendChild(el('p', null,
      'Página de cuatro viñetas, lectura de derecha a izquierda. <strong>1</strong> (arriba derecha): plano general con un bocadillo que abre la escena. <strong>2</strong> (arriba izquierda): primer plano del personaje que reacciona; el bocadillo va aquí porque responde a la 1. <strong>3</strong> (abajo derecha): viñeta con líneas cinéticas para marcar una acción rápida; sin texto, el dibujo basta. <strong>4</strong> (abajo izquierda): viñeta más ancha y un <em>ma</em> mayor antes de ella, que da pausa y cierra. El recorrido del ojo y el ritmo están al servicio de lo que se cuenta.'));
    card.appendChild(det);

    card.appendChild(el('p', 'actividad-nota',
      'Para evaluar: comparte estos criterios con el alumnado antes de empezar. Encaja como tarea breve dentro de una situación de aprendizaje sobre lenguaje del cómic.'));

    return card;
  }

  function init() {
    const gen = document.getElementById('vinetasGenerator');
    if (!gen || document.querySelector('.actividad-card')) return;
    gen.parentNode.insertBefore(build(), gen);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
