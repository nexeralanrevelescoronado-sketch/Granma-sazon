// Capa BibleProvider: una interfaz común para cualquier fuente de texto bíblico.
//   listBooks(version)                → [{ id, es, en, caps:[n versículos por capítulo] }]
//   getPassage(version, referencia)   → { version, libro, cap, desde, hasta, versos:[{v, t}] }
//   search(version, texto, opciones)  → [{ libro, cap, v, t }]
// `referencia` puede ser texto ("Juan 3:16-18", "John 3:16") o un objeto { libro, cap, desde, hasta }.
import { LocalPublicDomain } from './local.js';
import { RemoteLicensed } from './remote.js';
import { versionPorId } from './config.js';

export { BibleProvider } from './base.js';

const proveedores = { local: new LocalPublicDomain(), remoto: new RemoteLicensed() };
/** Devuelve el proveedor que atiende esa versión. */
export function proveedorDe(versionId) {
  const v = versionPorId(versionId);
  if (!v) throw new Error('Versión desconocida: ' + versionId);
  return proveedores[v.proveedor];
}
export const listBooks = (version) => proveedorDe(version).listBooks(version);
export const getPassage = (version, ref) => proveedorDe(version).getPassage(version, ref);
export const search = (version, texto, op) => proveedorDe(version).search(version, texto, op);
