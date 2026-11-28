// Lotería en familia: partidas con código para jugar con amigos y familia. Código propio, sin librerías.
//   POST /api/loteria/crear   { apodo, nivel, idioma }  → crea la partida (quien la crea la empieza) → { codigo, token, numero, semilla, nivel, idioma }
//   POST /api/loteria/unirse  { codigo, apodo }          → entra a una partida que no ha empezado
//   POST /api/loteria/empezar { codigo, token }          → quien la creó la arranca (en 5 s, para todos a la misma hora)
//   GET  /api/loteria/estado?codigo=XXXXX                → jugadores (apodo y cuántas lleva), si ya empezó y quién ganó
//   POST /api/loteria/marcar  { codigo, token, marcadas, loteria? } → avance; con «loteria: true» el servidor revisa que
//        la tabla esté llena con cartas que de verdad ya salieron, y el primero que lo logra gana.
// Privacidad (aprobado por el dueño, nov 2026): solo un APODO (no el nombre real), cuántas cartas lleva y quién ganó.
// Todo se borra solo a las 24 horas. Nada de correo, teléfono, ubicación ni voz. Enlace: DB (D1).
import { armarPartida, yaSalio, NIVELES, GRACIA } from '../../../js/loteria.js';

export const ORIGEN = 'https://granmasazon.app', VIDA_MS = 24 * 3600 * 1000, MAX_JUGADORES = 12, ESPERA_INICIO = 5000, TOLERANCIA = 1500;
const LETRAS = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';     // sin 0/O ni 1/I/L, que se confunden al dictarlos
const json = (obj, estado = 200) => new Response(JSON.stringify(obj), { status: estado, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });
const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
export const sha256 = async (s) => hex(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(s)));
const origenBueno = (req, env) => { const o = req.headers.get('Origin'); return !!o && (o === ORIGEN || (!!env.ORIGEN_DE_PRUEBA && o === env.ORIGEN_DE_PRUEBA)); };
const codigoValido = (c) => typeof c === 'string' && new RegExp(`^[${LETRAS}]{5}$`).test(c);
const nuevoCodigo = () => { const b = crypto.getRandomValues(new Uint8Array(5)); return [...b].map((x) => LETRAS[x % LETRAS.length]).join(''); };
const nuevoToken = () => hex(crypto.getRandomValues(new Uint8Array(24)));

// Apodos: cortos, solo letras, números y espacios; sin palabras feas (la juegan niños).
const FEAS = /(puto|puta|pendej|verga|chinga|mierda|culer|cabron|cabrón|joto|pinche|fuck|shit|bitch|dick|pussy|nazi|sex|porn|idiot|estupid|estúpid|tont[oa]|idiota|marica|naco)/i;
export function limpiarApodo(a) {
  const s = String(a ?? '').normalize('NFC').replace(/\s+/g, ' ').trim();
  if (!/^[\p{L}\p{N} ]{1,16}$/u.test(s)) return null;
  if (FEAS.test(s.normalize('NFD').replace(/[̀-ͯ]/g, '')) || FEAS.test(s)) return null;
  return s;
}

async function leer(req) { try { const t = await req.text(); if (t.length > 4096) return null; return JSON.parse(t); } catch { return null; } }
async function limpiarViejas(env, ahora) {
  const viejas = ahora - VIDA_MS;
  await env.DB.batch([
    env.DB.prepare('DELETE FROM loteria_jugadores WHERE codigo IN (SELECT codigo FROM loteria_partidas WHERE creada < ?1)').bind(viejas),
    env.DB.prepare('DELETE FROM loteria_partidas WHERE creada < ?1').bind(viejas),
  ]);
}
const partidaDe = (env, codigo) => env.DB.prepare('SELECT codigo, semilla, nivel, idioma, creada, inicio, ganador, gano_en FROM loteria_partidas WHERE codigo = ?1').bind(codigo).first();
const jugadorDe = async (env, codigo, token) => (typeof token === 'string' && /^[0-9a-f]{48}$/.test(token) ? env.DB.prepare('SELECT numero, apodo, anfitrion FROM loteria_jugadores WHERE codigo = ?1 AND token = ?2').bind(codigo, await sha256(token)).first() : null);
const publica = (p) => ({ codigo: p.codigo, nivel: p.nivel, idioma: p.idioma, inicio: p.inicio, ganador: p.ganador, ganoEn: p.gano_en });

export async function atender(req, env, ahora = Date.now()) {
  const url = new URL(req.url), ruta = url.pathname.replace(/\/+$/, ''), m = req.method;
  if (!env.DB) return json({ ok: false, error: 'sin-servidor' }, 503);
  if (m !== 'GET' && !origenBueno(req, env)) return json({ ok: false, error: 'origen' }, 403);

  if (m === 'GET' && ruta === '/api/loteria/estado') {
    const codigo = (url.searchParams.get('codigo') || '').toUpperCase(); if (!codigoValido(codigo)) return json({ ok: false, error: 'codigo' }, 400);
    const p = await partidaDe(env, codigo); if (!p || p.creada < ahora - VIDA_MS) return json({ ok: false, error: 'no-existe' }, 404);
    const { results } = await env.DB.prepare('SELECT numero, apodo, marcadas, anfitrion FROM loteria_jugadores WHERE codigo = ?1 ORDER BY numero').bind(codigo).all();
    return json({ ok: true, ahora, partida: publica(p), jugadores: results.map((j) => ({ numero: j.numero, apodo: j.apodo, marcadas: j.marcadas, anfitrion: !!j.anfitrion })) });
  }
  if (m !== 'POST') return json({ ok: false, error: 'no-existe' }, 404);
  const d = await leer(req); if (!d || typeof d !== 'object') return json({ ok: false, error: 'datos' }, 400);

  if (ruta === '/api/loteria/crear') {
    const apodo = limpiarApodo(d.apodo); if (!apodo) return json({ ok: false, error: 'apodo' }, 400);
    const nivel = Math.min(NIVELES.length, Math.max(1, Math.floor(+d.nivel || 1))), idioma = d.idioma === 'es' ? 'es' : 'en';
    await limpiarViejas(env, ahora);
    let codigo = null; for (let i = 0; i < 6 && !codigo; i++) { const c = nuevoCodigo(); if (!(await partidaDe(env, c))) codigo = c; }
    if (!codigo) return json({ ok: false, error: 'ocupado' }, 503);
    const semilla = crypto.getRandomValues(new Uint32Array(1))[0], token = nuevoToken();
    await env.DB.batch([
      env.DB.prepare('INSERT INTO loteria_partidas (codigo, semilla, nivel, idioma, creada) VALUES (?1, ?2, ?3, ?4, ?5)').bind(codigo, semilla, nivel, idioma, ahora),
      env.DB.prepare('INSERT INTO loteria_jugadores (codigo, token, numero, apodo, anfitrion, marcadas) VALUES (?1, ?2, 0, ?3, 1, 0)').bind(codigo, await sha256(token), apodo),
    ]);
    return json({ ok: true, ahora, codigo, token, numero: 0, semilla, nivel, idioma });
  }

  const codigo = String(d.codigo || '').toUpperCase(); if (!codigoValido(codigo)) return json({ ok: false, error: 'codigo' }, 400);
  const p = await partidaDe(env, codigo); if (!p || p.creada < ahora - VIDA_MS) return json({ ok: false, error: 'no-existe' }, 404);

  if (ruta === '/api/loteria/unirse') {
    const apodo = limpiarApodo(d.apodo); if (!apodo) return json({ ok: false, error: 'apodo' }, 400);
    if (p.inicio) return json({ ok: false, error: 'ya-empezo' }, 409);
    const { results } = await env.DB.prepare('SELECT numero, apodo FROM loteria_jugadores WHERE codigo = ?1').bind(codigo).all();
    if (results.length >= MAX_JUGADORES) return json({ ok: false, error: 'llena' }, 409);
    if (results.some((j) => j.apodo.toLowerCase() === apodo.toLowerCase())) return json({ ok: false, error: 'apodo-repetido' }, 409);
    const numero = Math.max(...results.map((j) => j.numero)) + 1, token = nuevoToken();
    await env.DB.prepare('INSERT INTO loteria_jugadores (codigo, token, numero, apodo, anfitrion, marcadas) VALUES (?1, ?2, ?3, ?4, 0, 0)').bind(codigo, await sha256(token), numero, apodo).run();
    return json({ ok: true, ahora, codigo, token, numero, semilla: p.semilla, nivel: p.nivel, idioma: p.idioma });
  }

  const yo = await jugadorDe(env, codigo, d.token); if (!yo) return json({ ok: false, error: 'token' }, 401);

  if (ruta === '/api/loteria/empezar') {
    if (!yo.anfitrion) return json({ ok: false, error: 'solo-quien-la-creo' }, 403);
    if (p.inicio) return json({ ok: true, ahora, inicio: p.inicio });
    const inicio = ahora + ESPERA_INICIO;
    await env.DB.prepare('UPDATE loteria_partidas SET inicio = ?1 WHERE codigo = ?2 AND inicio IS NULL').bind(inicio, codigo).run();
    return json({ ok: true, ahora, inicio });
  }

  if (ruta === '/api/loteria/marcar') {
    if (!p.inicio || ahora < p.inicio) return json({ ok: false, error: 'no-ha-empezado' }, 409);
    const partida = armarPartida({ nivel: p.nivel, semilla: p.semilla, jugador: yo.numero }), ms = ahora - p.inicio + TOLERANCIA;
    const marcadas = Array.isArray(d.marcadas) ? [...new Set(d.marcadas.filter((id) => typeof id === 'string'))].slice(0, 32) : [];
    const buenas = marcadas.filter((id) => partida.tabla.includes(id) && yaSalio(partida, id, ms));      // solo cuentan las que ya salieron
    await env.DB.prepare('UPDATE loteria_jugadores SET marcadas = ?1 WHERE codigo = ?2 AND numero = ?3').bind(buenas.length, codigo, yo.numero).run();
    if (!d.loteria) return json({ ok: true, ahora, marcadas: buenas.length, ganador: p.ganador });
    const llena = buenas.length === partida.tabla.length, aTiempo = ahora - p.inicio <= partida.duracion + GRACIA;
    if (!llena || !aTiempo) return json({ ok: true, ahora, gano: false, ganador: p.ganador, motivo: llena ? 'tarde' : 'incompleta' });
    const r = await env.DB.prepare('UPDATE loteria_partidas SET ganador = ?1, gano_en = ?2 WHERE codigo = ?3 AND ganador IS NULL').bind(yo.apodo, ahora, codigo).run();
    const gano = (r.meta?.changes ?? 0) > 0; const g = gano ? yo.apodo : (await partidaDe(env, codigo)).ganador;
    return json({ ok: true, ahora, gano, ganador: g });
  }
  return json({ ok: false, error: 'no-existe' }, 404);
}

export const onRequest = ({ request, env }) => atender(request, env);
