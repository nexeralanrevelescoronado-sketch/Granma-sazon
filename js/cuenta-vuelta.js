// /cuenta.html: aquí regresa Google después de que la persona elige su cuenta. Se abre la sesión, se junta el avance
// (si en la cuenta y en el teléfono hay avance, la persona escoge cuál usar) y se vuelve a la app.
import { estado, guardar, u, adoptar, tratar } from './state.js';
import { terminarEntrada, bajarProgreso, subirProgreso, tieneAvance, paraLaCuenta } from './cuenta.js';
import { pj } from './personajes.js';
import { esc } from './util.js';

const main = document.getElementById('main');
document.documentElement.lang = estado().perfil.aprende === 'es' ? 'en' : 'es';
const fragmento = location.hash;                             // se lee antes de limpiar la barra
history.replaceState(null, '', location.pathname);          // el token no se queda en la barra ni en el historial
const volver = (msg = '') => location.replace(`/#/perfil${msg ? '?cuenta=' + msg : ''}`);
const resumen = (p) => { const n = Object.values(p?.caps || {}).filter((x) => x?.hecho).length; return `${p?.xp || 0} XP · ${n} ${n === 1 ? u('capítulo', 'chapter') : u('capítulos', 'chapters')}`; };

function pantalla(html) { main.innerHTML = `<div class="dialogo">${pj('granma', 'carinosa', { ancho: 96 })}<div class="globo"><span class="quien">Granma</span>${tratar(html)}</div></div>`; }

const r = await terminarEntrada(fragmento);
if (!r.ok) {
  const txt = { cancelo: u('No entraste con tu cuenta. No pasa nada, mijo: tu avance sigue en este teléfono.', 'You did not sign in. No problem, mijo: your progress is still on this phone.'),
    vencio: u('Se tardó mucho la entrada. Inténtalo otra vez desde Mi perfil.', 'Signing in took too long. Try again from My profile.'),
    red: u('No hay internet para entrar ahora. Inténtalo más tarde.', 'There is no internet to sign in now. Try later.') }[r.motivo] || u('No pude abrir tu cuenta. Inténtalo otra vez desde Mi perfil.', 'I could not open your account. Try again from My profile.');
  pantalla(`<p>${txt}</p><p><a class="btn" href="/#/perfil">${u('Volver a la app', 'Back to the app')}</a></p>`);
} else {
  const d = r.tieneProgreso ? await bajarProgreso() : null, aqui = paraLaCuenta(), allá = d?.progreso;
  if (tieneAvance(allá) && tieneAvance(aqui) && JSON.stringify(allá) !== JSON.stringify(aqui)) {
    // hay avance en los dos lados: que la persona escoja (nunca se borra sin preguntar)
    pantalla(`<p><strong>${u('Ya tienes avance guardado en tu cuenta. ¿Cuál quieres usar, mijo?', 'You already have progress saved in your account. Which one do you want to use, mijo?')}</strong></p>
      <div class="modos"><button class="opcion modo" data-usar="cuenta"><span class="modo-ic" aria-hidden="true">☁️</span><span><strong>${u('El de mi cuenta', 'The one in my account')}</strong><br><small>${esc(resumen(allá))}</small></span></button>
      <button class="opcion modo" data-usar="telefono"><span class="modo-ic" aria-hidden="true">📱</span><span><strong>${u('El de este teléfono', 'The one on this phone')}</strong><br><small>${esc(resumen(aqui))}</small></span></button></div>
      <p class="muted chico">${u('El que no escojas se reemplaza.', 'The one you do not choose is replaced.')}</p>`);
    main.addEventListener('click', async (e) => {
      const b = e.target.closest('[data-usar]'); if (!b) return; main.querySelectorAll('button').forEach((x) => { x.disabled = true; });
      if (b.dataset.usar === 'cuenta') { const c = estado().cuenta; adoptar(allá); estado().cuenta = { ...c, sincronizado: d.actualizado, pendiente: false }; guardar(); volver('lista'); }
      else { await subirProgreso(); volver('lista'); }
    });
  } else if (tieneAvance(allá) && !tieneAvance(aqui)) { const c = estado().cuenta; adoptar(allá); estado().cuenta = { ...c, sincronizado: d.actualizado, pendiente: false }; guardar(); volver('lista'); }
  else { await subirProgreso(); volver('lista'); }
}
