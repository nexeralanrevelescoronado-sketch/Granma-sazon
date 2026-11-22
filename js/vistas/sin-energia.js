// Pantalla cuando se acabó la energía del día (más de 10 errores): mañana se repite la lección.
import { u, MAX_VIDAS } from '../state.js';
import { pj } from '../personajes.js';
import { esc } from '../util.js';

export function sinEnergiaHTML(queRepetir) {
  return `<div class="vacio">${pj('granma', 'carinosa', { ancho: 150 })}
    <h1>${u('Se acabó la energía por hoy', 'Out of energy for today')}</h1>
    <p>${u(`Ya van más de ${MAX_VIDAS} tropiezos, mijo, y eso también es aprender. Descansa: mañana repetimos ${queRepetir ? `«${esc(queRepetir)}»` : 'la lección'} con calma, para que no se pierda el hilo.`,
      `That is more than ${MAX_VIDAS} slips, mijo, and that is learning too. Rest now: tomorrow we repeat ${queRepetir ? `"${esc(queRepetir)}"` : 'the lesson'} calmly, so the thread is not lost.`)}</p>
    <div class="dialogo der">${pj('abuelo', 'sonrisa', { ancho: 90 })}<div class="globo abuelo"><span class="quien">${u('El Abuelo', 'Grandpa')}</span><p>${u('Quien descansa a tiempo, aprende mejor.', 'Whoever rests in time learns better.')}</p></div></div>
    <p class="muted">${u('Mientras tanto, esto no gasta energía:', 'Meanwhile, these use no energy:')}</p>
    <div class="fila" style="justify-content:center"><a class="btn sec" href="#/recetas">🍲 ${u('Cocinar', 'Cook')}</a><a class="btn sec" href="#/cotorreo">😄 ${u('Cotorreo', 'Chat')}</a><a class="btn sec" href="#/reto">⏱ ${u('Reto de 60 s', '60-second challenge')}</a></div>
    <p class="mt"><a class="btn" href="#/historia">${u('Volver al mapa', 'Back to the map')}</a></p></div>`;
}
