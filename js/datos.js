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
export const recetas = () => cargarJSON('data/recetas.json', 'recetas');
export const consejos = () => cargarJSON('data/consejos.json', 'consejos');
export const cotorreos = () => cargarJSON('data/cotorreo.json', 'cotorreo');
export const paquetes = () => cargarJSON('data/paquetes.json');
