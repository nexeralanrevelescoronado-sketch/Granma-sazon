// Estado del juego: todo vive en el dispositivo (localStorage). Funciona 100% sin internet.
import { fechaLocal, ayer, numeroDeDia } from './util.js';
const KEY = 'granma:v1';
export const MAX_VIDAS = 5;
export const REGEN_MS = 10 * 60 * 1000;
const bus = new EventTarget();
export const alCambiar = (fn) => bus.addEventListener('cambio', fn);

const base = () => ({
  v: 1,
  perfil: { aprende: null, interes: null, cocina: null, nombre: '', listo: false },
  xp: 0, racha: { n: 0, ultimo: null }, vidas: { n: MAX_VIDAS, t: Date.now() },
  caps: {}, recetas: {}, consejos: {}, cotorreos: {}, biblia: {}, insignias: {},
  misiones: { fecha: '', prog: {}, cobradas: {} }, stats: { retoMejor: 0, retos: 0 },
  ajustes: { sonido: true, voz: false }, constancia: { fecha: null },
});
let S;
function cargar() {
  try { const r = JSON.parse(localStorage.getItem(KEY)); S = r && r.v === 1 ? { ...base(), ...r } : base(); } catch { S = base(); }
}
cargar();
export const estado = () => S;
export function guardar() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch { /* sin espacio o modo privado: el juego sigue en memoria */ } bus.dispatchEvent(new Event('cambio')); }
export function reiniciar() { S = base(); guardar(); }

/* Idiomas: el usuario aprende `tgt`; la interfaz va en su idioma `nat`. */
export const tgt = () => S.perfil.aprende || 'en';
export const nat = () => (tgt() === 'en' ? 'es' : 'en');
export const u = (es, en) => (nat() === 'es' ? es : en);
export const Ln = (o) => o[nat()];      // texto en el idioma nativo
export const Lt = (o) => o[tgt()];      // texto en el idioma que aprende

/* Tortillitas (vidas) con regeneración */
export function vidas() {
  const v = S.vidas;
  if (v.n < MAX_VIDAS) {
    const ganadas = Math.floor((Date.now() - v.t) / REGEN_MS);
    if (ganadas > 0) { v.n = Math.min(MAX_VIDAS, v.n + ganadas); v.t = v.n >= MAX_VIDAS ? Date.now() : v.t + ganadas * REGEN_MS; guardar(); }
  } else v.t = Date.now();
  return v.n;
}
export const msParaVida = () => (vidas() >= MAX_VIDAS ? 0 : Math.max(0, REGEN_MS - (Date.now() - S.vidas.t)));
export function perderVida() { vidas(); if (S.vidas.n >= MAX_VIDAS) S.vidas.t = Date.now(); S.vidas.n = Math.max(0, S.vidas.n - 1); guardar(); return S.vidas.n; }
export function darVida(n = 1) { vidas(); S.vidas.n = Math.min(MAX_VIDAS, S.vidas.n + n); guardar(); }

/* Racha diaria */
export function actividad() {
  const hoy = fechaLocal(), r = S.racha;
  if (r.ultimo === hoy) return;
  r.n = r.ultimo === ayer() ? r.n + 1 : 1; r.ultimo = hoy; guardar();
  revisarInsignias();
}
export const rachaVigente = () => (S.racha.ultimo === fechaLocal() || S.racha.ultimo === ayer() ? S.racha.n : 0);

/* XP */
const avisos = [];
export const alAviso = (fn) => avisos.push(fn);
const avisar = (tipo, datos) => avisos.forEach((f) => f(tipo, datos));
export function ganarXP(n) { S.xp += n; guardar(); actividad(); avisar('xp', n); return S.xp; }

/* Insignias */
export const INSIGNIAS = [
  { id: 'dia-festivo', emoji: '🍲', nombre: { es: 'Día festivo', en: 'Holiday' }, desc: { es: 'Cocina el pozole completo.', en: 'Cook the full pozole.' } },
  { id: 'maestro-mole', emoji: '🌶️', nombre: { es: 'Maestro del mole', en: 'Mole master' }, desc: { es: 'Cocina el mole poblano completo.', en: 'Cook the full mole poblano.' } },
  { id: 'racha-7', emoji: '🔥', nombre: { es: 'Racha de 7 días', en: '7-day streak' }, desc: { es: 'Practica 7 días seguidos.', en: 'Practice 7 days in a row.' } },
  { id: 'rey-cotorreo', emoji: '👑', nombre: { es: 'Rey del cotorreo', en: 'Chat king' }, desc: { es: 'Acierta 10 cotorreos.', en: 'Get 10 chats right.' } },
  { id: 'alumno-abuelo', emoji: '🎩', nombre: { es: 'Alumno del Abuelo', en: 'Grandpa\'s pupil' }, desc: { es: 'Entiende 10 consejos del Abuelo.', en: 'Understand 10 pieces of advice.' } },
];
export function darInsignia(id) {
  if (S.insignias[id]) return false;
  S.insignias[id] = fechaLocal(); guardar(); avisar('insignia', INSIGNIAS.find((i) => i.id === id)); return true;
}
export function revisarInsignias() {
  if (rachaVigente() >= 7) darInsignia('racha-7');
  if (Object.keys(S.cotorreos).length >= 10) darInsignia('rey-cotorreo');
  if (Object.keys(S.consejos).length >= 10) darInsignia('alumno-abuelo');
  for (const r of ['pozole', 'mole']) if (S.recetas[r]?.hecha) darInsignia(r === 'pozole' ? 'dia-festivo' : 'maestro-mole');
}

/* Misiones diarias */
export const MISIONES = [
  { id: 'm1', xp: 20, req: { palabras: 5, consejos: 1 }, texto: { es: 'Aprende 5 palabras y un consejo', en: 'Learn 5 words and one piece of advice' } },
  { id: 'm2', xp: 20, req: { retos: 1 }, texto: { es: 'Haz un reto de 60 segundos', en: 'Do a 60-second challenge' } },
  { id: 'm3', xp: 20, req: { cotorreos: 2 }, texto: { es: 'Cotorrea con 2 chistes de Granma', en: 'Chat with 2 of Granma\'s jokes' } },
  { id: 'm4', xp: 25, req: { lecciones: 1 }, texto: { es: 'Termina una lección', en: 'Finish a lesson' } },
  { id: 'm5', xp: 20, req: { pasos: 3 }, texto: { es: 'Completa 3 pasos de una receta', en: 'Complete 3 recipe steps' } },
  { id: 'm6', xp: 15, req: { biblia: 1 }, texto: { es: 'Lee un pasaje de la Biblia', en: 'Read a Bible passage' } },
];
export function misionesDeHoy() {
  const d = numeroDeDia(), otros = MISIONES.slice(1);
  return [MISIONES[0], otros[d % otros.length], otros[(d + 2) % otros.length]];
}
function sincronizarMisiones() {
  const hoy = fechaLocal();
  if (S.misiones.fecha !== hoy) S.misiones = { fecha: hoy, prog: {}, cobradas: {} };
}
export function progresoMision(m) {
  sincronizarMisiones();
  const ks = Object.keys(m.req), hecho = ks.reduce((s, k) => s + Math.min(S.misiones.prog[k] || 0, m.req[k]), 0), total = ks.reduce((s, k) => s + m.req[k], 0);
  return { hecho, total, completa: ks.every((k) => (S.misiones.prog[k] || 0) >= m.req[k]), cobrada: !!S.misiones.cobradas[m.id] };
}
export function evento(nombre, cant = 1) {
  sincronizarMisiones();
  S.misiones.prog[nombre] = (S.misiones.prog[nombre] || 0) + cant;
  for (const m of misionesDeHoy()) {
    const p = progresoMision(m);
    if (p.completa && !p.cobrada) { S.misiones.cobradas[m.id] = true; S.xp += m.xp; avisar('mision', m); }
  }
  guardar();
}
