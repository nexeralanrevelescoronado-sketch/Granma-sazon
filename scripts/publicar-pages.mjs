// Arma dist/ para Cloudflare Pages: la app tal cual, SIN los modelos del Oído (pesan más de 25 MiB, el tope de Pages por archivo).
// Los modelos viven en R2 y los entrega functions/assets/oido/[archivo].js en la MISMA dirección de siempre
// (/assets/oido/modelo-xx.tar.gz), así el service worker y la descarga por pedazos funcionan igual.
// Uso (comando de build en Cloudflare Pages): node scripts/publicar-pages.mjs
import { cpSync, rmSync, mkdirSync, writeFileSync, statSync, readdirSync, existsSync } from 'node:fs';
import { join, dirname, relative, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..'), DIST = join(RAIZ, 'dist');
const MAX = 25 * 1024 * 1024, MAX_ARCHIVOS = 20000;
// Solo lo que la app sirve al público (nada de scripts, pruebas, mapas ni instrucciones internas)
const INCLUIR = ['index.html', 'manifest.webmanifest', 'sw.js', 'robots.txt', 'sitemap.xml', 'demo-animaciones.html',
  'css', 'js', 'assets', 'data', 'recetas', 'docs/GUION-ABUELO.pdf'];
export const MODELOS = ['assets/oido/modelo-en.tar.gz', 'assets/oido/modelo-es.tar.gz'];   // van en R2

rmSync(DIST, { recursive: true, force: true }); mkdirSync(DIST, { recursive: true });
const fuera = new Set(MODELOS.map((m) => join(RAIZ, m)));
for (const p of INCLUIR) {
  const desde = join(RAIZ, p); if (!existsSync(desde)) continue;
  cpSync(desde, join(DIST, p), { recursive: true, filter: (f) => !fuera.has(f) });
}
// Las funciones solo corren en la ruta de los modelos: todo lo demás es estático (gratis e ilimitado en Pages)
writeFileSync(join(DIST, '_routes.json'), JSON.stringify({ version: 1, include: MODELOS.map((m) => '/' + m), exclude: [] }, null, 1));
// El service worker y la página siempre se revisan contra el servidor (si no, una versión vieja podría quedarse pegada)
writeFileSync(join(DIST, '_headers'), ['/sw.js', '  Cache-Control: no-cache', '/', '  Cache-Control: no-cache', '/index.html', '  Cache-Control: no-cache', ''].join('\n'));

const lista = []; const andar = (d) => { for (const n of readdirSync(d)) { const r = join(d, n); statSync(r).isDirectory() ? andar(r) : lista.push(r); } }; andar(DIST);
const grandes = lista.filter((f) => statSync(f).size > MAX).map((f) => relative(DIST, f).split(sep).join('/'));
const total = lista.reduce((s, f) => s + statSync(f).size, 0);
console.log(`dist/: ${lista.length} archivos · ${(total / 1048576).toFixed(1)} MB · modelos del Oído fuera (van en R2)`);
if (grandes.length) { console.error('Archivos de más de 25 MiB (Pages no los acepta):', grandes.join(', ')); process.exit(1); }
if (lista.length > MAX_ARCHIVOS) { console.error(`Más de ${MAX_ARCHIVOS} archivos: Pages gratis no los acepta`); process.exit(1); }
