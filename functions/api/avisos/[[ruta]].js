// Recordatorio diario de Granma Sazón: función de Cloudflare Pages + base D1. Código propio, sin librerías.
//   POST /api/avisos/alta  { endpoint, hora, tipo?, dias? } → guarda (o actualiza) un aviso: `hora` en UTC (0-23), `tipo` 'practicar' o 'clase',
//                                                            `dias` = días de la semana EN UTC como máscara (bit 0 = domingo … bit 6 = sábado; 127 = todos)
//   POST /api/avisos/baja  { endpoint, tipo? }   → borra ese aviso (sin `tipo`, todos los de ese teléfono)
//   GET  /api/avisos/clave                      → la clave pública con la que el navegador crea la suscripción
//   POST /api/avisos/cron  (con el secreto)     → lo llama cada 5 minutos el «despertador» (servidor/avisos/despertador.js):
//                                                  avisa a quien le toca a esa hora, una vez al día
// El aviso viaja SIN contenido: el servidor solo «toca el timbre» y el teléfono arma el texto (ver sw.js). Por eso
// aquí no se guarda ni se manda idioma, nombre ni avance, y no hace falta cifrar nada.
// Enlaces: DB (D1) y VAPID_PUBLICA en wrangler.toml; VAPID_PRIVADA (JWK) y CRON_SECRETO son secretos del proyecto en Cloudflare.

export const ORIGENES = ['https://granmasazon.app'];
// Solo se aceptan direcciones de los servicios de avisos de los navegadores: así nadie puede usar este servidor para llamar a otro sitio.
export const SERVICIOS = [/^fcm\.googleapis\.com$/, /(^|\.)push\.services\.mozilla\.com$/, /(^|\.)push\.apple\.com$/, /(^|\.)notify\.windows\.com$/];
export const MAX_SUSCRIPCIONES = 50000, POR_TANDA = 40, DIAS_DE_FALLO = 7, TIPOS = ['practicar', 'clase'];

const json = (obj, estado = 200) => new Response(JSON.stringify(obj), { status: estado, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' } });
const b64u = (bytes) => btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const texto = (s) => new TextEncoder().encode(s);

export async function huella(endpoint, tipo = 'practicar') { const base = tipo === 'practicar' ? endpoint : `${endpoint}|${tipo}`; return [...new Uint8Array(await crypto.subtle.digest('SHA-256', texto(base)))].map((b) => b.toString(16).padStart(2, '0')).join(''); }

export function endpointValido(endpoint, env = {}) {
  if (typeof endpoint !== 'string' || endpoint.length < 20 || endpoint.length > 1024) return false;
  let u; try { u = new URL(endpoint); } catch { return false; }
  if (env.HOST_DE_PRUEBA && u.host === env.HOST_DE_PRUEBA) return true;                 // solo en pruebas locales
  return u.protocol === 'https:' && !u.username && !u.password && SERVICIOS.some((r) => r.test(u.hostname));
}
const origenPermitido = (req, env) => { const o = req.headers.get('Origin'); return !!o && (ORIGENES.includes(o) || (!!env.ORIGEN_DE_PRUEBA && o === env.ORIGEN_DE_PRUEBA)); };
async function cuerpo(req) { const t = await req.text(); if (t.length > 2048) return null; try { const o = JSON.parse(t); return o && typeof o === 'object' ? o : null; } catch { return null; } }

/* ---------- firma VAPID (identifica a Granma Sazón ante el servicio de avisos) ---------- */
export async function firmaVapid(origenDelServicio, env, ahora = Date.now()) {
  const llave = await crypto.subtle.importKey('jwk', JSON.parse(env.VAPID_PRIVADA), { name: 'ECDSA', namedCurve: 'P-256' }, false, ['sign']);
  const cabeza = b64u(texto(JSON.stringify({ typ: 'JWT', alg: 'ES256' }))), datos = b64u(texto(JSON.stringify({ aud: origenDelServicio, exp: Math.floor(ahora / 1000) + 12 * 3600, sub: ORIGENES[0] })));
  const firma = await crypto.subtle.sign({ name: 'ECDSA', hash: 'SHA-256' }, llave, texto(`${cabeza}.${datos}`));
  return `${cabeza}.${datos}.${b64u(firma)}`;
}

/** Toca el timbre de un teléfono (aviso sin contenido). Devuelve el código de respuesta del servicio, o 0 si no hubo conexión. */
export async function tocar(endpoint, env, firmas = new Map()) {
  const origen = new URL(endpoint).origin;
  if (!firmas.has(origen)) firmas.set(origen, await firmaVapid(origen, env));
  try {
    const r = await fetch(endpoint, { method: 'POST', headers: { Authorization: `vapid t=${firmas.get(origen)}, k=${env.VAPID_PUBLICA}`, TTL: '14400', Urgency: 'normal', 'Content-Length': '0' } });
    return r.status;
  } catch { return 0; }
}

/** Lo que corre cada 5 minutos: avisa a quienes les toca en esta hora y este día (UTC) y todavía no recibieron el de hoy. Un teléfono
 *  con dos avisos a la misma hora (práctica y clase) recibe un solo toque: el teléfono decide qué texto mostrar. Devuelve un resumen. */
export async function avisar(env, ahora = new Date()) {
  const hora = ahora.getUTCHours(), dia = ahora.toISOString().slice(0, 10), bit = 1 << ahora.getUTCDay(), firmas = new Map(), cuenta = {}, ordenes = [];
  const { results: filas = [] } = await env.DB.prepare('SELECT id, endpoint, fallos FROM suscripciones WHERE hora_utc = ?1 AND (dias & ?4) <> 0 AND (ultimo IS NULL OR ultimo <> ?2) LIMIT ?3').bind(hora, dia, POR_TANDA, bit).all();
  // misma dirección, varios avisos a esta hora → un solo toque, y se marcan todos
  const porTelefono = new Map(); for (const f of filas) { const t = porTelefono.get(f.endpoint); if (t) { t.ids.push(f.id); t.fallos = Math.max(t.fallos, f.fallos); } else porTelefono.set(f.endpoint, { endpoint: f.endpoint, ids: [f.id], fallos: f.fallos }); }
  const results = [...porTelefono.values()];
  for (const s of results) {
    const estado = endpointValido(s.endpoint, env) ? await tocar(s.endpoint, env, firmas) : 410;
    let servicio = 'otro'; try { servicio = new URL(s.endpoint).hostname.split('.').slice(-2).join('.'); } catch { /* dirección rota */ }
    cuenta[`${servicio}|${estado}`] = (cuenta[`${servicio}|${estado}`] || 0) + 1;
    for (const id of s.ids) {
      if (estado >= 200 && estado < 300) ordenes.push(env.DB.prepare('UPDATE suscripciones SET ultimo = ?1, fallos = 0 WHERE id = ?2').bind(dia, id));
      else if (estado === 404 || estado === 410 || s.fallos + 1 >= DIAS_DE_FALLO) ordenes.push(env.DB.prepare('DELETE FROM suscripciones WHERE id = ?1').bind(id));   // el teléfono ya no existe o lleva una semana sin responder
      else ordenes.push(env.DB.prepare('UPDATE suscripciones SET ultimo = ?1, fallos = fallos + 1 WHERE id = ?2').bind(dia, id));                             // falla pasajera: se intenta mañana
    }
  }
  for (const [k, n] of Object.entries(cuenta)) { const [servicio, estado] = k.split('|'); ordenes.push(env.DB.prepare('INSERT INTO envios (dia, servicio, estado, n) VALUES (?1, ?2, ?3, ?4) ON CONFLICT(dia, servicio, estado) DO UPDATE SET n = n + ?4').bind(dia, servicio, +estado, n)); }
  if (ordenes.length) await env.DB.batch(ordenes);
  return { hora, dia, atendidas: results.length, cuenta };
}

const igual = (a, b) => { if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) return false; let d = 0; for (let i = 0; i < a.length; i++) d |= a.charCodeAt(i) ^ b.charCodeAt(i); return d === 0; };

export async function atender(req, env) {
  const ruta = new URL(req.url).pathname.replace(/\/+$/, '');
  if (!ruta.startsWith('/api/avisos')) return json({ ok: false, error: 'no-existe' }, 404);
  if (!env.DB || !env.VAPID_PUBLICA) return json({ ok: false, error: 'sin-configurar' }, 503);
  if (req.method === 'GET' && ruta === '/api/avisos/clave') return json({ ok: true, clave: env.VAPID_PUBLICA });
  if (req.method !== 'POST') return json({ ok: false, error: 'metodo' }, 405);
  if (ruta === '/api/avisos/cron') {                                  // solo el despertador, con su secreto
    if (!env.CRON_SECRETO || !env.VAPID_PRIVADA || !igual(req.headers.get('X-Cron-Secreto') || '', env.CRON_SECRETO)) return json({ ok: false, error: 'origen' }, 403);
    return json({ ok: true, ...(await avisar(env)) });
  }
  if (!origenPermitido(req, env)) return json({ ok: false, error: 'origen' }, 403);
  const b = await cuerpo(req); if (!b || !endpointValido(b.endpoint, env)) return json({ ok: false, error: 'datos' }, 400);
  const tipo = b.tipo ?? 'practicar'; if (!TIPOS.includes(tipo)) return json({ ok: false, error: 'tipo' }, 400);
  const id = await huella(b.endpoint, tipo);
  if (ruta === '/api/avisos/baja') {
    if (b.tipo === undefined) await env.DB.prepare('DELETE FROM suscripciones WHERE endpoint = ?1').bind(b.endpoint).run();   // sin tipo: todos los avisos de ese teléfono
    else await env.DB.prepare('DELETE FROM suscripciones WHERE id = ?1').bind(id).run();
    return json({ ok: true });
  }
  if (ruta === '/api/avisos/alta') {
    if (!Number.isInteger(b.hora) || b.hora < 0 || b.hora > 23) return json({ ok: false, error: 'hora' }, 400);
    const dias = b.dias ?? 127; if (!Number.isInteger(dias) || dias < 1 || dias > 127) return json({ ok: false, error: 'dias' }, 400);
    const ya = await env.DB.prepare('SELECT 1 AS si FROM suscripciones WHERE id = ?1').bind(id).first();
    if (!ya) { const t = await env.DB.prepare('SELECT COUNT(*) AS n FROM suscripciones').first(); if ((t?.n || 0) >= MAX_SUSCRIPCIONES) return json({ ok: false, error: 'lleno' }, 503); }
    await env.DB.prepare('INSERT INTO suscripciones (id, endpoint, hora_utc, creado, tipo, dias) VALUES (?1, ?2, ?3, ?4, ?5, ?6) ON CONFLICT(id) DO UPDATE SET hora_utc = ?3, dias = ?6, fallos = 0, ultimo = NULL').bind(id, b.endpoint, b.hora, new Date().toISOString().slice(0, 10), tipo, dias).run();
    return json({ ok: true });
  }
  return json({ ok: false, error: 'no-existe' }, 404);
}

// Cloudflare Pages llama a esta función para todo lo que empiece con /api/avisos/
export const onRequest = ({ request, env }) => atender(request, env);
