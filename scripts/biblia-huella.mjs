// Huella del texto bíblico: sirve para comprobar que ni una letra de RV1909, KJV y WEB cambió desde que se bajaron
// de sus fuentes de dominio público. `npm test` la compara; solo se vuelve a escribir al regenerar la Biblia:
//   node scripts/biblia-huella.mjs --escribir
import { createHash } from 'node:crypto';
import { readFileSync, readdirSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
export const VERSIONES_PD = ['rv1909', 'kjv', 'web'];
export function huellas() {
  const sal = {};
  for (const v of VERSIONES_PD) {
    const h = createHash('sha256'); let versos = 0;
    for (const f of readdirSync(join(RAIZ, 'data', 'biblia', v)).sort()) { const t = readFileSync(join(RAIZ, 'data', 'biblia', v, f)); h.update(f).update(t); versos += JSON.parse(t).c.reduce((s, c) => s + c.length, 0); }
    sal[v] = { sha256: h.digest('hex'), versiculos: versos };
  }
  return sal;
}
if (process.argv.includes('--escribir')) { writeFileSync(join(RAIZ, 'scripts', 'datos', 'biblia-huella.json'), JSON.stringify(huellas(), null, 1) + '\n'); console.log('scripts/datos/biblia-huella.json actualizado'); }
else if (process.argv[1]?.endsWith('biblia-huella.mjs')) console.log(JSON.stringify(huellas(), null, 1));
