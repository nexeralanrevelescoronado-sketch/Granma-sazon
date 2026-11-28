// Lotería de Granma: Granma canta las cartas en el idioma que aprendes y tú las buscas en tu tabla.
// Cartas y versos propios de la app. El tiempo se ajusta solo: si ganas, sube de nivel; si pierdes dos seguidas, baja.
import { estado, guardar, u, tgt, nat, ganarXP } from '../state.js';
import { loteria } from '../datos.js';
import { pj } from '../personajes.js';
import { esc, mmss } from '../util.js';
import { sonido } from '../sound.js';
import { confeti, vibrar } from '../fx.js';
import { decir, callar } from '../voz.js';
import { NIVELES, armarPartida, cartaEn, yaSalio, llena, siguienteNivel } from '../loteria.js';

export async function montar(main) {
  const S = estado(), datos = await loteria(), C = Object.fromEntries(datos.cartas.map((c) => [c.id, c]));
  S.loteria = { nivel: 1, ganadas: 0, jugadas: 0, malas: 0, ...(S.loteria || {}) };
  let idioma = tgt(), reloj = 0, activo = true, partida = null;
  const otro = () => (idioma === 'es' ? 'en' : 'es');
  const conVoz = () => !!S.ajustes.voz;

  function portada() {
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
      <p class="muted chico mt">${esc(datos.nota[nat()])}</p>`;
  }

  function jugar() {
    callar();
    const nivel = S.loteria.nivel, p = armarPartida({ nivel, semilla: Date.now(), ids: datos.cartas.map((c) => c.id) });
    partida = { p, marcadas: new Set(), inicio: performance.now() + 3000, pausa: 0, ultima: -1, fin: false, nivel };
    const tam = p.lado === 3 ? 'tres' : 'cuatro';
    main.innerHTML = `<div class="loteria">
      <div class="fila" style="justify-content:space-between"><span class="reto-tiempo" data-tiempo role="timer">${mmss(p.duracion / 1000)}</span><span class="muted">${u('Nivel', 'Level')} ${nivel}</span></div>
      <div class="reto-barra"><i data-barra></i></div>
      <div class="cantada" data-cantada aria-live="polite"><span class="cuenta">3</span></div>
      <div class="tabla-loteria ${tam}" style="--lado:${p.lado}">${p.tabla.map((id) => `<button class="casilla" data-c="${id}" aria-label="${esc(C[id][idioma])}"><span aria-hidden="true">${C[id].emoji}</span></button>`).join('')}</div>
      <button class="btn grande verde" data-loteria disabled>🎉 ¡Lotería!</button>
      <p class="muted centro chico" data-pista></p></div>`;
    reloj = setInterval(tic, 150); tic();
  }

  function pintarCantada(id) {
    const c = C[id], N = partida.nivel, caja = main.querySelector('[data-cantada]'); if (!caja) return;
    const escrita = !conVoz() || N <= 3, ayuda = N <= 2;
    caja.innerHTML = `<span class="carta-num">${u('Carta', 'Card')} ${partida.ultima + 1} / ${partida.p.llamadas.length}</span>
      ${escrita ? `<strong lang="${idioma}">${esc(c[idioma])}</strong>` : `<strong aria-label="${u('Escucha', 'Listen')}">🔊</strong>`}
      ${ayuda ? `<span class="muted" lang="${otro()}">${esc(c[otro()])}</span><em lang="${idioma}">${esc(c.verso[idioma])}</em>` : ''}
      ${conVoz() ? `<button class="btn-icono" data-otra-vez aria-label="${u('Oír otra vez', 'Hear again')}">🔁</button>` : ''}`;
    if (conVoz()) decir(c[idioma], idioma, 'granma');
  }

  function tic() {
    if (!partida || partida.fin) return;
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
    if (llena(partida.p, partida.marcadas)) { const l = main.querySelector('[data-loteria]'); l.disabled = false; l.classList.add('lista'); pista.textContent = u('¡Ya llenaste tu tabla! Grita ¡Lotería!', 'Your board is full! Shout Lotería!'); }
  }

  function terminar(gano) {
    if (!partida || partida.fin) return; partida.fin = true; clearInterval(reloj); callar();
    const antes = S.loteria.nivel; S.loteria = siguienteNivel(S.loteria, gano); guardar();
    const xp = gano ? 10 + 5 * partida.nivel : 0; if (xp) ganarXP(xp);
    if (gano) { sonido.logro(); confeti(140); if (conVoz()) decir('¡Lotería!', 'es', 'granma'); } else sonido.mal();
    const sube = S.loteria.nivel > antes, baja = S.loteria.nivel < antes;
    main.innerHTML = `<div class="centro">${pj('granma', gano ? 'aplaudiendo' : 'carinosa', { ancho: 150, clase: gano ? 'anim-aplaude' : '' })}
      <h1>${gano ? '🎉 ¡Lotería!' : u('¡Casi, mijo!', 'So close, mijo!')}</h1>
      <p>${gano ? u(`Llenaste tu tabla. +${xp} XP`, `You filled your board. +${xp} XP`) : u(`Marcaste ${partida.marcadas.size} de ${partida.p.tabla.length}. Ándale, otra vez.`, `You marked ${partida.marcadas.size} of ${partida.p.tabla.length}. Come on, once more.`)}</p>
      ${sube ? `<p class="estrella">⬆ ${u(`¡Subiste al nivel ${S.loteria.nivel}! Voy a cantar más rápido.`, `You moved up to level ${S.loteria.nivel}! I will sing faster.`)}</p>` : ''}
      ${baja ? `<p class="muted">${u(`Bajamos al nivel ${S.loteria.nivel} para agarrar ritmo.`, `We went back to level ${S.loteria.nivel} to find the rhythm.`)}</p>` : ''}</div>
      <button class="btn grande olla" data-jugar>${u('Otra tabla', 'Another board')}</button>
      <p class="mt centro"><a href="#/loteria" data-portada>${u('Volver a la lotería', 'Back to lotería')}</a> · <a href="#/">${u('Ir al inicio', 'Go home')}</a></p>`;
  }

  main.onclick = (e) => {
    const b = e.target.closest('button, a'); if (!b) return;
    if (b.dataset.idioma) { idioma = b.dataset.idioma; portada(); }
    else if (b.hasAttribute('data-jugar')) jugar();
    else if (b.hasAttribute('data-portada')) { e.preventDefault(); partida = null; portada(); }
    else if (b.dataset.c && partida && !partida.fin) marcar(b.dataset.c, b);
    else if (b.hasAttribute('data-loteria') && partida && llena(partida.p, partida.marcadas)) terminar(true);
    else if (b.hasAttribute('data-otra-vez') && partida && partida.ultima >= 0) decir(C[partida.p.llamadas[partida.ultima]][idioma], idioma, 'granma');
  };
  // Si la app se va al fondo, el juego se pausa (y sigue donde iba al volver).
  const visible = () => { if (!partida || partida.fin) return; if (document.hidden) partida.pausa = performance.now(); else if (partida.pausa) { partida.inicio += performance.now() - partida.pausa; partida.pausa = 0; } };
  document.addEventListener('visibilitychange', visible);
  portada();
  return () => { activo = false; clearInterval(reloj); callar(); main.onclick = null; document.removeEventListener('visibilitychange', visible); };
}
