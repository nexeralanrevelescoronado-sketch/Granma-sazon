// QA en navegador de la Lotería de Granma: portada, cuenta regresiva, Granma canta (voz simulada), marcar solo lo que ya
// salió, «¡Lotería!» solo con la tabla llena, subir y bajar de nivel. El reloj del navegador se adelanta (no espera 70 s).
// A 390 px (celular) y 1280 px. Uso: node scripts/qa-loteria.mjs
import { createRequire } from 'node:module'; const { chromium } = createRequire('/opt/node-tools/x.js')('playwright');
import { createServer } from 'node:http'; import { readFileSync, existsSync, statSync, mkdirSync } from 'node:fs'; import { join, extname, dirname } from 'node:path'; import { fileURLToPath } from 'node:url';
const R = join(dirname(fileURLToPath(import.meta.url)), '..'), CAPT = join(R, '.qa'); mkdirSync(CAPT, { recursive: true });
const TIPOS = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
const srv = createServer((q, s) => { let p = new URL(q.url, 'http://x').pathname; if (p.endsWith('/')) p += 'index.html'; const f = join(R, decodeURIComponent(p)); if (!existsSync(f) || statSync(f).isDirectory()) { s.writeHead(404); return s.end(); }
  s.writeHead(200, { 'Content-Type': TIPOS[extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' }); s.end(readFileSync(f)); }).listen(0);
const B = `http://localhost:${srv.address().port}/`, fallas = [], ok = (c, t) => { console.log(`  ${c ? '✔' : '✘'} ${t}`); if (!c) fallas.push(t); };
const estado = (extra = {}) => JSON.stringify({ v: 1, perfil: { aprende: 'en', interes: 'cocina', cocina: 'mexicana', nombre: 'Ana', listo: true, legal: '2026-11-27', trato: 'mija' }, xp: 0, racha: { n: 0, ultimo: null }, caps: {}, recetas: {}, consejos: {}, cotorreos: {}, biblia: {}, insignias: {}, pruebas: {}, misiones: { fecha: '', prog: {}, cobradas: {} }, stats: { retoMejor: 0, retos: 0 }, ajustes: { sonido: false, voz: true, vozV: 2 }, constancia: { fecha: null }, ...extra });
const b = await chromium.launch(), errores = [];
for (const ancho of [390, 1280]) {
  console.log(`— A ${ancho} px`);
  const ctx = await b.newContext({ viewport: { width: ancho, height: 844 }, serviceWorkers: 'block' }), pg = await ctx.newPage(); pg.on('pageerror', (e) => errores.push(e.message));
  await ctx.addInitScript(() => { window.__voz = []; class U { constructor(t) { this.text = t; } } window.SpeechSynthesisUtterance = U;
    Object.defineProperty(window, 'speechSynthesis', { value: { getVoices: () => [{ name: 'Samantha', lang: 'en-US' }, { name: 'Paulina', lang: 'es-MX' }], cancel() {}, speak(u) { window.__voz.push({ t: u.text, l: u.lang }); setTimeout(() => { u.onstart?.(); u.onend?.(); }, 5); } }, configurable: true }); });
  await pg.clock.install();
  await pg.goto(B); await pg.evaluate((e) => localStorage.setItem('granma:v1', e), estado()); await pg.reload(); await pg.waitForSelector('.nav a');
  const boton = pg.locator('a[href="#/loteria"]'); ok(await boton.isVisible() && (await boton.boundingBox()).height >= 44, 'inicio: botón «🎴 Lotería con Granma» de ≥ 44 px');
  await boton.click(); await pg.waitForSelector('[data-jugar]');
  const txt = await pg.locator('main').textContent();
  ok(/Lotería came from Europe/.test(txt) && /inventamos para ti/.test(txt), 'portada: cuenta la historia de la lotería y aclara que las cartas son nuestras');
  ok(await pg.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'portada sin desborde');
  await pg.click('[data-jugar]'); await pg.waitForSelector('.tabla-loteria');
  ok((await pg.locator('.casilla').count()) === 9 && /3/.test(await pg.locator('.cuenta').textContent()), 'nivel 1: tabla de 3×3 y cuenta regresiva');
  ok((await pg.locator('.casilla').evaluateAll((x) => x.every((y) => y.getBoundingClientRect().height >= 44))) && await pg.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'casillas de ≥ 44 px y sin desborde');
  // intenta marcar algo que todavía no sale
  await pg.clock.runFor(3100);
  const cantada = await pg.evaluate(() => window.__voz.at(-1)?.t);
  ok(!!cantada && (await pg.locator('[data-cantada] strong').textContent()) === cantada, `Granma canta la primera carta en inglés: «${cantada}»`);
  if (ancho === 390) await pg.screenshot({ path: join(CAPT, 'loteria-juego.png') });
  const datos = JSON.parse(readFileSync(join(R, 'data/loteria.json'), 'utf8')).cartas, porPalabra = Object.fromEntries(datos.map((c) => [c.en, c.id]));
  const tabla = await pg.locator('.casilla').evaluateAll((x) => x.map((y) => y.dataset.c));
  const noSalida = tabla.find((id) => id !== porPalabra[cantada]);
  await pg.click(`.casilla[data-c="${noSalida}"]`);
  ok(/todavía no la canto/.test(await pg.locator('[data-pista]').textContent()) && !(await pg.locator(`.casilla[data-c="${noSalida}"]`).getAttribute('class')).includes('marcada'), 'si tocas una que no ha salido, no se marca («todavía no la canto»)');
  ok(await pg.locator('[data-loteria]').isDisabled(), '«¡Lotería!» no se puede tocar sin la tabla llena');
  // juega: en cada carta cantada, si está en la tabla, la marca
  const vistas = new Set();
  for (let k = 0; k < 20; k++) {
    const w = await pg.evaluate(() => window.__voz.at(-1)?.t); const id = porPalabra[w];
    if (id && tabla.includes(id) && !vistas.has(id)) { vistas.add(id); await pg.click(`.casilla[data-c="${id}"]`); }
    if (vistas.size === tabla.length) break;
    await pg.clock.runFor(4000);
  }
  ok(vistas.size === 9 && !(await pg.locator('[data-loteria]').isDisabled()), 'con la tabla llena se prende «¡Lotería!»');
  await pg.click('[data-loteria]'); await pg.waitForSelector('[data-jugar]');
  ok(/¡Lotería!/.test(await pg.locator('main h1').textContent()) && /nivel 2/.test(await pg.locator('main').textContent()), 'gana: «¡Lotería!», XP y sube al nivel 2');
  const reg = await pg.evaluate(() => JSON.parse(localStorage.getItem('granma:v1')).loteria); ok(reg.nivel === 2 && reg.ganadas === 1 && (await pg.evaluate(() => JSON.parse(localStorage.getItem('granma:v1')).xp)) === 15, 'se guarda el nivel y suma 15 XP');
  if (ancho === 390) await pg.screenshot({ path: join(CAPT, 'loteria-gano.png') });
  // pierde dos veces: baja de nivel
  for (let v = 0; v < 2; v++) { await pg.click('[data-jugar]'); await pg.waitForSelector('.tabla-loteria'); await pg.clock.runFor(120000); await pg.waitForSelector('[data-jugar]'); }
  ok((await pg.evaluate(() => JSON.parse(localStorage.getItem('granma:v1')).loteria.nivel)) === 1 && /Bajamos al nivel 1/.test(await pg.locator('main').textContent()), 'pierde dos seguidas: baja al nivel 1 con cariño');
  // en español
  await pg.click('[data-portada]'); await pg.click('[data-idioma="es"]'); await pg.click('[data-jugar]'); await pg.clock.runFor(3100);
  const es = await pg.evaluate(() => window.__voz.at(-1)); ok(es.l.startsWith('es') && datos.some((c) => c.es === es.t), `también canta en español: «${es.t}»`);
  await ctx.close();
}
await b.close(); srv.close();
ok(errores.length === 0, 'sin errores de JavaScript' + (errores.length ? ': ' + errores.join(' | ') : ''));
console.log(fallas.length ? `\n✘ ${fallas.length} fallas` : '\n✔ LOTERÍA OK'); process.exit(fallas.length ? 1 : 0);
