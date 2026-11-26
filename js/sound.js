// Sonidos cortos sintetizados (sin archivos de audio: cero peso). Silenciables.
import { estado, guardar } from './state.js';
let ctx;
function tono(freq, dur, inicio = 0, tipo = 'sine', vol = 0.12) {
  if (!estado().ajustes.sonido) return;
  try {
    ctx ||= new (window.AudioContext || window.webkitAudioContext)();
    if (ctx.state === 'suspended') ctx.resume();
    const o = ctx.createOscillator(), g = ctx.createGain(), t = ctx.currentTime + inicio;
    o.type = tipo; o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + dur + 0.05);
  } catch { /* sin audio: no pasa nada */ }
}
export const sonido = {
  ok() { tono(659, 0.12); tono(880, 0.18, 0.1); },
  racha(n) { const b = 659 * 2 ** (Math.min(n - 3, 7) / 12); tono(b, 0.1); tono(b * 1.26, 0.1, 0.08); tono(b * 1.5, 0.2, 0.16); },
  viva() { [[392, 0], [523, 0.12], [659, 0.24], [784, 0.36], [659, 0.5], [784, 0.62]].forEach(([f, t], i) => tono(f, i > 3 ? 0.28 : 0.14, t, 'sawtooth', 0.07)); },
  plaf() { tono(150, 0.16, 0, 'sine', 0.22); tono(95, 0.22, 0.03, 'triangle', 0.18); },   // tortilla que se estrella contra el vidrio
  mal() { tono(220, 0.22, 0, 'triangle', 0.1); },
  logro() { [523, 659, 784, 1047].forEach((f, i) => tono(f, 0.18, i * 0.1)); },
  tic() { tono(1200, 0.04, 0, 'square', 0.05); },
  alarma() { [880, 0, 880, 0, 880].forEach((f, i) => f && tono(f, 0.15, i * 0.2, 'square', 0.08)); },
  activo: () => estado().ajustes.sonido,
  alternar() { const a = estado().ajustes; a.sonido = !a.sonido; guardar(); if (a.sonido) this.ok(); return a.sonido; },
};
