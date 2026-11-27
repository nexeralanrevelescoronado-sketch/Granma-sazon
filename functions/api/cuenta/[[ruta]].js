// Cuentas con Google para guardar el avance y pasarlo a otro teléfono. Código propio, sin librerías.
//   GET    /api/cuenta/config     → { clientId } para armar el botón «Entrar con Google» (vacío = todavía no se configura)
//   POST   /api/cuenta/entrar     { idToken, nonce } → revisa el token de Google y abre una sesión (cookie HttpOnly)
//   GET    /api/cuenta/progreso   → el avance guardado en la cuenta
//   PUT    /api/cuenta/progreso   { progreso } → guarda el avance (máximo 256 KB)
//   POST   /api/cuenta/salir      → cierra la sesión de este teléfono
//   DELETE /api/cuenta            → borra la cuenta, su avance y todas sus sesiones
// Privacidad: a Google solo se le pide el permiso «openid». De la cuenta se guarda una huella del identificador de Google
// (no el identificador, ni el correo, ni el nombre) y el avance. Enlaces: DB (D1) y GOOGLE_CLIENT_ID (texto, no es secreto).

export const ORIGEN = 'https://granmasazon.app', MAX_PROGRESO = 256 * 1024, DIAS_SESION = 180;
const EMISORES = ['https://accounts.google.com', 'accounts.google.com'], LLAVES_GOOGLE = 'https://www.googleapis.com/oauth2/v3/certs';
const COOKIE = 'granma_sesion';

const json = (obj, estado = 200, extra = {}) => new Response(JSON.stringify(obj), { status: estado, headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store', ...extra } });
const texto = (s) => new TextEncoder().encode(s);
const deB64u = (s) => Uint8Array.from(atob(s.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (s.length % 4)) % 4)), (c) => c.charCodeAt(0));
const hex = (buf) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
export const sha256 = async (s) => hex(await crypto.subtle.digest('SHA-256', texto(s)));
const leerCookie = (req) => { const m = (req.headers.get('Cookie') || '').match(new RegExp(`(?:^|;\\s*)${COOKIE}=([A-Za-z0-9_-]{20,100})`)); return m ? m[1] : null; };
const cookie = (valor, segundos) => `${COOKIE}=${valor}; Path=/api/cuenta; Max-Age=${segundos}; HttpOnly; Secure; SameSite=Lax`;
const origenBueno = (req, env) => { const o = req.headers.get('Origin'); return !!o && (o === ORIGEN || (!!env.ORIGEN_DE_PRUEBA && o === env.ORIGEN_DE_PRUEBA)); };

/* ---------- token de Google (OpenID Connect) ---------- */
let llavesEnMemoria = { llaves: null, hasta: 0 };
async function llavesDeGoogle(env, ahora) {
  if (env.LLAVES_DE_PRUEBA) return env.LLAVES_DE_PRUEBA;                     // solo en pruebas
  if (llavesEnMemoria.llaves && ahora < llavesEnMemoria.hasta) return llavesEnMemoria.llaves;
  const r = await fetch(LLAVES_GOOGLE); if (!r.ok) throw new Error('sin llaves de Google');
  const edad = +((r.headers.get('Cache-Control') || '').match(/max-age=(\d+)/)?.[1] || 3600);
  llavesEnMemoria = { llaves: (await r.json()).keys || [], hasta: ahora + Math.min(edad, 6 * 3600) * 1000 };
  return llavesEnMemoria.llaves;
}
/** Revisa el token: firma de Google, para esta app, vigente, reciente y con el número de un solo uso que mandó el teléfono. Devuelve los datos o lanza un error. */
export async function revisarToken(idToken, nonce, env, ahora = Date.now()) {
  if (typeof idToken !== 'string' || idToken.length > 4096 || !/^[\w-]+\.[\w-]+\.[\w-]+$/.test(idToken)) throw new Error('token');
  const [c, d, f] = idToken.split('.'), cabeza = JSON.parse(new TextDecoder().decode(deB64u(c))), datos = JSON.parse(new TextDecoder().decode(deB64u(d)));
  if (cabeza.alg !== 'RS256' || !cabeza.kid) throw new Error('algoritmo');
  const jwk = (await llavesDeGoogle(env, ahora)).find((k) => k.kid === cabeza.kid); if (!jwk) throw new Error('llave');
  const llave = await crypto.subtle.importKey('jwk', { kty: jwk.kty, n: jwk.n, e: jwk.e, alg: 'RS256', ext: true }, { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' }, false, ['verify']);
  if (!(await crypto.subtle.verify('RSASSA-PKCS1-v1_5', llave, deB64u(f), texto(`${c}.${d}`)))) throw new Error('firma');
  const s = Math.floor(ahora / 1000);
  if (!EMISORES.includes(datos.iss)) throw new Error('emisor');
  if (!env.GOOGLE_CLIENT_ID || datos.aud !== env.GOOGLE_CLIENT_ID) throw new Error('app');
  if (!(datos.exp > s - 60) || !(datos.iat > s - 600) || datos.iat > s + 60) throw new Error('vencido');
  if (typeof nonce !== 'string' || nonce.length < 16 || datos.nonce !== nonce) throw new Error('nonce');
  if (typeof datos.sub !== 'string' || !datos.sub) throw new Error('sub');
  return datos;
}

async function sesion(req, env) {
  const t = leerCookie(req); if (!t) return null;
  const f = await env.DB.prepare('SELECT cuenta, expira FROM sesiones WHERE token = ?1').bind(await sha256(t)).first();
  return f && f.expira > Date.now() ? { cuenta: f.cuenta, token: t } : null;
}

export async function atender(req, env) {
  const ruta = new URL(req.url).pathname.replace(/\/+$/, ''), m = req.method;
  if (!ruta.startsWith('/api/cuenta')) return json({ ok: false, error: 'no-existe' }, 404);
  if (m === 'GET' && ruta === '/api/cuenta/config') return json({ ok: true, clientId: env.GOOGLE_CLIENT_ID || '' });
  if (!env.DB || !env.GOOGLE_CLIENT_ID) return json({ ok: false, error: 'sin-configurar' }, 503);
  if (m !== 'GET' && !origenBueno(req, env)) return json({ ok: false, error: 'origen' }, 403);    // contra peticiones desde otros sitios

  if (m === 'POST' && ruta === '/api/cuenta/entrar') {
    let b; try { const t = await req.text(); if (t.length > 6000) throw 0; b = JSON.parse(t); } catch { return json({ ok: false, error: 'datos' }, 400); }
    let datos; try { datos = await revisarToken(b?.idToken, b?.nonce, env); } catch (e) { return json({ ok: false, error: 'token', motivo: e.message }, 401); }
    const cuenta = await sha256(`google:${datos.sub}`), ahora = Date.now(), token = [...crypto.getRandomValues(new Uint8Array(32))].map((x) => x.toString(36).padStart(2, '0')).join('');
    await env.DB.batch([
      env.DB.prepare('INSERT INTO cuentas (id, creado, actualizado) VALUES (?1, ?2, NULL) ON CONFLICT(id) DO NOTHING').bind(cuenta, ahora),
      env.DB.prepare('INSERT INTO sesiones (token, cuenta, expira) VALUES (?1, ?2, ?3)').bind(await sha256(token), cuenta, ahora + DIAS_SESION * 86400000),
      env.DB.prepare('DELETE FROM sesiones WHERE expira < ?1').bind(ahora),
    ]);
    const f = await env.DB.prepare('SELECT actualizado FROM cuentas WHERE id = ?1').bind(cuenta).first();
    return json({ ok: true, tieneProgreso: !!f?.actualizado, actualizado: f?.actualizado || null }, 200, { 'Set-Cookie': cookie(token, DIAS_SESION * 86400) });
  }
  const s = await sesion(req, env); if (!s) return json({ ok: false, error: 'sin-sesion' }, 401, { 'Set-Cookie': cookie('', 0) });
  if (ruta === '/api/cuenta/progreso' && m === 'GET') {
    const f = await env.DB.prepare('SELECT progreso, actualizado FROM cuentas WHERE id = ?1').bind(s.cuenta).first();
    return json({ ok: true, progreso: f?.progreso ? JSON.parse(f.progreso) : null, actualizado: f?.actualizado || null });
  }
  if (ruta === '/api/cuenta/progreso' && m === 'PUT') {
    const t = await req.text(); if (t.length > MAX_PROGRESO) return json({ ok: false, error: 'grande' }, 413);
    let b; try { b = JSON.parse(t); } catch { return json({ ok: false, error: 'datos' }, 400); }
    if (!b || typeof b.progreso !== 'object' || Array.isArray(b.progreso) || b.progreso === null) return json({ ok: false, error: 'datos' }, 400);
    const ahora = Date.now(); await env.DB.prepare('UPDATE cuentas SET progreso = ?1, actualizado = ?2 WHERE id = ?3').bind(JSON.stringify(b.progreso), ahora, s.cuenta).run();
    return json({ ok: true, actualizado: ahora });
  }
  if (ruta === '/api/cuenta/salir' && m === 'POST') { await env.DB.prepare('DELETE FROM sesiones WHERE token = ?1').bind(await sha256(s.token)).run(); return json({ ok: true }, 200, { 'Set-Cookie': cookie('', 0) }); }
  if (ruta === '/api/cuenta' && m === 'DELETE') {
    await env.DB.batch([env.DB.prepare('DELETE FROM sesiones WHERE cuenta = ?1').bind(s.cuenta), env.DB.prepare('DELETE FROM cuentas WHERE id = ?1').bind(s.cuenta)]);
    return json({ ok: true }, 200, { 'Set-Cookie': cookie('', 0) });
  }
  return json({ ok: false, error: 'no-existe' }, 404);
}
export const onRequest = ({ request, env }) => atender(request, env);
