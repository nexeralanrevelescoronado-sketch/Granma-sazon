// «Así se habla»: frases coloquiales explicadas con contexto (qué significan, cuándo se usan y cuándo no).
// Quien aprende español ve las de México por región; quien aprende inglés, el inglés de todos los días y su humor.
import { u, tgt, nat } from '../state.js';
import { coloquial as cargar } from '../datos.js';
import { pj } from '../personajes.js';
import { esc } from '../util.js';
import { hablar } from '../fx.js';

const REGION = {
  es: [['mexico', 'Todo México', 'All of Mexico'], ['jalisco', 'Jalisco y Guadalajara', 'Jalisco and Guadalajara'], ['sinaloa', 'Sinaloa y Mazatlán', 'Sinaloa and Mazatlán'], ['cdmx', 'Ciudad de México', 'Mexico City'], ['monterrey', 'Monterrey', 'Monterrey'], ['humor', 'Humor mexicano', 'Mexican humor']],
  en: [['diario', 'De todos los días', 'Everyday'], ['modismos', 'Frases hechas', 'Idioms'], ['humor', 'Humor en inglés', 'English humor'], ['sur', 'El Sur de EE. UU.', 'The U.S. South'], ['regiones', 'Otras regiones', 'Other regions']],
};

export async function montar(main) {
  const todas = await cargar(), T = tgt(), N = nat();
  let idioma = T, region = REGION[T][0][0];
  const pintar = () => {
    const regiones = REGION[idioma].filter(([r]) => todas.some((x) => x.idioma === idioma && x.region === r));
    if (!regiones.some(([r]) => r === region)) region = regiones[0]?.[0];
    const lista = todas.filter((x) => x.idioma === idioma && x.region === region);
    main.innerHTML = `<p><a class="volver" href="#/hablar">← ${u('Hablar', 'Speak')}</a></p><h1>${u('Así se habla', 'How people really talk')}</h1>
      <div class="dialogo">${pj('granma', 'contenta', { ancho: 92 })}<div class="globo"><span class="quien">Granma</span>
        <p>${idioma === 'es' ? u('En México cada región tiene sus palabras, mijo. Aquí te cuento qué quieren decir, para que nada te tome por sorpresa.', 'In Mexico every region has its own words, mijo. Here I tell you what they mean, so nothing catches you by surprise.')
          : u('El inglés de la calle no siempre viene en los libros, mijo. Aquí te cuento qué quieren decir esas frases y cómo es su humor.', 'Street English is not always in the books, mijo. Here I tell you what those phrases mean and what their humor is like.')}</p></div></div>
      <p class="muted">${u('Son frases coloquiales: cada región y cada ciudad adopta las suyas, y cambian de un lugar a otro. Úsalas con gente de confianza.', 'These are colloquial phrases: every region and city adopts its own, and they change from place to place. Use them with people you trust.')}</p>
      <div class="chips-region" role="group" aria-label="${u('Regiones', 'Regions')}">${regiones.map(([r, es, en]) => `<button class="chip-region" data-region="${r}" aria-pressed="${r === region}">${u(es, en)}</button>`).join('')}</div>
      <div class="frases">${lista.map((x) => `<article class="tarjeta frase">
        <h2 lang="${x.idioma}">${esc(x.frase)} <button class="btn-icono" data-di="${esc(x.frase)}" data-l="${x.idioma}" aria-label="${u('Escuchar', 'Listen')}">🔊</button></h2>
        <p><strong>${esc(x.significa[N])}</strong></p><p>${esc(x.uso[N])}</p>
        <p class="ejemplo"><span lang="${x.idioma}">«${esc(x.ejemplo[x.idioma])}»</span> <button class="btn-icono" data-di="${esc(x.ejemplo[x.idioma])}" data-l="${x.idioma}" aria-label="${u('Escuchar el ejemplo', 'Listen to the example')}">🔊</button><br><span class="muted" lang="${x.idioma === 'es' ? 'en' : 'es'}">${esc(x.ejemplo[x.idioma === 'es' ? 'en' : 'es'])}</span></p></article>`).join('')}</div>
      <p class="mt centro"><button class="btn sec" data-otro>${idioma === 'es' ? u('Ver el inglés de todos los días', 'See everyday English') : u('Ver cómo se habla en México', 'See how people talk in Mexico')}</button></p>`;
  };
  main.onclick = (e) => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.di) return void hablar(b.dataset.di, b.dataset.l);
    if (b.dataset.region) { region = b.dataset.region; pintar(); main.querySelector('.chips-region')?.scrollIntoView({ block: 'start' }); }
    else if (b.hasAttribute('data-otro')) { idioma = idioma === 'es' ? 'en' : 'es'; region = REGION[idioma][0][0]; pintar(); scrollTo({ top: 0 }); }
  };
  pintar();
  return () => { main.onclick = null; };
}
