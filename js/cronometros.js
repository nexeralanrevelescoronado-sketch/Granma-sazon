// Cronómetros de las recetas: viven fuera de la pantalla de receta, así siguen corriendo y avisan
// aunque la persona se vaya a otra sección. Al terminar: sonido, vibración, aviso en pantalla y,
// si dio permiso, una notificación del sistema (sirve cuando la app está en segundo plano).
import { u } from './state.js';
import { sonido } from './sound.js';
import { toast, vibrar } from './fx.js';

/** "idReceta:paso" -> { fin, resto, corriendo, sonó, etiqueta } */
export const timers = new Map();
let vigilante = null;

export const nuevo = (segundos) => ({ resto: segundos, corriendo: false, fin: 0, sonó: false, etiqueta: '' });
export const restante = (t) => (t.corriendo ? Math.max(0, Math.round((t.fin - Date.now()) / 1000)) : t.resto);

export function avisosDisponibles() { return 'Notification' in window; }
/** Se pide una sola vez, al iniciar el primer cronómetro (con el toque de la persona). */
export async function pedirPermisoDeAviso() {
  try { if (avisosDisponibles() && Notification.permission === 'default') return (await Notification.requestPermission()) === 'granted'; } catch { /* sin avisos */ }
  return avisosDisponibles() && Notification.permission === 'granted';
}
export async function notificar(titulo, cuerpo) {
  try {
    if (!avisosDisponibles() || Notification.permission !== 'granted') return false;
    const opciones = { body: cuerpo, icon: 'assets/iconos/icon-192.png', badge: 'assets/iconos/icon-192.png', tag: 'cronometro', renotify: true };
    const reg = await navigator.serviceWorker?.getRegistration();
    if (reg?.showNotification) await reg.showNotification(titulo, opciones); else new Notification(titulo, opciones);
    return true;
  } catch { return false; }
}

function revisar() {
  let corriendo = 0;
  for (const [k, t] of timers) {
    if (!t.corriendo) continue;
    if (restante(t) > 0) { corriendo++; continue; }
    t.sonó = true; t.corriendo = false; t.resto = 0;
    sonido.alarma(); vibrar([200, 100, 200]);
    const texto = `${u('¡Tiempo!', 'Time is up!')} ${t.etiqueta}`;
    toast(`⏰ ${texto.replace(/[<>&]/g, '')}`);
    if (document.hidden) notificar('Granma Sazón', texto);
    dispatchEvent(new CustomEvent('cronometro-fin', { detail: { k } }));
  }
  if (!corriendo && vigilante) { clearInterval(vigilante); vigilante = null; }
}
/** Inicia o pausa. `etiqueta` es lo que se lee en el aviso (receta y número de paso). */
export function alternar(k, segundos, etiqueta) {
  const t = timers.get(k) || nuevo(segundos);
  if (t.corriendo) { t.resto = restante(t); t.corriendo = false; }
  else { if (t.resto === 0) t.resto = segundos; t.fin = Date.now() + t.resto * 1000; t.corriendo = true; t.sonó = false; t.etiqueta = etiqueta; vigilante ||= setInterval(revisar, 1000); }
  timers.set(k, t); return t;
}
export function reiniciar(k, segundos) { timers.set(k, nuevo(segundos)); }
export const hayCorriendo = () => [...timers.values()].some((t) => t.corriendo);
