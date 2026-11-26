// Dice qué palabras de un archivo de contenido todavía no tienen glosa (no usa IA).
//   node scripts/glosario-faltan.mjs <contenido.json> [glosario-extra.json …]
// Cuenta las palabras de los campos `es`/`ws` (español) y `en`/`we` (inglés), igual que la prueba del repo.
// Los glosarios extra tienen la forma { "es": { "palabra": "meaning" }, "en": { "word": "significado" } }.
import { readFileSync } from 'node:fs'; import { join, dirname } from 'node:path'; import { fileURLToPath } from 'node:url';
const R = join(dirname(fileURLToPath(import.meta.url)), '..'), leer = (f) => JSON.parse(readFileSync(f, 'utf8'));
const [, , archivo, ...extras] = process.argv;
if (!archivo) { console.error('Uso: node scripts/glosario-faltan.mjs <contenido.json> [glosario-extra.json …]'); process.exit(2); }
const g = { es: { ...leer(join(R, 'scripts/datos/glosario/es.json')) }, en: { ...leer(join(R, 'scripts/datos/glosario/en.json')) } };
let malas = 0;
for (const x of extras) { const e = leer(x); for (const l of ['es', 'en']) for (const [k, v] of Object.entries(e[l] || {})) {
  if (k !== k.toLowerCase() || !v || v.length > 60) { console.log(`glosa rara (${l}): «${k}» → «${v}» (clave en minúsculas; significado de 1 a 60 caracteres)`); malas++; }
  g[l][k] = v; } }
export const palabrasDe = (t) => String(t).toLowerCase().match(/\p{L}+(?:['’]\p{L}+)?/gu) || [];
const faltan = { es: new Set(), en: new Set() };
const suma = (l, t) => { for (const w of palabrasDe(t)) if (!g[l][w.replace('’', "'")]) faltan[l].add(w.replace('’', "'")); };
const anda = (o) => { if (!o || typeof o !== 'object') return; if (Array.isArray(o)) return o.forEach(anda);
  for (const [k, v] of Object.entries(o)) { const l = k === 'en' || k === 'we' ? 'en' : k === 'es' || k === 'ws' ? 'es' : null;
    if (l) (Array.isArray(v) ? v : [v]).forEach((x) => (typeof x === 'string' ? suma(l, x) : anda(x))); else anda(v); } };
anda(leer(archivo));
for (const l of ['es', 'en']) console.log(`${l}: faltan ${faltan[l].size}${faltan[l].size ? ' → ' + [...faltan[l]].sort().join(', ') : ''}`);
process.exit(faltan.es.size + faltan.en.size + malas ? 1 : 0);
