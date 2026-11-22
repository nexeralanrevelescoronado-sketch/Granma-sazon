// Cuando Granma o el Abuelo «hablan»: el globo se escribe letra por letra y la boca alterna
// cerrada/abierta (animación CSS dentro del SVG «hablando»). La voz (Web Speech API, ver voz.js) viene encendida y se apaga con el botón 🗣.
import { estado, guardar, u } from './state.js';
import { reducirMovimiento } from './util.js';
import { toast } from './fx.js';
import { vozDisponible, hayVozPara, callar, decirPreferido } from './voz.js';
import { estadoPj, reaccion, hablando, listoPj } from '../assets/animaciones/index.js';

let epoca = 0, cola = Promise.resolve();

/* ---------- voz ---------- */
export { vozDisponible };
export const vozActiva = () => !!estado().ajustes.voz && vozDisponible();
export function alternarVoz() {
  const a = estado().ajustes;
  if (!vozDisponible()) { toast(u('Tu navegador no tiene voz.', 'Your browser has no speech voice.')); return false; }
  a.voz = !a.voz; guardar();
  if (a.voz) {
    toast(u('🗣 Voz activada. Sin internet usa las voces instaladas en tu dispositivo.', '🗣 Voice on. Offline it uses the voices installed on your device.'));
    for (const l of ['es', 'en']) if (!hayVozPara(l) && speechSynthesis.getVoices().length) toast(u(`No encontré una voz instalada para ${l === 'es' ? 'español' : 'inglés'}.`, `No installed voice found for ${l === 'es' ? 'Spanish' : 'English'}.`));
  } else callar();
  return a.voz;
}

/* ---------- escritura ---------- */
function nodosDeTexto(raiz) {
  const w = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT, { acceptNode: (n) => (n.parentElement.closest('button,script,style,.t') || !n.data.length ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT) });
  const lista = []; while (w.nextNode()) lista.push(w.currentNode); return lista;
}
/** Parte el texto en <span class="t"> (letras, o palabras si es largo) para revelarlos con opacity: el layout ya está completo, no hay reflujo. */
function dividir(globo) {
  const nodos = nodosDeTexto(globo), total = nodos.reduce((s, n) => s + n.data.length, 0), porPalabra = total > 120, spans = [];
  for (const n of nodos) {
    const frag = document.createDocumentFragment();
    for (const parte of (porPalabra ? n.data.split(/(\s+)/) : [...n.data])) { if (!parte) continue; const sp = document.createElement('span'); sp.className = 't'; sp.textContent = parte; frag.append(sp); spans.push(sp); }
    n.replaceWith(frag);
  }
  return spans;
}
function escribir(globo, mio) {
  return new Promise((fin) => {
    globo.style.visibility = 'visible';
    if (reducirMovimiento() || document.documentElement.hasAttribute('data-oculta')) return fin();
    const spans = dividir(globo), total = spans.length; if (!total) return fin();
    globo.setAttribute('aria-busy', 'true');
    const ms = Math.min(24, Math.max(7, 1800 / total)), t0 = performance.now(); let hecho = 0;
    const completar = () => { for (let i = hecho; i < total; i++) spans[i].classList.add('on'); hecho = total; globo.removeAttribute('aria-busy'); globo.removeEventListener('pointerdown', completar); fin(); };
    globo.addEventListener('pointerdown', completar, { once: true });
    (function paso() {
      if (mio !== epoca || !globo.isConnected) return fin();
      const n = Math.min(total, Math.floor((performance.now() - t0) / ms));
      for (; hecho < n; hecho++) spans[hecho].classList.add('on');
      if (hecho >= total) return completar();
      requestAnimationFrame(paso);
    })();
  });
}
const GESTO = new Set(['contenta', 'serio']);   // estados en reposo que pasan a «hablando» (con ademán) mientras se escribe
async function conBoca(dialogo, hablandoAhora) {
  const span = dialogo.querySelector('.pj'); if (!span) return;
  await listoPj(span); const base = span.dataset.base;
  if (hablandoAhora) {
    if (GESTO.has(base)) await estadoPj(span, 'hablando'); else await hablando(span, true);
    if (base === 'aconsejando') reaccion(span, 'mano');
  } else { await hablando(span, false); await estadoPj(span, base); }
}
async function hablar(dialogo, mio) {
  const globo = dialogo.querySelector('.globo'); if (!globo || mio !== epoca) return;
  const l1 = globo.querySelector('[lang]'), idioma = (l1?.getAttribute('lang') || document.documentElement.lang || 'es').slice(0, 2);
  const copia = (l1 || globo).cloneNode(true); copia.querySelectorAll('.quien,button,mark svg').forEach((x) => x.remove());
  const texto = copia.textContent.replace(/\s+/g, ' ').trim();
  await conBoca(dialogo, true);
  const quien = globo.classList.contains('abuelo') ? 'abuelo' : 'granma';          // el Abuelo habla grave y pausado; Granma, cálida
  // Si el Abuelo tiene esa frase grabada con su voz real (aunque sea en el otro idioma del globo), se oye la grabación.
  const limpio = (el) => { const c = el.cloneNode(true); c.querySelectorAll('.quien,button,mark svg').forEach((x) => x.remove()); return c.textContent.replace(/\s+/g, ' ').trim(); };
  const otras = [...globo.querySelectorAll('[lang]')].filter((el) => el !== l1).map((el) => [limpio(el), el.getAttribute('lang').slice(0, 2)]).filter(([t]) => t);
  const voz = vozActiva() && texto ? decirPreferido([[texto, idioma], ...otras], quien) : Promise.resolve();
  await Promise.all([escribir(globo, mio), voz]);
  await conBoca(dialogo, false);
}

/** Observa `raiz`: cada diálogo nuevo se «habla» en orden. Tocar un globo lo completa. */
export function vigilarDialogos(raiz) {
  const cuando = () => {
    const nuevos = [...raiz.querySelectorAll('.dialogo:not([data-habla])')]; if (!nuevos.length) return;
    const mio = epoca;
    for (const d of nuevos) { d.dataset.habla = '1'; const g = d.querySelector('.globo'); if (g) g.style.visibility = 'hidden'; }
    setTimeout(() => { for (const d of nuevos) cola = cola.then(() => hablar(d, mio)); }, 0);
  };
  new MutationObserver(cuando).observe(raiz, { childList: true, subtree: true });
}
/** Al cambiar de pantalla: corta escritura y voz pendientes. */
export function detenerHabla() { epoca++; cola = Promise.resolve(); callar(); }
