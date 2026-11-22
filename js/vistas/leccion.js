// Lección: relato de Granma → palabras → 5 ejercicios → consejo del Abuelo → resultado.
import { estado, guardar, u, tgt, nat, Ln, Lt, ganarXP, evento, vidas, msParaVida } from '../state.js';
import { historia, recetas as cargarRecetas } from '../datos.js';
import { ejerciciosDeCapitulo, jugar } from '../ejercicios.js';
import { pj } from '../personajes.js';
import { esc, resaltar, mmss } from '../util.js';
import { confeti, hablar } from '../fx.js';
import { sonido } from '../sound.js';

export async function montar(main, { args }) {
  const S = estado(), h = await historia(), id = +args[0] || 1, cap = h.capitulos.find((c) => c.id === id);
  if (!cap) { location.hash = '#/historia'; return; }
  if (id > 1 && !S.caps[id - 1]?.hecho && !S.caps[id]?.hecho) { location.hash = '#/historia'; return; }
  const T = tgt(), N = nat();
  const boton = (txt, accion, cls = '') => `<div class="mt2"><button class="btn grande ${cls}" data-accion="${accion}">${txt}</button></div>`;
  let activo = true;

  function relato() {
    main.innerHTML = `<p class="etiqueta">${u('Capítulo', 'Chapter')} ${cap.id} / ${h.capitulos.length}</p><h1>${esc(Lt(cap.titulo))}</h1><p class="muted" lang="${N}">${esc(Ln(cap.titulo))}</p>
      ${cap.relato[T].map((p, i) => `<div class="dialogo ${i % 2 ? 'der' : ''}">${pj('granma', i === 0 ? 'contento' : i === cap.relato[T].length - 1 ? 'aplaudiendo' : 'pensando', { ancho: 78 })}<div class="globo"><p class="bilingue"><span class="l1" lang="${T}">${esc(p)}</span> <button class="btn-icono" data-voz="${i}" aria-label="${u('Escuchar', 'Listen')}">🔊</button><br><span class="l2" lang="${N}">${esc(cap.relato[N][i])}</span></p></div></div>`).join('')}
      ${boton(u('Ver las palabras nuevas', 'See the new words'), 'palabras')}`;
  }
  function palabras() {
    main.innerHTML = `<h1>${u('Palabras nuevas', 'New words')}</h1><p class="muted">${u('Toca 🔊 para escucharlas.', 'Tap 🔊 to hear them.')}</p>
      <ul style="list-style:none;padding:0;margin:0">${cap.palabras.map((p, i) => `<li class="tarjeta" style="display:flex;align-items:center;gap:10px;margin-bottom:8px;padding:10px 14px"><button class="btn-icono" data-vozp="${i}" aria-label="${u('Escuchar', 'Listen')} ${esc(p[T])}">🔊</button><div style="flex:1"><strong lang="${T}">${esc(p[T])}</strong><br><span class="muted" lang="${N}">${esc(p[N])}</span></div></li>`).join('')}</ul>
      ${boton(u('¡A practicar!', 'Let\'s practice!'), 'ejercicios')}`;
    if (!S.caps[id]?.palabras) { S.caps[id] = { ...(S.caps[id] || {}), palabras: true }; guardar(); evento('palabras', cap.palabras.length); }
  }
  async function ejercicios() {
    if (vidas() === 0) return sinVidas();
    const items = ejerciciosDeCapitulo(cap, S.perfil.interes);
    main.innerHTML = '<div id="juego"></div>';
    const r = await jugar(main.querySelector('#juego'), items, { usarVidas: true });
    if (!activo) return;
    if (r.salio) { location.hash = '#/historia'; return; }
    if (r.sinVidas) return sinVidas();
    resultado = r; consejo();
  }
  function sinVidas() {
    const min = Math.ceil(msParaVida() / 60000);
    main.innerHTML = `<div class="vacio">${pj('granma', 'animo', { ancho: 150 })}<h1>${u('Se acabaron las tortillitas', 'Out of tortillas')}</h1><p>${u(`Descansa tantito, mijo. En unos ${min} min te toca otra tortillita, o repasa las palabras y te regalo una ya.`, `Rest a little, mijo. In about ${min} min you get another tortilla, or review the words and I will give you one right now.`)}</p>
      <p><a class="btn olla" href="#/repaso">${u('Repasar palabras (+1 tortillita)', 'Review words (+1 tortilla)')}</a></p><p><a class="btn sec" href="#/historia">${u('Volver al mapa', 'Back to the map')}</a></p></div>`;
  }
  let resultado = { aciertos: 0, errores: 0 };
  function consejo() {
    const c = cap.consejo, claves = c.clave;
    main.innerHTML = `<h1>${u('El consejo del Abuelo', 'Grandpa\'s advice')}</h1>
      <div class="dialogo der">${pj('abuelo', 'contento', { ancho: 120, clase: 'anim-asiente' })}<div class="globo abuelo"><span class="quien">${u('El Abuelo', 'Grandpa')}</span>
        <p class="bilingue"><span class="l1" lang="${T}" style="font-size:1.15rem">${resaltar(c[T], claves.map((k) => k[T]))}</span> <button class="btn-icono" data-vozc aria-label="${u('Escuchar', 'Listen')}">🔊</button><br><span class="l2" lang="${N}">${resaltar(c[N], claves.map((k) => k[N]))}</span></p></div></div>
      <div class="tarjeta"><h2>${u('Palabras clave', 'Key words')}</h2><ul>${claves.map((k) => `<li><mark class="clave">${esc(k[T])}</mark> = ${esc(k[N])}</li>`).join('')}</ul></div>
      ${boton(u('Terminar capítulo', 'Finish chapter'), 'fin', 'verde')}`;
  }
  async function fin() {
    const primera = !S.caps[id]?.hecho, xp = 20 + resultado.aciertos * 8;
    S.caps[id] = { ...(S.caps[id] || {}), hecho: true, aciertos: resultado.aciertos, errores: resultado.errores }; guardar();
    if (primera) { ganarXP(xp); evento('lecciones'); } else ganarXP(5);
    sonido.logro(); confeti(140);
    const sig = h.capitulos.find((c) => c.id === id + 1), todos = h.capitulos.every((c) => S.caps[c.id]?.hecho);
    let rec = null; try { rec = (await cargarRecetas()).find((r) => r.id === cap.receta); } catch { /* receta sin descargar */ }
    main.innerHTML = `<div class="centro"><div class="pareja">${pj('granma', 'aplaudiendo', { ancho: 140, clase: 'anim-aplaude' })}${pj('abuelo', 'contento', { ancho: 112, clase: 'anim-asiente' })}</div><h1>${u('¡Capítulo terminado!', 'Chapter complete!')}</h1>
      <p>${u('Aciertos', 'Correct')}: <strong>${resultado.aciertos}</strong> · ${u('Intentos fallidos', 'Missed')}: <strong>${resultado.errores}</strong></p><p class="estrella">+${primera ? xp : 5} XP</p></div>
      ${rec ? `<div class="tarjeta crema2"><h2>🍲 ${u('Ahora, a cocinar', 'Now, let\'s cook')}</h2><p>${esc(Ln(rec.nombre))} — ${esc(Ln(rec.resumen))}</p><a class="btn olla" href="#/receta/${rec.id}">${u('Ver la receta', 'See the recipe')}</a></div>` : ''}
      ${todos ? `<div class="tarjeta verde"><h2>🏆 ${u('¡Terminaste la Historia 1!', 'You finished Story 1!')}</h2><p>${u('Tu Constancia Granma está lista.', 'Your Granma Certificate is ready.')}</p><a class="btn olla" href="#/perfil">${u('Ver mi constancia', 'See my certificate')}</a></div>` : sig ? `<a class="btn grande" href="#/leccion/${sig.id}">${u('Siguiente capítulo', 'Next chapter')} →</a>` : ''}
      <p class="mt"><a class="btn sec" href="#/historia">${u('Volver al mapa', 'Back to the map')}</a></p>`;
  }

  main.onclick = (e) => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.accion === 'palabras') palabras();
    else if (b.dataset.accion === 'ejercicios') ejercicios();
    else if (b.dataset.accion === 'fin') fin();
    else if (b.dataset.voz) hablar(cap.relato[T][+b.dataset.voz], T);
    else if (b.dataset.vozp) hablar(cap.palabras[+b.dataset.vozp][T], T);
    else if (b.hasAttribute('data-vozc')) hablar(cap.consejo[T], T);
    if (b.dataset.accion) scrollTo({ top: 0 });
  };
  relato();
  return () => { activo = false; main.onclick = null; };
}
