#!/usr/bin/env bash
# Regenera los bundles minificados que sirve el sitio.
# Editar SIEMPRE los fuentes (site/js/app.js, site/js/datos.js);
# tras editar, ejecutar este script para actualizar los .min.js.
# Requiere terser:  npm install -g terser
set -euo pipefail
cd "$(dirname "$0")/../site/js"
for f in app datos; do
  terser "$f.js" --compress --mangle --output "$f.min.js"
  echo "  $f.min.js regenerado"
done
echo "Hecho. Recuerda subir CACHE_NAME en site/sw.js si cambian los assets."
