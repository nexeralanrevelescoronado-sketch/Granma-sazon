// Cuando Granma o el Abuelo «hablan»: el globo se escribe letra por letra y la boca alterna
// cerrada/abierta (animación CSS dentro del SVG «hablando»). La voz (Web Speech API) es opcional y viene apagada.
import { estado, guardar, u } from './state.js';
import { reducirMovimiento } from './util.js';
import { toast } from './fx.js';
import { estadoPj, reaccion, hablando, listoPj } from '../assets/animaciones/index.js';

let epoca = 0, cola = Promise.resolve(), avisoVoces = false;
const LANG = { es: 'es-MX', en: 'en-US' };

/* ---------- voz ---------- */
export const vozDisponible = () => 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
export const vozActiva = () => !!estado().ajustes.voz && vozDisponible();
export function hayVozPara(idioma) {
  try { return speechSynthesis.getVoices().some((v) => v.lang.toLowerCase().replace('_', '-').startsWith(idioma)); } catch { return false; }
}
export function alternarVoz() {
  const a = estado().ajustes;
  if (!vozDisponible()) { toast(u('Tu navegador no tiene voz.', 'Your browser has no speech voice.')); return false; }
  a.voz = !a.voz; guardar();
  if (a.voz) {
    toast(u('🗣 Voz activada. Sin internet usa las voces instaladas en tu dispositivo.', '🗣 Voice on. Offline it uses the voices installed on your device.'));
    for (const l of ['es', 'en']) if (!hayVozPara(l) && speechSynthesis.getVoices().length) toast(u(`No encontré una voz instalada para ${l === 'es' ? 'español' : 'inglés'}.`, `No installed voice found for ${l === 'es' ? 'Spanish' : 'English'}.`));
  } else cancelarVoz();
  return a.voz;
}
export const cancelarVoz = () => { try { speechSynthesis.cancel(); } catch { /* sin voz */ } };
function decir(texto, idioma) {
  return new Promise((ok) => {
    try {
      cancelarVoz();
      const ut = new SpeechSynthesisUtterance(texto); ut.lang = LANG[idioma] || 'es-MX'; ut.rate = 0.92;
      const t = setTimeout(ok, Math.min(20000, 1500 + texto.length * 90));
      ut.onend = ut.onerror = () => { clearTimeout(t); ok(); };
      speechSynthesis.speak(ut);
    } catch { ok(); }
  });
}

/* ---------- escritura ---------- */
function nodosDeTexto(raiz) {
  const w = document.createTreeWalker(raiz, NodeFilter.SHOW_TEXT, { acceptNode: (n) => (n.parentElement.closest('button,script,style') || !n.data.trim() && !n.data.length ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT) });
  const lista = []; while (w.nextNode()) lista.push(w.currentNode); return lista;
}
function escribir(globo, mio) {
  return new Promise((fin) => {
    const nodos = nodosDeTexto(globo), orig = nodos.map((n) => n.data), total = orig.reduce((s, t) => s + t.length, 0);
    if (!total || reducirMovimiento()) { globo.style.visibility = 'visible'; return fin(); }
    globo.style.minHeight = globo.offsetHeight + 'px'; nodos.forEach((n) => { n.data = ''; }); globo.style.visibility = 'visible';
    globo.setAttribute('aria-busy', 'true');
    const ms = Math.min(24, Math.max(7, 1800 / total)), t0 = performance.now(); let hecho = 0;
    const completar = () => { nodos.forEach((n, i) => { n.data = orig[i]; }); globo.removeAttribute('aria-busy'); globo.style.minHeight = ''; globo.removeEventListener('pointerdown', completar); fin(); };
    globo.addEventListener('pointerdown', completar, { once: true });
    globo._completar = completar;
    (function paso() {
      if (mio !== epoca || !globo.isConnected) return fin();
      const n = Math.min(total, Math.floor((performance.now() - t0) / ms));
      if (n !== hecho) { hecho = n; let resto = n; nodos.forEach((nodo, i) => { const k = Math.max(0, Math.min(orig[i].length, resto)); nodo.data = orig[i].slice(0, k); resto -= orig[i].length; }); }
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
    if (base === 'aconsejando') reaccion(span, 'dedo');
  } else { await hablando(span, false); await estadoPj(span, base); }
}
async function hablar(dialogo, mio) {
  const globo = dialogo.querySelector('.globo'); if (!globo || mio !== epoca) return;
  const l1 = globo.querySelector('[lang]'), idioma = (l1?.getAttribute('lang') || document.documentElement.lang || 'es').slice(0, 2);
  const copia = (l1 || globo).cloneNode(true); copia.querySelectorAll('.quien,button,mark svg').forEach((x) => x.remove());
  const texto = copia.textContent.replace(/\s+/g, ' ').trim();
  await conBoca(dialogo, true);
  const voz = vozActiva() && texto ? decir(texto, idioma) : Promise.resolve();
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
export function detenerHabla() { epoca++; cola = Promise.resolve(); cancelarVoz(); }
