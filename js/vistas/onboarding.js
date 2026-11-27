// Onboarding: idioma → aviso de privacidad y términos (se aceptan) → trato («mijo» o «mija») → interés → cocina → avisos de Granma (opcionales)
// → bienvenida. Con #/onboarding?aceptar (quien ya jugaba y cambió el aviso) solo se muestra el paso de aceptar.
import { estado, guardar, u, nat, tratarComo } from '../state.js';
import { pj } from '../personajes.js';
import { esc } from '../util.js';
import { sonido } from '../sound.js';
import { logoVapor } from '../../assets/animaciones/index.js';
import { VERSION_LEGAL, avisoHTML, terminosHTML, resumen } from '../legal.js';
import { recordatoriosDisponibles, activarAviso, horaBonita, diasBonitos, SUGERIDO, guardarDatosDelAviso } from '../recordatorios.js';

const INTERESES = [['trabajo', '💼', 'Trabajo', 'Work'], ['amigos', '💬', 'Amigos y conversación', 'Friends and conversation'], ['biblia', '📖', 'Biblia y fe', 'Bible and faith'], ['viajes', '✈️', 'Viajes', 'Travel'], ['cocina', '🍲', 'Cocina', 'Cooking']];

export function montar(main) {
  const S = estado(), soloAceptar = S.perfil.listo && /aceptar/.test(location.hash), cambiar = S.perfil.listo && !soloAceptar;
  let paso = soloAceptar ? 1 : cambiar ? 2 : 0, acepta = false, quiere = { practicar: false, clase: false }, resultado = '';
  const sel = { ...S.perfil };
  const puntos = () => soloAceptar ? '' : `<div class="pasos-onb" role="img" aria-label="${paso + 1} / 6">${[0, 1, 2, 3, 4, 5].map((i) => `<i class="${i <= paso ? 'on' : ''}"></i>`).join('')}</div>`;
  function pintar() {
    const ui = (es, en) => tratarComo(sel.aprende === 'es' ? en : es, sel.trato);   // interfaz en el idioma nativo (si ya eligió), con su trato
    if (paso === 0) {
      main.innerHTML = `<div class="centro">${pj('granma', 'contento', { ancho: 170, clase: 'anim-flota' })}</div>
        <div class="centro">${logoVapor(96, 'Granma Sazón')}</div><h1 class="centro">Granma Sazón</h1><p class="centro muted">Recetas de México para el mundo · Recipes from Mexico to the world</p>${puntos()}
        <h2 class="centro">¿Qué idioma quieres aprender? <small class="muted">· Which language do you want to learn?</small></h2>
        <button class="opcion-grande" data-aprende="en" aria-pressed="${sel.aprende === 'en'}"><span class="emoji">🇺🇸</span><span>Inglés<br><small class="muted">English · lo explico en español</small></span></button>
        <button class="opcion-grande" data-aprende="es" aria-pressed="${sel.aprende === 'es'}"><span class="emoji">🇲🇽</span><span>Español<br><small class="muted">Spanish · I explain in English</small></span></button>
        <button class="btn grande" data-sig ${sel.aprende ? '' : 'disabled'}>Continuar · Continue</button>`;
    } else if (paso === 1) {
      // Aviso de privacidad y términos: lo esencial a la vista, el texto completo a un toque, y una casilla que hay que marcar.
      const es = sel.aprende !== 'es', idioma = es ? 'es' : 'en';
      main.innerHTML = `${puntos()}<h1>${soloAceptar ? ui('Actualizamos el aviso de privacidad', 'We updated the privacy notice') : ui('Antes de empezar', 'Before we start')}</h1>
        <p class="muted">${ui('Léelo con calma, mijo. Si eres menor de edad, léelo con tu papá, tu mamá o la persona que te cuida.', 'Read it calmly, mijo. If you are a minor, read it with your mom, your dad or the person who takes care of you.')}</p>
        <ul class="resumen-legal">${resumen(es).map((r) => `<li>${r}</li>`).join('')}</ul>
        <details class="tarjeta legal"><summary>📄 ${ui('Leer el aviso de privacidad completo', 'Read the full privacy notice')}</summary>${avisoHTML(idioma)}</details>
        <details class="tarjeta legal"><summary>📄 ${ui('Leer los términos de uso', 'Read the terms of use')}</summary>${terminosHTML(idioma)}</details>
        <label class="acepto"><input type="checkbox" data-acepto ${acepta ? 'checked' : ''}><span>${ui('Leí y acepto el aviso de privacidad y los términos de uso.', 'I have read and accept the privacy notice and the terms of use.')}</span></label>
        <div class="fila">${soloAceptar ? '' : `<button class="btn sec" data-atras>${ui('Atrás', 'Back')}</button>`}<button class="btn" data-sig ${acepta ? '' : 'disabled'}>${soloAceptar ? ui('Aceptar y seguir jugando', 'Accept and keep playing') : ui('Aceptar y continuar', 'Accept and continue')}</button></div>`;
    } else if (paso === 2) {
      // Cómo le dice Granma: no se pregunta nada personal, solo qué palabra de cariño le gusta. Se puede dejar «como salga».
      main.innerHTML = `${puntos()}<div class="centro">${pj('granma', 'carinosa', { ancho: 120 })}</div><h1>${ui('¿Cómo quieres que te diga Granma?', 'What should Granma call you?')}</h1>
        <p class="muted">${sel.aprende === 'es' ? 'Granma calls everyone she loves "mijo" (like a son) or "mija" (like a daughter). Choose the one you like.' : 'Granma le dice «mijo» o «mija» a toda la gente que quiere. Escoge la que te guste.'}</p>
        <button class="opcion-grande" data-trato="mijo" aria-pressed="${sel.trato === 'mijo'}"><span class="emoji">👨</span><span>Mijo<br><small class="muted">${sel.aprende === 'es' ? 'like a son' : 'como a un hijo'}</small></span></button>
        <button class="opcion-grande" data-trato="mija" aria-pressed="${sel.trato === 'mija'}"><span class="emoji">👩</span><span>Mija<br><small class="muted">${sel.aprende === 'es' ? 'like a daughter' : 'como a una hija'}</small></span></button>
        <button class="opcion-grande" data-trato="" aria-pressed="${sel.trato === ''}"><span class="emoji">🤗</span><span>${sel.aprende === 'es' ? 'Either one is fine' : 'Como salga, de las dos formas'}</span></button>
        <div class="fila">${cambiar ? '' : `<button class="btn sec" data-atras>${ui('Atrás', 'Back')}</button>`}<button class="btn" data-sig ${sel.trato === undefined || sel.trato === null ? 'disabled' : ''}>${ui('Continuar', 'Continue')}</button></div>`;
    } else if (paso === 3) {
      main.innerHTML = `${puntos()}<h1>${ui('¿Qué te interesa más?', 'What interests you most?')}</h1><p class="muted">${ui('Cambia las palabras y los ejemplos de tus ejercicios.', 'It changes the words and examples in your exercises.')}</p>
        ${INTERESES.map(([id, e, es, en]) => `<button class="opcion-grande" data-interes="${id}" aria-pressed="${sel.interes === id}"><span class="emoji">${e}</span><span>${ui(es, en)}</span></button>`).join('')}
        <div class="fila"><button class="btn sec" data-atras>${ui('Atrás', 'Back')}</button><button class="btn" data-sig ${sel.interes ? '' : 'disabled'}>${ui('Continuar', 'Continue')}</button></div>`;
    } else if (paso === 4) {
      main.innerHTML = `${puntos()}<h1>${ui('¿Qué cocina quieres?', 'Which cuisine do you want?')}</h1>
        <button class="opcion-grande" data-cocina="mexicana" aria-pressed="${sel.cocina === 'mexicana'}"><span class="emoji">🌮</span><span>${ui('Mexicana', 'Mexican')}</span></button>
        <button class="opcion-grande" disabled aria-disabled="true"><span class="emoji">🍝</span><span>${ui('Italiana', 'Italian')} <span class="etiqueta">${ui('próximamente', 'coming soon')}</span></span></button>
        <div class="fila"><button class="btn sec" data-atras>${ui('Atrás', 'Back')}</button><button class="btn" data-sig ${sel.cocina ? '' : 'disabled'}>${cambiar ? ui('¡Listo!', 'Done!') : ui('Continuar', 'Continue')}</button></div>`;
    } else if (paso === 5) {
      // Avisos de Granma: opcionales y sin marcar; se activan solo si la persona marca alguno y toca el botón (el teléfono pide permiso).
      const se = recordatoriosDisponibles(), linea = (t) => `${diasBonitos(SUGERIDO[t].dias, sel.aprende === 'es' ? 'en' : 'es')}, ${ui('a las', 'at')} ${horaBonita(SUGERIDO[t].hora, sel.aprende === 'es' ? 'en' : 'es')}`;
      main.innerHTML = `${puntos()}<div class="centro">${pj('granma', 'contenta', { ancho: 110 })}</div><h1>${ui('¿Quieres que Granma te avise?', 'Do you want Granma to remind you?')}</h1>
        <p class="muted">${ui('Es opcional. Puedes cambiar la hora, los días o quitarlos cuando quieras en Mi perfil.', 'It is optional. You can change the time, the days or turn them off any time in My profile.')}</p>
        ${se ? `<label class="opcion-grande aviso-opc"><input type="checkbox" data-quiere="practicar" ${quiere.practicar ? 'checked' : ''}><span><strong>⏰ ${ui('Recordatorio para practicar', 'Practice reminder')}</strong><br><small class="muted">${linea('practicar')}</small></span></label>
        <label class="opcion-grande aviso-opc"><input type="checkbox" data-quiere="clase" ${quiere.clase ? 'checked' : ''}><span><strong>👩‍🍳 ${ui('Te espero en clase', 'Waiting for you in class')}</strong><br><small class="muted">${linea('clase')}</small></span></label>
        ${resultado ? `<p class="aviso-local" role="status">${resultado}</p>` : ''}
        <div class="fila">${resultado ? `<button class="btn" data-sig>${ui('Continuar', 'Continue')}</button>` : `<button class="btn sec" data-sig>${ui('Ahora no', 'Not now')}</button><button class="btn verde" data-activar ${quiere.practicar || quiere.clase ? '' : 'disabled'}>${ui('Activar los que marqué', 'Turn on the ones I checked')}</button>`}</div>`
        : `<p class="tarjeta crema2">${/iphone|ipad|ipod/i.test(navigator.userAgent) ? ui('En iPhone, los avisos funcionan con la app en tu pantalla de inicio. Cuando la agregues, actívalos en Mi perfil.', 'On iPhone, notifications work with the app on your home screen. Once you add it, turn them on in My profile.') : ui('Este navegador no puede recibir avisos. Puedes jugar igual.', 'This browser cannot receive notifications. You can play anyway.')}</p><div class="fila"><button class="btn" data-sig>${ui('Continuar', 'Continue')}</button></div>`}`;
    } else {
      main.innerHTML = `<div class="dialogo">${pj('granma', 'carinosa', { clase: 'anim-aplaude' })}<div class="globo"><span class="quien">Granma</span><p class="bilingue"><span class="l1">${ui('¡Bienvenido, mijo! Qué gusto tenerte en mi cocina. Vamos a aprender juntos, con calma y con sabor.', 'Welcome, mijo! So happy to have you in my kitchen. We will learn together, calmly and with flavor.')}</span></p></div></div>
        <div class="dialogo der">${pj('abuelo', 'aconsejando')}<div class="globo abuelo"><span class="quien">${ui('El Abuelo', 'Grandpa')}</span><p class="bilingue"><span class="l1">${ui('Quien persevera, alcanza.', 'Whoever perseveres, achieves.')}</span></p></div></div>
        <button class="btn grande" data-empezar>${ui('¡Empezar!', 'Let\'s start!')}</button>`;
    }
    main.querySelector('button:not([disabled])')?.focus?.();
  }
  // La casilla de aceptar y las de avisos no son botones: se atienden aparte.
  main.onchange = (e) => {
    if (e.target.matches('[data-acepto]')) { acepta = e.target.checked; main.querySelector('[data-sig]').disabled = !acepta; }
    else if (e.target.dataset.quiere) { quiere[e.target.dataset.quiere] = e.target.checked; const a = main.querySelector('[data-activar]'); if (a) a.disabled = !(quiere.practicar || quiere.clase); }
  };
  const terminarCambio = () => { Object.assign(S.perfil, sel, { listo: true }); guardar(); location.hash = '#/'; location.reload(); };
  main.onclick = async (e) => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.aprende) { sel.aprende = b.dataset.aprende; pintar(); }
    else if (b.dataset.trato !== undefined) { sel.trato = b.dataset.trato; pintar(); }
    else if (b.dataset.interes) { sel.interes = b.dataset.interes; pintar(); }
    else if (b.dataset.cocina) { sel.cocina = b.dataset.cocina; pintar(); }
    else if (b.hasAttribute('data-sig')) {
      if (paso === 1) { sel.legal = S.perfil.legal = VERSION_LEGAL; sel.legalFecha = S.perfil.legalFecha = new Date().toISOString(); guardar(); if (soloAceptar) { location.hash = '#/'; return; } }   // queda anotado en el teléfono qué versión aceptó y cuándo
      if (paso === 4 && cambiar) return terminarCambio();   // desde Perfil («cambiar») no se repite lo de los avisos ni la bienvenida
      paso++; pintar(); scrollTo({ top: 0 });
    }
    else if (b.hasAttribute('data-activar')) {
      b.disabled = true; Object.assign(S.perfil, { aprende: sel.aprende, trato: sel.trato }); guardar();
      const hechos = [], fallas = [];
      for (const t of ['practicar', 'clase']) if (quiere[t]) { const r = await activarAviso(t, SUGERIDO[t].hora, SUGERIDO[t].dias); (r === 'ok' ? hechos : fallas).push(r); }
      const ui = (es, en) => tratarComo(sel.aprende === 'es' ? en : es, sel.trato);
      resultado = hechos.length && !fallas.length ? ui('¡Listo! Granma te avisará. Puedes cambiarlo en Mi perfil.', 'Done! Granma will remind you. You can change it in My profile.')
        : fallas.includes('bloqueado') || fallas.includes('sin-permiso') ? ui('No se permitieron los avisos. Puedes jugar igual y activarlos después en Mi perfil.', 'Notifications were not allowed. You can play anyway and turn them on later in My profile.')
        : ui('No pude activarlos ahora. Puedes intentarlo después en Mi perfil.', 'I could not turn them on now. You can try later in My profile.');
      pintar();
    }
    else if (b.hasAttribute('data-atras')) { paso--; pintar(); }
    else if (b.hasAttribute('data-empezar')) {
      const cambioTrato = S.perfil.listo && (S.perfil.trato || '') !== (sel.trato || '');
      Object.assign(S.perfil, sel, { listo: true }); guardar(); sonido.ok(); guardarDatosDelAviso(); location.hash = '#/';
      if (cambioTrato) location.reload();   // el contenido ya cargado se vuelve a leer con el trato nuevo
    }
  };
  pintar();
  return () => { main.onclick = null; main.onchange = null; };
}
