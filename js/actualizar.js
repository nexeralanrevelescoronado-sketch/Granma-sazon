// Actualizaciones: cuando hay una versión nueva ya descargada, aparece el aviso con el botón «Actualizar».
// Al tocarlo, la versión nueva entra y la app se recarga sola. Si la persona no lo toca, entra la próxima vez que abra la app.
// También sirve con la app instalada en la pantalla de inicio: se busca versión nueva cada vez que se vuelve a la app.
import { u } from './state.js';

let registro = null, pedida = false;
const hayNueva = () => !!(registro?.waiting && navigator.serviceWorker.controller);

function mostrarAviso() {
  const a = document.getElementById('aviso-version'); if (!a) return;
  a.querySelector('[data-texto]').textContent = u('Hay una versión nueva de Granma Sazón.', 'There is a new version of Granma Sazón.');
  const b = a.querySelector('#btn-actualizar'); b.textContent = u('Actualizar', 'Update'); b.disabled = false; a.hidden = false;
}

/** Pone a funcionar la versión nueva y recarga. Devuelve false si no hay ninguna esperando. */
export function aplicarActualizacion() {
  if (!registro?.waiting) return false;
  pedida = true; registro.waiting.postMessage('actualizar');
  setTimeout(() => { if (pedida) location.reload(); }, 4000);        // por si el navegador no avisa del cambio
  return true;
}

export function vigilarActualizaciones(reg) {
  registro = reg;
  const revisar = () => { if (hayNueva()) { mostrarAviso(); dispatchEvent(new Event('version-nueva')); } };
  reg.addEventListener('updatefound', () => { const n = reg.installing; n?.addEventListener('statechange', () => { if (n.state === 'installed') revisar(); }); });
  navigator.serviceWorker.addEventListener('controllerchange', () => { if (pedida) { pedida = false; location.reload(); } });
  document.getElementById('btn-actualizar')?.addEventListener('click', (e) => { const b = e.currentTarget; b.disabled = true; b.textContent = u('Actualizando…', 'Updating…'); aplicarActualizacion(); });
  revisar();
  const buscar = () => { if (navigator.onLine) reg.update().catch(() => { /* sin red: se intenta después */ }); };
  document.addEventListener('visibilitychange', () => { if (!document.hidden) buscar(); });
  setInterval(buscar, 30 * 60000);
}

/** Botón «Buscar actualización»: 'nueva' (ya está lista para entrar), 'al-dia', 'sin-red' o 'sin' (el navegador no guarda la app). */
export async function buscarActualizacion() {
  if (!registro) return 'sin';
  if (hayNueva()) return 'nueva';
  try { await registro.update(); } catch { return 'sin-red'; }
  for (let i = 0; i < 60 && registro.installing; i++) await new Promise((r) => setTimeout(r, 500));   // la nueva tarda unos segundos en bajar
  if (hayNueva()) { mostrarAviso(); return 'nueva'; }
  return 'al-dia';
}

/** La versión que está funcionando ahora (se la pregunta al service worker). Vacío si todavía no hay. */
export function versionInstalada() {
  return new Promise((ok) => {
    const sw = navigator.serviceWorker?.controller; if (!sw) return ok('');
    const canal = new MessageChannel(), t = setTimeout(() => ok(''), 1500);
    canal.port1.onmessage = (e) => { clearTimeout(t); ok(String(e.data || '')); };
    sw.postMessage('version', [canal.port2]);
  });
}
