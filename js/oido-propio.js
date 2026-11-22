// «Oído de Granma»: reconocimiento de palabras DENTRO del teléfono, sin internet y sin enviar la voz a nadie.
// Usa Vosk (Apache-2.0, ver assets/oido/LICENCIAS.md), que se descarga aparte como paquete opcional y se carga solo
// cuando hace falta. Escucha en vivo, va marcando palabra por palabra y al final dice cuáles oyó.
//
// Cómo decide: corren dos reconocedores a la vez sobre la misma voz.
//   · «guiado»: solo conoce las palabras de la frase (y «algo distinto»). Sabe si la persona dijo la frase y qué palabras faltaron.
//   · «libre»: reconoce cualquier palabra. Si además coincide, la frase salió clarita.
// Límite honesto: con el guiado, dos palabras que suenan casi igual (bed / bread) pueden darse por buenas.
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
/**
 * Compara lo que oyeron los dos reconocedores con la frase esperada. Pura (se prueba sin micrófono).
 * → { palabras: [{ w, ok }], dichas, total, todo, exacta }
 */
export function calificar(frase, oidoGuiado, oidoLibre = '') {
  const esp = limpiar(frase).split(' ').filter(Boolean), g = limpiar(oidoGuiado).split(' ').filter((x) => x && x !== 'unk'), l = limpiar(oidoLibre).split(' ').filter(Boolean);
  const usar = (lista, w) => { const i = lista.findIndex((x) => parecida(x, w)); if (i < 0) return false; lista.splice(i, 1); return true; };
  const gg = [...g], ll = [...l];
  const palabras = esp.map((w) => { const a = usar(gg, w), b = usar(ll, w); return { w, ok: a || b }; });
  const dichas = palabras.filter((p) => p.ok).length;
  return { palabras, dichas, total: esp.length, todo: dichas === esp.length && esp.length > 0, exacta: limpiar(oidoLibre) === esp.join(' ') };
}

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
  const esp = limpiar(frase).split(' ').filter(Boolean);
  const guiado = new modelo.KaldiRecognizer(ctx.sampleRate, JSON.stringify([esp.join(' '), ...new Set(esp), '[unk]'])), libre = new modelo.KaldiRecognizer(ctx.sampleRate);
  const oido = { g: [], l: [], gp: '', lp: '' };            // resultados cerrados y el parcial en curso de cada uno
  const texto = (k) => [...oido[k], oido[k + 'p']].join(' ');
  const avisar = () => alParcial?.(calificar(frase, texto('g'), texto('l')));
  guiado.on('partialresult', (m) => { oido.gp = m.result.partial || ''; avisar(); });
  guiado.on('result', (m) => { if (m.result.text) oido.g.push(m.result.text); oido.gp = ''; avisar(); });
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
    const yaTodo = calificar(frase, texto('g'), texto('l')).todo;
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
        const r = calificar(frase, texto('g'), texto('l'));
        ok({ ...r, oyoAlgo: hablo > 2, url: trozos.length ? URL.createObjectURL(new Blob(trozos, { type: mr?.mimeType || 'audio/mp4' })) : null });
      });
    };
  });
  return { ok: true, fin, parar: () => cerrar() };
}
