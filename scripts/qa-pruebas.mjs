// QA en navegador real: pruebas acumulativas (primero en el idioma propio, luego en el que se aprende)
// y energía diaria (más de 10 errores → se acaba y la lección/prueba se repite mañana).
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
const hist = JSON.parse(readFileSync(join(RAIZ, 'data/historia.json')));
const browser = await chromium.launch(); const errores = [];
const CAPTURAS = process.argv[2];

async function sesion(aprende, interes, caps, extra = {}) {
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 } }); const pg = await ctx.newPage(); pg.on('pageerror', (e) => errores.push(e.message));
  await pg.goto(B);
  await pg.evaluate(([a, i, c, x]) => localStorage.setItem('granma:v1', JSON.stringify({ v: 1, perfil: { aprende: a, interes: i, cocina: 'mexicana', nombre: 'Ana', listo: true, legal: '2026-11-28' }, xp: 0, racha: { n: 0, ultimo: null }, caps: Object.fromEntries(c.map((k) => [k, { hecho: true }])), recetas: {}, consejos: {}, cotorreos: {}, biblia: {}, insignias: {}, misiones: { fecha: '', prog: {}, cobradas: {} }, stats: { retoMejor: 0, retos: 0 }, ajustes: { sonido: false, voz: false }, constancia: { fecha: null }, ...x })), [aprende, interes, caps, extra]);
  await pg.reload(); return pg;
}
// diccionario de respuestas con lo aprendido hasta el capítulo n
function respuestas(n, interes) {
  const m = new Map();
  for (const c of hist.capitulos.filter((x) => x.id <= n)) {
    for (const p of c.palabras) { m.set(p.es, p.en); m.set(p.en, p.es); }
    for (const e of c.ejemplos[interes]) { m.set(e.es, e.en); m.set(e.en, e.es); }
    for (const w of c.palabrasInteres[interes]) { m.set(w.es, w.en); m.set(w.en, w.es); m.set(w.f.es, w.f.en); m.set(w.f.en, w.f.es); }
  }
  return m;
}
async function pregunta(pg) {
  const txt = await pg.locator('.pregunta').innerText(); const m = txt.match(/«(.+?)»/);
  const clave = m ? m[1] : txt.split('\n')[1].trim();
  const ops = await pg.locator('.opcion').evaluateAll((o) => o.map((x) => x.dataset.op));
  return { txt, clave, ops };
}
async function responder(pg, dic, bien) {
  const q = await pregunta(pg), correcta = dic.get(q.clave);
  const elegida = bien ? correcta : q.ops.find((o) => o !== correcta);
  await pg.locator('.opcion').filter({ hasText: new RegExp(`^${elegida.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`) }).first().click();
  await pg.click('[data-comprobar]'); await pg.waitForSelector('.retro.ok,.retro.mal');
  const acierto = (await pg.locator('.retro.ok').count()) === 1; await pg.click('[data-seguir]'); await pg.waitForTimeout(120); return { ...q, acierto };
}

console.log('1) Prueba 2 completa (aprende inglés): primero en español, después en inglés');
let pg = await sesion('en', 'trabajo', [1, 2]); let dic = respuestas(2, 'trabajo');
await pg.goto(B + '#/historia'); await pg.waitForSelector('.mapa');
ok((await pg.locator('.nodo.prueba').count()) === 2, 'el mapa muestra una prueba después de cada capítulo terminado');
await pg.goto(B + '#/prueba/2'); await pg.waitForSelector('[data-empezar]');
const portada = await pg.locator('main').innerText();
ok(/Primero te pregunto en español y después en inglés/.test(portada), 'la portada explica: primero en español y después en inglés');
ok(/6 palabras y 3 frases/.test(portada) && /18/.test(portada), 'prueba 2: 6 palabras + 3 frases = 18 preguntas');
if (CAPTURAS) await pg.screenshot({ path: join(CAPTURAS, 'prueba-portada.png') });
await pg.click('[data-empezar]'); ok(/Primero, en español/.test(await pg.locator('main h1').innerText()), 'Parte 1: «Primero, en español»');
await pg.click('[data-parte="A"]'); await pg.waitForSelector('.opcion');
ok((await pg.locator('.sesion-top .tortilla').count()) === 10, 'la sesión muestra las 10 tortillitas de energía');
let enEsp = 0, n = 0, repaso = false; const cap1 = new Set([...hist.capitulos[0].palabras, ...hist.capitulos[0].palabrasInteres.trabajo].flatMap((p) => [p.es, p.en, p.f?.es, p.f?.en]));
for (let i = 0; i < 9; i++) { const r = await responder(pg, dic, true); n++; if (/¿Cómo se dice «.+» en inglés\?|Elige cómo se dice en inglés/.test(r.txt)) enEsp++; if (cap1.has(r.clave)) repaso = true; if (i === 0 && CAPTURAS) { /* captura tomada antes */ } }
ok(enEsp === 9, `las 9 preguntas de la parte 1 están en español (${enEsp}/9)`); ok(repaso, 'incluye repaso de palabras del capítulo 1');
await pg.waitForSelector('[data-parte="B"]'); ok(/Now, in English/.test(await pg.locator('main h1').innerText()), 'Parte 2: «Now, in English»');
if (CAPTURAS) await pg.screenshot({ path: join(CAPTURAS, 'prueba-parte2.png') });
await pg.click('[data-parte="B"]'); await pg.waitForSelector('.opcion'); let enIng = 0;
for (let i = 0; i < 9; i++) { const r = await responder(pg, dic, true); if (/What does «.+» mean\?|Choose what it means/.test(r.txt)) enIng++; if (i === 0 && CAPTURAS) await pg.screenshot({ path: join(CAPTURAS, 'prueba-pregunta-en.png') }); }
ok(enIng === 9, `las 9 preguntas de la parte 2 están en inglés (${enIng}/9)`);
await pg.waitForSelector('h1:has-text("Prueba aprobada")'); const res = await pg.locator('main').innerText();
ok(/100%/.test(res) && /⭐⭐⭐/.test(res), 'resultado: 100 % y 3 estrellas');
if (CAPTURAS) await pg.screenshot({ path: join(CAPTURAS, 'prueba-resultado.png') });
let S = await pg.evaluate(() => JSON.parse(localStorage.getItem('granma:v1')));
ok(S.pruebas[2].aprobada && S.pruebas[2].estrellas === 3 && S.xp >= 60, `prueba guardada como aprobada, +${S.xp} XP`);
ok(S.vidas.n === 10, 'sin errores no se gasta energía');
await pg.goto(B + '#/historia'); await pg.waitForSelector('.mapa'); ok((await pg.locator('.nodo.prueba.hecho').count()) === 1 && /⭐⭐⭐ · 100%/.test(await pg.locator('.mapa').innerText()), 'el mapa muestra las estrellas ganadas');
await pg.context().close();

console.log('2) La prueba crece y funciona al revés para quien aprende español');
pg = await sesion('es', 'cocina', [1, 2, 3, 4, 5, 6]); await pg.goto(B + '#/prueba/6'); await pg.waitForSelector('[data-empezar]');
const p6 = await pg.locator('main').innerText(); ok(/8 words and 5 phrases/.test(p6) && /26/.test(p6), 'prueba 6: 8 palabras + 5 frases = 26 preguntas');
ok(/First I ask in English, then in Spanish/.test(p6), 'para quien aprende español: primero en inglés, después en español');
await pg.click('[data-empezar]'); await pg.click('[data-parte="A"]'); await pg.waitForSelector('.opcion');
ok(/How do you say «.+» in Spanish\?|Choose how to say it in Spanish/.test((await pregunta(pg)).txt), 'parte 1 en inglés'); await pg.context().close();

console.log('3) Energía: más de 10 errores → se acaba y se repite mañana');
pg = await sesion('en', 'amigos', [1]); dic = respuestas(1, 'amigos');
await pg.goto(B + '#/prueba/1'); await pg.click('[data-empezar]'); await pg.click('[data-parte="A"]'); await pg.waitForSelector('.opcion');
let fallos = 0, despuesDe10 = null;
for (let i = 0; i < 30; i++) {
  if (await pg.locator('text=Se acabó la energía por hoy').count()) break;
  if (await pg.locator('[data-parte="B"]').count()) { await pg.click('[data-parte="B"]'); await pg.waitForSelector('.opcion'); }
  await responder(pg, dic, false); fallos++;
  if (fallos === 10) despuesDe10 = await pg.evaluate(() => JSON.parse(localStorage.getItem('granma:v1')).vidas);
}
ok(despuesDe10 && despuesDe10.n === 0 && despuesDe10.agotada === false, 'con 10 errores quedan 0 tortillitas pero todavía se puede seguir');
ok(fallos === 11 && (await pg.locator('text=Se acabó la energía por hoy').count()) === 1, `al error n.º 11 se acaba la energía (errores: ${fallos})`);
ok(/mañana repetimos «Prueba 1»/.test(await pg.locator('main').innerText()), 'mensaje cariñoso: «mañana repetimos «Prueba 1»… para que no se pierda el hilo»');
if (CAPTURAS) await pg.screenshot({ path: join(CAPTURAS, 'sin-energia.png'), fullPage: true });
S = await pg.evaluate(() => JSON.parse(localStorage.getItem('granma:v1'))); ok(S.vidas.agotada === true && S.repetir?.prueba === 1, 'queda marcada para repetir');
await pg.goto(B + '#/leccion/1'); await pg.waitForSelector('[data-accion="palabras"]'); ok(true, 'el relato se puede seguir leyendo sin energía');
await pg.click('[data-accion="palabras"]'); await pg.click('[data-accion="ejercicios"]'); await pg.waitForTimeout(300);
ok((await pg.locator('text=Se acabó la energía por hoy').count()) === 1, 'los ejercicios de la lección quedan en pausa hoy');
await pg.goto(B + '#/reto'); await pg.waitForSelector('[data-ir]'); ok(true, 'el reto de 60 s sigue disponible (no gasta energía)');
await pg.goto(B + '#/'); await pg.waitForFunction(() => /Mañana repetimos/.test(document.querySelector('#cta')?.textContent || ''), null, { timeout: 8000 }).catch(() => {});
ok(/Mañana repetimos: Prueba 1/.test(await pg.locator('#cta').innerText()), 'inicio: «Mañana repetimos: Prueba 1»'); ok(/Se acabó la energía por hoy/.test(await pg.locator('main').innerText()), 'inicio avisa que no hay energía');
// «mañana»
await pg.evaluate(() => { const s = JSON.parse(localStorage.getItem('granma:v1')); s.vidas.fecha = '2000-01-01'; s.repetir.fecha = '2000-01-01'; localStorage.setItem('granma:v1', JSON.stringify(s)); });
await pg.reload(); await pg.waitForFunction(() => /Hoy repetimos/.test(document.querySelector('#cta')?.textContent || ''), null, { timeout: 8000 }).catch(() => {});
ok(/Hoy repetimos: Prueba 1/.test(await pg.locator('#cta').innerText()), 'al día siguiente: «Hoy repetimos: Prueba 1» va primero');
ok(/energía de hoy: 10 \/ 10/.test(await pg.locator('main').innerText()), 'la energía vuelve a 10');
await pg.click('#cta'); await pg.waitForSelector('[data-empezar]'); await pg.click('[data-empezar]'); await pg.click('[data-parte="A"]'); await pg.waitForSelector('.opcion');
for (let i = 0; i < 7; i++) await responder(pg, dic, true); await pg.click('[data-parte="B"]'); await pg.waitForSelector('.opcion'); for (let i = 0; i < 7; i++) await responder(pg, dic, true);
await pg.waitForSelector('h1:has-text("Prueba aprobada")'); S = await pg.evaluate(() => JSON.parse(localStorage.getItem('granma:v1'))); ok(S.repetir === null && S.pruebas[1].aprobada, 'al repetirla y aprobar, ya no queda pendiente');
await pg.context().close();

console.log('4) Lección: al agotarse la energía se repite mañana');
pg = await sesion('en', 'viajes', [], { vidas: { n: 0, fecha: new Date().toLocaleDateString('sv-SE'), agotada: false } });
await pg.goto(B + '#/leccion/1'); await pg.click('[data-accion="palabras"]'); await pg.click('[data-accion="ejercicios"]'); await pg.waitForSelector('.opcion');
const q = await pregunta(pg); const pal = [...hist.capitulos[0].palabras, ...hist.capitulos[0].palabrasInteres.viajes]; const buena = pal.find((p) => p.en === q.clave).es;
await pg.locator('.opcion').filter({ hasText: new RegExp(`^${q.ops.find((o) => o !== buena)}$`) }).first().click(); await pg.click('[data-comprobar]'); await pg.click('[data-seguir]'); await pg.waitForTimeout(200);
ok((await pg.locator('text=Se acabó la energía por hoy').count()) === 1, 'la lección se detiene al pasar de 10 errores');
S = await pg.evaluate(() => JSON.parse(localStorage.getItem('granma:v1'))); ok(S.repetir?.cap === 1 && !S.caps[1]?.hecho, 'la lección queda para repetir mañana y no se da por hecha');
await pg.evaluate(() => { const s = JSON.parse(localStorage.getItem('granma:v1')); s.vidas.fecha = '2000-01-01'; s.repetir.fecha = '2000-01-01'; localStorage.setItem('granma:v1', JSON.stringify(s)); });
await pg.reload(); await pg.goto(B + '#/leccion/1'); await pg.waitForSelector('[data-accion="palabras"]');
ok(/Hoy repetimos esta lección con calma/.test(await pg.locator('main').innerText()), 'mañana la lección avisa: «Hoy repetimos esta lección con calma»');
await pg.context().close();

ok(errores.length === 0, 'sin errores de JS' + (errores.length ? ': ' + errores.slice(0, 3).join(' | ') : ''));
await browser.close(); srv.close(); console.log(fallas.length ? `\n✘ ${fallas.length} fallas` : '\n✔ PRUEBAS Y ENERGÍA OK'); process.exit(fallas.length ? 1 : 0);
