/* ══════════════════════════════════════════════════════════════
   andamiaje-lectura.js — Andamiaje de lectura por título
   El manga como recurso didáctico · Aula de Cómic · ULPGC
   Versión del componente: 1.0.0  ·  Capa: D1

   Genera, para un título concreto del fondo, un andamiaje de comprensión
   lectora en tres fases —ANTES, DURANTE, DESPUÉS— siguiendo el modelo
   clásico de la didáctica de la lectura (Solé, I. (1992). Estrategias de
   lectura. Graó). El foco de comprensión de la fase DURANTE se adapta a la
   categoría pedagógica del título (uso), y el cierre DESPUÉS conecta con sus
   ODS y con la metacognición/transferencia, en línea con la evidencia sobre
   uso de cómic y novela gráfica en el aula (Wallner & Eriksson Barajas, 2020,
   Studies in Comics 11(1), 37–54. https://doi.org/10.1386/stic_00014_1).

   Depende de (con degradación elegante):
     · window.CATALOGO (de datos.min.js) — fuente de títulos y metadatos.
     · FocusTrap (de app.min.js) — accesibilidad del modal.
     · #fabItems — punto de anclaje del disparador.

   CSP estricta: sin handlers inline; eventos por addEventListener.
   ══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /** Nombres oficiales de los 17 ODS (Agenda 2030) para el cierre competencial. */
  var ODS = {
    1: 'Fin de la pobreza', 2: 'Hambre cero', 3: 'Salud y bienestar',
    4: 'Educación de calidad', 5: 'Igualdad de género', 6: 'Agua limpia y saneamiento',
    7: 'Energía asequible y no contaminante', 8: 'Trabajo decente y crecimiento económico',
    9: 'Industria, innovación e infraestructura', 10: 'Reducción de las desigualdades',
    11: 'Ciudades y comunidades sostenibles', 12: 'Producción y consumo responsables',
    13: 'Acción por el clima', 14: 'Vida submarina', 15: 'Vida de ecosistemas terrestres',
    16: 'Paz, justicia e instituciones sólidas', 17: 'Alianzas para lograr los objetivos'
  };

  /**
   * Foco de comprensión por categoría pedagógica (campo `uso`).
   * Cada entrada aporta el matiz específico de la fase DURANTE y del cierre.
   * @type {Object<string,{durante:string, pregunta:string, despues:string}>}
   */
  var FOCO = {
    historia: {
      durante: 'Distinguir los hechos representados de la interpretación del autor, y situar la escena en su periodo.',
      pregunta: '«¿Qué parte de lo que vemos es un hecho histórico y qué parte es la mirada del autor? ¿Cómo lo sabemos?»',
      despues: 'Contrastar lo leído con una fuente histórica y valorar para qué sirve y qué limita la ficción gráfica como acceso al pasado.'
    },
    ciencia: {
      durante: 'Identificar el concepto científico que aparece y separar lo verosímil de la licencia narrativa.',
      pregunta: '«¿Qué idea científica se está usando aquí? ¿Qué es plausible y qué es libertad del autor?»',
      despues: 'Verificar el concepto en una fuente fiable y comentar cómo la narración ayuda (o no) a entenderlo.'
    },
    emocional: {
      durante: 'Nombrar las emociones de los personajes y rastrear qué las provoca en la página.',
      pregunta: '«¿Qué siente el personaje en esta viñeta? ¿Qué lo ha provocado? ¿Cómo lo muestra el dibujo?»',
      despues: 'Relacionar la emoción del personaje con experiencias propias y ponerle palabras (alfabetización emocional).'
    },
    filosofia: {
      durante: 'Localizar el dilema o la pregunta de fondo y las posiciones que entran en conflicto.',
      pregunta: '«¿Qué pregunta difícil plantea esta historia? ¿Qué defendería cada personaje?»',
      despues: 'Argumentar una postura propia ante el dilema y reconocer razones legítimas en la postura contraria.'
    },
    genero: {
      durante: 'Observar cómo se representan los roles e identidades: dónde hay estereotipo y dónde matiz.',
      pregunta: '«¿Cómo se representa aquí a los personajes según su género? ¿Es un cliché o tiene matices?»',
      despues: 'Reformular un momento de la historia evitando el estereotipo, y justificar el cambio.'
    },
    lenguas: {
      durante: 'Atender al lenguaje: traducción, onomatopeyas, registros y léxico nuevo.',
      pregunta: '«¿Qué palabras u onomatopeyas son nuevas? ¿Cómo cambiaría la viñeta con otra traducción?»',
      despues: 'Elaborar un pequeño glosario de la lectura y explicar una expresión a un compañero.'
    },
    inclusion: {
      durante: 'Identificar las barreras y los apoyos que vive el personaje, y la diversidad que representa.',
      pregunta: '«¿Qué dificultades encuentra el personaje y qué (o quién) le ayuda? ¿Qué nos enseña?»',
      despues: 'Proponer un apoyo o ajuste que mejoraría la situación del personaje (diseño universal).'
    },
    visual: {
      durante: 'Leer el lenguaje visual: encuadre, líneas cinéticas, tamaño de viñeta y el espacio entre ellas (ma).',
      pregunta: '«¿Por qué esta viñeta es más grande o más rápida? ¿Qué ocurre en el salto entre dos viñetas?»',
      despues: 'Nombrar dos recursos visuales usados y explicar qué efecto buscan en quien lee.'
    }
  };

  /** Foco por defecto si la categoría no está mapeada o es desconocida. */
  var FOCO_DEFAULT = {
    durante: 'Seguir el hilo de la historia y los recursos del lenguaje del manga (sentido de lectura, viñeta y elipsis).',
    pregunta: '«¿Qué está pasando en esta página? ¿Qué pista del dibujo nos lo dice?»',
    despues: 'Resumir con tus palabras qué quería contar la lectura y qué te ha aportado.'
  };

  /**
   * Devuelve la primera categoría reconocida del campo `uso` (que puede ser
   * compuesto, p. ej. "emocional filosofia").
   * @param {string} uso
   * @returns {string}
   */
  function categoriaPrincipal(uso) {
    var partes = String(uso || '').toLowerCase().split(/\s+/);
    for (var i = 0; i < partes.length; i++) {
      if (FOCO[partes[i]]) return partes[i];
    }
    return '';
  }

  /**
   * Construye el modelo de datos del andamiaje para un título.
   * @param {Object} t  ficha del catálogo
   * @returns {{titulo:string, autor:string, meta:string, fases:Array}}
   */
  function generar(t) {
    var cat = categoriaPrincipal(t.uso);
    var foco = FOCO[cat] || FOCO_DEFAULT;
    var sinopsis = (t.tip || '').trim();
    var periodo = (t.periodo || '').trim();
    var nivel = (t.niveles && t.niveles.length) ? t.niveles.join(', ') : (t.nivel || '');
    var odsTxt = (t.ods && t.ods.length)
      ? t.ods.map(function (n) { return ODS[n] ? (n + ' ' + ODS[n]) : ('ODS ' + n); }).join(' · ')
      : '';

    var meta = [nivel, cat ? ('Eje: ' + cat) : '', periodo].filter(Boolean).join('  ·  ');

    var fases = [
      {
        tag: 'Antes de leer',
        titulo: 'Anticipación y activación de conocimientos previos',
        hace: 'Muestra la portada o la primera página y, sin desvelar la trama, activa lo que el alumnado ya sabe' +
              (periodo ? (' sobre «' + periodo + '»') : '') + '.',
        pregunta: sinopsis
          ? ('«Sabiendo solo esto —' + sinopsis + '—, ¿qué creéis que va a pasar y por qué?»')
          : '«¿Qué creéis que va a pasar? ¿En qué os fijáis para suponerlo?»',
        porque: 'Anticipar genera expectativas y predispone a una lectura activa; conectar con lo conocido facilita la comprensión.'
      },
      {
        tag: 'Durante la lectura',
        titulo: 'Lectura guiada con foco de comprensión',
        hace: 'Recuerda el sentido de lectura (derecha → izquierda) y la lectura de la elipsis entre viñetas (ma). Después, ' +
              foco.durante,
        pregunta: foco.pregunta,
        porque: 'La comprensión exige inferir lo que no se muestra y atender al recurso pertinente según el propósito de la lectura.'
      },
      {
        tag: 'Después de leer',
        titulo: 'Síntesis, conexión competencial y metacognición',
        hace: 'Recompone el sentido global de lo leído y abre la transferencia: ' + foco.despues +
              (odsTxt ? (' Conecta con los ODS: ' + odsTxt + '.') : ''),
        pregunta: '«¿Qué nos quería contar? ¿Qué estrategia te ha ayudado a entenderlo y qué te ha costado más?»',
        porque: 'Integrar las partes en un todo, vincularlo con competencias/ODS y reflexionar sobre el propio proceso consolida y transfiere la estrategia lectora (aprender a aprender).'
      }
    ];

    return { titulo: t.titulo || 'Título', autor: t.autor || '', meta: meta, fases: fases };
  }

  /* ── DOM helpers ───────────────────────────────────────────────── */
  function el(tag, cls, txt) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (txt != null) n.textContent = txt;
    return n;
  }

  var overlay = null, modal = null, bodyEl = null, triggerBtn = null;

  /** Render del selector de títulos (con filtro de texto). */
  function renderPicker(query) {
    var cat = (window.CATALOGO || []);
    var q = (query || '').trim().toLowerCase();
    var matches = cat.filter(function (t) {
      if (!q) return true;
      return (String(t.titulo || '').toLowerCase().indexOf(q) >= 0) ||
             (String(t.autor || '').toLowerCase().indexOf(q) >= 0);
    }).slice(0, 60);

    var list = el('ul', 'andl-picker-list');
    list.setAttribute('role', 'listbox');
    list.setAttribute('aria-label', 'Resultados de títulos');

    if (!matches.length) {
      list.appendChild(el('li', 'andl-picker-empty', 'No hay títulos que coincidan con «' + (query || '') + '».'));
      return list;
    }
    matches.forEach(function (t) {
      var li = el('li');
      var b = el('button', 'andl-picker-opt');
      b.type = 'button';
      b.setAttribute('role', 'option');
      var strong = el('span', null, t.titulo || 'Sin título');
      var small = el('small', null, t.autor || '');
      b.appendChild(strong); b.appendChild(small);
      b.addEventListener('click', function () { renderResult(t); });
      li.appendChild(b);
      list.appendChild(li);
    });
    return list;
  }

  /** Vista de selección (paso 1). */
  function renderPickerView() {
    bodyEl.innerHTML = '';
    bodyEl.appendChild(Object.assign(el('p', 'andl-intro'), {
      textContent: 'Elige un título del fondo y se generará un andamiaje de lectura en tres fases (antes, durante y después), adaptado a su eje pedagógico y a sus ODS. Imprimible para el aula.'
    }));

    var picker = el('div', 'andl-picker');
    var input = el('input', 'andl-picker-input');
    input.type = 'search';
    input.id = 'andlSearch';
    input.setAttribute('placeholder', 'Busca por título o autor…');
    input.setAttribute('aria-label', 'Buscar título');
    var listWrap = el('div');
    listWrap.appendChild(renderPicker(''));
    input.addEventListener('input', function () {
      listWrap.innerHTML = '';
      listWrap.appendChild(renderPicker(input.value));
    });
    picker.appendChild(input);
    picker.appendChild(listWrap);
    bodyEl.appendChild(picker);
    // Foco al campo de búsqueda
    setTimeout(function () { input.focus(); }, 30);
  }

  /** Vista de resultado (paso 2): el andamiaje generado. */
  function renderResult(t) {
    var data = generar(t);
    bodyEl.innerHTML = '';

    var back = el('button', 'andl-btn', '← Elegir otro título');
    back.type = 'button';
    back.addEventListener('click', renderPickerView);
    bodyEl.appendChild(back);

    var h3 = el('h3', 'andl-result-head', data.titulo);
    bodyEl.appendChild(h3);
    if (data.autor) bodyEl.appendChild(Object.assign(el('p'), { textContent: data.autor, style: 'margin:.1rem 0 .2rem;color:var(--grey);font-size:.85rem;' }));
    if (data.meta) bodyEl.appendChild(el('p', 'andl-result-meta', data.meta));

    data.fases.forEach(function (f) {
      var sec = el('section', 'andl-fase');
      sec.setAttribute('aria-label', f.tag + ': ' + f.titulo);
      sec.appendChild(el('span', 'andl-fase-tag', f.tag));
      sec.appendChild(el('h4', null, f.titulo));

      var rHace = el('div', 'andl-row');
      rHace.appendChild(el('span', 'andl-rtag', 'Qué hace el docente'));
      rHace.appendChild(el('p', null, f.hace));
      sec.appendChild(rHace);

      var rQ = el('div', 'andl-row andl-q');
      rQ.appendChild(el('span', 'andl-rtag', 'Pregunta modelo'));
      rQ.appendChild(el('p', null, f.pregunta));
      sec.appendChild(rQ);

      var rW = el('div', 'andl-row');
      rW.appendChild(el('span', 'andl-rtag', 'Por qué'));
      rW.appendChild(el('p', null, f.porque));
      sec.appendChild(rW);

      bodyEl.appendChild(sec);
    });

    // Acciones: imprimir + copiar
    var actions = el('div', 'andl-actions');
    var print = el('button', 'andl-btn andl-btn--pri', '⎙ Imprimir / Guardar PDF');
    print.type = 'button';
    print.addEventListener('click', function () { window.print(); });
    var copy = el('button', 'andl-btn', '⧉ Copiar texto');
    copy.type = 'button';
    var status = el('p', 'andl-status');
    status.setAttribute('aria-live', 'polite');
    copy.addEventListener('click', function () {
      var txt = plainText(data);
      copyToClipboard(txt, function (ok) {
        status.textContent = ok ? 'Andamiaje copiado al portapapeles.' : 'No se pudo copiar; selecciona el texto manualmente.';
      });
    });
    actions.appendChild(print);
    actions.appendChild(copy);
    bodyEl.appendChild(actions);
    bodyEl.appendChild(status);

    // Devolver el foco al inicio del resultado
    setTimeout(function () { h3.setAttribute('tabindex', '-1'); h3.focus(); }, 30);
  }

  /** Serializa el andamiaje a texto plano para copiar. */
  function plainText(d) {
    var out = d.titulo + (d.autor ? (' — ' + d.autor) : '') + '\n' + (d.meta || '') + '\n\n';
    d.fases.forEach(function (f) {
      out += '【' + f.tag + '】 ' + f.titulo + '\n';
      out += '· Qué hace: ' + f.hace + '\n';
      out += '· Pregunta modelo: ' + f.pregunta + '\n';
      out += '· Por qué: ' + f.porque + '\n\n';
    });
    out += 'Modelo antes/durante/después (Solé, 1992). Recurso «El manga en el aula» · ULPGC.';
    return out;
  }

  /** Copia robusta con fallback a execCommand. */
  function copyToClipboard(text, cb) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () { cb(true); }, function () { fallback(); });
    } else { fallback(); }
    function fallback() {
      try {
        var ta = document.createElement('textarea');
        ta.value = text; ta.style.position = 'fixed'; ta.style.opacity = '0';
        document.body.appendChild(ta); ta.select();
        var ok = document.execCommand('copy');
        document.body.removeChild(ta); cb(!!ok);
      } catch (e) { cb(false); }
    }
  }

  /* ── Modal ─────────────────────────────────────────────────────── */
  function buildModal() {
    if (modal) return;
    overlay = el('div', 'andl-overlay'); overlay.hidden = true;
    modal = el('div', 'andl-modal');
    modal.setAttribute('role', 'dialog');
    modal.setAttribute('aria-modal', 'true');
    modal.setAttribute('aria-labelledby', 'andlTitle');

    var head = el('div', 'andl-header');
    var h2 = el('h2', null, '⊞ Andamiaje de lectura'); h2.id = 'andlTitle';
    var close = el('button', 'andl-close', '✕'); close.type = 'button';
    close.setAttribute('aria-label', 'Cerrar andamiaje');
    close.addEventListener('click', closeModal);
    head.appendChild(h2); head.appendChild(close);
    modal.appendChild(head);

    bodyEl = el('div', 'andl-body');
    modal.appendChild(bodyEl);
    overlay.appendChild(modal);
    overlay.addEventListener('click', function (e) { if (e.target === overlay) closeModal(); });
    document.body.appendChild(overlay);
  }

  function openModal() {
    buildModal();
    renderPickerView();
    overlay.hidden = false;
    document.body.classList.add('has-overlay');
    if (window.FocusTrap && FocusTrap.activate) FocusTrap.activate(modal, triggerBtn);
  }
  function closeModal() {
    if (!overlay) return;
    overlay.hidden = true;
    document.body.classList.remove('has-overlay');
    if (window.FocusTrap && FocusTrap.deactivate) FocusTrap.deactivate();
    else if (triggerBtn) triggerBtn.focus();
  }

  /* ── Disparador en el speed-dial ───────────────────────────────── */
  function mountTrigger() {
    var fabItems = document.getElementById('fabItems');
    if (document.getElementById('andlFabBtn')) { triggerBtn = document.getElementById('andlFabBtn'); return; }
    var b = el('button', 'fab-action', '⊞'); b.type = 'button'; b.id = 'andlFabBtn';
    b.setAttribute('aria-label', 'Andamiaje de lectura por título');
    b.setAttribute('title', 'Andamiaje de lectura');
    b.addEventListener('click', openModal);
    if (fabItems) {
      var wrap = el('div', 'fab-item'); wrap.appendChild(b); fabItems.appendChild(wrap);
    } else {
      b.style.cssText = 'position:fixed;bottom:16px;left:72px;z-index:99990;width:48px;height:48px;border-radius:50%;';
      document.body.appendChild(b);
    }
    triggerBtn = b;
  }

  function init() { mountTrigger(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
