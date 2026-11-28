// QA en navegador: sección «Aprender hablando y escuchando», bocina lenta 🦥, parejas con voz,
// 5 segundos entre Granma y el Abuelo, porras y tortillas que se estrellan.
// Uso: node scripts/qa-escucha.mjs   (la voz del navegador se simula y se anota qué dijo, con qué velocidad y cuándo)
import { createRequire } from 'node:module'; const { chromium } = createRequire('/opt/node-tools/x.js')('playwright');
import { createServer } from 'node:http'; import { readFileSync, existsSync, statSync, mkdirSync } from 'node:fs'; import { join, extname, dirname } from 'node:path'; import { fileURLToPath } from 'node:url';
const R = join(dirname(fileURLToPath(import.meta.url)), '..'), CAPT = join(R, '.qa'); mkdirSync(CAPT, { recursive: true });
const TIPOS = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png' };
const srv = createServer((q, s) => { let p = new URL(q.url, 'http://x').pathname; if (p.endsWith('/')) p += 'index.html'; const f = join(R, p); if (!existsSync(f) || statSync(f).isDirectory()) { s.writeHead(404); return s.end(); } s.writeHead(200, { 'Content-Type': TIPOS[extname(f)] || 'application/octet-stream' }); s.end(readFileSync(f)); }).listen(0);
const B = `http://localhost:${srv.address().port}/`, fallas = [], ok = (c, t) => { console.log(`  ${c ? '✔' : '✘'} ${t}`); if (!c) fallas.push(t); };
const hist = JSON.parse(readFileSync(join(R, 'data/historia.json'), 'utf8'));
const estado = (ap, caps = {}) => JSON.stringify({ v: 1, perfil: { aprende: ap, interes: 'cocina', cocina: 'mexicana', nombre: 'Ana', listo: true, legal: '2026-11-28' }, xp: 0, racha: { n: 0, ultimo: null }, caps, recetas: {}, consejos: {}, cotorreos: {}, biblia: {}, insignias: {}, pruebas: {}, misiones: { fecha: '', prog: {}, cobradas: {} }, stats: { retoMejor: 0, retos: 0 }, ajustes: { sonido: false, voz: true, vozV: 2, oido: 'local' }, constancia: { fecha: null } });
const b = await chromium.launch(), errores = [];
async function abrir(ap, { ancho = 390, alto = 844, caps } = {}) {
  const ctx = await b.newContext({ viewport: { width: ancho, height: alto }, hasTouch: true }); const pg = await ctx.newPage(); pg.on('pageerror', (e) => errores.push(e.message));
  await ctx.addInitScript(() => {
    // Voz simulada: anota cada frase (texto, idioma, velocidad, momento) y «habla» un tiempo proporcional al texto.
    window.__voz = [];
    class U { constructor(t) { this.text = t; this.rate = 1; this.pitch = 1; this.lang = ''; } }
    window.SpeechSynthesisUtterance = U;
    let actual = null;
    const ss = { getVoices: () => [{ name: 'Paulina', lang: 'es-MX' }, { name: 'Juan', lang: 'es-MX' }, { name: 'Samantha', lang: 'en-US' }, { name: 'Aaron', lang: 'en-US' }], cancel() { if (actual) { clearTimeout(actual.t); const u = actual.u; actual = null; u.onend?.(); } },
      speak(u) { const reg = { texto: u.text, lang: u.lang, rate: u.rate, pitch: u.pitch, voz: u.voice?.name, ini: performance.now(), fin: null }; window.__voz.push(reg); setTimeout(() => u.onstart?.(), 5); actual = { u, t: setTimeout(() => { reg.fin = performance.now(); actual = null; u.onend?.(); }, 250 + u.text.length * 12) }; }, onvoiceschanged: null };
    Object.defineProperty(window, 'speechSynthesis', { value: ss, configurable: true });
    Object.defineProperty(navigator, 'mediaDevices', { value: undefined, configurable: true });   // sin micrófono: «ya lo dije en voz alta»
  });
  await pg.goto(B); await pg.evaluate((e) => localStorage.setItem('granma:v1', e), estado(ap, caps)); await pg.reload(); return pg;
}
const voces = (pg) => pg.evaluate(() => window.__voz);
const cap = hist.capitulos[0], palabras = hist.capitulos.flatMap((c) => [...c.palabras, ...Object.values(c.palabrasInteres).flat()]);

console.log('1) Barra: «Hablar» antes de «Biblia», cabe en 360 y 390 px');
for (const ancho of [360, 390, 1280]) {
  const pg = await abrir('en', { ancho }); await pg.waitForSelector('.nav a');
  const nav = await pg.evaluate(() => [...document.querySelectorAll('.nav a')].map((a) => { const r = a.getBoundingClientRect(), s = a.querySelector('span'); return { t: a.textContent.trim(), w: r.width, h: r.height, corta: s.scrollWidth > a.clientWidth + 1 }; }));
  const i = nav.findIndex((x) => x.t === 'Hablar');
  ok(nav.length === 7 && i === 5 && nav[6].t === 'Biblia', `${ancho}px: 7 botones y Hablar va justo antes de Biblia`);
  ok(nav.every((x) => x.w >= 44 && x.h >= 44 && !x.corta), `${ancho}px: cada botón mide ≥ 44 px y su texto no se corta (${nav.map((x) => Math.round(x.w)).join(', ')})`);
  ok(await pg.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `${ancho}px: sin desborde horizontal`);
  if (ancho === 390) await pg.screenshot({ path: join(CAPT, '40-nav-hablar.png') });
  await pg.context().close();
}

console.log('2) Bocina lenta 🦥 junto a cada bocina 🔊');
let pg = await abrir('en');
await pg.goto(B + '#/leccion/1'); await pg.waitForSelector('.pista-glosa'); await pg.waitForTimeout(400);
let pares = await pg.evaluate(() => { const bs = [...document.querySelectorAll('button.btn-icono')].filter((x) => x.textContent.trim() === '🔊'); return { n: bs.length, conLento: bs.filter((x) => x.nextElementSibling?.matches('[data-lento]') && x.parentElement.classList.contains('voces')).length }; });
ok(pares.n >= 3 && pares.n === pares.conLento, `relato: ${pares.n} bocinas, todas con su 🦥`);
await pg.evaluate(() => { window.__voz.length = 0; });
await pg.locator('[data-voz="0"]').click(); await pg.waitForTimeout(120); const nAntes = (await voces(pg)).length; await pg.locator('[data-voz="0"] + [data-lento]').click(); await pg.waitForTimeout(2900);
let v = await voces(pg); const normal = v[nAntes - 1], lentas = v.slice(nAntes), pals = cap.relato.en[0].split(/\s+/);
ok(normal.texto === cap.relato.en[0] && lentas.length >= 2 && lentas[0].texto === pals[0] && lentas[1].texto === pals[1], `el 🦥 la dice palabra por palabra: «${lentas[0]?.texto}», «${lentas[1]?.texto}»…`);
const hueco = lentas[1].ini - lentas[0].fin;
ok(hueco >= 1950 && hueco <= 2300, `entre palabra y palabra espera 2 s (${(hueco / 1000).toFixed(2)} s)`);
ok(Math.abs(normal.rate - 0.84) < 0.01 && lentas.every((x) => x.rate <= normal.rate * 0.28 && x.rate >= 0.2), `normal a ${normal.rate.toFixed(2)} y despacio a ${lentas[0].rate.toFixed(2)} (un poco más lento que antes, 0.26)`);
await pg.locator('[data-voz="0"]').click(); await pg.waitForTimeout(120); v = await voces(pg); const nAhora = v.length;
ok(Math.abs(v.at(-1).rate - 0.84) < 0.01, 'después del 🦥, la bocina normal vuelve a su velocidad');
await pg.waitForTimeout(2600); ok((await voces(pg)).slice(nAhora).every((x) => x.rate > 0.5), 'al tocar otra bocina, el perezoso se calla (no sigue con las palabras que faltaban)');
const z = await pg.locator('[data-voz="0"] + [data-lento]').boundingBox(); ok(z.width >= 44 && z.height >= 44, 'el 🦥 mide ≥ 44 px');
await pg.screenshot({ path: join(CAPT, '41-bocina-lenta.png') });
await pg.click('[data-accion="palabras"]'); await pg.waitForTimeout(200);
pares = await pg.evaluate(() => { const bs = [...document.querySelectorAll('button.btn-icono')].filter((x) => x.textContent.trim() === '🔊'); return { n: bs.length, conLento: bs.filter((x) => x.nextElementSibling?.matches('[data-lento]')).length, desborde: document.documentElement.scrollWidth > innerWidth }; });
ok(pares.n >= 8 && pares.n === pares.conLento && !pares.desborde, `palabras nuevas: ${pares.n} bocinas con 🦥 y sin desborde`);
await pg.screenshot({ path: join(CAPT, '42-palabras-lenta.png') });
await pg.locator('[data-vozp="0"] + [data-lento]').click(); await pg.waitForTimeout(120); v = await voces(pg);
ok(v.at(-1).texto === cap.palabras[0].en && v.at(-1).rate < 0.3, `la palabra «${cap.palabras[0].en}» se oye despacio`);

console.log('3) Parejas: la palabra en inglés suena al tocarla');
await pg.click('[data-accion="ejercicios"]');
async function avanzarHasta(tipo) {
  for (let k = 0; k < 14; k++) {
    await pg.waitForSelector('.sesion'); await pg.waitForTimeout(80);
    const t = await pg.evaluate(() => (document.querySelector('.pares') ? 'pares' : document.querySelector('.decir') ? 'di' : document.querySelector('.fichas') ? 'orden' : 'mcq'));
    if (t === tipo) return true;
    if (t === 'di') await pg.click('[data-nohablo]');
    else { if (t === 'mcq') { await pg.locator('.opcion').first().click(); } else { while (await pg.locator('[data-fichas] .ficha:not(.usada)').count()) await pg.locator('[data-fichas] .ficha:not(.usada)').first().click(); } await pg.click('[data-comprobar]'); await pg.click('[data-seguir]'); }
  }
  return false;
}
ok(await avanzarHasta('pares'), 'se llega al ejercicio de parejas');
await pg.evaluate(() => { window.__voz.length = 0; });
const izq = pg.locator('.par[data-lado="i"]').first(), palabra = await izq.textContent(); await izq.click(); await pg.waitForTimeout(120);
v = await voces(pg); ok(v.length === 1 && v[0].texto === palabra && v[0].lang.startsWith('en'), `al tocar «${palabra}» se oye en inglés`);
await pg.locator('.par[data-lado="d"]').first().click(); await pg.waitForTimeout(120); v = await voces(pg);
ok(v.length === 1, 'la palabra en español (su idioma) no se dice');
await pg.context().close();
pg = await abrir('es'); await pg.goto(B + '#/leccion/1'); await pg.waitForSelector('.pista-glosa'); await pg.click('[data-accion="palabras"]'); await pg.click('[data-accion="ejercicios"]');
ok(await avanzarHasta('pares'), 'quien aprende español también llega a las parejas');
await pg.evaluate(() => { window.__voz.length = 0; });
const izqEs = pg.locator('.par[data-lado="i"]').first(), palEs = await izqEs.textContent(); await izqEs.click(); await pg.waitForTimeout(120);
v = await voces(pg); ok(v.length === 1 && v[0].texto === palEs && v[0].lang.startsWith('es'), `quien aprende español oye «${palEs}» en español`);
await pg.context().close();

console.log('4) Entre Granma y el Abuelo pasan al menos 5 segundos');
// En el inicio hablan los dos: Granma saluda, el Abuelo da su consejo del día y Granma cuenta el cotorreo.
pg = await abrir('en'); await pg.waitForSelector('.globo.abuelo', { state: 'attached' });
await pg.waitForFunction(() => window.__voz.length >= 1 && window.__voz[0].fin);
const esperando = await pg.evaluate(() => ({ oculto: getComputedStyle(document.querySelector('.globo.abuelo')).visibility, dichas: window.__voz.length }));
ok(esperando.oculto === 'hidden' && esperando.dichas === 1, 'cuando Granma termina, el globo del Abuelo todavía no aparece ni suena');
await pg.waitForFunction(() => window.__voz.length >= 3 && window.__voz[2].fin, null, { timeout: 40000 });
const [g1, a1, g2] = await voces(pg);
ok(g1.voz === 'Paulina' && a1.voz === 'Aaron' && g2.voz === 'Samantha' && a1.rate < g1.rate && a1.pitch < g1.pitch, `hablan en orden: Granma (${g1.rate.toFixed(2)}), el Abuelo (${a1.rate.toFixed(2)}, más grave) y Granma`);
ok(a1.ini - g1.fin >= 5000 && a1.ini - g1.fin < 6500, `el Abuelo espera ${((a1.ini - g1.fin) / 1000).toFixed(1)} s después de Granma`);
ok(g2.ini - a1.fin >= 5000 && g2.ini - a1.fin < 6500, `y Granma espera ${((g2.ini - a1.fin) / 1000).toFixed(1)} s después del Abuelo`);
ok(await pg.evaluate(() => getComputedStyle(document.querySelector('.globo.abuelo')).visibility === 'visible'), 'al llegar su turno, el globo del Abuelo sí aparece');
// En el relato solo habla Granma: entre un globo y otro hay una pausa corta, sin encimarse
await pg.goto(B + '#/leccion/1'); await pg.waitForSelector('.pista-glosa'); await pg.evaluate(() => { window.__voz.length = 0; });
await pg.waitForFunction(() => window.__voz.length >= 3, null, { timeout: 40000 });
v = await voces(pg); const pausas = [v[1].ini - v[0].fin, v[2].ini - v[1].fin];
ok(pausas.every((x) => x >= 650 && x < 2000), `entre dos globos de Granma hay una pausa corta (${pausas.map((x) => Math.round(x) + ' ms').join(', ')})`);
// Al cambiar de pantalla, el globo que hablaba se calla
await pg.click('[data-accion="palabras"]'); await pg.waitForTimeout(1500); const n0 = (await voces(pg)).length; await pg.waitForTimeout(1500);
ok((await voces(pg)).length === n0, 'al pasar a otra pantalla ya no siguen hablando los globos que quedaron atrás');
await pg.context().close();

console.log('5) Sección «Aprender hablando y escuchando»');
for (const ap of ['en', 'es']) {
  pg = await abrir(ap, { caps: { 1: { hecho: true, palabras: true, estrellas: 3 } } }); const T = ap, N = ap === 'en' ? 'es' : 'en';
  await pg.goto(B + '#/hablar'); await pg.waitForSelector('.modo');
  ok((await pg.locator('h1').textContent()) === (ap === 'en' ? 'Aprender hablando y escuchando' : 'Learn by speaking and listening') && (await pg.locator('button.modo').count()) === 4 && (await pg.locator('a.modo').count()) === 3, `${ap}: portada con 4 formas de practicar y los enlaces a pláticas, frases y reglas`);
  ok(await pg.evaluate(() => document.querySelector('.nav a[aria-current="page"]')?.getAttribute('href') === '#/hablar' && document.documentElement.scrollWidth <= innerWidth), `${ap}: la barra marca la sección y no hay desborde`);
  if (ap === 'en') await pg.screenshot({ path: join(CAPT, '43-hablar-portada.png'), fullPage: true });
  for (const modo of ['elige', 'arma', 'repite']) {
    await pg.click(`.modo[data-modo="${modo}"]`);
    let hechos = 0, lentas = 0;
    for (let k = 0; k < 8; k++) {
      await pg.waitForSelector('.sesion [data-voz]'); await pg.waitForTimeout(150);
      v = await voces(pg); const dicho = v.at(-1).texto;
      const tipo = await pg.evaluate(() => (document.querySelector('.decir') ? 'di' : document.querySelector('.fichas') ? 'orden' : 'mcq'));
      if (k === 0) { ok(v.at(-1).lang.startsWith(T) && (await pg.locator('.sesion [data-voz] + [data-lento]').count()) === 1, `${ap}/${modo}: se oye solo al aparecer, en el idioma que se aprende, y trae 🦥`);
        await pg.locator('.sesion [data-lento]').click(); await pg.waitForTimeout(120); const w = await voces(pg); if (w.at(-1).texto === dicho.split(/\s+/)[0] && w.at(-1).rate < 0.3) lentas++;
        if (ap === 'en') await pg.screenshot({ path: join(CAPT, `44-hablar-${modo}.png`) }); }
      if (tipo === 'mcq') {
        const ops = await pg.locator('.opcion').allTextContents(), p = palabras.find((x) => x[T] === dicho);
        const buena = ops.includes(dicho) ? dicho : p?.[N]; if (k === 0) ok(!!buena, `${ap}/${modo}: lo que se oye está entre las opciones`);
        if (k === 0) ok(!(await pg.locator('.pregunta').textContent()).includes(dicho), `${ap}/${modo}: la palabra no se muestra, solo se oye`);
        await pg.locator('.opcion', { hasText: new RegExp(`^${buena.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`) }).first().click(); await pg.click('[data-comprobar]');
      } else if (tipo === 'orden') {
        if (k === 0) ok(!(await pg.locator('.pregunta').textContent()).includes(dicho), `${ap}/${modo}: el dictado no enseña la frase`);
        for (const w of dicho.split(/\s+/)) await pg.locator('[data-fichas] .ficha:not(.usada)', { hasText: new RegExp(`^${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`) }).first().click();
        await pg.click('[data-comprobar]');
      } else { await pg.click('[data-yadije]'); }
      if (k === 0) ok((await pg.locator('.retro.ok').count()) === 1, `${ap}/${modo}: la respuesta correcta se da por buena`);
      await pg.click('[data-seguir]'); hechos++;
    }
    await pg.waitForSelector('[data-premio]');
    ok(hechos === 8 && lentas === 1, `${ap}/${modo}: 8 ejercicios y el 🦥 repite despacio`);
    const fin = await pg.evaluate(() => ({ premio: document.querySelector('[data-premio] .l1')?.textContent, l2: document.querySelector('[data-premio] .l2')?.textContent, xp: JSON.parse(localStorage.getItem('granma:v1')).xp, vidas: document.querySelector('.chip .tortilla')?.parentElement.textContent.trim() }));
    ok(/taquitos de barbacoa|barbacoa tacos/.test(fin.premio) && /taquitos de barbacoa|barbacoa tacos/.test(fin.l2) && fin.premio !== fin.l2, `${ap}/${modo}: Granma echa la porra y regala los taquitos («${fin.premio.slice(0, 44)}…»)`);
    if (modo === 'elige' && ap === 'en') {
      // la fiesta: tortillas, y 2 o 3 que se estrellan y se quedan pegadas medio saliéndose de la pantalla
      await pg.waitForSelector('.tortillas-cap .tortilla.pegada', { state: 'attached' });
      const n = await pg.locator('.tortillas-cap .tortilla.pegada').count(); ok(n === 2 || n === 3, `se estrellan ${n} tortillas`);
      await pg.waitForTimeout(2100);
      const pegadas = await pg.evaluate(() => [...document.querySelectorAll('.tortilla.pegada')].map((t) => { const r = t.getBoundingClientRect(); return { fuera: r.left < 0 || r.right > innerWidth, visible: +getComputedStyle(t).opacity > 0.9, ancho: Math.round(r.width), props: t.getAnimations().flatMap((a) => a.effect.getKeyframes().flatMap((kf) => Object.keys(kf))).filter((p) => !['offset', 'easing', 'composite', 'computedOffset', 'opacity', 'transform'].includes(p)) }; }));
      ok(pegadas.length >= 2 && pegadas.every((t) => t.fuera && t.visible && t.ancho >= 180), `quedan pegadas y medio saliéndose de la pantalla (${pegadas.map((t) => t.ancho + ' px').join(', ')})`);
      ok(pegadas.every((t) => t.props.length === 0), 'solo se animan transform y opacity');
      await pg.screenshot({ path: join(CAPT, '45-tortillas-estrelladas.png') });
      await pg.waitForTimeout(3600); ok((await pg.locator('.tortillas-cap .tortilla').count()) === 0, 'al terminar no queda ninguna tortilla en pantalla');
      v = await voces(pg); ok(v.some((x) => /Épale|A la bio|Ándale/.test(x.texto) && /taquitos de barbacoa/.test(x.texto) && x.lang.startsWith('es')), 'Granma dice la porra y el premio en voz alta');
    }
    ok(fin.xp > 0 && fin.vidas === '10', `${ap}/${modo}: da XP y no gasta energía`);
    await pg.click('[data-portada]'); await pg.waitForSelector('.modo');
  }
  await pg.context().close();
}

console.log('6) Movimiento reducido: sin tortillas, pero con porra');
{ const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' }); const p2 = await ctx.newPage(); p2.on('pageerror', (e) => errores.push(e.message));
  await p2.goto(B); await p2.evaluate((e) => localStorage.setItem('granma:v1', e), estado('en')); await p2.reload(); await p2.waitForSelector('.nav a'); await p2.goto(B + '#/repaso'); await p2.waitForSelector('[data-ver]');
  for (let k = 0; k < 8; k++) { await p2.click('[data-ver]'); await p2.click('[data-sig]'); }
  await p2.waitForSelector('[data-premio]'); await p2.waitForTimeout(900);
  ok((await p2.locator('.tortillas-cap .tortilla').count()) === 0 && /taquitos de barbacoa/.test(await p2.locator('[data-premio] .l1').textContent()), 'el repaso termina con porra y, con movimiento reducido, nada vuela');
  await ctx.close(); }

ok(errores.length === 0, 'sin errores de JS' + (errores.length ? ': ' + errores.slice(0, 3).join(' | ') : ''));
await b.close(); srv.close(); console.log(fallas.length ? `\n✘ ${fallas.length} fallas` : '\n✔ HABLAR Y ESCUCHAR OK'); process.exit(fallas.length ? 1 : 0);
