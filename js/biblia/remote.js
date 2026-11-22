// RemoteLicensed: versiones con derechos de autor (NTV, NLT) a través de un proxy del servidor.
// ► La clave de API NUNCA va aquí: la guarda la función serverless `api/biblia.js` (ver docs/BIBLIA.md).
// ► Estas versiones solo funcionan con internet y no se descargan (licencia offline: pendiente de confirmar).
import { BibleProvider } from './base.js';
import { PROXY_URL, versionPorId } from './config.js';
import { parsearReferencia, libros } from './local.js';

export class RemoteLicensed extends BibleProvider {
  verificar(version) {
    const v = versionPorId(version);
    if (!v || !v.activa) { const e = new Error('Próximamente'); e.codigo = 'proximamente'; throw e; }
    if (!navigator.onLine) { const e = new Error('Sin internet'); e.codigo = 'sin-internet'; throw e; }
    return v;
  }
  async listBooks() { return libros(); }   // los nombres de los libros son datos comunes, no texto con derechos
  async getPassage(version, referencia) {
    this.verificar(version);
    const r = await parsearReferencia(referencia);
    const url = `${PROXY_URL}?version=${encodeURIComponent(version)}&libro=${r.libro}&cap=${r.cap}&desde=${r.desde}${r.hasta ? `&hasta=${r.hasta}` : ''}`;
    // Reintentos con retroceso exponencial (429/5xx)
    let espera = 500;
    for (let i = 0; i < 4; i++) {
      let res; try { res = await fetch(url, { headers: { Accept: 'application/json' } }); } catch { res = null; }
      if (res && res.ok) { const d = await res.json(); return { version, libro: r.libro, cap: r.cap, desde: r.desde, hasta: r.hasta, versos: d.versos, attribution: d.attribution }; }
      if (res && res.status < 500 && res.status !== 429) break;
      await new Promise((ok) => setTimeout(ok, espera)); espera *= 2;
    }
    const e = new Error('No se pudo consultar el proveedor'); e.codigo = 'proveedor'; throw e;
  }
  async search() { const e = new Error('Búsqueda no disponible en versiones con licencia'); e.codigo = 'sin-busqueda'; throw e; }
}
