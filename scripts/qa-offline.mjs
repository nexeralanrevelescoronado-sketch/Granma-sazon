// QA en navegador real (Chromium): instalar → descargar → modo avión → lección completa y receta completa.
// Uso: node scripts/qa-offline.mjs [carpeta_capturas]
import { createServer } from 'node:http';
import { readFileSync, existsSync, statSync, mkdirSync } from 'node:fs';
import { join, extname, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const CAPT = process.argv[2] || join(RAIZ, '.qa'); mkdirSync(CAPT, { recursive: true });
let chromium; try { ({ chromium } = await import('playwright')); } catch { ({ chromium } = createRequire('/opt/node-tools/x.js')('playwright')); }
const TIPOS = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
const srv = createServer((req, res) => {
  let p = decodeURIComponent(new URL(req.url, 'http://x').pathname); if (p.endsWith('/')) p += 'index.html';
  const f = join(RAIZ, p);
  if (!f.startsWith(RAIZ) || !existsSync(f) || statSync(f).isDirectory()) { res.writeHead(404); return res.end('no'); }
  res.writeHead(200, { 'Content-Type': TIPOS[extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-cache' }); res.end(readFileSync(f));
}).listen(0);
const BASE = `http://localhost:${srv.address().port}/`;
const hist = JSON.parse(readFileSync(join(RAIZ, 'data/historia.json')));
const recs = JSON.parse(readFileSync(join(RAIZ, 'data/recetas.json')));
const T = 'en', N = 'es';
const fallas = []; const ok = (c, m) => { console.log((c ? '  ✔ ' : '  ✘ ') + m); if (!c) fallas.push(m); };

const browser = await chromium.launch();
const ctx = await browser.newContext({ viewport: { width: 390, height: 800 }, deviceScaleFactor: 2, serviceWorkers: 'allow' });
const page = await ctx.newPage();
const errores = []; page.on('pageerror', (e) => errores.push(e.message)); page.on('console', (m) => m.type() === 'error' && !/Failed to load resource/.test(m.text()) && errores.push(m.text()));
await page.goto(BASE);

console.log('1) Onboarding');
await page.click('[data-aprende="en"]'); await page.click('[data-sig]');
await page.click('[data-interes="trabajo"]'); await page.click('[data-sig]');
await page.click('[data-cocina="mexicana"]'); await page.click('[data-sig]');
await page.screenshot({ path: join(CAPT, '01-bienvenida.png') });
await page.click('[data-empezar]');
await page.waitForSelector('#encabezado:not([hidden])');
ok(await page.locator('h1').first().textContent().then((t) => /Hola/.test(t)), 'Inicio con saludo de Granma');
await page.waitForFunction(() => navigator.serviceWorker.controller || navigator.serviceWorker.ready.then(() => true));
await page.evaluate(() => navigator.serviceWorker.ready); await page.reload(); await page.waitForSelector('#encabezado:not([hidden])');
await page.screenshot({ path: join(CAPT, '02-inicio.png'), fullPage: true });

console.log('2) Descargar todo');
await page.goto(BASE + '#/descargas'); await page.waitForSelector('[data-todo]');
await page.click('[data-todo]');
await page.waitForFunction(() => [...document.querySelectorAll('.paquete')].filter((s) => /Descargado|Downloaded/.test(s.textContent)).length >= 5, null, { timeout: 90000 });
await page.screenshot({ path: join(CAPT, '03-descargas.png'), fullPage: true });
const cachesN = await page.evaluate(async () => (await caches.keys()).sort());
console.log('   cachés:', cachesN.join(', '));
ok(cachesN.some((c) => c.startsWith('granma-core-')) && cachesN.filter((c) => c.startsWith('granma-pkg-')).length === 5, 'núcleo + 5 paquetes en Cache Storage');

console.log('3) MODO AVIÓN');
await ctx.setOffline(true);
await page.goto(BASE + '#/'); await page.reload(); await page.waitForSelector('#encabezado:not([hidden])', { timeout: 15000 });
ok(await page.locator('#sin-internet').isVisible(), 'Indicador «Sin internet — modo descargado» visible');
ok(/modo descargado/.test(await page.locator('#sin-internet').textContent()), 'Texto del indicador');
await page.screenshot({ path: join(CAPT, '04-offline-inicio.png'), fullPage: true });

console.log('4) Lección completa sin internet');
await page.goto(BASE + '#/historia'); await page.waitForSelector('.mapa');
await page.click('a.nodo'); await page.waitForSelector('[data-accion="palabras"]');
await page.screenshot({ path: join(CAPT, '05-relato.png'), fullPage: true });
await page.click('[data-accion="palabras"]'); await page.click('[data-accion="ejercicios"]');
const cap = hist.capitulos[0], pal = cap.palabras, ejs = Object.values(cap.ejemplos).flat();
const nativoDe = (t) => (ejs.find((e) => e[T] === t) || {})[N];
for (let i = 0; i < 12; i++) {
  await page.waitForTimeout(150);
  if (await page.locator('[data-seguir]').count()) { await page.click('[data-seguir]'); continue; }
  if (await page.locator('.celebra, h1:has-text("Capítulo terminado")').count()) break;
  const tipo = (await page.locator('[data-pares]').count()) ? 'pares' : (await page.locator('[data-armado]').count()) ? 'orden' : (await page.locator('.opcion').count()) ? 'mcq' : null;
  if (!tipo) { if (await page.locator('h1:has-text("consejo")').count()) break; continue; }
  if (i === 0) await page.screenshot({ path: join(CAPT, '06-ejercicio.png') });
  if (tipo === 'pares') {
    const izq = await page.locator('[data-lado="i"]').evaluateAll((b) => b.map((x) => x.dataset.v));
    for (const a of izq) { const p = pal.find((x) => x[T] === a); await page.click(`[data-lado="i"][data-v="${a}"]`); await page.click(`[data-lado="d"][data-v="${p[N]}"]`); }
  } else if (tipo === 'orden') {
    const ayuda = await page.locator('.pregunta small').textContent(); const e = ejs.find((x) => x[N] === ayuda);
    for (const palabra of e[T].split(/\s+/)) { await page.locator('[data-ficha]:not(.usada)').filter({ hasText: new RegExp(`^${palabra.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`) }).first().click(); }
    await page.click('[data-comprobar]');
  } else {
    const preg = await page.locator('.pregunta').innerText(); let correcta;
    const m = preg.match(/«(.+?)»|"(.+?)"/);
    if (m && /significa|mean/.test(preg)) correcta = pal.find((p) => p[T] === (m[1] || m[2]))[N];
    else if (preg.includes('_____')) { const ay = await page.locator('.pregunta small').textContent(); const e = ejs.find((x) => x[N] === ay); correcta = pal.find((p) => p[T].toLowerCase() === e.we.toLowerCase())[T]; }
    else { const frase = preg.split('\n')[1]?.trim() || preg; correcta = nativoDe(frase); }
    await page.click(`.opcion[data-op="${correcta.replace(/"/g, '\\"')}"]`); await page.click('[data-comprobar]');
  }
}
await page.waitForSelector('h1:has-text("consejo del Abuelo"), h1:has-text("Grandpa")', { timeout: 15000 });
await page.screenshot({ path: join(CAPT, '07-consejo.png'), fullPage: true });
await page.click('[data-accion="fin"]'); await page.waitForSelector('h1:has-text("Capítulo terminado")');
await page.screenshot({ path: join(CAPT, '08-fin-capitulo.png'), fullPage: true });
const S = await page.evaluate(() => JSON.parse(localStorage.getItem('granma:v1')));
ok(S.caps[1]?.hecho === true, 'Capítulo 1 marcado como hecho (sin internet)');
ok(S.xp >= 20, `XP ganados sin internet (${S.xp})`); ok(S.racha.n >= 1, 'Racha iniciada');

console.log('5) Receta completa sin internet');
await page.goto(BASE + '#/receta/champurrado'); await page.waitForSelector('.pasos');
await page.screenshot({ path: join(CAPT, '09-receta.png'), fullPage: true });
await page.click('[data-play="0"]'); await page.waitForTimeout(1300);
const t = await page.locator('[data-cron="0"] .tiempo').textContent(); ok(/^0[0-7]:[0-5]\d$/.test(t) && t !== '08:00', `Cronómetro corriendo (${t})`);
const rec = recs.find((r) => r.id === 'champurrado');
for (let i = 0; i < rec.pasos.length; i++) await page.check(`[data-paso="${i}"]`);
await page.waitForSelector('text=¡Receta cocinada!'); 
ok(await page.evaluate(() => !!JSON.parse(localStorage.getItem('granma:v1')).recetas.champurrado.hecha), 'Receta champurrado terminada sin internet');
ok(await page.evaluate(() => !!document.querySelector('#ld-receta') ), 'JSON-LD Recipe presente en la receta');

console.log('6) Biblia y demás secciones offline');
await page.goto(BASE + '#/biblia'); await page.waitForSelector('.verso-fila');
ok((await page.locator('.verso-fila').count()) >= 30, 'Biblia lado a lado (Juan 3) sin internet');
await page.screenshot({ path: join(CAPT, '10-biblia.png'), fullPage: true });
for (const r of ['consejos', 'cotorreo', 'recetas', 'reto']) { await page.goto(BASE + '#/' + r); await page.waitForTimeout(400); ok(!(await page.locator('text=todavía no está descargado').count()), `Sección #/${r} abre sin internet`); }
ok(errores.length === 0, 'Sin errores de consola/JS' + (errores.length ? ': ' + errores.slice(0, 3).join(' | ') : ''));
await browser.close(); srv.close();
console.log(fallas.length ? `\n✘ ${fallas.length} fallas` : '\n✔ TODO OK en modo avión'); process.exit(fallas.length ? 1 : 0);
