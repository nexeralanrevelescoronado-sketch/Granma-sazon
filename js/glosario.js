// Glosario al toque: al tocar cualquier palabra del idioma que se aprende sale una burbuja con lo que significa.
// Pensado para quien empieza de cero. El glosario (data/glosario.json) lo arma el build desde scripts/datos/glosario/.
// No se envuelve cada palabra en una etiqueta: se averigua la palabra tocada con el punto del toque (cero peso en el DOM).
import { estado, guardar, tgt, nat, u } from './state.js';
import { esc } from './util.js';
import { hablar } from './fx.js';
import { ponerLentos } from './lento.js';

let datos = null, biblico = null, burbuja = null;
const cargar = () => (datos ||= fetch('data/glosario.json').then((r) => (r.ok ? r.json() : { en: {}, es: {} })).catch(() => ({ en: {}, es: {} })));
// El glosario bíblico va aparte (viaja con el paquete «Biblia»): significados formales, sin bromas ni comentarios.
const cargarBiblico = () => (biblico ||= fetch('data/biblia/glosario.json').then((r) => (r.ok ? r.json() : null)).catch(() => null).then((g) => { if (!g) biblico = null; return g || { en: {}, es: {} }; }));
const INFORMAL = /broma|chiste|juego de palabras|trabalenguas|joke|pun|tongue twister/i;
const LETRA = /[\p{L}'’]/u;

/** Busca el significado de una palabra tal como aparece; si no está, prueba formas cercanas (plural, posesivo…). Pura. */
export function buscar(glos, palabra, idioma) {
  const g = glos?.[idioma] || {}, w = String(palabra || '').toLowerCase().replace(/’/g, "'").replace(/^'+|'+$/g, '');
  if (!w) return null;
  const pruebas = [w, w.replace(/'s$/, ''), w.replace(/s'$/, 's')];
  if (idioma === 'en') pruebas.push(w.replace(/ies$/, 'y'), w.replace(/es$/, ''), w.replace(/s$/, ''), w.replace(/ed$/, ''), w.replace(/ed$/, 'e'), w.replace(/ing$/, ''), w.replace(/ing$/, 'e'), w.replace(/ly$/, ''));
  else pruebas.push(w.replace(/es$/, ''), w.replace(/s$/, ''), w.replace(/(it[oa]s?)$/, (m) => (m.includes('a') ? 'a' : 'o')));
  for (const p of pruebas) if (p && g[p]) return { palabra: w, base: p, significado: g[p] };
  return null;
}

/** La palabra que quedó bajo el punto (x, y) dentro de `el`, juntando letras aunque estén partidas en varias etiquetas. */
export function palabraEn(el, x, y) {
  let nodo, desde;
  if (document.caretPositionFromPoint) { const p = document.caretPositionFromPoint(x, y); if (p) { nodo = p.offsetNode; desde = p.offset; } }
  else if (document.caretRangeFromPoint) { const r = document.caretRangeFromPoint(x, y); if (r) { nodo = r.startContainer; desde = r.startOffset; } }
  if (!nodo || !el.contains(nodo)) return null;
  const antes = document.createRange(); antes.selectNodeContents(el); antes.setEnd(nodo, desde);
  const texto = el.textContent, i = antes.toString().length;
  let a = i, b = i;
  while (a > 0 && LETRA.test(texto[a - 1])) a--;
  while (b < texto.length && LETRA.test(texto[b])) b++;
  if (a === b) return null;
  // El toque tiene que haber caído de verdad sobre la palabra (no en el espacio vacío de al lado)
  const rango = rangoDeTexto(el, a, b), caja = rango?.getBoundingClientRect();
  if (caja && (x < caja.left - 8 || x > caja.right + 8 || y < caja.top - 8 || y > caja.bottom + 8)) return null;
  return { palabra: texto.slice(a, b), rango };
}
function rangoDeTexto(el, a, b) {
  const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT), r = document.createRange(); let n = 0, puesto = false;
  while (w.nextNode()) {
    const t = w.currentNode, fin = n + t.data.length;
    if (!puesto && a < fin) { r.setStart(t, a - n); puesto = true; }
    if (puesto && b <= fin) { r.setEnd(t, b - n); return r; }
    n = fin;
  }
  return puesto ? r : null;
}

export function cerrarGlosa() { burbuja?.remove(); burbuja = null; try { CSS.highlights?.delete('glosa'); } catch { /* sin resaltado */ } }

function mostrar(palabra, hallado, caja, idioma, enBiblia) {
  cerrarGlosa();
  burbuja = document.createElement('div'); burbuja.className = 'glosa'; burbuja.setAttribute('role', 'dialog'); burbuja.setAttribute('aria-live', 'polite');
  burbuja.innerHTML = `<button class="btn-icono" data-glosa-voz aria-label="${u('Escuchar', 'Listen')}">🔊</button><div><strong lang="${idioma}">${esc(palabra)}</strong><span lang="${nat()}">${hallado ? esc(hallado.significado) : (enBiblia ? u('Esta palabra aún no está en el glosario bíblico.', 'This word is not in the Bible glossary yet.') : u('Todavía no tengo esta palabra en mi cuaderno.', 'I do not have this word in my notebook yet.'))}</span></div>`;
  ponerLentos(burbuja);            // el perezoso se pone antes de medir la burbuja, para que no se salga de la pantalla
  document.body.append(burbuja);
  const ancho = burbuja.offsetWidth, alto = burbuja.offsetHeight, vw = document.documentElement.clientWidth;
  const izq = Math.max(8, Math.min(vw - ancho - 8, caja.left + caja.width / 2 - ancho / 2)), arriba = caja.top - alto - 10;
  burbuja.style.left = `${izq}px`; burbuja.style.top = `${arriba < 70 ? caja.bottom + 10 : arriba}px`;
  burbuja.querySelector('[data-glosa-voz]').onclick = (e) => { e.stopPropagation(); hablar(palabra, idioma); };
}

/** Enciende el glosario en toda la app (una sola vez). */
export function iniciarGlosario() {
  cargar();
  const poner = () => { document.documentElement.dataset.tgt = tgt(); }; poner(); addEventListener('hashchange', poner);
  addEventListener('hashchange', cerrarGlosa); addEventListener('scroll', cerrarGlosa, { passive: true });
  document.addEventListener('click', async (e) => {
    if (e.target.closest('.glosa')) return;
    if (burbuja) cerrarGlosa();
    const T = tgt(); poner();
    if (e.target.closest('button,a,input,select,textarea,label,[data-sin-glosa]')) return;
    const el = e.target.closest('[lang]'); if (!el || el === document.documentElement || el.getAttribute('lang').slice(0, 2) !== T) return;
    const dato = palabraEn(el, e.clientX, e.clientY); if (!dato) return;
    const enBiblia = !!el.closest('.versos');
    let hallado = enBiblia ? buscar(await cargarBiblico(), dato.palabra, T) : buscar(await cargar(), dato.palabra, T);
    if (enBiblia && !hallado) { const g = buscar(await cargar(), dato.palabra, T); if (g && !INFORMAL.test(g.significado)) hallado = g; }   // respaldo, nunca una glosa de chiste
    const caja = dato.rango?.getBoundingClientRect() || { left: e.clientX, top: e.clientY, bottom: e.clientY, width: 0 };
    try { if (dato.rango && window.Highlight && CSS.highlights) CSS.highlights.set('glosa', new Highlight(dato.rango)); } catch { /* sin resaltado */ }
    mostrar(dato.palabra, hallado, caja, T, enBiblia);
    if (estado().ajustes.voz) hablar(dato.palabra, T);
    if (hallado) anotar(hallado.palabra, hallado.significado, T);
  });
}

/** «Mi cuaderno»: las últimas palabras que la persona tocó, para repasarlas en su perfil. */
function anotar(palabra, significado, idioma) {
  const S = estado(); S.cuaderno = (S.cuaderno || []).filter((x) => !(x.p === palabra && x.l === idioma));
  S.cuaderno.unshift({ p: palabra, s: significado, l: idioma }); S.cuaderno.length = Math.min(S.cuaderno.length, 60);
  S.stats.tocadas = (S.stats.tocadas || 0) + 1; guardar();
}
