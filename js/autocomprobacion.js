/* ══════════════════════════════════════════════════════════════
   autocomprobacion.js — Motor de autocomprobación formativa
   Vanilla JS, sin dependencias. Compatible con CSP estricta.
   Inserta los cuestionarios de AUTOCHECK_DATA tras cada sección,
   con realimentación inmediata y reintento (práctica de recuperación).
   Accesible por teclado (botones nativos) y con región aria-live.
   ══════════════════════════════════════════════════════════════ */
(function() {
  'use strict';

  function el(tag, cls, html) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  function buildQuestion(quizId, qIndex, pregunta) {
    const fs = el('fieldset', 'autocheck-q');
    const legend = el('legend', 'autocheck-stem', pregunta.q);
    fs.appendChild(legend);

    const opts = el('div', 'autocheck-opts');
    const fb = el('div', 'autocheck-fb');
    fb.setAttribute('aria-live', 'polite');
    fb.hidden = true;

    const buttons = [];

    function answer(btn, opt) {
      // Marca todas las opciones y muestra la explicación.
      buttons.forEach((b, i) => {
        const correct = pregunta.opts[i].ok;
        b.classList.toggle('is-correct', correct);
        b.classList.toggle('is-wrong', b === btn && !opt.ok);
        b.setAttribute('aria-disabled', 'true');
        b.disabled = true;
        if (correct) b.setAttribute('aria-label', b.textContent + ' (respuesta correcta)');
      });
      const acierto = opt.ok;
      fb.hidden = false;
      fb.classList.toggle('ok', acierto);
      fb.classList.toggle('ko', !acierto);
      fb.innerHTML = '<strong>' + (acierto ? 'Correcto.' : 'No exactamente.') + '</strong> ' + pregunta.explica;
      retry.hidden = false;
      retry.focus();
    }

    pregunta.opts.forEach(opt => {
      const b = el('button', 'autocheck-opt', opt.t);
      b.type = 'button';
      b.addEventListener('click', () => answer(b, opt));
      buttons.push(b);
      opts.appendChild(b);
    });

    const retry = el('button', 'autocheck-retry', 'Intentar de nuevo');
    retry.type = 'button';
    retry.hidden = true;
    retry.addEventListener('click', () => {
      buttons.forEach(b => {
        b.classList.remove('is-correct', 'is-wrong');
        b.disabled = false;
        b.removeAttribute('aria-disabled');
        b.removeAttribute('aria-label');
      });
      fb.hidden = true;
      fb.classList.remove('ok', 'ko');
      retry.hidden = true;
      buttons[0].focus();
    });

    fs.appendChild(opts);
    fs.appendChild(fb);
    fs.appendChild(retry);
    return fs;
  }

  function buildQuiz(quiz) {
    const sec = el('section', 'autocheck');
    sec.id = quiz.id;
    sec.setAttribute('role', 'region');
    sec.setAttribute('aria-label', quiz.titulo);

    const h = el('h3', 'autocheck-title', quiz.titulo);
    sec.appendChild(h);
    if (quiz.intro) sec.appendChild(el('p', 'autocheck-intro', quiz.intro));

    quiz.preguntas.forEach((p, i) => sec.appendChild(buildQuestion(quiz.id, i, p)));
    return sec;
  }

  function mount(quiz) {
    if (document.getElementById(quiz.id)) return; // evita duplicados
    const target = document.querySelector(quiz.mount.sel);
    if (!target) return;
    const node = buildQuiz(quiz);
    if (quiz.mount.mode === 'after') {
      target.parentNode.insertBefore(node, target.nextSibling);
    } else {
      target.parentNode.insertBefore(node, target);
    }
  }

  function init() {
    if (!Array.isArray(window.AUTOCHECK_DATA)) return;
    window.AUTOCHECK_DATA.forEach(mount);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
