// Lotería de Granma: Granma canta las cartas en el idioma que aprendes y tú las buscas en tu tabla.
// Cartas y versos propios de la app. Sola: el tiempo se ajusta (si ganas subes, si pierdes dos seguidas bajas).
// En familia (#/loteria/<CÓDIGO>): todos oyen las mismas cartas a la misma hora, cada quien con su tabla; el servidor revisa
// quién llenó primero de verdad. Del jugador solo se guarda un apodo, y todo se borra a las 24 horas.
import { estado, guardar, u, tgt, nat, ganarXP } from '../state.js';
import { loteria } from '../datos.js';
import { pj } from '../personajes.js';
import { esc, mmss } from '../util.js';
import { sonido } from '../sound.js';
import { confeti, vibrar } from '../fx.js';
import { decir, callar } from '../voz.js';
import { NIVELES, armarPartida, cartaEn, yaSalio, llena, siguienteNivel } from '../loteria.js';

const API = '/api/loteria', SITIO = 'https://granmasazon.app/';
async function api(ruta, cuerpo) {
  try {
    const r = await fetch(API + ruta, cuerpo ? { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(cuerpo) } : {});
    const d = await r.json().catch(() => ({})); return { ...d, ok: r.ok && d.ok !== false };
  } catch { return { ok: false, error: 'red' }; }
}

export async function montar(main, { args = [] } = {}) {
  const S = estado(), datos = await loteria(), C = Object.fromEntries(datos.cartas.map((c) => [c.id, c]));
  S.loteria = { nivel: 1, ganadas: 0, jugadas: 0, malas: 0, ...(S.loteria || {}) };
  const numero = Object.fromEntries(datos.cartas.map((c, i) => [c.id, i + 1]));
  /** Una carta de lotería: marco de papel picado, número arriba, figura al centro y nombre abajo. Si trae ilustración, ella va de fondo. */
  const carta = (id, { nombre = '', mini = false, oculta = false } = {}) => {
    const c = C[id], img = c.img && !oculta;
    return `<div class="carta${mini ? ' mini' : ''}${img ? ' con-img' : ''}${oculta ? ' oculta' : ''}" aria-hidden="true">${img ? `<img class="carta-img" src="${esc(c.img)}" width="400" height="600" alt="" decoding="async">` : ''}<div class="carta-in"><span class="carta-num">${oculta ? '?' : numero[id]}</span><span class="carta-fig">${img ? '' : oculta ? '🔊' : c.emoji}</span><span class="carta-nombre">${esc(nombre)}</span></div></div>`;
  };
  let idioma = tgt(), reloj = 0, sondeo = 0, partida = null, familia = null;
  const otro = () => (idioma === 'es' ? 'en' : 'es');
  const conVoz = () => !!S.ajustes.voz;
  const ERRORES = {
    apodo: u('Escribe un apodo de 1 a 16 letras o números (sin palabras feas).', 'Write a nickname of 1 to 16 letters or numbers (no bad words).'),
    'apodo-repetido': u('Ya hay alguien con ese apodo en la partida. Escoge otro.', 'Someone in the game already has that nickname. Pick another.'),
    'no-existe': u('No encontré esa partida. Revisa el código (son 5 letras).', 'I could not find that game. Check the code (5 letters).'),
    codigo: u('El código son 5 letras o números.', 'The code is 5 letters or numbers.'),
    'ya-empezo': u('Esa partida ya empezó. Pide que hagan otra.', 'That game already started. Ask them to make another one.'),
    llena: u('Esa partida ya está llena (12 jugadores).', 'That game is full (12 players).'),
    red: u('No hay internet. Para jugar en familia hace falta conexión.', 'No internet. Playing with family needs a connection.'),
  };
  const error = (e) => ERRORES[e] || u('Algo salió mal. Inténtalo otra vez.', 'Something went wrong. Try again.');

  /* ---------------- portada ---------------- */
  function portada() {
    detener(); familia = null;
    const N = NIVELES[S.loteria.nivel - 1];
    main.innerHTML = `<div class="dialogo">${pj('granma', 'contento', { ancho: 104 })}<div class="globo"><span class="quien">Granma</span>
        <h1 style="font-size:1.3rem;margin:0">🎴 ${u('Lotería con Granma', 'Lotería with Granma')}</h1>
        <p lang="${tgt()}">${esc(datos.historia[tgt()])}</p><p class="muted" lang="${nat()}">${esc(datos.historia[nat()])}</p></div></div>
      <section class="tarjeta">
        <h2 style="margin-top:0">${u('¿Cómo se juega?', 'How do you play?')}</h2>
        <p>${u('Yo canto cada carta en el idioma que escojas. Búscala en tu tabla y tócala. Cuando la llenes, grita ¡Lotería!', 'I sing each card in the language you choose. Find it on your board and tap it. When it is full, shout Lotería!')}</p>
        <p class="muted">${u(`Nivel ${S.loteria.nivel} de ${NIVELES.length}: tabla de ${N.lado}×${N.lado}, una carta cada ${(N.paso / 1000).toFixed(1)} segundos.`, `Level ${S.loteria.nivel} of ${NIVELES.length}: ${N.lado}×${N.lado} board, one card every ${(N.paso / 1000).toFixed(1)} seconds.`)}</p>
        <div class="interruptor" role="group" aria-label="${u('Idioma en que canta Granma', 'Language Granma sings in')}"><button data-idioma="en" aria-pressed="${idioma === 'en'}">English</button><button data-idioma="es" aria-pressed="${idioma === 'es'}">Español</button></div>
        ${conVoz() ? '' : `<p class="aviso-local">🔊 ${u('Prende la voz (arriba) para oír a Granma cantar. Sin voz, verás la palabra escrita.', 'Turn on the voice (top) to hear Granma sing. Without voice, you will see the word written.')}</p>`}
      </section>
      <button class="btn grande olla" data-jugar>▶ ${u('¡A jugar!', 'Let\'s play!')}</button>
      <button class="btn sec bloque mt" data-familia>👨‍👩‍👧 ${u('Jugar con familia y amigos', 'Play with family and friends')}</button>
      <p class="muted chico mt">${esc(datos.nota[nat()])}</p>`;
  }

  /* ---------------- familia: crear o unirse ---------------- */
  function pantallaFamilia(codigo = '', aviso = '') {
    detener();
    main.innerHTML = `<p><a class="volver" href="#/loteria" data-portada>← ${u('Lotería', 'Lotería')}</a></p>
      <h1>👨‍👩‍👧 ${u('Lotería en familia', 'Family lotería')}</h1>
      <p>${u('Todos oyen las mismas cartas a la misma hora, cada quien con su tabla. Gana quien grita ¡Lotería! primero.', 'Everyone hears the same cards at the same time, each with their own board. Whoever shouts Lotería! first wins.')}</p>
      <label class="campo"><span>${u('Tu apodo (no tu nombre completo)', 'Your nickname (not your full name)')}</span>
        <input data-apodo maxlength="16" autocomplete="nickname" value="${esc(S.loteria.apodo || '')}" placeholder="${u('Ej. Tía Chayo', 'E.g. Aunt Chayo')}"></label>
      <section class="tarjeta mt"><h2 style="margin-top:0">${u('Hacer una partida', 'Make a game')}</h2>
        <p class="muted">${u(`Granma cantará en ${idioma === 'en' ? 'inglés' : 'español'}, nivel ${S.loteria.nivel}.`, `Granma will sing in ${idioma === 'en' ? 'English' : 'Spanish'}, level ${S.loteria.nivel}.`)}</p>
        <button class="btn grande olla" data-crear>${u('Crear partida', 'Create game')}</button></section>
      <section class="tarjeta"><h2 style="margin-top:0">${u('Entrar con un código', 'Join with a code')}</h2>
        <label class="campo"><span>${u('Código de 5 letras', '5-letter code')}</span><input data-codigo maxlength="5" autocapitalize="characters" autocomplete="off" value="${esc(codigo)}" placeholder="ABCDE"></label>
        <button class="btn grande verde" data-unirse>${u('Entrar', 'Join')}</button></section>
      <p class="aviso-local" role="status" data-aviso ${aviso ? '' : 'hidden'}>${esc(aviso)}</p>
      <p class="muted chico">${u('Para jugar en familia se guarda solo tu apodo y cuántas cartas llevas, y se borra solo a las 24 horas.', 'To play with family we keep only your nickname and how many cards you have, and it deletes itself after 24 hours.')} <a href="#/privacidad">${u('Aviso de privacidad', 'Privacy notice')}</a></p>`;
  }
  const avisar = (t) => { const a = main.querySelector('[data-aviso]'); if (a) { a.textContent = t; a.hidden = false; } };
  const apodoEscrito = () => { const a = (main.querySelector('[data-apodo]')?.value || '').trim(); if (a) { S.loteria.apodo = a; guardar(); } return a; };

  async function crear(boton) {
    const apodo = apodoEscrito(); boton.disabled = true;
    const r = await api('/crear', { apodo, nivel: S.loteria.nivel, idioma }); boton.disabled = false;
    if (!r.ok) return avisar(error(r.error));
    entrarSala(r, true);
  }
  async function unirse(boton) {
    const apodo = apodoEscrito(), codigo = (main.querySelector('[data-codigo]')?.value || '').trim().toUpperCase(); boton.disabled = true;
    const r = await api('/unirse', { codigo, apodo }); boton.disabled = false;
    if (!r.ok) return avisar(error(r.error));
    entrarSala(r, false);
  }

  /* ---------------- sala de espera ---------------- */
  function entrarSala(r, anfitrion) {
    familia = { codigo: r.codigo, token: r.token, numero: r.numero, semilla: r.semilla, nivel: r.nivel, idioma: r.idioma, anfitrion, desfase: (r.ahora || Date.now()) - Date.now(), jugadores: [], ganador: null };
    idioma = r.idioma;
    const enlace = `${SITIO}#/loteria/${r.codigo}`, texto = u(`¡Juguemos Lotería con Granma! Entra con el código ${r.codigo}:`, `Let's play Lotería with Granma! Join with the code ${r.codigo}:`);
    main.innerHTML = `<h1>👨‍👩‍👧 ${u('Sala de lotería', 'Lotería room')}</h1>
      <div class="tarjeta centro"><p class="muted" style="margin:0">${u('Código', 'Code')}</p><p class="codigo-sala" data-codigo-sala>${esc(r.codigo)}</p>
        <div class="fila" style="justify-content:center"><a class="btn verde" href="https://wa.me/?text=${encodeURIComponent(`${texto}\n${enlace}`)}" target="_blank" rel="noopener noreferrer">${u('Invitar por WhatsApp', 'Invite on WhatsApp')}</a>
        <button class="btn sec" data-copiar="${esc(enlace)}">${u('Copiar enlace', 'Copy link')}</button></div></div>
      <h2>${u('Jugadores', 'Players')}</h2><ul class="jugadores" data-jugadores aria-live="polite"></ul>
      ${anfitrion ? `<button class="btn grande olla" data-empezar>▶ ${u('¡Empezar!', 'Start!')}</button>` : `<p class="centro muted" role="status">${u('Esperando a que empiece quien hizo la partida…', 'Waiting for the person who made the game to start…')}</p>`}
      <p class="aviso-local" role="status" data-aviso hidden></p>`;
    sondear(); sondeo = setInterval(sondear, 2000);
  }
  function pintarJugadores() {
    const ul = main.querySelector('[data-jugadores]'); if (!ul || !familia) return;
    const total = partida?.p.tabla.length;
    ul.innerHTML = familia.jugadores.map((j) => `<li><span>${j.anfitrion ? '⭐ ' : ''}${esc(j.apodo)}${j.numero === familia.numero ? ` <small class="muted">(${u('tú', 'you')})</small>` : ''}</span>${total ? `<span class="muted">${j.marcadas}/${total}</span>` : ''}</li>`).join('');
  }
  async function sondear() {
    if (!familia) return;
    const r = await api(`/estado?codigo=${familia.codigo}`); if (!r.ok || !familia) return;
    familia.desfase = r.ahora - Date.now(); familia.jugadores = r.jugadores; pintarJugadores();
    if (r.partida.inicio && !partida) empezarFamilia(r.partida.inicio);
    if (r.partida.ganador && partida && !partida.fin) terminar(r.partida.ganador === misApodo(), r.partida.ganador);
  }
  const misApodo = () => familia?.jugadores.find((j) => j.numero === familia.numero)?.apodo;
  function empezarFamilia(inicioServidor) {
    const p = armarPartida({ nivel: familia.nivel, semilla: familia.semilla, jugador: familia.numero });
    const enLocal = inicioServidor - familia.desfase;                         // la hora de inicio, en el reloj de este teléfono
    jugar({ p, nivel: familia.nivel, inicio: performance.now() + (enLocal - Date.now()) });
  }

  /* ---------------- el juego (sola o en familia) ---------------- */
  function jugar({ p, nivel, inicio }) {
    callar(); clearInterval(reloj);
    partida = { p, marcadas: new Set(), inicio, pausa: 0, ultima: -1, fin: false, nivel };
    const tam = p.lado === 3 ? 'tres' : 'cuatro';
    main.innerHTML = `<div class="loteria">
      <div class="fila" style="justify-content:space-between"><span class="reto-tiempo" data-tiempo role="timer">${mmss(p.duracion / 1000)}</span><span class="muted">${familia ? `👨‍👩‍👧 ${esc(familia.codigo)} · ` : ''}${u('Nivel', 'Level')} ${nivel}</span></div>
      <div class="reto-barra"><i data-barra></i></div>
      <div class="cantada" data-cantada aria-live="polite"><span class="cuenta">${Math.max(1, Math.ceil((inicio - performance.now()) / 1000))}</span></div>
      <div class="tabla-loteria ${tam}" style="--lado:${p.lado}">${p.tabla.map((id) => `<button class="casilla" data-c="${id}" aria-label="${esc(C[id][idioma])}">${carta(id, { mini: true })}</button>`).join('')}</div>
      <button class="btn grande verde" data-loteria disabled>🎉 ¡Lotería!</button>
      <p class="muted centro chico" data-pista></p>
      ${familia ? '<ul class="jugadores chico" data-jugadores></ul>' : ''}</div>`;
    pintarJugadores();
    reloj = setInterval(tic, 150); tic();
  }

  function pintarCantada(id) {
    const c = C[id], N = partida.nivel, caja = main.querySelector('[data-cantada]'); if (!caja) return;
    const escrita = !conVoz() || N <= 3, ayuda = N <= 2;
    caja.innerHTML = `${carta(id, { nombre: escrita ? c[idioma] : '', oculta: !escrita })}
      <div class="info"><span class="avance">${u('Carta', 'Card')} ${partida.ultima + 1} / ${partida.p.llamadas.length}</span>
      ${escrita ? `<strong lang="${idioma}">${esc(c[idioma])}</strong>` : `<strong aria-label="${u('Escucha', 'Listen')}">🔊</strong>`}
      ${ayuda ? `<span class="muted" lang="${otro()}">${esc(c[otro()])}</span><em lang="${idioma}">${esc(c.verso[idioma])}</em>` : ''}</div>
      ${conVoz() ? `<button class="btn-icono" data-otra-vez aria-label="${u('Oír otra vez', 'Hear again')}">🔁</button>` : ''}`;
    if (conVoz()) decir(c[idioma], idioma, 'granma');
  }

  function tic() {
    if (!partida || partida.fin || partida.pausa) return;
    const ms = performance.now() - partida.inicio, { p } = partida;
    const t = main.querySelector('[data-tiempo]'), b = main.querySelector('[data-barra]');
    if (ms < 0) { const c = main.querySelector('.cuenta'); if (c) c.textContent = String(Math.ceil(-ms / 1000)); return; }
    const resto = Math.max(0, p.duracion - ms);
    if (t) t.textContent = mmss(resto / 1000); if (b) b.style.transform = `scaleX(${resto / p.duracion})`;
    const i = cartaEn(p, ms);
    if (i !== partida.ultima) { partida.ultima = i; pintarCantada(p.llamadas[i]); }
    if (resto <= 0) terminar(false);
  }

  function marcar(id, boton) {
    const ms = performance.now() - partida.inicio, pista = main.querySelector('[data-pista]');
    if (partida.marcadas.has(id) || ms < 0) return;
    if (!yaSalio(partida.p, id, ms)) { pista.textContent = u('Esa todavía no la canto. ¡Paciencia!', 'I have not sung that one yet. Patience!'); boton.classList.remove('nop'); void boton.offsetWidth; boton.classList.add('nop'); vibrar(20); return; }
    partida.marcadas.add(id); boton.classList.add('marcada'); boton.setAttribute('aria-pressed', 'true'); sonido.ok(); pista.textContent = '';
    if (familia) api('/marcar', { codigo: familia.codigo, token: familia.token, marcadas: [...partida.marcadas] });
    if (llena(partida.p, partida.marcadas)) { const l = main.querySelector('[data-loteria]'); l.disabled = false; l.classList.add('lista'); pista.textContent = u('¡Ya llenaste tu tabla! Grita ¡Lotería!', 'Your board is full! Shout Lotería!'); }
  }

  async function gritarLoteria(boton) {
    if (!familia) return terminar(true);
    boton.disabled = true;
    const r = await api('/marcar', { codigo: familia.codigo, token: familia.token, marcadas: [...partida.marcadas], loteria: true });
    if (r.gano) return terminar(true, misApodo());
    if (r.ganador) return terminar(false, r.ganador);
    boton.disabled = false; main.querySelector('[data-pista]').textContent = r.error === 'red' ? error('red') : u('Todavía no está completa. Revisa tu tabla.', 'It is not complete yet. Check your board.');
  }

  function terminar(gano, ganador = null) {
    if (!partida || partida.fin) return; partida.fin = true; clearInterval(reloj); clearInterval(sondeo); callar();
    let xp = 0, sube = false, baja = false;
    if (familia) { xp = gano ? 20 : 5; ganarXP(xp); }                                  // en familia no cambia el nivel propio
    else { const antes = S.loteria.nivel; S.loteria = siguienteNivel(S.loteria, gano); guardar(); xp = gano ? 10 + 5 * partida.nivel : 0; if (xp) ganarXP(xp); sube = S.loteria.nivel > antes; baja = S.loteria.nivel < antes; }
    if (gano) { sonido.logro(); confeti(140); if (conVoz()) decir('¡Lotería!', 'es', 'granma'); } else sonido.mal();
    const titulo = gano ? '🎉 ¡Lotería!' : ganador ? u(`¡Lotería de ${ganador}!`, `Lotería for ${ganador}!`) : u('¡Casi, mijo!', 'So close, mijo!');
    main.innerHTML = `<div class="centro">${pj('granma', gano ? 'aplaudiendo' : 'carinosa', { ancho: 150, clase: gano ? 'anim-aplaude' : '' })}
      <h1 data-final>${esc(titulo)}</h1>
      <p>${gano ? u(`Llenaste tu tabla. +${xp} XP`, `You filled your board. +${xp} XP`) : ganador ? u(`Esta vez ganó ${ganador}. Tú marcaste ${partida.marcadas.size} de ${partida.p.tabla.length}. +${xp} XP por jugar en familia.`, `This time ${ganador} won. You marked ${partida.marcadas.size} of ${partida.p.tabla.length}. +${xp} XP for playing with family.`) : u(`Marcaste ${partida.marcadas.size} de ${partida.p.tabla.length}. Ándale, otra vez.`, `You marked ${partida.marcadas.size} of ${partida.p.tabla.length}. Come on, once more.`)}</p>
      ${sube ? `<p class="estrella">⬆ ${u(`¡Subiste al nivel ${S.loteria.nivel}! Voy a cantar más rápido.`, `You moved up to level ${S.loteria.nivel}! I will sing faster.`)}</p>` : ''}
      ${baja ? `<p class="muted">${u(`Bajamos al nivel ${S.loteria.nivel} para agarrar ritmo.`, `We went back to level ${S.loteria.nivel} to find the rhythm.`)}</p>` : ''}</div>
      ${familia ? `<button class="btn grande olla" data-familia>${u('Otra partida en familia', 'Another family game')}</button>` : `<button class="btn grande olla" data-jugar>${u('Otra tabla', 'Another board')}</button>`}
      <p class="mt centro"><a href="#/loteria" data-portada>${u('Volver a la lotería', 'Back to lotería')}</a> · <a href="#/">${u('Ir al inicio', 'Go home')}</a></p>`;
  }

  function detener() { clearInterval(reloj); clearInterval(sondeo); callar(); partida = null; }

  main.onclick = (e) => {
    const b = e.target.closest('button, a'); if (!b) return;
    if (b.dataset.idioma) { idioma = b.dataset.idioma; portada(); }
    else if (b.hasAttribute('data-jugar')) { detener(); jugar({ p: armarPartida({ nivel: S.loteria.nivel, semilla: Date.now(), ids: datos.cartas.map((c) => c.id) }), nivel: S.loteria.nivel, inicio: performance.now() + 3000 }); }
    else if (b.hasAttribute('data-familia')) { familia = null; pantallaFamilia(); }
    else if (b.hasAttribute('data-crear')) crear(b);
    else if (b.hasAttribute('data-unirse')) unirse(b);
    else if (b.hasAttribute('data-empezar')) { b.disabled = true; api('/empezar', { codigo: familia.codigo, token: familia.token }).then((r) => { if (r.ok) { familia.desfase = r.ahora - Date.now(); empezarFamilia(r.inicio); } else { b.disabled = false; avisar(error(r.error)); } }); }
    else if (b.dataset.copiar) { navigator.clipboard?.writeText(b.dataset.copiar).then(() => { b.textContent = u('¡Copiado!', 'Copied!'); }, () => {}); }
    else if (b.hasAttribute('data-portada')) { e.preventDefault(); portada(); }
    else if (b.dataset.c && partida && !partida.fin) marcar(b.dataset.c, b);
    else if (b.hasAttribute('data-loteria') && partida && !partida.fin && llena(partida.p, partida.marcadas)) gritarLoteria(b);
    else if (b.hasAttribute('data-otra-vez') && partida && partida.ultima >= 0) decir(C[partida.p.llamadas[partida.ultima]][idioma], idioma, 'granma');
  };
  // Sola: si la app se va al fondo, el juego se pausa. En familia no: la hora es la misma para todos.
  const visible = () => { if (!partida || partida.fin || familia) return; if (document.hidden) partida.pausa = performance.now(); else if (partida.pausa) { partida.inicio += performance.now() - partida.pausa; partida.pausa = 0; } };
  document.addEventListener('visibilitychange', visible);
  if (/^[A-Za-z0-9]{5}$/.test(args[0] || '')) pantallaFamilia(args[0].toUpperCase(), u('Te invitaron a una partida. Escribe tu apodo y toca «Entrar».', 'You were invited to a game. Write your nickname and tap «Join».'));
  else portada();
  return () => { detener(); main.onclick = null; document.removeEventListener('visibilitychange', visible); };
}
