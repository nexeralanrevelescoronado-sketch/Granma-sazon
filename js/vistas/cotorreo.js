// Cotorreo con Granma: chistes, adivinanzas, refranes, trabalenguas y juegos de palabras (humor sano).
import { estado, guardar, u, tgt, nat, ganarXP, evento, revisarInsignias } from '../state.js';
import { cotorreos as cargar } from '../datos.js';
import { jugar } from '../ejercicios.js';
import { pj } from '../personajes.js';
import { esc, resaltar, mezclar } from '../util.js';
import { botonWhatsApp } from '../compartir.js';
import { sonido } from '../sound.js';
import { confeti, hablar } from '../fx.js';

const TEMAS = { cocina: ['Cocina', 'Cooking'], trabajo: ['Trabajo', 'Work'], amigos: ['Amigos', 'Friends'], fe: ['Fe', 'Faith'], viajes: ['Viajes', 'Travel'] };
const TIPOS = { chiste: ['Chiste', 'Joke'], adivinanza: ['Adivinanza', 'Riddle'], 'refrán': ['Refrán', 'Saying'], trabalenguas: ['Trabalenguas', 'Tongue twister'], 'juego de palabras': ['Juego de palabras', 'Wordplay'] };
const DEL_INTERES = { trabajo: 'trabajo', amigos: 'amigos', biblia: 'fe', viajes: 'viajes', cocina: 'cocina' };

export async function montar(main, { args }) {
  const lista = await cargar();
  if (args[0]) return detalle(main, lista, +args[0]);
  const S = estado(); let filtro = DEL_INTERES[S.perfil.interes] || 'todos';
  const pintar = () => {
    const ver = lista.filter((c) => filtro === 'todos' || c.tema === filtro);
    main.innerHTML = `<div class="dialogo">${pj('granma', 'contento', { ancho: 110 })}<div class="globo"><span class="quien">Granma</span><h1 style="font-size:1.3rem;margin:0">${u('Cotorreo con Granma', 'Chat with Granma')}</h1><p>${u('Chistes sanos para aprender riendo.', 'Clean jokes to learn while laughing.')}</p></div></div>
      <div class="segmentos" role="group" aria-label="${u('Tema', 'Topic')}"><button data-f="todos" aria-pressed="${filtro === 'todos'}">${u('Todos', 'All')} (${lista.length})</button>${Object.entries(TEMAS).map(([k, v]) => `<button data-f="${k}" aria-pressed="${filtro === k}">${u(v[0], v[1])}</button>`).join('')}</div>
      <p class="muted">${Object.keys(S.cotorreos).length} / ${lista.length} ${u('resueltos', 'solved')}</p>
      ${ver.map((c) => `<a class="tarjeta enlace-tarjeta" href="#/cotorreo/${c.id}"><span class="etiqueta">${esc(u(...TIPOS[c.tipo]))} · ${esc(u(...TEMAS[c.tema]))}${S.cotorreos[c.id] ? ' ✓' : ''}</span><strong lang="${tgt()}">${esc(c[tgt()])}</strong></a>`).join('')}`;
  };
  main.onclick = (e) => { const b = e.target.closest('[data-f]'); if (b) { filtro = b.dataset.f; pintar(); main.querySelector(`[data-f="${filtro}"]`).focus(); } };
  pintar();
  return () => { main.onclick = null; };
}

function detalle(main, lista, id) {
  const c = lista.find((x) => x.id === id); if (!c) { location.hash = '#/cotorreo'; return; }
  const S = estado(), T = tgt(), N = nat(), claves = c.clave;
  const texto = `😄 ${c.es}\n${c.en}\n— ${u('Cotorreo con Granma', 'Chat with Granma')}`;
  main.innerHTML = `<p><a class="volver" href="#/cotorreo">← ${u('Todos los cotorreos', 'All chats')}</a></p>
    <div class="dialogo">${pj('granma', 'contento', { ancho: 120, clase: 'anim-brinca' })}<div class="globo"><span class="quien">Granma · ${esc(u(...TIPOS[c.tipo]))}</span>
      <h1 style="font-size:1.25rem" lang="${T}">${resaltar(c[T], claves.map((k) => k[T]))}</h1><p class="muted" lang="${N}">${resaltar(c[N], claves.map((k) => k[N]))}</p></div></div>
    <div class="fila"><button class="btn-icono" data-voz aria-label="${u('Escuchar', 'Listen')}">🔊</button>${botonWhatsApp(texto)}</div>
    <div class="tarjeta mt"><h2>${u('3 palabras clave', '3 key words')}</h2><ul>${claves.map((k) => `<li><mark class="clave">${esc(k[T])}</mark> = ${esc(k[N])}</li>`).join('')}</ul></div>
    <div id="juego" class="mt">${S.cotorreos[c.id] ? `<p class="estado-ok">✓ ${u('Ya lo resolviste.', 'You already solved this one.')}</p>` : ''}<button class="btn grande" data-probar>${esc(c.q.p[N])}</button></div>`;
  main.onclick = async (e) => {
    if (e.target.closest('[data-voz]')) return void hablar(c[T], T);
    if (!e.target.closest('[data-probar]')) return;
    const caja = main.querySelector('#juego'), q = c.q;
    const item = { tipo: 'mcq', prompt: q.p[N], frase: c[T], opciones: mezclar([q.ok, ...q.mal].map((o) => o[N])), correcta: q.ok[N] };
    const r = await jugar(caja, [item], { usarVidas: false });
    if (r.salio) return detalle(main, lista, id);
    if (!S.cotorreos[c.id]) { S.cotorreos[c.id] = true; guardar(); ganarXP(10); evento('cotorreos'); revisarInsignias(); }
    sonido.logro(); confeti(60);
    caja.innerHTML = `<div class="tarjeta verde"><strong>${u('¡Muy bien!', 'Well done!')}</strong> ${esc(q.ok[N])}</div>
      ${c.abuelo ? `<div class="dialogo der">${pj('abuelo', 'pensando', { ancho: 110, clase: 'anim-asiente' })}<div class="globo abuelo"><span class="quien">${u('El Abuelo (muy serio)', 'Grandpa (very serious)')}</span><p class="bilingue"><span class="l1">${esc(c.abuelo[T])}</span><br><span class="l2">${esc(c.abuelo[N])}</span></p></div></div>` : ''}
      <a class="btn grande" href="#/cotorreo/${lista[c.id % lista.length].id}">${u('Otro cotorreo', 'Another chat')} →</a>`;
  };
  return () => { main.onclick = null; };
}
