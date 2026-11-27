// QA en navegador de la cuenta con Google: la tarjeta del perfil (oculta sin configurar), el viaje a Google (solo «openid»),
// la vuelta a /cuenta.html (el token se borra de la barra), escoger avance cuando hay en los dos lados, cancelar y salir.
// El servidor de cuentas y Google se simulan. Uso: node scripts/qa-cuenta.mjs
import { createRequire } from 'node:module'; const { chromium } = createRequire('/opt/node-tools/x.js')('playwright');
import { createServer } from 'node:http'; import { readFileSync, existsSync, statSync, mkdirSync } from 'node:fs'; import { join, extname, dirname } from 'node:path'; import { fileURLToPath } from 'node:url';
const R = join(dirname(fileURLToPath(import.meta.url)), '..'), CAPT = join(R, '.qa'); mkdirSync(CAPT, { recursive: true });
const TIPOS = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
const srv = createServer((q, s) => { let p = new URL(q.url, 'http://x').pathname; if (p.endsWith('/')) p += 'index.html'; const f = join(R, p); if (!existsSync(f) || statSync(f).isDirectory()) { s.writeHead(404); return s.end(); }
  s.writeHead(200, { 'Content-Type': TIPOS[extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-store' }); s.end(readFileSync(f)); }).listen(0);
const B = `http://localhost:${srv.address().port}/`, fallas = [], ok = (c, t) => { console.log(`  ${c ? '✔' : '✘'} ${t}`); if (!c) fallas.push(t); };
const estado = (extra = {}, raiz = {}) => JSON.stringify({ v: 1, perfil: { aprende: 'en', interes: 'cocina', cocina: 'mexicana', nombre: 'Ana', listo: true, legal: '2026-11-27', trato: 'mija', ...extra }, xp: 40, racha: { n: 0, ultimo: null }, caps: { 1: { hecho: true } }, recetas: {}, consejos: {}, cotorreos: {}, biblia: {}, insignias: {}, pruebas: {}, misiones: { fecha: '', prog: {}, cobradas: {} }, stats: { retoMejor: 0, retos: 0 }, ajustes: { sonido: false, voz: false, vozV: 2 }, constancia: { fecha: null }, ...raiz });
const b = await chromium.launch(), errores = [];
async function nueva({ clientId = 'prueba.apps.googleusercontent.com', nube = null } = {}) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'block' }), pg = await ctx.newPage(), pedidos = [], google = [];
  pg.on('pageerror', (e) => errores.push(e.message));
  await ctx.route('https://accounts.google.com/**', (r) => { google.push(r.request().url()); return r.fulfill({ status: 200, contentType: 'text/html', body: '<p>Google (simulado)</p>' }); });
  await ctx.route('**/api/cuenta**', async (r) => { const q = r.request(), u = new URL(q.url()), cuerpo = q.postData() ? JSON.parse(q.postData()) : null; pedidos.push({ metodo: q.method(), ruta: u.pathname, cuerpo });
    const j = (d, status = 200) => r.fulfill({ status, contentType: 'application/json', body: JSON.stringify(d) });
    if (u.pathname.endsWith('/config')) return j({ ok: true, clientId });
    if (u.pathname.endsWith('/entrar')) return cuerpo.idToken === 'token-de-google' ? j({ ok: true, tieneProgreso: !!nube, actualizado: nube ? 1700000000000 : null }) : j({ ok: false }, 401);
    if (u.pathname.endsWith('/progreso') && q.method() === 'GET') return j({ ok: true, progreso: nube, actualizado: nube ? 1700000000000 : null });
    if (u.pathname.endsWith('/progreso')) { nube = cuerpo.progreso; return j({ ok: true, actualizado: Date.now() }); }
    return j({ ok: true }); });
  return { pg, pedidos, google };
}
const sembrar = async (pg, e = estado()) => { await pg.goto(B); await pg.evaluate((e) => localStorage.setItem('granma:v1', e), e); await pg.reload(); await pg.waitForSelector('.nav a'); };
const alPerfil = async (pg) => { await pg.goto(B + '#/perfil'); await pg.waitForSelector('[data-cuenta]', { state: 'attached' }); await pg.waitForTimeout(800); };
const leer = (pg) => pg.evaluate(() => JSON.parse(localStorage.getItem('granma:v1')));

console.log('1. Sin la app de Google configurada, no aparece nada');
let { pg, pedidos, google } = await nueva({ clientId: '' }); await sembrar(pg); await alPerfil(pg);
ok(await pg.locator('[data-cuenta]').isHidden() && (await pg.locator('.btn-google').count()) === 0, 'la tarjeta «Tu cuenta» queda oculta mientras no haya Client ID');
await pg.context().close();

console.log('2. La tarjeta y el viaje a Google');
({ pg, pedidos, google } = await nueva({ nube: JSON.parse(estado({}, { xp: 500, caps: { 1: { hecho: true }, 2: { hecho: true }, 3: { hecho: true } } })) })); await sembrar(pg); await alPerfil(pg);
const bt = pg.locator('.btn-google'); ok(await bt.isVisible() && /Entrar con Google/.test(await bt.textContent()), 'aparece «☁️ Tu cuenta» con el botón «Entrar con Google»');
const caja = await bt.boundingBox(); ok(caja.height >= 44 && await pg.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'el botón mide ≥ 44 px y todo cabe a 390 px');
ok(/no nos da tu correo ni tu nombre/.test(await pg.locator('[data-cuenta]').textContent()) && /13 años/.test(await pg.locator('[data-cuenta]').textContent()), 'explica que es opcional, que no se pide correo ni nombre, y lo de los 13 años');
await pg.locator('[data-cuenta]').scrollIntoViewIfNeeded(); await pg.locator('[data-cuenta]').screenshot({ path: join(CAPT, 'cuenta-tarjeta.png') });
await bt.click(); await pg.waitForURL(/accounts\.google\.com/);
const q = new URL(google[0]).searchParams;
ok(q.get('client_id') === 'prueba.apps.googleusercontent.com' && q.get('redirect_uri') === B + 'cuenta.html' && q.get('response_type') === 'id_token' && q.get('scope') === 'openid', 'va a Google con el Client ID, regreso a /cuenta.html, «id_token» y solo el permiso «openid»');
ok(/^[0-9a-f]{48}$/.test(q.get('nonce')) && /^[0-9a-f]{48}$/.test(q.get('state')) && q.get('nonce') !== q.get('state'), 'lleva un número de un solo uso (nonce) y un estado (state) al azar');
const st = q.get('state');

console.log('3. Regreso de Google con avance en los dos lados: la persona escoge');
await pg.goto(B + `cuenta.html#id_token=token-de-google&state=${st}`); await pg.waitForSelector('[data-usar]');
ok(new URL(pg.url()).hash === '' && !/token-de-google/.test(pg.url()), 'el token se borra de la barra de direcciones al llegar');
ok(pedidos.some((p) => p.ruta.endsWith('/entrar') && p.cuerpo.idToken === 'token-de-google' && p.cuerpo.nonce === q.get('nonce')), 'manda al servidor el token y el mismo nonce para que lo revise');
const txt = await pg.locator('main').textContent(); ok(/¿Cuál quieres usar, mija\?/.test(txt) && /500 XP · 3 capítulos/.test(txt) && /40 XP · 1 capítulo(?!s)/.test(txt), 'pregunta «¿Cuál quieres usar, mija?» y muestra los dos avances');
ok((await pg.locator('[data-usar]').evaluateAll((bs) => bs.every((x) => x.getBoundingClientRect().height >= 44))) && await pg.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'las dos opciones miden ≥ 44 px y caben a 390 px');
await pg.screenshot({ path: join(CAPT, 'cuenta-escoger.png'), fullPage: false });
await pg.click('[data-usar="cuenta"]'); await pg.waitForURL(/#\/perfil\?cuenta=lista/); await pg.waitForSelector('[data-cuenta] .estado.ok');
let e = await leer(pg); ok(e.xp === 500 && e.caps[3]?.hecho && e.perfil.nombre === 'Ana' && e.cuenta?.conectada && e.cuenta.sincronizado === 1700000000000, 'al escoger «El de mi cuenta»: toma ese avance, conserva el nombre de este teléfono y queda conectada');
ok(/Tu avance ya está en tu cuenta/.test(await pg.locator('[data-cuenta]').textContent()), 'en el perfil: «✓ ¡Listo! Tu avance ya está en tu cuenta.»');

console.log('4. Guardar ahora: no viajan el nombre ni los avisos');
pedidos.length = 0; await pg.click('[data-c="guardar"]'); await pg.waitForSelector('[data-cuenta] .aviso-local');
const sub = pedidos.find((p) => p.metodo === 'PUT'); ok(sub && sub.cuerpo.progreso.xp === 500 && !sub.cuerpo.progreso.perfil.nombre && !sub.cuerpo.progreso.cuenta && !('avisos' in sub.cuerpo.progreso.ajustes), 'sube el avance sin el nombre de la constancia, sin la cuenta y sin los avisos');
console.log('5. Salir');
await pg.click('[data-c="salir"]'); await pg.waitForSelector('.btn-google');
e = await leer(pg); ok(!e.cuenta && e.xp === 500 && pedidos.some((p) => p.ruta.endsWith('/salir')), 'al salir se cierra la sesión, el avance se queda en el teléfono y vuelve el botón de Google');
await pg.context().close();

console.log('6. Teléfono nuevo y cuenta con avance: se toma sin preguntar');
({ pg, pedidos, google } = await nueva({ nube: JSON.parse(estado({}, { xp: 700 })) })); await sembrar(pg, estado({}, { xp: 0, caps: {} }));
await pg.evaluate(() => localStorage.setItem('granma:google', JSON.stringify({ nonce: 'n1', state: 's1', t: Date.now() })));
await pg.goto(B + 'cuenta.html#id_token=token-de-google&state=s1'); await pg.waitForURL(/#\/perfil\?cuenta=lista/);
ok((await leer(pg)).xp === 700, 'si este teléfono no tenía avance, se usa el de la cuenta sin preguntar');
console.log('7. Cancelar en Google o un estado que no coincide');
await pg.evaluate(() => localStorage.setItem('granma:google', JSON.stringify({ nonce: 'n2', state: 's2', t: Date.now() })));
await pg.goto('about:blank'); await pg.goto(B + 'cuenta.html#error=access_denied&state=s2'); await pg.waitForSelector('.globo a.btn');
ok(/No entraste con tu cuenta\. No pasa nada, mija/.test(await pg.locator('main').textContent()), 'si cancela en Google: «No entraste con tu cuenta. No pasa nada, mija…»');
await pg.evaluate(() => localStorage.setItem('granma:google', JSON.stringify({ nonce: 'n3', state: 's3', t: Date.now() }))); pedidos.length = 0;
await pg.goto('about:blank'); await pg.goto(B + 'cuenta.html#id_token=token-de-google&state=otro'); await pg.waitForSelector('.globo a.btn');
ok(/Se tardó mucho la entrada/.test(await pg.locator('main').textContent()) && !pedidos.some((p) => p.ruta.endsWith('/entrar')), 'si el estado no coincide, no se manda el token al servidor');
await pg.context().close();

await b.close(); srv.close();
ok(errores.length === 0, 'sin errores de JavaScript' + (errores.length ? ': ' + errores.join(' | ') : ''));
console.log(fallas.length ? `\n✘ ${fallas.length} fallas` : '\n✔ Todo bien'); process.exit(fallas.length ? 1 : 0);
