// Pruebas del servidor de cuentas (functions/api/cuenta/[[ruta]].js): la función de verdad, contra SQLite y con un «Google»
// de mentiras que firma tokens con su propia llave. Uso: npm test
import test from 'node:test'; import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs'; import { join, dirname } from 'node:path'; import { fileURLToPath } from 'node:url';
import { atender, revisarToken, sha256, ORIGEN } from '../functions/api/cuenta/[[ruta]].js';
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
let sqlite = null; try { sqlite = await import('node:sqlite'); } catch { /* sin SQLite integrado */ }
function baseDePrueba() {
  const db = new sqlite.DatabaseSync(':memory:'); db.exec(readFileSync(join(RAIZ, 'servidor/cuentas.sql'), 'utf8'));
  const orden = (sql, args = []) => ({ bind: (...a) => orden(sql, a), all: async () => ({ results: db.prepare(sql).all(...args) }), first: async () => db.prepare(sql).get(...args) ?? null, run: async () => { db.prepare(sql).run(...args); return { success: true }; } });
  return { prepare: (sql) => orden(sql), batch: async (l) => { for (const o of l) await o.run(); }, crudo: db };
}
const b64u = (x) => Buffer.from(typeof x === 'string' ? x : JSON.stringify(x)).toString('base64url');
async function google() {
  const par = await crypto.subtle.generateKey({ name: 'RSASSA-PKCS1-v1_5', modulusLength: 2048, publicExponent: new Uint8Array([1, 0, 1]), hash: 'SHA-256' }, true, ['sign', 'verify']);
  const jwk = { ...(await crypto.subtle.exportKey('jwk', par.publicKey)), kid: 'llave-1', use: 'sig', alg: 'RS256' };
  const firmar = async (datos, cab = { alg: 'RS256', kid: 'llave-1', typ: 'JWT' }, llave = par.privateKey) => { const c = b64u(cab), d = b64u(datos); const f = await crypto.subtle.sign('RSASSA-PKCS1-v1_5', llave, Buffer.from(`${c}.${d}`)); return `${c}.${d}.${Buffer.from(f).toString('base64url')}`; };
  return { llaves: [jwk], firmar };
}
const CLIENTE = '123456-abc.apps.googleusercontent.com', NONCE = 'n'.repeat(32);
const tok = (g, extra = {}) => { const s = Math.floor(Date.now() / 1000); return g.firmar({ iss: 'https://accounts.google.com', aud: CLIENTE, sub: '1098765432123456789', iat: s, exp: s + 3600, nonce: NONCE, ...extra }); };
const pedir = (ruta, { metodo = 'GET', cuerpo, cookie, origen = ORIGEN } = {}) => new Request(ORIGEN + ruta, { method: metodo, headers: { 'Content-Type': 'application/json', ...(origen ? { Origin: origen } : {}), ...(cookie ? { Cookie: cookie } : {}) }, body: cuerpo === undefined ? undefined : (typeof cuerpo === 'string' ? cuerpo : JSON.stringify(cuerpo)) });

test('cuentas: el token de Google se revisa completo (firma, app, emisor, vigencia y número de un solo uso)', async () => {
  const g = await google(), env = { GOOGLE_CLIENT_ID: CLIENTE, LLAVES_DE_PRUEBA: g.llaves };
  assert.equal((await revisarToken(await tok(g), NONCE, env)).sub, '1098765432123456789');
  const otro = await google(), s = Math.floor(Date.now() / 1000);
  for (const [caso, t, n] of [
    ['firmado por otra llave', await otro.firmar({ iss: 'https://accounts.google.com', aud: CLIENTE, sub: 'x', iat: s, exp: s + 60, nonce: NONCE }), NONCE],
    ['para otra app', await tok(g, { aud: 'otra-app.apps.googleusercontent.com' }), NONCE], ['otro emisor', await tok(g, { iss: 'https://evil.example' }), NONCE],
    ['vencido', await tok(g, { iat: s - 7200, exp: s - 3600 }), NONCE], ['viejo', await tok(g, { iat: s - 3600 }), NONCE], ['del futuro', await tok(g, { iat: s + 600 }), NONCE],
    ['otro nonce', await tok(g), 'z'.repeat(32)], ['sin nonce', await tok(g, { nonce: undefined }), NONCE],
    ['algoritmo none', await g.firmar({ iss: 'https://accounts.google.com', aud: CLIENTE, sub: 'x', iat: s, exp: s + 60, nonce: NONCE }, { alg: 'none', kid: 'llave-1' }), NONCE],
    ['llave desconocida', await g.firmar({ iss: 'https://accounts.google.com', aud: CLIENTE, sub: 'x', iat: s, exp: s + 60, nonce: NONCE }, { alg: 'RS256', kid: 'otra' }), NONCE],
    ['basura', 'a.b.c', NONCE], ['vacío', '', NONCE]]) await assert.rejects(revisarToken(t, n, env), Error, caso);
  await assert.rejects(revisarToken(await tok(g), NONCE, { LLAVES_DE_PRUEBA: g.llaves }), Error, 'sin GOOGLE_CLIENT_ID no se acepta nada');
});

test('cuentas: entrar, guardar y bajar el avance, salir y borrar; sin sesión o desde otro sitio no se puede', { skip: !sqlite }, async () => {
  const g = await google(), DB = baseDePrueba(), env = { DB, GOOGLE_CLIENT_ID: CLIENTE, LLAVES_DE_PRUEBA: g.llaves };
  let r = await atender(pedir('/api/cuenta/config'), env); assert.deepEqual(await r.json(), { ok: true, clientId: CLIENTE });
  r = await atender(pedir('/api/cuenta/config'), { DB }); assert.deepEqual(await r.json(), { ok: true, clientId: '' }, 'sin configurar, el botón no aparece');
  r = await atender(pedir('/api/cuenta/entrar', { metodo: 'POST', cuerpo: { idToken: await tok(g), nonce: NONCE }, origen: 'https://evil.example' }), env); assert.equal(r.status, 403, 'otro sitio no puede entrar');
  r = await atender(pedir('/api/cuenta/entrar', { metodo: 'POST', cuerpo: { idToken: await tok(g, { aud: 'otra' }), nonce: NONCE } }), env); assert.equal(r.status, 401);
  r = await atender(pedir('/api/cuenta/entrar', { metodo: 'POST', cuerpo: { idToken: await tok(g), nonce: NONCE } }), env); assert.equal(r.status, 200);
  assert.deepEqual(await r.json(), { ok: true, tieneProgreso: false, actualizado: null });
  const sc = r.headers.get('Set-Cookie'); assert.match(sc, /^granma_sesion=[a-z0-9]{40,}; Path=\/api\/cuenta; Max-Age=\d+; HttpOnly; Secure; SameSite=Lax$/, 'cookie de sesión segura');
  const cookie = sc.split(';')[0];
  // lo que se guarda: ni el identificador de Google, ni correo, ni nombre; la sesión, solo como huella
  const cuenta = DB.crudo.prepare('SELECT * FROM cuentas').get(); assert.equal(cuenta.id, await sha256('google:1098765432123456789')); assert.ok(!JSON.stringify(DB.crudo.prepare('SELECT * FROM cuentas').all()).includes('1098765432123456789'));
  assert.deepEqual(Object.keys(cuenta).sort(), ['actualizado', 'creado', 'id', 'progreso']);
  assert.ok(!DB.crudo.prepare('SELECT token FROM sesiones').get().token.includes(cookie.split('=')[1]), 'la sesión se guarda solo como huella');
  r = await atender(pedir('/api/cuenta/progreso'), env); assert.equal(r.status, 401, 'sin cookie no hay avance');
  r = await atender(pedir('/api/cuenta/progreso', { cookie: 'granma_sesion=' + 'x'.repeat(40) }), env); assert.equal(r.status, 401, 'una cookie inventada no sirve');
  r = await atender(pedir('/api/cuenta/progreso', { cookie }), env); assert.deepEqual(await r.json(), { ok: true, progreso: null, actualizado: null });
  r = await atender(pedir('/api/cuenta/progreso', { metodo: 'PUT', cookie, cuerpo: { progreso: { xp: 67, caps: { 1: { hecho: true } } } }, origen: 'https://evil.example' }), env); assert.equal(r.status, 403, 'otro sitio no puede escribir aunque tenga la cookie');
  r = await atender(pedir('/api/cuenta/progreso', { metodo: 'PUT', cookie, cuerpo: { progreso: { xp: 67, caps: { 1: { hecho: true } } } } }), env); assert.equal(r.status, 200);
  r = await atender(pedir('/api/cuenta/progreso', { cookie }), env); const d = await r.json(); assert.deepEqual(d.progreso, { xp: 67, caps: { 1: { hecho: true } } }); assert.ok(d.actualizado > 0);
  for (const [caso, c, est] of [['no es objeto', { progreso: [1, 2] }, 400], ['sin avance', {}, 400], ['no es JSON', '{{', 400], ['demasiado grande', { progreso: { x: 'a'.repeat(300 * 1024) } }, 413]]) { r = await atender(pedir('/api/cuenta/progreso', { metodo: 'PUT', cookie, cuerpo: c }), env); assert.equal(r.status, est, caso); }
  // otro teléfono entra con la misma cuenta de Google: ve el avance guardado
  r = await atender(pedir('/api/cuenta/entrar', { metodo: 'POST', cuerpo: { idToken: await tok(g), nonce: NONCE } }), env); const dos = await r.json(); assert.equal(dos.tieneProgreso, true, 'el segundo teléfono sabe que hay avance');
  const cookie2 = r.headers.get('Set-Cookie').split(';')[0]; assert.notEqual(cookie2, cookie);
  r = await atender(pedir('/api/cuenta/salir', { metodo: 'POST', cookie }), env); assert.equal(r.status, 200); assert.match(r.headers.get('Set-Cookie'), /Max-Age=0/);
  r = await atender(pedir('/api/cuenta/progreso', { cookie }), env); assert.equal(r.status, 401, 'al salir, esa sesión ya no sirve');
  r = await atender(pedir('/api/cuenta/progreso', { cookie: cookie2 }), env); assert.equal(r.status, 200, 'la del otro teléfono sigue');
  r = await atender(pedir('/api/cuenta', { metodo: 'DELETE', cookie: cookie2 }), env); assert.equal(r.status, 200);
  assert.equal(DB.crudo.prepare('SELECT COUNT(*) AS n FROM cuentas').get().n, 0, 'borrar la cuenta borra el avance'); assert.equal(DB.crudo.prepare('SELECT COUNT(*) AS n FROM sesiones').get().n, 0, 'y todas sus sesiones');
});

test('cuentas: sin librerías, solo el permiso «openid» y ningún programa de Google dentro de la app', () => {
  const f = readFileSync(join(RAIZ, 'functions/api/cuenta/[[ruta]].js'), 'utf8'), c = readFileSync(join(RAIZ, 'js/cuenta.js'), 'utf8');
  assert.ok(!/^import /m.test(f) && !/require\(/.test(f));
  assert.ok(/scope: 'openid'/.test(c) && !/scope: '[^']*(email|profile)/.test(c), 'no se pide correo ni nombre');
  assert.ok(/response_type: 'id_token'/.test(c) && /nonce/.test(c) && /state/.test(c), 'entrada estándar con número de un solo uso y estado');
  for (const h of ['index.html', 'cuenta.html']) assert.ok(!/<script[^>]+src=["']https?:/.test(readFileSync(join(RAIZ, h), 'utf8')), `${h}: sin scripts de terceros`);
  assert.ok(/history\.replaceState\(null, '', location\.pathname\)/.test(readFileSync(join(RAIZ, 'js/cuenta-vuelta.js'), 'utf8')), 'el token no se queda en la barra ni en el historial');
  assert.ok(/delete c\.perfil\.nombre/.test(c), 'el nombre de la constancia no viaja a la cuenta');
});
