// QA en navegador: Historia 2 (sobria, con versículo), Platica con Granma, Así se habla y Reglas claras.
// Uso: node scripts/qa-historia2.mjs
import { createRequire } from 'node:module'; const { chromium } = createRequire('/opt/node-tools/x.js')('playwright');
import { createServer } from 'node:http'; import { readFileSync, existsSync, statSync, mkdirSync } from 'node:fs'; import { join, extname, dirname } from 'node:path'; import { fileURLToPath } from 'node:url';
const R = join(dirname(fileURLToPath(import.meta.url)), '..'), CAPT = join(R, '.qa'); mkdirSync(CAPT, { recursive: true });
const TIPOS = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png' };
const srv = createServer((q, s) => { let p = new URL(q.url, 'http://x').pathname; if (p.endsWith('/')) p += 'index.html'; const f = join(R, p); if (!existsSync(f) || statSync(f).isDirectory()) { s.writeHead(404); return s.end(); } s.writeHead(200, { 'Content-Type': TIPOS[extname(f)] || 'application/octet-stream' }); s.end(readFileSync(f)); }).listen(0);
const B = `http://localhost:${srv.address().port}/`, fallas = [], ok = (c, t) => { console.log(`  ${c ? '✔' : '✘'} ${t}`); if (!c) fallas.push(t); };
const J = (f) => JSON.parse(readFileSync(join(R, f), 'utf8')), h2 = J('data/historia2.json'), reglas = J('data/reglas.json'), platicas = J('data/platicas.json'), col = J('data/coloquial.json');
const estado = (ap, caps = {}) => JSON.stringify({ v: 1, perfil: { aprende: ap, interes: 'biblia', cocina: 'mexicana', nombre: 'Ana', listo: true, legal: '2026-11-27' }, xp: 0, racha: { n: 0, ultimo: null }, caps, recetas: {}, consejos: {}, cotorreos: {}, biblia: {}, insignias: {}, pruebas: {}, misiones: { fecha: '', prog: {}, cobradas: {} }, stats: { retoMejor: 0, retos: 0 }, ajustes: { sonido: false, voz: false, vozV: 2, oido: 'local' }, constancia: { fecha: null } });
const b = await chromium.launch(), errores = [];
async function abrir(ap, caps) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true }); const pg = await ctx.newPage(); pg.on('pageerror', (e) => errores.push(e.message));
  await ctx.addInitScript(() => { Object.defineProperty(navigator, 'mediaDevices', { value: undefined, configurable: true }); });
  await pg.goto(B); await pg.evaluate((e) => localStorage.setItem('granma:v1', e), estado(ap, caps)); await pg.reload(); await pg.waitForSelector('.nav a'); return pg;
}
const sinDesborde = (pg) => pg.evaluate(() => document.documentElement.scrollWidth <= innerWidth);
const ir = async (pg, hash, sel) => { await pg.goto(B + hash); await pg.waitForSelector(sel); await pg.waitForTimeout(250); };

console.log('1) Historia 2: mapa propio, título claro y primer capítulo libre');
let pg = await abrir('en');
await ir(pg, '#/historia', '.otra-historia');
ok(/Granma a los 25: cómo conocí a Dios/.test(await pg.locator('.otra-historia').first().textContent()), 'la Historia 1 asoma la Historia 2 con su título completo');
await pg.locator('.otra-historia').first().click(); await pg.waitForSelector('.mapa'); await pg.waitForTimeout(200);
ok(pg.url().endsWith('#/historia/2') && (await pg.locator('h1').textContent()) === h2.titulo.es, 'abre el mapa de la Historia 2');
const nodos = await pg.evaluate(() => [...document.querySelectorAll('.mapa > li:not(.li-prueba) .nodo')].map((n) => ({ t: n.textContent.trim(), a: n.tagName, h: n.getAttribute('href') })));
ok(nodos.length === 6 && nodos[0].a === 'A' && nodos[0].h === '#/leccion/7' && nodos[0].t === '1' && nodos.slice(1).every((n) => n.a === 'SPAN'), 'seis capítulos numerados del 1 al 6; solo el primero está abierto');
ok(await sinDesborde(pg), 'sin desborde a 390 px'); await pg.screenshot({ path: join(CAPT, '50-historia2-mapa.png'), fullPage: true });
await pg.goto(B + '#/leccion/8'); await pg.waitForTimeout(500); ok(pg.url().endsWith('#/historia/2'), 'un capítulo cerrado regresa al mapa de la Historia 2');
await ir(pg, '#/leccion/7', '.pista-glosa');
ok((await pg.locator('.etiqueta').first().textContent()).includes('1 / 6') && (await pg.locator('[data-versiculo]').count()) === 0, 'capítulo 1 de 6, todavía sin versículo (la fe entra poco a poco)');
await pg.context().close();

console.log('2) El versículo: texto exacto de dominio público, en tarjeta formal');
for (const ap of ['en', 'es']) {
  pg = await abrir(ap, { 7: { hecho: true } }); await ir(pg, '#/leccion/8', '.versiculo .versos');
  const T = ap, N = ap === 'en' ? 'es' : 'en', V = { es: 'rv1909', en: 'kjv' }, esperado = (l) => J(`data/biblia/${V[l]}/mat.json`).c[10][27];
  const v = await pg.evaluate(() => ({ cita: document.querySelector('.versiculo .etiqueta').textContent, t: document.querySelector('.versiculo .versos p').textContent, lt: document.querySelector('.versiculo .versos p').lang, n: document.querySelector('.versiculo > p.muted[lang]').textContent, pie: document.querySelector('.versiculo .chico').textContent, botones: document.querySelectorAll('.versiculo button').length }));
  ok(v.t === esperado(T) && v.n === esperado(N) && v.lt === T, `${ap}: Mateo 11:28 idéntico a ${V[T].toUpperCase()} y, debajo, a ${V[N].toUpperCase()}`);
  ok(/11:28/.test(v.cita) && /Reina-Valera 1909/.test(v.pie) && /King James/.test(v.pie) && v.botones === 0, `${ap}: lleva cita y versión, y no es ejercicio (sin botones)`);
  if (ap === 'en') { await pg.locator('.versiculo').scrollIntoViewIfNeeded(); await pg.screenshot({ path: join(CAPT, '51-versiculo.png') }); }
  await pg.context().close();
}

console.log('3) Capítulo completo de la Historia 2: cierre sobrio, sin tortillas');
pg = await abrir('en', { 7: { hecho: true } }); await ir(pg, '#/leccion/8', '.pista-glosa');
await pg.click('[data-accion="palabras"]'); await pg.click('[data-accion="ejercicios"]');
const cap8 = h2.capitulos[1], pares = new Map([...cap8.palabras, ...Object.values(cap8.palabrasInteres).flat()].map((p) => [p.en, p.es])), sabidas = new Map();
for (let k = 0; k < 40; k++) {
  await pg.waitForSelector('.sesion, [data-accion="fin"]'); await pg.waitForTimeout(60);
  if (await pg.locator('[data-accion="fin"]').count()) break;
  const tipo = await pg.evaluate(() => (document.querySelector('.pares') ? 'pares' : document.querySelector('.decir') ? 'di' : document.querySelector('.fichas') ? 'orden' : 'mcq'));
  const clave = (await pg.locator('.pregunta').textContent()).trim();
  if (tipo === 'di') { await pg.click('[data-nohablo]'); continue; }
  if (tipo === 'pares') { for (const i of await pg.locator('.par[data-lado="i"]').all()) { const w = await i.getAttribute('data-v'); await i.click(); await pg.locator(`.par[data-lado="d"][data-v="${pares.get(w)}"]`).click(); } }
  else if (tipo === 'mcq') { const s = sabidas.get(clave); await (s ? pg.locator(`.opcion[data-op="${s.replace(/"/g, '\\"')}"]`) : pg.locator('.opcion').first()).click(); await pg.click('[data-comprobar]'); const buena = await pg.locator('.opcion.ok').first().getAttribute('data-op'); sabidas.set(clave, buena); }
  else { const s = sabidas.get(clave), letras = await pg.locator('.fichas.letras').count();
    if (s) { for (const w of (letras ? [...s] : s.split(/\s+/))) await pg.locator('[data-fichas] .ficha:not(.usada)', { hasText: new RegExp(`^${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`) }).first().click(); }
    else while (await pg.locator('[data-fichas] .ficha:not(.usada)').count()) await pg.locator('[data-fichas] .ficha:not(.usada)').first().click();
    await pg.click('[data-comprobar]'); const r = await pg.locator('.retro small strong').count(); if (r) sabidas.set(clave, await pg.locator('.retro small strong').textContent()); }
  await pg.click('[data-seguir]');
}
await pg.waitForSelector('[data-accion="fin"]'); ok((await pg.locator('.globo.abuelo').textContent()).includes(cap8.consejo.en), 'al terminar los ejercicios, el Abuelo da su consejo');
await pg.click('[data-accion="fin"]'); await pg.waitForSelector('[data-premio]'); await pg.waitForTimeout(1500);
const fin = await pg.evaluate(() => ({ premio: document.querySelector('[data-premio]').textContent, tortillas: document.querySelectorAll('.tortillas-cap .tortilla').length, coloquial: document.querySelectorAll('.coloquial').length, mapa: [...document.querySelectorAll('a')].some((a) => a.getAttribute('href') === '#/historia/2'), sig: [...document.querySelectorAll('a')].some((a) => a.getAttribute('href') === '#/leccion/9'), hecho: JSON.parse(localStorage.getItem('granma:v1')).caps[8]?.hecho }));
ok(/Gracias por escucharme/.test(fin.premio) && !/pale|taquitos|tortillas/.test(fin.premio) && fin.tortillas === 0 && fin.coloquial === 0, 'cierre sobrio: Granma agradece, sin porra ni tortillas');
ok(fin.hecho && fin.mapa && fin.sig, 'el capítulo queda terminado, con paso al siguiente y regreso a su mapa');
await pg.screenshot({ path: join(CAPT, '52-historia2-fin.png'), fullPage: true });
await pg.context().close();

console.log('4) Platica con Granma');
for (const ap of ['en', 'es']) {
  pg = await abrir(ap); const T = ap, N = ap === 'en' ? 'es' : 'en';
  await ir(pg, '#/', '#cta'); ok(await pg.locator('a[href="#/platica"]').count() === 1, `${ap}: desde el inicio, Granma invita a platicar`);
  await ir(pg, '#/platica', '.modo'); ok((await pg.locator('.modo').count()) === platicas.length && await sinDesborde(pg), `${ap}: ${platicas.length} temas de plática`);
  const p = platicas[0]; await pg.click(`a[href="#/platica/${p.id}"]`); await pg.waitForSelector('[data-resp]');
  for (let i = 0; i < 3; i++) {
    await pg.waitForSelector('[data-resp]'); const t = p.turnos[i];
    ok((await pg.locator('.charla .dialogo .l1').last().textContent()) === t.granma[T] && (await pg.locator('[data-resp]').count()) === 3, `${ap}: turno ${i + 1}: Granma pregunta en ${T} y hay 3 respuestas`);
    await pg.locator('[data-resp]').nth(i).click(); await pg.waitForTimeout(150);
    ok((await pg.locator('.yo-dice .l1').last().textContent()) === t.respuestas[i].t[T] && (await pg.locator('.charla').textContent()).includes(t.respuestas[i].r[T]), `${ap}: turno ${i + 1}: queda lo que dijo la persona y Granma le contesta`);
  }
  const f2 = await pg.evaluate(() => { const S = JSON.parse(localStorage.getItem('granma:v1')); return { xp: S.xp, hechas: Object.keys(S.platicas || {}).length, cierre: document.querySelector('.charla').textContent }; });
  ok(f2.cierre.includes(p.cierre[T]) && f2.xp > 0 && f2.hechas === 1 && await sinDesborde(pg), `${ap}: Granma se despide, da XP y la plática queda hecha`);
  if (ap === 'en') await pg.screenshot({ path: join(CAPT, '53-platica.png'), fullPage: true });
  await pg.context().close();
}

console.log('5) Así se habla');
pg = await abrir('es'); await ir(pg, '#/asi', '.frase');
let chips = await pg.locator('.chip-region').allTextContents();
ok(chips.length === 6 && chips[0] === 'All of Mexico' && chips.includes('Jalisco and Guadalajara') && chips.includes('Sinaloa and Mazatlán') && chips.includes('Mexico City') && chips.includes('Monterrey'), 'quien aprende español ve México por regiones: ' + chips.join(' · '));
await pg.locator('.chip-region', { hasText: 'Jalisco' }).click(); await pg.waitForTimeout(150);
const jal = col.filter((x) => x.idioma === 'es' && x.region === 'jalisco');
ok((await pg.locator('.frase').count()) === jal.length && (await pg.locator('.frase h2').first().textContent()).includes(jal[0].frase) && (await pg.locator('.frase').first().textContent()).includes(jal[0].uso.en), `Jalisco: ${jal.length} frases, explicadas en inglés (su idioma)`);
ok((await pg.locator('.frase [data-lento]').count()) === jal.length * 2 && await sinDesborde(pg), 'cada frase y cada ejemplo se oyen normal y en modo perezoso');
await pg.screenshot({ path: join(CAPT, '54-asi-jalisco.png') });
await pg.click('[data-otro]'); await pg.waitForTimeout(150); ok((await pg.locator('.chip-region').first().textContent()) === 'Everyday', 'también puede asomarse al inglés de todos los días');
await pg.context().close();
pg = await abrir('en'); await ir(pg, '#/asi', '.frase'); chips = await pg.locator('.chip-region').allTextContents();
ok(chips.length === 5 && chips[0] === 'De todos los días' && chips.includes('Humor en inglés') && (await pg.locator('.frase').first().textContent()).includes(col.find((x) => x.idioma === 'en').significa.es), 'quien aprende inglés ve el inglés coloquial y su humor, explicado en español');
await pg.context().close();

console.log('6) Reglas claras');
for (const ap of ['en', 'es']) {
  pg = await abrir(ap); const mias = reglas.filter((l) => l.para === ap), N = ap === 'en' ? 'es' : 'en', l = mias[0];
  await ir(pg, '#/reglas', '.modo'); ok((await pg.locator('.modo').count()) === 6 && (await pg.locator('.modo strong').first().textContent()) === l.titulo[N], `${ap}: 6 lecciones; la primera es «${l.titulo[N]}»`);
  await pg.click(`a[href="#/reglas/${l.id}"]`); await pg.waitForSelector('.regla');
  ok((await pg.locator('.regla').count()) === l.puntos.length && (await pg.locator('.regla h2').first().textContent()).includes(l.puntos[0].regla[N]) && await sinDesborde(pg), `${ap}: la regla se explica en su idioma, con ejemplos`);
  if (ap === 'en') await pg.screenshot({ path: join(CAPT, '55-reglas.png'), fullPage: true });
  await pg.click('[data-practicar]');
  for (let k = 0; k < 4; k++) { await pg.waitForSelector('.opcion'); const frase = await pg.locator('.pregunta span').textContent(), q = l.practica.find((x) => x.frase === frase); await pg.locator(`.opcion[data-op="${q.ok}"]`).click(); await pg.click('[data-comprobar]'); ok(k > 0 || (await pg.locator('.retro.ok').count()) === 1, `${ap}: «${frase}» → ${q.ok}`); await pg.click('[data-seguir]'); }
  await pg.waitForSelector('[data-premio]');
  const f3 = await pg.evaluate(() => { const S = JSON.parse(localStorage.getItem('granma:v1')); return { xp: S.xp, hechas: Object.keys(S.reglas || {}).length, vidas: document.querySelector('.chip .tortilla').parentElement.textContent.trim() }; });
  ok(f3.xp > 0 && f3.hechas === 1 && f3.vidas === '10', `${ap}: regla aprendida, con porra, XP y sin gastar energía`);
  await pg.context().close();
}
console.log('7) Historia 3 (las fiestas) y las recetas de fiesta');
{ const h3 = J('data/historia3.json'), recs = J('data/recetas.json');
  pg = await abrir('en'); await ir(pg, '#/historia', '.otra-historia');
  ok((await pg.locator('.otra-historia').count()) === 2 && /Las fiestas de mi familia/.test(await pg.locator('.otra-historia').last().textContent()), 'desde la Historia 1 se asoman las otras dos');
  await pg.locator('.otra-historia').last().click(); await pg.waitForSelector('.mapa'); await pg.waitForTimeout(200);
  const n3 = await pg.evaluate(() => [...document.querySelectorAll('.mapa > li:not(.li-prueba) .nodo')].map((n) => ({ a: n.tagName, h: n.getAttribute('href') })));
  ok(pg.url().endsWith('#/historia/3') && n3.length === 6 && n3[0].h === '#/leccion/13' && n3.slice(1).every((x) => x.a === 'SPAN') && await sinDesborde(pg), 'mapa de la Historia 3: seis capítulos, el primero abierto');
  await pg.screenshot({ path: join(CAPT, '56-historia3-mapa.png'), fullPage: true });
  await ir(pg, '#/leccion/13', '.pista-glosa');
  ok((await pg.locator('.etiqueta').first().textContent()).includes('1 / 6') && (await pg.locator('h1').textContent()) === h3.capitulos[0].titulo.en && (await pg.locator('[data-versiculo]').count()) === 0, 'abre «La rosca y el monito» como capítulo 1 de 6');
  await pg.context().close();
  pg = await abrir('en', { 13: { hecho: true }, 14: { hecho: true } }); await ir(pg, '#/leccion/15', '.pista-glosa');
  ok((await pg.locator('.globo .l2').allTextContents()).join(' ').includes('Dale, dale, dale, no pierdas el tino, porque si lo pierdes, pierdes el camino'), 'la piñata trae su verso completo');
  await pg.screenshot({ path: join(CAPT, '57-pinata.png'), fullPage: true });
  await ir(pg, '#/recetas', '.enlace-tarjeta');
  ok((await pg.locator('.enlace-tarjeta').count()) === recs.length && recs.length === 13 && /fiestas|celebration/.test(await pg.locator('main h2.mt2').textContent()) && await sinDesborde(pg), '13 recetas; las de fiesta van juntas con su título');
  for (const id of ['rosca', 'chiles-en-nogada', 'birria']) {
    const r = recs.find((x) => x.id === id); await ir(pg, `#/receta/${id}`, '.pasos .paso');
    const v = await pg.evaluate(() => ({ pasos: document.querySelectorAll('.pasos .paso').length, texto: document.querySelector('main').textContent, cronos: document.querySelectorAll('[data-crono], .crono, [data-reset]').length }));
    ok(v.pasos === r.pasos.length && v.texto.includes(r.nota.en.slice(0, 40)) && v.cronos > 0 && await sinDesborde(pg), `${id}: ${r.pasos.length} pasos, nota de seguridad y cronómetros`);
    if (id === 'rosca') await pg.screenshot({ path: join(CAPT, '58-receta-rosca.png'), fullPage: true });
  }
  await pg.context().close(); }

ok(errores.length === 0, 'sin errores de JS' + (errores.length ? ': ' + errores.slice(0, 3).join(' | ') : ''));
await b.close(); srv.close(); console.log(fallas.length ? `\n✘ ${fallas.length} fallas` : '\n✔ HISTORIA 2, PLÁTICAS, FRASES Y REGLAS OK'); process.exit(fallas.length ? 1 : 0);
