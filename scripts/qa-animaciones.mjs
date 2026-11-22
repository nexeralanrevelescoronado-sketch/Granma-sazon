// QA de animaciones en navegador real: demo + app. Solo transform/opacity, duraciones, reduced-motion, pestaña oculta, confeti ≤ 40.
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
const PERMITIDAS = new Set(['transform', 'opacity', 'offset', 'easing', 'composite', 'computedOffset']);
const anims = (pg) => pg.evaluate(() => document.getAnimations().map((a) => ({ n: a.animationName || a.constructor.name, estado: a.playState, dur: a.effect?.getTiming().duration, it: a.effect?.getTiming().iterations, props: [...new Set(a.effect.getKeyframes().flatMap((k) => Object.keys(k)))] })));
const noPermitidas = (l) => [...new Set(l.flatMap((a) => a.props.filter((p) => !['transform', 'opacity', 'offset', 'easing', 'composite', 'computedOffset'].includes(p))))];

const browser = await chromium.launch();
const errores = [];
async function nueva(opts = {}) { const ctx = await browser.newContext({ viewport: { width: 390, height: 800 }, ...opts }); const pg = await ctx.newPage(); pg.on('pageerror', (e) => errores.push(e.message)); return pg; }

console.log('1) CSS: @keyframes solo con transform y opacity');
{ const css = readFileSync(join(RAIZ, 'assets/animaciones/animaciones.css'), 'utf8'); const bloques = [...css.matchAll(/@keyframes\s+([\w-]+)\s*\{([\s\S]*?\})\s*\}/g)];
  ok(bloques.length >= 10, `${bloques.length} @keyframes`);
  for (const [, nombre, cuerpo] of bloques) { const props = [...cuerpo.matchAll(/([a-z-]+)\s*:/g)].map((m) => m[1]).filter((p) => !['transform', 'opacity'].includes(p)); ok(!props.length, `@keyframes ${nombre} solo transform/opacity${props.length ? ' ✘ ' + props : ''}`); } }

console.log('2) Demo: reposo, reacciones y confeti');
let pg = await nueva(); await pg.goto(B + 'demo-animaciones.html'); await pg.waitForSelector('.pj-svg'); await pg.waitForTimeout(300);
ok((await pg.locator('.pj-svg').count()) === 2, 'los 2 personajes se convierten en SVG en línea');
let l = await anims(pg); const nom = l.map((a) => a.n);
ok(nom.includes('respira') && !nom.includes('parpadeo'), `reposo: respiración en loop; el parpadeo NO es un loop (${[...new Set(nom)].join(', ')})`);
ok(await pg.evaluate(() => [...document.querySelectorAll('.pj-svg')].every((s) => document.getAnimations().some((a) => a.animationName === 'respira' && a.effect.target === s))), 'la respiración corre en el <svg> raíz (compositor), no en sus hijos');
ok(l.filter((a) => ['respira', 'vapor'].includes(a.n)).every((a) => a.dur >= 3000 && a.it === Infinity), 'loops de reposo lentos (≥ 3 s)');
{ let visto = false; for (let i = 0; i < 40 && !visto; i++) { visto = (await anims(pg)).some((a) => a.dur === 170 && a.props.includes('transform')); await pg.waitForTimeout(250); } ok(visto, 'parpadeo ocasional programado (170 ms, transform) en ≤ 10 s'); }
await pg.waitForFunction(() => document.getAnimations().filter((a) => a.animationName === 'vapor').length === 3, null, { timeout: 4000 }).catch(() => {});
ok((await anims(pg)).filter((a) => a.n === 'vapor').length === 3, 'vapor: 3 hilos en loop');
ok(await pg.evaluate(() => document.getAnimations().filter((a) => a.animationName === 'vapor').every((a) => a.effect.target.tagName.toLowerCase() === 'svg' && a.effect.target.classList.contains('hilo'))), 'los hilos son capas propias (cajas CSS, no hijos del dibujo)');

for (const [btn, esperadas, durMax, que] of [['aplauso', ['palmada'], 320, 'Granma aplaude'], ['asiente', ['asiente', 'sombrero'], 320, 'Abuelo asiente con el sombrero'], ['mano', ['mano'], 460, 'Abuelo levanta la mano']]) {
  await pg.click(`[data-a="${btn}"]`); await pg.waitForTimeout(120); l = await anims(pg);
  const e = l.filter((a) => esperadas.includes(a.n)); ok(e.length >= esperadas.length && e.every((a) => a.dur >= 150 && a.dur <= durMax * 1.5), `${que}: ${e.map((a) => a.n + ' ' + a.dur + 'ms×' + a.it).join(', ')}`);
  ok(!noPermitidas(l).length, `${que}: solo transform/opacity`); await pg.waitForTimeout(800); }
await pg.click('[data-a="estados"]'); await pg.waitForTimeout(60);
ok((await pg.locator('.pj-svg.encima').count()) === 2, 'cambio de cara: el nuevo estado entra encima con fundido'); l = await anims(pg);
ok(l.some((a) => a.props.includes('opacity') && a.dur === 180), 'fundido de 180 ms'); await pg.waitForTimeout(400);
ok((await pg.locator('.pj-svg').count()) === 2 && (await pg.locator('.pj-svg.encima').count()) === 0, 'tras el fundido queda un solo SVG por personaje');
await pg.click('[data-a="confeti"]'); await pg.waitForTimeout(100); const n = await pg.locator('.confeti-cap i').count(); ok(n > 0 && n <= 40, `confeti: ${n} partículas (máx. 40)`);
l = await anims(pg); ok(!noPermitidas(l).length && l.filter((a) => a.props.includes('opacity') && a.dur >= 520 && a.dur <= 600).length >= 30, 'confeti: transform/opacity, 520–580 ms');
await pg.waitForTimeout(800); ok((await pg.locator('.confeti-cap i').count()) === 0, 'confeti se limpia solo');
await pg.click('[data-a="pierde"]'); await pg.waitForTimeout(100); l = await anims(pg); const t = l.find((a) => a.dur === 520);
ok(t && !noPermitidas([t]).length, 'tortillita: se desinfla y cae (520 ms, transform/opacity)'); await pg.waitForTimeout(800); ok((await pg.locator('#fila-tortillas .vacia').count()) === 1, 'queda una tortillita vacía');
await pg.click('[data-a="habla-granma"]'); await pg.waitForTimeout(80);
const alto0 = await pg.locator('.dialogo .globo').evaluate((g) => Math.round(g.getBoundingClientRect().height)); await pg.waitForTimeout(450);
ok((await pg.locator('.dialogo .pj-svg[data-estado="hablando"]').count()) === 1, 'Granma pasa al estado «hablando» al escribir'); 
const rev = await pg.evaluate(() => [document.querySelectorAll('.dialogo .globo .t.on').length, document.querySelectorAll('.dialogo .globo .t').length]); ok(rev[0] > 0 && rev[0] < rev[1], `el texto se está escribiendo (${rev[0]} de ${rev[1]} letras reveladas, solo opacity)`);
l = await anims(pg); ok(l.some((a) => a.n === 'boca-ma') && l.some((a) => a.n === 'boca-mb'), 'boca alterna cerrada/abierta (boca-ma / boca-mb)');
await pg.waitForTimeout(3500); const alto1 = await pg.locator('.dialogo .globo').evaluate((g) => Math.round(g.getBoundingClientRect().height)); ok(alto0 === alto1, `el globo no cambia de tamaño al escribirse (${alto0}px → ${alto1}px): sin reflujo`);
ok((await pg.locator('.dialogo .pj-svg[data-estado="contenta"]').count()) === 1, 'al terminar vuelve a «contenta»'); ok(await pg.evaluate(() => !document.getAnimations().some((a) => /boca/.test(a.animationName || '') && a.effect.target.closest('.dialogo'))), 'la boca del globo deja de moverse');
await pg.click('[data-a="habla-abuelo"]'); await pg.waitForTimeout(700); l = await anims(pg);
ok(l.some((a) => a.n === 'mano') && (await pg.locator('.dialogo .pj-svg.habla').count()) === 1, 'Abuelo da consejo: levanta la mano y la boca alterna');
console.log('3) Pestaña oculta pausa todo');
await pg.click('[data-a="oculta"]'); await pg.waitForTimeout(200); l = await anims(pg);
ok(l.length > 0 && l.every((a) => a.estado !== 'running'), `con la pestaña oculta ${l.length} animaciones en pausa, 0 corriendo`);
ok((await pg.evaluate(async () => (await import('./assets/animaciones/index.js')).confeti(40))) === 0, 'con la pestaña oculta no arranca confeti nuevo');
await pg.click('[data-a="pierde"]'); await pg.waitForTimeout(100); ok(!(await anims(pg)).some((a) => a.dur === 520 && a.estado === 'running'), 'con la pestaña oculta la tortillita cambia al instante, sin animar');
await pg.waitForTimeout(3200); l = await anims(pg); ok(l.some((a) => a.estado === 'running'), 'al volver se reanudan');
await pg.context().close();

console.log('4) prefers-reduced-motion: sin movimiento, estados instantáneos');
pg = await nueva({ reducedMotion: 'reduce' }); await pg.goto(B + 'demo-animaciones.html'); await pg.waitForSelector('.pj-svg'); await pg.waitForTimeout(300);
l = await anims(pg); ok(l.filter((a) => a.estado === 'running').length === 0, 'reposo sin animaciones corriendo');
for (const b of ['aplauso', 'asiente', 'mano']) { await pg.click(`[data-a="${b}"]`); await pg.waitForTimeout(100); }
ok((await anims(pg)).filter((a) => a.estado === 'running').length === 0, 'las reacciones no mueven nada');
ok((await pg.locator('#escena .pj-svg[data-estado="aplaudiendo"]').count()) === 1 && (await pg.locator('#escena .pj-svg[data-estado="aconsejando"]').count()) === 1, 'pero el estado sí cambia (Granma aplaudiendo, Abuelo aconsejando)');
await pg.click('[data-a="estados"]'); await pg.waitForTimeout(50); ok((await pg.locator('.pj-svg.encima').count()) === 0, 'cambio de cara instantáneo (sin fundido)');
await pg.click('[data-a="confeti"]'); ok((await pg.locator('.confeti-cap i').count()) === 0, 'sin confeti');
await pg.click('[data-a="pierde"]'); await pg.waitForTimeout(50); ok((await pg.locator('#fila-tortillas .vacia').count()) === 1 && (await anims(pg)).filter((a) => a.estado === 'running').length === 0, 'tortillita: cambio instantáneo a vacía');
await pg.click('[data-a="habla-granma"]'); await pg.waitForTimeout(300); ok((await pg.locator('.dialogo .globo p').innerText()).length > 80 && (await pg.locator('.dialogo .globo .t').count()) === 0, 'texto completo al instante (sin escritura ni spans)');
await pg.context().close();

console.log('5) En la app: acierto → reacción; error → tortillita cae; fin de lección → confeti ≤ 40');
pg = await nueva(); const hist = JSON.parse(readFileSync(join(RAIZ, 'data/historia.json'))); const propias = Object.values(hist.capitulos[0].palabrasInteres).flat(); const pal = [...hist.capitulos[0].palabras, ...propias];
await pg.goto(B); await pg.evaluate(() => localStorage.setItem('granma:v1', JSON.stringify({ v: 1, perfil: { aprende: 'en', interes: 'trabajo', cocina: 'mexicana', nombre: 'Ana', listo: true }, xp: 0, racha: { n: 0, ultimo: null }, vidas: { n: 5, t: Date.now() }, caps: {}, recetas: {}, consejos: {}, cotorreos: {}, biblia: {}, insignias: {}, misiones: { fecha: '', prog: {}, cobradas: {} }, stats: { retoMejor: 0, retos: 0 }, ajustes: { sonido: false, voz: false }, constancia: { fecha: null } }))); await pg.reload();
await pg.goto(B + '#/leccion/1'); await pg.waitForSelector('[data-accion="palabras"]'); await pg.click('[data-accion="palabras"]'); await pg.click('[data-accion="ejercicios"]'); await pg.waitForSelector('.opcion');
const preg = await pg.locator('.pregunta').innerText(); const w = preg.match(/«(.+?)»/)[1]; const correcta = pal.find((p) => p.en === w).es;
const malas = pal.filter((p) => p.es !== correcta).map((p) => p.es); 
let incorrecta = null; for (const m of malas) if (await pg.locator(`.opcion[data-op="${m}"]`).count()) { incorrecta = m; break; }
await pg.click(`.opcion[data-op="${incorrecta}"]`); await pg.click('[data-comprobar]'); await pg.waitForTimeout(150); l = await anims(pg);
ok(l.some((a) => a.dur === 520 && a.props.includes('transform')), 'error: la tortillita se desinfla y cae'); await pg.waitForTimeout(700); ok((await pg.locator('.vidas .tortilla.vacia').count()) === 1, 'la tortillita queda vacía');
await pg.click('[data-seguir]'); await pg.waitForSelector('.opcion,.ficha,.par,[data-nohablo]');
// ahora un acierto: primer ejercicio repetido o el siguiente; resolvemos lo que toque con datos conocidos
const ejs = [...Object.values(hist.capitulos[0].ejemplos).flat(), ...propias.map((p) => ({ en: p.f.en, es: p.f.es, we: p.en, ws: p.es }))];
async function resolverUno() {
  if (await pg.locator('[data-pares]').count()) { const izq = await pg.locator('[data-lado="i"]').evaluateAll((b) => b.map((x) => x.dataset.v)); for (const a of izq) { const p = pal.find((x) => x.en === a); await pg.click(`[data-lado="i"][data-v="${a}"]`); await pg.click(`[data-lado="d"][data-v="${p.es}"]`); } return; }
  if (await pg.locator('[data-nohablo]').count()) { await pg.click('[data-nohablo]'); await pg.waitForTimeout(150); return resolverUno(); }
  if (await pg.locator('.armado.letras').count()) { const w = (await pg.locator('.pregunta').innerText()).match(/«(.+?)»/)[1], p = pal.find((x) => x.es === w); for (const l of [...p.en]) await pg.locator('[data-ficha]:not(.usada)').filter({ hasText: new RegExp(`^${l}$`) }).first().click(); await pg.click('[data-comprobar]'); return; }
  if (await pg.locator('[data-armado]').count()) { const ay = await pg.locator('.pregunta small').textContent(); const e = ejs.find((x) => x.es === ay); for (const pa of e.en.split(/\s+/)) await pg.locator('[data-ficha]:not(.usada)').filter({ hasText: new RegExp(`^${pa.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`) }).first().click(); await pg.click('[data-comprobar]'); return; }
  const q = await pg.locator('.pregunta').innerText(); let c; const m = q.match(/«(.+?)»/);
  if (m && /significa/.test(q)) c = pal.find((p) => p.en === m[1]).es; else if (q.includes('_____')) { const ay = await pg.locator('.pregunta small').textContent(); const e = ejs.find((x) => x.es === ay); c = pal.find((p) => p.en.toLowerCase() === e.we.toLowerCase()).en; } else { const fr = q.split('\n')[1].trim(); c = ejs.find((x) => x.en === fr).es; }
  await pg.click(`.opcion[data-op="${c.replace(/"/g, '\\"')}"]`); await pg.click('[data-comprobar]'); }
await resolverUno(); await pg.waitForSelector('.retro.ok'); await pg.waitForTimeout(250); l = await anims(pg);
const quien = await pg.locator('.retro .pj-svg').getAttribute('data-estado'); ok(['aplaudiendo', 'asintiendo'].includes(quien), `acierto: reacciona ${quien}`);
ok(l.some((a) => ['palmada', 'asiente'].includes(a.n)), 'acierto: aplauso de Granma o asentimiento del Abuelo en marcha');
for (let i = 0; i < 8; i++) { await pg.click('[data-seguir]'); await pg.waitForTimeout(120); if (await pg.locator('h1:has-text("consejo del Abuelo")').count()) break; await resolverUno(); await pg.waitForSelector('.retro.ok,.retro.mal'); }
await pg.waitForSelector('[data-accion="fin"]'); await pg.waitForTimeout(1500); 
const abuelo = await pg.locator('.dialogo .pj-svg').first().getAttribute('data-estado'); ok(['aconsejando', 'hablando'].includes(abuelo), `consejo del Abuelo en estado «${abuelo}»`);
await pg.click('[data-accion="fin"]'); await pg.waitForTimeout(120); const nc = await pg.locator('.confeti-cap i').count(); ok(nc > 0 && nc <= 40, `fin de lección: confeti ${nc} partículas (máx. 40)`);
await pg.context().close();
ok(errores.length === 0, 'sin errores de JS' + (errores.length ? ': ' + errores.slice(0, 3).join(' | ') : ''));
await browser.close(); srv.close(); console.log(fallas.length ? `\n✘ ${fallas.length} fallas` : '\n✔ TODAS LAS ANIMACIONES OK'); process.exit(fallas.length ? 1 : 0);
