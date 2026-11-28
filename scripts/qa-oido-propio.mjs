// QA en navegador del «Oído de Granma» (reconocimiento dentro del teléfono) y de la fiesta de tortillas.
// La voz entra por el micrófono simulado del navegador desde un archivo creado con espeak-ng (voz sintética).
// Uso: node scripts/qa-oido-propio.mjs     (sin espeak-ng instalado, se salta lo que necesita voz)
import { createRequire } from 'node:module'; const { chromium } = createRequire('/opt/node-tools/x.js')('playwright');
import { createServer } from 'node:http'; import { readFileSync, existsSync, statSync, mkdirSync, mkdtempSync } from 'node:fs'; import { join, extname, dirname } from 'node:path'; import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process'; import { tmpdir } from 'node:os';
const R = join(dirname(fileURLToPath(import.meta.url)), '..'), CAPT = join(R, '.qa'); mkdirSync(CAPT, { recursive: true });
const TIPOS = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.gz': 'application/gzip', '.webmanifest': 'application/manifest+json' };
const srv = createServer((q, s) => { let p = new URL(q.url, 'http://x').pathname; if (p.endsWith('/')) p += 'index.html'; const f = join(R, p); if (!existsSync(f) || statSync(f).isDirectory()) { s.writeHead(404); return s.end(); } s.writeHead(200, { 'Content-Type': TIPOS[extname(f)] || 'application/octet-stream' }); s.end(readFileSync(f)); }).listen(0);
const B = `http://localhost:${srv.address().port}/`, fallas = [], ok = (c, t) => { console.log(`  ${c ? '✔' : '✘'} ${t}`); if (!c) fallas.push(t); };
const TMP = mkdtempSync(join(tmpdir(), 'oido-')), hayVoz = spawnSync('espeak-ng', ['--version']).status === 0;
const wav = (nombre, texto, voz = 'en-us') => { const f = join(TMP, nombre); spawnSync('espeak-ng', ['-v', voz, '-s', '135', '-w', f, texto]); return f; };
const estado = JSON.stringify({ v: 1, perfil: { aprende: 'en', interes: 'cocina', cocina: 'mexicana', nombre: 'Ana', listo: true, legal: '2026-11-28' }, xp: 0, racha: { n: 0, ultimo: null }, caps: {}, recetas: {}, consejos: {}, cotorreos: {}, biblia: {}, insignias: {}, misiones: { fecha: '', prog: {}, cobradas: {} }, stats: { retoMejor: 0, retos: 0 }, ajustes: { sonido: false, voz: false, vozV: 2, oido: 'local' }, constancia: { fecha: null } });
const errores = [];
async function abrir(audio) {
  const b = await chromium.launch({ args: ['--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream', ...(audio ? [`--use-file-for-fake-audio-capture=${audio}%noloop`] : [])] });
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, permissions: ['microphone'] }); const pg = await ctx.newPage(); pg.on('pageerror', (e) => errores.push(e.message));
  await ctx.addInitScript(() => { let s = 7; Math.random = () => (s = (s * 16807) % 2147483647) / 2147483647; window.__semilla = () => { s = 7; }; });      // mismo orden de ejercicios en cada corrida
  await pg.goto(B); await pg.evaluate((e) => localStorage.setItem('granma:v1', e), estado); await pg.reload(); await pg.waitForFunction(() => navigator.serviceWorker?.controller, null, { timeout: 20000 }).catch(() => {});
  return { b, pg };
}
const bajarOido = async (pg, l = 'en') => { await pg.goto(B + '#/descargas'); await pg.click(`[data-bajar="oido-${l}"]`); await pg.waitForSelector(`#pq-oido-${l} .estado-ok`, { timeout: 90000 }); };
const hist = JSON.parse(readFileSync(join(R, 'data/historia.json'), 'utf8')), cap = hist.capitulos[0], pal = [...cap.palabras, ...Object.values(cap.palabrasInteres).flat()], ejs = [...Object.values(cap.ejemplos).flat(), ...Object.values(cap.palabrasInteres).flat().map((p) => ({ en: p.f.en, es: p.f.es, we: p.en }))];
async function resolver(p) {
  if (await p.locator('[data-pares]').count()) { for (const a of await p.locator('[data-lado="i"]').evaluateAll((x) => x.map((y) => y.dataset.v))) { await p.click(`[data-lado="i"][data-v="${a}"]`); await p.click(`[data-lado="d"][data-v="${pal.find((x) => x.en === a).es}"]`); } return; }
  if (await p.locator('.armado.letras').count()) { const w = (await p.locator('.pregunta').innerText()).match(/«(.+?)»/)[1]; for (const l of [...pal.find((x) => x.es === w).en]) await p.locator('[data-ficha]:not(.usada)').filter({ hasText: new RegExp(`^${l}$`) }).first().click(); return p.click('[data-comprobar]'); }
  if (await p.locator('[data-armado]').count()) { const ay = await p.locator('.pregunta small').textContent(); for (const pa of ejs.find((x) => x.es === ay).en.split(/\s+/)) await p.locator('[data-ficha]:not(.usada)').filter({ hasText: new RegExp(`^${pa.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`) }).first().click(); return p.click('[data-comprobar]'); }
  const q = await p.locator('.pregunta').innerText(); let c; const m = q.match(/«(.+?)»/);
  if (m && /significa/.test(q)) c = pal.find((x) => x.en === m[1]).es; else if (q.includes('_____')) { const ay = await p.locator('.pregunta small').textContent(); c = pal.find((x) => x.en.toLowerCase() === ejs.find((y) => y.es === ay).we.toLowerCase()).en; } else c = ejs.find((x) => x.en === q.split('\n')[1].trim()).es;
  await p.click(`.opcion[data-op="${c.replace(/"/g, '\\"')}"]`); await p.click('[data-comprobar]');
}
const hastaHablar = async (pg) => { await pg.goto(B + '#/leccion/1'); await pg.click('[data-accion="palabras"]'); await pg.evaluate(() => window.__semilla()); await pg.click('[data-accion="ejercicios"]'); for (let i = 0; i < 20; i++) { await pg.waitForTimeout(140); if (await pg.locator('[data-seguir]').count()) { await pg.click('[data-seguir]'); continue; } if (await pg.locator('[data-micro]').count()) return; await resolver(pg); } };

console.log('1) El paquete «Oído de Granma» se descarga y queda listo sin internet');
let { b, pg } = await abrir(hayVoz ? wav('frase.wav', 'the bread is warm') : null);
await bajarOido(pg); ok(true, 'paquete oido-en descargado (librería + modelo de inglés)');
if (hayVoz) {
  console.log('2) Reconoce palabra por palabra dentro del navegador (sin red)');
  await pg.context().setOffline(true);
  const r = await pg.evaluate(async () => { const m = await import('./js/oido-propio.js'); const vistos = []; const e = await m.escucharPropio('en', 'The bread is warm.', { alParcial: (x) => vistos.push(x.dichas) }); if (!e.ok) return e; const f = await e.fin; URL.revokeObjectURL(f.url); return { ...f, vistos: [...new Set(vistos)] }; });
  ok(r.todo === true && r.total === 4, `con la app sin internet oyó «the bread is warm» completa: ${r.dichas} de ${r.total} palabras`);
  ok((r.vistos || []).length >= 2, `fue marcando en vivo, palabra por palabra (avances: ${(r.vistos || []).join(' → ')})`);
  await pg.context().setOffline(false); await b.close();

  ({ b, pg } = await abrir(wav('otra.wav', 'hello how are you today')));
  await bajarOido(pg);
  const r2 = await pg.evaluate(async () => { const m = await import('./js/oido-propio.js'); const e = await m.escucharPropio('en', 'I love my family.'); const f = await e.fin; URL.revokeObjectURL(f.url); return f; });
  ok(r2.todo === false && r2.dichas / r2.total < 0.6, `si la persona dice otra cosa, no lo da por bueno (${r2.dichas} de ${r2.total})`);
  await b.close();

  ({ b, pg } = await abrir(wav('bed.wav', 'the bed is warm')));
  await bajarOido(pg);
  const r3 = await pg.evaluate(async () => { const m = await import('./js/oido-propio.js'); const e = await m.escucharPropio('en', 'The bread is warm.'); const f = await e.fin; URL.revokeObjectURL(f.url); return f; });
  const pan = r3.palabras.find((x) => x.w === 'bread');
  ok(pan.estado === 'casi' && pan.sono === 'bed' && r3.estrellas < 3, `pronunciación: dijo «bed» en vez de «bread» y lo notó (sonó como «${pan.sono}», ${r3.estrellas} estrellas)`);
  await b.close();

  console.log('2b) Español (para quien aprende español desde el inglés)');
  const oirEs = async (audio, frase) => { ({ b, pg } = await abrir(wav('es.wav', audio, 'es-419'))); await bajarOido(pg, 'es'); await pg.context().setOffline(true);
    const r = await pg.evaluate(async (f) => { const m = await import('./js/oido-propio.js'); const e = await m.escucharPropio('es', f); if (!e.ok) return e; const x = await e.fin; URL.revokeObjectURL(x.url); return x; }, frase); await b.close(); return r; };
  let e1 = await oirEs('buenos días abuela', 'Buenos días, abuela.'); ok(e1.todo === true && e1.pasa, `sin internet oyó «buenos días, abuela» completa: ${e1.dichas} de ${e1.total} (${e1.estrellas} estrellas) ${JSON.stringify(e1.oido)}`);
  e1 = await oirEs('la casa es grande', 'La casa es grande.'); ok(e1.pasa, `oyó «la casa es grande»: ${e1.dichas} de ${e1.total} (${e1.estrellas} estrellas) ${JSON.stringify(e1.oido)}`);
  e1 = await oirEs('pero come pan', 'El perro come pan.'); const perro = e1.palabras.find((x) => x.w === 'perro');
  ok(perro.estado === 'casi' && perro.sono === 'pero', `pronunciación: dijo «pero» en vez de «perro» y lo notó (sonó como «${perro.sono}»)`);
  e1 = await oirEs('buenos días abuela', 'La casa es grande.'); ok(!e1.pasa, `si dice otra frase en español, no pasa (${e1.dichas} de ${e1.total})`);

  console.log('3) En la lección: palabras en verde, «¡Viva México!» y fiesta de tortillas');
  // El archivo de voz se escribe después de leer la frase que tocó: el navegador lo abre hasta que se enciende el micrófono.
  const archivo = wav('leccion.wav', 'uno'); ({ b, pg } = await abrir(archivo)); await bajarOido(pg); await hastaHablar(pg);
  const frase = await pg.locator('.decir').innerText(); wav('leccion.wav', frase); console.log(`  (frase que tocó: «${frase}»)`);
  await pg.waitForFunction(() => /palabra por palabra/.test(document.querySelector('[data-oido]')?.textContent || ''), null, { timeout: 15000 });
  ok(/dentro de tu teléfono/.test(await pg.locator('[data-privado]').textContent()), 'avisa que el reconocimiento es dentro del teléfono');
  await pg.click('[data-micro]'); await pg.waitForSelector('.retro.ok', { timeout: 40000 });
  const verdes = await pg.locator('.decir .pal.ok').count(), todas = await pg.locator('.decir .pal').count();
  ok(verdes === todas, `las palabras quedaron en verde (${verdes} de ${todas})`);
  ok(/Viva México/.test(await pg.locator('.retro .msg').innerText()), 'Granma grita «¡Viva México!»'); ok((await pg.locator('.confeti-cap i').count()) > 0, 'suelta confeti tricolor');
  await pg.screenshot({ path: join(CAPT, '25-viva-mexico.png') });
  for (let i = 0; i < 40; i++) { await pg.waitForTimeout(140); if (await pg.locator('h1:has-text("consejo del Abuelo")').count()) break; if (await pg.locator('[data-seguir]').count()) { await pg.click('[data-seguir]'); continue; } if (await pg.locator('[data-nohablo]').count()) { await pg.click('[data-nohablo]'); continue; } await resolver(pg); }
  await pg.click('[data-accion="fin"]'); await pg.waitForSelector('[data-premio]'); await pg.waitForTimeout(950);
  const nt = await pg.locator('.tortillas-cap .tortilla').count(); ok(nt > 0 && nt <= 24, `Granma avienta tortillas (${nt}, máx. 24)`);
  ok(/Te ganaste 1 kilo de tortillas hechas con mucho amor/.test(await pg.locator('[data-premio]').innerText()), 'dice «Te ganaste 1 kilo de tortillas hechas con mucho amor»');
  await pg.screenshot({ path: join(CAPT, '26-fiesta-tortillas.png') });
  ok((await pg.evaluate(() => JSON.parse(localStorage.getItem('granma:v1')).stats.kilos)) === 1, 'se suma 1 kg al perfil');
  await b.close();

  console.log('4) Tocar, pausar y volver a tocar el micrófono no lo traba (como en Android)');
  // Como en Android: el audio solo despierta si se pide en el mismo toque; si no, se queda dormido para siempre.
  ({ b, pg } = await abrir(wav('pausa.wav', 'uno'))); await bajarOido(pg);
  await pg.context().addInitScript(() => {
    let gesto = false; for (const ev of ['pointerdown', 'click', 'touchend']) addEventListener(ev, () => { gesto = true; setTimeout(() => { gesto = false; }, 0); }, true);
    const Orig = window.AudioContext;
    window.AudioContext = class extends Orig {
      constructor(...a) { super(...a); if (!gesto) { this.__dormido = true; Orig.prototype.suspend.call(this); } }
      resume() { if (gesto) { this.__dormido = false; return super.resume(); } return new Promise(() => {}); }
      get state() { return this.__dormido ? 'suspended' : super.state; }
    };
    const gum = navigator.mediaDevices.getUserMedia.bind(navigator.mediaDevices); window.__pistas = [];
    navigator.mediaDevices.getUserMedia = async (c) => { const f = await gum(c); window.__pistas.push(...f.getTracks()); return f; };
  });
  await pg.reload(); await hastaHablar(pg);
  const texto = () => pg.locator('[data-oido]').textContent(), vivas = () => pg.evaluate(() => window.__pistas.filter((x) => x.readyState === 'live').length);
  const oyendo = (ms) => pg.waitForFunction(() => /Te escucho/.test(document.querySelector('[data-oido]')?.textContent || ''), null, { timeout: ms }).then(() => true, () => false);
  await pg.waitForFunction(() => /palabra por palabra/.test(document.querySelector('[data-oido]')?.textContent || ''), null, { timeout: 15000 });
  await pg.click('[data-micro]'); ok(await oyendo(20000), 'primer toque: «Te escucho…»');
  await pg.waitForTimeout(700); await pg.click('[data-micro]');
  ok(await pg.waitForFunction(() => !/Te escucho|Preparando/.test(document.querySelector('[data-oido]')?.textContent || ''), null, { timeout: 5000 }).then(() => true, () => false), `segundo toque: se pausa («${(await texto()).slice(0, 60)}»)`);
  ok((await vivas()) === 0, 'al pausar, el micrófono se apaga');
  for (let vez = 1; vez <= 3; vez++) {
    await pg.click('[data-micro]'); const si = await oyendo(6000);
    ok(si, `toque ${vez + 2}: vuelve a escuchar, sin quedarse en «Preparando el oído…»${si ? '' : ` (se quedó en «${await texto()}»)`}`);
    ok((await vivas()) === 1, `toque ${vez + 2}: un solo micrófono abierto (${await vivas()})`);
    await pg.waitForTimeout(500); await pg.click('[data-micro]');
    await pg.waitForFunction(() => !/Te escucho|Preparando/.test(document.querySelector('[data-oido]')?.textContent || ''), null, { timeout: 5000 }).catch(() => {});
  }
  // Dos toques seguidos: el segundo cancela la preparación; no quedan dos micrófonos abiertos.
  await pg.locator('[data-micro]').dblclick(); await pg.waitForTimeout(1500);
  ok((await vivas()) === 0 && !/Preparando|Te escucho/.test(await texto()), `dos toques seguidos: el segundo cancela y no queda el micrófono abierto («${(await texto()).slice(0, 50)}»)`);
  await pg.click('[data-micro]'); ok(await oyendo(6000) && (await vivas()) === 1, 'y el siguiente toque vuelve a escuchar normal');
  await pg.click('[data-micro]'); await b.close();
} else { console.log('  (sin espeak-ng: se saltan las pruebas con voz)'); await b.close(); }
ok(errores.length === 0, 'sin errores de JS' + (errores.length ? ': ' + errores.slice(0, 3).join(' | ') : ''));
srv.close(); console.log(fallas.length ? `\n✘ ${fallas.length} fallas` : '\n✔ OÍDO DE GRANMA Y FIESTA OK'); process.exit(fallas.length ? 1 : 0);
