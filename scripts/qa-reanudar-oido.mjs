import { createRequire } from 'node:module'; const { chromium } = createRequire('/opt/node-tools/x.js')('playwright');
import { createServer } from 'node:http'; import { readFileSync, existsSync, statSync } from 'node:fs'; import { join, extname } from 'node:path';
const R = '/home/user/granma-sazon'; const T = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.gz': 'application/gzip', '.webmanifest': 'application/manifest+json' };
const srv = createServer((q, s) => { let p = new URL(q.url, 'http://x').pathname; if (p.endsWith('/')) p += 'index.html'; const f = join(R, p); if (!existsSync(f) || statSync(f).isDirectory()) { s.writeHead(404); return s.end(); }
  const buf = readFileSync(f), tipo = T[extname(f)] || 'application/octet-stream', rango = q.headers.range;
  if (rango) { const m = /bytes=(\d+)-(\d*)/.exec(rango); const ini = +m[1], fin = Math.min(buf.length - 1, m[2] ? +m[2] : buf.length - 1); s.writeHead(206, { 'Content-Type': tipo, 'Content-Range': `bytes ${ini}-${fin}/${buf.length}`, 'Content-Length': fin - ini + 1, 'Accept-Ranges': 'bytes' }); return s.end(buf.subarray(ini, fin + 1)); }
  s.writeHead(200, { 'Content-Type': tipo, 'Content-Length': buf.length, 'Accept-Ranges': 'bytes' }); s.end(buf); }).listen(0);
const B = `http://localhost:${srv.address().port}/`;
const b = await chromium.launch(); const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const pg = await ctx.newPage();
const errs = []; pg.on('pageerror', (e) => errs.push(e.message)); pg.on('console', (m) => { if (m.type() === 'error') errs.push('consola: ' + m.text().slice(0, 150)); });
// cada archivo del Oído tarda un poco, como en un teléfono con red lenta
await ctx.route('**/assets/oido/**', async (r) => { await new Promise((k) => setTimeout(k, r.request().url().includes('modelo') ? 2500 : 1500)); await r.continue(); });
await pg.goto(B); await pg.evaluate(() => localStorage.setItem('granma:v1', JSON.stringify({ v: 1, perfil: { aprende: 'en', interes: 'trabajo', cocina: 'mexicana', nombre: 'Ana', listo: true, legal: '2026-11-28' }, xp: 0, racha: { n: 0, ultimo: null }, caps: {}, recetas: {}, consejos: {}, cotorreos: {}, biblia: {}, insignias: {}, misiones: { fecha: '', prog: {}, cobradas: {} }, stats: { retoMejor: 0, retos: 0 }, ajustes: { sonido: false, voz: false, vozV: 2 }, constancia: { fecha: null } }))); await pg.reload(); await pg.waitForFunction(() => navigator.serviceWorker?.controller, null, { timeout: 20000 }).catch(() => {});
await pg.goto(B + '#/descargas'); await pg.waitForTimeout(3000); if (!(await pg.locator('[data-bajar="oido-en"]').count())) { console.log('SIN BOTÓN. Texto:', (await pg.locator('main').innerText()).slice(0, 400)); console.log('errores', errs.slice(0,5)); await b.close(); srv.close(); process.exit(1); }
await pg.click('[data-bajar="oido-en"]');
await pg.waitForFunction(() => /\d+%|scaleX\(0\.[1-9]/.test(document.querySelector('#pq-oido-en').innerHTML), null, { timeout: 15000 }).catch(() => {});
await new Promise((k) => setTimeout(k, 2500));
console.log('antes del corte:', (await pg.locator('#pq-oido-en [data-estado]').innerText()));
await ctx.setOffline(true); await new Promise((k) => setTimeout(k, 4000));
console.log('con corte:', (await pg.locator('#pq-oido-en [data-estado]').innerText()));
await pg.reload({ waitUntil: 'domcontentloaded' }).catch((e) => console.log('recarga:', e.message.slice(0, 120)));
await new Promise((k) => setTimeout(k, 2500));
console.log('tras recargar (sin internet):', (await pg.locator('#pq-oido-en').innerText().catch(() => '(sin sección)')).replace(/\n/g, ' | ').slice(0, 220));
await ctx.setOffline(false); await new Promise((k) => setTimeout(k, 1500));
const boton = pg.locator('#pq-oido-en button').first(); console.log('botón:', await boton.innerText().catch(() => '(ninguno)'));
await boton.click().catch((e) => console.log('clic:', e.message.slice(0, 120)));
await pg.waitForFunction(() => /Descargado|Se cortó|Descargando/.test(document.querySelector('#pq-oido-en')?.innerText || ''), null, { timeout: 20000 }).catch(() => {});
await pg.waitForFunction(() => /Descargado/.test(document.querySelector('#pq-oido-en')?.innerText || ''), null, { timeout: 120000 }).catch(() => {});
console.log('final:', (await pg.locator('#pq-oido-en').innerText().catch(() => '(sin sección)')).replace(/\n/g, ' | ').slice(0, 260));
const nombres = await pg.evaluate(async () => { const out = []; for (const n of await caches.keys()) { if (!n.includes('oido')) continue; const c = await caches.open(n); out.push(n + ': ' + (await c.keys()).map((r) => r.url.split('/').pop()).join(', ')); } return out; });
console.log(nombres.join('\n') || 'sin caché del oído');
console.log('errores:', errs.slice(0, 6)); await b.close(); srv.close();
