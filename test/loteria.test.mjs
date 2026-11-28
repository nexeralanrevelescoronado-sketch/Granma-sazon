// Pruebas del servidor de la lotería en familia (functions/api/loteria/[[ruta]].js): la función de verdad contra SQLite.
import test from 'node:test'; import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs'; import { join, dirname } from 'node:path'; import { fileURLToPath } from 'node:url';
import { atender, limpiarApodo, ORIGEN, VIDA_MS } from '../functions/api/loteria/[[ruta]].js';
import { armarPartida } from '../js/loteria.js';
const R = join(dirname(fileURLToPath(import.meta.url)), '..');
let sqlite = null; try { sqlite = await import('node:sqlite'); } catch { /* sin SQLite */ }
function base() {
  const db = new sqlite.DatabaseSync(':memory:'); db.exec(readFileSync(join(R, 'servidor/loteria.sql'), 'utf8'));
  const orden = (sql, args = []) => ({ bind: (...a) => orden(sql, a), all: async () => ({ results: db.prepare(sql).all(...args) }), first: async () => db.prepare(sql).get(...args) ?? null, run: async () => ({ success: true, meta: { changes: Number(db.prepare(sql).run(...args).changes) } }) });
  return { prepare: (sql) => orden(sql), batch: async (l) => { for (const o of l) await o.run(); }, crudo: db };
}
const pedir = (ruta, { cuerpo, origen = ORIGEN, metodo } = {}) => new Request(ORIGEN + ruta, { method: metodo || (cuerpo ? 'POST' : 'GET'), headers: { 'Content-Type': 'application/json', ...(origen ? { Origin: origen } : {}) }, body: cuerpo ? JSON.stringify(cuerpo) : undefined });
const J = async (r) => ({ estado: r.status, ...(await r.json()) });

test('apodos: cortos, sin nombres raros ni palabras feas', () => {
  assert.equal(limpiarApodo('  Tía   Chayo '), 'Tía Chayo'); assert.equal(limpiarApodo('Beto2'), 'Beto2');
  for (const malo of ['', ' ', 'a'.repeat(17), '<script>', 'ana@correo.com', 'pendejo', 'Pínche', 'FUCK', null]) assert.equal(limpiarApodo(malo), null, String(malo));
});

test('lotería en familia: crear, unirse, empezar a la misma hora, y gana el primero que de verdad llena su tabla', { skip: !sqlite }, async () => {
  const DB = base(), env = { DB }; let t = 1_000_000;
  let r = await J(await atender(pedir('/api/loteria/crear', { cuerpo: { apodo: 'Granma', nivel: 1, idioma: 'en' }, origen: 'https://otro.example' }), env, t)); assert.equal(r.estado, 403, 'otro sitio no crea partidas');
  r = await J(await atender(pedir('/api/loteria/crear', { cuerpo: { apodo: 'pendejo', nivel: 1 } }), env, t)); assert.equal(r.error, 'apodo');
  const host = await J(await atender(pedir('/api/loteria/crear', { cuerpo: { apodo: 'Granma', nivel: 1, idioma: 'en' } }), env, t));
  assert.ok(host.ok && /^[A-HJKMNP-Z2-9]{5}$/.test(host.codigo) && host.numero === 0);
  const beto = await J(await atender(pedir('/api/loteria/unirse', { cuerpo: { codigo: host.codigo.toLowerCase(), apodo: 'Beto' } }), env, t));
  assert.ok(beto.ok && beto.numero === 1 && beto.semilla === host.semilla, 'el código sirve en minúsculas y comparte la semilla');
  r = await J(await atender(pedir('/api/loteria/unirse', { cuerpo: { codigo: host.codigo, apodo: 'beto' } }), env, t)); assert.equal(r.error, 'apodo-repetido');
  r = await J(await atender(pedir('/api/loteria/unirse', { cuerpo: { codigo: 'ZZZZZ', apodo: 'Ana' } }), env, t)); assert.equal(r.estado, 404);
  r = await J(await atender(pedir('/api/loteria/empezar', { cuerpo: { codigo: host.codigo, token: beto.token } }), env, t)); assert.equal(r.estado, 403, 'solo quien la creó la empieza');
  r = await J(await atender(pedir('/api/loteria/empezar', { cuerpo: { codigo: host.codigo, token: 'f'.repeat(48) } }), env, t)); assert.equal(r.estado, 401);
  const emp = await J(await atender(pedir('/api/loteria/empezar', { cuerpo: { codigo: host.codigo, token: host.token } }), env, t));
  assert.equal(emp.inicio, t + 5000, 'empieza en 5 s para todos');
  r = await J(await atender(pedir('/api/loteria/unirse', { cuerpo: { codigo: host.codigo, apodo: 'Tardío' } }), env, t)); assert.equal(r.error, 'ya-empezo');
  // lo que ve cada quien: solo apodos y cuántas lleva
  let e = await J(await atender(pedir(`/api/loteria/estado?codigo=${host.codigo}`), env, t));
  assert.deepEqual(e.jugadores.map((j) => j.apodo), ['Granma', 'Beto']); assert.ok(!JSON.stringify(e).includes(host.token) && !('semilla' in e.partida), 'no se reparten tokens ni la semilla en el estado');
  // Beto intenta trampa: dice que llenó antes de que salgan las cartas
  const pB = armarPartida({ nivel: 1, semilla: beto.semilla, jugador: 1 }), pH = armarPartida({ nivel: 1, semilla: host.semilla, jugador: 0 });
  r = await J(await atender(pedir('/api/loteria/marcar', { cuerpo: { codigo: host.codigo, token: beto.token, marcadas: pB.tabla, loteria: true } }), env, t + 6000));
  assert.ok(!r.gano && r.motivo === 'incompleta', 'no gana con cartas que todavía no salen');
  // cuando ya salieron todas las de su tabla, gana
  const cuando = (p) => Math.max(...p.tabla.map((id) => p.llamadas.indexOf(id))) * p.paso + 1;
  const tB = emp.inicio + cuando(pB), tH = emp.inicio + cuando(pH);
  const primero = tB <= tH ? { yo: beto, p: pB, t: tB, apodo: 'Beto' } : { yo: host, p: pH, t: tH, apodo: 'Granma' }, segundo = primero.yo === beto ? { yo: host, p: pH } : { yo: beto, p: pB };
  r = await J(await atender(pedir('/api/loteria/marcar', { cuerpo: { codigo: host.codigo, token: primero.yo.token, marcadas: primero.p.tabla, loteria: true } }), env, primero.t));
  assert.ok(r.gano && r.ganador === primero.apodo, `gana ${primero.apodo}`);
  r = await J(await atender(pedir('/api/loteria/marcar', { cuerpo: { codigo: host.codigo, token: segundo.yo.token, marcadas: segundo.p.tabla, loteria: true } }), env, emp.inicio + segundo.p.duracion));
  assert.ok(!r.gano && r.ganador === primero.apodo, 'el segundo ya no gana: hay un solo ganador');
  e = await J(await atender(pedir(`/api/loteria/estado?codigo=${host.codigo}`), env, primero.t + 10)); assert.equal(e.partida.ganador, primero.apodo);
  // a las 24 horas se borra todo
  await J(await atender(pedir('/api/loteria/crear', { cuerpo: { apodo: 'Otra', nivel: 2 } }), env, t + VIDA_MS + 1));
  assert.equal(DB.crudo.prepare('SELECT COUNT(*) n FROM loteria_jugadores WHERE codigo = ?').get(host.codigo).n, 0, 'los apodos se borran a las 24 h');
  assert.equal((await J(await atender(pedir(`/api/loteria/estado?codigo=${host.codigo}`), env, t + VIDA_MS + 2))).estado, 404);
  // lo que se guarda: ni nombre real, ni correo, ni teléfono
  const cols = DB.crudo.prepare("SELECT name FROM pragma_table_info('loteria_jugadores')").all().map((c) => c.name).sort();
  assert.deepEqual(cols, ['anfitrion', 'apodo', 'codigo', 'marcadas', 'numero', 'token']);
});

test('lotería en familia: máximo 12 por partida y respuestas sin caché', { skip: !sqlite }, async () => {
  const env = { DB: base() }, t = 5_000_000;
  const h = await J(await atender(pedir('/api/loteria/crear', { cuerpo: { apodo: 'Anfitrión', nivel: 1 } }), env, t));
  for (let i = 1; i < 12; i++) assert.ok((await J(await atender(pedir('/api/loteria/unirse', { cuerpo: { codigo: h.codigo, apodo: `Primo ${i}` } }), env, t))).ok);
  assert.equal((await J(await atender(pedir('/api/loteria/unirse', { cuerpo: { codigo: h.codigo, apodo: 'Uno más' } }), env, t))).error, 'llena');
  const res = await atender(pedir(`/api/loteria/estado?codigo=${h.codigo}`), env, t); assert.equal(res.headers.get('Cache-Control'), 'no-store');
});
