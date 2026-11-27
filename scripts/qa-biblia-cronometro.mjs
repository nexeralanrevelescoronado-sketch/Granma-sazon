// QA en navegador real: búsqueda en toda la Biblia y cronómetros que avisan fuera de la receta.
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync } from 'node:fs';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
let chromium; try { ({ chromium } = await import('playwright')); } catch { ({ chromium } = createRequire('/opt/node-tools/x.js')('playwright')); }
const TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
const srv = createServer((req, res) => { let p = new URL(req.url, 'http://x').pathname; if (p.endsWith('/')) p += 'index.html'; const f = join(RAIZ, p);
  if (!existsSync(f) || statSync(f).isDirectory()) { res.writeHead(404); return res.end(); } res.writeHead(200, { 'Content-Type': TIPOS[extname(f)] || 'application/octet-stream' }); res.end(readFileSync(f)); }).listen(0);
const B = `http://localhost:${srv.address().port}/`;
const fallas = []; const ok = (c, m) => { console.log((c ? '  ✔ ' : '  ✘ ') + m); if (!c) fallas.push(m); };
const browser = await chromium.launch(); const errores = [];
const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } }); const pg = await ctx.newPage();
// el navegador sin pantalla no concede notificaciones: se simula el permiso concedido
await ctx.addInitScript(() => { try { Object.defineProperty(Notification, 'permission', { get: () => 'granted', configurable: true }); } catch { /* sin Notification */ } }); pg.on('pageerror', (e) => errores.push(e.message));
await pg.goto(B);
await pg.evaluate(() => localStorage.setItem('granma:v1', JSON.stringify({ v: 1, perfil: { aprende: 'en', interes: 'biblia', cocina: 'mexicana', nombre: 'Ana', listo: true, legal: '2026-11-27' }, xp: 0, racha: { n: 0, ultimo: null }, caps: {}, recetas: {}, consejos: {}, cotorreos: {}, biblia: {}, insignias: {}, misiones: { fecha: '', prog: {}, cobradas: {} }, stats: { retoMejor: 0, retos: 0 }, ajustes: { sonido: false, voz: false }, constancia: { fecha: null } })));
await pg.reload();

console.log('1) Búsqueda en la Biblia');
await pg.goto(B + '#/biblia'); await pg.waitForSelector('.verso-fila');
await pg.fill('#q', 'pastor'); await pg.click('#buscar button'); await pg.waitForFunction(() => !/Buscando/.test(document.querySelector('#resultados').textContent));
ok(/Sin resultados en Juan \(KJV\)/.test(await pg.locator('#resultados').innerText()), 'si la palabra no está en esa versión, lo dice y explica en qué versión buscó');
await pg.fill('#q', 'shepherd'); await pg.click('#buscar button'); await pg.waitForFunction(() => !/Buscando/.test(document.querySelector('#resultados').textContent));
const enLibro = await pg.locator('#resultados').innerText();
ok(/en Juan \(KJV\)/.test(enLibro), 'por defecto busca en el libro abierto y dice la versión: Juan (KJV)');
await pg.check('#todo'); await pg.click('#buscar button');
await pg.waitForFunction(() => /toda la Biblia/.test(document.querySelector('#resultados h2')?.textContent || ''), null, { timeout: 60000 });
const todo = await pg.locator('#resultados').innerText(); const n = await pg.locator('#resultados [data-ir]').count();
ok(/toda la Biblia \(KJV\)/.test(todo) && n > 10, `con la casilla busca en los 66 libros (${n} resultados)`);
const librosDistintos = new Set(await pg.locator('#resultados [data-ir]').evaluateAll((b) => b.map((x) => x.dataset.ir.split('|')[0]))); ok(librosDistintos.size >= 3, `los resultados vienen de varios libros (${[...librosDistintos].slice(0, 6).join(', ')}…)`);
await pg.locator('#resultados [data-ir]').first().click(); await pg.waitForSelector('.verso-fila');
ok(!/Juan 3/.test(await pg.locator('#titulo-pasaje').innerText()), `al tocar un resultado abre ese pasaje (${await pg.locator('#titulo-pasaje').innerText()})`);
await pg.reload(); await pg.goto(B + '#/biblia'); await pg.waitForSelector('#todo'); ok(await pg.isChecked('#todo'), 'la casilla se recuerda');

console.log('2) Cronómetro que avisa fuera de la receta');
await pg.goto(B + '#/receta/champurrado'); await pg.waitForSelector('[data-play="0"]');
ok(/siguen corriendo aunque cambies de sección/.test(await pg.locator('main').innerText()), 'la receta explica que el cronómetro sigue corriendo');
await pg.click('[data-play="0"]'); await pg.waitForTimeout(300);
ok(await pg.evaluate(() => Notification.permission === 'granted'), 'permiso de notificación concedido');
// acortar el cronómetro a 2 s, simular app en segundo plano y espiar la notificación
await pg.evaluate(async () => { const m = await import('./js/cronometros.js'); const t = m.timers.get('champurrado:0'); t.fin = Date.now() + 2000;
  window.__avisos = []; navigator.serviceWorker.getRegistration = async () => ({ showNotification: (titulo, o) => { window.__avisos.push([titulo, o.body]); } });
  Object.defineProperty(document, 'hidden', { get: () => true, configurable: true }); });
await pg.goto(B + '#/cotorreo'); await pg.waitForSelector('main h1');           // la persona se va a otra sección
await pg.waitForSelector('.toast', { timeout: 8000 }).catch(() => {});
const hayToast = (await pg.locator('.toast').filter({ hasText: 'Tiempo' }).count()) >= 1;
await pg.waitForFunction(() => window.__avisos.length > 0, null, { timeout: 4000 }).catch(() => {});
const avisos = await pg.evaluate(() => window.__avisos);
ok(avisos.length === 1 && /Tiempo/.test(avisos[0][1]) && /paso 1/.test(avisos[0][1]), `notificación al terminar, estando en otra sección: «${avisos[0]?.[1]}»`);
ok(hayToast, 'también aparece el aviso en pantalla');
await pg.goto(B + '#/receta/champurrado'); await pg.waitForSelector('[data-cron="0"] .tiempo');
ok((await pg.locator('[data-cron="0"] .tiempo').innerText()) === '00:00', 'al volver a la receta el paso marca 00:00');
ok(await pg.evaluate(async () => !(await import('./js/cronometros.js')).hayCorriendo()), 'no quedan cronómetros corriendo');
ok(errores.length === 0, 'sin errores de JS' + (errores.length ? ': ' + errores.slice(0, 2).join(' | ') : ''));
await browser.close(); srv.close(); console.log(fallas.length ? `\n✘ ${fallas.length} fallas` : '\n✔ BIBLIA Y CRONÓMETRO OK'); process.exit(fallas.length ? 1 : 0);
