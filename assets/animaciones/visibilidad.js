// Con la pestaña oculta se pausa todo (CSS y WAAPI); al volver se reanuda lo que pausamos nosotros.
let pausadas = [];
function aplicar(oculta) {
  document.documentElement.toggleAttribute('data-oculta', oculta);
  if (oculta) { pausadas = document.getAnimations().filter((a) => a.playState === 'running'); pausadas.forEach((a) => a.pause()); }
  else { pausadas.forEach((a) => { try { a.play(); } catch { /* ya terminó */ } }); pausadas = []; }
}
const alCambiar = () => aplicar(document.hidden);
export function pausarSiOculta() { document.addEventListener('visibilitychange', alCambiar); alCambiar(); }
/** Para pruebas y la demo: simula pestaña oculta/visible. */
export const forzarOculta = (si) => aplicar(si);
