// «Platica con Granma»: Granma saca conversación. Pregunta algo, la persona escoge qué contestar (y lo dice en voz alta)
// y Granma le responde con gusto. Aquí no hay respuestas malas: es para soltarse a platicar.
import { estado, guardar, u, tgt, nat, ganarXP, evento } from '../state.js';
import { platicas as cargar } from '../datos.js';
import { pj } from '../personajes.js';
import { esc, al } from '../util.js';
import { hablar } from '../fx.js';
import { sonido } from '../sound.js';

const HECHAS = (S) => (S.platicas ||= {});

export async function montar(main, { args = [] } = {}) {
  const S = estado(), lista = await cargar(), T = tgt(), N = nat();
  let activo = true;
  const dice = (quien, txt, estadoPj = 'contenta') => `<div class="dialogo">${pj(quien, estadoPj, { ancho: 72 })}<div class="globo"><p class="bilingue"><span class="l1" lang="${T}">${esc(txt[T])}</span> <button class="btn-icono" data-di="${esc(txt[T])}" aria-label="${u('Escuchar', 'Listen')}">🔊</button><br><span class="l2" lang="${N}">${esc(txt[N])}</span></p></div></div>`;

  function portada() {
    const hechas = HECHAS(S);
    main.innerHTML = `<p><a class="volver" href="#/hablar">← ${u('Hablar', 'Speak')}</a></p><h1>${u('Platica con Granma', 'Chat with Granma')}</h1>
      <div class="dialogo">${pj('granma', 'contenta', { ancho: 96 })}<div class="globo"><span class="quien">Granma</span>
        <p>${u('¡Ven, mijo, siéntate! Yo te pregunto y tú me contestas. Aquí no hay respuestas malas: nomás platicamos.', 'Come, mijo, sit down! I ask and you answer. There are no wrong answers here: we just chat.')}</p></div></div>
      <p class="muted">${u('Escoge de qué quieres platicar. Di tu respuesta en voz alta: así se suelta la lengua.', 'Choose what you want to chat about. Say your answer out loud: that is how you loosen up.')}</p>
      <div class="modos">${lista.map((p) => `<a class="opcion modo" href="#/platica/${p.id}"><span class="modo-ic" aria-hidden="true">${hechas[p.id] ? '✅' : '💬'}</span><span><strong>${esc(p.tema[N])}</strong><br><small lang="${T}">${esc(p.tema[T])}</small></span></a>`).join('')}</div>`;
  }

  function charla(p) {
    let i = 0;
    main.innerHTML = `<p><a class="volver" href="#/platica">← ${u('Pláticas', 'Chats')}</a></p><h1>${esc(p.tema[N])}</h1><div class="charla" data-charla aria-live="polite"></div><div data-pie></div>`;
    const hilo = main.querySelector('[data-charla]'), pie = main.querySelector('[data-pie]');
    const bajar = () => { try { pie.scrollIntoView({ block: 'end', behavior: 'auto' }); } catch { /* sin scroll */ } };
    const turno = () => {
      const t = p.turnos[i];
      hilo.insertAdjacentHTML('beforeend', dice('granma', t.granma, i === 0 ? 'contenta' : 'carinosa'));
      pie.innerHTML = `<p class="muted chico">${u('Escoge tu respuesta y dila en voz alta:', 'Choose your answer and say it out loud:')}</p>
        <div class="opciones" role="group" aria-label="${u('Tus respuestas', 'Your answers')}">${t.respuestas.map((r, k) => `<button class="opcion" data-resp="${k}"><span lang="${T}">${esc(r.t[T])}</span><br><small lang="${N}">${esc(r.t[N])}</small></button>`).join('')}</div>`;
      bajar();
    };
    const fin = () => {
      const hechas = HECHAS(S), primera = !hechas[p.id], xp = primera ? 8 : 2;
      hechas[p.id] = true; guardar(); ganarXP(xp); evento('platicas'); sonido.logro();
      hilo.insertAdjacentHTML('beforeend', dice('granma', p.cierre, 'aplaudiendo'));
      const otra = al(lista.filter((x) => x.id !== p.id && !hechas[x.id])) || al(lista.filter((x) => x.id !== p.id));
      pie.innerHTML = `<p class="estrella centro">+${xp} XP</p><a class="btn grande olla" href="#/platica/${otra.id}">${u('Otra plática', 'Another chat')}: ${esc(otra.tema[N])}</a><p class="mt centro"><a class="btn sec" href="#/platica">${u('Ver todas', 'See all')}</a></p>`;
      bajar();
    };
    main.onclick = (e) => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.di) return void hablar(b.dataset.di, T);
      if (!b.dataset.resp) return;
      const r = p.turnos[i].respuestas[+b.dataset.resp];
      // Lo que dijo la persona queda en el hilo (y se oye, para saber cómo suena); luego contesta Granma.
      hilo.insertAdjacentHTML('beforeend', `<div class="yo-dice"><p class="bilingue"><span class="l1" lang="${T}">${esc(r.t[T])}</span> <button class="btn-icono" data-di="${esc(r.t[T])}" aria-label="${u('Escuchar', 'Listen')}">🔊</button><br><span class="l2" lang="${N}">${esc(r.t[N])}</span></p></div>`);
      if (estado().ajustes.voz) hablar(r.t[T], T);
      hilo.insertAdjacentHTML('beforeend', dice('granma', r.r, 'aplaudiendo'));
      i++; pie.innerHTML = '';
      if (i < p.turnos.length) turno(); else fin();
    };
    turno();
  }

  const p = lista.find((x) => x.id === args[0]);
  if (p) charla(p); else portada();
  return () => { activo = false; main.onclick = null; void activo; };
}
