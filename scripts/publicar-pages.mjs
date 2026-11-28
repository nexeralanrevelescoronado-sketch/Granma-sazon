// Arma dist/ para Cloudflare Pages. Los modelos del Oído pesan más de 25 MiB (el tope de Pages por archivo), así que se
// parten en pedazos de 4 MiB (assets/oido/partes/) y functions/assets/oido/[archivo].js los entrega juntos en la MISMA
// dirección de siempre (/assets/oido/modelo-xx.tar.gz), respetando Range. Los pedazos miden lo mismo que los que pide la
// app al descargar (descargas.js, PIEZA = 4 MiB), así cada petición de la app es un pedazo entero: sin recortes.
// Uso (comando de build en Cloudflare Pages): node scripts/publicar-pages.mjs
import { cpSync, rmSync, mkdirSync, writeFileSync, statSync, readdirSync, existsSync, readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, dirname, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..'), DIST = join(RAIZ, 'dist');
const MAX = 25 * 1024 * 1024, MAX_ARCHIVOS = 20000;
// Solo lo que la app sirve al público (nada de scripts, pruebas, mapas ni instrucciones internas)
const INCLUIR = ['index.html', 'cuenta.html', 'manifest.webmanifest', 'sw.js', 'robots.txt', 'sitemap.xml', 'demo-animaciones.html',
  'css', 'js', 'assets', 'data', 'recetas', 'docs/GUION-ABUELO.pdf'];
export const MODELOS = ['assets/oido/modelo-en.tar.gz', 'assets/oido/modelo-es.tar.gz'];   // van partidos
export const PEDAZO = 4 * 1024 * 1024;

rmSync(DIST, { recursive: true, force: true }); mkdirSync(DIST, { recursive: true });
const fuera = new Set(MODELOS.map((m) => join(RAIZ, m)));
for (const p of INCLUIR) {
  const desde = join(RAIZ, p); if (!existsSync(desde)) continue;
  cpSync(desde, join(DIST, p), { recursive: true, filter: (f) => !fuera.has(f) });
}
// Partir los modelos: assets/oido/partes/<nombre>.<n> + <nombre>.json (tamaño, número de pedazos y huella)
mkdirSync(join(DIST, 'assets/oido/partes'), { recursive: true });
for (const m of MODELOS) {
  const datos = readFileSync(join(RAIZ, m)), nombre = m.split('/').pop(), n = Math.ceil(datos.length / PEDAZO);
  for (let i = 0; i < n; i++) writeFileSync(join(DIST, 'assets/oido/partes', `${nombre}.${i}`), datos.subarray(i * PEDAZO, (i + 1) * PEDAZO));
  writeFileSync(join(DIST, 'assets/oido/partes', `${nombre}.json`), JSON.stringify({ tam: datos.length, pedazo: PEDAZO, n, huella: createHash('sha256').update(datos).digest('hex').slice(0, 32) }));
}
// Las funciones solo corren en la ruta de los modelos: todo lo demás es estático (gratis e ilimitado en Pages)
writeFileSync(join(DIST, '_routes.json'), JSON.stringify({ version: 1, include: [...MODELOS.map((m) => '/' + m), '/api/avisos/*', '/api/cuenta', '/api/cuenta/*', '/api/loteria/*'], exclude: [] }, null, 1));
// El service worker y la página siempre se revisan contra el servidor (si no, una versión vieja podría quedarse pegada)
writeFileSync(join(DIST, '_headers'), ['/sw.js', '  Cache-Control: no-cache', '/', '  Cache-Control: no-cache', '/index.html', '  Cache-Control: no-cache', ''].join('\n'));

const lista = []; const andar = (d) => { for (const n of readdirSync(d)) { const r = join(d, n); statSync(r).isDirectory() ? andar(r) : lista.push(r); } }; andar(DIST);
const grandes = lista.filter((f) => statSync(f).size > MAX).map((f) => relative(DIST, f).split(sep).join('/'));
const total = lista.reduce((s, f) => s + statSync(f).size, 0);
console.log(`dist/: ${lista.length} archivos · ${(total / 1048576).toFixed(1)} MB · modelos del Oído partidos en pedazos de 4 MiB`);
if (grandes.length) { console.error('Archivos de más de 25 MiB (Pages no los acepta):', grandes.join(', ')); process.exit(1); }
if (lista.length > MAX_ARCHIVOS) { console.error(`Más de ${MAX_ARCHIVOS} archivos: Pages gratis no los acepta`); process.exit(1); }
