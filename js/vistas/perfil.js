// Perfil: insignias, constancia, ajustes y créditos.
import { puedeReconocer, escuchar, grabar, soltar } from '../oido.js';
import { conectarPermisos } from '../permisos.js';
import { estado, guardar, reiniciar, u, nat, tgt, Ln, INSIGNIAS, rachaVigente } from '../state.js';
import { generarConstancia } from '../constancia.js';
import { sonido } from '../sound.js';
import { pj } from '../personajes.js';
import { esc } from '../util.js';
import { VERSIONES } from '../biblia/config.js';
import { confeti } from '../fx.js';
import { alternarVoz, vozDisponible } from '../habla.js';

export async function montar(main) {
  const S = estado(), listaIns = INSIGNIAS;
  let hecha = 0; try { const h = await (await import('../datos.js')).historia(); hecha = h.capitulos.every((c) => S.caps[c.id]?.hecho) ? 1 : 0; } catch { hecha = Object.values(S.caps).filter((c) => c.hecho).length >= 6 ? 1 : 0; }
  const fechaBonita = () => new Date().toLocaleDateString(S.perfil.aprende === 'es' ? 'en-US' : 'es-MX', { year: 'numeric', month: 'long', day: 'numeric' });
  let urlPrevia = null;

  main.innerHTML = `<h1>${u('Mi perfil', 'My profile')}</h1>
    <div class="tarjeta"><div class="fila"><strong>${S.xp} XP</strong><span>🔥 ${rachaVigente()} ${u('días', 'days')}</span><span>🎯 ${u('Reto', 'Challenge')}: ${S.stats.retoMejor}</span><span>🫓 ${S.stats.kilos || 0} kg</span><span>⭐ ${u('Pruebas', 'Quizzes')}: ${Object.values(S.pruebas || {}).filter((x) => x.aprobada).length}</span></div></div>
    <h2>${u('Insignias', 'Badges')}</h2><div class="insignias">${listaIns.map((i) => { const ok = S.insignias[i.id]; return `<div class="insignia ${ok ? '' : 'bloq'}"><span class="medalla" aria-hidden="true">${i.emoji}</span><strong>${esc(Ln(i.nombre))}</strong><br><small class="muted">${esc(Ln(i.desc))}</small>${ok ? `<br><small>✓ ${ok}</small>` : ''}</div>`; }).join('')}</div>
    <h2 class="mt2">📒 ${u('Mi cuaderno', 'My notebook')}</h2>
    ${(S.cuaderno || []).length ? `<p class="muted">${u('Las últimas palabras que tocaste para ver qué significan.', 'The last words you tapped to see what they mean.')}</p><ul class="cuaderno">${S.cuaderno.slice(0, 20).map((x) => `<li><strong lang="${x.l}">${esc(x.p)}</strong><span class="muted">= ${esc(x.s)}</span></li>`).join('')}</ul>` : `<p class="muted">${u('Toca cualquier palabra en una lección y aquí se va guardando.', 'Tap any word in a lesson and it will be saved here.')}</p>`}
    <h2 class="mt2">🏆 ${u('Constancia Granma', 'Granma Certificate')}</h2>
    <div class="tarjeta">${hecha ? `<p>${u('¡La ganaste! Escribe tu nombre para tu constancia (se hace en tu teléfono).', 'You earned it! Type your name for your certificate (made on your phone).')}</p>
      <label class="muted" for="nombre">${u('Tu nombre', 'Your name')}</label><input type="text" id="nombre" maxlength="40" value="${esc(S.perfil.nombre)}" autocomplete="name" style="margin-bottom:10px"><button class="btn grande olla" data-const>${u('Crear mi constancia', 'Create my certificate')}</button><div id="const-out" class="mt"></div>` : `<p>${u('Termina los 6 capítulos de la Historia 1 para ganarla.', 'Finish the 6 chapters of Story 1 to earn it.')}</p><a class="btn" href="#/historia">${u('Ir a la historia', 'Go to the story')}</a>`}</div>
    <h2 class="mt2">📲 ${u('La app en tu teléfono', 'The app on your phone')}</h2>
    <div class="tarjeta" data-permisos></div>
    <h2 class="mt2">${u('Ajustes', 'Settings')}</h2>
    <div class="tarjeta"><div class="fila"><button class="btn sec" data-sonido>${S.ajustes.sonido ? '🔊 ' + u('Sonido: sí', 'Sound: on') : '🔇 ' + u('Sonido: no', 'Sound: off')}</button>
      ${vozDisponible() ? `<button class="btn sec" data-voz aria-pressed="${!!S.ajustes.voz}">🗣 ${S.ajustes.voz ? u('Voz: sí', 'Voice: on') : u('Voz: no', 'Voice: off')}</button>` : ''}
      <a class="btn sec" href="#/onboarding?cambiar">${u('Cambiar interés, cocina o cómo me dice Granma', 'Change interest, cuisine or what Granma calls me')}</a></div>
      <p class="muted mt">${u('Granma te dice', 'Granma calls you')}: <strong>${S.perfil.trato === 'mija' ? '«mija»' : S.perfil.trato === 'mijo' ? '«mijo»' : u('de las dos formas', 'either way')}</strong></p>
      <p class="muted mt">${u('La voz de Granma y el Abuelo se apaga con 🗣. Usa las voces instaladas en tu dispositivo (es-MX y en-US).', 'Turn the voice of Granma and Grandpa off with 🗣. It uses the voices installed on your device (es-MX and en-US).')}</p>
      <p class="muted">${u('Idioma que aprendes', 'Language you are learning')}: <strong>${S.perfil.aprende === 'es' ? 'Español' : 'English'}</strong> · ${u('Interés', 'Interest')}: <strong>${esc(S.perfil.interes)}</strong></p>
      <button class="btn sec" data-borrar style="margin-top:6px">${u('Borrar mi progreso', 'Delete my progress')}</button></div>
    <h2 class="mt2">🎤 ${u('Practicar mi voz', 'Speaking practice')}</h2>
    <div class="tarjeta"><p>${u('Ahora', 'Now')}: <strong>${S.ajustes.oido === 'reco' ? u('mi teléfono me escucha', 'my phone listens') : S.ajustes.oido === 'local' ? u('me escucha Granma, aquí en mi teléfono', 'Granma listens, here on my phone') : u('todavía no eliges', 'not chosen yet')}</strong></p>
      <div class="fila">${puedeReconocer() ? `<button class="btn sec" data-oido="reco" aria-pressed="${S.ajustes.oido === 'reco'}">🎧 ${u('Que me escuche', 'Let it listen')}</button>` : ''}<button class="btn sec" data-oido="local" aria-pressed="${S.ajustes.oido === 'local'}">🔒 ${u('Granma, en mi teléfono', 'Granma, on my phone')}</button><button class="btn sec" data-probar-micro>${u('Probar mi micrófono', 'Test my microphone')}</button></div>
      <p class="muted mt">👂 ${u('Para que «Granma, en mi teléfono» reconozca tus palabras sin internet, baja el «Oído de Granma» en', 'So that "Granma, on my phone" recognizes your words offline, get "Granma\'s ear" in')} <a href="#/descargas">${u('Descargas', 'Downloads')}</a>.</p>
      <p class="muted mt" id="micro-out" role="status"></p></div>
    <h2 class="mt2">🔒 ${u('Tu privacidad', 'Your privacy')}</h2>
    <div class="tarjeta"><ul class="privacidad">
      <li>${u('No hay cuentas ni registro. Tu avance, tu nombre y tu cuaderno se guardan solo en este teléfono.', 'There are no accounts or sign-up. Your progress, your name and your notebook are stored only on this phone.')}</li>
      <li>${u('La app no guarda ni envía tu voz. El «Oído de Granma» reconoce tus palabras dentro del teléfono, sin internet. Si te grabas para practicar, la grabación vive solo en la memoria del teléfono y se borra sola en 1 minuto o al pasar de ejercicio.', 'The app does not store or send your voice. "Granma\'s ear" recognizes your words inside the phone, offline. If you record yourself to practice, the recording lives only in the phone\'s memory and deletes itself in 1 minute or when you move on.')}</li>
      <li>${u('Si eliges «que mi teléfono me escuche», quien procesa tu voz es el servicio de voz de tu teléfono (Apple o Google), con sus propias reglas. Solo se usa si tú dices que sí, y lo puedes apagar aquí arriba.', 'If you choose "let my phone listen", your voice is processed by your phone\'s speech service (Apple or Google), under their own rules. It is only used if you say yes, and you can turn it off above.')}</li>
      <li>${u('Solo si activas el recordatorio diario, se guarda en el servidor de Granma Sazón (en Cloudflare) la dirección de avisos que genera tu teléfono y la hora que elegiste. No lleva tu nombre, tu idioma ni tu avance, y se borra cuando lo quitas.', 'Only if you turn on the daily reminder, the Granma Sazón server (on Cloudflare) stores the notification address your phone generates and the time you chose. It carries no name, language or progress, and it is deleted when you turn it off.')}</li>
      <li>${u('«Borrar mi progreso» elimina todo lo guardado en este teléfono y quita el recordatorio.', '"Delete my progress" removes everything stored on this phone and turns off the reminder.')}</li></ul></div>
    <h2 class="mt2">${u('Créditos y derechos', 'Credits and rights')}</h2>
    <div class="tarjeta"><p class="atrib">${u('Personajes, logo, textos, chistes y consejos: creación original de Granma Sazón.', 'Characters, logo, texts, jokes and advice: original creations of Granma Sazón.')}</p>
      <p class="atrib"><strong>${u('Oído de Granma', 'Granma\'s ear')}</strong> — ${u('usa Vosk y sus modelos de voz (Alpha Cephei Inc.), con licencia Apache 2.0.', 'uses Vosk and its speech models (Alpha Cephei Inc.), under the Apache 2.0 license.')}</p>
      ${VERSIONES.map((v) => `<p class="atrib"><strong>${esc(v.corto)}</strong> — ${esc(v.attribution[nat()])}${v.activa ? '' : ' (' + u('apagada', 'switched off') + ')'}</p>`).join('')}</div>`;
  conectarPermisos(main.querySelector('[data-permisos]'));
  main.onclick = async (e) => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.hasAttribute('data-sonido')) { sonido.alternar(); montar(main); }
    else if (b.hasAttribute('data-voz')) { alternarVoz(); montar(main); }
    else if (b.dataset.oido) { S.ajustes.oido = b.dataset.oido; guardar(); montar(main); }
    else if (b.hasAttribute('data-probar-micro')) {
      const out = main.querySelector('#micro-out'), instalada = matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
      const grabaOk = async () => { const g = await grabar({ ms: 1200 }); if (!g.ok) return false; soltar((await g.fin).url); return true; };
      // El reconocimiento del teléfono (que procesa la voz fuera del teléfono) solo se prueba si la persona ya lo eligió.
      if (puedeReconocer() && S.ajustes.oido !== 'reco') { out.textContent = u('Revisando…', 'Checking…'); out.textContent = (await grabaOk()) ? u('✔ Tu micrófono funciona (prueba hecha solo en tu teléfono). Para probar si tu teléfono reconoce tu voz, elige primero «Que me escuche».', '✔ Your microphone works (tested on your phone only). To test whether your phone recognizes your voice, choose "Let it listen" first.') : u('No pude usar el micrófono. Revisa el permiso del micrófono para esta app en los ajustes del teléfono.', 'I could not use the microphone. Check the microphone permission for this app in your phone settings.'); return; }
      if (!puedeReconocer()) { out.textContent = u('Revisando…', 'Checking…'); out.textContent = (await grabaOk()) ? u('✔ Tu micrófono funciona. Este navegador no reconoce voz, así que practicarás grabándote y escuchándote.', '✔ Your microphone works. This browser cannot recognize speech, so you will practice by recording and hearing yourself.') : u('No pude usar el micrófono. Revisa el permiso del micrófono para esta app en los ajustes del teléfono.', 'I could not use the microphone. Check the microphone permission for this app in your phone settings.'); return; }
      out.textContent = u('Di algo en voz alta…', 'Say something out loud…');
      const r = await escuchar(tgt(), { ms: 7000 });
      out.textContent = r.ok ? `✔ ${u('Tu teléfono sí reconoce tu voz. Escuché', 'Your phone does recognize your voice. I heard')}: «${r.textos[0]}»`
        : r.motivo === 'silencio' ? u('No alcancé a oír nada. Acércate e inténtalo otra vez.', 'I could not hear anything. Come closer and try again.')
        : r.motivo === 'red' ? u('Sin internet el teléfono no puede reconocer la voz. Sin internet practicarás grabándote.', 'Without internet the phone cannot recognize speech. Offline you will practice by recording yourself.')
        : instalada ? u('Aquí, con la app en la pantalla de inicio, tu teléfono no dejó usar el reconocimiento de voz. Practicarás grabándote; para que te escuche, abre la app en el navegador.', 'Here, with the app on the home screen, your phone did not allow speech recognition. You will practice by recording; to be listened to, open the app in the browser.')
        : u('Tu teléfono no dejó usar el reconocimiento de voz (revisa el permiso del micrófono y del dictado). Mientras, practicarás grabándote.', 'Your phone did not allow speech recognition (check the microphone and dictation permissions). Meanwhile you will practice by recording.');
    }
    else if (b.hasAttribute('data-borrar')) { if (confirm(u('¿Seguro? Se borrará tu avance en este teléfono.', 'Sure? Your progress on this phone will be deleted.'))) { import('../recordatorios.js').then((m) => m.quitarRecordatorio()).catch(() => {}).finally(() => { reiniciar(); location.hash = '#/onboarding'; location.reload(); }); } }   // también se borra del servidor el recordatorio, si lo había
    else if (b.hasAttribute('data-const')) {
      const nombre = main.querySelector('#nombre').value.trim(); if (!nombre) return void main.querySelector('#nombre').focus();
      S.perfil.nombre = nombre; S.constancia.fecha = fechaBonita(); guardar(); b.disabled = true;
      const blob = await generarConstancia({ nombre, fecha: S.constancia.fecha, aprende: S.perfil.aprende }); b.disabled = false;
      if (urlPrevia) URL.revokeObjectURL(urlPrevia); urlPrevia = URL.createObjectURL(blob); confeti(100); sonido.logro();
      const archivo = `constancia-granma-${nombre.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.png`;
      main.querySelector('#const-out').innerHTML = `<img class="constancia-vista" src="${urlPrevia}" alt="${u('Constancia Granma de', 'Granma Certificate for')} ${esc(nombre)}" width="1600" height="1130"><p class="mt"><a class="btn verde" href="${urlPrevia}" download="${archivo}">⬇ ${u('Descargar constancia (PNG)', 'Download certificate (PNG)')}</a></p>`;
    }
  };
  return () => { main.onclick = null; if (urlPrevia) URL.revokeObjectURL(urlPrevia); };
}
