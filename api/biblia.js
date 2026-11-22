// Proxy serverless para versiones con licencia (NLT / NTV). Compatible con Vercel (Node) y similares.
// La clave de API se guarda en variables de entorno del servidor — NUNCA en el frontend.
//   NLT_API_KEY        clave de la NLT API de Tyndale (https://api.nlt.to)
//   API_BIBLE_KEY      clave de API.Bible (https://scripture.api.bible)
//   NTV_BIBLE_ID       id de la NTV en API.Bible (solo si tu licencia la incluye)
//   BIBLE_FLAG_NLT=1 / BIBLE_FLAG_NTV=1   enciende cada versión en el servidor (apagadas por defecto)
// Respuesta: { versos:[{v,t}], attribution:"..." }  — se usa en js/biblia/remote.js
const LIBROS = { gen: 'Gen', exo: 'Exod', lev: 'Lev', num: 'Num', deu: 'Deut', jos: 'Josh', jue: 'Judg', rut: 'Ruth', '1sa': '1Sam', '2sa': '2Sam', '1re': '1Kgs', '2re': '2Kgs', '1cr': '1Chr', '2cr': '2Chr', esd: 'Ezra', neh: 'Neh', est: 'Esth', job: 'Job', sal: 'Ps', pro: 'Prov', ecl: 'Eccl', can: 'Song', isa: 'Isa', jer: 'Jer', lam: 'Lam', eze: 'Ezek', dan: 'Dan', ose: 'Hos', joe: 'Joel', amo: 'Amos', abd: 'Obad', jon: 'Jonah', miq: 'Mic', nah: 'Nah', hab: 'Hab', sof: 'Zeph', hag: 'Hag', zac: 'Zech', mal: 'Mal', mat: 'Matt', mar: 'Mark', luc: 'Luke', jua: 'John', hch: 'Acts', rom: 'Rom', '1co': '1Cor', '2co': '2Cor', gal: 'Gal', efe: 'Eph', fil: 'Phil', col: 'Col', '1te': '1Thess', '2te': '2Thess', '1ti': '1Tim', '2ti': '2Tim', tit: 'Titus', flm: 'Phlm', heb: 'Heb', san: 'Jas', '1pe': '1Pet', '2pe': '2Pet', '1jn': '1John', '2jn': '2John', '3jn': '3John', jud: 'Jude', apo: 'Rev' };
const ATRIB = {
  nlt: 'Scripture quotations are taken from the Holy Bible, New Living Translation, copyright © 1996, 2004, 2015 by Tyndale House Foundation. Used by permission of Tyndale House Publishers, Carol Stream, Illinois 60188. All rights reserved.',
  ntv: 'Nueva Traducción Viviente © 2010 Tyndale House Foundation. Usada con licencia; todos los derechos reservados.',
};
const sanear = (html) => String(html).replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
const entero = (v, def) => { const n = parseInt(v, 10); return Number.isInteger(n) && n > 0 && n < 400 ? n : def; };
const con_reintento = async (fn) => { let espera = 400; for (let i = 0; i < 4; i++) { const r = await fn(); if (r.status !== 429 && r.status < 500) return r; await new Promise((ok) => setTimeout(ok, espera)); espera *= 2; } return fn(); };

export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (req.method !== 'GET') return res.status(405).json({ error: 'método no permitido' });
  const { version = '', libro = '' } = req.query;
  if (!['nlt', 'ntv'].includes(version) || !LIBROS[libro]) return res.status(400).json({ error: 'parámetros no válidos' });
  if (process.env[`BIBLE_FLAG_${version.toUpperCase()}`] !== '1') return res.status(403).json({ error: 'versión apagada', proximamente: true });
  const cap = entero(req.query.cap, 1), desde = entero(req.query.desde, 1), hasta = entero(req.query.hasta, desde);
  if (hasta < desde || hasta - desde > 60) return res.status(400).json({ error: 'rango no válido' });
  try {
    let versos = [];
    if (version === 'nlt' && process.env.NLT_API_KEY) {
      const ref = `${LIBROS[libro]}.${cap}:${desde}-${hasta}`;
      const r = await con_reintento(() => fetch(`https://api.nlt.to/api/passages?ref=${encodeURIComponent(ref)}&version=NLT&key=${process.env.NLT_API_KEY}`));
      if (!r.ok) return res.status(502).json({ error: 'proveedor' });
      const html = await r.text();
      const piezas = [...html.matchAll(/<verse_export[^>]*?vn="(\d+)"[^>]*>([\s\S]*?)(?=<verse_export|<\/section|$)/g)];
      versos = piezas.map((m) => ({ v: +m[1], t: sanear(m[2]) }));
    } else if (process.env.API_BIBLE_KEY && (version === 'ntv' ? process.env.NTV_BIBLE_ID : process.env.NLT_BIBLE_ID)) {
      const bibleId = version === 'ntv' ? process.env.NTV_BIBLE_ID : process.env.NLT_BIBLE_ID;
      const ids = []; for (let v = desde; v <= hasta; v++) ids.push(`${LIBROS[libro].toUpperCase()}.${cap}.${v}`);
      for (const id of ids) {
        const r = await con_reintento(() => fetch(`https://api.scripture.api.bible/v1/bibles/${bibleId}/verses/${id}?content-type=text&include-verse-numbers=false`, { headers: { 'api-key': process.env.API_BIBLE_KEY } }));
        if (!r.ok) return res.status(502).json({ error: 'proveedor' });
        versos.push({ v: +id.split('.').pop(), t: sanear((await r.json()).data?.content || '') });
      }
    } else return res.status(501).json({ error: 'proveedor sin configurar' });
    res.setHeader('Cache-Control', 'private, max-age=300');
    return res.status(200).json({ versos, attribution: ATRIB[version] });
  } catch { return res.status(502).json({ error: 'proveedor' }); }
}
