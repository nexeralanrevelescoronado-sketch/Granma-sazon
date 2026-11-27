// Pruebas del servidor de avisos (functions/api/avisos/[[ruta]].js): corre la función de verdad contra una base SQLite en memoria
// y un servicio de avisos de mentiras que revisa la firma. Uso: npm test
import test from 'node:test'; import assert from 'node:assert/strict';
import { createServer } from 'node:http'; import { readFileSync } from 'node:fs'; import { join, dirname } from 'node:path'; import { fileURLToPath } from 'node:url';
import { atender, onRequest, endpointValido, avisar, huella, POR_TANDA, DIAS_DE_FALLO, ORIGENES } from '../functions/api/avisos/[[ruta]].js';
const worker = { fetch: (request, env) => onRequest({ request, env }) };
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
let sqlite = null; try { sqlite = await import('node:sqlite'); } catch { /* Node sin SQLite integrado: se saltan las pruebas con base */ }

// D1 de mentiras: misma forma que la de Cloudflare (prepare → bind → all/first/run, y batch), con SQLite de verdad detrás.
function baseDePrueba() {
  const db = new sqlite.DatabaseSync(':memory:'); db.exec(readFileSync(join(RAIZ, 'servidor/avisos/esquema.sql'), 'utf8'));
  const orden = (sql, args = []) => ({ bind: (...a) => orden(sql, a), all: async () => ({ results: db.prepare(sql).all(...args) }), first: async () => db.prepare(sql).get(...args) ?? null, run: async () => { db.prepare(sql).run(...args); return { success: true }; } });
  return { prepare: (sql) => orden(sql), batch: async (lista) => { for (const o of lista) await o.run(); }, crudo: db };
}
const b64u = (b) => Buffer.from(b).toString('base64url');
async function llaves() { const k = await crypto.subtle.generateKey({ name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign', 'verify']); return { publica: b64u(await crypto.subtle.exportKey('raw', k.publicKey)), privada: JSON.stringify(await crypto.subtle.exportKey('jwk', k.privateKey)), verificar: k.publicKey }; }
const pedir = (ruta, { metodo = 'POST', origen = ORIGENES[0], cuerpo } = {}) => new Request('https://granmasazon.app' + ruta, { method: metodo, headers: { ...(origen ? { Origin: origen } : {}), 'Content-Type': 'application/json' }, body: metodo === 'POST' ? (typeof cuerpo === 'string' ? cuerpo : JSON.stringify(cuerpo ?? {})) : undefined });
const FCM = 'https://fcm.googleapis.com/fcm/send/abcdefghijklmnopqrstuvwxyz0123456789';

test('avisos: solo se aceptan direcciones de los servicios de avisos de los navegadores', () => {
  for (const e of [FCM, 'https://web.push.apple.com/QGuS0aVbmPkabcdefghijklmnop', 'https://updates.push.services.mozilla.com/wpush/v2/gAAAAABabcdefghijk', 'https://wns2-by3p.notify.windows.com/w/?token=abcdefghijklmnop']) assert.ok(endpointValido(e), e);
  for (const e of ['http://fcm.googleapis.com/fcm/send/abcdefghijklmnopqrstuvwxyz', 'https://evil.example.com/fcm.googleapis.com/aaaaaaaaaaaaaaaa', 'https://fcm.googleapis.com.evil.example/aaaaaaaaaaaaaaaaaaa', 'https://169.254.169.254/latest/meta-data/aaaaaaaa', 'https://localhost/aaaaaaaaaaaaaaaaaaaaaaaaa', 'https://user:clave@fcm.googleapis.com/fcm/send/abcdefghijk', 'javascript:alert(1)//aaaaaaaaaaaaaaaaaaaa', '', null, 42, 'https://fcm.googleapis.com/' + 'a'.repeat(1100)]) assert.ok(!endpointValido(e), String(e).slice(0, 50));
  assert.ok(!endpointValido('http://127.0.0.1:9999/ok/aaaaaaaaaaaaaaaa'), 'sin el permiso de pruebas, nada local');
});

test('avisos: alta, cambio de hora y baja; sin origen de la app o con datos raros no entra nada', { skip: !sqlite }, async () => {
  const DB = baseDePrueba(), k = await llaves(), env = { DB, VAPID_PUBLICA: k.publica, VAPID_PRIVADA: k.privada, CRON_SECRETO: 'secreto-de-prueba-123' }, filas = () => DB.crudo.prepare('SELECT * FROM suscripciones').all();
  let r = await worker.fetch(pedir('/api/avisos/clave', { metodo: 'GET' }), env); assert.deepEqual(await r.json(), { ok: true, clave: k.publica });
  for (const [caso, peticion, estado] of [['sin origen', pedir('/api/avisos/alta', { origen: null, cuerpo: { endpoint: FCM, hora: 1 } }), 403], ['otro sitio', pedir('/api/avisos/alta', { origen: 'https://evil.example', cuerpo: { endpoint: FCM, hora: 1 } }), 403],
    ['dirección ajena', pedir('/api/avisos/alta', { cuerpo: { endpoint: 'https://evil.example/aaaaaaaaaaaaaaaaaaaaaa', hora: 1 } }), 400], ['hora mala', pedir('/api/avisos/alta', { cuerpo: { endpoint: FCM, hora: 24 } }), 400], ['hora con decimales', pedir('/api/avisos/alta', { cuerpo: { endpoint: FCM, hora: 1.5 } }), 400],
    ['no es JSON', pedir('/api/avisos/alta', { cuerpo: '{{{' }), 400], ['demasiado grande', pedir('/api/avisos/alta', { cuerpo: JSON.stringify({ endpoint: FCM, hora: 1, relleno: 'x'.repeat(3000) }) }), 400],
    ['GET a alta', pedir('/api/avisos/alta', { metodo: 'GET' }), 405], ['otra ruta', pedir('/api/otra', { cuerpo: {} }), 404]]) { r = await worker.fetch(peticion, env); assert.equal(r.status, estado, caso); }
  assert.equal(filas().length, 0, 'nada de lo anterior se guardó');
  // el cron solo lo puede llamar el despertador, con su secreto
  for (const secreto of [null, '', 'otro', 'secreto-de-prueba-12', 'secreto-de-prueba-1234']) { r = await atender(new Request('https://granmasazon.app/api/avisos/cron', { method: 'POST', headers: secreto === null ? {} : { 'X-Cron-Secreto': secreto } }), env); assert.equal(r.status, 403, `cron con secreto «${secreto}»`); }
  r = await atender(new Request('https://granmasazon.app/api/avisos/cron', { method: 'POST', headers: { 'X-Cron-Secreto': 'secreto-de-prueba-123' } }), env); assert.equal(r.status, 200); assert.equal((await r.json()).atendidas, 0);
  r = await atender(pedir('/api/avisos/clave', { metodo: 'GET' }), { VAPID_PUBLICA: k.publica }); assert.equal(r.status, 503, 'sin base de datos enlazada, avisa que falta configurar');
  r = await worker.fetch(pedir('/api/avisos/alta', { cuerpo: { endpoint: FCM, hora: 1, nombre: 'Ana', idioma: 'es' } }), env); assert.equal(r.status, 200);
  assert.deepEqual(Object.keys(filas()[0]).sort(), ['creado', 'dias', 'endpoint', 'fallos', 'hora_utc', 'id', 'tipo', 'ultimo'], 'solo se guarda la dirección de avisos, la hora, los días y el tipo: ni nombre ni idioma');
  assert.equal(filas()[0].tipo, 'practicar'); assert.equal(filas()[0].dias, 127, 'la app vieja (sin tipo ni días) sigue funcionando: todos los días');
  assert.equal(filas()[0].id, await huella(FCM)); assert.equal(filas()[0].hora_utc, 1);
  await worker.fetch(pedir('/api/avisos/alta', { cuerpo: { endpoint: FCM, hora: 14 } }), env); assert.equal(filas().length, 1, 'el mismo teléfono no se repite'); assert.equal(filas()[0].hora_utc, 14, 'cambia la hora');
  // el segundo aviso («Te espero en clase») con sus días, para el mismo teléfono
  r = await worker.fetch(pedir('/api/avisos/alta', { cuerpo: { endpoint: FCM, hora: 16, tipo: 'clase', dias: 0b1000001 } }), env); assert.equal(r.status, 200);
  assert.equal(filas().length, 2, 'un renglón por aviso'); assert.deepEqual(filas().map((f) => [f.tipo, f.hora_utc, f.dias]).sort(), [['clase', 16, 65], ['practicar', 14, 127]]);
  for (const [caso, c] of [['tipo raro', { endpoint: FCM, hora: 1, tipo: 'publicidad' }], ['sin días', { endpoint: FCM, hora: 1, dias: 0 }], ['días de más', { endpoint: FCM, hora: 1, dias: 128 }], ['días con decimales', { endpoint: FCM, hora: 1, dias: 3.5 }]]) { r = await worker.fetch(pedir('/api/avisos/alta', { cuerpo: c }), env); assert.equal(r.status, 400, caso); }
  r = await worker.fetch(pedir('/api/avisos/baja', { cuerpo: { endpoint: FCM, tipo: 'clase' } }), env); assert.equal(r.status, 200); assert.deepEqual(filas().map((f) => f.tipo), ['practicar'], 'se quita solo el de clase');
  await worker.fetch(pedir('/api/avisos/alta', { cuerpo: { endpoint: FCM, hora: 16, tipo: 'clase', dias: 127 } }), env);
  r = await worker.fetch(pedir('/api/avisos/baja', { cuerpo: { endpoint: FCM } }), env); assert.equal(r.status, 200); assert.equal(filas().length, 0, 'sin tipo, se borran todos los avisos de ese teléfono');
});

test('avisos: el cron toca el timbre una vez al día, firmado y sin contenido; lo que ya no existe se borra', { skip: !sqlite }, async () => {
  const k = await llaves(), recibidos = [];
  const servicio = createServer((q, s) => { let n = 0; q.on('data', (c) => { n += c.length; }); q.on('end', () => { recibidos.push({ ruta: q.url, metodo: q.method, cuerpo: n, auth: q.headers.authorization, ttl: q.headers.ttl }); s.writeHead(q.url.startsWith('/ya-no') ? 410 : q.url.startsWith('/falla') ? 500 : 201); s.end(); }); }).listen(0);
  const host = `127.0.0.1:${servicio.address().port}`, DB = baseDePrueba(), env = { DB, VAPID_PUBLICA: k.publica, VAPID_PRIVADA: k.privada, HOST_DE_PRUEBA: host };
  const pon = async (ruta, hora, fallos = 0, tipo = 'practicar', dias = 127) => { const e = `http://${host}${ruta}/${'x'.repeat(20)}`; DB.crudo.prepare('INSERT INTO suscripciones (id, endpoint, hora_utc, creado, fallos, tipo, dias) VALUES (?, ?, ?, ?, ?, ?, ?)').run(await huella(e, tipo), e, hora, '2026-11-01', fallos, tipo, dias); return e; };
  const una = (ruta) => DB.crudo.prepare('SELECT * FROM suscripciones WHERE endpoint LIKE ?').get(`%${ruta}/%`);
  await pon('/bien', 1); await pon('/ya-no', 1); await pon('/falla', 1); await pon('/falla-vieja', 1, DIAS_DE_FALLO - 1); await pon('/otra-hora', 2);
  const ahora = new Date('2026-11-26T01:05:00Z');
  let res = await avisar(env, ahora); assert.equal(res.atendidas, 4, 'solo las de esta hora');
  assert.equal(recibidos.length, 4); assert.ok(!recibidos.some((x) => x.ruta.startsWith('/otra-hora')));
  for (const x of recibidos) { assert.equal(x.metodo, 'POST'); assert.equal(x.cuerpo, 0, 'el aviso viaja sin contenido'); assert.equal(x.ttl, '14400'); }
  // la firma: la puede comprobar cualquiera con la clave pública, va dirigida a ese servicio y caduca en menos de un día
  const m = recibidos[0].auth.match(/^vapid t=([\w-]+)\.([\w-]+)\.([\w-]+), k=([\w-]+)$/); assert.ok(m, 'cabecera VAPID'); assert.equal(m[4], k.publica);
  assert.ok(await crypto.subtle.verify({ name: 'ECDSA', hash: 'SHA-256' }, k.verificar, Buffer.from(m[3], 'base64url'), Buffer.from(`${m[1]}.${m[2]}`)), 'firma válida');
  const datos = JSON.parse(Buffer.from(m[2], 'base64url')); assert.equal(datos.aud, `http://${host}`); assert.equal(datos.sub, 'https://granmasazon.app'); assert.ok(datos.exp > Date.now() / 1000 && datos.exp < Date.now() / 1000 + 24 * 3600);
  assert.equal(una('/bien').ultimo, '2026-11-26'); assert.equal(una('/bien').fallos, 0);
  assert.equal(una('/ya-no'), undefined, 'el teléfono que ya no existe se borra');
  assert.equal(una('/falla').fallos, 1); assert.equal(una('/falla').ultimo, '2026-11-26', 'una falla pasajera se reintenta mañana, no cada 5 minutos');
  assert.equal(una('/falla-vieja'), undefined, `tras ${DIAS_DE_FALLO} días fallando, se borra`);
  assert.equal(una('/otra-hora').ultimo, null);
  res = await avisar(env, new Date('2026-11-26T01:10:00Z')); assert.equal(res.atendidas, 0, 'el mismo día no se repite'); assert.equal(recibidos.length, 4);
  res = await avisar(env, new Date('2026-11-27T01:00:00Z')); assert.equal(res.atendidas, 2, 'al día siguiente, otra vez');
  const cuenta = DB.crudo.prepare('SELECT estado, SUM(n) AS n FROM envios GROUP BY estado ORDER BY estado').all(); assert.deepEqual(cuenta.map((c) => [c.estado, c.n]), [[201, 2], [410, 1], [500, 3]], 'queda la cuenta de envíos, sin datos de nadie');
  assert.deepEqual(Object.keys(DB.crudo.prepare('SELECT * FROM envios').get()).sort(), ['dia', 'estado', 'n', 'servicio']);
  // días: el 26 de nov de 2026 es jueves (bit 4). Solo jueves → sí; solo sábado → no.
  const antes = recibidos.length;
  await pon('/jueves', 3, 0, 'practicar', 1 << 4); await pon('/sabado', 3, 0, 'practicar', 1 << 6);
  res = await avisar(env, new Date('2026-11-26T03:00:00Z')); assert.equal(res.atendidas, 1, 'solo el que tiene marcado el jueves');
  assert.ok(recibidos.slice(antes).every((x) => x.ruta.startsWith('/jueves')));
  // el mismo teléfono con práctica y clase a la misma hora: un solo toque, y quedan marcados los dos
  const doble = `http://${host}/doble/${'x'.repeat(20)}`;
  for (const t of ['practicar', 'clase']) DB.crudo.prepare('INSERT INTO suscripciones (id, endpoint, hora_utc, creado, tipo, dias) VALUES (?, ?, 4, ?, ?, 127)').run(await huella(doble, t), doble, '2026-11-01', t);
  const n0 = recibidos.length; res = await avisar(env, new Date('2026-11-26T04:00:00Z'));
  assert.equal(recibidos.length - n0, 1, 'un solo aviso para ese teléfono'); assert.equal(DB.crudo.prepare("SELECT COUNT(*) AS n FROM suscripciones WHERE endpoint = ? AND ultimo = '2026-11-26'").get(doble).n, 2);
  // muchas a la misma hora: salen por tandas (el plan gratis limita las llamadas por ejecución)
  for (let i = 0; i < POR_TANDA + 5; i++) await pon(`/tanda${i}`, 5);
  res = await avisar(env, new Date('2026-11-26T05:00:00Z')); assert.equal(res.atendidas, POR_TANDA);
  res = await avisar(env, new Date('2026-11-26T05:05:00Z')); assert.equal(res.atendidas, 5, 'el resto sale en la siguiente vuelta');
  servicio.close();
});

test('avisos: la función no trae librerías, no escribe secretos y solo responde a la app', () => {
  const w = readFileSync(join(RAIZ, 'functions/api/avisos/[[ruta]].js'), 'utf8') + readFileSync(join(RAIZ, 'servidor/avisos/despertador.js'), 'utf8');
  assert.ok(!/^import /m.test(w) && !/require\(/.test(w), 'sin dependencias');
  assert.ok(!/"d":\s*"|BEGIN (EC )?PRIVATE KEY/.test(w), 'la clave privada no está en el código');
  assert.deepEqual(ORIGENES, ['https://granmasazon.app']);
  assert.ok(!/console\.log\([^)]*endpoint/.test(w), 'no se registran direcciones de avisos');
  const pub = readFileSync(join(RAIZ, 'scripts/publicar-pages.mjs'), 'utf8'); assert.ok(pub.includes("'/api/avisos/*'"), 'Cloudflare manda /api/avisos/ a la función');
  assert.ok(/binding = "DB"/.test(readFileSync(join(RAIZ, 'wrangler.toml'), 'utf8')), 'la base de datos está enlazada al proyecto');
});
