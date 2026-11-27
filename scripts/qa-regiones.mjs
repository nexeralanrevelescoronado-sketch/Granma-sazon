// QA en navegador de las recetas por región: botones en Inicio, pantalla de regiones, cada grupo, la historia
// (con la leyenda marcada) y el cronómetro largo del tejuino. A 390 px (celular) y 1280 px (escritorio).
// Uso: node scripts/qa-regiones.mjs
import { createRequire } from 'node:module'; const { chromium } = createRequire('/opt/node-tools/x.js')('playwright');
import { createServer } from 'node:http'; import { readFileSync, existsSync, statSync, mkdirSync } from 'node:fs'; import { join, extname, dirname } from 'node:path'; import { fileURLToPath } from 'node:url';
const R = join(dirname(fileURLToPath(import.meta.url)), '..'), CAPT = join(R, '.qa'); mkdirSync(CAPT, { recursive: true });
const TIPOS = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
const srv = createServer((q, s) => { let p = new URL(q.url, 'http://x').pathname; if (p.endsWith('/')) p += 'index.html'; const f = join(R, decodeURIComponent(p)); if (!existsSync(f) || statSync(f).isDirectory()) { s.writeHead(404); return s.end(); }
  s.writeHead(200, { 'Content-Type': TIPOS[extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' }); s.end(readFileSync(f)); }).listen(0);
const B = `http://localhost:${srv.address().port}/`, fallas = [], ok = (c, t) => { console.log(`  ${c ? '✔' : '✘'} ${t}`); if (!c) fallas.push(t); };
const estado = JSON.stringify({ v: 1, perfil: { aprende: 'en', interes: 'cocina', cocina: 'mexicana', nombre: 'Ana', listo: true, legal: '2026-11-27', trato: 'mija' }, xp: 0, racha: { n: 0, ultimo: null }, caps: {}, recetas: {}, consejos: {}, cotorreos: {}, biblia: {}, insignias: {}, pruebas: {}, misiones: { fecha: '', prog: {}, cobradas: {} }, stats: { retoMejor: 0, retos: 0 }, ajustes: { sonido: false, voz: false, vozV: 2 }, constancia: { fecha: null } });
const reg = JSON.parse(readFileSync(join(R, 'data/regiones.json'), 'utf8')), grupos = [...reg.regiones, ...reg.temas];
const b = await chromium.launch(), errores = [];
for (const ancho of [390, 1280]) {
  console.log(`— A ${ancho} px`);
  const ctx = await b.newContext({ viewport: { width: ancho, height: 844 }, serviceWorkers: 'block' }), pg = await ctx.newPage(); pg.on('pageerror', (e) => errores.push(e.message));
  await pg.goto(B); await pg.evaluate((e) => localStorage.setItem('granma:v1', e), estado); await pg.reload(); await pg.waitForSelector('[data-grupos] .grupo');
  const bts = pg.locator('[data-grupos] .grupo');
  ok((await bts.count()) === grupos.length && (await bts.evaluateAll((x) => x.every((y) => y.getBoundingClientRect().height >= 44))), `inicio: ${await bts.count()} botones de región y tema, todos de ≥ 44 px`);
  const sinDesborde = () => pg.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
  ok(await sinDesborde(), 'inicio: sin desborde');
  if (ancho === 390) { await pg.locator('[data-grupos]').scrollIntoViewIfNeeded(); await pg.screenshot({ path: join(CAPT, 'regiones-inicio.png') }); }
  for (const g of grupos) {
    await pg.goto(B + '#/regiones/' + g.id); await pg.waitForSelector('main h1');
    const n = await pg.locator('main a.enlace-tarjeta').count();
    ok(n === g.recetas.length && await sinDesborde(), `${g.id}: ${n} receta(s)${n ? '' : ' («Muy pronto»)'}, sin desborde`);
  }
  await pg.goto(B + '#/regiones/guadalajara'); await pg.click('a[href="#/receta/jericalla/guadalajara"]'); await pg.waitForSelector('.historia-receta');
  const h = await pg.locator('.historia-receta').textContent();
  ok(/Why is it called that\?|¿Por qué se llama así\?/.test(h) && /Legend: not proven|Leyenda: no está comprobada/.test(h) && /Fun facts|Datos curiosos/.test(h), 'jericalla: «Su historia» con nombre, leyenda marcada y datos curiosos');
  ok((await pg.locator('.volver').getAttribute('href')) === '#/regiones/guadalajara', 'el «← Regresar» vuelve a Guadalajara');
  ok(await sinDesborde(), 'ficha con historia: sin desborde');
  if (ancho === 390) await pg.screenshot({ path: join(CAPT, 'regiones-jericalla.png'), fullPage: true });
  await pg.goto(B + '#/receta/tejuino/aguas'); await pg.waitForSelector('.historia-receta');
  ok(/24:00:00/.test(await pg.locator('[data-cron="4"]').textContent()), 'tejuino: el cronómetro de fermentar muestra 24:00:00');
  ok(/alcohol/.test(await pg.locator('.tarjeta.crema2').first().textContent()), 'tejuino: el aviso de cuidado se ve arriba de los ingredientes');
  if (ancho === 390) await pg.screenshot({ path: join(CAPT, 'regiones-tejuino.png'), fullPage: true });
  await ctx.close();
}
await b.close(); srv.close();
ok(errores.length === 0, 'sin errores de JavaScript' + (errores.length ? ': ' + errores.join(' | ') : ''));
console.log(fallas.length ? `\n✘ ${fallas.length} fallas` : '\n✔ RECETAS POR REGIÓN OK'); process.exit(fallas.length ? 1 : 0);
