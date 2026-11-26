// Arma todo lo derivado: data/*.json, data/paquetes.json, recetas/*.html (SEO + JSON-LD Recipe),
// y la lista de archivos del nucleo dentro de sw.js (con version por contenido).
// Uso: node scripts/build.mjs
import { writeFileSync, readFileSync, readdirSync, statSync, mkdirSync, existsSync } from 'node:fs';
import { join, dirname, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash } from 'node:crypto';
import { historia } from './datos/historia.mjs';
import { recetas } from './datos/recetas.mjs';
import { consejos } from './datos/consejos.mjs';
import { cotorreos } from './datos/cotorreo.mjs';
import { rutaBiblia } from './datos/biblia.mjs';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
import { SITIO } from './sitio.mjs';
const j = (...p) => join(RAIZ, ...p);
const escribir = (ruta, obj) => { mkdirSync(dirname(ruta), { recursive: true }); writeFileSync(ruta, typeof obj === 'string' ? obj : JSON.stringify(obj)); };
const url = (ruta) => relative(RAIZ, ruta).split(sep).join('/');
function listar(dir, filtro = () => true) {
  const sal = [];
  for (const n of readdirSync(dir)) { const r = join(dir, n); statSync(r).isDirectory() ? sal.push(...listar(r, filtro)) : filtro(r) && sal.push(r); }
  return sal;
}

// ---- 1) datos
escribir(j('data', 'historia.json'), historia);
// Contenido que se escribe directo en JSON (scripts/datos/*.json): Historia 2, frases coloquiales, reglas y pláticas con Granma.
const fuente = (n) => JSON.parse(readFileSync(j('scripts', 'datos', `${n}.json`), 'utf8'));
const historia2 = fuente('historia2');
for (const n of ['historia2', 'coloquial', 'reglas', 'platicas']) escribir(j('data', `${n}.json`), n === 'historia2' ? historia2 : fuente(n));
escribir(j('data', 'recetas.json'), recetas);
escribir(j('data', 'consejos.json'), consejos);
escribir(j('data', 'cotorreo.json'), cotorreos);
escribir(j('data', 'biblia', 'ruta.json'), rutaBiblia);

// ---- 2) paginas estaticas de recetas (SEO + JSON-LD Recipe)
const iso = (min) => `PT${Math.floor(min / 60) ? Math.floor(min / 60) + 'H' : ''}${min % 60 ? (min % 60) + 'M' : ''}` || 'PT0M';
const ing = (i) => `${i.cant} ${i.un} ${i.es}`.replace('.', ',');
const ingEn = (i) => `${i.cant} ${i.un} ${i.en}`;
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
for (const r of recetas) {
  const total = r.tiempoPrep + r.tiempoCoccion;
  const ld = {
    '@context': 'https://schema.org', '@type': 'Recipe', name: r.nombre.es, description: r.resumen.es, inLanguage: 'es-MX',
    author: { '@type': 'Organization', name: 'Granma Sazón' }, recipeCuisine: 'Mexicana', recipeCategory: 'Receta tradicional',
    prepTime: iso(r.tiempoPrep), cookTime: iso(r.tiempoCoccion), totalTime: iso(total), recipeYield: `${r.porciones} porciones`,
    recipeIngredient: r.ingredientes.map(ing),
    recipeInstructions: r.pasos.map((p, k) => ({ '@type': 'HowToStep', position: k + 1, text: p.es })),
    image: [`${SITIO}assets/iconos/og-1200.png`], url: `${SITIO}recetas/${r.id}.html`,
  };
  const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(r.nombre.es)} — Granma Sazón</title>
<meta name="description" content="${esc(r.resumen.es)} Ingredientes con medidas exactas y pasos con cronómetro. Recipe in English too.">
<meta name="theme-color" content="#C8553D">
<link rel="canonical" href="${SITIO}recetas/${r.id}.html">
<link rel="icon" href="../assets/logo/icono.svg" type="image/svg+xml">
<link rel="manifest" href="../manifest.webmanifest">
<meta property="og:type" content="article"><meta property="og:title" content="${esc(r.nombre.es)} — Granma Sazón"><meta property="og:description" content="${esc(r.resumen.es)}">
<meta property="og:image" content="${SITIO}assets/iconos/og-1200.png"><meta property="og:url" content="${SITIO}recetas/${r.id}.html"><meta property="og:locale" content="es_MX"><meta property="og:locale:alternate" content="en_US">
<meta name="twitter:card" content="summary_large_image">
<script type="application/ld+json">${JSON.stringify(ld)}</script>
<style>body{font:18px/1.6 system-ui,sans-serif;margin:0;background:#FFF1DC;color:#4A2E1B}main{max-width:44rem;margin:0 auto;padding:1rem 16px 3rem}h1,h2{font-family:Georgia,serif;color:#8F3A27}a.b{display:inline-flex;min-height:44px;align-items:center;padding:0 1.2rem;background:#9C3F29;color:#fff;border-radius:999px;text-decoration:none;font-weight:700}li{margin:.3rem 0}</style>
</head>
<body><main>
<p><a href="../#/receta/${r.id}" class="b">Abrir en la app · Open in the app</a></p>
<h1>${esc(r.nombre.es)} <small lang="en">· ${esc(r.nombre.en)}</small></h1>
<p>${esc(r.resumen.es)}</p><p lang="en">${esc(r.resumen.en)}</p>
<p>${r.porciones} porciones · Preparación ${r.tiempoPrep} min · Cocción ${r.tiempoCoccion} min</p>
<h2>Ingredientes</h2><ul>${r.ingredientes.map((i) => `<li>${esc(ing(i))}</li>`).join('')}</ul>
<h2>Preparación</h2><ol>${r.pasos.map((p) => `<li>${esc(p.es)}${p.min ? ` <em>(${p.min} min)</em>` : ''}</li>`).join('')}</ol>
<section lang="en"><h2>Ingredients</h2><ul>${r.ingredientes.map((i) => `<li>${esc(ingEn(i))}</li>`).join('')}</ul>
<h2>Method</h2><ol>${r.pasos.map((p) => `<li>${esc(p.en)}${p.min ? ` <em>(${p.min} min)</em>` : ''}</li>`).join('')}</ol></section>
</main></body></html>
`;
  escribir(j('recetas', `${r.id}.html`), html);
}

// ---- grabaciones del Abuelo: assets/audio/abuelo/consejo-<id>.<es|en>.m4a y cap-<n>.<es|en>.m4a
const audios = { abuelo: { es: {}, en: {} } }, audioFiles = [];
const claveAudio = (t) => String(t).toLowerCase().replace(/\s+/g, ' ').trim();
if (existsSync(j('assets', 'audio', 'abuelo'))) for (const f of readdirSync(j('assets', 'audio', 'abuelo')).sort()) {
  const m = /^(consejo|cap)-(\d+)\.(es|en)\.m4a$/.exec(f); if (!m) continue;
  const de = m[1] === 'consejo' ? consejos.find((c) => c.id === +m[2]) : [...historia.capitulos, ...historia2.capitulos].find((c) => c.id === +m[2])?.consejo;
  if (!de) throw new Error(`Grabación sin consejo: ${f}`);
  audios.abuelo[m[3]][claveAudio(de[m[3]])] = `assets/audio/abuelo/${f}`; audioFiles.push(`assets/audio/abuelo/${f}`);
}
escribir(j('data', 'audios.json'), audios);

// ---- glosario al toque (cada palabra del contenido con su significado; fuente: scripts/datos/glosario/)
const glos = (l) => JSON.parse(readFileSync(j('scripts', 'datos', 'glosario', `${l}.json`), 'utf8'));
escribir(j('data', 'glosario.json'), { en: glos('en'), es: glos('es') });
// El glosario bíblico (formal) viaja con el paquete «Biblia»
// Tres capas, de menor a mayor confianza: lo deducido solo (nombres por versículo paralelo y formas de palabras ya glosadas),
// lo glosado a mano por lotes y el glosario base revisado. La de más confianza pisa a las otras.
const capas = (l) => Object.assign({}, ...[`biblia-${l}-auto`, `biblia-${l}-resto`, `biblia-${l}`].map((n) => (existsSync(j('scripts', 'datos', 'glosario', `${n}.json`)) ? glos(n) : {})));
escribir(j('data', 'biblia', 'glosario.json'), { en: capas('en'), es: capas('es') });

// ---- 4) paquetes descargables (con su peso real)
const peso = (rutas) => rutas.reduce((s, r) => s + statSync(j(r)).size, 0);
const bibliaFiles = [...listar(j('data', 'biblia'), (f) => f.endsWith('.json')).map(url)].sort();
const paquetes = [
  { id: 'historia', nombre: { es: 'Historia de Granma', en: 'Granma\'s story' }, icono: '📖', archivos: ['data/historia.json', 'data/historia2.json'] },
  { id: 'recetas', nombre: { es: 'Recetas mexicanas', en: 'Mexican recipes' }, icono: '🍲', archivos: ['data/recetas.json', ...recetas.map((r) => `recetas/${r.id}.html`)] },
  { id: 'cotorreo', nombre: { es: 'Cotorreo con Granma', en: 'Chat with Granma' }, icono: '😄', archivos: ['data/cotorreo.json'] },
  { id: 'consejos', nombre: { es: 'Consejos del Abuelo', en: 'Grandpa\'s advice' }, icono: '🎩', archivos: ['data/consejos.json', ...audioFiles] },
  { id: 'italianas', nombre: { es: 'Recetas italianas', en: 'Italian recipes' }, icono: '🍝', archivos: [], proximamente: true },
  { id: 'biblia', nombre: { es: 'Biblia (RV1909, KJV y WEB)', en: 'Bible (RV1909, KJV and WEB)' }, icono: '✝️', archivos: bibliaFiles },
  // Opcionales (no cuentan para la meta de 50 MB ni se bajan con «Descargar todo»): reconocimiento de voz dentro del teléfono
  { id: 'oido-en', opcional: true, nombre: { es: 'Oído de Granma: inglés', en: 'Granma\'s ear: English' }, icono: '👂', archivos: ['assets/oido/vosk.js', 'assets/oido/modelo-en.tar.gz', 'assets/oido/LICENCIAS.md', 'assets/oido/LICENSE-APACHE-2.0.txt'] },
  { id: 'oido-es', opcional: true, nombre: { es: 'Oído de Granma: español', en: 'Granma\'s ear: Spanish' }, icono: '👂', archivos: ['assets/oido/vosk.js', 'assets/oido/modelo-es.tar.gz', 'assets/oido/LICENCIAS.md', 'assets/oido/LICENSE-APACHE-2.0.txt'] },
].map((p) => ({ ...p, bytes: peso(p.archivos) }));
escribir(j('data', 'paquetes.json'), { fmt: 1, paquetes: paquetes.map((p) => p) });

// ---- robots.txt y sitemap.xml (con la dirección pública)
escribir(j('robots.txt'), `User-agent: *\nAllow: /\nDisallow: /demo-animaciones.html\nSitemap: ${SITIO}sitemap.xml\n`);
escribir(j('sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${[SITIO, ...recetas.map((r) => `${SITIO}recetas/${r.id}.html`)].map((u) => `  <url><loc>${u}</loc></url>`).join('\n')}\n</urlset>\n`);

// ---- 3) nucleo (cache de la app) + version por contenido
const nucleo = [
  'index.html', 'manifest.webmanifest', 'data/paquetes.json', 'data/audios.json', 'data/glosario.json', 'data/coloquial.json', 'data/reglas.json', 'data/platicas.json',
  'demo-animaciones.html', ...listar(j('css')).map(url), ...listar(j('js')).map(url), ...listar(j('assets', 'animaciones')).map(url),
  ...listar(j('assets', 'personajes'), (f) => /\/(granma-(contenta|hablando|carinosa|pensando|aplaudiendo)|abuelo-(serio|hablando|sonrisa|asintiendo|aconsejando))\.svg$/.test(f.split(sep).join('/'))).map(url),
  ...listar(j('assets', 'logo')).map(url),
  ...listar(j('assets', 'iconos'), (f) => !/og-1200/.test(f)).map(url),
].sort();
const hash = createHash('sha1');
for (const f of nucleo) hash.update(f).update(readFileSync(j(f)));
const VERSION = hash.digest('hex').slice(0, 10);
let sw = readFileSync(j('sw.js'), 'utf8');
sw = sw.replace(/\/\*NUCLEO:INICIO\*\/[\s\S]*?\/\*NUCLEO:FIN\*\//, `/*NUCLEO:INICIO*/\nconst VERSION = '${VERSION}';\nconst NUCLEO = ${JSON.stringify(nucleo, null, 1)};\n/*NUCLEO:FIN*/`);
writeFileSync(j('sw.js'), sw);

const total = paquetes.filter((p) => !p.opcional).reduce((s, p) => s + p.bytes, 0) + peso(nucleo);
console.log(`nucleo ${nucleo.length} archivos (${(peso(nucleo) / 1024).toFixed(0)} KB) v${VERSION}`);
for (const p of paquetes) console.log(`  ${p.id.padEnd(10)} ${(p.bytes / 1048576).toFixed(2)} MB  ${p.archivos.length} archivos`);
console.log(`TOTAL ${(total / 1048576).toFixed(2)} MB (meta < 50 MB)`);
