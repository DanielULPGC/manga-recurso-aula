/* portada-bind.js  Enlaza los globales de las librerias vendorizadas. */
window.Motion = window.Motion || window.FramerMotion || {};
  window.html   = htm.bind(React.createElement);
