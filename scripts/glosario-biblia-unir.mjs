// Une los lotes glosados a mano («palabra<TAB>glosa» por línea) en scripts/datos/glosario/biblia-<idioma>-resto.json.
// Uso: node scripts/glosario-biblia-unir.mjs <carpeta con en-*.tsv y es-*.tsv>
// Solo acepta palabras que de verdad aparecen en el texto bíblico y glosas de hasta 60 caracteres; lo demás lo reporta.
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..'), G = join(RAIZ, 'scripts', 'datos', 'glosario'), B = join(RAIZ, 'data', 'biblia'), dir = process.argv[2];
const tok = (t) => String(t).match(/\p{L}+(?:['’]\p{L}+)?/gu) || [], formas = { es: new Set(), en: new Set() };
for (const [v, l] of [['rv1909', 'es'], ['kjv', 'en'], ['web', 'en']]) for (const f of readdirSync(join(B, v))) for (const c of JSON.parse(readFileSync(join(B, v, f), 'utf8')).c) for (const t of c) for (const w of tok(t)) formas[l].add(w.toLowerCase().replace('’', "'"));
const INFORMAL = /broma|chiste|joke|\bpun\b|jaja|\blol\b/i;
for (const l of ['en', 'es']) {
  const sal = {}, raras = [];
  for (const f of readdirSync(dir).filter((x) => x.startsWith(`${l}-`) && x.endsWith('.tsv')).sort()) for (const ln of readFileSync(join(dir, f), 'utf8').split('\n')) {
    const t = ln.indexOf('\t'); if (t < 0) continue; const k = ln.slice(0, t).trim(), v = ln.slice(t + 1).trim().replace(/\.$/, '');
    if (!formas[l].has(k) || !v || v.length > 60 || INFORMAL.test(v)) { raras.push(`${f}: ${ln.slice(0, 70)}`); continue; }
    sal[k] = v;
  }
  writeFileSync(join(G, `biblia-${l}-resto.json`), JSON.stringify(Object.fromEntries(Object.keys(sal).sort().map((k) => [k, sal[k]]))).replace(/","/g, '",\n"') + '\n');
  console.log(`${l}: ${Object.keys(sal).length} glosas unidas · ${raras.length} líneas descartadas`); raras.slice(0, 12).forEach((r) => console.log('   ' + r));
}
