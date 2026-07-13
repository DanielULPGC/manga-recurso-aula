/* ══════════════════════════════════════════════════════════════
   orden-lectura.js — «¿En qué orden se lee?»
   Ejercicio manipulable de la destreza procedimental nuclear del
   manga: el orden de lectura derecha→izquierda, arriba→abajo.
   Complementa (no duplica) la anatomía expositiva: allí se MUESTRA
   el orden; aquí el lector lo RECONSTRUYE y recibe realimentación.
   Esquemas originales con fines didácticos; sin obra reproducida.
   Accesible: botones reales, foco visible, aria-live, teclado.
   ══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* Maquetas: cada viñeta declara su área de rejilla y su posición
     en el orden de lectura correcto (1-indexado). */
  var NIVELES = {
    sencilla: {
      etiqueta: 'Página sencilla',
      descripcion: 'Cuatro viñetas en dos filas. Recuerda: dentro de cada fila, primero la de la derecha.',
      areas: '"b a" "d c"',
      cols: '1fr 1fr',
      rows: '1fr 1fr',
      paneles: [
        { id: 'a', orden: 1, deco: 'fukidashi' },
        { id: 'b', orden: 2, deco: '' },
        { id: 'c', orden: 3, deco: 'kakimoji' },
        { id: 'd', orden: 4, deco: '' }
      ],
      regla: 'De derecha a izquierda y de arriba abajo: en cada fila se empieza por la viñeta más a la derecha.'
    },
    compleja: {
      etiqueta: 'Página compleja',
      descripcion: 'Una viñeta alta ocupa toda la columna derecha. ¿Cuándo se lee?',
      areas: '"c b a" "e d a"',
      cols: '1fr 1fr 1.15fr',
      rows: '1fr 1fr',
      paneles: [
        { id: 'a', orden: 1, deco: 'lineas' },
        { id: 'b', orden: 2, deco: '' },
        { id: 'c', orden: 3, deco: 'fukidashi' },
        { id: 'd', orden: 4, deco: 'kakimoji' },
        { id: 'e', orden: 5, deco: '' }
      ],
      regla: 'La viñeta alta de la derecha se lee completa en primer lugar; después se sigue con el resto, fila a fila y de derecha a izquierda.'
    }
  };

  var raiz, estado;

  function nuevoEstado(nivel) {
    return { nivel: nivel, secuencia: [], resuelto: false };
  }

  function construir() {
    raiz = document.getElementById('orden-lectura-root');
    if (!raiz) return;
    estado = nuevoEstado('sencilla');
    raiz.innerHTML = '';

    /* Selector de nivel */
    var tabs = el('div', 'ol-tabs');
    tabs.setAttribute('role', 'group');
    tabs.setAttribute('aria-label', 'Elegir tipo de página');
    Object.keys(NIVELES).forEach(function (k) {
      var b = el('button', 'ol-tab');
      b.type = 'button';
      b.textContent = NIVELES[k].etiqueta;
      b.dataset.nivel = k;
      b.setAttribute('aria-pressed', k === estado.nivel ? 'true' : 'false');
      b.addEventListener('click', function () {
        estado = nuevoEstado(k);
        pintar();
      });
      tabs.appendChild(b);
    });
    raiz.appendChild(tabs);

    raiz.appendChild(el('p', 'ol-desc'));

    var marco = el('div', 'ol-marco');
    var pagina = el('div', 'ol-pagina');
    pagina.setAttribute('role', 'group');
    pagina.setAttribute('aria-label', 'Página esquemática de manga: pulsa las viñetas en el orden en que se leerían');
    marco.appendChild(pagina);
    raiz.appendChild(marco);

    var acciones = el('div', 'ol-acciones');
    var btnReiniciar = el('button', 'ol-btn');
    btnReiniciar.type = 'button';
    btnReiniciar.textContent = 'Reiniciar';
    btnReiniciar.addEventListener('click', function () {
      estado = nuevoEstado(estado.nivel);
      pintar();
    });
    var btnSolucion = el('button', 'ol-btn ol-btn-sec');
    btnSolucion.type = 'button';
    btnSolucion.textContent = 'Ver el orden correcto';
    btnSolucion.addEventListener('click', mostrarSolucion);
    acciones.appendChild(btnReiniciar);
    acciones.appendChild(btnSolucion);
    raiz.appendChild(acciones);

    var aviso = el('p', 'ol-feedback');
    aviso.setAttribute('aria-live', 'polite');
    raiz.appendChild(aviso);

    pintar();
  }

  function el(tag, cls) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    return n;
  }

  function pintar() {
    var nivel = NIVELES[estado.nivel];
    raiz.querySelectorAll('.ol-tab').forEach(function (b) {
      b.setAttribute('aria-pressed', b.dataset.nivel === estado.nivel ? 'true' : 'false');
    });
    raiz.querySelector('.ol-desc').textContent = nivel.descripcion;

    var pagina = raiz.querySelector('.ol-pagina');
    pagina.style.gridTemplateAreas = nivel.areas;
    pagina.style.gridTemplateColumns = nivel.cols;
    pagina.style.gridTemplateRows = nivel.rows;
    pagina.innerHTML = '';

    nivel.paneles.forEach(function (p) {
      var b = el('button', 'ol-panel');
      b.type = 'button';
      b.style.gridArea = p.id;
      b.dataset.id = p.id;
      b.setAttribute('aria-label', 'Viñeta sin numerar');
      if (p.deco === 'fukidashi') {
        var f = el('span', 'ol-fukidashi'); f.setAttribute('aria-hidden', 'true'); f.textContent = '…'; b.appendChild(f);
      } else if (p.deco === 'kakimoji') {
        var k = el('span', 'ol-kakimoji'); k.setAttribute('aria-hidden', 'true'); k.lang = 'ja'; k.textContent = 'ドン'; b.appendChild(k);
      } else if (p.deco === 'lineas') {
        b.classList.add('ol-lineas');
      }
      var num = el('span', 'ol-num');
      num.setAttribute('aria-hidden', 'true');
      b.appendChild(num);
      b.addEventListener('click', function () { marcar(b, p); });
      pagina.appendChild(b);
    });

    raiz.querySelector('.ol-feedback').textContent = '';
  }

  function marcar(boton, panel) {
    if (estado.resuelto || boton.classList.contains('ol-elegida')) return;
    estado.secuencia.push(panel.id);
    var n = estado.secuencia.length;
    boton.classList.add('ol-elegida');
    boton.querySelector('.ol-num').textContent = n;
    boton.setAttribute('aria-label', 'Viñeta marcada como número ' + n);

    var nivel = NIVELES[estado.nivel];
    if (n === nivel.paneles.length) evaluar();
  }

  function evaluar() {
    estado.resuelto = true;
    var nivel = NIVELES[estado.nivel];
    var correcto = nivel.paneles.slice().sort(function (a, b) { return a.orden - b.orden; }).map(function (p) { return p.id; });
    var fallos = 0;

    nivel.paneles.forEach(function (p) {
      var b = raiz.querySelector('.ol-panel[data-id="' + p.id + '"]');
      var posUsuario = estado.secuencia.indexOf(p.id) + 1;
      if (posUsuario === p.orden) {
        b.classList.add('ol-bien');
      } else {
        b.classList.add('ol-mal');
        fallos++;
        var esp = el('span', 'ol-esperado');
        esp.textContent = '→ ' + p.orden;
        esp.setAttribute('aria-hidden', 'true');
        b.appendChild(esp);
        b.setAttribute('aria-label', 'Viñeta marcada como ' + posUsuario + '; el orden correcto era ' + p.orden);
      }
    });

    var fb = raiz.querySelector('.ol-feedback');
    if (fallos === 0) {
      fb.textContent = 'Correcto: has seguido el orden de lectura japonés. ' + nivel.regla;
      fb.className = 'ol-feedback ol-fb-bien';
    } else {
      fb.textContent = (fallos === 1 ? 'Una viñeta' : fallos + ' viñetas') +
        ' fuera de orden (en rojo, con el número que correspondía). ' + nivel.regla +
        ' Pulsa «Reiniciar» para intentarlo de nuevo.';
      fb.className = 'ol-feedback ol-fb-mal';
    }
  }

  function mostrarSolucion() {
    estado.resuelto = true;
    var nivel = NIVELES[estado.nivel];
    nivel.paneles.forEach(function (p) {
      var b = raiz.querySelector('.ol-panel[data-id="' + p.id + '"]');
      b.classList.remove('ol-mal');
      b.classList.add('ol-elegida', 'ol-solucion');
      b.querySelector('.ol-num').textContent = p.orden;
      b.setAttribute('aria-label', 'Viñeta número ' + p.orden + ' en el orden de lectura');
      var esp = b.querySelector('.ol-esperado');
      if (esp) esp.remove();
    });
    var fb = raiz.querySelector('.ol-feedback');
    fb.textContent = nivel.regla;
    fb.className = 'ol-feedback';
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', construir);
  } else {
    construir();
  }
})();
