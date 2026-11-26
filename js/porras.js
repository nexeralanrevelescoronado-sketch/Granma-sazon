// Porras de Granma: cada vez que la persona completa un área, Granma grita «¡Épale!», echa una porra, avienta
// tortillas (dos o tres se estrellan contra la pantalla) y anuncia el premio. Los textos siguen la voz de Granma:
// tierna, con «mijo/mija», siempre anima.
import { estado, guardar, u, tgt, nat } from './state.js';
import { pj } from './personajes.js';
import { sonido } from './sound.js';
import { vibrar } from './fx.js';
import { lluviaTortillas, confetiMexicano } from '../assets/animaciones/fiesta.js';
import { notaColoquial } from './coloquial.js';

export const PORRAS = [
  ['¡Épale, épale! ¡Eso, mijo!', 'Épale, épale! That is it, mijo!'],
  ['¡Épale! ¡Sí se pudo, sí se pudo!', 'Épale! Yes, you did it, yes, you did it!'],
  ['¡Épale, mija! ¡Qué bonito te salió!', 'Épale, mija! How lovely that turned out!'],
  ['¡A la bio, a la bao, a la bim, bom, ba! ¡Mijo, mijo, ra, ra, ra!', 'Hip, hip, hooray! Mijo, mijo, rah, rah, rah!'],
  ['¡Épale! ¡Eso es todo, mija, qué orgullo!', 'Épale! That is the way, mija, I am so proud!'],
  ['¡Ándale, ándale! ¡Épale, mijo, vas con todo!', 'Ándale, ándale! Épale, mijo, you are doing great!'],
];
export const PREMIOS = {
  tortillas: ['¡Te ganaste 1 kilo de tortillas hechas con mucho amor, mijo!', 'You earned 1 kilo of tortillas made with lots of love, mijo!'],
  taquitos: ['¡Te ganaste unos taquitos de barbacoa, mijo!', 'You earned some barbacoa tacos, mijo!'],
};

/** La porra que sigue (van en orden, para que no se repita la misma dos veces seguidas). */
export function porra() {
  const S = estado(), i = (S.stats.porras || 0) % PORRAS.length;
  S.stats.porras = (S.stats.porras || 0) + 1; guardar();
  return PORRAS[i];
}

/** El globo de Granma con la porra y el premio (lo dice en el idioma de la persona; abajo va en el que aprende) y, debajo, qué significan sus palabras coloquiales. */
export function porraHTML(premio = 'taquitos', { conPj = true } = {}) {
  const N = nat(), T = tgt(), [pEs, pEn] = porra(), [gEs, gEn] = PREMIOS[premio] || PREMIOS.taquitos;
  const en = `${pEn} ${gEn}`, es = `${pEs} ${gEs}`;
  return `<div class="dialogo" data-premio>${conPj ? pj('granma', 'aplaudiendo', { ancho: 84, clase: 'anim-aplaude' }) : ''}<div class="globo"><span class="quien">Granma</span><p class="bilingue"><span class="l1 premio" lang="${N}">${u(es, en)}</span><br><span class="l2" lang="${T}">${T === 'en' ? en : es}</span></p></div></div>${notaColoquial(es)}`;
}

/** La fiesta: tortillas desde Granma (2 o 3 se estrellan en la pantalla), confeti tricolor y el grito. Devuelve cómo cancelarla. */
export function fiesta(raiz, selector = '.pj') {
  const t = setTimeout(() => {
    if (!raiz.isConnected) return;
    lluviaTortillas(raiz.querySelector(selector), 16, 2 + (Math.random() < 0.5 ? 1 : 0), () => { sonido.plaf(); vibrar(35); });
    confetiMexicano(30); sonido.viva();
  }, 450);
  return () => clearTimeout(t);
}
