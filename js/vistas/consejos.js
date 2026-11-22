// El consejo del Abuelo: lista por tema + detalle con mini-ejercicio de comprensión.
import { estado, guardar, u, tgt, nat, Ln, Lt, ganarXP, evento, revisarInsignias } from '../state.js';
import { consejos as cargar } from '../datos.js';
import { jugar } from '../ejercicios.js';
import { pj } from '../personajes.js';
import { esc, resaltar, mezclar } from '../util.js';
import { botonWhatsApp } from '../compartir.js';
import { sonido } from '../sound.js';
import { confeti, hablar } from '../fx.js';

const TEMAS = { trabajo: ['Trabajo', 'Work'], amistad: ['Amistad', 'Friendship'], familia: ['Familia', 'Family'], constancia: ['Constancia', 'Perseverance'], fe: ['Fe', 'Faith'], dinero: ['Dinero', 'Money'], cocina: ['Cocina', 'Cooking'] };
const DEL_INTERES = { trabajo: 'trabajo', amigos: 'amistad', biblia: 'fe', viajes: 'constancia', cocina: 'cocina' };

export async function montar(main, { ruta, args }) {
  const lista = await cargar();
  if (ruta === 'consejo' && args[0]) return detalle(main, lista, +args[0]);
  const S = estado(); let filtro = DEL_INTERES[S.perfil.interes] || 'todos';
  const pintar = () => {
    const ver = lista.filter((c) => filtro === 'todos' || c.tema === filtro);
    main.innerHTML = `<div class="dialogo der">${pj('abuelo', 'pensando', { ancho: 110 })}<div class="globo abuelo"><span class="quien">${u('El Abuelo', 'Grandpa')}</span><h1 style="font-size:1.3rem;margin:0">${u('El consejo del Abuelo', 'Grandpa\'s advice')}</h1><p>${u('Pocas palabras, buenos consejos.', 'Few words, good advice.')}</p></div></div>
      <div class="fila" role="group" aria-label="${u('Tema', 'Topic')}"><div class="segmentos"><button data-f="todos" aria-pressed="${filtro === 'todos'}">${u('Todos', 'All')} (${lista.length})</button>${Object.entries(TEMAS).map(([k, v]) => `<button data-f="${k}" aria-pressed="${filtro === k}">${u(v[0], v[1])}</button>`).join('')}</div></div>
      <p class="muted">${Object.keys(S.consejos).length} / ${lista.length} ${u('entendidos', 'understood')}</p>
      ${ver.map((c) => `<a class="tarjeta enlace-tarjeta" href="#/consejo/${c.id}"><span class="etiqueta">${esc(u(...TEMAS[c.tema]))}${S.consejos[c.id] ? ' ✓' : ''}</span><strong lang="${tgt()}">${esc(c[tgt()])}</strong><span class="muted" lang="${nat()}">${esc(c[nat()])}</span></a>`).join('')}`;
  };
  main.onclick = (e) => { const b = e.target.closest('[data-f]'); if (b) { filtro = b.dataset.f; pintar(); main.querySelector(`[data-f="${filtro}"]`).focus(); } };
  pintar();
  return () => { main.onclick = null; };
}

function detalle(main, lista, id) {
  const c = lista.find((x) => x.id === id); if (!c) { location.hash = '#/consejos'; return; }
  const S = estado(), T = tgt(), N = nat(), claves = c.clave;
  const texto = `🎩 «${c.es}»\n«${c.en}»\n— ${u('El consejo del Abuelo', 'Grandpa\'s advice')}`;
  main.innerHTML = `<p><a class="volver" href="#/consejos">← ${u('Todos los consejos', 'All advice')}</a></p>
    <div class="dialogo der">${pj('abuelo', 'aconsejando', { ancho: 120 })}<div class="globo abuelo"><span class="quien">${u('El Abuelo', 'Grandpa')}</span>
      <h1 style="font-size:1.3rem" lang="${T}">${resaltar(c[T], claves.map((k) => k[T]))}</h1><p class="muted" lang="${N}">${resaltar(c[N], claves.map((k) => k[N]))}</p></div></div>
    <div class="fila"><button class="btn-icono" data-voz aria-label="${u('Escuchar', 'Listen')}">🔊</button>${botonWhatsApp(texto)}</div>
    <div class="tarjeta mt"><h2>${u('Palabras clave', 'Key words')}</h2><ul>${claves.map((k) => `<li><mark class="clave">${esc(k[T])}</mark> = ${esc(k[N])}</li>`).join('')}</ul></div>
    <div id="juego" class="mt">${S.consejos[c.id] ? `<p class="estado-ok">✓ ${u('Ya lo entendiste.', 'You already got this one.')}</p>` : ''}<button class="btn grande" data-probar>${u('¿Qué quiso decir el Abuelo?', 'What did Grandpa mean?')}</button></div>`;
  main.onclick = async (e) => {
    if (e.target.closest('[data-voz]')) return void hablar(c[T], T, 'abuelo');
    if (!e.target.closest('[data-probar]')) return;
    const caja = main.querySelector('#juego'), q = c.q;
    const item = { tipo: 'mcq', prompt: u('¿Qué quiso decir el Abuelo?', 'What did Grandpa mean?'), frase: c[T], opciones: mezclar([q.ok, ...q.mal].map((o) => o[N])), correcta: q.ok[N] };
    const r = await jugar(caja, [item], { usarVidas: false });
    if (r.salio) return detalle(main, lista, id);
    if (!S.consejos[c.id]) { S.consejos[c.id] = true; guardar(); ganarXP(10); evento('consejos'); revisarInsignias(); }
    sonido.logro(); confeti(60);
    caja.innerHTML = `<div class="dialogo der">${pj('abuelo', 'aplaudiendo', { ancho: 100, clase: 'anim-asiente' })}<div class="globo abuelo"><p><strong>${u('Eso es.', 'That is it.')}</strong> ${esc(q.ok[N])}</p></div></div><a class="btn grande" href="#/consejo/${lista[c.id % lista.length].id}">${u('Otro consejo', 'Another piece of advice')} →</a>`;
  };
  return () => { main.onclick = null; };
}
