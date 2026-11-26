// Mapa de capítulos. #/historia = Historia 1 (la vida de Granma); #/historia/2 = Granma a los 25; #/historia/3 = las fiestas de su familia.
import { estado, u, Ln, Lt } from '../state.js';
import { historiaN, historias, numeroDe, mapaDe } from '../datos.js';
import { pj } from '../personajes.js';
import { esc } from '../util.js';

const PJ = { 1: 'contento', 2: 'carinosa', 3: 'aplaudiendo' };

export async function montar(main, { args = [] } = {}) {
  const S = estado(), n = [2, 3].includes(+args[0]) ? +args[0] : 1, h = await historiaN(n), dos = !!h.sobria;
  const hechos = h.capitulos.filter((c) => S.caps[c.id]?.hecho).length, todos = hechos === h.capitulos.length, primero = h.capitulos[0].id;
  // Las otras historias se asoman en tarjetas, con su título completo para que cada quien sepa a qué entra.
  let otra = ''; try { otra = (await historias()).filter((o) => o.id !== h.id).map((o) => { const k = o.capitulos.filter((c) => S.caps[c.id]?.hecho).length;
    return `<a class="tarjeta crema2 otra-historia mt2" href="${mapaDe(o)}"><span class="etiqueta">${u('Historia', 'Story')} ${numeroDe(o)} · ${k} / ${o.capitulos.length}</span><strong>${esc(Ln(o.titulo))}</strong>${o.resumen ? `<span class="muted">${esc(Ln(o.resumen))}</span>` : ''}<span class="ir">${u('Abrir', 'Open')} →</span></a>`; }).join(''); } catch { /* las otras historias aún no están descargadas */ }
  main.innerHTML = `<div class="dialogo">${pj('granma', PJ[n])}<div class="globo"><span class="quien">Granma</span><h1 style="font-size:1.3rem;margin:0">${esc(Ln(h.titulo))}</h1><p>${h.resumen ? esc(Ln(h.resumen)) : u(`${h.capitulos.length} capítulos de mi vida. En cada uno aprendes palabras y cocinamos una receta.`, `${h.capitulos.length} chapters from my life. In each one you learn words and we cook a recipe.`)}</p></div></div>
    <div class="barra" role="progressbar" aria-valuemin="0" aria-valuemax="${h.capitulos.length}" aria-valuenow="${hechos}" aria-label="${u('Capítulos terminados', 'Chapters completed')}"><i style="transform:scaleX(${((hechos / h.capitulos.length) * 100) / 100})"></i></div>
    <p class="muted">${hechos} / ${h.capitulos.length} ${u('capítulos', 'chapters')} · ${u('Nivel', 'Level')} ${h.nivel}</p>
    <ol class="mapa mt">${h.capitulos.map((c, i) => {
      const hecho = !!S.caps[c.id]?.hecho, libre = c.id === primero || S.caps[c.id - 1]?.hecho || hecho, num = i + 1;
      return `<li><${libre ? `a href="#/leccion/${c.id}"` : 'span role="img"'} class="nodo ${hecho ? 'hecho' : libre ? '' : 'bloq'}" aria-label="${u('Capítulo', 'Chapter')} ${num}${hecho ? ' ✓' : libre ? '' : ' 🔒'}">${hecho ? '✓' : libre ? num : '🔒'}</${libre ? 'a' : 'span'}>
        <div class="info"><h2 style="font-size:1.1rem;margin:0" lang="${u('en', 'es')}">${esc(Lt(c.titulo))}</h2><p class="muted" style="margin:0" lang="${u('es', 'en')}">${esc(Ln(c.titulo))}</p></div></li>${hecho ? (() => { const pr = S.pruebas[c.id]; return `<li class="li-prueba"><a class="nodo prueba ${pr?.aprobada ? 'hecho' : ''}" href="#/prueba/${c.id}" aria-label="${u('Prueba', 'Quiz')} ${num}${pr?.aprobada ? ' ✓' : ''}">⭐</a>
        <div class="info"><h2 style="font-size:1rem;margin:0">${u('Prueba', 'Quiz')} ${num}</h2><p class="muted" style="margin:0">${pr ? `${'⭐'.repeat(pr.estrellas)}${'☆'.repeat(3 - pr.estrellas)} · ${Math.round(pr.mejor * 100)}%` : u('Lo aprendido hasta aquí, en español y en inglés', 'What you learned so far, in Spanish and English')}</p></div></li>`; })() : ''}`;
    }).join('')}</ol>
    ${todos && n === 1 ? `<div class="tarjeta verde mt2"><h2>🏆 ${u('¡Terminaste la historia!', 'You finished the story!')}</h2><p>${u('Tu Constancia Granma está lista.', 'Your Granma Certificate is ready.')}</p><a class="btn olla" href="#/perfil">${u('Ver mi constancia', 'See my certificate')}</a></div>` : ''}
    ${todos && n === 3 ? `<div class="tarjeta verde mt2"><h2>🎉 ${u('¡Terminaste las fiestas de Granma!', 'You finished Granma\'s celebrations!')}</h2><p>${u('Ahora te toca a ti poner la mesa, mijo. Las recetas te esperan.', 'Now it is your turn to set the table, mijo. The recipes are waiting.')}</p><a class="btn olla" href="#/recetas">${u('Ver las recetas', 'See the recipes')}</a></div>` : ''}
    ${todos && dos ? `<div class="tarjeta verde mt2"><h2>${u('Gracias por escuchar mi historia', 'Thank you for listening to my story')}</h2><p>${u('Si un día quieres, mijo, aquí está la Biblia para leerla con calma.', 'If one day you want to, mijo, the Bible is here to read calmly.')}</p><a class="btn sec" href="#/biblia">${u('Abrir la Biblia', 'Open the Bible')}</a></div>` : ''}
    ${otra}`;
}
