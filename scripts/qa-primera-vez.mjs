// QA: la app tiene que abrir de primera vez incluso en navegadores a los que les faltan funciones
// (iPhone dentro de WhatsApp/Instagram, modo privado, iOS antiguos). Si se queda en la pantalla de carga, falla.
// Uso: node scripts/qa-primera-vez.mjs
import { createRequire } from 'node:module'; const { chromium } = createRequire('/opt/node-tools/x.js')('playwright');
import { createServer } from 'node:http'; import { readFileSync, existsSync, statSync } from 'node:fs'; import { join, extname, dirname } from 'node:path'; import { fileURLToPath } from 'node:url';
const R = join(dirname(fileURLToPath(import.meta.url)), '..');
const TIPOS = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
const srv = createServer((q, s) => { let p = new URL(q.url, 'http://x').pathname; if (p.endsWith('/')) p += 'index.html'; const f = join(R, p); if (!existsSync(f) || statSync(f).isDirectory()) { s.writeHead(404); return s.end(); } s.writeHead(200, { 'Content-Type': TIPOS[extname(f)] || 'application/octet-stream' }); s.end(readFileSync(f)); }).listen(0);
const B = `http://localhost:${srv.address().port}/`, fallas = [];
const quita = (cuerpo) => `(() => { const q = (o, k) => { try { delete o[k]; } catch {} try { Object.defineProperty(o, k, { value: undefined, configurable: true }); } catch {} }; ${cuerpo} })();`;
const ENTORNOS = {
  'normal': '',
  'sin Notification, voz, caché, SW ni micrófono (WhatsApp / Instagram en iPhone)': quita("q(window,'Notification');q(window,'speechSynthesis');q(window,'SpeechSynthesisUtterance');q(window,'caches');q(navigator,'serviceWorker');q(navigator,'mediaDevices');q(window,'MediaRecorder');q(window,'webkitSpeechRecognition');q(window,'SpeechRecognition');"),
  'sin AudioContext ni vibración': quita("q(window,'AudioContext');q(window,'webkitAudioContext');q(navigator,'vibrate');q(window,'IntersectionObserver');"),
  'localStorage que falla (modo privado)': "Object.defineProperty(window,'localStorage',{get(){throw new DOMException('denegado','SecurityError')},configurable:true});",
  'sin Web Animations ni Highlight ni CSS.highlights': quita("q(Element.prototype,'animate');q(window,'Highlight');try{q(CSS,'highlights')}catch{};q(document,'caretPositionFromPoint');q(document,'caretRangeFromPoint');"),
  'sin matchMedia': quita("q(window,'matchMedia');"),
  'sin BroadcastChannel/structuredClone/fetch Range': quita("q(window,'BroadcastChannel');q(window,'structuredClone');q(window,'ResizeObserver');"),
};
const b = await chromium.launch();
for (const [nombre, init] of Object.entries(ENTORNOS)) {
  for (const sesion of ['primera vez', 'con perfil']) {
    const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, hasTouch: true }); const pg = await ctx.newPage(); const errs = [];
    pg.on('pageerror', (e) => errs.push(e.message)); pg.on('console', (m) => { if (m.type() === 'error') errs.push('consola: ' + m.text().slice(0, 120)); });
    if (init) await ctx.addInitScript(init);
    if (sesion === 'con perfil') await ctx.addInitScript(() => { try { localStorage.setItem('granma:v1', JSON.stringify({ v: 1, perfil: { aprende: 'en', interes: 'cocina', cocina: 'mexicana', nombre: 'Ana', listo: true, legal: '2026-11-28' }, xp: 5, racha: { n: 1, ultimo: null }, caps: {}, recetas: {}, consejos: {}, cotorreos: {}, biblia: {}, insignias: {}, misiones: { fecha: '', prog: {}, cobradas: {} }, stats: { retoMejor: 0, retos: 0 }, ajustes: { sonido: true, voz: true, vozV: 2 }, constancia: { fecha: null } })); } catch {} });
    await pg.goto(B);
    const abrio = await pg.waitForFunction(() => !document.querySelector('.arranque') && document.querySelector('main h1, main .tarjeta, main button'), null, { timeout: 8000 }).then(() => true).catch(() => false);
    console.log(`${abrio ? '✔' : '✘'} ${nombre} · ${sesion}${abrio ? '' : '  ← SE QUEDA CARGANDO'}${!abrio && errs.length ? '\n      ' + [...new Set(errs)].slice(0, 3).join('\n      ') : ''}`);
    if (!abrio) fallas.push(`${nombre} · ${sesion}`);
    await ctx.close();
  }
}

// ---- Cuando algo SÍ falla, nunca se queda cargando sin salida ----
async function conFalla(nombre, hacerFallar, esperado) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const pg = await ctx.newPage(); let veces = 0;
  await ctx.route('**/js/glosario.js', (r) => (hacerFallar(++veces) ? r.abort() : r.continue()));
  const t0 = Date.now(); await pg.goto(B);
  const r = await pg.waitForFunction(() => (!document.querySelector('.arranque') && document.querySelector('main h1, main button')) ? (document.querySelector('#granma-reintentar') ? 'mensaje' : 'abrio') : null, null, { timeout: 40000 }).then((h) => h.jsonValue()).catch(() => 'colgada');
  const detalle = r === 'mensaje' ? await pg.locator('details').textContent() : '';
  const bien = r === esperado && (esperado !== 'mensaje' || /glosario\.js/.test(detalle));
  console.log(`${bien ? '✔' : '✘'} ${nombre}: ${r} en ${((Date.now() - t0) / 1000).toFixed(0)} s${detalle ? ' · ' + detalle.replace(/\s+/g, ' ').slice(-170) : ''}`); if (!bien) fallas.push(nombre);
  await ctx.close();
}
{ // con el service worker ya instalado, la red se queda colgada al pedir la página: no puede quedar en blanco
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 } }); const pg = await ctx.newPage();
  await pg.goto(B); await pg.waitForFunction(() => navigator.serviceWorker?.controller, null, { timeout: 30000 }).catch(() => {});
  const controlado = await pg.evaluate(() => !!navigator.serviceWorker.controller);
  await ctx.route((u) => u.pathname === '/' || u.pathname.endsWith('/index.html'), () => {});   // nunca contesta
  const t0 = Date.now(); await pg.reload({ waitUntil: 'commit', timeout: 30000 }).catch(() => {});
  const abrio = await pg.waitForFunction(() => window.__granmaListo === true, null, { timeout: 20000 }).then(() => true).catch(() => false);
  const ok = controlado && abrio && Date.now() - t0 < 15000;
  console.log(`${ok ? '✔' : '✘'} red colgada al pedir la página con service worker instalado: ${abrio ? 'abrió desde la copia en ' + ((Date.now() - t0) / 1000).toFixed(1) + ' s' : 'NO abrió'}${controlado ? '' : ' (el service worker no tomó el control)'}`);
  if (!ok) fallas.push('red colgada'); await ctx.close();
}
await conFalla('un archivo no carga la primera vez: se repara solo', (n) => n === 1, 'abrio');
await conFalla('un archivo no carga nunca: mensaje claro con el motivo', () => true, 'mensaje');
await b.close(); srv.close(); console.log(fallas.length ? `\n✘ ${fallas.length} entornos donde se queda cargando` : '\n✔ ABRE EN TODOS LOS ENTORNOS'); process.exit(fallas.length ? 1 : 0);
