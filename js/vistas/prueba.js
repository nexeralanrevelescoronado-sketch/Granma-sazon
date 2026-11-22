// Prueba del capítulo n: lo aprendido hasta aquí, primero en el idioma propio y después en el que se aprende.
import { estado, guardar, u, tgt, nat, Ln, ganarXP, evento, vidas, sinEnergia, marcarRepetir, limpiarRepetir, MAX_VIDAS } from '../state.js';
import { historia } from '../datos.js';
import { armarPrueba, estrellasDe, NOTA_MINIMA } from '../pruebas.js';
import { jugar } from '../ejercicios.js';
import { pj } from '../personajes.js';
import { esc, fechaLocal } from '../util.js';
import { sonido } from '../sound.js';
import { confeti } from '../fx.js';
import { sinEnergiaHTML } from './sin-energia.js';

const IDIOMA = { es: { es: 'español', en: 'Spanish' }, en: { es: 'inglés', en: 'English' } };

export async function montar(main, { args }) {
  const S = estado(), h = await historia();
  const hechos = h.capitulos.filter((c) => S.caps[c.id]?.hecho).map((c) => c.id);
  const n = +args[0] || Math.max(0, ...hechos), cap = h.capitulos.find((c) => c.id === n);
  if (!cap || !S.caps[n]?.hecho) { location.hash = '#/historia'; return; }
  const T = tgt(), N = nat(), nombre = `${u('Prueba', 'Quiz')} ${n}`;
  let activo = true;
  if (sinEnergia()) { main.innerHTML = sinEnergiaHTML(nombre); return; }
  const prueba = armarPrueba(h, n, S.perfil.interes, T, N), previa = S.pruebas[n];

  const agotada = () => { marcarRepetir({ prueba: n, titulo: nombre }); main.innerHTML = sinEnergiaHTML(nombre); };
  const estrellas = (k) => `<span aria-label="${k} / 3">${'⭐'.repeat(k)}${'☆'.repeat(3 - k)}</span>`;

  function portada() {
    main.innerHTML = `<p><a class="volver" href="#/historia">← ${u('Mapa', 'Map')}</a></p>
      <div class="dialogo">${pj('granma', 'contenta', { ancho: 110 })}<div class="globo"><span class="quien">Granma</span>
        <h1 style="font-size:1.3rem;margin:0">${esc(nombre)}: ${esc(Ln(cap.titulo))}</h1>
        <p>${u(`Una pruebita de lo que llevas aprendido hasta aquí, mijo: ${prueba.palabras.length} palabras y ${prueba.frases.length} frases. Primero te pregunto en ${IDIOMA[N].es} y después en ${IDIOMA[T].es}.`,
          `A little quiz on what you have learned so far, mijo: ${prueba.palabras.length} words and ${prueba.frases.length} phrases. First I ask in ${IDIOMA[N].en}, then in ${IDIOMA[T].en}.`)}</p></div></div>
      <div class="tarjeta"><p><strong>${prueba.total}</strong> ${u('preguntas', 'questions')} · ${u('se aprueba con', 'pass with')} ${Math.round(NOTA_MINIMA * 100)}%</p>
        <p class="muted">${u('Energía de hoy', 'Energy today')}: <strong>${vidas()}</strong> / ${MAX_VIDAS} ${u('tortillitas. Cada error se come una; con más de', 'tortillas. Each mistake eats one; after more than')} ${MAX_VIDAS} ${u('errores, se repite mañana.', 'mistakes, we repeat tomorrow.')}</p>
        ${previa ? `<p>${u('Tu mejor resultado', 'Your best result')}: <strong>${Math.round(previa.mejor * 100)}%</strong> ${estrellas(previa.estrellas)}</p>` : ''}</div>
      <button class="btn grande olla" data-empezar>${u('Empezar la prueba', 'Start the quiz')}</button>`;
  }
  const puente = (parte) => {
    const idioma = parte === 'A' ? N : T;
    main.innerHTML = `<div class="vacio">${pj(parte === 'A' ? 'granma' : 'abuelo', parte === 'A' ? 'contenta' : 'aconsejando', { ancho: 140 })}
      <p class="etiqueta">${u('Parte', 'Part')} ${parte === 'A' ? 1 : 2} / 2</p>
      <h1>${parte === 'A' ? u(`Primero, en ${IDIOMA[N].es}`, `First, in ${IDIOMA[N].en}`) : (T === 'en' ? 'Now, in English' : 'Ahora, en español')}</h1>
      <p lang="${idioma}">${parte === 'A' ? u('Te digo la palabra o la frase y tú eliges cómo se dice.', 'I give you the word or phrase and you choose how to say it.') : (T === 'en' ? 'Now you read it in English and choose what it means.' : 'Ahora lo lees en español y eliges lo que significa.')}</p>
      <button class="btn grande" data-parte="${parte}">${parte === 'A' ? u('¡Vamos!', 'Let\'s go!') : (T === 'en' ? 'Continue' : 'Continuar')}</button></div>`;
  };
  let errores = 0;
  async function correr(parte) {
    main.innerHTML = '<div id="juego"></div>';
    const r = await jugar(main.querySelector('#juego'), parte === 'A' ? prueba.parteA : prueba.parteB, { usarVidas: true });
    if (!activo) return;
    if (r.salio) { location.hash = '#/historia'; return; }
    errores += r.errores;
    if (r.sinVidas) return agotada();
    if (parte === 'A') puente('B'); else resultado();
  }
  function resultado() {
    const pct = Math.max(0, 1 - errores / prueba.total), est = estrellasDe(pct), aprobada = pct >= NOTA_MINIMA;
    const primera = !S.pruebas[n]?.aprobada && aprobada, xp = primera ? 30 + est * 10 : aprobada ? 5 : 2;
    S.pruebas[n] = { mejor: Math.max(pct, previa?.mejor || 0), estrellas: Math.max(est, previa?.estrellas || 0), aprobada: aprobada || !!previa?.aprobada, fecha: fechaLocal() };
    if (S.repetir?.prueba === n) limpiarRepetir();
    guardar(); ganarXP(xp); if (aprobada) { evento('pruebas'); sonido.logro(); confeti(40); }
    const sig = h.capitulos.find((c) => c.id === n + 1);
    main.innerHTML = `<div class="centro">${pj(aprobada ? 'granma' : 'abuelo', aprobada ? 'aplaudiendo' : 'sonrisa', { ancho: 150 })}
      <h1>${aprobada ? u('¡Prueba aprobada!', 'Quiz passed!') : u('Casi, mijo', 'Almost, mijo')}</h1>
      <p style="font-size:1.6rem">${estrellas(est)}</p>
      <p><strong>${Math.round(pct * 100)}%</strong> · ${prueba.total - Math.min(errores, prueba.total)} / ${prueba.total} ${u('a la primera', 'on the first try')} · ${errores} ${u('errores', 'mistakes')}</p>
      <p class="estrella">+${xp} XP</p>
      <p>${aprobada ? u('Cada prueba es un poquito más grande que la anterior: así vas creciendo.', 'Each quiz is a little bigger than the last one: that is how you grow.') : u('Quien persevera, alcanza. Repásala cuando quieras; lo que fallaste es justo lo que más vas a recordar.', 'Whoever perseveres, achieves. Try it again whenever you like; what you missed is exactly what you will remember best.')}</p></div>
      ${aprobada && sig ? `<a class="btn grande" href="#/leccion/${sig.id}">${u('Siguiente capítulo', 'Next chapter')} →</a>` : ''}
      <div class="fila mt" style="justify-content:center"><button class="btn sec" data-otra>${u('Repetir la prueba', 'Retake the quiz')}</button><a class="btn sec" href="#/historia">${u('Volver al mapa', 'Back to the map')}</a></div>`;
  }

  main.onclick = (e) => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.hasAttribute('data-empezar')) puente('A');
    else if (b.dataset.parte) correr(b.dataset.parte);
    else if (b.hasAttribute('data-otra')) montar(main, { args: [String(n)] });
  };
  portada();
  return () => { activo = false; main.onclick = null; };
}
