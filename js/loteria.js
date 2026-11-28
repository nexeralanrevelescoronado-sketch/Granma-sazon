// Lotería de Granma: la lógica, sin pantalla (se puede probar). Las cartas son propias de la app (dibujos de emoji y versos
// de Granma), no de ninguna baraja comercial. Con la misma «semilla» salen la misma tabla y las mismas cartas en el mismo
// orden: así, al jugar en familia, todos oyen lo mismo a la misma hora.

/** Niveles: tabla de 3×3 o 4×4, cuántas cartas «de relleno» se cantan y cada cuánto canta Granma (ms).
 *  Total ≈ (tabla + relleno) × paso: del nivel 1 (≈ 72 s, calmado) al 5 (≈ 64 s con 4×4, retador). */
export const NIVELES = [
  { lado: 3, relleno: 9, paso: 4000 },
  { lado: 3, relleno: 9, paso: 3300 },
  { lado: 4, relleno: 10, paso: 3200 },
  { lado: 4, relleno: 10, paso: 2700 },
  { lado: 4, relleno: 12, paso: 2300 },
];
export const GRACIA = 4000;   // después de la última carta, unos segundos para gritar «¡Lotería!»

/** Número al azar repetible (el mismo para todos con la misma semilla). */
export function azar(semilla) {
  let a = (Number(semilla) >>> 0) || 1;
  return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
}
const barajar = (arr, r) => { const a = [...arr]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

/** Arma una partida: { tabla: [ids], llamadas: [ids], paso, lado, duracion }. Toda carta de la tabla sí se canta. */
export function armarPartida({ nivel = 1, semilla = Date.now(), ids }) {
  const N = NIVELES[Math.min(NIVELES.length, Math.max(1, nivel)) - 1], r = azar(semilla);
  const todas = barajar(ids, r), tabla = todas.slice(0, N.lado * N.lado), relleno = todas.slice(tabla.length, tabla.length + N.relleno);
  const llamadas = barajar([...tabla, ...relleno], r);
  return { tabla, llamadas, paso: N.paso, lado: N.lado, duracion: llamadas.length * N.paso + GRACIA };
}

/** Qué carta se está cantando a los `ms` de empezar (−1 antes de la primera). */
export const cartaEn = (p, ms) => (ms < 0 ? -1 : Math.min(p.llamadas.length - 1, Math.floor(ms / p.paso)));
/** ¿Ya se cantó esa carta a los `ms`? */
export const yaSalio = (p, id, ms) => { const i = p.llamadas.indexOf(id); return i >= 0 && i <= cartaEn(p, ms); };
/** ¿La tabla está llena? */
export const llena = (p, marcadas) => p.tabla.every((id) => marcadas.has(id));

/** Después de jugar: si ganó sube de nivel; si pierde dos seguidas, baja uno (para que sea retador pero se pueda). */
export function siguienteNivel(reg, gano) {
  const r = { nivel: 1, ganadas: 0, jugadas: 0, malas: 0, ...reg };
  r.jugadas++;
  if (gano) { r.ganadas++; r.malas = 0; r.nivel = Math.min(NIVELES.length, r.nivel + 1); }
  else { r.malas++; if (r.malas >= 2) { r.nivel = Math.max(1, r.nivel - 1); r.malas = 0; } }
  return r;
}
