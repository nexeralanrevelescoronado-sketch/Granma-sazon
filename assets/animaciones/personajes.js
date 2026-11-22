// Personajes vivos: convierte cada <img> de personaje en SVG en línea (para animar sus partes con CSS),
// cambia de estado con fundido suave y dispara las reacciones (aplauso, asentir, dedo, hablar).
const A = 'assets/personajes/';
const ESTADOS = { granma: ['contenta', 'hablando', 'carinosa', 'pensando', 'aplaudiendo'], abuelo: ['serio', 'hablando', 'sonrisa', 'asintiendo', 'aconsejando'] };
const ANTIGUOS = { granma: { contento: 'contenta', animo: 'contenta' }, abuelo: { contento: 'sonrisa', pensando: 'serio', aplaudiendo: 'asintiendo', animo: 'aconsejando' } };
const CERRADOS = new Set(['carinosa', 'aplaudiendo', 'sonrisa', 'asintiendo']);   // ojos cerrados: sin parpadeo
export const estadoValido = (q, e) => ANTIGUOS[q]?.[e] || (ESTADOS[q]?.includes(e) ? e : ESTADOS[q]?.[0]);
export const sinMovimiento = () => matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.hasAttribute('data-oculta');
const reducir = sinMovimiento;   // reduced-motion O pestaña oculta: cambios instantáneos, nada que animar

const textos = new Map();
async function textoSvg(q, e) {
  const k = `${q}-${e}`; if (textos.has(k)) return textos.get(k);
  const p = fetch(`${A}${k}.svg`).then((r) => { if (!r.ok) throw new Error('svg'); return r.text(); });
  textos.set(k, p); p.catch(() => textos.delete(k)); return p;
}
/** Parpadeo ocasional: una animación corta (170 ms) cada 3–7 s en vez de un loop que gaste cuadros entre parpadeos. */
function programarParpadeo(svg) {
  const paso = () => {
    if (svg.isConnected) svg._visto = true;
    else if (svg._visto) return;                                                  // ya salió de la pantalla: se detiene
    const ojos = svg.querySelector('[data-g="ojos"]');
    if (ojos && svg.isConnected && !svg.hasAttribute('data-cerrados') && !sinMovimiento()) ojos.animate([{ transform: 'scaleY(1)' }, { transform: 'scaleY(.08)', offset: .5 }, { transform: 'scaleY(1)' }], { duration: 170, easing: 'ease-out' });
    setTimeout(paso, 3200 + Math.random() * 3800);
  };
  setTimeout(paso, 1500 + Math.random() * 3000);
}
/** SVG en línea: quita estilos propios (el movimiento vive en animaciones.css) y cambia id → data-g. */
async function crearSvg(q, e) {
  const t = (await textoSvg(q, e)).replace(/<style>[\s\S]*?<\/style>/g, '').replace(/<title>[\s\S]*?<\/title>/g, '').replace(/ id="(\w+)"/g, ' data-g="$1"')
    .replace(/ role="img" aria-label="[^"]*"/, ' aria-hidden="true" focusable="false"').replace('<svg ', `<svg class="pj-svg" data-estado="${e}" ${CERRADOS.has(e) ? 'data-cerrados ' : ''}`);
  const tpl = document.createElement('template'); tpl.innerHTML = t.trim(); const svg = tpl.content.firstElementChild;
  const T = q === 'abuelo' ? 5.4 : 4.6;                                    // cada uno respira a su ritmo
  svg.style.setProperty('--t-resp', `${T}s`);
  svg.style.setProperty('--d-resp', `-${((performance.now() / 1000) % T).toFixed(2)}s`);   // misma fase al cambiar de estado: sin saltos
  programarParpadeo(svg);
  return svg;
}

/** Idempotente: asegura que el .pj sea SVG en línea. Devuelve una promesa que se resuelve cuando está listo. */
export function listoPj(span) {
  if (span._lista) return span._lista;
  const img = span.querySelector('img'); const m = img?.getAttribute('src')?.match(/personajes\/(granma|abuelo)-([a-z]+)\.svg$/);
  if (!m) return (span._lista = Promise.resolve(false));
  const [, q, e] = m; span.dataset.quien = q; span.dataset.estado = e; span.dataset.base = e;
  return (span._lista = crearSvg(q, e).then((svg) => { if (img.isConnected) img.replaceWith(svg); return true; }).catch(() => false));
}
export function vigilarPersonajes(raiz = document.body) {
  const subir = () => raiz.querySelectorAll('.pj:not([data-v])').forEach((s) => { s.dataset.v = '1'; listoPj(s); });
  let pend = false; new MutationObserver(() => { if (!pend) { pend = true; queueMicrotask(() => { pend = false; subir(); }); } }).observe(raiz, { childList: true, subtree: true });
  subir();
}

let ficha = 0;
/** Cambio suave entre estados de cara: el nuevo SVG entra con fundido de 180 ms encima del anterior. */
export async function estadoPj(span, nuevo, { base = false } = {}) {
  await listoPj(span); const q = span.dataset.quien; if (!q) return;
  const e = estadoValido(q, nuevo); if (base) span.dataset.base = e;
  if (span.dataset.estado === e) return;
  const mio = ++ficha; span._ficha = mio;
  const svg = await crearSvg(q, e); if (span._ficha !== mio) return;
  const viejo = span.querySelector('.pj-svg:not(.encima)'); span.dataset.estado = e;
  if (!viejo || reducir()) { span.querySelectorAll('.pj-svg').forEach((x) => x.remove()); span.append(svg); return; }
  svg.classList.add('encima'); span.append(svg);
  const a = svg.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 180, easing: 'cubic-bezier(.23,1,.32,1)' });
  a.onfinish = a.oncancel = () => { span.querySelectorAll('.pj-svg').forEach((x) => { if (x !== svg) x.remove(); }); svg.classList.remove('encima'); };
}
/** Reacciones de una sola vez. tipo: aplauso | asiente | dedo. Sin movimiento (reduced-motion) solo cambia el estado. */
const REACCION = { aplauso: ['granma', 'aplaudiendo', 620], asiente: ['abuelo', 'asintiendo', 640], dedo: ['abuelo', 'aconsejando', 800] };
export async function reaccion(span, tipo) {
  const [q, estado, ms] = REACCION[tipo]; await listoPj(span); if (span.dataset.quien !== q) return;
  await estadoPj(span, estado); if (reducir()) return;
  const svg = [...span.querySelectorAll('.pj-svg')].pop(); if (!svg) return;
  const clase = `anim-${tipo}`; svg.classList.remove(clase); void svg.getBoundingClientRect(); svg.classList.add(clase);
  setTimeout(() => svg.classList.remove(clase), ms);
}
/** Mientras se escribe el globo: la boca alterna cerrada/abierta (en el estado actual). */
export async function hablando(span, si) { await listoPj(span); span.querySelector('.pj-svg:not(.encima)')?.classList.toggle('habla', si); span.querySelectorAll('.pj-svg').forEach((s) => s.classList.toggle('habla', si)); }
