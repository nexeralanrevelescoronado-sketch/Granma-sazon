import { estado, u, Ln, Lt } from '../state.js';
import { recetas } from '../datos.js';
import { pj } from '../personajes.js';
import { esc } from '../util.js';

// Recetas de la Historia 3 (van juntas, con su propio título)
const FIESTA = new Set(['rosca', 'tamales', 'chocolate', 'enchiladas', 'birria', 'chiles-en-nogada', 'chiles-rellenos', 'pipian']);

export async function montar(main) {
  const S = estado(), lista = await recetas();
  main.innerHTML = `<div class="dialogo">${pj('granma', 'contento', { ancho: 110 })}<div class="globo"><span class="quien">Granma</span><h1 style="font-size:1.3rem;margin:0">${u('Recetas de México', 'Recipes from Mexico')}</h1><p>${u('Medidas exactas, pasos con cronómetro y en dos idiomas.', 'Exact measures, steps with timers, in two languages.')}</p></div></div>
    <a class="btn grande olla bloque" href="#/regiones">🗺️ ${u('Recetas por región y con su historia', 'Recipes by region, with their story')}</a>
    ${lista.map((r, i) => { const titulo = FIESTA.has(r.id) && !FIESTA.has(lista[i - 1]?.id) ? `<h2 class="mt2">🎉 ${u('Las recetas de las fiestas', 'The celebration recipes')}</h2><p class="muted">${u('Las que salen en «Las fiestas de mi familia».', 'The ones from "My family\'s celebrations".')} <a href="#/historia/3">${u('Leer la historia', 'Read the story')}</a></p>` : ''; const hecho = S.recetas[r.id]?.hecha, hechos = Object.values(S.recetas[r.id]?.pasos || {}).filter(Boolean).length; return `${titulo}<a class="tarjeta enlace-tarjeta" href="#/receta/${r.id}">
      <span>${r.estrella ? `<span class="etiqueta">⭐ ${u('La receta estrella de Granma', 'Granma\'s star recipe')}</span> ` : ''}${hecho ? `<span class="etiqueta">✓ ${u('Cocinada', 'Cooked')}</span>` : ''}</span>
      <h2 style="margin:0" lang="${u('en', 'es')}">${esc(Lt(r.nombre))}</h2><span class="muted" lang="${u('es', 'en')}">${esc(Ln(r.nombre))}</span><span lang="${u('en', 'es')}">${esc(Lt(r.resumen))}</span><span class="muted" lang="${u('es', 'en')}">${esc(Ln(r.resumen))}</span>
      <span class="muted">⏱ ${r.tiempoPrep + r.tiempoCoccion} min · 🍽 ${r.porciones} ${u('porciones', 'servings')}${hechos && !hecho ? ` · ${hechos}/${r.pasos.length} ${u('pasos', 'steps')}` : ''}</span></a>`; }).join('')}
    <div class="tarjeta crema2"><h3>🍝 ${u('Recetas italianas', 'Italian recipes')}</h3><p>${u('Próximamente.', 'Coming soon.')}</p></div>`;
}
