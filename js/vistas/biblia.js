// Biblia bilingüe: lado a lado o una sola versión; selector de versión; ruta de ejercicios (dominio público).
import { estado, guardar, u, tgt, nat, ganarXP, evento } from '../state.js';
import { VERSIONES, versionPorId, versionesDe } from '../biblia/config.js';
import { getPassage, search, listBooks } from '../biblia/provider.js';
import { cargarJSON, SinDescargar } from '../datos.js';
import { jugar } from '../ejercicios.js';
import { pj } from '../personajes.js';
import { esc, resaltar, mezclar, sinAcentos } from '../util.js';
import { sonido } from '../sound.js';
import { confeti } from '../fx.js';

const LLAVE = 'granma:biblia';
const leerPref = () => { try { return JSON.parse(localStorage.getItem(LLAVE)) || {}; } catch { return {}; } };
const vistos = new Set();

export async function montar(main, { args }) {
  if (args[0] === 'ruta' && args[1]) return pasajeRuta(main, args[1]);
  const libros = await listBooks('rv1909');
  const pref = { es: 'rv1909', en: 'kjv', modo: 'lado', libro: 'jua', cap: 3, ...leerPref() };
  if (pref.modo === 'lado' && matchMedia('(max-width:560px)').matches && !leerPref().modo) pref.modo = tgt() === 'es' ? 'es' : 'en';
  const guardarPref = () => { try { localStorage.setItem(LLAVE, JSON.stringify(pref)); } catch { /* ignorar */ } };
  let ruta = [], busqueda = null;
  try { ruta = await cargarJSON('data/biblia/ruta.json', 'biblia'); } catch { /* sin descargar: la lectura online sigue */ }

  const opcionesVersion = (idioma) => versionesDe(idioma).map((v) => `<option value="${v.id}" ${pref[idioma] === v.id ? 'selected' : ''} ${v.activa ? '' : 'disabled'}>${esc(v.corto)} — ${esc(v.nombre)}${v.activa ? '' : ' (' + u('Próximamente', 'Coming soon') + ')'}</option>`).join('');
  const libroActual = () => libros.find((l) => l.id === pref.libro) || libros[0];

  async function columna(idioma) {
    const v = pref[idioma];
    try { return { ok: await getPassage(v, { libro: pref.libro, cap: pref.cap }), v }; }
    catch (e) {
      const m = e.codigo === 'proximamente' ? u('Próximamente', 'Coming soon') : e.codigo === 'sin-internet' ? u('Esta versión necesita internet.', 'This version needs internet.')
        : e instanceof SinDescargar ? u('No descargada. Ve a «Descargas» o conéctate.', 'Not downloaded. Go to "Downloads" or connect.') : u('No se pudo cargar.', 'Could not load.');
      return { error: m, v };
    }
  }
  async function pintarTexto() {
    const caja = main.querySelector('#texto'); caja.setAttribute('aria-busy', 'true');
    const modo = pref.modo, cols = [];
    if (modo !== 'en') cols.push(['es', await columna('es')]);
    if (modo !== 'es') cols.push(['en', await columna('en')]);
    const max = Math.max(0, ...cols.map(([, c]) => c.ok?.versos.length || 0));
    const mapa = Object.fromEntries(cols.map(([i, c]) => [i, new Map((c.ok?.versos || []).map((x) => [x.v, x.t]))]));
    const lado = cols.length === 2;
    let html = '';
    const nums = [...new Set(cols.flatMap(([i]) => [...mapa[i].keys()]))].sort((a, b) => a - b);
    for (const n of nums) html += `<div class="verso-fila">${cols.map(([i]) => `<p lang="${i}"><span class="v">${n}</span>${esc(mapa[i].get(n) ?? '—')}</p>`).join('')}</div>`;
    const errores = cols.filter(([, c]) => c.error).map(([i, c]) => `<p class="tarjeta crema2" role="status"><strong>${esc(versionPorId(c.v).corto)}:</strong> ${esc(c.error)}</p>`).join('');
    const atrib = cols.map(([, c]) => { const v = versionPorId(c.v); return `<p class="atrib"><strong>${esc(v.corto)}</strong> — ${esc(c.ok?.attribution || v.attribution[nat()])}${v.proveedor === 'remoto' ? ' ' + u('(solo con internet; sin descarga: licencia pendiente de confirmar)', '(online only; no download: license pending confirmation)') : ''}</p>`; }).join('');
    caja.innerHTML = `${errores}<div class="versos ${lado ? 'lado' : ''}">${html}</div>${atrib}`; caja.setAttribute('aria-busy', 'false');
    if (max && !vistos.has(`${pref.libro}${pref.cap}`)) { vistos.add(`${pref.libro}${pref.cap}`); evento('biblia'); }
  }
  function pintar() {
    const L = libroActual();
    main.innerHTML = `<div class="dialogo">${pj('granma', 'contento', { ancho: 100 })}<div class="globo"><span class="quien">Granma</span><h1 style="font-size:1.3rem;margin:0">${u('Biblia en español e inglés', 'Bible in Spanish and English')}</h1></div></div>
      <div class="segmentos" role="group" aria-label="${u('Cómo verla', 'How to view')}"><button data-modo="lado" aria-pressed="${pref.modo === 'lado'}">${u('Lado a lado', 'Side by side')}</button><button data-modo="es" aria-pressed="${pref.modo === 'es'}">Español</button><button data-modo="en" aria-pressed="${pref.modo === 'en'}">English</button></div>
      <div class="biblia-barra mt">
        <label>Español<select id="v-es">${opcionesVersion('es')}</select></label><label>English<select id="v-en">${opcionesVersion('en')}</select></label>
        <label>${u('Libro', 'Book')}<select id="libro">${libros.map((l) => `<option value="${l.id}" ${l.id === pref.libro ? 'selected' : ''}>${esc(l[nat()])}</option>`).join('')}</select></label>
        <label>${u('Capítulo', 'Chapter')}<select id="cap">${L.caps.map((_, i) => `<option ${i + 1 === pref.cap ? 'selected' : ''}>${i + 1}</option>`).join('')}</select></label></div>
      <div class="fila mt"><button class="btn sec" data-prev>←</button><button class="btn sec" data-next>→</button><form id="buscar" class="fila" style="flex:1" role="search"><input type="search" id="q" placeholder="${u('Buscar en este libro…', 'Search this book…')}" aria-label="${u('Buscar', 'Search')}" style="flex:1"><button class="btn">${u('Buscar', 'Search')}</button></form></div>
      <div id="resultados"></div>
      <h2 class="mt2" id="titulo-pasaje">${esc(L[nat()])} ${pref.cap}</h2><div id="texto" aria-live="polite"></div>
      ${ruta.length ? `<h2 class="mt2">${u('Ruta Biblia: aprende con versículos', 'Bible path: learn with verses')}</h2><p class="muted">${u('Pasajes cortos con RV1909 y KJV (dominio público).', 'Short passages in RV1909 and KJV (public domain).')}</p>
      ${ruta.map((p) => `<a class="tarjeta enlace-tarjeta" href="#/biblia/ruta/${p.id}"><strong>${esc(p.titulo[nat()])}</strong><span class="muted">${esc(libros.find((l) => l.id === p.ref.libro)[nat()])} ${p.ref.cap}:${p.ref.desde} ${estado().biblia[p.id] ? '✓' : ''}</span></a>`).join('')}` : ''}`;
    pintarTexto();
  }
  const cambiarCap = (d) => { const L = libroActual(); let c = pref.cap + d; if (c < 1) c = L.caps.length; if (c > L.caps.length) c = 1; pref.cap = c; guardarPref(); pintar(); scrollTo({ top: 0 }); };
  main.onchange = (e) => {
    if (e.target.id === 'v-es') pref.es = e.target.value; else if (e.target.id === 'v-en') pref.en = e.target.value;
    else if (e.target.id === 'libro') { pref.libro = e.target.value; pref.cap = 1; } else if (e.target.id === 'cap') pref.cap = +e.target.value; else return;
    guardarPref(); pintar();
  };
  main.onclick = (e) => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.modo) { pref.modo = b.dataset.modo; guardarPref(); pintar(); }
    else if (b.hasAttribute('data-prev')) cambiarCap(-1); else if (b.hasAttribute('data-next')) cambiarCap(1);
    else if (b.dataset.ir) { const [l, c] = b.dataset.ir.split('|'); pref.libro = l; pref.cap = +c; guardarPref(); document.getElementById('resultados').innerHTML = ''; pintar(); }
  };
  main.onsubmit = async (e) => {
    e.preventDefault(); const q = main.querySelector('#q').value; if (q.trim().length < 3) return;
    const cont = main.querySelector('#resultados'); cont.innerHTML = `<p class="muted">${u('Buscando…', 'Searching…')}</p>`;
    const idioma = pref.modo === 'en' ? 'en' : pref.modo === 'es' ? 'es' : tgt();
    try {
      const r = await search(pref[idioma], q, { libro: pref.libro });
      const nombre = (id) => libros.find((l) => l.id === id)[nat()];
      cont.innerHTML = r.length ? `<div class="tarjeta"><h2>${r.length} ${u('resultado(s) en', 'result(s) in')} ${esc(libroActual()[nat()])}</h2>${r.map((x) => `<button class="btn-icono" data-ir="${x.libro}|${x.cap}" style="width:100%;text-align:left;margin:4px 0;padding:8px 12px"><strong>${esc(nombre(x.libro))} ${x.cap}:${x.v}</strong> ${resaltar(x.t, [q])}</button>`).join('')}</div>` : `<p class="muted">${u('Sin resultados.', 'No results.')}</p>`;
    } catch (err) { cont.innerHTML = `<p class="tarjeta crema2">${err instanceof SinDescargar ? u('No descargada. Ve a «Descargas».', 'Not downloaded. Go to "Downloads".') : u('Búsqueda no disponible para esta versión.', 'Search is not available for this version.')}</p>`; }
  };
  pintar();
  return () => { main.onclick = main.onchange = main.onsubmit = null; };
}

/* ---- Ejercicios de la ruta Biblia: vocabulario de un versículo, ES y EN lado a lado ---- */
async function pasajeRuta(main, id) {
  const ruta = await cargarJSON('data/biblia/ruta.json', 'biblia'), p = ruta.find((x) => x.id === id);
  if (!p) { location.hash = '#/biblia'; return; }
  const [es, en] = await Promise.all([getPassage('rv1909', p.ref), getPassage('kjv', p.ref)]);
  const libros = await listBooks('rv1909'), T = tgt(), N = nat(), S = estado();
  const txtEs = es.versos.map((v) => v.t).join(' '), txtEn = en.versos.map((v) => v.t).join(' ');
  const resaltado = (txt, idx) => resaltar(txt, p.pares.map((x) => x[idx]));
  main.innerHTML = `<p><a class="volver" href="#/biblia">← ${u('Biblia', 'Bible')}</a></p><h1>${esc(p.titulo[N])}</h1><p class="muted">${esc(libros.find((l) => l.id === p.ref.libro)[N])} ${p.ref.cap}:${p.ref.desde}</p>
    <div class="versos lado"><div class="verso-fila"><p lang="es"><strong>RV1909</strong><br>${resaltado(txtEs, 0)}</p><p lang="en"><strong>KJV</strong><br>${resaltado(txtEn, 1)}</p></div></div>
    <p class="atrib">${esc(versionPorId('rv1909').attribution[N])} ${esc(versionPorId('kjv').attribution[N])}</p>
    <div class="tarjeta mt"><h2>${u('Frases y palabras clave', 'Key words and phrases')}</h2><ul>${p.pares.map((x) => `<li><mark class="clave">${esc(x[T === 'es' ? 0 : 1])}</mark> = ${esc(x[T === 'es' ? 1 : 0])}</li>`).join('')}</ul></div>
    <div id="juego" class="mt">${S.biblia[p.id] ? `<p class="estado-ok">✓ ${u('Ya lo completaste.', 'You already completed this.')}</p>` : ''}<button class="btn grande" data-probar>${u('Practicar', 'Practice')}</button></div>`;
  main.onclick = async (e) => {
    if (!e.target.closest('[data-probar]')) return;
    const iT = T === 'es' ? 0 : 1, iN = 1 - iT, textoT = T === 'es' ? txtEs : txtEn, otros = ruta.filter((x) => x.id !== p.id).flatMap((x) => x.pares);
    const par = p.pares[0], par2 = p.pares[p.pares.length - 1];
    const sig = (pr) => ({ tipo: 'mcq', prompt: u(`¿Qué significa «${pr[iT]}»?`, `What does "${pr[iT]}" mean?`), opciones: mezclar([pr[iN], ...mezclar(otros.filter((o) => o[iN].toLowerCase() !== pr[iN].toLowerCase())).slice(0, 3).map((o) => o[iN])]), correcta: pr[iN] });
    const hueco = textoT.replace(new RegExp(`(^|[^\\p{L}])(${par2[iT]})(?=$|[^\\p{L}])`, 'iu'), (_m, a) => `${a}_____`);
    const items = [sig(par), { tipo: 'mcq', prompt: u('Completa el versículo', 'Complete the verse'), frase: hueco, opciones: mezclar([par2[iT], ...mezclar(otros.filter((o) => o[iT].toLowerCase() !== par2[iT].toLowerCase())).slice(0, 3).map((o) => o[iT])]), correcta: par2[iT] }, { tipo: 'pares', prompt: u('Une cada palabra con su significado', 'Match each word with its meaning'), pares: p.pares.map((x) => [x[iT], x[iN]]) }];
    const caja = main.querySelector('#juego'), r = await jugar(caja, items, { usarVidas: false });
    if (r.salio) return pasajeRuta(main, id);
    if (!S.biblia[p.id]) { S.biblia[p.id] = true; guardar(); ganarXP(25); evento('biblia'); }
    sonido.logro(); confeti(80);
    caja.innerHTML = `<div class="tarjeta verde"><h2>${u('¡Bien hecho!', 'Well done!')}</h2><p>+25 XP</p></div><a class="btn grande" href="#/biblia">${u('Más pasajes', 'More passages')}</a>`;
  };
  return () => { main.onclick = null; };
}
