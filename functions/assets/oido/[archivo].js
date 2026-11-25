// Entrega los modelos del Oído de Granma desde R2 (binding MODELOS) en la misma dirección de siempre,
// respetando pedazos (Range): así la descarga por pedazos de 4 MB y su reanudación funcionan igual que en GitHub Pages.
const PERMITIDOS = new Set(['modelo-en.tar.gz', 'modelo-es.tar.gz']);

function cabeceras(obj) {
  const h = new Headers();
  obj.writeHttpMetadata(h);
  h.set('etag', obj.httpEtag);
  h.set('accept-ranges', 'bytes');
  h.set('content-type', 'application/gzip');
  h.set('cache-control', 'public, max-age=86400');
  return h;
}

export async function onRequest({ request, env, params }) {
  const nombre = String(params.archivo || '');
  if (!PERMITIDOS.has(nombre)) return new Response('No encontrado', { status: 404 });
  if (!env.MODELOS) return new Response('Falta conectar el almacén R2 (binding MODELOS)', { status: 503 });
  if (request.method !== 'GET' && request.method !== 'HEAD') return new Response(null, { status: 405, headers: { allow: 'GET, HEAD' } });

  if (request.method === 'HEAD') {
    const meta = await env.MODELOS.head(nombre);
    if (!meta) return new Response(null, { status: 404 });
    const h = cabeceras(meta); h.set('content-length', String(meta.size));
    return new Response(null, { status: 200, headers: h });
  }

  const pideRango = request.headers.has('range');
  const obj = await env.MODELOS.get(nombre, { range: request.headers, onlyIf: request.headers });
  if (obj === null) return new Response('No encontrado', { status: 404 });
  const h = cabeceras(obj);
  if (!('body' in obj)) return new Response(null, { status: 304, headers: h });            // no cambió (If-None-Match)
  if (pideRango && obj.range) {
    const inicio = obj.range.offset ?? (obj.range.suffix != null ? obj.size - obj.range.suffix : 0);
    const largo = obj.range.length ?? (obj.range.suffix ?? obj.size - inicio);
    h.set('content-range', `bytes ${inicio}-${inicio + largo - 1}/${obj.size}`);
    h.set('content-length', String(largo));
    return new Response(obj.body, { status: 206, headers: h });
  }
  h.set('content-length', String(obj.size));
  return new Response(obj.body, { status: 200, headers: h });
}
