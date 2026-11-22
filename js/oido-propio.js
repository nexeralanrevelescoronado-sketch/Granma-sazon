// «Oído de Granma»: reconocimiento de palabras DENTRO del teléfono, sin internet y sin enviar la voz a nadie.
// Usa Vosk (Apache-2.0, ver assets/oido/LICENCIAS.md), que se descarga aparte como paquete opcional y se carga solo
// cuando hace falta. Escucha en vivo, va marcando palabra por palabra y al final dice cuáles oyó.
//
// Cómo decide: corren dos reconocedores a la vez sobre la misma voz.
//   · «guiado»: solo conoce las palabras de la frase (y «algo distinto»). Sabe si la persona dijo la frase y qué palabras faltaron.
//   · «libre»: reconoce cualquier palabra. Si además coincide, la frase salió clarita.
//   · al guiado se le dan también palabras «rivales» que suenan parecido (bread → bed, red): tiene que elegir cuál oyó.
// Con eso califica la pronunciación palabra por palabra: clara, casi (sonó como otra) o falta.
// Límite honesto: califica QUÉ palabra se oyó y con cuánta seguridad; no mide cada sonido ni el acento.
import { limpiar } from './oido.js';
import { paqueteListo } from './descargas.js';

const RUTA = 'assets/oido/', modelos = {};
let libreria = null;
export const paqueteOido = (idioma) => `oido-${idioma}`;
/** ¿Está descargado el Oído de Granma para ese idioma? */
export const oidoPropioListo = (idioma) => paqueteListo(paqueteOido(idioma)).catch(() => false);

function cargarLibreria() {
  return (libreria ||= new Promise((ok, mal) => {
    if (window.Vosk) return ok(window.Vosk);
    const s = document.createElement('script'); s.src = `${RUTA}vosk.js`; s.onload = () => (window.Vosk ? ok(window.Vosk) : mal(new Error('sin Vosk'))); s.onerror = () => mal(new Error('no cargó')); document.head.append(s);
  }).catch((e) => { libreria = null; throw e; }));
}
/** Carga (una vez) el modelo del idioma. Tarda unos segundos la primera vez. */
export function prepararOido(idioma) {
  return (modelos[idioma] ||= cargarLibreria().then((V) => V.createModel(`${RUTA}modelo-${idioma}.tar.gz`)).catch((e) => { delete modelos[idioma]; throw e; }));
}

const parecida = (a, b) => {
  if (a === b) return true; if (b.length < 6 || Math.abs(a.length - b.length) > 1) return false;
  let i = 0, j = 0, dif = 0;
  while (i < a.length && j < b.length) { if (a[i] === b[j]) { i++; j++; } else { if (++dif > 1) return false; if (a.length > b.length) i++; else if (a.length < b.length) j++; else { i++; j++; } } }
  return dif + (a.length - i) + (b.length - j) <= 1;
};
/* ---------- Palabras rivales: lo que permite calificar la pronunciación ----------
   Al reconocedor guiado se le dan, además de las palabras de la frase, otras que suenan parecido (bread → bed, red…).
   Así tiene que ELEGIR: si la persona dijo «bed», oye «bed» y no lo da por «bread». Las rivales salen del vocabulario
   de la propia app (palabras aptas para toda la familia) y de grupos conocidos de confusión; nunca de una lista ajena. */
const GRUPOS = {
  en: [['bread', 'bed', 'bred', 'red', 'read'], ['kitchen', 'chicken'], ['live', 'leave', 'love', 'life'], ['ship', 'sheep', 'chip', 'cheap'], ['this', 'these'], ['it', 'eat'], ['sit', 'seat', 'set'],
    ['full', 'fool', 'fall'], ['hot', 'hat', 'hut', 'heart'], ['cup', 'cap', 'cop'], ['pan', 'pen', 'pin'], ['bad', 'bat', 'bet', 'but'], ['want', 'won\'t', 'went'], ['work', 'walk', 'woke'], ['word', 'world', 'ward'],
    ['three', 'tree', 'free'], ['think', 'sink', 'thing'], ['they', 'day'], ['then', 'than', 'den'], ['very', 'berry'], ['year', 'ear', 'jeer'], ['yes', 'jazz'], ['wash', 'watch'], ['shoe', 'chew'], ['soup', 'soap'],
    ['rice', 'rise', 'race'], ['made', 'mad', 'make'], ['hungry', 'angry'], ['warm', 'worm', 'warn', 'arm'], ['spoon', 'spun'], ['table', 'cable'], ['mother', 'mutter'], ['house', 'horse'], ['water', 'waiter'], ['sweet', 'sweat'], ['small', 'smell'], ['salt', 'sold'], ['milk', 'meal'], ['fire', 'fear', 'far'], ['corn', 'con', 'cone']],
  es: [['pero', 'perro'], ['caro', 'carro'], ['casa', 'caza', 'cosa'], ['pan', 'plan'], ['hola', 'ola'], ['mesa', 'misa', 'masa'], ['sal', 'sol'], ['año', 'ano'], ['beso', 'peso', 'vaso'], ['cena', 'pena']],
};
const clave = (w) => w.replace(/ph/g, 'f').replace(/ck/g, 'k').replace(/^kn/, 'n').replace(/^wr/, 'r').replace(/wh/g, 'w').replace(/[aeiouyáéíóúü]+/g, 'V').replace(/(.)\1/g, '$1');
function distancia(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}
/** Palabras que suenan parecido a `palabra` (máx. `tope`). `vocabulario` = palabras de la app en ese idioma. Pura. */
export function rivalesDe(palabra, idioma, vocabulario = [], tope = 4) {
  const w = limpiar(palabra); if (w.length < 2) return [];
  const sal = new Set(); if (w.length >= 3) for (const g of GRUPOS[idioma] || []) if (g.includes(w)) g.forEach((x) => x !== w && sal.add(limpiar(x)));
  const k = clave(w);
  if (w.length >= 4) for (const v of vocabulario) {
    if (sal.size >= tope) break;
    const x = limpiar(v); if (x === w || x.includes(' ') || Math.abs(x.length - w.length) > 2 || x.length < 2 || x[0] !== w[0]) continue;
    if (x === w + 's' || w === x + 's' || x === w + 'es' || x === w + 'd' || x === w + 'ed') continue;            // plural o pasado de la misma palabra: no es error de pronunciación
    if (distancia(clave(x), k) <= 1 && distancia(x, w) <= 2) sal.add(x);
  }
  return [...sal].slice(0, tope);
}
/** Rivales de todas las palabras de una frase: { palabra: [rivales] }. Las rivales nunca son palabras de la propia frase. */
export function rivalesDeFrase(frase, idioma, vocabulario = []) {
  const esp = [...new Set(limpiar(frase).split(' ').filter(Boolean))], mapa = {};
  for (const w of esp) mapa[w] = rivalesDe(w, idioma, vocabulario).filter((x) => !esp.includes(x));
  return mapa;
}

/**
 * Califica lo que oyeron los dos reconocedores contra la frase esperada. Pura (se prueba sin micrófono).
 *   oidoGuiado: texto, o lista [{ word, conf }] del resultado final (con confianza por palabra).
 * Cada palabra queda:  'clara' (se oyó esa palabra) · 'casi' (se oyó una que suena parecido, o con poca seguridad) · 'falta'.
 * → { palabras: [{ w, ok, estado, sono? }], dichas, claras, total, todo, exacta, nota (0-1), estrellas (0-3), pasa }
 */
export function calificar(frase, oidoGuiado, oidoLibre = '', rivales = {}) {
  const esp = limpiar(frase).split(' ').filter(Boolean), l = limpiar(oidoLibre).split(' ').filter(Boolean);
  const g = (Array.isArray(oidoGuiado) ? oidoGuiado : limpiar(oidoGuiado).split(' ').map((word) => ({ word, conf: 1 })))
    .map((x) => ({ word: limpiar(x.word), conf: x.conf ?? 1 })).filter((x) => x.word && x.word !== 'unk');
  const sacar = (lista, prueba) => { const i = lista.findIndex(prueba); return i < 0 ? null : lista.splice(i, 1)[0]; };
  const gg = [...g], ll = [...l];
  const palabras = esp.map((w) => {
    const enLibre = !!sacar(ll, (x) => parecida(x, w)), enGuiado = sacar(gg, (x) => x.word === w);
    if (enGuiado) return { w, ok: true, estado: enGuiado.conf >= 0.6 || enLibre ? 'clara' : 'casi' };
    if (enLibre) return { w, ok: true, estado: 'clara' };
    const rival = sacar(gg, (x) => (rivales[w] || []).includes(x.word));
    return rival ? { w, ok: true, estado: 'casi', sono: rival.word } : { w, ok: false, estado: 'falta' };
  });
  const dichas = palabras.filter((p) => p.ok).length, claras = palabras.filter((p) => p.estado === 'clara').length, total = esp.length;
  const nota = total ? (claras + 0.5 * (dichas - claras)) / total : 0;
  return { palabras, dichas, claras, total, todo: total > 0 && dichas === total, exacta: limpiar(oidoLibre) === esp.join(' '), nota,
    estrellas: !total || nota < 0.6 ? 0 : claras === total ? 3 : nota >= 0.8 ? 2 : 1, pasa: total > 0 && nota >= 0.6 };
}

let vocab = null;
const vocabularioDe = (idioma) => (vocab ||= fetch('data/glosario.json').then((r) => r.json()).catch(() => ({}))).then((g) => Object.keys(g?.[idioma] || {}).filter((w) => /^\p{L}+$/u.test(w)));

/**
 * Escucha en vivo a la persona diciendo `frase`.
 *   alParcial({ palabras })  cada vez que reconoce algo nuevo (para ir pintando palabra por palabra)
 *   alNivel(v)               volumen de la voz, para mover el micrófono
 * → { ok: true, fin: Promise<{ palabras, dichas, total, todo, exacta, oyoAlgo, url }>, parar }  |  { ok: false, motivo }
 * La grabación (url local, en memoria) es para que la persona se oiga; quien la usa la libera.
 */
export async function escucharPropio(idioma, frase, { ms = 12000, alParcial, alNivel } = {}) {
  let modelo, flujo;
  try { modelo = await prepararOido(idioma); } catch { return { ok: false, motivo: 'sin-oido' }; }
  try { flujo = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, channelCount: 1 } }); } catch { return { ok: false, motivo: 'permiso' }; }
  const AC = window.AudioContext || window.webkitAudioContext, ctx = new AC(); if (ctx.state === 'suspended') await ctx.resume().catch(() => {});
  const esp = limpiar(frase).split(' ').filter(Boolean), rivales = rivalesDeFrase(frase, idioma, await vocabularioDe(idioma));
  const guiado = new modelo.KaldiRecognizer(ctx.sampleRate, JSON.stringify([esp.join(' '), ...new Set(esp), ...new Set(Object.values(rivales).flat()), '[unk]'])), libre = new modelo.KaldiRecognizer(ctx.sampleRate);
  guiado.setWords(true);                                   // confianza por palabra en el resultado final
  const finales = [];
  const oido = { g: [], l: [], gp: '', lp: '' };            // resultados cerrados y el parcial en curso de cada uno
  const texto = (k) => [...oido[k], oido[k + 'p']].join(' ');
  const avisar = () => alParcial?.(calificar(frase, texto('g'), texto('l'), rivales));
  guiado.on('partialresult', (m) => { oido.gp = m.result.partial || ''; avisar(); });
  guiado.on('result', (m) => { if (m.result.text) { oido.g.push(m.result.text); finales.push(...(m.result.result || m.result.text.split(' ').map((word) => ({ word, conf: 1 })))); } oido.gp = ''; avisar(); });
  libre.on('partialresult', (m) => { oido.lp = m.result.partial || ''; avisar(); });
  libre.on('result', (m) => { if (m.result.text) oido.l.push(m.result.text); oido.lp = ''; avisar(); });

  const trozos = []; let mr = null;
  try { mr = new MediaRecorder(flujo); mr.ondataavailable = (e) => { if (e.data.size) trozos.push(e.data); }; mr.start(); } catch { mr = null; }
  const fuente = ctx.createMediaStreamSource(flujo), nodo = ctx.createScriptProcessor(4096, 1, 1), mudo = ctx.createGain(); mudo.gain.value = 0;
  let vivo = true, hablo = 0, ultimaVoz = 0, cerrar; const t0 = performance.now();
  nodo.onaudioprocess = (ev) => {
    if (!vivo) return;
    try { guiado.acceptWaveform(ev.inputBuffer); libre.acceptWaveform(ev.inputBuffer); } catch { /* el reconocedor ya cerró */ }
    const d = ev.inputBuffer.getChannelData(0); let s = 0; for (let i = 0; i < d.length; i++) s += d[i] * d[i];
    const v = Math.sqrt(s / d.length), t = performance.now() - t0; alNivel?.(v);
    if (v > 0.03) { hablo++; ultimaVoz = t; }
    const yaTodo = calificar(frase, texto('g'), texto('l'), rivales).claras === esp.length;
    if ((hablo > 2 && t - ultimaVoz > (yaTodo ? 500 : 1300)) || t > ms) cerrar();       // terminó de hablar (o se acabó el tiempo)
  };
  fuente.connect(nodo); nodo.connect(mudo); mudo.connect(ctx.destination);

  const fin = new Promise((ok) => {
    cerrar = () => {
      if (!vivo) return; vivo = false;
      try { guiado.retrieveFinalResult(); libre.retrieveFinalResult(); } catch { /* ya cerró */ }
      const grabado = new Promise((k) => { if (!mr || mr.state === 'inactive') return k(); mr.onstop = () => k(); mr.stop(); });
      Promise.all([grabado, new Promise((k) => setTimeout(k, 450))]).then(() => {          // un momento para que lleguen los resultados finales
        try { nodo.disconnect(); fuente.disconnect(); } catch { /* ya */ } flujo.getTracks().forEach((x) => x.stop()); ctx.close().catch(() => {});
        try { guiado.remove(); libre.remove(); } catch { /* ya */ }
        const r = calificar(frase, finales.length ? finales : texto('g'), texto('l'), rivales);
        ok({ ...r, oyoAlgo: hablo > 2, url: trozos.length ? URL.createObjectURL(new Blob(trozos, { type: mr?.mimeType || 'audio/mp4' })) : null });
      });
    };
  });
  return { ok: true, fin, parar: () => cerrar() };
}
