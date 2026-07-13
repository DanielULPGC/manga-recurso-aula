/* ══════════════════════════════════════════════════════════════
   jardin-arte.js — Arte generativo del Jardín de tinta
   v5.11 · Rama sumi-e procedural + pétalos cayendo (canvas)
   Sin dependencias. Respeta prefers-reduced-motion.
   ══════════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var DPR = Math.min(window.devicePixelRatio || 1, 2);

  var INK = 'rgba(26,20,16,';
  var PETAL_COLORS = ['#c9556a', '#d4738a', '#b8341d', '#dd8fa0', '#c26478'];

  function rand(a, b) { return a + Math.random() * (b - a); }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  /* ── Flor de 5 pétalos ── */
  function drawBlossom(ctx, x, y, r, color, alpha) {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(rand(0, Math.PI));
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    for (var i = 0; i < 5; i++) {
      ctx.rotate((Math.PI * 2) / 5);
      ctx.beginPath();
      ctx.ellipse(r * 0.62, 0, r * 0.58, r * 0.38, 0, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = alpha * 0.9;
    ctx.fillStyle = '#8a2318';
    ctx.beginPath();
    ctx.arc(0, 0, r * 0.16, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  /* ── Rama recursiva estilo sumi-e ── */
  function drawBranch(ctx, x, y, angle, len, width, depth, blossoms) {
    if (depth <= 0 || len < 8) {
      if (Math.random() < 0.85) blossoms.push({ x: x, y: y, r: rand(5, 11) });
      return;
    }
    var segs = 3;
    var px = x, py = y, pa = angle;
    ctx.strokeStyle = INK + rand(0.62, 0.88) + ')';
    ctx.lineCap = 'round';
    for (var s = 0; s < segs; s++) {
      var segLen = len / segs;
      var na = pa + rand(-0.28, 0.28);
      var nx = px + Math.cos(na) * segLen;
      var ny = py + Math.sin(na) * segLen;
      ctx.lineWidth = Math.max(width * (1 - s / (segs * 1.6)), 0.7);
      ctx.beginPath();
      ctx.moveTo(px, py);
      var cx = px + Math.cos(pa) * segLen * 0.6;
      var cy = py + Math.sin(pa) * segLen * 0.6;
      ctx.quadraticCurveTo(cx, cy, nx, ny);
      ctx.stroke();
      // flores ocasionales a lo largo de ramas finas
      if (width < 4 && Math.random() < 0.5) {
        blossoms.push({ x: nx + rand(-8, 8), y: ny + rand(-8, 8), r: rand(4, 9) });
      }
      px = nx; py = ny; pa = na;
    }
    var forks = depth > 3 ? 2 : (Math.random() < 0.7 ? 2 : 1);
    for (var f = 0; f < forks; f++) {
      drawBranch(ctx, px, py,
        pa + rand(-0.7, 0.7),
        len * rand(0.6, 0.8),
        width * rand(0.5, 0.68),
        depth - 1, blossoms);
    }
  }

  function paintRama() {
    var canvas = document.getElementById('ramaCanvas');
    if (!canvas) return;
    var w = canvas.offsetWidth, h = canvas.offsetHeight;
    canvas.width = w * DPR; canvas.height = h * DPR;
    var ctx = canvas.getContext('2d');
    ctx.scale(DPR, DPR);
    ctx.clearRect(0, 0, w, h);

    var blossoms = [];
    // rama principal: entra por la esquina superior derecha
    drawBranch(ctx, w * 1.02, h * -0.04, Math.PI * 0.78, Math.min(w, h) * 0.34, 13, 6, blossoms);
    // rama secundaria: entra por la derecha, media altura
    drawBranch(ctx, w * 1.04, h * 0.42, Math.PI * 1.06, Math.min(w, h) * 0.26, 9, 5, blossoms);
    // rama terciaria pequeña: esquina inferior izquierda
    drawBranch(ctx, w * -0.03, h * 0.96, Math.PI * -0.22, Math.min(w, h) * 0.2, 7, 4, blossoms);

    blossoms.forEach(function (b) {
      // racimo: 1-3 flores próximas
      var n = 1 + Math.floor(Math.random() * 3);
      for (var i = 0; i < n; i++) {
        drawBlossom(ctx, b.x + rand(-10, 10), b.y + rand(-10, 10),
          b.r * rand(0.7, 1.1), pick(PETAL_COLORS), rand(0.55, 0.92));
      }
    });

    // pétalos sueltos dispersos por el lienzo
    for (var i = 0; i < 26; i++) {
      ctx.globalAlpha = rand(0.12, 0.4);
      ctx.fillStyle = pick(PETAL_COLORS);
      ctx.beginPath();
      ctx.ellipse(rand(0, w), rand(0, h), rand(2, 5), rand(1.2, 3), rand(0, Math.PI), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
    canvas.classList.add('arte-in');
  }

  /* ── Pétalos cayendo (capa fija) ── */
  function startPetalos() {
    if (reduced) return;
    var canvas = document.getElementById('petalosCanvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    var W, H, petals = [];
    var wind = 0, lastScroll = window.scrollY;

    function resize() {
      W = window.innerWidth; H = window.innerHeight;
      canvas.width = W * DPR; canvas.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    var COUNT = Math.min(Math.floor(W / 30), 46);
    for (var i = 0; i < COUNT; i++) {
      petals.push({
        x: rand(0, W), y: rand(-H, H),
        r: rand(2.4, 5.6),
        vy: rand(0.35, 1.0),
        vx: rand(-0.25, 0.35),
        rot: rand(0, Math.PI * 2),
        vr: rand(-0.02, 0.02),
        color: pick(PETAL_COLORS),
        alpha: rand(0.35, 0.8),
        sway: rand(0.4, 1.4),
        phase: rand(0, Math.PI * 2)
      });
    }

    window.addEventListener('scroll', function () {
      var d = window.scrollY - lastScroll;
      lastScroll = window.scrollY;
      wind += d * 0.012;
    }, { passive: true });

    var t = 0;
    function frame() {
      t += 0.016;
      wind *= 0.94;
      ctx.clearRect(0, 0, W, H);
      petals.forEach(function (p) {
        p.y += p.vy + Math.abs(wind) * 0.6;
        p.x += p.vx + Math.sin(t * p.sway + p.phase) * 0.4 + wind * 0.8;
        p.rot += p.vr + wind * 0.01;
        if (p.y > H + 12) { p.y = -12; p.x = rand(0, W); }
        if (p.x > W + 12) p.x = -12;
        if (p.x < -12) p.x = W + 12;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.globalAlpha = p.alpha;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.ellipse(0, 0, p.r, p.r * 0.55, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  function init() {
    paintRama();
    startPetalos();
    var rt;
    window.addEventListener('resize', function () {
      clearTimeout(rt);
      rt = setTimeout(paintRama, 250);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
