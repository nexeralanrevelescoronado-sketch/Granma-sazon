// Paquetes para usar sin internet: cada uno vive en su propio Cache Storage (granma-pkg-<id>-f<FMT>).
// La descarga se puede pausar y reanudar (lo ya guardado no se vuelve a bajar) y se reanuda sola al volver el internet.
import { paquetes } from './datos.js';
const FMT = 1;
const nombreCache = (id) => `granma-pkg-${id}-f${FMT}`;
const LLAVE = 'granma:descargas';
const bus = new EventTarget();
export const alProgreso = (fn) => { const f = (e) => fn(e.detail); bus.addEventListener('p', f); return () => bus.removeEventListener('p', f); };
let marcas = {}; try { marcas = JSON.parse(localStorage.getItem(LLAVE)) || {}; } catch { marcas = {}; }
const guardarMarcas = () => { try { localStorage.setItem(LLAVE, JSON.stringify(marcas)); } catch { /* sin espacio */ } };
const activos = new Map();      // id -> { ctrl, manual }
const info = new Map();         // id -> { estado, hechos, total, bytes, msg }
const abs = (ruta) => new URL(ruta, document.baseURI).href;
export const hayCaches = () => 'caches' in window;

export async function listaPaquetes() { return (await paquetes()).paquetes; }

/** Estado real leyendo el Cache Storage: no | parcial | listo | bajando | pausa | proximamente */
export async function estadoDe(p) {
  if (p.proximamente) return { estado: 'proximamente', hechos: 0, total: 0, bytes: 0 };
  const vivo = info.get(p.id); if (vivo && (vivo.estado === 'bajando' || vivo.estado === 'pausa')) return { ...vivo };
  if (!hayCaches() || !(await caches.has(nombreCache(p.id)))) return { estado: 'no', hechos: 0, total: p.archivos.length, bytes: 0 };
  const cache = await caches.open(nombreCache(p.id)); const hechos = (await cache.keys()).length;
  const listo = hechos >= p.archivos.length;
  return { estado: listo ? 'listo' : hechos ? 'parcial' : 'no', hechos, total: p.archivos.length, bytes: listo ? (marcas[p.id]?.bytes ?? p.bytes) : (marcas[p.id]?.bytes ?? 0) };
}
function emitir(id, datos) { info.set(id, { ...(info.get(id) || {}), ...datos }); bus.dispatchEvent(new CustomEvent('p', { detail: { id, ...info.get(id) } })); }

export async function descargar(p, { manual = false } = {}) {
  if (!hayCaches()) return emitir(p.id, { estado: 'pausa', msg: 'noCaches' });
  if (activos.has(p.id) || p.proximamente) return;
  const ctrl = new AbortController(); activos.set(p.id, { ctrl });
  const cache = await caches.open(nombreCache(p.id));
  const guardadas = new Set((await cache.keys()).map((r) => r.url));
  const faltan = p.archivos.filter((a) => !guardadas.has(abs(a)));
  let hechos = p.archivos.length - faltan.length, bytes = marcas[p.id]?.bytes || 0;
  emitir(p.id, { estado: 'bajando', hechos, total: p.archivos.length, bytes, msg: '' });
  let fallo = null, i = 0;
  const obrero = async () => {
    while (i < faltan.length && !fallo && !ctrl.signal.aborted) {
      const ruta = faltan[i++];
      try {
        const res = await fetch(abs(ruta), { signal: ctrl.signal, cache: 'reload' });
        if (!res.ok) throw new Error('http ' + res.status);
        const blob = await res.blob();
        await cache.put(abs(ruta), new Response(blob, { headers: { 'Content-Type': res.headers.get('Content-Type') || 'application/octet-stream' } }));
        hechos++; bytes += blob.size; marcas[p.id] = { ...(marcas[p.id] || {}), bytes };
        emitir(p.id, { estado: 'bajando', hechos, bytes });
      } catch (e) { if (!ctrl.signal.aborted) fallo = e; }
    }
  };
  await Promise.all(Array.from({ length: Math.min(4, faltan.length || 1) }, obrero));
  activos.delete(p.id);
  if (ctrl.signal.aborted) { emitir(p.id, { estado: 'pausa', msg: 'pausa' }); return; }
  if (fallo) { emitir(p.id, { estado: 'pausa', msg: 'corte' }); esperarInternet(p); return; }
  marcas[p.id] = { bytes, ver: FMT, fecha: Date.now() }; guardarMarcas();
  emitir(p.id, { estado: 'listo', hechos: p.archivos.length, bytes });
  pedirPersistencia();
}
export function pausar(id) { activos.get(id)?.ctrl.abort(); }
const esperando = new Set();
function esperarInternet(p) {
  if (esperando.has(p.id)) return; esperando.add(p.id);
  const alVolver = () => { removeEventListener('online', alVolver); esperando.delete(p.id); if (info.get(p.id)?.estado === 'pausa' && info.get(p.id)?.msg === 'corte') descargar(p); };
  addEventListener('online', alVolver);
}
export async function borrar(p) {
  pausar(p.id); activos.delete(p.id); info.delete(p.id);
  if (hayCaches()) await caches.delete(nombreCache(p.id));
  delete marcas[p.id]; guardarMarcas(); bus.dispatchEvent(new CustomEvent('p', { detail: { id: p.id, estado: 'no', hechos: 0, bytes: 0 } }));
}
export async function descargarTodo(lista) { for (const p of lista) if (!p.proximamente && (await estadoDe(p)).estado !== 'listo') await descargar(p, { manual: true }); }

export async function espacio() {
  try { const e = await navigator.storage.estimate(); return { usado: e.usage || 0, cuota: e.quota || 0 }; } catch { return { usado: 0, cuota: 0 }; }
}
export async function pedirPersistencia() {
  try { if (navigator.storage?.persisted && (await navigator.storage.persisted())) return true; return navigator.storage?.persist ? await navigator.storage.persist() : false; } catch { return false; }
}
export const esPersistente = async () => { try { return !!(await navigator.storage?.persisted?.()); } catch { return false; } };
/** ¿Está este paquete listo para usar sin internet? */
export async function paqueteListo(id) { const p = (await listaPaquetes()).find((x) => x.id === id); return p ? (await estadoDe(p)).estado === 'listo' : false; }
