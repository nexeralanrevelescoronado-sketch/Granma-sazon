// QA en navegador: «mijo» o «mija» en toda la app, aviso de versión nueva con el botón «Actualizar» (con un service
// worker de verdad), la tarjeta «La app en tu teléfono» con un botón por autorización y el recordatorio diario.
// Uso: node scripts/qa-app.mjs
import { createRequire } from 'node:module'; const { chromium } = createRequire('/opt/node-tools/x.js')('playwright');
import { createServer } from 'node:http'; import { readFileSync, existsSync, statSync, mkdirSync } from 'node:fs'; import { join, extname, dirname } from 'node:path'; import { fileURLToPath } from 'node:url';
const R = join(dirname(fileURLToPath(import.meta.url)), '..'), CAPT = join(R, '.qa'); mkdirSync(CAPT, { recursive: true });
const TIPOS = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
// El servidor puede «publicar» otra versión: cambia el número dentro de sw.js, como hace el build.
let version = null;
const srv = createServer((q, s) => { let p = new URL(q.url, 'http://x').pathname; if (p.endsWith('/')) p += 'index.html'; const f = join(R, p); if (!existsSync(f) || statSync(f).isDirectory()) { s.writeHead(404); return s.end(); }
  let cuerpo = readFileSync(f); if (p === '/sw.js' && version) cuerpo = Buffer.from(String(cuerpo).replace(/const VERSION = '[^']+'/, `const VERSION = '${version}'`));
  s.writeHead(200, { 'Content-Type': TIPOS[extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' }); s.end(cuerpo); }).listen(0);
const B = `http://localhost:${srv.address().port}/`, fallas = [], ok = (c, t) => { console.log(`  ${c ? '✔' : '✘'} ${t}`); if (!c) fallas.push(t); };
const estado = (extra = {}) => JSON.stringify({ v: 1, perfil: { aprende: 'en', interes: 'cocina', cocina: 'mexicana', nombre: 'Ana', listo: true, ...extra }, xp: 0, racha: { n: 0, ultimo: null }, caps: { 1: { hecho: true }, 2: { hecho: true }, 3: { hecho: true } }, recetas: {}, consejos: {}, cotorreos: {}, biblia: {}, insignias: {}, pruebas: {}, misiones: { fecha: '', prog: {}, cobradas: {} }, stats: { retoMejor: 0, retos: 0 }, ajustes: { sonido: false, voz: false, vozV: 2 }, constancia: { fecha: null } });
const b = await chromium.launch({ args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'] }), errores = [];
const nueva = async (op = {}) => { const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, ...op }); const pg = await ctx.newPage(); pg.on('pageerror', (e) => errores.push(e.message)); return pg; };
const fueraDeCitas = (t) => t.replace(/«[^»]*»|“[^”]*”|"[^"]*"/g, '');

console.log('1) La bienvenida pregunta cómo le dice Granma');
let pg = await nueva(); await pg.goto(B); await pg.waitForSelector('[data-aprende]');
await pg.click('[data-aprende="en"]'); await pg.click('[data-sig]'); await pg.waitForSelector('[data-trato]');
ok((await pg.locator('[data-trato]').count()) === 3 && (await pg.locator('h1').textContent()) === '¿Cómo quieres que te diga Granma?' && await pg.locator('[data-sig]').isDisabled(), 'tres opciones (mijo, mija, como salga) y hay que escoger una');
await pg.screenshot({ path: join(CAPT, '60-trato.png') });
await pg.click('[data-trato="mija"]'); await pg.click('[data-sig]'); await pg.click('[data-interes="cocina"]'); await pg.click('[data-sig]'); await pg.click('[data-cocina="mexicana"]'); await pg.click('[data-sig]');
ok(/¡Bienvenida, mija!/.test(await pg.locator('.globo .l1').first().textContent()), 'Granma dice «¡Bienvenida, mija!»');
await pg.click('[data-empezar]'); await pg.waitForSelector('#cta');
ok(/mija/.test(await pg.locator('.globo h1').first().textContent()) && (await pg.locator('[data-trato-card]').count()) === 0, 'en el inicio saluda con «mija» y ya no vuelve a preguntar');
await pg.goto(B + '#/leccion/1'); await pg.waitForSelector('.pista-glosa');
let txt = (await pg.locator('.globo .l2').allTextContents()).join(' ');
ok(/Mija, cuando yo era niña/.test(txt) && !/(^|[^\p{L}])mijo(?![\p{L}])/iu.test(txt), 'el relato del capítulo 1 dice «Mija» (estaba escrito con «Mijo»)');
await pg.context().close();

console.log('2) Quien ya tenía la app: se le pregunta una vez en el inicio');
pg = await nueva(); await pg.goto(B); await pg.evaluate((e) => localStorage.setItem('granma:v1', e), estado()); await pg.reload(); await pg.waitForSelector('[data-trato-card]');
ok((await pg.locator('[data-trato-card] [data-trato]').count()) === 3, 'aparece la tarjeta «¿Cómo quieres que te diga?»');
await pg.click('[data-trato-card] [data-trato="mijo"]'); await pg.waitForSelector('#cta'); await pg.waitForTimeout(400);
ok((await pg.locator('[data-trato-card]').count()) === 0 && (await pg.evaluate(() => JSON.parse(localStorage.getItem('granma:v1')).perfil.trato)) === 'mijo', 'al elegir «Mijo» se guarda y la tarjeta se va');
await pg.goto(B + '#/leccion/4'); await pg.waitForSelector('.pista-glosa'); txt = (await pg.locator('.globo .l2').allTextContents()).join(' ');
ok(txt.includes('«Mija, el mole no tiene prisa') , 'lo que su mamá le dijo a Granma sigue igual: «Mija, el mole no tiene prisa»');
await pg.goto(B + '#/leccion/2'); await pg.waitForSelector('.pista-glosa'); txt = (await pg.locator('.globo .l2').allTextContents()).join(' ');
ok(/Mijo, los domingos/.test(txt) && !/(^|[^\p{L}])mija(?![\p{L}])/iu.test(fueraDeCitas(txt)), 'el capítulo 2 (escrito con «Mija») ahora dice «Mijo»');
await pg.goto(B + '#/platica/un-dia-pesado'); await pg.waitForSelector('[data-resp]');
ok(/Mijo, ven, siéntate/.test(await pg.locator('.charla .l2').first().textContent()), 'en las pláticas también');
await pg.goto(B + '#/perfil'); await pg.waitForSelector('[data-permisos] .permisos'); ok(/«mijo»/.test(await pg.locator('main').textContent()), 'el perfil dice cómo le dice Granma, y se puede cambiar');
await pg.context().close();
pg = await nueva(); await pg.goto(B); await pg.evaluate((e) => localStorage.setItem('granma:v1', e), estado({ trato: 'mija' })); await pg.reload(); await pg.waitForSelector('.nav a'); await pg.goto(B + '#/platica/un-dia-pesado'); await pg.waitForSelector('[data-resp]');
for (let i = 0; i < 3; i++) { await pg.waitForSelector('[data-resp]'); await pg.locator('[data-resp]').nth(1).click(); await pg.waitForTimeout(100); }
txt = await pg.locator('.charla').textContent();
ok(/No estás sola, mija/.test(txt) && /Estoy muy cansada\./.test(txt) && !/(^|[^\p{L}])mijo(?![\p{L}])/iu.test(txt), 'con «mija», lo dirigido a ella va en femenino: «No estás sola, mija», «Estoy muy cansada»');
await pg.context().close();

console.log('3) Versión nueva: aviso con botón «Actualizar» (service worker real)');
version = 'aaaa111111';
pg = await nueva(); await pg.goto(B); await pg.evaluate((e) => localStorage.setItem('granma:v1', e), estado({ trato: '' })); await pg.reload(); await pg.waitForSelector('#cta');
await pg.waitForFunction(() => !!navigator.serviceWorker.controller, null, { timeout: 30000 });
const versionDe = () => pg.evaluate(() => new Promise((res) => { const c = new MessageChannel(); c.port1.onmessage = (e) => res(e.data); navigator.serviceWorker.controller.postMessage('version', [c.port2]); setTimeout(() => res('sin respuesta'), 2000); }));
ok((await versionDe()) === 'aaaa111111' && await pg.locator('#aviso-version').isHidden(), 'primera instalación: entra sola (versión aaaa111111) y no hay aviso');
await pg.goto(B + '#/perfil'); await pg.waitForSelector('[data-p="buscar"]');
ok(/aaaa111111/.test(await pg.locator('[data-permisos]').textContent()), 'el perfil muestra la versión que tienes');
await pg.click('[data-p="buscar"]'); await pg.waitForSelector('[data-permisos] [role="status"]');
ok(/Ya tienes la última versión/.test(await pg.locator('[data-permisos] [role="status"]').textContent()), '«Buscar actualización» sin novedad: «Ya tienes la última versión»');
version = 'bbbb222222';                                             // se publica una versión nueva
await pg.click('[data-p="buscar"]'); await pg.waitForSelector('[data-p="actualizar"]', { timeout: 40000 });
ok(await pg.locator('#aviso-version').isVisible() && /Hay una versión nueva/.test(await pg.locator('#aviso-version').textContent()), 'al publicar otra versión, aparece el aviso «Hay una versión nueva»');
ok((await versionDe()) === 'aaaa111111', 'mientras no se toque el botón, sigue funcionando la versión anterior (no se mezclan)');
const caja = await pg.locator('#aviso-version').boundingBox(), nav = await pg.locator('#nav').boundingBox(), bt = await pg.locator('#btn-actualizar').boundingBox();
ok(caja.y + caja.height <= nav.y && caja.x >= 0 && caja.x + caja.width <= 390 && bt.height >= 44, 'el aviso cabe en la pantalla, arriba de la barra, con botón de 44 px');
await pg.screenshot({ path: join(CAPT, '61-actualizar.png') });
await Promise.all([pg.waitForEvent('load', { timeout: 20000 }), pg.click('#btn-actualizar')]);
await pg.waitForFunction(() => !!navigator.serviceWorker.controller, null, { timeout: 20000 }); await pg.waitForSelector('.nav a');
ok((await versionDe()) === 'bbbb222222' && await pg.locator('#aviso-version').isHidden(), 'al tocar «Actualizar» la app se recarga sola, ya con la versión bbbb222222 y sin aviso');
ok((await pg.evaluate(async () => (await caches.keys()).filter((k) => k.startsWith('granma-core-')))).join() === 'granma-core-bbbb222222', 'solo queda guardada la versión nueva');
// si no se toca el botón: la nueva entra al cerrar y abrir la app
version = 'cccc333333'; await pg.evaluate(() => navigator.serviceWorker.getRegistration().then((r) => r.update()));
await pg.waitForSelector('#aviso-version:not([hidden])', { timeout: 40000 }); const ctx3 = pg.context(); await pg.close();
pg = await ctx3.newPage(); pg.on('pageerror', (e) => errores.push(e.message)); await pg.goto(B); await pg.waitForSelector('.nav a'); await pg.waitForFunction(() => !!navigator.serviceWorker.controller, null, { timeout: 20000 });
ok((await versionDe()) === 'cccc333333', 'sin tocar el botón: al cerrar la app y abrirla otra vez, ya trae la versión nueva');
await pg.context().close(); version = null;

console.log('4) «La app en tu teléfono»: un botón por autorización');
pg = await nueva(); await pg.context().addInitScript(() => { let p = 'default'; window.__pedidos = 0; Object.defineProperty(Notification, 'permission', { get: () => p, configurable: true }); Notification.requestPermission = async () => { window.__pedidos++; p = 'granted'; return p; }; });
await pg.goto(B); await pg.evaluate((e) => localStorage.setItem('granma:v1', e), estado({ trato: '' })); await pg.reload(); await pg.waitForSelector('#cta');
ok(await pg.locator('[data-app-lista]').isVisible(), 'el inicio invita a dejar lista la app');
const pedidos = await pg.evaluate(() => window.__pedidos);
await pg.click('[data-app-lista]'); await pg.waitForSelector('[data-permisos] .permisos');
const filas = await pg.locator('.permisos li strong').allTextContents();
ok(filas.length === 7 && /Versión/.test(filas[0]) && /pantalla de inicio/.test(filas[1]) && /Avisos/.test(filas[2]) && /Recordatorio para practicar/.test(filas[3]) && /Te espero en clase/.test(filas[4]) && /Micrófono/.test(filas[5]) && /Guardado/.test(filas[6]), 'siete renglones: ' + filas.map((f) => f.replace(/^\S+\s/, '')).join(' · '));
ok(pedidos === 0 && (await pg.evaluate(() => window.__pedidos)) === 0 && (await pg.locator('[data-p="avisos"]').count()) === 1, 'los avisos no se piden solos: hay un botón «Permitir avisos»');
ok(await pg.evaluate(() => document.documentElement.scrollWidth <= innerWidth) && (await pg.locator('.permisos .btn').evaluateAll((bs) => bs.every((x) => x.getBoundingClientRect().height >= 44))), 'cabe a 390 px y los botones miden ≥ 44 px');
await pg.locator('[data-permisos]').scrollIntoViewIfNeeded(); await pg.screenshot({ path: join(CAPT, '62-permisos.png') });
if (await pg.locator('[data-p="micro"]').count()) { await pg.click('[data-p="micro"]'); await pg.waitForSelector('[data-permisos] [role="status"]'); ok(/Ya puedo oírte/.test(await pg.locator('[data-permisos] [role="status"]').textContent()), 'micrófono: al tocar el botón se pide y queda permitido'); }
else ok(/✓ Permitido/.test(await pg.locator('.permisos li').nth(5).textContent()), 'micrófono: ya estaba permitido');
await pg.click('[data-p="avisos"]'); await pg.waitForFunction(() => /✓ Permitidos|✓ Allowed/.test(document.querySelector('.permisos')?.textContent || ''));
ok((await pg.evaluate(() => window.__pedidos)) === 1 && /aviso de prueba/.test(await pg.locator('[data-permisos] [role="status"]').textContent()) && (await pg.locator('[data-p="avisos"]').count()) === 0, 'avisos: al tocar el botón se pide una vez, queda «✓ Permitidos» y manda un aviso de prueba');
await pg.context().close();
pg = await nueva(); await pg.context().addInitScript(() => { Object.defineProperty(Notification, 'permission', { get: () => 'denied', configurable: true }); }); await pg.goto(B); await pg.evaluate((e) => localStorage.setItem('granma:v1', e), estado({ trato: '' })); await pg.reload(); await pg.waitForSelector('.nav a'); await pg.goto(B + '#/perfil'); await pg.waitForSelector('[data-permisos] .permisos');
ok(/Bloqueados/.test(await pg.locator('.permisos li').nth(2).textContent()) && /ajustes de tu teléfono/.test(await pg.locator('.permisos li').nth(2).textContent()) && (await pg.locator('[data-p="avisos"]').count()) === 0, 'si alguien bloqueó los avisos, no se insiste: se explica cómo activarlos en los ajustes');
await pg.context().close();

console.log('5) Avisos de Granma: hora y días, «Te espero en clase», y avisos bloqueados');
const prepararAvisos = async (permiso, iphone = false) => { const pg = await nueva({ timezoneId: 'America/Mexico_City', ...(iphone ? { userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.1 Mobile/15E148 Safari/604.1' } : {}) }), pedidos = [];
  await pg.context().addInitScript((permiso) => { let p = permiso; Object.defineProperty(Notification, 'permission', { get: () => p, configurable: true }); Notification.requestPermission = async () => { if (p === 'default') p = 'granted'; return p; }; let sub = null;
    PushManager.prototype.getSubscription = async () => sub; PushManager.prototype.subscribe = async (op) => { window.__opciones = { visible: op.userVisibleOnly, bytes: op.applicationServerKey.length }; sub = { endpoint: 'https://fcm.googleapis.com/fcm/send/telefono-de-prueba-0123456789', unsubscribe: async () => { sub = null; window.__baja = true; return true; } }; return sub; }; }, permiso);
  await pg.route('**/api/avisos/**', async (ruta) => { const q = ruta.request(), u = new URL(q.url()); pedidos.push({ ruta: u.pathname, cuerpo: q.postData() ? JSON.parse(q.postData()) : null });
    await ruta.fulfill({ contentType: 'application/json', body: JSON.stringify(u.pathname.endsWith('/clave') ? { ok: true, clave: 'BKv4rsSwut8pNXL1Bc2IjLEh3vZ1F6o_mXJAkdnbGAIHnxuBQ1H94ekDZY7py5y6H82MBoZz4TwoRK2nNYfjw_8' } : { ok: true }) }); });
  await pg.goto(B); await pg.evaluate((e) => localStorage.setItem('granma:v1', e), estado({ trato: 'mija' })); await pg.reload(); await pg.waitForSelector('.nav a');
  await pg.waitForFunction(() => navigator.serviceWorker.getRegistration().then((r) => !!r?.active), null, { timeout: 30000 });
  await pg.goto(B + '#/perfil'); await pg.waitForSelector('[data-permisos] .permisos'); return { pg, pedidos }; };
{ const { pg, pedidos } = await prepararAvisos('default');
  const filas = await pg.locator('.permisos li strong').allTextContents();
  ok(filas.some((f) => /Recordatorio para practicar/.test(f)) && filas.some((f) => /Te espero en clase/.test(f)), 'hay dos avisos: «Recordatorio para practicar» y «Te espero en clase»');
  ok((await pg.locator('#hora-practicar').inputValue()) === '19' && (await pg.locator('#hora-clase').inputValue()) === '10' && pedidos.length === 0, 'sugeridos: practicar 7 p. m. todos los días; clase 10 a. m. los sábados; nada enviado todavía');
  // practicar: 10 a. m., de lunes a viernes
  await pg.locator('#hora-practicar').selectOption('10'); await pg.click('[data-semana="practicar"]');
  ok(JSON.stringify(await pg.locator('[data-dia^="practicar:"]').evaluateAll((bs) => bs.map((b) => b.getAttribute('aria-pressed') === 'true'))) === '[true,true,true,true,true,false,false]', '«Entre semana» marca de lunes a viernes');
  await pg.click('[data-p="aviso:practicar"]'); await pg.waitForSelector('[data-p="quitar:practicar"]');
  let fila = await pg.locator('.permisos li', { hasText: 'Recordatorio para practicar' }).textContent();
  ok(/✓ De lunes a viernes, a las 10:00 a\. m\./.test(fila) && /Te aviso de lunes a viernes, a las 10:00 a\. m\./.test(fila) && (await pg.locator('#hora-practicar').inputValue()) === '10', 'se queda en 10:00 a. m. (ya no se regresa a 7 p. m.) y el mensaje sale junto al botón');
  let alta = pedidos.filter((x) => x.ruta.endsWith('/alta')).at(-1);
  ok(alta.cuerpo.tipo === 'practicar' && alta.cuerpo.hora === 16 && alta.cuerpo.dias === 0b0111110 && JSON.stringify(Object.keys(alta.cuerpo).sort()) === '["dias","endpoint","hora","tipo"]', 'al servidor van hora y días en UTC (10 a. m. de México = 16 UTC, lunes a viernes) y nada más');
  // clase: 8 p. m., sábado y miércoles → en UTC ya es domingo y jueves
  await pg.locator('#hora-clase').selectOption('20'); await pg.click('[data-dia="clase:3"]'); await pg.click('[data-p="aviso:clase"]'); await pg.waitForSelector('[data-p="quitar:clase"]');
  fila = await pg.locator('.permisos li', { hasText: 'Te espero en clase' }).textContent(); alta = pedidos.filter((x) => x.ruta.endsWith('/alta')).at(-1);
  ok(/Granma te escribe: Mija, te estoy esperando para tu siguiente clase de cocina e inglés/.test(fila) && /✓ Miércoles y sábado, a las 8:00 p\. m\./.test(fila) && alta.cuerpo.tipo === 'clase' && alta.cuerpo.hora === 2 && alta.cuerpo.dias === ((1 << 4) | (1 << 0)), '«Te espero en clase» le habla con su «mija»: miércoles y sábado 8 p. m. (en UTC: jueves y domingo a las 2)');
  const anotado = await pg.evaluate(async () => (await (await caches.open('granma-avisos')).match('datos')).json());
  ok(anotado.trato === 'mija' && anotado.aprende === 'en' && anotado.siguiente?.es && anotado.horarios.length === 2, `el teléfono anota el capítulo que sigue («${anotado.siguiente?.es}») y los dos horarios, solo en el teléfono`);
  await pg.click('[data-dia="practicar:1"]'); await pg.click('[data-dia="practicar:2"]'); await pg.click('[data-dia="practicar:3"]'); await pg.click('[data-dia="practicar:4"]'); await pg.click('[data-dia="practicar:5"]');
  await pg.click('[data-p="aviso:practicar"]'); await pg.waitForFunction(() => /Escoge al menos un día/.test(document.querySelector('.permisos')?.textContent || ''));
  ok(true, 'sin días marcados, pide escoger al menos uno');
  await pg.locator('.permisos li', { hasText: 'Te espero en clase' }).scrollIntoViewIfNeeded(); await pg.screenshot({ path: join(CAPT, '63-avisos.png') });
  await pg.click('[data-p="quitar:clase"]'); await pg.waitForFunction(() => !document.querySelector('[data-p="quitar:clase"]'));
  const bajaClase = pedidos.filter((x) => x.ruta.endsWith('/baja')).at(-1);
  ok(bajaClase.cuerpo.tipo === 'clase' && !(await pg.evaluate(() => window.__baja)), 'quitar uno solo borra ese aviso; el teléfono sigue suscrito para el otro');
  await pg.click('[data-p="quitar:practicar"]'); await pg.waitForFunction(() => !document.querySelector('[data-p^="quitar:"]'));
  const fin = await pg.evaluate(async () => ({ avisos: JSON.parse(localStorage.getItem('granma:v1')).ajustes.avisos, caja: (await caches.keys()).includes('granma-avisos'), baja: window.__baja }));
  ok(!pedidos.filter((x) => x.ruta.endsWith('/baja')).at(-1).cuerpo.tipo && fin.baja && !fin.avisos && !fin.caja, 'al quitar el último: se borra todo del servidor, el navegador olvida la dirección y no queda nada anotado');
  ok(await pg.evaluate(() => document.documentElement.scrollWidth <= innerWidth) && (await pg.locator('.dia').evaluateAll((bs) => bs.every((b) => b.getBoundingClientRect().height >= 44))), 'todo cabe a 390 px y los días miden ≥ 44 px');
  await pg.context().close(); }
{ const { pg, pedidos } = await prepararAvisos('denied', true);
  const t = await pg.locator('.permisos').textContent();
  ok(/Los avisos están bloqueados/.test(t) && /Ajustes del iPhone → Notificaciones → Granma Sazón → activa Permitir notificaciones/.test(t.replace(/\s+/g, ' ')) && (await pg.locator('[data-p="revisar"]').count()) === 1, 'avisos bloqueados: explica dónde permitirlos en el iPhone y ofrece «Ya lo permití»');
  ok((await pg.locator('[data-p^="aviso:"]').count()) === 0 && pedidos.length === 0, 'mientras estén bloqueados no ofrece un «Activar» que no puede funcionar');
  await pg.locator('.permisos li.bloqueo').scrollIntoViewIfNeeded(); await pg.screenshot({ path: join(CAPT, '64-bloqueados.png') });
  await pg.context().close(); }

ok(errores.length === 0, 'sin errores de JS' + (errores.length ? ': ' + errores.slice(0, 3).join(' | ') : ''));
await b.close(); srv.close(); console.log(fallas.length ? `\n✘ ${fallas.length} fallas` : '\n✔ TRATO, ACTUALIZACIÓN Y PERMISOS OK'); process.exit(fallas.length ? 1 : 0);
