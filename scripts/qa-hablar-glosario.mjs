// QA en navegador: glosario al toque, ejercicios de voz (reconoce / se graba / se salta) y racha.
// Uso: node scripts/qa-hablar-glosario.mjs   (el reconocimiento de voz se simula: el navegador de pruebas no tiene micrófono)
import { createRequire } from 'node:module'; const { chromium } = createRequire('/opt/node-tools/x.js')('playwright');
import { createServer } from 'node:http'; import { readFileSync, existsSync, statSync, mkdirSync } from 'node:fs'; import { join, extname, dirname } from 'node:path'; import { fileURLToPath } from 'node:url';
const R = join(dirname(fileURLToPath(import.meta.url)), '..'), CAPT = join(R, '.qa'); mkdirSync(CAPT, { recursive: true });
const TIPOS = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png' };
const srv = createServer((q, s) => { let p = new URL(q.url, 'http://x').pathname; if (p.endsWith('/')) p += 'index.html'; const f = join(R, p); if (!existsSync(f) || statSync(f).isDirectory()) { s.writeHead(404); return s.end(); } s.writeHead(200, { 'Content-Type': TIPOS[extname(f)] || 'application/octet-stream' }); s.end(readFileSync(f)); }).listen(0);
const B = `http://localhost:${srv.address().port}/`, fallas = [], ok = (c, t) => { console.log(`  ${c ? '✔' : '✘'} ${t}`); if (!c) fallas.push(t); };
const estado = (ap) => JSON.stringify({ v: 1, perfil: { aprende: ap, interes: 'cocina', cocina: 'mexicana', nombre: 'Ana', listo: true }, xp: 0, racha: { n: 0, ultimo: null }, caps: {}, recetas: {}, consejos: {}, cotorreos: {}, biblia: {}, insignias: {}, misiones: { fecha: '', prog: {}, cobradas: {} }, stats: { retoMejor: 0, retos: 0 }, ajustes: { sonido: false, voz: false, vozV: 2 }, constancia: { fecha: null } });
const hist = JSON.parse(readFileSync(join(R, 'data/historia.json'), 'utf8')), glos = JSON.parse(readFileSync(join(R, 'data/glosario.json'), 'utf8'));
const b = await chromium.launch(), errores = [];
async function abrir(ap, simula) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true }); const pg = await ctx.newPage(); pg.on('pageerror', (e) => errores.push(e.message));
  await ctx.addInitScript((modo) => {
    window.__dice = null;
    if (modo === 'reco') window.SpeechRecognition = window.webkitSpeechRecognition = function () { this.start = () => { setTimeout(() => this.onstart?.(), 10); setTimeout(() => { const t = window.__dice; if (t == null) this.onerror?.({ error: 'no-speech' }); else if (t === '#red') this.onerror?.({ error: 'network' }); else this.onresult?.({ results: [[{ transcript: t }]] }); }, 60); }; this.stop = this.abort = () => {}; };
    else { delete window.SpeechRecognition; delete window.webkitSpeechRecognition; }
    if (modo === 'nada') Object.defineProperty(navigator, 'mediaDevices', { value: undefined, configurable: true });
  }, simula);
  await pg.goto(B); await pg.evaluate((e) => localStorage.setItem('granma:v1', e), estado(ap)); await pg.reload(); return pg;
}

console.log('1) Glosario al toque');
let pg = await abrir('en', 'reco');
await pg.goto(B + '#/leccion/1'); await pg.waitForSelector('.pista-glosa'); await pg.waitForTimeout(2600);
const caja = await pg.evaluate(() => { const el = document.querySelector('.globo .l1'), w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT); let n; const r = document.createRange(); while ((n = w.nextNode())) { const i = n.data.search(/[A-Za-z]{4,}/); if (i >= 0) { r.setStart(n, i); r.setEnd(n, i + 1); const c = r.getBoundingClientRect(); return { x: c.left + c.width / 2, y: c.top + c.height / 2, texto: el.textContent }; } } });
await pg.touchscreen.tap(caja.x, caja.y); await pg.waitForSelector('.glosa');
const tocada = await pg.locator('.glosa strong').textContent(), sig = await pg.locator('.glosa span').textContent();
ok(caja.texto.includes(tocada) && glos.en[tocada.toLowerCase()] === sig, `al tocar «${tocada}» sale «${sig}»`);
const g = await pg.locator('.glosa').boundingBox(); ok(g.x >= 0 && g.x + g.width <= 390 && g.y >= 0, 'la burbuja cabe en la pantalla (390 px)');
await pg.screenshot({ path: join(CAPT, '20-glosario.png') });
const l2 = await pg.locator('.globo .l2').first().boundingBox(); await pg.touchscreen.tap(l2.x + 30, l2.y + 8); await pg.waitForTimeout(150);
ok((await pg.locator('.glosa').count()) === 0, 'tocar el texto en español (su idioma) no abre glosa y cierra la anterior');
ok((await pg.evaluate(() => JSON.parse(localStorage.getItem('granma:v1')).cuaderno?.length)) === 1, 'la palabra queda en «Mi cuaderno»');
await pg.goto(B + '#/perfil'); await pg.waitForSelector('.cuaderno li'); ok((await pg.locator('.cuaderno li').count()) === 1, 'el perfil muestra el cuaderno');

console.log('2) Dilo en voz alta: el navegador reconoce la voz');
await pg.goto(B + '#/leccion/1'); await pg.click('[data-accion="palabras"]'); await pg.click('[data-accion="ejercicios"]');
const cap = hist.capitulos[0], pal = [...cap.palabras, ...Object.values(cap.palabrasInteres).flat()], ejs = [...Object.values(cap.ejemplos).flat(), ...Object.values(cap.palabrasInteres).flat().map((p) => ({ en: p.f.en, es: p.f.es, we: p.en }))];
async function resolver(p, alHablar) {
  if (await p.locator('[data-micro]').count()) return alHablar();
  if (await p.locator('[data-pares]').count()) { for (const a of await p.locator('[data-lado="i"]').evaluateAll((x) => x.map((y) => y.dataset.v))) { await p.click(`[data-lado="i"][data-v="${a}"]`); await p.click(`[data-lado="d"][data-v="${pal.find((x) => x.en === a).es}"]`); } return; }
  if (await p.locator('.armado.letras').count()) { const w = (await p.locator('.pregunta').innerText()).match(/«(.+?)»/)[1]; for (const l of [...pal.find((x) => x.es === w).en]) await p.locator('[data-ficha]:not(.usada)').filter({ hasText: new RegExp(`^${l}$`) }).first().click(); return p.click('[data-comprobar]'); }
  if (await p.locator('[data-armado]').count()) { const ay = await p.locator('.pregunta small').textContent(); for (const pa of ejs.find((x) => x.es === ay).en.split(/\s+/)) await p.locator('[data-ficha]:not(.usada)').filter({ hasText: new RegExp(`^${pa.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`) }).first().click(); return p.click('[data-comprobar]'); }
  const q = await p.locator('.pregunta').innerText(); let c; const m = q.match(/«(.+?)»/);
  if (m && /significa/.test(q)) c = pal.find((x) => x.en === m[1]).es; else if (q.includes('_____')) { const ay = await p.locator('.pregunta small').textContent(); c = pal.find((x) => x.en.toLowerCase() === ejs.find((y) => y.es === ay).we.toLowerCase()).en; } else c = ejs.find((x) => x.en === q.split('\n')[1].trim()).es;
  await p.click(`.opcion[data-op="${c.replace(/"/g, '\\"')}"]`); await p.click('[data-comprobar]');
}
let hablados = 0, vidasAntes;
for (let i = 0; i < 40; i++) {
  await pg.waitForTimeout(140);
  if (await pg.locator('h1:has-text("consejo del Abuelo")').count()) break;
  if (await pg.locator('[data-seguir]').count()) { await pg.click('[data-seguir]'); continue; }
  await resolver(pg, async () => {
    const frase = await pg.locator('.decir').textContent(); hablados++;
    if (hablados === 1) {
      vidasAntes = await pg.locator('.vidas .tortilla:not(.vacia)').count();
      await pg.screenshot({ path: join(CAPT, '21-dilo.png') });
      await pg.evaluate(() => { window.__dice = 'banana telephone'; }); await pg.click('[data-micro]'); await pg.waitForTimeout(600); await pg.waitForFunction(() => /Escuché/.test(document.querySelector('[data-oido]').textContent));
      ok((await pg.locator('.retro.ok,.retro.mal').count()) === 0 && (await pg.locator('.vidas .tortilla:not(.vacia)').count()) === vidasAntes, 'si no se parece, pide otra vez y NO quita energía');
      ok(/banana telephone/.test(await pg.locator('[data-oido]').textContent()), 'dice lo que escuchó para que la persona se corrija');
    }
    await pg.evaluate((f) => { window.__dice = f.toLowerCase().replace(/[.,!?]/g, ''); }, frase); await pg.click('[data-micro]'); await pg.waitForSelector('.retro.ok');
  });
}
ok(hablados === 2, `la lección trae 2 ejercicios de decir en voz alta (${hablados})`);
await pg.waitForSelector('h1:has-text("consejo del Abuelo")'); await pg.click('[data-accion="fin"]'); await pg.waitForSelector('.estrellas');
const fin = await pg.locator('.centro').innerText(); ok(/⭐⭐⭐/.test(fin) && /Mejor racha/.test(fin), 'sin errores: 3 estrellas y mejor racha en el cierre');
await pg.screenshot({ path: join(CAPT, '22-fin-estrellas.png') });
await pg.context().close();

console.log('3) Sin reconocimiento de voz ni micrófono: la persona lo dice y sigue');
pg = await abrir('en', 'nada');
await pg.goto(B + '#/leccion/1'); await pg.click('[data-accion="palabras"]'); await pg.click('[data-accion="ejercicios"]');
for (let i = 0; i < 20; i++) { await pg.waitForTimeout(140); if (await pg.locator('[data-seguir]').count()) { await pg.click('[data-seguir]'); continue; } if (await pg.locator('[data-nohablo]').count()) break; await resolver(pg, async () => {}); }
ok((await pg.locator('[data-yadije]').count()) === 1 && !(await pg.locator('[data-micro]').isVisible()), 'aparece «Ya lo dije en voz alta» y no hay micrófono');
const barra0 = await pg.locator('.barra').getAttribute('aria-valuemax');
await pg.click('[data-nohablo]'); await pg.waitForTimeout(200);
ok((await pg.locator('[data-nohablo]').count()) === 0 && +(await pg.locator('.barra').getAttribute('aria-valuemax')) === +barra0 - 2, '«Ahora no puedo hablar» quita los 2 de voz sin castigo y la lección sigue');
await pg.context().close();

console.log('4) Sin internet para reconocer: pasa a grabarse (o a decirlo)');
pg = await abrir('en', 'reco');
await pg.goto(B + '#/leccion/1'); await pg.click('[data-accion="palabras"]'); await pg.click('[data-accion="ejercicios"]');
for (let i = 0; i < 20; i++) { await pg.waitForTimeout(140); if (await pg.locator('[data-seguir]').count()) { await pg.click('[data-seguir]'); continue; } if (await pg.locator('[data-nohablo]').count()) break; await resolver(pg, async () => {}); }
await pg.evaluate(() => { window.__dice = '#red'; }); await pg.click('[data-micro]'); await pg.waitForFunction(() => /Sin internet/.test(document.querySelector('[data-oido]').textContent));
ok(true, 'avisa que sin internet no puede oír y ofrece la otra forma');
await pg.context().close();

ok(errores.length === 0, 'sin errores de JS' + (errores.length ? ': ' + errores.slice(0, 3).join(' | ') : ''));
await b.close(); srv.close(); console.log(fallas.length ? `\n✘ ${fallas.length} fallas` : '\n✔ GLOSARIO Y VOZ OK'); process.exit(fallas.length ? 1 : 0);
