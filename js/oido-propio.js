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
  es: [['pero', 'perro'], ['caro', 'carro'], ['casa', 'caza', 'cosa'], ['pan', 'plan'], ['hola', 'ola'], ['mesa', 'misa', 'masa'], ['sal', 'sol'], ['beso', 'peso', 'vaso'], ['cena', 'pena'], ['papa', 'papá'], ['esta', 'está'], ['si', 'sí'], ['hablo', 'habló'], ['mano', 'mono'], ['hoja', 'hija'], ['luz', 'los'], ['queso', 'beso'], ['dulce', 'doce'], ['fuego', 'juego']],
};
const clave = (w) => w.replace(/ph/g, 'f').replace(/ck/g, 'k').replace(/^kn/, 'n').replace(/^wr/, 'r').replace(/wh/g, 'w').replace(/[aeiouyáéíóúü]+/g, 'V').replace(/(.)\1/g, '$1');
function distancia(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}
/** Como `limpiar`, pero conserva acentos y ñ: así se le pasan las palabras al reconocedor (en español «está» no es «esta»). */
export const paraOir = (t) => String(t || '').toLowerCase().normalize('NFC').replace(/[^\p{L}\p{N}\s']/gu, ' ').replace(/'/g, '').replace(/\s+/g, ' ').trim();

/** Palabras que suenan parecido a `palabra` (máx. `tope`). `vocabulario` = palabras de la app en ese idioma. Pura. */
export function rivalesDe(palabra, idioma, vocabulario = [], tope = idioma === 'es' ? 2 : 4) {
  const w = limpiar(palabra); if (w.length < 2) return [];
  const sal = new Set(); if (w.length >= 3) for (const g of GRUPOS[idioma] || []) if (g.includes(w)) g.forEach((x) => x !== w && sal.add(x));
  const k = clave(w);
  if (w.length >= 4) for (const v of vocabulario) {
    if (sal.size >= tope) break;
    const x = limpiar(v); if (x === w || x.includes(' ') || Math.abs(x.length - w.length) > 2 || x.length < 2 || x[0] !== w[0] || [...sal].some((r) => limpiar(r) === x)) continue;
    if (x === w + 's' || w === x + 's' || x === w + 'es' || x === w + 'd' || x === w + 'ed') continue;            // plural o pasado de la misma palabra: no es error de pronunciación
    // En español cada letra suena: solo cuenta como rival la que cambia UNA letra (pero / perro). En inglés se compara por sonido aproximado.
    if (idioma === 'es' ? distancia(x, w) === 1 && Math.abs(x.length - w.length) <= 1 : distancia(clave(x), k) <= 1 && distancia(x, w) <= 2) sal.add(paraOir(v));
  }
  return [...sal].slice(0, tope);
}
/** Rivales de todas las palabras de una frase: { palabra: [rivales] }. Las rivales nunca son palabras de la propia frase. */
export function rivalesDeFrase(frase, idioma, vocabulario = []) {
  const esp = [...new Set(limpiar(frase).split(' ').filter(Boolean))], mapa = {};
  for (const w of esp) mapa[w] = rivalesDe(w, idioma, vocabulario).filter((x) => !esp.includes(limpiar(x)));
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
    const rival = sacar(gg, (x) => (rivales[w] || []).some((r) => limpiar(r) === x.word));
    return rival ? { w, ok: true, estado: 'casi', sono: (rivales[w] || []).find((r) => limpiar(r) === rival.word) || rival.word } : { w, ok: false, estado: 'falta' };
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
/* ---------- Arranque a prueba de trabones ----------
   En Android, el audio solo «despierta» si se pide en el mismo toque. Antes se pedía después de esperar al modelo y al
   micrófono, y a veces nunca despertaba: se quedaba en «Preparando el oído…». Ahora el toque abre el audio al instante
   (`audioDelToque`), nada se espera para siempre (cada paso tiene su tope) y un toque mientras prepara lo cancela. */
const conTope = (promesa, ms) => Promise.race([promesa, new Promise((k) => setTimeout(() => k('tope'), ms))]);
let audioListo = null;
/** Llamar SIN await, dentro del toque del micrófono: abre el audio mientras el teléfono todavía cuenta el toque. */
export function audioDelToque() {
  try {
    if (audioListo && audioListo.state !== 'closed') audioListo.close().catch(() => {});
    const AC = window.AudioContext || window.webkitAudioContext; audioListo = AC ? new AC() : null;
    if (audioListo?.state === 'suspended') audioListo.resume().catch(() => {});
  } catch { audioListo = null; }
}
const tomarAudio = () => { const c = audioListo; audioListo = null; if (c && c.state !== 'closed') return c; const AC = window.AudioContext || window.webkitAudioContext; return new AC(); };

export async function escucharPropio(idioma, frase, { ms = 12000, alParcial, alNivel, senal = {} } = {}) {
  let modelo, flujo, ctx = null;
  const soltarTodo = () => { try { flujo?.getTracks().forEach((x) => x.stop()); } catch { /* ya */ } try { if (ctx && ctx.state !== 'closed') ctx.close().catch(() => {}); } catch { /* ya */ } };
  const cancelado = () => { if (!senal.cancelado) return false; soltarTodo(); return true; };
  try { modelo = await prepararOido(idioma); } catch { return { ok: false, motivo: 'sin-oido' }; }
  if (cancelado()) return { ok: false, motivo: 'cancelado' };
  try {
    const pedido = navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true, channelCount: 1 } });
    flujo = await conTope(pedido, 10000);
    if (flujo === 'tope') { flujo = null; pedido.then((f) => f.getTracks().forEach((x) => x.stop())).catch(() => {}); return { ok: false, motivo: 'audio' }; }
  } catch { return { ok: false, motivo: 'permiso' }; }
  if (cancelado()) return { ok: false, motivo: 'cancelado' };
  try { ctx = tomarAudio(); } catch { soltarTodo(); return { ok: false, motivo: 'audio' }; }
  if (ctx.state !== 'running') await conTope(ctx.resume().catch(() => {}), 1500);
  if (ctx.state !== 'running') { soltarTodo(); return { ok: false, motivo: 'audio' }; }     // el audio no despertó: que se toque otra vez
  if (cancelado()) return { ok: false, motivo: 'cancelado' };
  const esp = limpiar(frase).split(' ').filter(Boolean), rivales = rivalesDeFrase(frase, idioma, await vocabularioDe(idioma));
  const dichoAsi = paraOir(frase).split(' ').filter(Boolean);            // con acentos, como las conoce el reconocedor
  const guiado = new modelo.KaldiRecognizer(ctx.sampleRate, JSON.stringify([dichoAsi.join(' '), ...new Set(dichoAsi), ...new Set(Object.values(rivales).flat()), '[unk]'])), libre = new modelo.KaldiRecognizer(ctx.sampleRate);
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
  let vivo = true, hablo = 0, ultimaVoz = 0, cerrar, cuadros = 0; const t0 = performance.now();
  nodo.onaudioprocess = (ev) => {
    if (!vivo) return; cuadros++;
    try { guiado.acceptWaveform(ev.inputBuffer); libre.acceptWaveform(ev.inputBuffer); } catch { /* el reconocedor ya cerró */ }
    const d = ev.inputBuffer.getChannelData(0); let s = 0; for (let i = 0; i < d.length; i++) s += d[i] * d[i];
    const v = Math.sqrt(s / d.length), t = performance.now() - t0; alNivel?.(v);
    if (v > 0.03) { hablo++; ultimaVoz = t; }
    const yaTodo = calificar(frase, texto('g'), texto('l'), rivales).claras === esp.length;
    if ((hablo > 2 && t - ultimaVoz > (yaTodo ? 500 : 1300)) || t > ms) cerrar();       // terminó de hablar (o se acabó el tiempo)
  };
  fuente.connect(nodo); nodo.connect(mudo); mudo.connect(ctx.destination);
  // Respaldo con reloj: si el audio deja de llegar, también se cierra (antes solo se cerraba desde el audio y podía quedarse esperando).
  const reloj = setInterval(() => { const t = performance.now() - t0; if (t > ms + 800 || (!cuadros && t > 3000)) cerrar(); }, 500);

  const fin = new Promise((ok) => {
    cerrar = () => {
      if (!vivo) return; vivo = false; clearInterval(reloj);
      try { guiado.retrieveFinalResult(); libre.retrieveFinalResult(); } catch { /* ya cerró */ }
      // la grabadora a veces no avisa que paró: se espera a lo mucho 1.5 s
      const grabado = conTope(new Promise((k) => { if (!mr || mr.state === 'inactive') return k(); mr.onstop = () => k(); try { mr.stop(); } catch { k(); } }), 1500);
      Promise.all([grabado, new Promise((k) => setTimeout(k, 450))]).then(() => {          // un momento para que lleguen los resultados finales
        try { nodo.disconnect(); fuente.disconnect(); } catch { /* ya */ } flujo.getTracks().forEach((x) => x.stop()); ctx.close().catch(() => {});
        try { guiado.remove(); libre.remove(); } catch { /* ya */ }
        const r = calificar(frase, finales.length ? finales : texto('g'), texto('l'), rivales);
        ok({ ...r, oyoAlgo: hablo > 2, oido: { guiado: finales.map((x) => `${x.word}:${(x.conf ?? 1).toFixed(2)}`).join(' ') || texto('g'), libre: texto('l') }, url: trozos.length ? URL.createObjectURL(new Blob(trozos, { type: mr?.mimeType || 'audio/mp4' })) : null });
      });
    };
  });
  return { ok: true, fin, parar: () => cerrar() };
}
