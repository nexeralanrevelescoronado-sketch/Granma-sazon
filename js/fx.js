import { reducirMovimiento, esc } from './util.js';
import { decir } from './voz.js';
export function toast(html, clase = '') {
  const cont = document.getElementById('toasts'); if (!cont) return;
  const d = document.createElement('div'); d.className = 'toast ' + clase; d.innerHTML = html; cont.append(d);
  setTimeout(() => d.remove(), 3200);
}
export const texto = (s) => esc(s);
export { confeti } from '../assets/animaciones/confeti.js';
export function animar(el, clase) { if (!el || reducirMovimiento()) return; el.classList.remove(clase); void el.offsetWidth; el.classList.add(clase); }
export function vibrar(ms = 30) { try { navigator.vibrate?.(ms); } catch { /* no disponible */ } }
/** Botones 🔊: dice el texto con la voz del personaje (por defecto Granma; los consejos, el Abuelo). */
export function hablar(texto, idioma, quien = 'granma') { decir(texto, idioma, quien); return true; }
