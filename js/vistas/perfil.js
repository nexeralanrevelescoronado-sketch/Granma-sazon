// Perfil: insignias, constancia, ajustes y créditos.
import { estado, guardar, reiniciar, u, nat, Ln, INSIGNIAS, rachaVigente } from '../state.js';
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
    <div class="tarjeta"><div class="fila"><strong>${S.xp} XP</strong><span>🔥 ${rachaVigente()} ${u('días', 'days')}</span><span>🎯 ${u('Reto', 'Challenge')}: ${S.stats.retoMejor}</span><span>⭐ ${u('Pruebas', 'Quizzes')}: ${Object.values(S.pruebas || {}).filter((x) => x.aprobada).length}</span></div></div>
    <h2>${u('Insignias', 'Badges')}</h2><div class="insignias">${listaIns.map((i) => { const ok = S.insignias[i.id]; return `<div class="insignia ${ok ? '' : 'bloq'}"><span class="medalla" aria-hidden="true">${i.emoji}</span><strong>${esc(Ln(i.nombre))}</strong><br><small class="muted">${esc(Ln(i.desc))}</small>${ok ? `<br><small>✓ ${ok}</small>` : ''}</div>`; }).join('')}</div>
    <h2 class="mt2">🏆 ${u('Constancia Granma', 'Granma Certificate')}</h2>
    <div class="tarjeta">${hecha ? `<p>${u('¡La ganaste! Escribe tu nombre para tu constancia (se hace en tu teléfono).', 'You earned it! Type your name for your certificate (made on your phone).')}</p>
      <label class="muted" for="nombre">${u('Tu nombre', 'Your name')}</label><input type="text" id="nombre" maxlength="40" value="${esc(S.perfil.nombre)}" autocomplete="name" style="margin-bottom:10px"><button class="btn grande olla" data-const>${u('Crear mi constancia', 'Create my certificate')}</button><div id="const-out" class="mt"></div>` : `<p>${u('Termina los 5 capítulos de la Historia 1 para ganarla.', 'Finish the 5 chapters of Story 1 to earn it.')}</p><a class="btn" href="#/historia">${u('Ir a la historia', 'Go to the story')}</a>`}</div>
    <h2 class="mt2">${u('Ajustes', 'Settings')}</h2>
    <div class="tarjeta"><div class="fila"><button class="btn sec" data-sonido>${S.ajustes.sonido ? '🔊 ' + u('Sonido: sí', 'Sound: on') : '🔇 ' + u('Sonido: no', 'Sound: off')}</button>
      ${vozDisponible() ? `<button class="btn sec" data-voz aria-pressed="${!!S.ajustes.voz}">🗣 ${S.ajustes.voz ? u('Voz: sí', 'Voice: on') : u('Voz: no', 'Voice: off')}</button>` : ''}
      <a class="btn sec" href="#/onboarding?cambiar">${u('Cambiar interés o cocina', 'Change interest or cuisine')}</a></div>
      <p class="muted mt">${u('La voz de Granma y el Abuelo viene apagada. Sin internet depende de las voces instaladas en tu dispositivo (es-MX y en-US).', 'The voice of Granma and Grandpa is off by default. Offline it depends on the voices installed on your device (es-MX and en-US).')}</p>
      <p class="muted">${u('Idioma que aprendes', 'Language you are learning')}: <strong>${S.perfil.aprende === 'es' ? 'Español' : 'English'}</strong> · ${u('Interés', 'Interest')}: <strong>${esc(S.perfil.interes)}</strong></p>
      <button class="btn sec" data-borrar style="margin-top:6px">${u('Borrar mi progreso', 'Delete my progress')}</button></div>
    <h2 class="mt2">${u('Créditos y derechos', 'Credits and rights')}</h2>
    <div class="tarjeta"><p class="atrib">${u('Personajes, logo, textos, chistes y consejos: creación original de Granma Sazón.', 'Characters, logo, texts, jokes and advice: original creations of Granma Sazón.')}</p>
      ${VERSIONES.map((v) => `<p class="atrib"><strong>${esc(v.corto)}</strong> — ${esc(v.attribution[nat()])}${v.activa ? '' : ' (' + u('apagada', 'switched off') + ')'}</p>`).join('')}</div>`;
  main.onclick = async (e) => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.hasAttribute('data-sonido')) { sonido.alternar(); montar(main); }
    else if (b.hasAttribute('data-voz')) { alternarVoz(); montar(main); }
    else if (b.hasAttribute('data-borrar')) { if (confirm(u('¿Seguro? Se borrará tu avance en este teléfono.', 'Sure? Your progress on this phone will be deleted.'))) { reiniciar(); location.hash = '#/onboarding'; location.reload(); } }
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
