// Recetas por región y por tema: #/regiones (todos los botones) y #/regiones/<id> (las recetas de ese lugar o tema).
// Cada receta trae su historia (por qué se llama así, de dónde viene, la leyenda marcada y datos curiosos) en su ficha.
import { estado, u, Lt, Ln } from '../state.js';
import { recetas, regiones } from '../datos.js';
import { pj } from '../personajes.js';
import { esc } from '../util.js';

/** Botón de un grupo (región o tema). Lo usan esta pantalla y el inicio. */
export const botonGrupo = (g) => `<a class="btn sec grupo" href="#/regiones/${g.id}"><span aria-hidden="true">${g.icono}</span><span>${esc(Ln(g.nombre))}</span><small>${g.recetas.length ? u(`${g.recetas.length} receta${g.recetas.length === 1 ? '' : 's'}`, `${g.recetas.length} recipe${g.recetas.length === 1 ? '' : 's'}`) : u('Muy pronto', 'Coming soon')}</small></a>`;

function tarjeta(r, grupo, S) {
  const hecho = S.recetas[r.id]?.hecha;
  return `<a class="tarjeta enlace-tarjeta" href="#/receta/${r.id}/${grupo}">
    <span>${r.historia ? `<span class="etiqueta">📜 ${u('Con su historia', 'With its story')}</span> ` : ''}${hecho ? `<span class="etiqueta">✓ ${u('Cocinada', 'Cooked')}</span>` : ''}</span>
    <h2 style="margin:0" lang="${u('en', 'es')}">${esc(Lt(r.nombre))}</h2><span class="muted" lang="${u('es', 'en')}">${esc(Ln(r.nombre))}</span>
    <span lang="${u('en', 'es')}">${esc(Lt(r.resumen))}</span>
    <span class="muted">⏱ ${r.tiempoPrep + r.tiempoCoccion} min · 🍽 ${r.porciones} ${u('porciones', 'servings')}</span></a>`;
}

export async function montar(main, { args }) {
  const S = estado(), [datos, lista] = await Promise.all([regiones(), recetas()]);
  const grupos = [...datos.regiones, ...datos.temas], g = grupos.find((x) => x.id === args[0]);
  if (!g) {
    main.innerHTML = `<p><a class="volver" href="#/recetas">← ${u('Recetas', 'Recipes')}</a></p>
      <div class="dialogo">${pj('granma', 'contento', { ancho: 104 })}<div class="globo"><span class="quien">Granma</span><h1 style="font-size:1.3rem;margin:0">${u('¿De dónde cocinamos hoy, mijo?', 'Where shall we cook from today, mijo?')}</h1>
        <p>${u('Cada receta trae su historia: por qué se llama así, de dónde viene y datos curiosos. Y la aprendes en español y en inglés.', 'Each recipe comes with its story: why it is called that, where it comes from, and fun facts. And you learn it in Spanish and English.')}</p></div></div>
      <h2>🗺️ ${u('Por región', 'By region')}</h2><div class="rejilla grupos">${datos.regiones.map(botonGrupo).join('')}</div>
      <h2 class="mt2">🍽️ ${u('Por tema', 'By topic')}</h2><div class="rejilla grupos">${datos.temas.map(botonGrupo).join('')}</div>`;
    return;
  }
  const suyas = g.recetas.map((id) => lista.find((r) => r.id === id)).filter(Boolean);
  document.title = `${Ln(g.nombre)} — Granma Sazón`;
  main.innerHTML = `<p><a class="volver" href="#/regiones">← ${u('Regiones', 'Regions')}</a></p>
    <div class="dialogo">${pj('granma', 'contento', { ancho: 96 })}<div class="globo"><span class="quien">Granma</span><h1 style="font-size:1.3rem;margin:0">${g.icono} ${esc(Ln(g.nombre))}</h1>
      ${g.lugar ? `<p class="muted">${esc(Ln(g.lugar))}</p>` : ''}
      <p>${suyas.length ? u(`Aquí tienes ${suyas.length} receta${suyas.length === 1 ? '' : 's'}, mijo, cada una con su historia.`, `Here you have ${suyas.length} recipe${suyas.length === 1 ? '' : 's'}, mijo, each one with its story.`)
        : u('Estoy juntando estas recetas con su historia, mijo. Muy pronto las cocinamos juntos.', 'I am gathering these recipes and their stories, mijo. Very soon we will cook them together.')}</p></div></div>
    ${suyas.map((r) => tarjeta(r, g.id, S)).join('')}
    ${suyas.length ? '' : `<a class="btn sec bloque" href="#/regiones">🗺️ ${u('Ver otras regiones', 'See other regions')}</a>`}`;
}
