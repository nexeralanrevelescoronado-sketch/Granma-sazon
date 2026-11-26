// «Aprender hablando y escuchando»: rondas de puro oído y voz (escoger lo que se oyó, repetir en voz alta, dictado).
// No gasta energía. Usa las palabras y frases de los capítulos que la persona ya abrió.
import { estado, u, tgt, nat, ganarXP, evento } from '../state.js';
import { historia } from '../datos.js';
import { armarEscucha } from '../escucha.js';
import { jugar, hablarPausado } from '../ejercicios.js';
import { pj } from '../personajes.js';
import { sonido } from '../sound.js';
import { confeti } from '../fx.js';
import { hayVozPara } from '../voz.js';
import { oidoPropioListo } from '../oido-propio.js';
import { porraHTML, fiesta } from '../porras.js';
import { PEREZOSO } from '../lento.js';

const IDIOMA = { es: ['español', 'Spanish'], en: ['inglés', 'English'] };

export async function montar(main) {
  const S = estado(), h = await historia(), T = tgt(), N = nat();
  // Los capítulos ya terminados y el que sigue (al menos el primero): así siempre hay con qué practicar.
  const hechos = h.capitulos.filter((c) => S.caps[c.id]?.hecho).length, caps = h.capitulos.slice(0, Math.min(h.capitulos.length, hechos + 1));
  let activo = true, soltar = null;
  const MODOS = [
    ['elige', '👂', u('Escucha y elige', 'Listen and choose'), u('Oyes una palabra y eliges cuál fue o qué significa.', 'You hear a word and choose which one it was or what it means.')],
    ['repite', '🗣', u('Escucha y repite', 'Listen and repeat'), u('Oyes una palabra o una frase y la dices en voz alta.', 'You hear a word or a sentence and say it out loud.')],
    ['arma', '🧩', u('Escucha y arma la frase', 'Listen and build the sentence'), u('Un dictado: oyes la frase y acomodas sus palabras.', 'A dictation: you hear the sentence and put its words in order.')],
    ['mixto', '🎲', u('De todo un poco', 'A bit of everything'), u('Ocho ejercicios revueltos de oído y de voz.', 'Eight mixed listening and speaking exercises.')],
  ];

  function portada() {
    const sinVoz = !hayVozPara(T);
    main.innerHTML = `<h1>${u('Aprender hablando y escuchando', 'Learn by speaking and listening')}</h1>
      <div class="dialogo">${pj('granma', 'contenta', { ancho: 96 })}<div class="globo"><span class="quien">Granma</span>
        <p>${u('Aquí se aprende con el oído y con la voz, mijo: primero me escuchas con calma y luego lo dices tú. Sin prisa.', 'Here we learn with our ears and our voice, mijo: first you listen calmly, then you say it. No rush.')}</p></div></div>
      <p class="muted">${u(`Con las palabras y frases de ${caps.length === 1 ? 'tu primer capítulo' : `tus ${caps.length} capítulos`}. Aquí no se gasta energía.`, `With the words and sentences from ${caps.length === 1 ? 'your first chapter' : `your ${caps.length} chapters`}. No energy is used here.`)}</p>
      <p class="pista-voces"><span><span class="btn-icono falso" aria-hidden="true">🔊</span> ${u('se oye normal', 'plays at normal speed')}</span><span><span class="btn-icono falso" aria-hidden="true">${PEREZOSO}</span> ${u('modo perezoso: se oye despacito', 'sloth mode: plays slowly')}</span></p>
      ${sinVoz ? `<div class="tarjeta crema2" role="status">${u(`Tu teléfono no tiene instalada una voz en ${IDIOMA[T][0]}. Puedes practicar «Escucha y repite» leyendo la frase; para oírla, instala una voz en los ajustes de tu teléfono.`, `Your phone has no ${IDIOMA[T][1]} voice installed. You can practice "Listen and repeat" by reading the sentence; to hear it, install a voice in your phone settings.`)}</div>` : ''}
      <div class="modos">${MODOS.map(([id, ic, t, d]) => `<button class="opcion modo" data-modo="${id}"><span class="modo-ic" aria-hidden="true">${ic}</span><span><strong>${t}</strong><br><small>${d}</small></span></button>`).join('')}</div>
      <p class="muted chico" data-oido-aviso hidden>👂 ${u('Para que Granma reconozca tus palabras sin internet, baja el «Oído de Granma» en', 'So Granma can recognize your words offline, get "Granma\'s ear" in')} <a href="#/descargas">${u('Descargas', 'Downloads')}</a>.</p>`;
    oidoPropioListo(T).then((si) => { const a = main.querySelector('[data-oido-aviso]'); if (a && !si) a.hidden = false; }).catch(() => {});
  }

  async function ronda(modo) {
    const items = armarEscucha(caps, S.perfil.interes, modo, T, N, 8);
    if (!items.length) return portada();
    main.innerHTML = '<div id="juego"></div>'; scrollTo({ top: 0 });
    const habiaVoz = items.some((it) => it.tipo === 'di') && !hablarPausado();
    const r = await jugar(main.querySelector('#juego'), items, { usarVidas: false });
    if (!activo) return;
    if (r.salio) return portada();
    const xp = 10 + r.aciertos; ganarXP(xp); evento('hablar'); sonido.logro(); confeti(40);
    const nombre = MODOS.find((m) => m[0] === modo)[2];
    main.innerHTML = `<div class="centro">${pj('granma', 'aplaudiendo', { ancho: 140, clase: 'anim-aplaude' })}<h1>${u('¡Ronda terminada!', 'Round complete!')}</h1>
      <p class="muted">${nombre}</p>
      <p>${u('Aciertos', 'Correct')}: <strong>${r.aciertos}</strong> · ${u('Intentos fallidos', 'Missed')}: <strong>${r.errores}</strong></p><p class="estrella">+${xp} XP</p></div>
      ${porraHTML('taquitos', { conPj: false })}
      ${habiaVoz ? '' : `<p class="muted centro">${u('Cuando puedas hablar, prueba «Escucha y repite».', 'When you can speak, try "Listen and repeat".')}</p>`}
      <button class="btn grande olla" data-modo="${modo}">${u('Otra ronda', 'Another round')}</button>
      <p class="mt centro"><button class="btn sec" data-portada>${u('Elegir otra forma de practicar', 'Choose another way to practice')}</button></p>`;
    soltar = fiesta(main);
  }

  main.onclick = (e) => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.modo) { soltar?.(); ronda(b.dataset.modo); } else if (b.hasAttribute('data-portada')) { soltar?.(); portada(); scrollTo({ top: 0 }); }
  };
  portada();
  return () => { activo = false; soltar?.(); main.onclick = null; };
}
