import { estado, guardar, u, tgt, nat, Ln, vidas, rachaVigente, misionesDeHoy, progresoMision, MAX_VIDAS, sinEnergia, tocaRepetir } from '../state.js';
import { pj } from '../personajes.js';
import { esc, delDia, resaltar } from '../util.js';
import { consejos, cotorreos, historia } from '../datos.js';
import { botonWhatsApp } from '../compartir.js';

// La pantalla se pinta al instante con lo que ya se sabe; el consejo, el chiste y el botón «Continuar» se rellenan
// cuando llegan sus datos (cada tarjeta reserva su alto para no mover nada: CLS 0).
export function montar(main) {
  const S = estado(), nombre = S.perfil.nombre ? `, ${esc(S.perfil.nombre)}` : '';
  const vacioPaquete = (txt) => `<p class="muted">${txt} <a href="#/descargas">${u('Descárgalo para verlo sin internet.', 'Download it to see it offline.')}</a></p>`;
  const misiones = misionesDeHoy().map((m) => { const p = progresoMision(m); return `<li class="mision"><span aria-hidden="true">${p.cobrada ? '✅' : '🎯'}</span><div style="flex:1"><strong>${esc(Ln(m.texto))}</strong> <span class="muted">+${m.xp} XP</span><div class="barra olla" role="progressbar" aria-valuemin="0" aria-valuemax="${p.total}" aria-valuenow="${p.hecho}" aria-label="${esc(Ln(m.texto))}"><i style="transform:scaleX(${p.hecho / p.total})"></i></div></div></li>`; }).join('');

  main.innerHTML = `
    <section class="dialogo">${pj('granma', 'contenta')}<div class="globo"><span class="quien">Granma</span>
      <h1 style="font-size:1.25rem;margin:0">${u(`¡Hola${nombre}, mijo!`, `Hello${nombre}, mijo!`)}</h1>
      <p>${u(rachaVigente() ? `Llevas <strong>${rachaVigente()}</strong> día(s) de racha. ¡Qué orgullo!` : 'Hoy es un buen día para empezar tu racha.', rachaVigente() ? `You have a <strong>${rachaVigente()}</strong>-day streak. So proud!` : 'Today is a great day to start your streak.')}</p></div></section>
    ${S.perfil.trato === undefined ? `<section class="tarjeta crema2" data-trato-card><h2 style="font-size:1.05rem">${u('¿Cómo quieres que te diga?', 'What should I call you?')}</h2><div class="fila"><button class="btn sec" data-trato="mijo">Mijo</button><button class="btn sec" data-trato="mija">Mija</button><button class="btn sec" data-trato="">${u('Como salga', 'Either one')}</button></div></section>` : ''}
    <a class="tarjeta enlace-tarjeta" href="#/perfil" data-app-lista hidden><strong>📲 ${u('Deja lista tu app', 'Get your app ready')}</strong><span class="muted">${u('Ponla en tu pantalla de inicio y permite los avisos, con un botón cada cosa.', 'Put it on your home screen and allow notifications, one button each.')}</span></a>
    <a class="btn grande olla" id="cta" href="#/historia">▶ ${u('Historia de Granma', 'Granma\'s story')}</a>
    <a class="btn sec bloque mt" id="cta-prueba" href="#/historia" hidden></a>
    <div class="rejilla mt"><a class="btn sec" href="#/reto">⏱ ${u('Reto 60 s', '60 s quiz')}</a><a class="btn sec" href="#/descargas">⬇ ${u('Sin internet', 'Offline')}</a></div>
    <a class="btn sec bloque mt" href="#/platica">💬 ${u('Granma quiere platicar contigo', 'Granma wants to chat with you')}</a>
    <section class="tarjeta mt2" aria-labelledby="h-misiones"><h2 id="h-misiones">${u('Misiones de hoy', 'Today\'s missions')}</h2><ul style="list-style:none;padding:0;margin:0">${misiones}</ul>
      <p class="muted" style="margin-top:8px"><span class="vidas" aria-hidden="true">${Array.from({ length: MAX_VIDAS }, (_, i) => `<i class="tortilla ${i < vidas() ? '' : 'vacia'}"></i>`).join('')}</span> ${u(`energía de hoy: ${vidas()} / ${MAX_VIDAS}`, `energy today: ${vidas()} / ${MAX_VIDAS}`)}</p>
      ${sinEnergia() ? `<p role="status"><strong>${u('Se acabó la energía por hoy.', 'Out of energy for today.')}</strong> ${u('Mañana repetimos con calma.', 'Tomorrow we repeat calmly.')}</p>` : ''}</section>
    <section class="tarjeta" id="tarjeta-consejo" style="min-height:11.5rem" aria-labelledby="h-consejo"><h2 id="h-consejo" class="solo-lector">${u('Consejo del día', 'Advice of the day')}</h2><div data-cont></div></section>
    <section class="tarjeta" id="tarjeta-chiste" style="min-height:11.5rem" aria-labelledby="h-chiste"><h2 id="h-chiste" class="solo-lector">${u('Chiste del día', 'Joke of the day')}</h2><div data-cont></div></section>`;

  // «¿Cómo quieres que te diga?»: se pregunta una sola vez a quien ya tenía la app; al elegir, todo se vuelve a leer con ese trato.
  main.querySelector('[data-trato-card]')?.addEventListener('click', (e) => { const b = e.target.closest('[data-trato]'); if (!b) return; S.perfil.trato = b.dataset.trato; guardar(); location.reload(); });
  // «Deja lista tu app»: aparece mientras falte instalarla o decidir sobre los avisos
  import('../permisos.js').then(({ faltaAlgo }) => { const a = main.querySelector('[data-app-lista]'); if (a && faltaAlgo()) a.hidden = false; }).catch(() => {});
  const poner = (id, html) => { const c = main.querySelector(`#${id} [data-cont]`); if (c) { c.innerHTML = html; c.closest('section').style.minHeight = ''; } };
  consejos().then((lista) => {
    const c = delDia(lista), claves = c.clave;
    const textoWA = `🎩 «${c.es}»\n«${c.en}»\n— ${u('El consejo del Abuelo', 'Grandpa\'s advice')}`;
    poner('tarjeta-consejo', `<div class="dialogo der">${pj('abuelo', 'aconsejando')}<div class="globo abuelo"><span class="quien">${u('El consejo del Abuelo', 'Grandpa\'s advice')}</span>
      <p class="bilingue"><span class="l1" lang="${tgt()}">${resaltar(c[tgt()], claves.map((k) => k[tgt()]))}</span><br><span class="l2" lang="${nat()}">${resaltar(c[nat()], claves.map((k) => k[nat()]))}</span></p></div></div>
      <div class="fila"><a class="btn sec" href="#/consejo/${c.id}">${u('Entenderlo', 'Understand it')}</a>${botonWhatsApp(textoWA)}</div>`);
  }).catch(() => poner('tarjeta-consejo', vacioPaquete(u('No pude cargar el consejo del día.', 'I could not load today\'s advice.'))));
  cotorreos().then((lista) => {
    const c = delDia(lista, 11);
    const textoWA = `😄 ${c.es}\n${c.en}\n— ${u('Cotorreo con Granma', 'Chat with Granma')}`;
    poner('tarjeta-chiste', `<div class="dialogo">${pj('granma', 'contenta')}<div class="globo"><span class="quien">${u('El chiste del día de Granma', 'Granma\'s joke of the day')}</span>
      <p class="bilingue"><span class="l1" lang="${tgt()}">${esc(c[tgt()])}</span><br><span class="l2" lang="${nat()}">${esc(c[nat()])}</span></p></div></div>
      <div class="fila"><a class="btn sec" href="#/cotorreo/${c.id}">${u('¿Qué quiso decir?', 'What did it mean?')}</a>${botonWhatsApp(textoWA)}</div>`);
  }).catch(() => poner('tarjeta-chiste', vacioPaquete(u('No pude cargar el chiste de hoy.', 'I could not load today\'s joke.'))));
  historia().then((h) => {
    const cta = main.querySelector('#cta'); if (!cta) return;
    const sig = h.capitulos.find((c) => !S.caps[c.id]?.hecho);
    // prueba pendiente: la del último capítulo terminado que todavía no se aprueba
    const pend = [...h.capitulos].reverse().find((c) => S.caps[c.id]?.hecho && !S.pruebas[c.id]?.aprobada), bp = main.querySelector('#cta-prueba');
    if (pend && bp) { bp.hidden = false; bp.href = `#/prueba/${pend.id}`; bp.textContent = `⭐ ${u('Prueba', 'Quiz')} ${pend.id}: ${u('lo que llevas aprendido', 'what you have learned')}`; }
    // lo que quedó para repetir (se acabó la energía): va primero
    if (S.repetir) { cta.href = S.repetir.cap ? `#/leccion/${S.repetir.cap}` : `#/prueba/${S.repetir.prueba}`; cta.textContent = `🔁 ${tocaRepetir() ? u('Hoy repetimos', 'Today we repeat') : u('Mañana repetimos', 'Tomorrow we repeat')}: ${S.repetir.titulo}`; return; }
    if (sig) { cta.href = `#/leccion/${sig.id}`; cta.textContent = `▶ ${u('Continuar', 'Continue')}: ${Ln(sig.titulo)}`; }
    else cta.textContent = `🏆 ${u('¡Terminaste la historia! Ver constancia', 'You finished the story! See your certificate')}`;
  }).catch(() => {});
}
