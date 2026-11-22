// LocalPublicDomain: lee los JSON de dominio público (RV1909, KJV, WEB) de data/biblia/.
import { BibleProvider } from './base.js';
import { cargarJSON } from '../datos.js';
import { sinAcentos } from '../util.js';

let indice;
export async function libros() {
  indice ||= (await cargarJSON('data/biblia/libros.json', 'biblia')).libros;
  return indice;
}
/** Convierte "Juan 3:16-18" / "1 Cor 13:4" / {libro,cap,desde,hasta} en { libro:id, cap, desde, hasta }. */
export async function parsearReferencia(ref) {
  if (typeof ref === 'object') return { desde: 1, hasta: null, ...ref };
  const m = String(ref).trim().match(/^(.+?)\s+(\d+)(?::(\d+)(?:\s*[-–]\s*(\d+))?)?$/);
  if (!m) throw new Error('Referencia no válida: ' + ref);
  const nombre = sinAcentos(m[1]).replace(/\./g, '').replace(/\s+/g, ' ');
  const lista = await libros();
  const libro = lista.find((l) => [l.id, sinAcentos(l.es), sinAcentos(l.en)].includes(nombre))
    || lista.find((l) => sinAcentos(l.es).startsWith(nombre) || sinAcentos(l.en).startsWith(nombre));
  if (!libro) throw new Error('Libro no encontrado: ' + m[1]);
  const desde = m[3] ? +m[3] : 1;
  return { libro: libro.id, cap: +m[2], desde, hasta: m[4] ? +m[4] : m[3] ? desde : null };
}

export class LocalPublicDomain extends BibleProvider {
  async listBooks() { return libros(); }
  async libro(version, id) { return (await cargarJSON(`data/biblia/${version}/${id}.json`, 'biblia')).c; }
  async getPassage(version, referencia) {
    const r = await parsearReferencia(referencia);
    const caps = await this.libro(version, r.libro);
    const cap = caps[r.cap - 1];
    if (!cap) throw new Error('Capítulo no existe');
    const hasta = r.hasta ?? cap.length;
    const versos = [];
    for (let v = r.desde; v <= Math.min(hasta, cap.length); v++) versos.push({ v, t: cap[v - 1] });
    return { version, libro: r.libro, cap: r.cap, desde: r.desde, hasta, versos };
  }
  /** Busca un texto. `libro` limita a un libro; sin él recorre toda la Biblia (carga los 66 archivos). */
  async search(version, texto, { libro = null, max = 60 } = {}) {
    const q = sinAcentos(texto.trim()); if (q.length < 3) return [];
    const ids = libro ? [libro] : (await libros()).map((l) => l.id);
    const salida = [];
    for (const id of ids) {
      const caps = await this.libro(version, id);
      for (let c = 0; c < caps.length; c++) for (let v = 0; v < caps[c].length; v++) {
        if (sinAcentos(caps[c][v]).includes(q)) { salida.push({ libro: id, cap: c + 1, v: v + 1, t: caps[c][v] }); if (salida.length >= max) return salida; }
      }
    }
    return salida;
  }
}
