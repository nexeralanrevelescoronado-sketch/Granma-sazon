// «Aprender hablando y escuchando»: arma rondas hechas solo de oído y voz con las palabras y frases de la historia.
// Puro (sin DOM): se puede probar. Los ejercicios los juega el mismo reproductor de las lecciones (ejercicios.js).
import { mezclar } from './util.js';

export const MODOS = ['elige', 'repite', 'arma', 'mixto'];
const TXT = {
  oyeP: { es: '¿Qué escuchaste?', en: 'What did you hear?' },
  oyeS: { es: '¿Qué significa lo que escuchaste?', en: 'What does the word you heard mean?' },
  oyeA: { es: 'Toca 🔊 las veces que quieras; con el perezoso se oye despacito.', en: 'Tap 🔊 as many times as you like; the sloth plays it slowly.' },
  diP: { es: 'Escucha y dilo en voz alta', en: 'Listen and say it out loud' },
  diF: { es: 'Escucha y di la frase completa', en: 'Listen and say the whole sentence' },
  arma: { es: 'Escucha y arma la frase', en: 'Listen and build the sentence' },
  armaA: { es: 'Sin leerla: solo con el oído. Toca 🔊 o el perezoso para oírla otra vez.', en: 'Without reading it: by ear only. Tap 🔊 or the sloth to hear it again.' },
};

/** Palabras y frases de los capítulos dados (las generales y las del interés de la persona), sin repetidas. */
export function material(capitulos, interes) {
  const unicas = (lista, clave) => { const vistas = new Set(); return lista.filter((x) => { const k = clave(x).toLowerCase(); if (vistas.has(k)) return false; vistas.add(k); return true; }); };
  const palabras = unicas(capitulos.flatMap((c) => [...c.palabras, ...(c.palabrasInteres?.[interes] || [])]).filter((p) => p.en.toLowerCase() !== p.es.toLowerCase()), (p) => p.en);
  const frases = unicas(capitulos.flatMap((c) => [...(c.ejemplos[interes] || c.ejemplos.amigos), ...(c.palabrasInteres?.[interes] || []).map((p) => p.f)]).map((f) => ({ en: f.en, es: f.es })), (f) => f.en);
  return { palabras, frases };
}

/**
 * Una ronda de `n` ejercicios. modo: 'elige' (oír y escoger), 'repite' (oír y decir), 'arma' (dictado) o 'mixto'.
 * T = idioma que se aprende, N = idioma propio (en el que van las instrucciones).
 */
export function armarEscucha(capitulos, interes, modo, T, N, n = 8) {
  const { palabras, frases } = material(capitulos, interes), tx = (k) => TXT[k][N];
  const P = mezclar(palabras), F = mezclar(frases), cortas = mezclar(frases.filter((f) => { const k = f[T].split(/\s+/).length; return k >= 3 && k <= 8; }));
  const otras = (campo, excluir, k) => mezclar(palabras.filter((p) => p[campo].toLowerCase() !== excluir.toLowerCase())).slice(0, k).map((p) => p[campo]);
  const oyePalabra = (p) => ({ tipo: 'mcq', oir: true, prompt: tx('oyeP'), ayuda: tx('oyeA'), voz: p[T], opciones: mezclar([p[T], ...otras(T, p[T], 3)]), correcta: p[T] });
  const oyeSignificado = (p) => ({ tipo: 'mcq', oir: true, prompt: tx('oyeS'), ayuda: tx('oyeA'), voz: p[T], opciones: mezclar([p[N], ...otras(N, p[N], 3)]), correcta: p[N] });
  const diPalabra = (p) => ({ tipo: 'di', prompt: tx('diP'), frase: p[T], ayuda: p[N], voz: p[T] });
  const diFrase = (f) => ({ tipo: 'di', prompt: tx('diF'), frase: f[T], ayuda: f[N], voz: f[T] });
  const dictado = (f) => ({ tipo: 'orden', oir: true, prompt: tx('arma'), ayuda: tx('armaA'), respuesta: f[T], voz: f[T] });
  const toma = (lista, i) => lista[i % lista.length];
  const receta = {
    elige: ['oyeP', 'oyeS'],
    repite: ['diP', 'diP', 'diF'],
    arma: ['arma'],
    mixto: ['oyeP', 'diP', 'oyeS', 'arma', 'diP', 'diF', 'oyeP', 'diF'],
  }[modo] || ['oyeP'];
  const hacer = { oyeP: (i) => oyePalabra(toma(P, i)), oyeS: (i) => oyeSignificado(toma(P, i + 3)), diP: (i) => diPalabra(toma(P, i + 5)), diF: (i) => diFrase(toma(F, i)), arma: (i) => dictado(toma(cortas.length ? cortas : F, i)) };
  if (!palabras.length || !frases.length) return [];
  return Array.from({ length: n }, (_, i) => hacer[receta[i % receta.length]](i));
}
