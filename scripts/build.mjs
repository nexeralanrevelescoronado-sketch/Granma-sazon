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
    image: ['../assets/iconos/og-1200.png'],
  };
  const html = `<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${esc(r.nombre.es)} — Granma Sazón</title>
<meta name="description" content="${esc(r.resumen.es)} Ingredientes con medidas exactas y pasos con cronómetro. Recipe in English too.">
<meta name="theme-color" content="#C8553D">
<link rel="icon" href="../assets/logo/icono.svg" type="image/svg+xml">
<link rel="manifest" href="../manifest.webmanifest">
<meta property="og:type" content="article"><meta property="og:title" content="${esc(r.nombre.es)} — Granma Sazón"><meta property="og:description" content="${esc(r.resumen.es)}">
<meta property="og:image" content="../assets/iconos/og-1200.png"><meta property="og:locale" content="es_MX"><meta property="og:locale:alternate" content="en_US">
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

// ---- 4) paquetes descargables (con su peso real)
const peso = (rutas) => rutas.reduce((s, r) => s + statSync(j(r)).size, 0);
const bibliaFiles = [...listar(j('data', 'biblia'), (f) => f.endsWith('.json')).map(url)].sort();
const paquetes = [
  { id: 'historia', nombre: { es: 'Historia de Granma', en: 'Granma\'s story' }, icono: '📖', archivos: ['data/historia.json'] },
  { id: 'recetas', nombre: { es: 'Recetas mexicanas', en: 'Mexican recipes' }, icono: '🍲', archivos: ['data/recetas.json', ...recetas.map((r) => `recetas/${r.id}.html`)] },
  { id: 'cotorreo', nombre: { es: 'Cotorreo con Granma', en: 'Chat with Granma' }, icono: '😄', archivos: ['data/cotorreo.json'] },
  { id: 'consejos', nombre: { es: 'Consejos del Abuelo', en: 'Grandpa\'s advice' }, icono: '🎩', archivos: ['data/consejos.json'] },
  { id: 'italianas', nombre: { es: 'Recetas italianas', en: 'Italian recipes' }, icono: '🍝', archivos: [], proximamente: true },
  { id: 'biblia', nombre: { es: 'Biblia (RV1909, KJV y WEB)', en: 'Bible (RV1909, KJV and WEB)' }, icono: '✝️', archivos: bibliaFiles },
].map((p) => ({ ...p, bytes: peso(p.archivos) }));
escribir(j('data', 'paquetes.json'), { fmt: 1, paquetes: paquetes.map((p) => p) });

// ---- 3) nucleo (cache de la app) + version por contenido
const nucleo = [
  'index.html', 'manifest.webmanifest', 'data/paquetes.json',
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

const total = paquetes.reduce((s, p) => s + p.bytes, 0) + peso(nucleo);
console.log(`nucleo ${nucleo.length} archivos (${(peso(nucleo) / 1024).toFixed(0)} KB) v${VERSION}`);
for (const p of paquetes) console.log(`  ${p.id.padEnd(10)} ${(p.bytes / 1048576).toFixed(2)} MB  ${p.archivos.length} archivos`);
console.log(`TOTAL ${(total / 1048576).toFixed(2)} MB (meta < 50 MB)`);
