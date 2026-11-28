// Carga de datos: primero lo que haya en Cache Storage (descargado), si no, la red.
import { conTrato } from './state.js';
// Contenido donde Granma le habla a la persona: ahí se aplica «mijo» o «mija» según lo que eligió. Los glosarios y la Biblia no se tocan.
const CON_TRATO = /data\/(historia\d?|consejos|cotorreo|recetas|platicas|coloquial|reglas|loteria)\.json$/;
export class SinDescargar extends Error { constructor(ruta, paquete) { super('Sin descargar: ' + ruta); this.ruta = ruta; this.paquete = paquete; } }
const memo = new Map();
export async function cargarJSON(ruta, paquete) {
  if (memo.has(ruta)) return memo.get(ruta);
  let res;
  try { res = await fetch(ruta); } catch { throw new SinDescargar(ruta, paquete); }
  if (!res.ok) throw new SinDescargar(ruta, paquete);
  let datos; try { datos = await res.json(); } catch { throw new SinDescargar(ruta, paquete); }
  if (datos && datos.sinInternet) throw new SinDescargar(ruta, paquete);
  if (CON_TRATO.test(ruta)) datos = conTrato(datos);
  memo.set(ruta, datos); return datos;
}
export const historia = () => cargarJSON('data/historia.json', 'historia');
// Historia 2 («Granma a los 25»): sus capítulos siguen la numeración (7 a 12), así el avance de las dos historias vive junto sin chocar.
export const historia2 = () => cargarJSON('data/historia2.json', 'historia');
// Historia 3 («Las fiestas de mi familia»): capítulos 13 a 18.
export const historia3 = () => cargarJSON('data/historia3.json', 'historia');
const CARGAS = [historia, historia2, historia3];
/** La historia número n (1, 2 o 3). */
export const historiaN = (n) => (CARGAS[n - 1] || historia)();
export const historias = () => Promise.all(CARGAS.map((f) => f()));
/** El número de una historia («historia-2» → 2) y la dirección de su mapa. */
export const numeroDe = (h) => +String(h.id).split('-')[1] || 1;
export const mapaDe = (h) => (numeroDe(h) === 1 ? '#/historia' : `#/historia/${numeroDe(h)}`);
/** La historia a la que pertenece un capítulo (por su número). Si esa historia no está descargada, se sigue buscando en las demás. */
export async function historiaDe(capId) {
  let primera = null;
  for (const f of CARGAS) { try { const h = await f(); primera ||= h; if (h.capitulos.some((c) => c.id === capId)) return h; } catch (e) { if (!primera) throw e; } }
  return primera;
}
export const coloquial = () => cargarJSON('data/coloquial.json');
export const reglas = () => cargarJSON('data/reglas.json');
export const platicas = () => cargarJSON('data/platicas.json');
export const recetas = () => cargarJSON('data/recetas.json', 'recetas');
/** Recetas por región y por tema (Guadalajara, aguas, pozoles…): cada grupo con la lista de ids de sus recetas. */
export const regiones = () => cargarJSON('data/regiones.json');
/** Lotería de Granma: sus 42 cartas propias, con su verso en español e inglés. */
export const loteria = () => cargarJSON('data/loteria.json');
export const consejos = () => cargarJSON('data/consejos.json', 'consejos');
export const cotorreos = () => cargarJSON('data/cotorreo.json', 'cotorreo');
export const paquetes = () => cargarJSON('data/paquetes.json');
