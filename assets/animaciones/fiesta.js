// Fiesta mexicana: confeti tricolor y Granma aventando tortillas hacia la persona (como bolo de fiesta).
// Las tortillas se voltean en 3D (perspectiva en .tortillas-cap) y de canto se ve su grosor.
// Solo transform + opacity (WAAPI), una sola vez, con tope de partículas; nada se mueve con «reducir movimiento».
import { confeti, MAX_CONFETI } from './confeti.js';

export const TRICOLOR = ['#0B7A4B', '#FFFFFF', '#CE1126', '#0B7A4B', '#F2A93B', '#CE1126'];
export const confetiMexicano = (cant = 30) => confeti(Math.min(cant, MAX_CONFETI), TRICOLOR);

export const MAX_TORTILLAS = 24;
/** Las tortillas salen de `origen` (Granma) y vuelan creciendo hacia quien mira. Devuelve cuántas aventó. */
export function lluviaTortillas(origen, cant = 18) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.hasAttribute('data-oculta')) return 0;
  const n = Math.min(MAX_TORTILLAS, Math.max(1, cant | 0)), c = origen?.getBoundingClientRect?.() || { left: innerWidth / 2, top: innerHeight / 3, width: 0, height: 0 };
  const x0 = c.left + c.width / 2, y0 = c.top + c.height * 0.45, vw = document.documentElement.clientWidth, vh = innerHeight;
  let cap = document.querySelector('.tortillas-cap'); if (!cap) { cap = document.createElement('div'); cap.className = 'tortillas-cap'; cap.setAttribute('aria-hidden', 'true'); document.body.append(cap); }
  cap.replaceChildren();
  for (let i = 0; i < n; i++) {
    const t = document.createElement('i'); t.className = 'tortilla'; t.style.left = `${x0}px`; t.style.top = `${y0}px`; cap.append(t);
    const dx = (Math.random() - 0.5) * vw * 0.95, dy = (0.1 + Math.random() * 0.75) * vh - y0, alto = -(60 + Math.random() * 120), tam = 0.55 + Math.random() * 0.45;
    // Voltereta 3D: cada tortilla gira sobre su eje X (de canto se ve el grosor) y se ladea un poco en Y; siempre la misma lista de transformaciones para que interpole bien
    const vueltas = (Math.random() < 0.5 ? -1 : 1) * (360 + Math.floor(Math.random() * 2) * 360), ladeo = (Math.random() - 0.5) * 70, giro = (Math.random() - 0.5) * 300;
    const f = (x, y, e, rx, ry, rz) => `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(${e}) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg)`;
    t.animate([
      { opacity: 0, transform: f(0, 0, 0.1, 0, 0, 0) },
      { opacity: 1, transform: f(dx * 0.45, alto, tam * 0.5, vueltas * 0.45, ladeo * 0.5, giro * 0.4), offset: 0.35 },
      { opacity: 1, transform: f(dx * 0.9, dy * 0.8, tam, vueltas * 0.9, ladeo, giro * 0.9), offset: 0.82 },
      { opacity: 0, transform: f(dx, dy, tam * 1.25, vueltas, ladeo, giro) },
    ], { duration: 1000 + Math.random() * 350, delay: i * 45, easing: 'cubic-bezier(.23,1,.32,1)', fill: 'both' }).onfinish = () => t.remove();
  }
  return n;
}
