// Onboarding en 4 pasos + bienvenida: idioma, trato («mijo» o «mija»), interés y cocina. Granma saluda y el Abuelo da el primer consejo.
import { estado, guardar, u, nat, tratarComo } from '../state.js';
import { pj } from '../personajes.js';
import { esc } from '../util.js';
import { sonido } from '../sound.js';
import { logoVapor } from '../../assets/animaciones/index.js';

const INTERESES = [['trabajo', '💼', 'Trabajo', 'Work'], ['amigos', '💬', 'Amigos y conversación', 'Friends and conversation'], ['biblia', '📖', 'Biblia y fe', 'Bible and faith'], ['viajes', '✈️', 'Viajes', 'Travel'], ['cocina', '🍲', 'Cocina', 'Cooking']];

export function montar(main) {
  const S = estado(); let paso = S.perfil.listo ? 1 : 0; const sel = { ...S.perfil };
  const puntos = () => `<div class="pasos-onb" role="img" aria-label="${paso + 1} / 4">${[0, 1, 2, 3].map((i) => `<i class="${i <= paso ? 'on' : ''}"></i>`).join('')}</div>`;
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
      // Cómo le dice Granma: no se pregunta nada personal, solo qué palabra de cariño le gusta. Se puede dejar «como salga».
      main.innerHTML = `${puntos()}<div class="centro">${pj('granma', 'carinosa', { ancho: 120 })}</div><h1>${ui('¿Cómo quieres que te diga Granma?', 'What should Granma call you?')}</h1>
        <p class="muted">${sel.aprende === 'es' ? 'Granma calls everyone she loves "mijo" (like a son) or "mija" (like a daughter). Choose the one you like.' : 'Granma le dice «mijo» o «mija» a toda la gente que quiere. Escoge la que te guste.'}</p>
        <button class="opcion-grande" data-trato="mijo" aria-pressed="${sel.trato === 'mijo'}"><span class="emoji">👨</span><span>Mijo<br><small class="muted">${sel.aprende === 'es' ? 'like a son' : 'como a un hijo'}</small></span></button>
        <button class="opcion-grande" data-trato="mija" aria-pressed="${sel.trato === 'mija'}"><span class="emoji">👩</span><span>Mija<br><small class="muted">${sel.aprende === 'es' ? 'like a daughter' : 'como a una hija'}</small></span></button>
        <button class="opcion-grande" data-trato="" aria-pressed="${sel.trato === ''}"><span class="emoji">🤗</span><span>${sel.aprende === 'es' ? 'Either one is fine' : 'Como salga, de las dos formas'}</span></button>
        <div class="fila">${S.perfil.listo ? '' : `<button class="btn sec" data-atras>${ui('Atrás', 'Back')}</button>`}<button class="btn" data-sig ${sel.trato === undefined || sel.trato === null ? 'disabled' : ''}>${ui('Continuar', 'Continue')}</button></div>`;
    } else if (paso === 2) {
      main.innerHTML = `${puntos()}<h1>${ui('¿Qué te interesa más?', 'What interests you most?')}</h1><p class="muted">${ui('Cambia las palabras y los ejemplos de tus ejercicios.', 'It changes the words and examples in your exercises.')}</p>
        ${INTERESES.map(([id, e, es, en]) => `<button class="opcion-grande" data-interes="${id}" aria-pressed="${sel.interes === id}"><span class="emoji">${e}</span><span>${ui(es, en)}</span></button>`).join('')}
        <div class="fila"><button class="btn sec" data-atras>${ui('Atrás', 'Back')}</button><button class="btn" data-sig ${sel.interes ? '' : 'disabled'}>${ui('Continuar', 'Continue')}</button></div>`;
    } else if (paso === 3) {
      main.innerHTML = `${puntos()}<h1>${ui('¿Qué cocina quieres?', 'Which cuisine do you want?')}</h1>
        <button class="opcion-grande" data-cocina="mexicana" aria-pressed="${sel.cocina === 'mexicana'}"><span class="emoji">🌮</span><span>${ui('Mexicana', 'Mexican')}</span></button>
        <button class="opcion-grande" disabled aria-disabled="true"><span class="emoji">🍝</span><span>${ui('Italiana', 'Italian')} <span class="etiqueta">${ui('próximamente', 'coming soon')}</span></span></button>
        <div class="fila"><button class="btn sec" data-atras>${ui('Atrás', 'Back')}</button><button class="btn" data-sig ${sel.cocina ? '' : 'disabled'}>${ui('¡Listo!', 'Done!')}</button></div>`;
    } else {
      main.innerHTML = `<div class="dialogo">${pj('granma', 'carinosa', { clase: 'anim-aplaude' })}<div class="globo"><span class="quien">Granma</span><p class="bilingue"><span class="l1">${ui('¡Bienvenido, mijo! Qué gusto tenerte en mi cocina. Vamos a aprender juntos, con calma y con sabor.', 'Welcome, mijo! So happy to have you in my kitchen. We will learn together, calmly and with flavor.')}</span></p></div></div>
        <div class="dialogo der">${pj('abuelo', 'aconsejando')}<div class="globo abuelo"><span class="quien">${ui('El Abuelo', 'Grandpa')}</span><p class="bilingue"><span class="l1">${ui('Quien persevera, alcanza.', 'Whoever perseveres, achieves.')}</span></p></div></div>
        <button class="btn grande" data-empezar>${ui('¡Empezar!', 'Let\'s start!')}</button>`;
    }
    main.querySelector('button:not([disabled])')?.focus?.();
  }
  main.onclick = (e) => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.aprende) { sel.aprende = b.dataset.aprende; pintar(); }
    else if (b.dataset.trato !== undefined) { sel.trato = b.dataset.trato; pintar(); }
    else if (b.dataset.interes) { sel.interes = b.dataset.interes; pintar(); }
    else if (b.dataset.cocina) { sel.cocina = b.dataset.cocina; pintar(); }
    else if (b.hasAttribute('data-sig')) { paso++; pintar(); }
    else if (b.hasAttribute('data-atras')) { paso--; pintar(); }
    else if (b.hasAttribute('data-empezar')) {
      const cambioTrato = S.perfil.listo && (S.perfil.trato || '') !== (sel.trato || '');
      Object.assign(S.perfil, sel, { listo: true }); guardar(); sonido.ok(); location.hash = '#/';
      if (cambioTrato) location.reload();   // el contenido ya cargado se vuelve a leer con el trato nuevo
    }
  };
  pintar();
  return () => { main.onclick = null; };
}
