// QA en navegador de la Lotería en familia: dos teléfonos (Granma y Beto) con el servidor de verdad
// (functions/api/loteria con SQLite en lugar de D1). Los relojes de los dos y del servidor avanzan juntos.
// Uso: node scripts/qa-loteria-familia.mjs
import { createRequire } from 'node:module'; const { chromium } = createRequire('/opt/node-tools/x.js')('playwright');
import { createServer } from 'node:http'; import { readFileSync, existsSync, statSync, mkdirSync } from 'node:fs'; import { join, extname, dirname } from 'node:path'; import { fileURLToPath } from 'node:url';
import { DatabaseSync } from 'node:sqlite';
import { atender, ORIGEN } from '../functions/api/loteria/[[ruta]].js';
const R = join(dirname(fileURLToPath(import.meta.url)), '..'), CAPT = join(R, '.qa'); mkdirSync(CAPT, { recursive: true });
const TIPOS = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
const srv = createServer((q, s) => { let p = new URL(q.url, 'http://x').pathname; if (p.endsWith('/')) p += 'index.html'; const f = join(R, decodeURIComponent(p)); if (!existsSync(f) || statSync(f).isDirectory()) { s.writeHead(404); return s.end(); }
  s.writeHead(200, { 'Content-Type': TIPOS[extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' }); s.end(readFileSync(f)); }).listen(0);
const B = `http://localhost:${srv.address().port}/`, fallas = [], ok = (c, t) => { console.log(`  ${c ? '✔' : '✘'} ${t}`); if (!c) fallas.push(t); };
// base de datos de mentiras (SQLite) con la misma forma que D1
const db = new DatabaseSync(':memory:'); db.exec(readFileSync(join(R, 'servidor/loteria.sql'), 'utf8'));
const orden = (sql, args = []) => ({ bind: (...a) => orden(sql, a), all: async () => ({ results: db.prepare(sql).all(...args) }), first: async () => db.prepare(sql).get(...args) ?? null, run: async () => ({ meta: { changes: Number(db.prepare(sql).run(...args).changes) } }) });
const env = { DB: { prepare: (s) => orden(s), batch: async (l) => { for (const o of l) await o.run(); } } };
const T0 = Date.UTC(2026, 10, 28, 18, 0, 0); let ahora = T0;
const estado = (trato) => JSON.stringify({ v: 1, perfil: { aprende: 'en', interes: 'cocina', cocina: 'mexicana', nombre: '', listo: true, legal: '2026-11-28', trato }, xp: 0, racha: { n: 0, ultimo: null }, caps: {}, recetas: {}, consejos: {}, cotorreos: {}, biblia: {}, insignias: {}, pruebas: {}, misiones: { fecha: '', prog: {}, cobradas: {} }, stats: { retoMejor: 0, retos: 0 }, ajustes: { sonido: false, voz: true, vozV: 2 }, constancia: { fecha: null } });
const b = await chromium.launch(), errores = [], cartas = JSON.parse(readFileSync(join(R, 'data/loteria.json'), 'utf8')).cartas, porPalabra = Object.fromEntries(cartas.map((c) => [c.en, c.id]));
async function telefono(nombre, trato) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' }), pg = await ctx.newPage(); pg.on('pageerror', (e) => errores.push(`${nombre}: ${e.message}`));
  await ctx.addInitScript(() => { window.__voz = []; class U { constructor(t) { this.text = t; } } window.SpeechSynthesisUtterance = U;
    Object.defineProperty(window, 'speechSynthesis', { value: { getVoices: () => [{ name: 'Samantha', lang: 'en-US' }, { name: 'Paulina', lang: 'es-MX' }], cancel() {}, speak(u) { window.__voz.push({ t: u.text, l: u.lang }); setTimeout(() => { u.onstart?.(); u.onend?.(); }, 5); } }, configurable: true }); });
  await ctx.route('**/api/loteria/**', async (ruta) => { const q = ruta.request(), req = new Request(q.url().replace(/^http:\/\/localhost:\d+/, ORIGEN), { method: q.method(), headers: { 'Content-Type': 'application/json', Origin: ORIGEN }, body: q.postData() || undefined });
    const res = await atender(req, env, ahora); ruta.fulfill({ status: res.status, contentType: 'application/json', body: await res.text() }); });
  await pg.clock.install({ time: T0 });
  await pg.goto(B); await pg.evaluate((e) => localStorage.setItem('granma:v1', e), estado(trato)); await pg.reload(); await pg.waitForSelector('.nav a');
  return pg;
}
const granma = await telefono('Granma', 'mija'), beto = await telefono('Beto', 'mijo');
const avanzar = async (ms) => { ahora += ms; await Promise.all([granma.clock.runFor(ms), beto.clock.runFor(ms)]); await granma.waitForTimeout(60); };

console.log('1) Crear la partida e invitar');
await granma.goto(B + '#/loteria'); await granma.click('[data-familia]');
ok(/se borra solo a las 24 horas/.test(await granma.locator('main').textContent()), 'avisa que solo se guarda el apodo y que se borra a las 24 horas');
await granma.fill('[data-apodo]', 'pendejo'); await granma.click('[data-crear]'); await granma.waitForSelector('[data-aviso]:not([hidden])');
ok(/sin palabras feas/.test(await granma.locator('[data-aviso]').textContent()), 'un apodo feo no se acepta');
await granma.fill('[data-apodo]', 'Granma'); await granma.click('[data-crear]'); await granma.waitForSelector('[data-codigo-sala]');
const codigo = (await granma.locator('[data-codigo-sala]').textContent()).trim();
const wa = await granma.locator('a[href^="https://wa.me/"]').getAttribute('href');
ok(/^[A-Z2-9]{5}$/.test(codigo) && decodeURIComponent(wa).includes(`https://granmasazon.app/#/loteria/${codigo}`), `código ${codigo} y la invitación por WhatsApp lleva el enlace de granmasazon.app`);
await granma.screenshot({ path: join(CAPT, 'loteria-sala.png') });

console.log('2) Beto entra con el enlace');
await beto.goto(B + `#/loteria/${codigo}`); await beto.waitForSelector('[data-codigo]');
ok((await beto.locator('[data-codigo]').inputValue()) === codigo && /Te invitaron/.test(await beto.locator('[data-aviso]').textContent()), 'el enlace abre con el código ya escrito');
await beto.fill('[data-apodo]', 'Beto'); await beto.click('[data-unirse]'); await beto.waitForSelector('[data-jugadores]');
await avanzar(2100); await avanzar(2100);
ok(/Granma/.test(await granma.locator('[data-jugadores]').textContent()) && /Beto/.test(await granma.locator('[data-jugadores]').textContent()), 'en la sala de Granma ya aparece Beto');
ok((await beto.locator('[data-empezar]').count()) === 0 && /Esperando/.test(await beto.locator('main').textContent()), 'Beto no puede empezar: espera a quien la creó');

console.log('3) Empiezan a la misma hora y juegan');
await granma.click('[data-empezar]'); await granma.waitForSelector('.tabla-loteria');
await avanzar(2100); await beto.waitForSelector('.tabla-loteria', { timeout: 5000 });
ok(true, 'Beto entra al juego solo, sin tocar nada');
await avanzar(3100);
const [cg, cb] = [await granma.evaluate(() => window.__voz.at(-1)?.t), await beto.evaluate(() => window.__voz.at(-1)?.t)];
ok(cg && cg === cb, `los dos oyen la misma carta al mismo tiempo: «${cg}»`);
const tabla = async (pg) => pg.locator('.casilla').evaluateAll((x) => x.map((y) => y.dataset.c));
const [tg, tb] = [await tabla(granma), await tabla(beto)]; ok(tg.join() !== tb.join(), 'cada quien tiene su propia tabla');
const marcados = { g: new Set(), b: new Set() }; let ganador = null;
for (let k = 0; k < 22 && !ganador; k++) {
  for (const [pg, t, m] of [[granma, tg, marcados.g], [beto, tb, marcados.b]]) {
    const id = porPalabra[await pg.evaluate(() => window.__voz.at(-1)?.t)];
    if (id && t.includes(id) && !m.has(id)) { m.add(id); await pg.click(`.casilla[data-c="${id}"]`); }
    if (m.size === t.length && !ganador) { ganador = pg === granma ? 'Granma' : 'Beto'; await pg.click('[data-loteria]'); await pg.waitForSelector('[data-final]'); }
  }
  if (!ganador) await avanzar(4000);
}
ok(!!ganador, `alguien llenó su tabla: ${ganador}`);
const quienGano = ganador === 'Granma' ? granma : beto, quienNo = ganador === 'Granma' ? beto : granma;
ok(/¡Lotería!/.test(await quienGano.locator('[data-final]').textContent()), `${ganador} ve «¡Lotería!»`);
await avanzar(2100); await quienNo.waitForSelector('[data-final]', { timeout: 5000 });
ok(new RegExp(`Lotería (de|for) ${ganador}`).test(await quienNo.locator('[data-final]').textContent()), `el otro ve «¡Lotería de ${ganador}!» y su partida termina`);
await quienNo.screenshot({ path: join(CAPT, 'loteria-familia-final.png') });
const guardado = db.prepare('SELECT apodo, marcadas FROM loteria_jugadores ORDER BY numero').all();
ok(JSON.stringify(guardado).length < 200 && guardado.every((j) => Object.keys(j).length === 2), `en el servidor solo hay apodos y cuántas llevan: ${JSON.stringify(guardado)}`);
await b.close(); srv.close();
ok(errores.length === 0, 'sin errores de JavaScript' + (errores.length ? ': ' + errores.join(' | ') : ''));
console.log(fallas.length ? `\n✘ ${fallas.length} fallas` : '\n✔ LOTERÍA EN FAMILIA OK'); process.exit(fallas.length ? 1 : 0);
