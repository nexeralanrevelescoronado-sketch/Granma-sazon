// Pruebas pequeñas y acumulativas: preguntan lo aprendido hasta el capítulo n.
// Cada palabra y cada frase se pregunta dos veces: PRIMERO en el idioma que la persona ya habla
// (Parte A) y DESPUÉS en el idioma que aprende (Parte B), para que entienda en los dos sentidos.
// Las pruebas crecen: cada capítulo suma palabras y frases, y siempre mezcla repaso de los anteriores.
import { mezclar } from './util.js';

export const NOTA_MINIMA = 0.7;                       // 70% para aprobar
export const estrellasDe = (pct) => (pct >= 0.9 ? 3 : pct >= 0.8 ? 2 : pct >= NOTA_MINIMA ? 1 : 0);
/** Cuántas palabras y frases trae la prueba del capítulo n (crece con n). */
export const tamanoPrueba = (n) => ({ palabras: Math.min(4 + n, 8), frases: Math.min(1 + n, 5) });

const TXT = {
  palabraA: { es: (w) => `¿Cómo se dice «${w}» en inglés?`, en: (w) => `How do you say «${w}» in Spanish?` },
  fraseA: { es: 'Elige cómo se dice en inglés', en: 'Choose how to say it in Spanish' },
  palabraB: { es: (w) => `¿Qué significa «${w}»?`, en: (w) => `What does «${w}» mean?` },
  fraseB: { es: 'Elige lo que significa', en: 'Choose what it means' },
};
const distintos = (lista, campo, excluir, n) => {
  const vistos = new Set([excluir.toLowerCase()]), sal = [];
  for (const x of mezclar(lista)) { const v = x[campo]; if (!vistos.has(v.toLowerCase())) { vistos.add(v.toLowerCase()); sal.push(v); if (sal.length === n) break; } }
  return sal;
};
/** Mitad del capítulo actual y mitad de repaso (si hay capítulos anteriores). */
function repartir(actual, anteriores, n) {
  const delActual = anteriores.length ? Math.ceil(n / 2) : n;
  const a = mezclar(actual).slice(0, delActual), b = mezclar(anteriores).slice(0, n - a.length);
  return [...a, ...b, ...mezclar(actual).filter((x) => !a.includes(x))].slice(0, n);
}

/**
 * Arma la prueba del capítulo n.
 * @returns {{ parteA: object[], parteB: object[], palabras: object[], frases: object[], total: number }}
 * parteA: enunciados en el idioma nativo `nat`; parteB: enunciados en el idioma que aprende `tgt`.
 */
export function armarPrueba(historia, n, interes, tgt, nat) {
  const caps = historia.capitulos.filter((c) => c.id <= n), cap = caps.find((c) => c.id === n);
  if (!cap) throw new Error('capítulo no existe');
  const util = (p) => p.en.toLowerCase() !== p.es.toLowerCase();            // «chocolate/chocolate» no enseña nada en una prueba
  const prop = (c) => c.palabrasInteres?.[interes] || [];                     // vocabulario propio del interés
  const pals = (c) => [...c.palabras, ...prop(c)].filter(util);
  const palAct = pals(cap), palAnt = caps.filter((c) => c.id < n).flatMap(pals);
  const ej = (c) => [...(c.ejemplos[interes] || c.ejemplos.amigos), ...prop(c).map((w) => w.f)];
  const frAct = ej(cap), frAnt = caps.filter((c) => c.id < n).flatMap(ej);
  const t = tamanoPrueba(n), todasPal = [...palAct, ...palAnt], todasFr = [...frAct, ...frAnt];
  const palabras = repartir(palAct, palAnt, Math.min(t.palabras, todasPal.length));
  const frases = repartir(frAct, frAnt, Math.min(t.frases, todasFr.length));

  const parteA = [
    ...palabras.map((p) => ({ tipo: 'mcq', prompt: TXT.palabraA[nat](p[nat]), opciones: mezclar([p[tgt], ...distintos(todasPal, tgt, p[tgt], 3)]), correcta: p[tgt], idioma: nat })),
    ...frases.map((f) => ({ tipo: 'mcq', prompt: TXT.fraseA[nat], frase: f[nat], langFrase: nat, opciones: mezclar([f[tgt], ...distintos(todasFr, tgt, f[tgt], 2)]), correcta: f[tgt], idioma: nat })),
  ];
  const parteB = [
    ...palabras.map((p) => ({ tipo: 'mcq', prompt: TXT.palabraB[tgt](p[tgt]), voz: p[tgt], opciones: mezclar([p[nat], ...distintos(todasPal, nat, p[nat], 3)]), correcta: p[nat], idioma: tgt })),
    ...frases.map((f) => ({ tipo: 'mcq', prompt: TXT.fraseB[tgt], frase: f[tgt], langFrase: tgt, voz: f[tgt], opciones: mezclar([f[nat], ...distintos(todasFr, nat, f[nat], 2)]), correcta: f[nat], idioma: tgt })),
  ];
  return { parteA: mezclar(parteA), parteB: mezclar(parteB), palabras, frases, total: parteA.length + parteB.length };
}
