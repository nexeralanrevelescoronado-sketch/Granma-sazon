// Mapa de capítulos de la Historia 1 de Granma.
import { estado, u, Ln, Lt } from '../state.js';
import { historia } from '../datos.js';
import { pj } from '../personajes.js';
import { esc } from '../util.js';

export async function montar(main) {
  const S = estado(), h = await historia();
  const hechos = h.capitulos.filter((c) => S.caps[c.id]?.hecho).length, todos = hechos === h.capitulos.length;
  main.innerHTML = `<div class="dialogo">${pj('granma', 'contento')}<div class="globo"><span class="quien">Granma</span><h1 style="font-size:1.3rem;margin:0">${esc(Ln(h.titulo))}</h1><p>${u(`${h.capitulos.length} capítulos de mi vida. En cada uno aprendes palabras y cocinamos una receta.`, `${h.capitulos.length} chapters from my life. In each one you learn words and we cook a recipe.`)}</p></div></div>
    <div class="barra" role="progressbar" aria-valuemin="0" aria-valuemax="${h.capitulos.length}" aria-valuenow="${hechos}" aria-label="${u('Capítulos terminados', 'Chapters completed')}"><i style="transform:scaleX(${((hechos / h.capitulos.length) * 100) / 100})"></i></div>
    <p class="muted">${hechos} / ${h.capitulos.length} ${u('capítulos', 'chapters')} · ${u('Nivel', 'Level')} ${h.nivel}</p>
    <ol class="mapa mt">${h.capitulos.map((c) => {
      const hecho = !!S.caps[c.id]?.hecho, libre = c.id === 1 || S.caps[c.id - 1]?.hecho || hecho;
      return `<li><${libre ? `a href="#/leccion/${c.id}"` : 'span role="img"'} class="nodo ${hecho ? 'hecho' : libre ? '' : 'bloq'}" aria-label="${u('Capítulo', 'Chapter')} ${c.id}${hecho ? ' ✓' : libre ? '' : ' 🔒'}">${hecho ? '✓' : libre ? c.id : '🔒'}</${libre ? 'a' : 'span'}>
        <div class="info"><h2 style="font-size:1.1rem;margin:0" lang="${u('en', 'es')}">${esc(Lt(c.titulo))}</h2><p class="muted" style="margin:0" lang="${u('es', 'en')}">${esc(Ln(c.titulo))}</p></div></li>${hecho ? (() => { const pr = S.pruebas[c.id]; return `<li class="li-prueba"><a class="nodo prueba ${pr?.aprobada ? 'hecho' : ''}" href="#/prueba/${c.id}" aria-label="${u('Prueba', 'Quiz')} ${c.id}${pr?.aprobada ? ' ✓' : ''}">⭐</a>
        <div class="info"><h2 style="font-size:1rem;margin:0">${u('Prueba', 'Quiz')} ${c.id}</h2><p class="muted" style="margin:0">${pr ? `${'⭐'.repeat(pr.estrellas)}${'☆'.repeat(3 - pr.estrellas)} · ${Math.round(pr.mejor * 100)}%` : u('Lo aprendido hasta aquí, en español y en inglés', 'What you learned so far, in Spanish and English')}</p></div></li>`; })() : ''}`;
    }).join('')}</ol>
    ${todos ? `<div class="tarjeta verde mt2"><h2>🏆 ${u('¡Terminaste la historia!', 'You finished the story!')}</h2><p>${u('Tu Constancia Granma está lista.', 'Your Granma Certificate is ready.')}</p><a class="btn olla" href="#/perfil">${u('Ver mi constancia', 'See my certificate')}</a></div>` : ''}`;
}
