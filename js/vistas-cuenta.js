// Tarjeta «Tu cuenta» del perfil: entrar con Google para guardar el avance, guardar ahora, salir o borrar la cuenta.
// Solo aparece cuando el servidor tiene configurada la app de Google (GOOGLE_CLIENT_ID).
import { estado, u } from './state.js';
import { configCuenta, cuentaConectada, entrarConGoogle, subirProgreso, salirDeLaCuenta, borrarCuenta } from './cuenta.js';

const G = '<svg width="20" height="20" viewBox="0 0 48 48" aria-hidden="true"><path fill="#EA4335" d="M24 9.5c3.5 0 6.6 1.2 9.1 3.6l6.8-6.8C35.8 2.4 30.3 0 24 0 14.6 0 6.6 5.4 2.7 13.3l7.9 6.1C12.5 13.6 17.8 9.5 24 9.5z"/><path fill="#4285F4" d="M46.5 24.5c0-1.6-.1-3.1-.4-4.5H24v9h12.7c-.6 3-2.3 5.5-4.8 7.2l7.7 6c4.5-4.2 6.9-10.3 6.9-17.7z"/><path fill="#FBBC05" d="M10.6 28.6c-.5-1.4-.8-3-.8-4.6s.3-3.2.8-4.6l-7.9-6.1C1 16.6 0 20.2 0 24s1 7.4 2.7 10.7l7.9-6.1z"/><path fill="#34A853" d="M24 48c6.5 0 11.9-2.1 15.9-5.8l-7.7-6c-2.2 1.5-5 2.3-8.2 2.3-6.2 0-11.5-4.1-13.4-9.9l-7.9 6.1C6.6 42.6 14.6 48 24 48z"/></svg>';
const cuando = (t) => { if (!t) return ''; const m = Math.round((Date.now() - t) / 60000); return m < 1 ? u('hace un momento', 'just now') : m < 60 ? u(`hace ${m} min`, `${m} min ago`) : new Date(t).toLocaleString(u('es-MX', 'en-US'), { dateStyle: 'medium', timeStyle: 'short' }); };

export async function conectarCuenta(caja) {
  if (!caja || !(await configCuenta())) return;               // sin la app de Google configurada, no se muestra nada
  let aviso = /cuenta=lista/.test(location.hash) ? u('✓ ¡Listo! Tu avance ya está en tu cuenta.', '✓ Done! Your progress is now in your account.') : '';
  function pintar() {
    if (!caja.isConnected) return;
    const c = estado().cuenta, si = cuentaConectada();
    caja.hidden = false;
    caja.innerHTML = `<h2 class="mt2">☁️ ${u('Tu cuenta', 'Your account')}</h2><div class="tarjeta cuenta">
      ${si ? `<p class="estado ok">✓ ${u('Tu avance se guarda en tu cuenta de Google.', 'Your progress is saved in your Google account.')}</p>
          <p class="muted chico">${c.pendiente ? u('Hay cambios por guardar; se guardan solos cuando haya internet.', 'There are changes to save; they save by themselves when there is internet.') : `${u('Último guardado', 'Last saved')}: ${cuando(c.ultimo || c.sincronizado)}`}</p>
          <div class="fila"><button class="btn sec" data-c="guardar">${u('Guardar ahora', 'Save now')}</button><button class="btn sec" data-c="salir">${u('Salir de la cuenta en este teléfono', 'Sign out on this phone')}</button></div>
          <button class="btn-liga" data-c="borrar">${u('Borrar mi cuenta y mi avance guardado', 'Delete my account and saved progress')}</button>`
        : `${c && !c.conectada ? `<p class="estado">${u('Se cerró tu sesión. Vuelve a entrar para seguir guardando tu avance.', 'Your session ended. Sign in again to keep saving your progress.')}</p>` : ''}
          <p>${u('Entra con tu cuenta de Google para no perder tu avance si cambias de teléfono, y para seguir en otro.', 'Sign in with your Google account so you do not lose your progress if you change phones, and to continue on another one.')}</p>
          <button class="btn-google" data-c="entrar">${G}<span>${u('Entrar con Google', 'Sign in with Google')}</span></button>
          <p class="muted chico">${u('Es opcional. Google solo nos confirma que eres tú: no nos da tu correo ni tu nombre. Las cuentas de Google son para mayores de 13 años; los niños, con la cuenta y el permiso de un adulto.', 'It is optional. Google only confirms it is you: it does not give us your email or name. Google accounts are for ages 13 and up; children, with an adult\'s account and permission.')}</p>`}
      ${aviso ? `<p class="aviso-local" role="status">${aviso}</p>` : ''}</div>`;
  }
  caja.addEventListener('click', async (e) => {
    const b = e.target.closest('[data-c]'); if (!b) return; b.disabled = true; const q = b.dataset.c;
    if (q === 'entrar') { if (!(await entrarConGoogle())) { aviso = u('No pude abrir Google ahora. Inténtalo más tarde.', 'I could not open Google now. Try later.'); } else return; }
    else if (q === 'guardar') aviso = (await subirProgreso()) ? u('✓ Guardado.', '✓ Saved.') : u('No pude guardar ahora. Revisa tu internet.', 'I could not save now. Check your internet.');
    else if (q === 'salir') { await salirDeLaCuenta(); aviso = u('Saliste de tu cuenta en este teléfono. Tu avance sigue aquí y también en tu cuenta.', 'You signed out on this phone. Your progress stays here and in your account.'); }
    else if (q === 'borrar') {
      if (!confirm(u('¿Seguro? Se borra tu cuenta y el avance guardado en ella. En este teléfono tu avance se queda.', 'Sure? Your account and the progress saved in it will be deleted. Your progress stays on this phone.'))) { b.disabled = false; return; }
      aviso = (await borrarCuenta()) ? u('Listo: tu cuenta y su avance se borraron del servidor.', 'Done: your account and its progress were deleted from the server.') : u('No pude borrarla ahora. Revisa tu internet e inténtalo otra vez.', 'I could not delete it now. Check your internet and try again.');
    }
    pintar();
  });
  pintar();
}
