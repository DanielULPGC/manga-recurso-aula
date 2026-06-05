/* ══════════════════════════════════════════════════════════════
   mediacion.js — Ejemplo modelado de mediación lectora
   Worked example para el profesorado: modela, paso a paso, una
   lectura mediada de una página de manga (qué hace el docente, qué
   pregunta y por qué). Reduce la carga de quien parte de cero.
   Vanilla JS, sin dependencias. CSP estricta. Se inserta en la
   Parte I (marco pedagógico). La página es ilustrativa y adaptable
   a cualquier título del fondo.
   ══════════════════════════════════════════════════════════════ */
(function() {
  'use strict';

  const PASOS = [
    {
      momento: 'Antes de leer · Anticipación',
      hace: 'Muestra solo la portada o la primera viñeta y activa lo que el alumnado ya sabe, sin adelantar la historia.',
      pregunta: '«¿Qué creéis que va a pasar? ¿En qué os fijáis para suponerlo?»',
      porque: 'Anticipar genera expectativas y predispone a una lectura activa en lugar de pasiva.'
    },
    {
      momento: 'Primera viñeta · Observación guiada',
      hace: 'Señala el sentido de lectura (de derecha a izquierda) y dirige la mirada hacia un detalle concreto.',
      pregunta: '«¿Por dónde empezamos a leer esta página? ¿Qué vemos en esta primera viñeta?»',
      porque: 'Explicitar la convención de lectura (RTL) evita que el alumnado se pierda y enseña la gramática de la página.'
    },
    {
      momento: 'Entre dos viñetas · El ma',
      hace: 'Se detiene en el salto entre dos viñetas y pregunta por lo que no se muestra.',
      pregunta: '«¿Qué ha pasado entre esta viñeta y la siguiente? ¿Cómo lo sabemos?»',
      porque: 'El espacio entre viñetas (ma) exige inferencia: el lector completa la elipsis. Es comprensión, no decoración.'
    },
    {
      momento: 'Momento de tensión · Recursos visuales',
      hace: 'Detiene la lectura en una viñeta con líneas cinéticas o una expresión marcada y la nombra.',
      pregunta: '«¿Por qué esta viñeta parece más rápida o más intensa? ¿Qué lo provoca?»',
      porque: 'Da nombre a los recursos del lenguaje visual (líneas de movimiento, encuadre, gesto) y los hace conscientes.'
    },
    {
      momento: 'Cierre de la página · Síntesis',
      hace: 'Recompone el conjunto y conecta con la experiencia del alumnado.',
      pregunta: '«¿Qué nos quería contar esta página? ¿Os ha pasado algo parecido alguna vez?»',
      porque: 'Integra las partes en un sentido global y vincula el texto con la vida del lector (comprensión profunda).'
    },
    {
      momento: 'Después · Metacognición',
      hace: 'Invita a reflexionar sobre el propio proceso de lectura.',
      pregunta: '«¿Qué ha sido más difícil de entender? ¿Qué pista os ha ayudado más?»',
      porque: 'Hacer visible cómo se ha leído transfiere la estrategia a futuras lecturas autónomas.'
    },
  ];

  function el(tag, cls, html) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  function build() {
    let idx = 0;

    const card = el('section', 'mediacion-card');
    card.setAttribute('role', 'region');
    card.setAttribute('aria-label', 'Ejemplo modelado de mediación lectora');

    card.appendChild(el('div', 'mediacion-eyebrow', 'Ejemplo modelado'));
    card.appendChild(el('h3', 'mediacion-title', 'Cómo mediar la lectura de una página, paso a paso'));
    card.appendChild(el('p', 'mediacion-intro',
      'Un modelo de lectura mediada que puedes adaptar a cualquier título del fondo. Recorre los momentos clave: qué hacer, qué preguntar y por qué.'));

    const bar = el('div', 'seg-bar');
    bar.setAttribute('role', 'group');
    bar.setAttribute('aria-label', 'Navegación del ejemplo modelado');
    const head = el('div', 'seg-head');
    const prog = el('span', 'seg-progress');
    const momento = el('span', 'seg-steptitle');
    head.appendChild(prog); head.appendChild(momento);
    const nav = el('div', 'seg-nav');
    const prev = el('button', 'seg-btn', 'Anterior');
    const next = el('button', 'seg-btn', 'Siguiente');
    prev.type = next.type = 'button';
    nav.appendChild(prev); nav.appendChild(next);
    bar.appendChild(head); bar.appendChild(nav);
    const live = el('span', 'sr-only'); live.setAttribute('aria-live', 'polite');
    bar.appendChild(live);
    card.appendChild(bar);

    const body = el('div', 'mediacion-step');
    const rowHace = el('div', 'mediacion-row');
    rowHace.appendChild(el('span', 'mediacion-tag', 'Qué hace'));
    const txtHace = el('p', 'mediacion-txt');
    rowHace.appendChild(txtHace);
    const rowQ = el('div', 'mediacion-row mediacion-q');
    rowQ.appendChild(el('span', 'mediacion-tag', 'Pregunta modelo'));
    const txtQ = el('p', 'mediacion-txt');
    rowQ.appendChild(txtQ);
    const rowWhy = el('div', 'mediacion-row');
    rowWhy.appendChild(el('span', 'mediacion-tag', 'Por qué'));
    const txtWhy = el('p', 'mediacion-txt');
    rowWhy.appendChild(txtWhy);
    body.appendChild(rowHace); body.appendChild(rowQ); body.appendChild(rowWhy);
    card.appendChild(body);

    function paint() {
      const p = PASOS[idx];
      prog.textContent = 'Momento ' + (idx + 1) + ' de ' + PASOS.length;
      momento.textContent = p.momento;
      txtHace.textContent = p.hace;
      txtQ.textContent = p.pregunta;
      txtWhy.textContent = p.porque;
      prev.disabled = (idx === 0);
      next.disabled = (idx === PASOS.length - 1);
      live.textContent = prog.textContent + ': ' + p.momento;
    }
    function go(n) { idx = Math.max(0, Math.min(PASOS.length - 1, n)); paint(); body.setAttribute('tabindex', '-1'); body.focus({ preventScroll: false }); }
    prev.addEventListener('click', () => go(idx - 1));
    next.addEventListener('click', () => go(idx + 1));
    paint();
    return card;
  }

  function init() {
    if (document.querySelector('.mediacion-card')) return;
    const anchor = document.getElementById('parte-ii');
    if (!anchor || !anchor.parentNode) return;
    anchor.parentNode.insertBefore(build(), anchor);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
