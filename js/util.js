export const $ = (s, r = document) => r.querySelector(s);
export const $$ = (s, r = document) => [...r.querySelectorAll(s)];
export const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const fechaLocal = (d = new Date()) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const ayer = () => { const d = new Date(); d.setDate(d.getDate() - 1); return fechaLocal(d); };
export const numeroDeDia = (d = new Date()) => Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000);
export const delDia = (lista, sal = 0) => lista[(numeroDeDia() + sal) % lista.length];
export const mezclar = (arr) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
export const al = (arr) => arr[Math.floor(Math.random() * arr.length)];
/** 05:30, o con horas cuando pasa de una hora (24:00:00 para la fermentación del tejuino). */
export const mmss = (seg) => { seg = Math.max(0, Math.round(seg)); const d = (n) => String(n).padStart(2, '0'), h = Math.floor(seg / 3600);
  return h ? `${h}:${d(Math.floor(seg / 60) % 60)}:${d(seg % 60)}` : `${d(Math.floor(seg / 60))}:${d(seg % 60)}`; };
export const MB = (b) => (b < 10240 ? '<0.01' : (b / 1048576).toFixed(2)) + ' MB';
export const sinAcentos = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
export const pausa = (ms) => new Promise((r) => setTimeout(r, ms));
export const reducirMovimiento = () => matchMedia('(prefers-reduced-motion: reduce)').matches;
/** Resalta (con <mark>) las palabras clave dentro de un texto ya escapado. */
export function resaltar(texto, palabras) {
  let out = esc(texto);
  for (const p of palabras) {
    if (!p) continue;
    const re = new RegExp(`(^|[^\\p{L}])(${esc(p).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})(?=$|[^\\p{L}])`, 'iu');
    out = out.replace(re, (_m, a, b) => `${a}<mark class="clave">${b}</mark>`);
  }
  return out;
}
