/* ============================================================
   parte-nav.js — Realce progresivo de la barra fija (.mb-nav)
   · Resalta el capítulo visible (scroll-spy con IntersectionObserver)
   · Pinta una fina barra de progreso de lectura
   Sin este archivo, los enlaces de la barra siguen funcionando.
   ============================================================ */
(function () {
  "use strict";
  var nav = document.querySelector(".mb-nav");
  if (!nav) return;

  var links = Array.prototype.slice.call(nav.querySelectorAll(".mb-nav-list a[href^='#']"));
  var byId = {};
  var sections = [];
  links.forEach(function (a) {
    var id = a.getAttribute("href").slice(1);
    var el = document.getElementById(id);
    if (el) { byId[id] = a; sections.push(el); }
  });
  if (!sections.length) return;

  function setActive(id) {
    links.forEach(function (a) {
      a.classList.toggle("is-active", a.getAttribute("href") === "#" + id);
    });
  }

  // ── scroll-spy ──────────────────────────────────────────
  var visible = {};
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting) visible[e.target.id] = e.intersectionRatio;
      else delete visible[e.target.id];
    });
    // el capítulo más arriba entre los visibles
    var best = null, bestTop = Infinity;
    Object.keys(visible).forEach(function (id) {
      var t = document.getElementById(id).getBoundingClientRect().top;
      if (t < bestTop) { bestTop = t; best = id; }
    });
    if (best) setActive(best);
  }, { rootMargin: "-66px 0px -55% 0px", threshold: [0, 0.25, 0.6, 1] });
  sections.forEach(function (s) { io.observe(s); });

  // ── barra de progreso ──────────────────────────────────
  var bar = nav.querySelector(".mb-nav-progress");
  if (bar) {
    var tick = function () {
      var h = document.documentElement;
      var max = h.scrollHeight - h.clientHeight;
      var p = max > 0 ? (h.scrollTop || document.body.scrollTop) / max : 0;
      bar.style.width = (p * 100).toFixed(1) + "%";
    };
    window.addEventListener("scroll", tick, { passive: true });
    window.addEventListener("resize", tick, { passive: true });
    tick();
  }

  // ── modo Leer / Consultar (persistente) ────────────────
  var modeBtn = document.getElementById("modo-consulta");
  if (modeBtn) {
    var KEY = "mr-modo";
    var apply = function (on) {
      document.body.classList.toggle("modo-consulta", on);
      modeBtn.setAttribute("aria-pressed", on ? "true" : "false");
    };
    apply(localStorage.getItem(KEY) === "consulta");
    modeBtn.addEventListener("click", function () {
      var on = document.body.classList.contains("modo-consulta");
      apply(!on);
      try { localStorage.setItem(KEY, !on ? "consulta" : "leer"); } catch (e) {}
    });
  }

  // ── marcas de la lista de control (persistentes) ───────
  var ticks = document.querySelectorAll(".mb-dec-tick input");
  ticks.forEach(function (cb, i) {
    var k = "mr-tick-" + i;
    try { if (localStorage.getItem(k) === "1") cb.checked = true; } catch (e) {}
    cb.addEventListener("change", function () {
      try { localStorage.setItem(k, cb.checked ? "1" : "0"); } catch (e) {}
    });
  });
})();
