// «La app en tu teléfono»: versión y actualización, instalarla en la pantalla de inicio y dar los permisos,
// con un botón para cada cosa. Cada botón hace aparecer la autorización del propio teléfono: la app nunca la da por sí sola.
import { u } from './state.js';
import { esc } from './util.js';
import { buscarActualizacion, aplicarActualizacion, versionInstalada } from './actualizar.js';
import { avisosDisponibles, pedirPermisoDeAviso, notificar } from './cronometros.js';
import { pedirPersistencia, esPersistente } from './descargas.js';

export const esIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent);
export const instalada = () => { try { return matchMedia('(display-mode: standalone)').matches || navigator.standalone === true; } catch { return false; } };
export const permisoAvisos = () => { try { return avisosDisponibles() ? Notification.permission : 'sin'; } catch { return 'sin'; } };
/** ¿Falta instalarla o decidir sobre los avisos? (para invitar desde el inicio) */
export const faltaAlgo = () => !instalada() || permisoAvisos() === 'default';
async function permisoMicro() { try { return (await navigator.permissions.query({ name: 'microphone' })).state; } catch { return 'duda'; } }

export async function conectarPermisos(caja) {
  if (!caja) return;
  let aviso = '';
  const fila = (ico, titulo, estado, bien, cuerpo) => `<li><strong>${ico} ${titulo}</strong><span class="estado ${bien ? 'ok' : ''}">${estado}</span>${cuerpo}</li>`;
  async function pintar() {
    const app = await import('./app.js'), [version, micro, guardado] = await Promise.all([versionInstalada(), permisoMicro(), esPersistente()]), avisos = permisoAvisos(), puesta = instalada();
    if (!caja.isConnected) return;
    caja.innerHTML = `<ul class="permisos">
      ${fila('🔄', u('Versión', 'Version'), version ? `${u('Tienes la versión', 'You have version')} ${esc(version)}` : u('Abriendo por primera vez', 'Opening for the first time'), true,
        `<span class="muted">${u('Cuando hay una versión nueva, aparece el aviso «Actualizar». También puedes buscarla aquí.', 'When there is a new version, the "Update" notice appears. You can also look for it here.')}</span><button class="btn sec" data-p="buscar">${u('Buscar actualización', 'Check for updates')}</button>`)}
      ${fila('📲', u('En tu pantalla de inicio', 'On your home screen'), puesta ? u('✓ Ya está instalada', '✓ Already installed') : u('Todavía no', 'Not yet'), puesta,
        puesta ? '' : app.promptInstalar ? `<button class="btn verde" data-p="instalar">${u('Instalar app', 'Install app')}</button>`
          : `<span class="muted">${esIOS() ? u('En iPhone: abre esta página en Safari, toca Compartir (el cuadro con la flecha) y luego «Agregar a inicio».', 'On iPhone: open this page in Safari, tap Share (the box with the arrow) and then "Add to Home Screen".') : u('Abre el menú de tu navegador y elige «Instalar app» o «Agregar a pantalla de inicio».', 'Open your browser menu and choose "Install app" or "Add to Home screen".')}</span>`)}
      ${fila('🔔', u('Avisos', 'Notifications'), avisos === 'granted' ? u('✓ Permitidos', '✓ Allowed') : avisos === 'denied' ? u('Bloqueados', 'Blocked') : avisos === 'default' ? u('Sin decidir', 'Not decided') : u('No disponibles aquí', 'Not available here'), avisos === 'granted',
        (avisos === 'default' ? `<button class="btn verde" data-p="avisos">${u('Permitir avisos', 'Allow notifications')}</button>`
          : avisos === 'denied' ? `<span class="muted">${u('Los bloqueaste antes. Para activarlos, entra a los ajustes de tu teléfono y permite los avisos de Granma Sazón.', 'You blocked them before. To turn them on, go to your phone settings and allow notifications for Granma Sazón.')}</span>`
          : avisos === 'sin' ? `<span class="muted">${esIOS() && !puesta ? u('En iPhone, los avisos solo se pueden permitir con la app en tu pantalla de inicio. Instálala primero.', 'On iPhone, notifications can only be allowed with the app on your home screen. Install it first.') : u('Este navegador no tiene avisos.', 'This browser has no notifications.')}</span>` : '')
        + `<span class="muted">${u('Hoy sirven para avisarte cuando termina el cronómetro de una receta. La app no manda publicidad.', 'Today they tell you when a recipe timer ends. The app sends no advertising.')}</span>`)}
      ${fila('🎤', u('Micrófono', 'Microphone'), micro === 'granted' ? u('✓ Permitido', '✓ Allowed') : micro === 'denied' ? u('Bloqueado', 'Blocked') : u('Se pide al practicar tu voz', 'Asked when you practice speaking'), micro === 'granted',
        micro === 'granted' ? '' : micro === 'denied' ? `<span class="muted">${u('Lo bloqueaste antes. Actívalo en los ajustes de tu teléfono, en los permisos de esta página.', 'You blocked it before. Turn it on in your phone settings, under this page\'s permissions.')}</span>`
          : `<button class="btn verde" data-p="micro">${u('Permitir micrófono', 'Allow microphone')}</button><span class="muted">${u('Tu voz no se guarda ni sale de tu teléfono.', 'Your voice is not saved and does not leave your phone.')}</span>`)}
      ${fila('💾', u('Guardado en este teléfono', 'Saved on this phone'), guardado ? u('✓ Protegido', '✓ Protected') : u('El teléfono podría borrarlo si le falta espacio', 'The phone could delete it if it runs low on space'), guardado,
        guardado ? '' : `<button class="btn sec" data-p="guardar">${u('Proteger mis descargas', 'Protect my downloads')}</button>`)}
    </ul>${aviso ? `<p class="mt" role="status"><strong>${aviso}</strong></p>` : ''}`;
  }
  caja.addEventListener('click', async (e) => {
    const b = e.target.closest('[data-p]'); if (!b) return; b.disabled = true;
    const p = b.dataset.p;
    if (p === 'buscar') {
      const r = await buscarActualizacion();
      aviso = r === 'nueva' ? `${u('¡Hay una versión nueva!', 'There is a new version!')} <button class="btn verde" data-p="actualizar">${u('Actualizar ahora', 'Update now')}</button>`
        : r === 'al-dia' ? u('Ya tienes la última versión.', 'You already have the latest version.')
        : r === 'sin-red' ? u('No hay internet para buscarla. Intenta más tarde.', 'There is no internet to look for it. Try again later.')
        : u('La app apenas se está guardando en tu teléfono. Ciérrala, ábrela otra vez e intenta de nuevo.', 'The app is still being saved on your phone. Close it, open it again and retry.');
    } else if (p === 'actualizar') { if (!aplicarActualizacion()) location.reload(); return; }
    else if (p === 'instalar') { const app = await import('./app.js'); aviso = (await app.instalar()) ? u('¡Instalada! Búscala en tu pantalla de inicio.', 'Installed! Look for it on your home screen.') : ''; }
    else if (p === 'avisos') {
      const si = await pedirPermisoDeAviso();
      aviso = si ? u('¡Listo! Te acabo de mandar un aviso de prueba.', 'Done! I just sent you a test notification.') : u('No se permitieron los avisos. Puedes cambiarlo después en los ajustes de tu teléfono.', 'Notifications were not allowed. You can change it later in your phone settings.');
      if (si) notificar('Granma Sazón', u('¡Así te voy a avisar cuando esté lista tu receta!', 'This is how I will tell you when your recipe is ready!'));
    } else if (p === 'micro') {
      try { const s = await navigator.mediaDevices.getUserMedia({ audio: true }); s.getTracks().forEach((t) => t.stop()); aviso = u('¡Listo! Ya puedo oírte cuando practiques tu voz.', 'Done! I can hear you when you practice speaking.'); }
      catch { aviso = u('No se permitió el micrófono. Puedes cambiarlo después en los ajustes de tu teléfono.', 'The microphone was not allowed. You can change it later in your phone settings.'); }
    } else if (p === 'guardar') { aviso = (await pedirPersistencia()) ? u('¡Listo! Tu teléfono ya no borrará tus descargas por falta de espacio.', 'Done! Your phone will no longer delete your downloads to free space.') : u('Tu teléfono no lo permitió por ahora. Suele permitirlo cuando la app está en tu pantalla de inicio.', 'Your phone did not allow it for now. It usually does once the app is on your home screen.'); }
    pintar();
  });
  addEventListener('instalable', pintar); addEventListener('version-nueva', pintar);
  await pintar();
}
