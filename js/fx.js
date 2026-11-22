import { reducirMovimiento, esc } from './util.js';
export function toast(html, clase = '') {
  const cont = document.getElementById('toasts'); if (!cont) return;
  const d = document.createElement('div'); d.className = 'toast ' + clase; d.innerHTML = html; cont.append(d);
  setTimeout(() => d.remove(), 3200);
}
export const texto = (s) => esc(s);
/** Confeti ligero en canvas (se apaga con "reducir movimiento"). */
export function confeti(cant = 90) {
  if (reducirMovimiento()) return;
  const c = document.getElementById('confeti'); if (!c) return;
  const w = (c.width = innerWidth), h = (c.height = innerHeight), x = c.getContext('2d');
  const col = ['#C8553D', '#F2A93B', '#2E8B83', '#FFF1DC', '#E0568C'];
  const ps = Array.from({ length: cant }, () => ({ x: w / 2 + (Math.random() - .5) * 120, y: h * .55, vx: (Math.random() - .5) * 12, vy: -Math.random() * 14 - 4, r: Math.random() * 6 + 3, c: col[(Math.random() * col.length) | 0], a: Math.random() * 6, va: (Math.random() - .5) * .4 }));
  let t0 = performance.now();
  (function paso(t) {
    const dt = Math.min(2, (t - t0) / 16.7); t0 = t; x.clearRect(0, 0, w, h);
    let vivo = false;
    for (const p of ps) { p.vy += .35 * dt; p.x += p.vx * dt; p.y += p.vy * dt; p.a += p.va * dt; if (p.y < h + 20) vivo = true; x.save(); x.translate(p.x, p.y); x.rotate(p.a); x.fillStyle = p.c; x.fillRect(-p.r, -p.r / 2, p.r * 2, p.r); x.restore(); }
    if (vivo && t < performance.now() + 4000) requestAnimationFrame(paso); else x.clearRect(0, 0, w, h);
  })(t0);
}
export function animar(el, clase) { if (!el || reducirMovimiento()) return; el.classList.remove(clase); void el.offsetWidth; el.classList.add(clase); }
export function vibrar(ms = 30) { try { navigator.vibrate?.(ms); } catch { /* no disponible */ } }
export function hablar(texto, idioma) {
  try {
    if (!('speechSynthesis' in window)) return false;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(texto); u.lang = idioma === 'en' ? 'en-US' : 'es-MX'; u.rate = .9; speechSynthesis.speak(u); return true;
  } catch { return false; }
}
