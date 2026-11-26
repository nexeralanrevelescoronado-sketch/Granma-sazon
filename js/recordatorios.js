// Recordatorio diario: Granma manda un aviso al día, a la hora que la persona elija, aunque la app esté cerrada.
// Para eso el navegador crea una «dirección de avisos» de este teléfono y se guarda en el servidor de Granma Sazón
// (servidor/avisos/) junto con la hora. Nada más: ni nombre, ni avance, ni idioma. El texto del aviso lo arma el teléfono.
import { estado, guardar, nat, alCambiar } from './state.js';

const API = '/api/avisos', CAJA = 'granma-avisos';
export const HORA_SUGERIDA = 19, HORAS = [6, 7, 8, 9, 10, 12, 14, 16, 18, 19, 20, 21, 22];

export const recordatoriosDisponibles = () => { try { return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window; } catch { return false; } };
export const recordatorioActivo = () => estado().ajustes.recordatorio || null;
/** La hora local de la persona, en UTC (0-23): así el servidor no necesita saber dónde vive. */
export const horaUTC = (horaLocal, desfaseMin = new Date().getTimezoneOffset()) => ((Math.floor((horaLocal * 60 + desfaseMin) / 60) % 24) + 24) % 24;
export const horaBonita = (h, idioma = nat()) => { const h12 = h % 12 === 0 ? 12 : h % 12; return idioma === 'es' ? `${h12}:00 ${h < 12 ? 'a. m.' : 'p. m.'}` : `${h12}:00 ${h < 12 ? 'AM' : 'PM'}`; };

const aBytes = (b64u) => { const s = atob(b64u.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (b64u.length % 4)) % 4)); return Uint8Array.from(s, (c) => c.charCodeAt(0)); };
const colita = (endpoint) => endpoint.slice(-24);          // para notar si el navegador renovó la dirección, sin guardar la dirección entera dos veces
async function enviar(ruta, datos) { const r = await fetch(API + ruta, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(datos) }); return r.ok; }
async function suscripcion(crear) {
  const reg = await navigator.serviceWorker.ready; let sub = await reg.pushManager.getSubscription();
  if (!sub && crear) { const r = await fetch(API + '/clave'), clave = r.ok ? (await r.json()).clave : null; if (!clave) throw new Error('sin clave'); sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: aBytes(clave) }); }
  return sub;
}

/** Lo que el teléfono necesita para armar el aviso sin preguntarle a nadie: idioma, trato y cuándo fue la última práctica. */
export async function guardarDatosDelAviso() {
  try { const S = estado(); await (await caches.open(CAJA)).put('datos', new Response(JSON.stringify({ idioma: nat(), trato: S.perfil.trato || '', dia: S.racha.ultimo || '' }), { headers: { 'Content-Type': 'application/json' } })); } catch { /* sin almacenamiento: el aviso sale con el texto general */ }
}

/** Activa (o cambia de hora) el recordatorio. → 'ok' | 'sin-permiso' | 'no-disponible' | 'sin-red' */
export async function activarRecordatorio(hora = HORA_SUGERIDA) {
  if (!recordatoriosDisponibles()) return 'no-disponible';
  try { if (Notification.permission === 'default') await Notification.requestPermission(); } catch { /* el navegador decide */ }
  if (Notification.permission !== 'granted') return 'sin-permiso';
  try {
    const sub = await suscripcion(true), utc = horaUTC(hora);
    if (!(await enviar('/alta', { endpoint: sub.endpoint, hora: utc }))) return 'sin-red';
    estado().ajustes.recordatorio = { hora, utc, ep: colita(sub.endpoint) }; guardar(); await guardarDatosDelAviso();
    return 'ok';
  } catch { return 'sin-red'; }
}

/** Quita el recordatorio: se borra del servidor y el navegador olvida la dirección. */
export async function quitarRecordatorio() {
  try { const sub = recordatoriosDisponibles() ? await suscripcion(false) : null; if (sub) { await enviar('/baja', { endpoint: sub.endpoint }).catch(() => false); await sub.unsubscribe(); } } catch { /* sin red: de todos modos se apaga en el teléfono */ }
  delete estado().ajustes.recordatorio; guardar();
  try { await caches.delete(CAJA); } catch { /* nada que borrar */ }
}

/** Al abrir la app: si cambió el horario de verano o el navegador renovó la dirección, se avisa al servidor. */
export async function sincronizarRecordatorio() {
  const r = recordatorioActivo(); if (!r || !recordatoriosDisponibles()) return;
  try {
    await guardarDatosDelAviso();
    if (Notification.permission !== 'granted') return;
    const sub = await suscripcion(true), utc = horaUTC(r.hora);
    if (utc !== r.utc || colita(sub.endpoint) !== r.ep) { if (await enviar('/alta', { endpoint: sub.endpoint, hora: utc })) { estado().ajustes.recordatorio = { hora: r.hora, utc, ep: colita(sub.endpoint) }; guardar(); } }
  } catch { /* sin red: se intenta la próxima vez */ }
}
// Cada vez que cambia el avance (por ejemplo, al practicar hoy), el teléfono lo anota para el aviso de la tarde.
let pendiente = 0;
alCambiar(() => { if (!recordatorioActivo()) return; clearTimeout(pendiente); pendiente = setTimeout(guardarDatosDelAviso, 1500); });
