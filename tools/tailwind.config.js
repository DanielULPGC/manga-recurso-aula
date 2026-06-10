/** Config estatica equivalente al Play CDN previo (index.html) */
module.exports = {
  content: ['./index.html', './landing/htm-app.js'],
  theme: {
    extend: {
      fontFamily: {
        heading: ['Shippori Mincho B1', 'serif'],
        body:    ['Shippori Mincho B1', 'serif'],
        mono:    ['JetBrains Mono', 'ui-monospace', 'monospace'],
        jp:      ['Noto Serif JP', 'serif'],
      },
      colors: {
        ink:    '#0e0a04',
        ink2:   '#1a1410',
        paper:  '#f3ede1',
        paper2: '#e8ddc8',
        red:    '#b8341d',
        gold:   '#b8860b',
        rule:   'rgba(243,237,225,0.18)',
      },
      borderRadius: { DEFAULT: '9999px' },
      letterSpacing: { kicker: '0.16em' },
    }
  },
  corePlugins: { preflight: true },
};
