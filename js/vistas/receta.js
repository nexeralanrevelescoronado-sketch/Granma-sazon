// Receta: ingredientes con medidas exactas, pasos numerados, cronómetro por paso, versión ES/EN, JSON-LD Recipe.
import { estado, guardar, u, tgt, nat, Ln, ganarXP, evento, revisarInsignias } from '../state.js';
import { recetas } from '../datos.js';
import { pj } from '../personajes.js';
import { esc, mmss } from '../util.js';
import { sonido } from '../sound.js';
import { confeti } from '../fx.js';
import { porraHTML, fiesta } from '../porras.js';
import { timers, nuevo, restante, alternar, reiniciar, pedirPermisoDeAviso, avisosDisponibles } from '../cronometros.js';

const cant = (i) => `${Number.isInteger(i.cant) ? i.cant : i.cant === 0.5 ? '½' : String(i.cant).replace('.', ',')} ${i.un}`;

function jsonld(r) {
  const iso = (m) => `PT${Math.floor(m / 60) ? Math.floor(m / 60) + 'H' : ''}${m % 60 ? (m % 60) + 'M' : ''}`;
  const d = { '@context': 'https://schema.org', '@type': 'Recipe', name: r.nombre.es, description: r.resumen.es, author: { '@type': 'Organization', name: 'Granma Sazón' }, recipeCuisine: 'Mexicana', prepTime: iso(r.tiempoPrep), cookTime: iso(r.tiempoCoccion), totalTime: iso(r.tiempoPrep + r.tiempoCoccion), recipeYield: `${r.porciones} porciones`, recipeIngredient: r.ingredientes.map((i) => `${cant(i)} ${i.es}`), recipeInstructions: r.pasos.map((p, k) => ({ '@type': 'HowToStep', position: k + 1, text: p.es })), image: [new URL('assets/iconos/og-1200.png', document.baseURI).href] };
  let s = document.getElementById('ld-receta'); if (!s) { s = document.createElement('script'); s.type = 'application/ld+json'; s.id = 'ld-receta'; document.head.append(s); }
  s.textContent = JSON.stringify(d);
}

/** «Su historia»: por qué se llama así, de dónde viene, la leyenda (siempre marcada como leyenda), datos curiosos y palabras para aprender. */
function historiaHTML(r, L, otro) {
  const h = r.historia; if (!h) return '';
  const es = L === 'es', par = (o) => `<p lang="${L}">${esc(o[L])}</p><p class="muted" lang="${otro}">${esc(o[otro])}</p>`;
  return `<details class="tarjeta historia-receta" open><summary><h2>📜 ${es ? 'Su historia' : 'Its story'}</h2></summary>
    <h3 lang="${L}">${es ? '¿Por qué se llama así?' : 'Why is it called that?'}</h3>${par(h.nombre)}
    <h3 lang="${L}">${es ? '¿De dónde viene?' : 'Where does it come from?'}</h3>${par(h.origen)}
    ${h.leyenda ? `<div class="leyenda"><span class="etiqueta">📖 ${es ? 'Leyenda: no está comprobada' : 'Legend: not proven'}</span>${par(h.leyenda)}</div>` : ''}
    <h3 lang="${L}">✨ ${es ? 'Datos curiosos' : 'Fun facts'}</h3><ul class="curiosos">${h.curiosos.map((c) => `<li>${par(c)}</li>`).join('')}</ul>
    ${r.aprende ? `<h3>🗣️ ${u('Palabras para aprender', 'Words to learn')}</h3><ul class="aprende">${r.aprende.map((w) => `<li><span lang="es">${esc(w.es)}</span><span aria-hidden="true">·</span><span lang="en">${esc(w.en)}</span></li>`).join('')}</ul>` : ''}
  </details>`;
}

export async function montar(main, { args }) {
  const lista = await recetas(), r = lista.find((x) => x.id === args[0]);
  if (!r) { location.hash = '#/recetas'; return; }
  const S = estado(); let idioma = tgt(); const reg = (S.recetas[r.id] ||= { pasos: {}, hecha: false });
  jsonld(r); document.title = `${r.nombre.es} — Granma Sazón`;
  let bloqueo = null; try { bloqueo = await navigator.wakeLock?.request('screen'); } catch { /* sin bloqueo de pantalla */ }
  let tic;

  function pintar() {
    const L = idioma, otro = L === 'es' ? 'en' : 'es';
    main.innerHTML = `<p><a class="volver" href="${args[1] ? `#/regiones/${esc(args[1])}` : '#/recetas'}">← ${args[1] ? u('Regresar', 'Back') : u('Recetas', 'Recipes')}</a></p>
      <div class="dialogo">${pj('granma', 'contento', { ancho: 100, clase: 'anim-flota' })}<div class="globo"><h1 style="font-size:1.35rem;margin:0" lang="${L}">${esc(r.nombre[L])}</h1><p class="muted" lang="${otro}">${esc(r.nombre[otro])}</p><p lang="${L}">${esc(r.resumen[L])}</p></div></div>
      <div class="fila"><div class="interruptor" role="group" aria-label="${u('Idioma de la receta', 'Recipe language')}"><button data-l="es" aria-pressed="${L === 'es'}">Español</button><button data-l="en" aria-pressed="${L === 'en'}">English</button></div>
        <span class="muted">⏱ ${r.tiempoPrep} + ${r.tiempoCoccion} min · 🍽 ${r.porciones}</span></div>
      <div class="tarjeta crema2 mt"><strong>⚠ ${u('Ojo', 'Careful')}:</strong> <span lang="${L}">${esc(r.nota[L])}</span></div>
      ${historiaHTML(r, L, otro)}
      <h2 lang="${L}">${L === 'es' ? 'Ingredientes' : 'Ingredients'}</h2>
      <ul class="ing">${r.ingredientes.map((i) => `<li><span class="cant">${esc(cant(i))}</span><span lang="${L}">${esc(i[L])}</span></li>`).join('')}</ul>
      <h2 class="mt2" lang="${L}">${L === 'es' ? 'Preparación' : 'Method'}</h2>
      <p class="muted">${avisosDisponibles() ? u('Los cronómetros siguen corriendo aunque cambies de sección. Si das permiso, te aviso con una notificación.', 'Timers keep running even if you switch sections. If you allow it, I will notify you.') : u('Los cronómetros siguen corriendo aunque cambies de sección.', 'Timers keep running even if you switch sections.')}</p>
      <ol class="pasos">${r.pasos.map((p, i) => `<li class="paso ${reg.pasos[i] ? 'hecho' : ''}" data-i="${i}"><span class="num" aria-hidden="true">${i + 1}</span><div class="txt"><p lang="${L}" style="margin:0">${esc(p[L])}</p>
        ${p.min ? `<div class="cron" data-cron="${i}"></div>` : ''}<label class="fila" style="margin-top:8px;min-height:44px"><input type="checkbox" data-paso="${i}" ${reg.pasos[i] ? 'checked' : ''} style="width:24px;height:24px"> ${u('Paso listo', 'Step done')}</label></div></li>`).join('')}</ol>
      ${reg.hecha ? `<div class="tarjeta verde"><h2>✓ ${u('¡Receta cocinada!', 'Recipe cooked!')}</h2></div>` : `<button class="btn grande verde" data-terminar>${u('¡Terminé de cocinar!', 'I finished cooking!')}</button>`}
      <p class="muted mt"><a href="recetas/${r.id}.html">${u('Versión de página web de la receta', 'Web-page version of this recipe')}</a></p>`;
    r.pasos.forEach((p, i) => { if (p.min) cron(i); });
  }
  function cron(i) {
    const caja = main.querySelector(`[data-cron="${i}"]`); if (!caja) return;
    const t = timers.get(`${r.id}:${i}`) || nuevo(r.pasos[i].min * 60);
    const rest = restante(t);
    caja.innerHTML = `<span class="tiempo ${rest === 0 ? 'fin' : ''}" role="timer" aria-label="${u('Cronómetro', 'Timer')}">${mmss(rest)}</span>
      <button class="btn sec" data-play="${i}" style="min-height:44px">${t.corriendo ? '⏸ ' + u('Pausar', 'Pause') : '⏱ ' + (rest === r.pasos[i].min * 60 ? u('Iniciar', 'Start') : u('Seguir', 'Resume'))}</button>
      <button class="btn-icono" data-reset="${i}" aria-label="${u('Reiniciar cronómetro', 'Reset timer')}">↺</button>`;
  }
  function tick() {
    for (const [k, t] of timers) {
      const [id, i] = k.split(':'); if (id !== r.id || !t.corriendo) continue;
      const rest = restante(t), el = main.querySelector(`[data-cron="${i}"] .tiempo`);
      if (el) { el.textContent = mmss(rest); el.classList.toggle('fin', rest === 0); }
    }
  }
  function terminar() {
    if (reg.hecha) return; reg.hecha = true; guardar(); ganarXP(30); revisarInsignias(); sonido.logro(); confeti(150); pintar();
    // Granma lo celebra: porra, premio y tortillas
    main.querySelector('.tarjeta.verde')?.insertAdjacentHTML('afterend', porraHTML('taquitos')); fiesta(main, '[data-premio] .pj');
  }
  main.onclick = (e) => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.l) { idioma = b.dataset.l; pintar(); main.querySelector(`[data-l="${idioma}"]`).focus(); }
    else if (b.dataset.play !== undefined) {
      const i = +b.dataset.play;
      const t = alternar(`${r.id}:${i}`, r.pasos[i].min * 60, `${r.nombre[idioma]} · ${u('paso', 'step')} ${i + 1}`);
      if (t.corriendo) pedirPermisoDeAviso();          // una sola vez: para avisar aunque la app quede en segundo plano
      cron(i); main.querySelector(`[data-play="${i}"]`).focus();
    } else if (b.dataset.reset !== undefined) { const i = +b.dataset.reset; reiniciar(`${r.id}:${i}`, r.pasos[i].min * 60); cron(i); }
    else if (b.hasAttribute('data-terminar')) terminar();
  };
  main.onchange = (e) => {
    const c = e.target.closest('[data-paso]'); if (!c) return;
    const i = +c.dataset.paso, antes = !!reg.pasos[i]; reg.pasos[i] = c.checked; guardar();
    c.closest('.paso').classList.toggle('hecho', c.checked);
    if (c.checked && !antes) { ganarXP(2); evento('pasos'); sonido.tic(); }
    if (r.pasos.every((_, k) => reg.pasos[k]) && !reg.hecha) terminar();
  };
  // cuando un cronómetro termina (lo vigila cronometros.js, también fuera de esta pantalla) se repinta su paso
  const alTerminar = (e) => { const [id, i] = e.detail.k.split(':'); if (id === r.id) cron(+i); };
  addEventListener('cronometro-fin', alTerminar);
  pintar(); tic = setInterval(tick, 500);
  return () => { clearInterval(tic); removeEventListener('cronometro-fin', alTerminar); main.onclick = main.onchange = null; bloqueo?.release?.().catch(() => {}); document.getElementById('ld-receta')?.remove(); };
}
