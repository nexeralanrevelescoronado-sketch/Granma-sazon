// Avisos de Granma, aunque la app esté cerrada. Hay dos, y cada quien elige hora y días:
//   · «practicar»: el recordatorio para practicar un ratito.
//   · «clase»: Granma te espera para tu siguiente clase de cocina e inglés (o de cocina y español), con el nombre del capítulo que sigue.
// Para eso el navegador crea una «dirección de avisos» de este teléfono y se guarda en el servidor de Granma Sazón (functions/api/avisos/)
// junto con la hora y los días. Nada más: ni nombre, ni avance, ni idioma. El texto del aviso lo arma el teléfono.
import { estado, guardar, nat, tgt, alCambiar } from './state.js';

const API = '/api/avisos', CAJA = 'granma-avisos';
export const TIPOS = ['practicar', 'clase'];
export const SUGERIDO = { practicar: { hora: 19, dias: [0, 1, 2, 3, 4, 5, 6] }, clase: { hora: 10, dias: [6] } };
export const HORAS = [6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];
export const DIAS = { es: ['D', 'L', 'M', 'M', 'J', 'V', 'S'], en: ['S', 'M', 'T', 'W', 'T', 'F', 'S'] };
export const DIAS_LARGOS = { es: ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'], en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] };

export const recordatoriosDisponibles = () => { try { return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window; } catch { return false; } };
/** Los avisos que la persona tiene activos: { practicar?: {hora, dias, utc, mascara}, clase?: {…} }. Convierte el formato viejo (un solo recordatorio). */
export function avisosActivos() {
  const a = estado().ajustes;
  if (a.recordatorio && !a.avisos) { a.avisos = { practicar: { hora: a.recordatorio.hora, dias: [0, 1, 2, 3, 4, 5, 6] } }; delete a.recordatorio; guardar(); }
  return a.avisos || {};
}
export const recordatorioActivo = () => avisosActivos().practicar || null;

/** La hora local de la persona, en UTC (0-23). */
export const horaUTC = (horaLocal, desfaseMin = new Date().getTimezoneOffset()) => ((Math.floor((horaLocal * 60 + desfaseMin) / 60) % 24) + 24) % 24;
/** Los días locales elegidos, pasados a días UTC como máscara (a las 8 p. m. del lunes en México ya es martes en UTC). */
export function mascaraUTC(dias, horaLocal, desfaseMin = new Date().getTimezoneOffset()) {
  const corre = Math.floor((horaLocal * 60 + desfaseMin) / 1440);
  return dias.reduce((m, d) => m | (1 << ((((d + corre) % 7) + 7) % 7)), 0);
}
export const horaBonita = (h, idioma = nat()) => { const h12 = h % 12 === 0 ? 12 : h % 12; return idioma === 'es' ? `${h12}:00 ${h < 12 ? 'a. m.' : 'p. m.'}` : `${h12}:00 ${h < 12 ? 'AM' : 'PM'}`; };
/** «todos los días», «de lunes a viernes», «los sábados y domingos» o «lunes, miércoles y viernes». */
export function diasBonitos(dias, idioma = nat()) {
  const d = [...new Set(dias)].sort((a, b) => a - b), L = DIAS_LARGOS[idioma], es = idioma === 'es', clave = d.join('');
  if (d.length === 7) return es ? 'todos los días' : 'every day';
  if (clave === '12345') return es ? 'de lunes a viernes' : 'Monday to Friday';
  if (clave === '06') return es ? 'sábados y domingos' : 'Saturdays and Sundays';
  const orden = [...d.filter((x) => x !== 0), ...d.filter((x) => x === 0)].map((x) => L[x]);   // la semana empieza en lunes
  return orden.length === 1 ? (es ? `los ${orden[0]}${/s$/.test(orden[0]) ? '' : 's'}` : `${orden[0]}s`) : `${orden.slice(0, -1).join(', ')} ${es ? 'y' : 'and'} ${orden.at(-1)}`;
}

const aBytes = (b64u) => { const s = atob(b64u.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (b64u.length % 4)) % 4)); return Uint8Array.from(s, (c) => c.charCodeAt(0)); };
async function enviar(ruta, datos) { const r = await fetch(API + ruta, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(datos) }); return r.ok; }
async function suscripcion(crear) {
  // si la app se acaba de abrir, el service worker puede tardar unos segundos en quedar listo; no se espera para siempre
  const reg = await Promise.race([navigator.serviceWorker.ready, new Promise((_, no) => setTimeout(() => no(new Error('sin service worker')), 30000))]);
  let sub = await reg.pushManager.getSubscription();
  if (!sub && crear) { const r = await fetch(API + '/clave'), clave = r.ok ? (await r.json()).clave : null; if (!clave) throw new Error('sin clave'); sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: aBytes(clave) }); }
  return sub;
}

/** El capítulo que sigue (para «te espero en tu siguiente clase»): el primero sin terminar de las historias descargadas. */
async function siguienteClase() {
  try { const { historias } = await import('./datos.js'), S = estado();
    for (const h of await historias()) { const c = h.capitulos.find((x) => !S.caps[x.id]?.hecho); if (c) return { es: c.titulo.es, en: c.titulo.en }; } } catch { /* sin historias descargadas */ }
  return null;
}
/** Lo que el teléfono necesita para armar el aviso sin preguntarle a nadie. Se guarda SOLO en este teléfono. */
export async function guardarDatosDelAviso() {
  try {
    const S = estado(), horarios = Object.entries(avisosActivos()).map(([tipo, v]) => ({ tipo, hora: v.hora, dias: v.dias }));
    const datos = { idioma: nat(), aprende: tgt(), trato: S.perfil.trato || '', dia: S.racha.ultimo || '', siguiente: await siguienteClase(), horarios };
    await (await caches.open(CAJA)).put('datos', new Response(JSON.stringify(datos), { headers: { 'Content-Type': 'application/json' } }));
  } catch { /* sin almacenamiento: el aviso sale con el texto general */ }
}

/**
 * Activa (o cambia) un aviso. → 'ok' | 'sin-dias' | 'bloqueado' | 'sin-permiso' | 'no-disponible' | 'sin-red'
 * 'bloqueado': la persona ya había dicho que no a los avisos; el navegador no deja volver a preguntar (se cambia en los ajustes del teléfono).
 */
export async function activarAviso(tipo, hora, dias) {
  if (!TIPOS.includes(tipo)) return 'no-disponible';
  if (!dias.length) return 'sin-dias';
  if (!recordatoriosDisponibles()) return 'no-disponible';
  if (Notification.permission === 'denied') return 'bloqueado';
  try { if (Notification.permission === 'default') await Notification.requestPermission(); } catch { /* el navegador decide */ }
  if (Notification.permission === 'denied') return 'bloqueado';
  if (Notification.permission !== 'granted') return 'sin-permiso';
  try {
    const sub = await suscripcion(true), utc = horaUTC(hora), mascara = mascaraUTC(dias, hora);
    if (!(await enviar('/alta', { endpoint: sub.endpoint, hora: utc, tipo, dias: mascara }))) return 'sin-red';
    avisosActivos(); estado().ajustes.avisos = { ...estado().ajustes.avisos, [tipo]: { hora, dias: [...dias].sort((a, b) => a - b), utc, mascara, ep: sub.endpoint.slice(-24) } }; guardar();
    await guardarDatosDelAviso();
    return 'ok';
  } catch { return 'sin-red'; }
}

/** Quita un aviso (o todos, sin tipo). Si ya no queda ninguno, el navegador olvida la dirección de avisos. */
export async function quitarAviso(tipo) {
  const a = { ...avisosActivos() }; if (tipo) delete a[tipo]; const quedan = tipo ? Object.keys(a).length : 0;
  try { const sub = recordatoriosDisponibles() ? await suscripcion(false) : null;
    if (sub) { await enviar('/baja', tipo && quedan ? { endpoint: sub.endpoint, tipo } : { endpoint: sub.endpoint }).catch(() => false); if (!quedan) await sub.unsubscribe(); } } catch { /* sin red: de todos modos se apaga en el teléfono */ }
  if (quedan) estado().ajustes.avisos = a; else delete estado().ajustes.avisos;
  delete estado().ajustes.recordatorio; guardar();
  if (quedan) await guardarDatosDelAviso(); else try { await caches.delete(CAJA); } catch { /* nada que borrar */ }
}
export const quitarRecordatorio = () => quitarAviso();

/** Al abrir la app: si cambió el horario de verano o el navegador renovó la dirección, se avisa al servidor. */
export async function sincronizarRecordatorio() {
  const a = avisosActivos(); if (!Object.keys(a).length || !recordatoriosDisponibles()) return;
  try {
    await guardarDatosDelAviso();
    if (Notification.permission !== 'granted') return;
    const sub = await suscripcion(true);
    for (const [tipo, v] of Object.entries(a)) {
      const utc = horaUTC(v.hora), mascara = mascaraUTC(v.dias, v.hora);
      if (utc !== v.utc || mascara !== v.mascara || sub.endpoint.slice(-24) !== v.ep) { if (await enviar('/alta', { endpoint: sub.endpoint, hora: utc, tipo, dias: mascara })) { estado().ajustes.avisos[tipo] = { ...v, utc, mascara, ep: sub.endpoint.slice(-24) }; guardar(); } }
    }
  } catch { /* sin red: se intenta la próxima vez */ }
}
// Cada vez que cambia el avance (por ejemplo, al terminar un capítulo), el teléfono lo anota para el aviso.
let pendiente = 0;
alCambiar(() => { if (!Object.keys(estado().ajustes.avisos || {}).length) return; clearTimeout(pendiente); pendiente = setTimeout(guardarDatosDelAviso, 1500); });
