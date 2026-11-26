// Carga de datos: primero lo que haya en Cache Storage (descargado), si no, la red.
export class SinDescargar extends Error { constructor(ruta, paquete) { super('Sin descargar: ' + ruta); this.ruta = ruta; this.paquete = paquete; } }
const memo = new Map();
export async function cargarJSON(ruta, paquete) {
  if (memo.has(ruta)) return memo.get(ruta);
  let res;
  try { res = await fetch(ruta); } catch { throw new SinDescargar(ruta, paquete); }
  if (!res.ok) throw new SinDescargar(ruta, paquete);
  let datos; try { datos = await res.json(); } catch { throw new SinDescargar(ruta, paquete); }
  if (datos && datos.sinInternet) throw new SinDescargar(ruta, paquete);
  memo.set(ruta, datos); return datos;
}
export const historia = () => cargarJSON('data/historia.json', 'historia');
// Historia 2 («Granma a los 25»): sus capítulos siguen la numeración (7 a 12), así el avance de las dos historias vive junto sin chocar.
export const historia2 = () => cargarJSON('data/historia2.json', 'historia');
export const historias = async () => [await historia(), await historia2()];
/** La historia a la que pertenece un capítulo (por su número). */
export async function historiaDe(capId) { const h1 = await historia(); if (h1.capitulos.some((c) => c.id === capId)) return h1; const h2 = await historia2(); return h2.capitulos.some((c) => c.id === capId) ? h2 : h1; }
export const coloquial = () => cargarJSON('data/coloquial.json');
export const reglas = () => cargarJSON('data/reglas.json');
export const platicas = () => cargarJSON('data/platicas.json');
export const recetas = () => cargarJSON('data/recetas.json', 'recetas');
export const consejos = () => cargarJSON('data/consejos.json', 'consejos');
export const cotorreos = () => cargarJSON('data/cotorreo.json', 'cotorreo');
export const paquetes = () => cargarJSON('data/paquetes.json');
