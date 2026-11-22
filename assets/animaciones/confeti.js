// Confeti ligero: máximo 40 partículas DOM, solo transform + opacity (WAAPI), 560 ms con ease-out.
export const MAX_CONFETI = 40;
const COLORES = ['#C8553D', '#F2A93B', '#2E8B83', '#E0568C', '#FFF1DC'];
export function confeti(cant = MAX_CONFETI, colores = COLORES) {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.hasAttribute('data-oculta')) return 0;   // sin movimiento o pestaña oculta
  const n = Math.min(MAX_CONFETI, Math.max(1, cant | 0));
  let cap = document.querySelector('.confeti-cap'); if (!cap) { cap = document.createElement('div'); cap.className = 'confeti-cap'; cap.setAttribute('aria-hidden', 'true'); document.body.append(cap); }
  cap.replaceChildren();
  for (let i = 0; i < n; i++) {
    const p = document.createElement('i'); p.style.background = colores[i % colores.length]; cap.append(p);
    const ang = (-Math.PI / 2) + (Math.random() - .5) * Math.PI * 1.3, fuerza = 120 + Math.random() * 190, giro = (Math.random() - .5) * 720;
    const dx = Math.cos(ang) * fuerza, dy = Math.sin(ang) * fuerza;
    p.animate([
      { opacity: 1, transform: 'translate(-50%,0) rotate(0deg)' },
      { opacity: 1, transform: `translate(calc(-50% + ${dx * .8}px), ${dy}px) rotate(${giro * .7}deg)`, offset: .55 },
      { opacity: 0, transform: `translate(calc(-50% + ${dx}px), ${dy + 70}px) rotate(${giro}deg)` },
    ], { duration: 520 + Math.random() * 60, easing: 'cubic-bezier(.23,1,.32,1)', fill: 'forwards' }).onfinish = () => p.remove();
  }
  return n;
}
