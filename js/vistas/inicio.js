import { estado, u, tgt, nat, Ln, Lt, vidas, rachaVigente, misionesDeHoy, progresoMision, MAX_VIDAS } from '../state.js';
import { pj } from '../personajes.js';
import { esc, delDia, resaltar } from '../util.js';
import { consejos, cotorreos, historia } from '../datos.js';
import { botonWhatsApp } from '../compartir.js';

const frase = (o) => ({ t: Lt(o), n: Ln(o) });

export async function montar(main) {
  const S = estado(), nombre = S.perfil.nombre ? `, ${esc(S.perfil.nombre)}` : '';
  const [cons, cot, hist] = await Promise.allSettled([consejos(), cotorreos(), historia()]);
  const sigCap = hist.status === 'fulfilled' ? hist.value.capitulos.find((c) => !S.caps[c.id]?.hecho) : null;
  const vacioPaquete = (txt) => `<p class="muted">${txt} <a href="#/descargas">${u('Descárgalo para verlo sin internet.', 'Download it to see it offline.')}</a></p>`;

  let consejoHTML = vacioPaquete(u('No pude cargar el consejo del día.', 'I could not load today\'s advice.'));
  if (cons.status === 'fulfilled') {
    const c = delDia(cons.value), claves = c.clave;
    const textoWA = `🎩 «${c.es}»\n«${c.en}»\n— ${u('El consejo del Abuelo', 'Grandpa\'s advice')}`;
    consejoHTML = `<div class="dialogo der">${pj('abuelo', 'aconsejando', { clase: 'anim-flota' })}<div class="globo abuelo"><span class="quien">${u('El consejo del Abuelo', 'Grandpa\'s advice')}</span>
      <p class="bilingue"><span class="l1" lang="${tgt()}">${resaltar(c[tgt()], claves.map((k) => k[tgt()]))}</span><br><span class="l2" lang="${nat()}">${resaltar(c[nat()], claves.map((k) => k[nat()]))}</span></p></div></div>
      <div class="fila"><a class="btn sec" href="#/consejo/${c.id}">${u('Entenderlo', 'Understand it')}</a>${botonWhatsApp(textoWA)}</div>`;
  }
  let chisteHTML = vacioPaquete(u('No pude cargar el chiste de hoy.', 'I could not load today\'s joke.'));
  if (cot.status === 'fulfilled') {
    const c = delDia(cot.value, 11);
    const textoWA = `😄 ${c.es}\n${c.en}\n— ${u('Cotorreo con Granma', 'Chat with Granma')}`;
    chisteHTML = `<div class="dialogo">${pj('granma', 'contento', { clase: 'anim-flota' })}<div class="globo"><span class="quien">${u('El chiste del día de Granma', 'Granma\'s joke of the day')}</span>
      <p class="bilingue"><span class="l1" lang="${tgt()}">${esc(c[tgt()])}</span><br><span class="l2" lang="${nat()}">${esc(c[nat()])}</span></p></div></div>
      <div class="fila"><a class="btn sec" href="#/cotorreo/${c.id}">${u('¿Qué quiso decir?', 'What did it mean?')}</a>${botonWhatsApp(textoWA)}</div>`;
  }
  const misiones = misionesDeHoy().map((m) => { const p = progresoMision(m); return `<li class="mision"><span aria-hidden="true">${p.cobrada ? '✅' : '🎯'}</span><div style="flex:1"><strong>${esc(Ln(m.texto))}</strong> <span class="muted">+${m.xp} XP</span><div class="barra olla" role="progressbar" aria-valuemin="0" aria-valuemax="${p.total}" aria-valuenow="${p.hecho}" aria-label="${esc(Ln(m.texto))}"><i style="width:${(p.hecho / p.total) * 100}%"></i></div></div></li>`; }).join('');

  main.innerHTML = `
    <section class="dialogo">${pj('granma', 'contento', { clase: 'anim-flota' })}<div class="globo"><span class="quien">Granma</span>
      <h1 style="font-size:1.25rem;margin:0">${u(`¡Hola${nombre}, mijo!`, `Hello${nombre}, mijo!`)}</h1>
      <p>${u(rachaVigente() ? `Llevas <strong>${rachaVigente()}</strong> día(s) de racha. ¡Qué orgullo!` : 'Hoy es un buen día para empezar tu racha.', rachaVigente() ? `You have a <strong>${rachaVigente()}</strong>-day streak. So proud!` : 'Today is a great day to start your streak.')}</p></div></section>
    ${sigCap ? `<a class="btn grande olla" href="#/leccion/${sigCap.id}">▶ ${u('Continuar', 'Continue')}: ${esc(Ln(sigCap.titulo))}</a>` : hist.status === 'fulfilled' ? `<a class="btn grande olla" href="#/historia">🏆 ${u('¡Terminaste la historia! Ver constancia', 'You finished the story! See your certificate')}</a>` : `<a class="btn grande olla" href="#/historia">▶ ${u('Historia de Granma', 'Granma\'s story')}</a>`}
    <div class="rejilla mt"><a class="btn sec" href="#/reto">⏱ ${u('Reto de 60 s', '60-second challenge')}</a><a class="btn sec" href="#/descargas">⬇ ${u('Sin internet', 'Offline')}</a></div>
    <section class="tarjeta mt2" aria-labelledby="h-misiones"><h2 id="h-misiones">${u('Misiones de hoy', 'Today\'s missions')}</h2><ul style="list-style:none;padding:0;margin:0">${misiones}</ul>
      <p class="muted" style="margin-top:8px"><span class="vidas" aria-hidden="true">${Array.from({ length: MAX_VIDAS }, (_, i) => `<i class="tortilla ${i < vidas() ? '' : 'vacia'}"></i>`).join('')}</span> ${u('tortillitas', 'tortillas')}</p></section>
    <section class="tarjeta" aria-labelledby="h-consejo"><h2 id="h-consejo" class="solo-lector">${u('Consejo del día', 'Advice of the day')}</h2>${consejoHTML}</section>
    <section class="tarjeta" aria-labelledby="h-chiste"><h2 id="h-chiste" class="solo-lector">${u('Chiste del día', 'Joke of the day')}</h2>${chisteHTML}</section>`;
}
