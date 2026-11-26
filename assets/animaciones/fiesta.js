// Fiesta mexicana: confeti tricolor y Granma aventando tortillas hacia la persona (como bolo de fiesta).
// Las tortillas se voltean en 3D (perspectiva en .tortillas-cap) y de canto se ve su grosor.
// Solo transform + opacity (WAAPI), una sola vez, con tope de partículas; nada se mueve con «reducir movimiento».
import { confeti, MAX_CONFETI } from './confeti.js';

export const TRICOLOR = ['#0B7A4B', '#FFFFFF', '#CE1126', '#0B7A4B', '#F2A93B', '#CE1126'];
export const confetiMexicano = (cant = 30) => confeti(Math.min(cant, MAX_CONFETI), TRICOLOR);

export const MAX_TORTILLAS = 24;
export const MAX_PEGADAS = 3, PEGADA_MS = 2600, GOLPE = 0.2;   // las que se estrellan contra la pantalla: cuántas, cuánto duran y en qué momento pegan
/**
 * Las tortillas salen de `origen` (Granma) y vuelan creciendo hacia quien mira. Devuelve cuántas aventó.
 * `pegadas` (0-3): esas se estrellan contra el vidrio, medio saliéndose por la orilla, se quedan pegadas, resbalan y caen.
 * `alPegar(i)` se llama en el momento del golpe de cada una (para el sonido y la vibración).
 */
export function lluviaTortillas(origen, cant = 18, pegadas = 0, alPegar = null) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.hasAttribute('data-oculta')) return 0;
  const n = Math.min(MAX_TORTILLAS, Math.max(1, cant | 0)), c = origen?.getBoundingClientRect?.() || { left: innerWidth / 2, top: innerHeight / 3, width: 0, height: 0 };
  const x0 = c.left + c.width / 2, y0 = c.top + c.height * 0.45, vw = document.documentElement.clientWidth, vh = innerHeight;
  let cap = document.querySelector('.tortillas-cap'); if (!cap) { cap = document.createElement('div'); cap.className = 'tortillas-cap'; cap.setAttribute('aria-hidden', 'true'); document.body.append(cap); }
  cap.replaceChildren();
  const k = Math.min(MAX_PEGADAS, Math.max(0, pegadas | 0), n), f = (x, y, e, rx, ry, rz) => `translate(calc(-50% + ${x}px), calc(-50% + ${y}px)) scale(${e}) rotateX(${rx}deg) rotateY(${ry}deg) rotateZ(${rz}deg)`;
  for (let i = 0; i < n; i++) {
    const t = document.createElement('i'); t.className = 'tortilla'; t.style.left = `${x0}px`; t.style.top = `${y0}px`; cap.append(t);
    if (i >= n - k) {
      // Estrellada: llega girando, se aplasta contra el vidrio (crece de golpe y rebota tantito), se queda pegada, resbala y se cae.
      const j = i - (n - k), lado = j % 2 ? 1 : -1, tam = 0.95 + Math.random() * 0.25, giro = (Math.random() - 0.5) * 50;   // se dibuja grande en el CSS (.pegada): no se ve borrosa
      const px = (lado < 0 ? vw * (0.04 + Math.random() * 0.1) : vw * (0.86 + Math.random() * 0.1)) - x0, py = vh * (0.3 + j * 0.2 + Math.random() * 0.08) - y0, espera = (n - k) * 45 + 250 + j * 380;
      t.classList.add('pegada');
      t.animate([
        { opacity: 0, transform: f(0, 0, 0.1, 0, 0, 0), easing: 'cubic-bezier(.3,0,.7,.4)' },
        { opacity: 1, transform: f(px * 0.7, py * 0.7 - 50, tam * 0.45, 500, 20 * lado, giro * 0.5), offset: GOLPE * 0.7, easing: 'cubic-bezier(.5,0,1,.6)' },
        { opacity: 1, transform: f(px, py, tam * 1.16, 720, 0, giro), offset: GOLPE, easing: 'cubic-bezier(.2,1.6,.4,1)' },
        { opacity: 1, transform: f(px, py + 4, tam, 720, 0, giro), offset: GOLPE + 0.07, easing: 'cubic-bezier(.4,0,.8,.3)' },
        { opacity: 1, transform: f(px, py + 46, tam, 720, 0, giro + 4 * lado), offset: 0.82, easing: 'cubic-bezier(.6,0,1,.5)' },
        { opacity: 0, transform: f(px + 18 * lado, py + vh * 0.55, tam * 0.95, 720, 0, giro + 38 * lado) },
      ], { duration: PEGADA_MS, delay: espera, fill: 'both' }).onfinish = () => t.remove();
      if (alPegar) setTimeout(() => { if (t.isConnected) alPegar(j); }, espera + PEGADA_MS * GOLPE);
      continue;
    }
    const dx = (Math.random() - 0.5) * vw * 0.95, dy = (0.1 + Math.random() * 0.75) * vh - y0, alto = -(60 + Math.random() * 120), tam = 0.55 + Math.random() * 0.45;
    // Voltereta 3D: cada tortilla gira sobre su eje X (de canto se ve el grosor) y se ladea un poco en Y; siempre la misma lista de transformaciones para que interpole bien
    const vueltas = (Math.random() < 0.5 ? -1 : 1) * (360 + Math.floor(Math.random() * 2) * 360), ladeo = (Math.random() - 0.5) * 70, giro = (Math.random() - 0.5) * 300;
    t.animate([
      { opacity: 0, transform: f(0, 0, 0.1, 0, 0, 0) },
      { opacity: 1, transform: f(dx * 0.45, alto, tam * 0.5, vueltas * 0.45, ladeo * 0.5, giro * 0.4), offset: 0.35 },
      { opacity: 1, transform: f(dx * 0.9, dy * 0.8, tam, vueltas * 0.9, ladeo, giro * 0.9), offset: 0.82 },
      { opacity: 0, transform: f(dx, dy, tam * 1.25, vueltas, ladeo, giro) },
    ], { duration: 1000 + Math.random() * 350, delay: i * 45, easing: 'cubic-bezier(.23,1,.32,1)', fill: 'both' }).onfinish = () => t.remove();
  }
  return n;
}
