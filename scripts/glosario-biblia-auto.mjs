// Completa el glosario bíblico con lo que se puede deducir sin escribirlo a mano, y lista lo que falta.
//   node scripts/glosario-biblia-auto.mjs            → muestra cuánto cubre y escribe las listas de lo que falta (carpeta --salida)
//   node scripts/glosario-biblia-auto.mjs --escribir → además guarda lo deducido en scripts/datos/glosario/biblia-<idioma>-auto.json
//
// Lo deducido (siempre a partir de textos de dominio público del propio repo: RV1909, KJV y WEB):
//   1) Nombres propios: se emparejan versículo por versículo (el mismo versículo en español y en inglés) y solo se aceptan
//      cuando el nombre aparece junto al otro y además se escriben parecido (Jehoshaphat ↔ Josaphat).
//   2) Formas de una palabra que ya está glosada: posesivos y formas antiguas del inglés (walketh), plurales, y verbos
//      españoles con pronombre pegado (díjole = dijo + le). La glosa dice de qué palabra viene; no inventa significados.
// Lo que no se puede deducir con seguridad NO se adivina: queda en las listas para glosarlo aparte.
import { readFileSync, readdirSync, writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..'), B = join(RAIZ, 'data', 'biblia'), G = join(RAIZ, 'scripts', 'datos', 'glosario');
const arg = (n, d) => { const i = process.argv.indexOf(`--${n}`); return i < 0 ? d : process.argv[i + 1]; };
const SALIDA = arg('salida', null), ESCRIBIR = process.argv.includes('--escribir');
const leerJ = (f) => JSON.parse(readFileSync(f, 'utf8'));
const tok = (t) => String(t).match(/\p{L}+(?:['’]\p{L}+)?/gu) || [];
const min = (w) => w.toLowerCase().replace('’', "'");
const VERS = [['rv1909', 'es'], ['kjv', 'en'], ['web', 'en']];

// ---------- 1) estadísticas de cada forma ----------
const libros = readdirSync(join(B, 'kjv')).map((f) => f.replace('.json', '')), texto = {};
for (const [v] of VERS) texto[v] = Object.fromEntries(libros.map((l) => [l, leerJ(join(B, v, `${l}.json`)).c]));
const st = { es: new Map(), en: new Map() };            // forma → { n, may, min, visto: { 'Forma': veces } }
for (const [v, l] of VERS) for (const lib of libros) for (const cap of texto[v][lib]) for (const t of cap) tok(t).forEach((w0, i) => {
  const w = min(w0); let e = st[l].get(w); if (!e) st[l].set(w, e = { n: 0, may: 0, min: 0, visto: {} });
  e.n++; if (w0[0] !== w0[0].toLowerCase()) { if (i > 0) { e.may++; e.visto[w0] = (e.visto[w0] || 0) + 1; } } else e.min++;
});
const esNombre = (l, w) => { const e = st[l].get(w); return !!e && e.min === 0 && e.may > 0; };
const comoSeEscribe = (l, w) => { const e = st[l].get(w), v = Object.entries(e?.visto || {}).sort((a, b) => b[1] - a[1])[0]; return v ? v[0].replace('’', "'") : w[0].toUpperCase() + w.slice(1); };

const base = { en: { ...leerJ(join(G, 'biblia-en.json')) }, es: { ...leerJ(join(G, 'biblia-es.json')) } };
for (const l of ['en', 'es']) for (const extra of [`biblia-${l}-resto.json`]) if (existsSync(join(G, extra))) Object.assign(base[l], leerJ(join(G, extra)));   // lo glosado a mano después
const auto = { en: {}, es: {} };
const tiene = (l, w) => base[l][w] || auto[l][w];

// ---------- 2) nombres propios por versículo paralelo ----------
const sinAcento = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '');
const sonido = (w) => sinAcento(w.toLowerCase()).replace(/[^a-zñ]/g, '').replace(/ph/g, 'f').replace(/th/g, 't').replace(/sh/g, 's').replace(/ch/g, 'c').replace(/k/g, 'c').replace(/q/g, 'c').replace(/z/g, 's').replace(/j/g, 'i').replace(/y/g, 'i')
  .replace(/h/g, '').replace(/(.)\1/g, '$1').replace(/^ie/, 'ie');
function distancia(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}
const parecido = (a, b) => { const x = sonido(a), y = sonido(b); return x && y ? 1 - distancia(x, y) / Math.max(x.length, y.length) : 0; };

const junto = { en: new Map(), es: new Map() }, veces = { en: new Map(), es: new Map() };
const suma = (m, a, b) => { let x = m.get(a); if (!x) m.set(a, x = new Map()); x.set(b, (x.get(b) || 0) + 1); };
for (const vEn of ['kjv', 'web']) for (const lib of libros) texto[vEn][lib].forEach((cap, c) => {
  const capEs = texto.rv1909[lib][c]; if (!capEs || capEs.length !== cap.length) return;            // capítulos con otra numeración: no se usan
  cap.forEach((t, i) => {
    const E = new Set(tok(t).map(min).filter((w) => esNombre('en', w))), S = new Set(tok(capEs[i]).map(min).filter((w) => esNombre('es', w)));
    for (const e of E) { veces.en.set(e, (veces.en.get(e) || 0) + 1); for (const s of S) suma(junto.en, e, s); }
    if (vEn === 'kjv') for (const s of S) { veces.es.set(s, (veces.es.get(s) || 0) + 1); for (const e of E) suma(junto.es, s, e); }
  });
});
function pareja(l, w) {            // → forma en el otro idioma, o null si no hay certeza
  const cand = [...(junto[l].get(w) || [])].map(([o, n]) => ({ o, juntos: n / veces[l].get(w), p: parecido(w, o) })).filter((x) => x.juntos >= 0.5 && x.p >= 0.5).sort((a, b) => b.p * b.juntos - a.p * a.juntos);
  if (!cand.length) return null;
  const [a, b] = cand, pocas = veces[l].get(w) <= 2;
  if (pocas && a.p < 0.62) return null;                                   // con una o dos apariciones se exige más parecido
  if (b && a.p * a.juntos - b.p * b.juntos < 0.12) return null;           // dos candidatos casi iguales: no se adivina
  return a.o;
}
const otro = { en: 'es', es: 'en' }, ETIQ = { en: 'nombre propio', es: 'proper name' };
const plural = (w) => /(ans|ians|ites|eos|itas|ios|anos|enos)$/.test(sinAcento(w));
for (const l of ['en', 'es']) for (const [w] of st[l]) if (!tiene(l, w) && esNombre(l, w) && !/'s$|s'$/.test(w)) {
  const o = pareja(l, w); if (!o || plural(w) !== plural(o)) continue;          // «Libyans» no es «Libia»: un pueblo en plural solo se empareja con otro plural
  auto[l][w] = `${comoSeEscribe(otro[l], o)} (${ETIQ[l]})`;
}
const nNombres = { en: Object.keys(auto.en).length, es: Object.keys(auto.es).length };

// ---------- 3) formas de palabras ya glosadas ----------
const primera = (g) => { const p = g.split(';')[0].trim(); return (p.match(/\(/g) || []).length === (p.match(/\)/g) || []).length ? p : g; };   // primera acepción (sin partir un paréntesis)
const corta = (s) => (s.length <= 60 ? s : s.slice(0, 59).replace(/\s+\S*$/, '') + '…');
const PRON = { me: 'me', te: 'you', se: 'himself/itself', le: 'to him/her', les: 'to them', lo: 'him/it', la: 'her/it', los: 'them', las: 'them', nos: 'us', os: 'you (plural)' };
// Solo se deduce cuando no hay duda de qué clase de palabra es la base. Un verbo glosado en infinitivo («negar») permite
// explicar sus formas (denieth, denied, denying); un sustantivo permite su plural y su posesivo. Lo demás no se adivina.
const esVerboEs = (g) => /^(no )?\p{L}+(ar|er|ir|arse|erse|irse)\b/u.test(primera(g));
const esVerboEn = (g) => /^to \p{L}|^\((i|he|she|he\/she|they|you|we|it)[^)]*\)|\(command|\bing\b|^\p{L}+ing\b/iu.test(primera(g));
function derivarEn(w) {
  const g = (b) => (b && b !== w && b.length > 2 && tiene('en', b)) || null, raices = (r) => [...new Set([r, r + 'e', r.replace(/(.)\1$/, '$1'), r.replace(/i$/, 'y')])];
  let m;
  if ((m = /^(.+?)(?:'s|s')$/.exec(w)) && g(m[1])) return /nombre propio|\((nombre|ciudad|lugar|rey|profeta|tribu|pueblo|región|río|monte)/.test(g(m[1])) ? `de ${primera(g(m[1])).replace(/\s*\([^)]*\)$/, '')} (posesivo)` : `de: ${primera(g(m[1]))} (posesivo de «${m[1]}»)`;
  for (const [re, nota] of [[/^(.+)edst$/, 'forma antigua (pasado) de'], [/^(.+)eth$/, 'forma antigua de'], [/^(.+)est$/, 'forma antigua de'], [/^(.+)ing$/, 'forma en -ing de'], [/^(.+)ed$/, 'pasado de']])
    if ((m = re.exec(w))) for (const b of raices(m[1])) if (g(b) && !esNombre('en', b) && esVerboEs(g(b))) return `${nota} «${b}»: ${primera(g(b))}`;
  if ((m = /^(.+?)(?:ies|es|s)$/.exec(w))) for (const b of [m[1], w.endsWith('ies') ? m[1] + 'y' : null, m[1] + 'e']) if (g(b) && !esNombre('en', b) && !/s$/.test(b)) return `${esVerboEs(g(b)) ? 'forma de' : 'plural de'} «${b}»: ${primera(g(b))}`;
  return null;
}
function derivarEs(w) {
  const g = (b) => (b && b !== w && b.length > 2 && tiene('es', b)) || null;
  let m;
  // verbo con pronombre pegado: díjole = dijo + le; sacóle = sacó + le. Solo sobre una base que ya está glosada como verbo.
  if ((m = /^(.{3,}?)(?:(me|te|se|nos|os)(lo|la|los|las|le|les)|(me|te|se|le|les|lo|la|los|las|nos|os))$/.exec(w))) {
    const raiz = m[1], prons = [m[2], m[3], m[4]].filter(Boolean);
    // si el acento va en la última vocal (sacó, llevó, alabaré) es parte del verbo; si va antes (díjo, hízo, viéndo) lo puso el pronombre
    const bases = /[áéíóú]$/.test(raiz) ? [raiz] : /[áéíóú]/.test(raiz) ? [sinAcento(raiz)] : /(r|d|ndo)$/.test(raiz) ? [raiz] : [];
    for (const b of bases) if (g(b) && !esNombre('es', b) && esVerboEn(g(b))) return `${primera(g(b))} + «${prons.join('')}» (${prons.map((p) => PRON[p]).join(', ')})`;
  }
  if ((m = /^(.+?)(es|s)$/.exec(w)) && g(m[1]) && !esNombre('es', m[1]) && !esVerboEn(g(m[1])) && !/[áéíóú]$/.test(m[1])) return `plural of «${m[1]}»: ${primera(g(m[1]))}`;
  return null;
}
for (const [l, f] of [['en', derivarEn], ['es', derivarEs]]) for (const [w] of [...st[l]].sort((a, b) => a[0].length - b[0].length)) if (!tiene(l, w)) { const d = f(w); if (d) auto[l][w] = corta(d); }

// ---------- 4) resultado ----------
for (const l of ['en', 'es']) {
  const formas = st[l].size, total = [...st[l].values()].reduce((s, e) => s + e.n, 0), falta = [...st[l]].filter(([w]) => !tiene(l, w)).sort((a, b) => b[1].n - a[1].n);
  const cub = (m) => ([...st[l]].filter(([w]) => m(w)).reduce((s, [, e]) => s + e.n, 0) / total * 100).toFixed(1);
  console.log(`${l}: ${formas} formas · a mano ${Object.keys(base[l]).filter((w) => st[l].has(w)).length} · deducidas ${Object.keys(auto[l]).length} (nombres ${nNombres[l]}, formas ${Object.keys(auto[l]).length - nNombres[l]}) · faltan ${falta.length} | palabras del texto cubiertas: ${cub((w) => tiene(l, w))}%`);
  if (SALIDA) { mkdirSync(SALIDA, { recursive: true }); writeFileSync(join(SALIDA, `falta-${l}.txt`), falta.map(([w]) => w).join('\n')); writeFileSync(join(SALIDA, `auto-${l}.json`), JSON.stringify(auto[l], null, 0)); }
  if (ESCRIBIR) writeFileSync(join(G, `biblia-${l}-auto.json`), JSON.stringify(Object.fromEntries(Object.keys(auto[l]).sort().map((k) => [k, auto[l][k]]))).replace(/","/g, '",\n"') + '\n');
}
