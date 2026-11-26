// Lección: relato de Granma → palabras → 5 ejercicios → consejo del Abuelo → resultado.
import { porraHTML, fiesta } from '../porras.js';
import { estado, guardar, u, tratar, tgt, nat, Ln, Lt, ganarXP, evento, sinEnergia, marcarRepetir, limpiarRepetir, tocaRepetir } from '../state.js';
import { sinEnergiaHTML } from './sin-energia.js';
import { historiaDe, mapaDe, recetas as cargarRecetas } from '../datos.js';
import { ejerciciosDeCapitulo, jugar } from '../ejercicios.js';
import { pj } from '../personajes.js';
import { esc, resaltar, mmss } from '../util.js';
import { confeti, hablar } from '../fx.js';
import { sonido } from '../sound.js';

export async function montar(main, { args }) {
  const S = estado(), id = +args[0] || 1, h = await historiaDe(id), cap = h.capitulos.find((c) => c.id === id);
  // Historia 2 («Granma a los 25») es sobria: sin tortillas ni gritos; su mapa vive en #/historia/2
  const sobria = !!h.sobria, mapa = mapaDe(h), num = h.capitulos.indexOf(cap) + 1;
  if (!cap) { location.hash = '#/historia'; return; }
  if (num > 1 && !S.caps[id - 1]?.hecho && !S.caps[id]?.hecho) { location.hash = mapa; return; }
  const T = tgt(), N = nat();
  const propias = cap.palabrasInteres?.[S.perfil.interes] || [];
  const INTERES = { trabajo: ['el trabajo', 'work'], amigos: ['amigos y conversación', 'friends and conversation'], biblia: ['Biblia y fe', 'Bible and faith'], viajes: ['viajes', 'travel'], cocina: ['la cocina', 'cooking'] }[S.perfil.interes] || ['tu interés', 'your interest'];
  const boton = (txt, accion, cls = '') => `<div class="mt2"><button class="btn grande ${cls}" data-accion="${accion}">${txt}</button></div>`;
  let activo = true;

  function relato() {
    const repetir = S.repetir?.cap === id && tocaRepetir();
    main.innerHTML = `${repetir ? `<div class="tarjeta crema2" role="status">🔁 ${u('Hoy repetimos esta lección con calma, para no perder el hilo.', 'Today we repeat this lesson calmly, so the thread is not lost.')}</div>` : ''}<p class="etiqueta">${u('Capítulo', 'Chapter')} ${num} / ${h.capitulos.length}</p><h1>${esc(Lt(cap.titulo))}</h1><p class="muted" lang="${N}">${esc(Ln(cap.titulo))}</p>
      ${cap.relato[T].map((p, i) => `<div class="dialogo ${i % 2 ? 'der' : ''}">${pj('granma', i === 0 ? 'contento' : i === cap.relato[T].length - 1 ? 'aplaudiendo' : 'pensando', { ancho: 78 })}<div class="globo"><p class="bilingue"><span class="l1" lang="${T}">${esc(p)}</span> <button class="btn-icono" data-voz="${i}" aria-label="${u('Escuchar', 'Listen')}">🔊</button><br><span class="l2" lang="${N}">${esc(cap.relato[N][i])}</span></p></div></div>`).join('')}
      <p class="pista-glosa"><span aria-hidden="true">👆</span> ${u('Toca cualquier palabra en inglés para ver qué significa.', 'Tap any Spanish word to see what it means.')}</p>
      ${cap.versiculo ? '<div data-versiculo></div>' : ''}
      ${boton(u('Ver las palabras nuevas', 'See the new words'), 'palabras')}`;
    if (cap.versiculo) versiculo(cap.versiculo);
  }
  // El versículo del capítulo: texto exacto de dominio público (RV1909 y KJV), en una tarjeta sobria. No es ejercicio ni juego.
  async function versiculo(ref) {
    const caja = () => main.querySelector('[data-versiculo]'), cita = `${ref.cap}:${ref.desde}${ref.hasta && ref.hasta !== ref.desde ? '-' + ref.hasta : ''}`;
    try {
      const [{ getPassage, listBooks }] = await Promise.all([import('../biblia/provider.js')]);
      const V = { es: 'rv1909', en: 'kjv' }, NOMBRE = { rv1909: 'Reina-Valera 1909', kjv: 'King James Version' };
      const [libros, pT, pN] = await Promise.all([listBooks(V[T]), getPassage(V[T], ref), getPassage(V[N], ref)]);
      const libro = libros.find((l) => l.id === ref.libro), txt = (p) => p.versos.map((v) => v.t).join(' ');
      if (!activo || !caja()) return;
      caja().innerHTML = `<section class="tarjeta versiculo" aria-label="${u('Versículo', 'Verse')}"><p class="etiqueta">${esc(libro[T])} ${cita}</p>
        <div class="versos"><p lang="${T}">${esc(txt(pT))}</p></div><p class="muted" lang="${N}">${esc(txt(pN))}</p>
        <p class="muted chico">${NOMBRE[V[T]]} · ${NOMBRE[V[N]]} (${u('dominio público', 'public domain')})</p></section>`;
    } catch {
      if (activo && caja()) caja().innerHTML = `<section class="tarjeta versiculo"><p class="muted">${u('El versículo de este capítulo se lee con la Biblia descargada.', 'This chapter\'s verse needs the Bible downloaded.')} <a href="#/descargas">${u('Ir a Descargas', 'Go to Downloads')}</a></p></section>`;
    }
  }
  function palabras() {
    main.innerHTML = `<h1>${u('Palabras nuevas', 'New words')}</h1><p class="muted">${u('Toca 🔊 para escucharlas.', 'Tap 🔊 to hear them.')}</p>
      <ul style="list-style:none;padding:0;margin:0">${cap.palabras.map((p, i) => `<li class="tarjeta" style="display:flex;align-items:center;gap:10px;margin-bottom:8px;padding:10px 14px"><button class="btn-icono" data-vozp="${i}" aria-label="${u('Escuchar', 'Listen')} ${esc(p[T])}">🔊</button><div style="flex:1"><strong lang="${T}">${esc(p[T])}</strong><br><span class="muted" lang="${N}">${esc(p[N])}</span></div></li>`).join('')}</ul>
      ${propias.length ? `<h2 class="mt2">${u(`Tus palabras de ${INTERES[0]}`, `Your words for ${INTERES[1]}`)}</h2><p class="muted">${u('Las elegí pensando en lo que te interesa, mijo.', 'I chose them thinking of what interests you, mijo.')}</p>
      <ul style="list-style:none;padding:0;margin:0">${propias.map((p, i) => `<li class="tarjeta crema2" style="display:flex;align-items:center;gap:10px;margin-bottom:8px;padding:10px 14px"><button class="btn-icono" data-vozx="${i}" aria-label="${u('Escuchar', 'Listen')} ${esc(p[T])}">🔊</button><div style="flex:1"><strong lang="${T}">${esc(p[T])}</strong> <span class="muted" lang="${N}">= ${esc(p[N])}</span><br><span lang="${T}">${esc(p.f[T])}</span><br><span class="muted" lang="${N}">${esc(p.f[N])}</span></div></li>`).join('')}</ul>` : ''}
      ${boton(u('¡A practicar!', 'Let\'s practice!'), 'ejercicios')}`;
    if (!S.caps[id]?.palabras) { S.caps[id] = { ...(S.caps[id] || {}), palabras: true }; guardar(); evento('palabras', cap.palabras.length + propias.length); }
  }
  async function ejercicios() {
    if (sinEnergia()) return sinVidas(false);
    const items = ejerciciosDeCapitulo(cap, S.perfil.interes);
    main.innerHTML = '<div id="juego"></div>';
    const r = await jugar(main.querySelector('#juego'), items, { usarVidas: true });
    if (!activo) return;
    if (r.salio) { location.hash = mapa; return; }
    if (r.sinVidas) return sinVidas(true);
    resultado = r; consejo();
  }
  // Más de 10 errores hoy: se acabó la energía. Esta lección queda para repetirse mañana (así no se pierde el hilo).
  function sinVidas(aqui) {
    if (aqui) marcarRepetir({ cap: id, titulo: Ln(cap.titulo) });
    main.innerHTML = sinEnergiaHTML(Ln(cap.titulo));
  }
  let resultado = { aciertos: 0, errores: 0 };
  // Cierre de los capítulos de la Historia 2: Granma agradece con calma (sin porra ni tortillas)
  const cierreSobrio = () => `<div class="dialogo" data-premio><div class="globo"><span class="quien">Granma</span><p class="bilingue"><span class="l1 premio" lang="${N}">${u('Gracias por escucharme, mijo. Te ganaste un cafecito conmigo.', 'Thank you for listening, mijo. You earned a little coffee with me.')}</span><br><span class="l2" lang="${T}">${tratar(T === 'en' ? 'Thank you for listening, mijo. You earned a little coffee with me.' : 'Gracias por escucharme, mijo. Te ganaste un cafecito conmigo.')}</span></p></div></div>`;
  function consejo() {
    const c = cap.consejo, claves = c.clave;
    main.innerHTML = `<h1>${u('El consejo del Abuelo', 'Grandpa\'s advice')}</h1>
      <div class="dialogo der">${pj('abuelo', 'aconsejando', { ancho: 120 })}<div class="globo abuelo"><span class="quien">${u('El Abuelo', 'Grandpa')}</span>
        <p class="bilingue"><span class="l1" lang="${T}" style="font-size:1.15rem">${resaltar(c[T], claves.map((k) => k[T]))}</span> <button class="btn-icono" data-vozc aria-label="${u('Escuchar', 'Listen')}">🔊</button><br><span class="l2" lang="${N}">${resaltar(c[N], claves.map((k) => k[N]))}</span></p></div></div>
      <div class="tarjeta"><h2>${u('Palabras clave', 'Key words')}</h2><ul>${claves.map((k) => `<li><mark class="clave" lang="${T}">${esc(k[T])}</mark> = ${esc(k[N])}</li>`).join('')}</ul></div>
      ${boton(u('Terminar capítulo', 'Finish chapter'), 'fin', 'verde')}`;
  }
  async function fin() {
    const mejor = resultado.mejorRacha || 0, premio = mejor >= 3 ? mejor * 2 : 0;
    const primera = !S.caps[id]?.hecho, xp = 20 + resultado.aciertos * 8 + premio;
    const estrellas = resultado.errores === 0 ? 3 : resultado.errores <= 2 ? 2 : 1;
    S.caps[id] = { ...(S.caps[id] || {}), hecho: true, aciertos: resultado.aciertos, errores: resultado.errores, estrellas: Math.max(estrellas, S.caps[id]?.estrellas || 0) }; guardar();
    if (S.repetir?.cap === id) limpiarRepetir();
    if (primera) { ganarXP(xp); evento('lecciones'); } else ganarXP(5);
    S.stats.kilos = (S.stats.kilos || 0) + 1; guardar();
    sonido.logro(); if (!sobria) confeti(40);
    const sig = h.capitulos.find((c) => c.id === id + 1), todos = h.id === 'historia-1' && h.capitulos.every((c) => S.caps[c.id]?.hecho);
    let rec = null; try { rec = (await cargarRecetas()).find((r) => r.id === cap.receta); } catch { /* receta sin descargar */ }
    main.innerHTML = `<div class="centro"><div class="pareja">${pj('granma', 'aplaudiendo', { ancho: 140, clase: 'anim-aplaude' })}${pj('abuelo', 'contento', { ancho: 112, clase: 'anim-asiente' })}</div><h1>${u('¡Capítulo terminado!', 'Chapter complete!')}</h1>
      ${sobria ? cierreSobrio() : porraHTML('tortillas', { conPj: false })}
      <p class="estrellas" role="img" aria-label="${estrellas} ${u('de 3 estrellas', 'of 3 stars')}">${'⭐'.repeat(estrellas)}${'☆'.repeat(3 - estrellas)}</p>
      <p>${u('Aciertos', 'Correct')}: <strong>${resultado.aciertos}</strong> · ${u('Intentos fallidos', 'Missed')}: <strong>${resultado.errores}</strong>${mejor >= 3 ? ` · 🔥 ${u('Mejor racha', 'Best streak')}: <strong>${mejor}</strong>` : ''}</p><p class="estrella">+${primera ? xp : 5} XP</p></div>
      ${rec ? `<div class="tarjeta crema2"><h2>🍲 ${u('Ahora, a cocinar', 'Now, let\'s cook')}</h2><p>${esc(Ln(rec.nombre))} — ${esc(Ln(rec.resumen))}</p><a class="btn olla" href="#/receta/${rec.id}">${u('Ver la receta', 'See the recipe')}</a></div>` : ''}
      ${todos ? `<div class="tarjeta verde"><h2>🏆 ${u('¡Terminaste la Historia 1!', 'You finished Story 1!')}</h2><p>${u('Tu Constancia Granma está lista.', 'Your Granma Certificate is ready.')}</p><a class="btn olla" href="#/perfil">${u('Ver mi constancia', 'See my certificate')}</a></div>` : sig ? `<a class="btn grande" href="#/leccion/${sig.id}">${u('Siguiente capítulo', 'Next chapter')} →</a>` : ''}
      <a class="btn grande olla mt" href="#/prueba/${id}">⭐ ${u('Haz la prueba de lo aprendido', 'Take the quiz on what you learned')}</a>
      <p class="mt"><a class="btn sec" href="${mapa}">${u('Volver al mapa', 'Back to the map')}</a></p>`;
    // Modo fiesta: Granma avienta las tortillas hacia la persona, con confeti tricolor
    if (!sobria) fiesta(main, '.pareja .pj');
  }

  main.onclick = (e) => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.accion === 'palabras') palabras();
    else if (b.dataset.accion === 'ejercicios') ejercicios();
    else if (b.dataset.accion === 'fin') fin();
    else if (b.dataset.voz) hablar(cap.relato[T][+b.dataset.voz], T);
    else if (b.dataset.vozp) hablar(cap.palabras[+b.dataset.vozp][T], T);
    else if (b.dataset.vozx) hablar(propias[+b.dataset.vozx].f[T], T);
    else if (b.hasAttribute('data-vozc')) hablar(cap.consejo[T], T, 'abuelo');
    if (b.dataset.accion) scrollTo({ top: 0 });
  };
  relato();
  return () => { activo = false; main.onclick = null; };
}
