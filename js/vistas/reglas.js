// «Reglas claras»: lecciones cortas de gramática del idioma que se aprende, explicadas en el idioma propio,
// con ejemplos en los dos y cuatro preguntas para practicar (no gastan energía).
import { estado, guardar, u, tgt, nat, ganarXP, evento } from '../state.js';
import { reglas as cargar } from '../datos.js';
import { jugar } from '../ejercicios.js';
import { pj } from '../personajes.js';
import { esc, mezclar } from '../util.js';
import { hablar } from '../fx.js';
import { sonido } from '../sound.js';
import { porraHTML, fiesta } from '../porras.js';

const HECHAS = (S) => (S.reglas ||= {});

export async function montar(main, { args = [] } = {}) {
  const S = estado(), T = tgt(), N = nat(), lista = (await cargar()).filter((l) => l.para === T);
  let activo = true, soltar = null;

  function portada() {
    const hechas = HECHAS(S);
    main.innerHTML = `<p><a class="volver" href="#/hablar">← ${u('Hablar', 'Speak')}</a></p><h1>${u('Reglas claras', 'Clear rules')}</h1>
      <div class="dialogo">${pj('abuelo', 'aconsejando', { ancho: 92 })}<div class="globo abuelo"><span class="quien">${u('El Abuelo', 'Grandpa')}</span>
        <p>${u('Quien entiende la regla, ya no la memoriza. Vamos una por una, con calma.', 'Whoever understands the rule no longer needs to memorize it. Let us go one by one, calmly.')}</p></div></div>
      <div class="modos">${lista.map((l, i) => `<a class="opcion modo" href="#/reglas/${l.id}"><span class="modo-ic" aria-hidden="true">${hechas[l.id] ? '✅' : i + 1}</span><span><strong>${esc(l.titulo[N])}</strong><br><small>${esc(l.resumen[N])}</small></span></a>`).join('')}</div>`;
  }

  function leccion(l) {
    main.innerHTML = `<p><a class="volver" href="#/reglas">← ${u('Reglas claras', 'Clear rules')}</a></p><h1>${esc(l.titulo[N])}</h1><p>${esc(l.resumen[N])}</p>
      ${l.puntos.map((p, i) => `<section class="tarjeta regla"><h2><span class="num-regla" aria-hidden="true">${i + 1}</span> ${esc(p.regla[N])}</h2>
        <ul class="ejemplos">${p.ejemplos.map((e) => `<li><span lang="${T}">${esc(e[T])}</span> <button class="btn-icono" data-di="${esc(e[T])}" aria-label="${u('Escuchar', 'Listen')}">🔊</button><br><span class="muted" lang="${N}">${esc(e[N])}</span></li>`).join('')}</ul></section>`).join('')}
      <button class="btn grande olla" data-practicar>${u('Practicar esta regla', 'Practice this rule')}</button><div id="juego"></div>`;
  }
  async function practicar(l) {
    const items = l.practica.map((q) => ({ tipo: 'mcq', prompt: q.p[N], frase: q.frase, langFrase: T, opciones: mezclar([q.ok, ...q.mal]), correcta: q.ok }));
    main.innerHTML = '<div id="juego"></div>'; scrollTo({ top: 0 });
    const r = await jugar(main.querySelector('#juego'), items, { usarVidas: false });
    if (!activo) return;
    if (r.salio) return leccion(l);
    const hechas = HECHAS(S), primera = !hechas[l.id], xp = primera ? 12 : 3;
    hechas[l.id] = true; guardar(); ganarXP(xp); evento('reglas'); sonido.logro();
    const sig = lista[lista.indexOf(l) + 1];
    main.innerHTML = `<div class="centro">${pj('granma', 'aplaudiendo', { ancho: 140, clase: 'anim-aplaude' })}<h1>${u('¡Regla aprendida!', 'Rule learned!')}</h1><p class="muted">${esc(l.titulo[N])}</p>
      <p>${u('Aciertos', 'Correct')}: <strong>${r.aciertos}</strong> · ${u('Intentos fallidos', 'Missed')}: <strong>${r.errores}</strong></p><p class="estrella">+${xp} XP</p></div>
      ${porraHTML('taquitos', { conPj: false })}
      ${sig ? `<a class="btn grande olla" href="#/reglas/${sig.id}">${u('Siguiente regla', 'Next rule')}: ${esc(sig.titulo[N])}</a>` : ''}
      <p class="mt centro"><a class="btn sec" href="#/reglas">${u('Ver todas las reglas', 'See all the rules')}</a></p>`;
    soltar = fiesta(main);
  }

  const l = lista.find((x) => x.id === args[0]);
  main.onclick = (e) => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.di) return void hablar(b.dataset.di, T);
    if (b.hasAttribute('data-practicar') && l) practicar(l);
  };
  if (l) leccion(l); else portada();
  return () => { activo = false; soltar?.(); main.onclick = null; };
}
