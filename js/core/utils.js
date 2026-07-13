(function (global) {
  'use strict';

  const SANITIZE_ALLOWLIST_TAGS = new Set([
    'P', 'BR', 'STRONG', 'EM', 'B', 'I',
    'UL', 'OL', 'LI',
    'H1', 'H2', 'H3', 'H4',
    'TABLE', 'THEAD', 'TBODY', 'TR', 'TH', 'TD',
    'BLOCKQUOTE', 'CODE', 'PRE',
    'MARK', 'SPAN',
    'A',
  ]);

  const SANITIZE_ALLOWLIST_ATTRS = Object.freeze({
    A: ['href', 'title'],
    MARK: ['class'],
    SPAN: ['class'],
    CODE: ['class'],
  });

  function sanitizeHtml(dirtyHtml) {
    if (!dirtyHtml || typeof dirtyHtml !== 'string') return '';

    let doc;
    try {
      doc = new DOMParser().parseFromString(dirtyHtml, 'text/html');
    } catch {
      return dirtyHtml.replace(/</g, '&lt;').replace(/>/g, '&gt;');
    }

    function clean(node) {
      const children = Array.from(node.childNodes);
      for (const child of children) {
        if (child.nodeType === Node.TEXT_NODE) continue;

        if (child.nodeType === Node.ELEMENT_NODE) {
          const tag = child.tagName.toUpperCase();

          if (!SANITIZE_ALLOWLIST_TAGS.has(tag)) {
            const text = document.createTextNode(child.textContent);
            child.replaceWith(text);
            continue;
          }

          const allowedAttrs = SANITIZE_ALLOWLIST_ATTRS[tag] || [];
          const attrNames = Array.from(child.attributes).map(a => a.name);
          for (const attr of attrNames) {
            if (!allowedAttrs.includes(attr)) child.removeAttribute(attr);
          }

          if (tag === 'A') {
            const href = child.getAttribute('href') || '';
            if (/^(javascript|data|vbscript):/i.test(href.trim())) {
              child.removeAttribute('href');
            }
          }

          clean(child);
        } else {
          child.remove();
        }
      }
    }

    clean(doc.body);
    return doc.body.innerHTML;
  }

  function escapeHtml(str) {
    if (!str || typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;');
  }

  global.MangaUtils = Object.freeze({
    sanitizeHtml,
    escapeHtml,
  });
})(window);
