// «La app en tu teléfono»: versión y actualización, instalarla en la pantalla de inicio y dar los permisos,
// con un botón para cada cosa. Cada botón hace aparecer la autorización del propio teléfono: la app nunca la da por sí sola.
import { u, tgt, nat } from './state.js';
import { esc } from './util.js';
import { buscarActualizacion, aplicarActualizacion, versionInstalada } from './actualizar.js';
import { avisosDisponibles, pedirPermisoDeAviso, notificar } from './cronometros.js';
import { pedirPersistencia, esPersistente } from './descargas.js';
import { recordatoriosDisponibles, avisosActivos, activarAviso, quitarAviso, horaBonita, diasBonitos, HORAS, DIAS, DIAS_LARGOS, SUGERIDO } from './recordatorios.js';

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
    const app = await import('./app.js'), [version, micro, guardado] = await Promise.all([versionInstalada(), permisoMicro(), esPersistente()]), avisos = permisoAvisos(), puesta = instalada(), activos = avisosActivos();
    if (!caja.isConnected) return;
    // Lo que la persona va eligiendo (hora y días) se conserva aunque la tarjeta se vuelva a pintar o el teléfono no deje activarlo.
    const dibujo = (tipo) => (borrador[tipo] ||= { hora: activos[tipo]?.hora ?? SUGERIDO[tipo].hora, dias: [...(activos[tipo]?.dias ?? SUGERIDO[tipo].dias)] });
    const orden = [1, 2, 3, 4, 5, 6, 0];   // la semana empieza en lunes
    const aviso2 = (tipo, ico, titulo, que) => { const a = activos[tipo], b = dibujo(tipo), msg = mensajes[tipo];
      const estadoTxt = a ? `✓ ${diasBonitos(a.dias)[0].toUpperCase() + diasBonitos(a.dias).slice(1)}, ${u('a las', 'at')} ${horaBonita(a.hora)}` : u('Apagado', 'Off');
      const cuerpo = !recordatoriosDisponibles() ? `<span class="muted">${esIOS() && !puesta ? u('En iPhone, los avisos funcionan con la app en tu pantalla de inicio. Instálala primero.', 'On iPhone, notifications work with the app on your home screen. Install it first.') : u('Este navegador no puede recibir avisos.', 'This browser cannot receive notifications.')}</span>`
        : avisos === 'denied' ? '' : `<label class="muted" for="hora-${tipo}">${u('¿A qué hora?', 'What time?')}</label><select id="hora-${tipo}" data-hora="${tipo}">${HORAS.map((h) => `<option value="${h}" ${h === b.hora ? 'selected' : ''}>${horaBonita(h)}</option>`).join('')}</select>
          <span class="muted">${u('¿Qué días?', 'Which days?')}</span><div class="dias" role="group" aria-label="${u('Días de la semana', 'Days of the week')}">${orden.map((d) => `<button type="button" class="dia" data-dia="${tipo}:${d}" aria-pressed="${b.dias.includes(d)}" aria-label="${DIAS_LARGOS[nat()][d]}">${DIAS[nat()][d]}</button>`).join('')}</div>
          <div class="fila dias-rapidos"><button type="button" class="btn-liga" data-todos="${tipo}">${u('Todos', 'Every day')}</button><button type="button" class="btn-liga" data-semana="${tipo}">${u('Entre semana', 'Weekdays')}</button><button type="button" class="btn-liga" data-finde="${tipo}">${u('Fin de semana', 'Weekend')}</button></div>
          <button class="btn verde" data-p="aviso:${tipo}">${a ? u('Guardar cambios', 'Save changes') : u('Activar', 'Turn on')}</button>${a ? `<button class="btn sec" data-p="quitar:${tipo}">${u('Quitar este aviso', 'Turn off this notification')}</button>` : ''}`;
      return fila(ico, titulo, estadoTxt, !!a, `<span class="muted">${que}</span>${cuerpo}${msg ? `<p class="aviso-local" role="status">${msg}</p>` : ''}`); };
    const nota = avisos === 'denied' && recordatoriosDisponibles() ? `<li class="bloqueo"><strong>🔕 ${u('Los avisos están bloqueados', 'Notifications are blocked')}</strong><span>${esIOS()
        ? u('Para que Granma te pueda avisar: abre <b>Ajustes</b> del iPhone → <b>Notificaciones</b> → <b>Granma Sazón</b> → activa <b>Permitir notificaciones</b>. Luego regresa aquí y toca «Ya lo permití».', 'So Granma can remind you: open iPhone <b>Settings</b> → <b>Notifications</b> → <b>Granma Sazón</b> → turn on <b>Allow Notifications</b>. Then come back and tap "I allowed it".')
        : u('Para que Granma te pueda avisar: toca el candado junto a la dirección (o los ajustes de la app) y permite las notificaciones. Luego toca «Ya lo permití».', 'So Granma can remind you: tap the lock next to the address (or the app settings) and allow notifications. Then tap "I allowed it".')}</span><button class="btn sec" data-p="revisar">${u('Ya lo permití', 'I allowed it')}</button></li>` : '';
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
        + `<span class="muted">${u('Sirven para el cronómetro de las recetas y para los avisos de Granma que elijas abajo. La app no manda publicidad.', 'They are for recipe timers and for the Granma notifications you choose below. The app sends no advertising.')}</span>`)}
      ${aviso2('practicar', '⏰', u('Recordatorio para practicar', 'Practice reminder'), u('Granma te invita a practicar un ratito.', 'Granma invites you to practice for a little while.'))}
      ${aviso2('clase', '👩‍🍳', u('Te espero en clase', 'Waiting for you in class'), tgt() === 'en' ? u('Granma te escribe: Mijo, te estoy esperando para tu siguiente clase de cocina e inglés. Y te dice qué capítulo sigue.', 'Granma writes: Mijo, I am waiting for you for your next cooking and English class. And she tells you which chapter is next.') : u('Granma te escribe: Mijo, te estoy esperando para tu siguiente clase de cocina y español. Y te dice qué capítulo sigue.', 'Granma writes: Mijo, I am waiting for you for your next cooking and Spanish class. And she tells you which chapter is next.'))}
      ${nota}
      ${fila('🎤', u('Micrófono', 'Microphone'), micro === 'granted' ? u('✓ Permitido', '✓ Allowed') : micro === 'denied' ? u('Bloqueado', 'Blocked') : u('Se pide al practicar tu voz', 'Asked when you practice speaking'), micro === 'granted',
        micro === 'granted' ? '' : micro === 'denied' ? `<span class="muted">${u('Lo bloqueaste antes. Actívalo en los ajustes de tu teléfono, en los permisos de esta página.', 'You blocked it before. Turn it on in your phone settings, under this page\'s permissions.')}</span>`
          : `<button class="btn verde" data-p="micro">${u('Permitir micrófono', 'Allow microphone')}</button><span class="muted">${u('Tu voz no se guarda ni sale de tu teléfono.', 'Your voice is not saved and does not leave your phone.')}</span>`)}
      ${fila('💾', u('Guardado en este teléfono', 'Saved on this phone'), guardado ? u('✓ Protegido', '✓ Protected') : u('El teléfono podría borrarlo si le falta espacio', 'The phone could delete it if it runs low on space'), guardado,
        guardado ? '' : `<button class="btn sec" data-p="guardar">${u('Proteger mis descargas', 'Protect my downloads')}</button>`)}
    </ul>${aviso ? `<p class="mt" role="status"><strong>${aviso}</strong></p>` : ''}`;
  }
  const borrador = {}, mensajes = {};
  caja.addEventListener('change', (e) => { const t = e.target.closest('[data-hora]'); if (t) borrador[t.dataset.hora].hora = +t.value; });
  caja.addEventListener('click', async (e) => {
    const d = e.target.closest('[data-dia],[data-todos],[data-semana],[data-finde]');
    if (d) {   // elegir días: se marca al momento, sin ir al servidor (se guarda con «Activar» o «Guardar cambios»)
      const tipo = d.dataset.dia?.split(':')[0] || d.dataset.todos || d.dataset.semana || d.dataset.finde, b = borrador[tipo];
      if (d.dataset.dia) { const n = +d.dataset.dia.split(':')[1]; b.dias = b.dias.includes(n) ? b.dias.filter((x) => x !== n) : [...b.dias, n]; }
      else b.dias = d.dataset.todos ? [0, 1, 2, 3, 4, 5, 6] : d.dataset.semana ? [1, 2, 3, 4, 5] : [0, 6];
      caja.querySelectorAll(`[data-dia^="${tipo}:"]`).forEach((x) => x.setAttribute('aria-pressed', String(b.dias.includes(+x.dataset.dia.split(':')[1]))));
      return;
    }
    const b = e.target.closest('[data-p]'); if (!b) return; b.disabled = true;
    const p = b.dataset.p;
    if (p.startsWith('aviso:') || p.startsWith('quitar:')) {
      const tipo = p.split(':')[1], el = borrador[tipo];
      if (p.startsWith('quitar:')) { await quitarAviso(tipo); mensajes[tipo] = u('Listo, ya no te mando este aviso. Se borró del servidor.', 'Done, I will not send this one anymore. It was deleted from the server.'); }
      else { const r = await activarAviso(tipo, el.hora, el.dias);
        mensajes[tipo] = r === 'ok' ? `✓ ${u('¡Listo! Te aviso', 'Done! I will remind you')} ${diasBonitos(el.dias)}, ${u('a las', 'at')} ${horaBonita(el.hora)}.`
          : r === 'sin-dias' ? u('Escoge al menos un día.', 'Choose at least one day.')
          : r === 'bloqueado' ? u('Los avisos están bloqueados en tu teléfono. Abajo te digo cómo permitirlos.', 'Notifications are blocked on your phone. See below how to allow them.')
          : r === 'sin-permiso' ? u('Para este aviso hay que permitir los avisos cuando el teléfono pregunte.', 'For this you need to allow notifications when your phone asks.')
          : r === 'no-disponible' ? u('Este navegador no puede recibir avisos.', 'This browser cannot receive notifications.')
          : u('No pude activarlo ahora. Revisa tu internet e intenta otra vez.', 'I could not turn it on now. Check your internet and try again.'); }
      return pintar();
    }
    if (p === 'revisar') return pintar();
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
