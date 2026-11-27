// Cuenta con Google (opcional): guarda el avance para no perderlo al cambiar de teléfono y usarlo en varios.
// Se entra con el flujo estándar de Google (OpenID Connect): la app manda a la persona a la página de Google y Google la regresa a
// /cuenta.html con un token que revisa el servidor (functions/api/cuenta/). Solo se pide el permiso «openid»: ni correo ni nombre.
// No se carga ningún programa de Google en la app.
import { estado, guardar, alCambiar, adoptar } from './state.js';

const API = '/api/cuenta', GUARDA = 'granma:google';
let clientId = null;
export async function configCuenta() {
  if (clientId !== null) return clientId;
  try { const r = await fetch(API + '/config'); clientId = r.ok ? (await r.json()).clientId || '' : ''; } catch { clientId = ''; }
  return clientId;
}
export const cuentaConectada = () => !!estado().cuenta?.conectada;
const aleatorio = () => [...crypto.getRandomValues(new Uint8Array(24))].map((b) => b.toString(16).padStart(2, '0')).join('');

/** Lo que viaja a la cuenta: todo el avance menos lo que es solo de este teléfono (avisos, cuenta) y el nombre de la constancia. */
export function paraLaCuenta(S = estado()) {
  const c = JSON.parse(JSON.stringify(S)); delete c.cuenta; if (c.ajustes) { delete c.ajustes.avisos; delete c.ajustes.recordatorio; } if (c.perfil) delete c.perfil.nombre; return c;
}
const peso = (p) => (p?.xp || 0) + Object.values(p?.caps || {}).filter((x) => x?.hecho).length * 100;
/** ¿Este avance tiene algo? (para no preguntar cuando uno de los dos está vacío) */
export const tieneAvance = (p) => !!p && (p.xp > 0 || Object.values(p.caps || {}).some((x) => x?.hecho));

/** Manda a la persona a Google para entrar. Al volver, /cuenta.html termina el trabajo. */
export async function entrarConGoogle() {
  const id = await configCuenta(); if (!id) return false;
  const nonce = aleatorio(), state = aleatorio();
  localStorage.setItem(GUARDA, JSON.stringify({ nonce, state, t: Date.now() }));
  const q = new URLSearchParams({ client_id: id, redirect_uri: `${location.origin}/cuenta.html`, response_type: 'id_token', scope: 'openid', nonce, state, prompt: 'select_account' });
  location.assign(`https://accounts.google.com/o/oauth2/v2/auth?${q}`);
  return true;
}

/** En /cuenta.html: revisa lo que regresó Google y abre la sesión. → { ok, tieneProgreso } o { ok:false, motivo } */
export async function terminarEntrada(fragmento = location.hash) {
  const p = new URLSearchParams(fragmento.replace(/^#/, '')), guardado = JSON.parse(localStorage.getItem(GUARDA) || 'null'); localStorage.removeItem(GUARDA);
  if (p.get('error')) return { ok: false, motivo: p.get('error') === 'access_denied' ? 'cancelo' : 'google' };
  if (!guardado || Date.now() - guardado.t > 15 * 60000 || p.get('state') !== guardado.state || !p.get('id_token')) return { ok: false, motivo: 'vencio' };
  try {
    const r = await fetch(API + '/entrar', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ idToken: p.get('id_token'), nonce: guardado.nonce }) });
    if (!r.ok) return { ok: false, motivo: 'servidor' };
    const d = await r.json(); estado().cuenta = { conectada: true, desde: Date.now(), sincronizado: d.actualizado || 0, pendiente: false }; guardar();
    return { ok: true, tieneProgreso: d.tieneProgreso };
  } catch { return { ok: false, motivo: 'red' }; }
}

export async function bajarProgreso() { const r = await fetch(API + '/progreso', { credentials: 'same-origin' }); if (r.status === 401) { desconectar(); return null; } return r.ok ? r.json() : null; }
let subiendo = null;
/** Sube el avance de este teléfono a la cuenta. */
export async function subirProgreso() {
  if (!cuentaConectada()) return false;
  if (subiendo) return subiendo;
  subiendo = (async () => {
    try {
      const r = await fetch(API + '/progreso', { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ progreso: paraLaCuenta() }) });
      if (r.status === 401) { desconectar(); return false; }
      if (!r.ok) return false;
      const d = await r.json(), c = estado().cuenta; if (c) { c.sincronizado = d.actualizado; c.pendiente = false; c.ultimo = Date.now(); quieto = true; guardar(); quieto = false; }
      return true;
    } catch { return false; } finally { subiendo = null; }
  })();
  return subiendo;
}
function desconectar() { const c = estado().cuenta; if (c) { c.conectada = false; quieto = true; guardar(); quieto = false; } }

/** Al abrir la app: si en la cuenta hay un avance más nuevo (de otro teléfono) y aquí no hay cambios sin subir, se toma; si aquí hay cambios, se suben. */
export async function sincronizar() {
  if (!cuentaConectada() || !navigator.onLine) return 'nada';
  const d = await bajarProgreso(); if (!d?.ok) return 'sin-red';
  const c = estado().cuenta;
  if (d.progreso && d.actualizado > (c.sincronizado || 0)) {
    // otro teléfono guardó después: si aquí también hubo cambios, se queda el avance más grande
    if (!c.pendiente || peso(d.progreso) >= peso(paraLaCuenta())) { quieto = true; adoptar(d.progreso); estado().cuenta = { ...c, sincronizado: d.actualizado, pendiente: false }; guardar(); quieto = false; return 'bajo'; }
  }
  if (c.pendiente || !d.progreso) return (await subirProgreso()) ? 'subio' : 'sin-red';
  return 'igual';
}

export async function salirDeLaCuenta() { try { await fetch(API + '/salir', { method: 'POST' }); } catch { /* sin red: se cierra en el teléfono igual */ } delete estado().cuenta; guardar(); }
export async function borrarCuenta() { const r = await fetch(API, { method: 'DELETE' }); if (!r.ok && r.status !== 401) return false; delete estado().cuenta; guardar(); return true; }

// Cada cambio del avance se anota como pendiente y se sube unos segundos después (agrupado).
let quieto = false, espera = 0;
alCambiar(() => {
  if (quieto || !cuentaConectada()) return;
  const c = estado().cuenta; if (!c.pendiente) { c.pendiente = true; quieto = true; guardar(); quieto = false; }
  clearTimeout(espera); espera = setTimeout(() => { if (navigator.onLine) subirProgreso(); }, 5000);
});
addEventListener('online', () => { if (estado().cuenta?.pendiente) subirProgreso(); });
