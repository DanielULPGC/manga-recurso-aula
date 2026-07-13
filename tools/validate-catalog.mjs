#!/usr/bin/env node
import vm from 'node:vm';
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { failWithFindings, ok, readText, sitePath } from './check-utils.mjs';

const REPORT = join(sitePath('..'), 'reports', 'catalogo-validacion.md');
const REQUIRED = ['titulo', 'autor', 'uso', 'nivel', 'color', 'tip', 'periodo', 'badges', 'niveles', 'ods', 'opac'];
const ALLOWED_LEVEL_TOKENS = new Set(['primaria', 'secundaria', 'bachillerato', 'universidad']);
const ALLOWED_USE_TOKENS = new Set(['ciencia', 'historia', 'filosofia', 'lenguas', 'emocional', 'genero', 'inclusion', 'visual']);
const EXPECTED_BADGE_BY_USE = {
  ciencia: 'Ciencia y tecnologia',
  historia: 'Historia',
  filosofia: 'Filosofia y etica',
  lenguas: 'Lengua extranjera',
  emocional: 'Educacion emocional',
  genero: 'Genero e identidad',
  inclusion: 'Inclusion',
  visual: 'Alfabetizacion visual',
};

function normalize(value) {
  return String(value || '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .trim()
    .toLowerCase();
}

function loadCatalog(source) {
  const sandbox = { window: {} };
  vm.createContext(sandbox);
  vm.runInContext(`${source}\n;globalThis.__CATALOGO__ = CATALOGO;`, sandbox, {
    filename: 'js/datos.js',
    timeout: 1000,
  });
  return sandbox.__CATALOGO__;
}

function itemLabel(item, index) {
  return `${index + 1}. ${item?.titulo || '(sin titulo)'}`;
}

const source = await readText(sitePath('js', 'datos.js'));
const catalog = loadCatalog(source);
const errors = [];
const warnings = [];
const recommendations = [];
const seenTitles = new Map();

catalog.forEach((item, index) => {
  const label = itemLabel(item, index);

  for (const field of REQUIRED) {
    const value = item[field];
    if (value == null || value === '' || (Array.isArray(value) && value.length === 0)) {
      errors.push(`${label}: campo obligatorio ausente o vacio: ${field}`);
    }
  }

  const titleKey = normalize(item.titulo);
  if (titleKey) {
    if (seenTitles.has(titleKey)) {
      errors.push(`${label}: titulo duplicado con ${seenTitles.get(titleKey)}`);
    } else {
      seenTitles.set(titleKey, label);
    }
  }

  const levelTokens = String(item.nivel || '').split(/\s+/).filter(Boolean);
  for (const token of levelTokens) {
    if (!ALLOWED_LEVEL_TOKENS.has(token)) {
      warnings.push(`${label}: nivel no normalizado: "${item.nivel}"`);
    }
  }

  if (!Array.isArray(item.niveles)) {
    warnings.push(`${label}: niveles debe ser un array`);
  } else {
    const nivelesNorm = item.niveles.map(normalize);
    for (const token of levelTokens) {
      if (!nivelesNorm.includes(token)) {
        warnings.push(`${label}: nivel "${token}" no aparece reflejado en niveles[]`);
      }
    }
  }

  const useTokens = String(item.uso || '').split(/\s+/).filter(Boolean);
  for (const token of useTokens) {
    if (!ALLOWED_USE_TOKENS.has(token)) {
      warnings.push(`${label}: uso no normalizado: "${item.uso}"`);
    }
  }

  if (!Array.isArray(item.badges)) {
    warnings.push(`${label}: badges debe ser un array`);
  } else {
    const badgesNorm = item.badges.map(normalize);
    for (const token of useTokens) {
      const expected = EXPECTED_BADGE_BY_USE[token];
      if (expected && !badgesNorm.includes(normalize(expected))) {
        recommendations.push(`${label}: revisar coherencia badges[]/uso para "${token}"`);
      }
    }
  }

  if (!Array.isArray(item.ods) || item.ods.some(n => !Number.isInteger(n) || n < 1 || n > 17)) {
    errors.push(`${label}: ODS mal formado; se esperan enteros 1-17`);
  }

  try {
    const url = new URL(item.opac);
    if (!/^https?:$/.test(url.protocol)) {
      errors.push(`${label}: OPAC con protocolo no permitido: ${item.opac}`);
    }
  } catch {
    errors.push(`${label}: OPAC vacio o URL invalida`);
  }

  if (item.sensitive === true && !String(item.sens_label || '').trim()) {
    warnings.push(`${label}: sensitive=true sin sens_label`);
  }
  if (item.sens_label && item.sensitive !== true) {
    warnings.push(`${label}: sens_label informado sin sensitive=true`);
  }
});

function list(items) {
  return items.length ? items.map(item => `- ${item}`).join('\n') : '- Ninguno.';
}

const report = `# Validacion del catalogo\n\nFecha: ${new Date().toISOString().slice(0, 10)}\n\nFuente: site/js/datos.js\n\nTotal de registros: ${catalog.length}\n\n## Errores\n\n${list(errors)}\n\n## Advertencias\n\n${list(warnings)}\n\n## Recomendaciones\n\n${list(recommendations)}\n`;

await mkdir(dirname(REPORT), { recursive: true });
await writeFile(REPORT, report, 'utf8');

if (errors.length) {
  failWithFindings('Errores de catalogo', errors.map(message => ({ file: 'js/datos.js', message })));
} else {
  ok(`catalogo (${catalog.length} registros, ${warnings.length} advertencias, ${recommendations.length} recomendaciones)`);
}
