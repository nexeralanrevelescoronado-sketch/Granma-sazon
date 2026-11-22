// Fiesta mexicana: confeti tricolor y Granma aventando tortillas hacia la persona (como bolo de fiesta).
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
    const dx = (Math.random() - 0.5) * vw * 0.95, dy = (0.1 + Math.random() * 0.75) * vh - y0, alto = -(60 + Math.random() * 120), tam = 2.2 + Math.random() * 1.8, giro = (Math.random() - 0.5) * 540;
    t.animate([
      { opacity: 0, transform: 'translate(-50%,-50%) scale(.3) rotate(0deg)' },
      { opacity: 1, transform: `translate(calc(-50% + ${dx * 0.45}px), calc(-50% + ${alto}px)) scale(${tam * 0.55}) rotate(${giro * 0.5}deg)`, offset: 0.35 },
      { opacity: 1, transform: `translate(calc(-50% + ${dx * 0.9}px), calc(-50% + ${dy * 0.8}px)) scale(${tam}) rotate(${giro * 0.9}deg)`, offset: 0.82 },
      { opacity: 0, transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(${tam * 1.25}) rotate(${giro}deg)` },
    ], { duration: 1000 + Math.random() * 350, delay: i * 55, easing: 'cubic-bezier(.23,1,.32,1)', fill: 'both' }).onfinish = () => t.remove();
  }
  return n;
}
