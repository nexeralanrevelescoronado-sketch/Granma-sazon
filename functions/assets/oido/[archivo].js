// Entrega los modelos del Oído de Granma en la misma dirección de siempre (/assets/oido/modelo-xx.tar.gz),
// juntando los pedazos de 4 MiB que arma scripts/publicar-pages.mjs (Pages no acepta archivos de más de 25 MiB).
// Respeta Range: la app pide justo un pedazo a la vez (descargas.js), así que casi siempre se devuelve un archivo entero.
const PERMITIDOS = new Set(['modelo-en.tar.gz', 'modelo-es.tar.gz']);

const pedirEstatico = (request, ruta) => fetch(new Request(new URL(ruta, request.url)));

export async function onRequest({ request, env, params }) {
  const nombre = String(params.archivo || '');
  if (!PERMITIDOS.has(nombre)) return new Response('No encontrado', { status: 404 });
  if (request.method !== 'GET' && request.method !== 'HEAD') return new Response(null, { status: 405, headers: { allow: 'GET, HEAD' } });
  const estatico = (ruta) => (env.ASSETS ? env.ASSETS.fetch(new URL(ruta, request.url)) : pedirEstatico(request, ruta));

  const r = await estatico(`/assets/oido/partes/${nombre}.json`);
  if (!r.ok) return new Response('Modelo no publicado', { status: 404 });
  const { tam, pedazo, n, huella } = await r.json();
  const etag = `"${huella}"`;
  const h = new Headers({ 'content-type': 'application/gzip', 'accept-ranges': 'bytes', etag, 'cache-control': 'public, max-age=86400' });
  if ((request.headers.get('if-none-match') || '').includes(huella)) return new Response(null, { status: 304, headers: h });

  // Rango pedido (uno solo, como lo pide la app); sin Range = archivo completo
  let ini = 0, fin = tam - 1, parcial = false;
  const m = /^bytes=(\d*)-(\d*)$/.exec((request.headers.get('range') || '').trim());
  if (m && (m[1] || m[2])) {
    if (m[1]) { ini = +m[1]; fin = m[2] ? Math.min(+m[2], tam - 1) : tam - 1; } else { ini = Math.max(0, tam - +m[2]); }
    if (ini > fin || ini >= tam) return new Response(null, { status: 416, headers: { 'content-range': `bytes */${tam}` } });
    parcial = true;
  }
  h.set('content-length', String(fin - ini + 1));
  if (parcial) h.set('content-range', `bytes ${ini}-${fin}/${tam}`);
  if (request.method === 'HEAD') return new Response(null, { status: parcial ? 206 : 200, headers: h });

  // Junta los pedazos que tocan el rango, en orden; solo recorta si el rango no empieza o termina en el borde de un pedazo
  const primero = Math.floor(ini / pedazo), ultimo = Math.floor(fin / pedazo);
  const { readable, writable } = new TransformStream();
  (async () => {
    const w = writable.getWriter();
    try {
      for (let i = primero; i <= ultimo; i++) {
        const res = await estatico(`/assets/oido/partes/${nombre}.${i}`);
        if (!res.ok) throw new Error('falta el pedazo ' + i);
        const desde = i === primero ? ini - i * pedazo : 0, hasta = i === ultimo ? fin - i * pedazo + 1 : null;
        if (desde === 0 && (hasta === null || hasta >= pedazo)) { const lr = res.body.getReader(); for (;;) { const { done, value } = await lr.read(); if (done) break; await w.write(value); } }
        else { const b = new Uint8Array(await res.arrayBuffer()); await w.write(b.subarray(desde, hasta === null ? b.length : hasta)); }
      }
      await w.close();
    } catch (e) { await w.abort(e); }
  })();
  return new Response(readable, { status: parcial ? 206 : 200, headers: h });
}
