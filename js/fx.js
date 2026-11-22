import { reducirMovimiento, esc } from './util.js';
export function toast(html, clase = '') {
  const cont = document.getElementById('toasts'); if (!cont) return;
  const d = document.createElement('div'); d.className = 'toast ' + clase; d.innerHTML = html; cont.append(d);
  setTimeout(() => d.remove(), 3200);
}
export const texto = (s) => esc(s);
export { confeti } from '../assets/animaciones/confeti.js';
export function animar(el, clase) { if (!el || reducirMovimiento()) return; el.classList.remove(clase); void el.offsetWidth; el.classList.add(clase); }
export function vibrar(ms = 30) { try { navigator.vibrate?.(ms); } catch { /* no disponible */ } }
export function hablar(texto, idioma) {
  try {
    if (!('speechSynthesis' in window)) return false;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(texto); u.lang = idioma === 'en' ? 'en-US' : 'es-MX'; u.rate = .9; speechSynthesis.speak(u); return true;
  } catch { return false; }
}
