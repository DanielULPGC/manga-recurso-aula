(function () {
  'use strict';

  const selected = new Set();
  const $ = (id) => document.getElementById(id);
  const clean = (value) => String(value || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
  const esc = (value) => String(value || '').replace(/[&<>"']/g, ch => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[ch]));

  function catalog() {
    return Array.isArray(window.CATALOGO) ? window.CATALOGO : [];
  }

  function currentQuery() {
    return $('guiaSearch')?.value || '';
  }

  function renderPicker(query) {
    const list = $('guiaPickerList');
    if (!list) return;
    const q = clean(query);
    const items = catalog().filter(item => {
      if (!q) return true;
      return clean(item.titulo).includes(q) || clean(item.autor).includes(q);
    }).slice(0, 100);

    if (!items.length) {
      list.innerHTML = '<p class="guia-empty">Sin resultados.</p>';
      updateState();
      return;
    }

    list.innerHTML = items.map(item => {
      const title = item.titulo || '';
      const checked = selected.has(title) ? 'checked' : '';
      return `<label class="guia-picker-item" tabindex="0">
        <input type="checkbox" ${checked} data-guia-title="${esc(title)}">
        <span class="guia-picker-dot" style="background:${esc(item.color || '#7a5a0a')}"></span>
        <span>
          <span class="guia-picker-title">${esc(title)}</span><br>
          <span class="guia-picker-author">${esc(item.autor || '')}</span>
        </span>
      </label>`;
    }).join('');
    updateState();
  }

  function setTitle(title, checked) {
    if (!title) return;
    if (checked) selected.add(title);
    else selected.delete(title);
    updateState();
  }

  function updateState() {
    const count = $('guiaCount');
    const chips = $('guiaChips');
    const btn = $('guiaGenBtn');
    if (count) count.textContent = `(${selected.size})`;
    if (btn) btn.disabled = selected.size === 0;
    if (chips) {
      chips.innerHTML = Array.from(selected).map(title => `<span class="guia-chip">
        ${esc(title.length > 30 ? title.slice(0, 30) + '...' : title)}
        <button type="button" class="guia-chip-rm" data-guia-title="${esc(title)}" aria-label="Quitar ${esc(title)}">x</button>
      </span>`).join('');
    }
  }

  function downloadHtml(filename, html) {
    const blob = new Blob([html], { type: 'text/html;charset=utf-8' });
    if (typeof window._descargarBlob === 'function') {
      window._descargarBlob(blob, filename);
      return;
    }
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1500);
  }

  function guideHtml() {
    const selectedItems = catalog().filter(item => selected.has(item.titulo));
    const title = $('guiaTitulo')?.value || 'Guia didactica - Fondo manga ULPGC';
    const incLomloe = $('guiaIncLomloe')?.checked;
    const incTip = $('guiaIncTip')?.checked;
    const incOds = $('guiaIncOds')?.checked;
    const incBadge = $('guiaIncBadge')?.checked;
    const now = new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });

    const cards = selectedItems.map(item => `<article class="card" style="border-left-color:${esc(item.color || '#b8860b')}">
      <h2>${esc(item.titulo)}</h2>
      <p class="author">${esc(item.autor || '')}</p>
      <p><strong>Uso pedagógico:</strong> ${esc((item.badges && item.badges[0]) || item.uso || '')}</p>
      ${incTip && item.tip ? `<p>${esc(item.tip)}</p>` : ''}
      ${incLomloe ? `<p><strong>Competencias:</strong> CCL, CPSAA, CCEC</p>` : ''}
      ${incOds && item.ods?.length ? `<p><strong>ODS:</strong> ${item.ods.map(n => 'ODS ' + esc(n)).join(' · ')}</p>` : ''}
      ${item.opac ? `<p><a href="${esc(item.opac)}">Ver en catalogo ULPGC</a></p>` : ''}
    </article>`).join('');

    const badge = incBadge ? '<p class="badge">Contenido generado con asistencia digital. Revisar y validar antes de usar en aula.</p>' : '';
    return `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<title>${esc(title)}</title>
<style>
body{font-family:Georgia,serif;max-width:900px;margin:0 auto;padding:32px;color:#1a1008;background:#fffaf0}
h1{font-size:28px;margin:0 0 6px}
.meta{color:#6b5a43;margin-bottom:24px}
.badge{border:1px solid #b8860b;background:#fff1c2;padding:10px 12px}
.card{border:1px solid #d8c8ad;border-left:7px solid #b8860b;border-radius:6px;padding:18px 20px;margin:0 0 16px;background:#fff}
.card h2{font-size:21px;margin:0 0 4px}
.author{font-style:italic;color:#6b5a43;margin-top:0}
a{color:#145c8a}
@media print{body{padding:0}.card{break-inside:avoid}}
</style>
</head>
<body>
<h1>${esc(title)}</h1>
<p class="meta">Biblioteca del Campus del Obelisco · ULPGC · ${esc(now)} · ${selectedItems.length} titulo(s)</p>
${badge}
${cards}
</body>
</html>`;
  }

  function generateGuide() {
    if (!selected.size) {
      updateState();
      return;
    }
    const btn = $('guiaGenBtn');
    if (btn) {
      btn.disabled = true;
      btn.textContent = 'Generando...';
    }
    try {
      const rawTitle = $('guiaTitulo')?.value || 'guia-didactica';
      const safe = clean(rawTitle).replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '') || 'guia-didactica';
      downloadHtml(`${safe}.html`, guideHtml());
      window.closeGuia?.();
    } finally {
      if (btn) {
        btn.textContent = 'Generar guia imprimible';
        btn.disabled = selected.size === 0;
      }
    }
  }

  function openGuide() {
    const overlay = $('guiaOverlay');
    overlay?.classList.add('open');
    document.body.style.overflow = 'hidden';
    if ($('guiaSearch')) $('guiaSearch').value = '';
    renderPicker('');
    updateState();
  }

  function closeGuide() {
    $('guiaOverlay')?.classList.remove('open');
    document.body.style.overflow = '';
  }

  function bind() {
    window.openGuia = openGuide;
    window.closeGuia = closeGuide;
    window.filterGuiaPicker = renderPicker;
    window.toggleGuiaItem = setTitle;
    window.generarGuia = generateGuide;

    document.addEventListener('input', ev => {
      if (ev.target?.id === 'guiaSearch') renderPicker(ev.target.value);
    }, true);

    document.addEventListener('change', ev => {
      const input = ev.target?.closest?.('#guiaPickerList input[data-guia-title]');
      if (input) setTitle(input.dataset.guiaTitle, input.checked);
    }, true);

    document.addEventListener('click', ev => {
      const remove = ev.target?.closest?.('.guia-chip-rm[data-guia-title]');
      if (remove) {
        setTitle(remove.dataset.guiaTitle, false);
        renderPicker(currentQuery());
        return;
      }
      const item = ev.target?.closest?.('#guiaPickerList .guia-picker-item');
      if (!item || ev.target?.matches?.('input')) return;
      ev.preventDefault();
      const input = item.querySelector('input[data-guia-title]');
      if (!input) return;
      input.checked = !input.checked;
      setTitle(input.dataset.guiaTitle, input.checked);
    }, true);

    document.addEventListener('keydown', ev => {
      const item = ev.target?.closest?.('#guiaPickerList .guia-picker-item');
      if (!item || (ev.key !== 'Enter' && ev.key !== ' ')) return;
      ev.preventDefault();
      const input = item.querySelector('input[data-guia-title]');
      if (!input) return;
      input.checked = !input.checked;
      setTitle(input.dataset.guiaTitle, input.checked);
    }, true);

    renderPicker(currentQuery());
    updateState();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind);
  else bind();
})();
