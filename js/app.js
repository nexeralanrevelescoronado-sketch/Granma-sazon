// Granma Sazón — arranque, router por hash, encabezado, navegación y avisos.
import { estado, u, tgt, nat, vidas, rachaVigente, alCambiar, alAviso, Ln, guardar } from './state.js';
import { $, esc } from './util.js';
import { toast, confeti } from './fx.js';
import { sonido } from './sound.js';
import { SinDescargar } from './datos.js';
import { pj } from './personajes.js';
import { iniciarAnimaciones } from '../assets/animaciones/index.js';
import { iniciarGlosario } from './glosario.js';
import { vigilarDialogos, detenerHabla, alternarVoz, vozDisponible } from './habla.js';
import { iniciarLento } from './lento.js';
import { vigilarActualizaciones } from './actualizar.js';
import { VERSION_LEGAL } from './legal.js';

const rutas = {
  '': () => import('./vistas/inicio.js'),
  historia: () => import('./vistas/historia.js'),
  leccion: () => import('./vistas/leccion.js'),
  recetas: () => import('./vistas/recetas.js'),
  receta: () => import('./vistas/receta.js'),
  regiones: () => import('./vistas/regiones.js'),
  loteria: () => import('./vistas/loteria.js'),
  consejos: () => import('./vistas/consejos.js'),
  consejo: () => import('./vistas/consejos.js'),
  cotorreo: () => import('./vistas/cotorreo.js'),
  hablar: () => import('./vistas/hablar.js'),
  platica: () => import('./vistas/platica.js'),
  asi: () => import('./vistas/asi.js'),
  reglas: () => import('./vistas/reglas.js'),
  privacidad: () => import('./vistas/legal.js'),
  terminos: () => import('./vistas/legal.js'),
  biblia: () => import('./vistas/biblia.js'),
  descargas: () => import('./vistas/descargas.js'),
  prueba: () => import('./vistas/prueba.js'),
  reto: () => import('./vistas/reto.js'),
  repaso: () => import('./vistas/reto.js'),
  perfil: () => import('./vistas/perfil.js'),
  onboarding: () => import('./vistas/onboarding.js'),
};
const ICONOS = {
  inicio: '<path d="M3 11l9-8 9 8v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  historia: '<path d="M4 4h7a3 3 0 0 1 3 3v13a2 2 0 0 0-2-2H4zM20 4h-6a3 3 0 0 0-3 3v13a2 2 0 0 1 2-2h7z"/>',
  recetas: '<path d="M5 10h14v2a7 7 0 0 1-14 0zM3 10h18M9 3c-1 2 1 2 0 4M13 3c-1 2 1 2 0 4"/>',
  consejos: '<path d="M2 14c0-2 3-3 6-3 0-4 2-7 4-7s4 3 4 7c3 0 6 1 6 3 0 1-2 2-10 2S2 15 2 14zM6 19h12"/>',
  cotorreo: '<path d="M4 5h16v11H9l-5 4zM8 10h8"/>',
  hablar: '<rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6"/>',
  biblia: '<path d="M6 3h12v18H6zM12 7v8M9 10h6"/>',
  descargas: '<path d="M12 3v12m0 0l-4-4m4 4l4-4M4 20h16"/>',
  perfil: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',
  racha: '<path d="M12 2c1 4 6 6 6 12a6 6 0 0 1-12 0c0-3 2-4 3-7 1 1 2 2 2 4 1-3 1-6 1-9z"/>',
  xp: '<path d="M12 2l3 7 7 .6-5.3 4.7 1.7 7.2L12 17.8 5.6 21.5l1.7-7.2L2 9.6 9 9z"/>',
};
export const icono = (n, rel = false) => `<svg viewBox="0 0 24 24" fill="${rel ? 'currentColor' : 'none'}" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONOS[n]}</svg>`;

const main = $('#main'), encabezado = $('#encabezado'), nav = $('#nav');
let limpiar = null, versionPintada = '';

function pintarCromo() {
  const S = estado(), listo = S.perfil.listo;
  encabezado.hidden = nav.hidden = !listo;
  main.classList.toggle('sin-nav', !listo);
  if (!listo) return;
  const clave = `${nat()}|${rachaVigente()}|${S.xp}|${vidas()}|${S.ajustes.sonido}|${S.ajustes.voz}|${location.hash}`;
  if (clave === versionPintada) return; versionPintada = clave;
  encabezado.innerHTML = `<a class="marca" href="#/" aria-label="Granma Sazón — ${u('inicio', 'home')}"><img src="assets/logo/icono.svg" width="34" height="34" alt=""><span>Granma Sazón</span></a>
    <div class="chips">
      <span class="chip" role="group" title="${u('Racha diaria', 'Daily streak')}" aria-label="${u('Racha', 'Streak')}: ${rachaVigente()}">${icono('racha', true)}${rachaVigente()}</span>
      <span class="chip" role="group" title="XP" aria-label="XP: ${S.xp}">${icono('xp', true)}${S.xp}</span>
      <span class="chip" role="group" title="${u('Energía de hoy', 'Energy today')}" aria-label="${u('Energía', 'Energy')}: ${vidas()}"><i class="tortilla"></i>${vidas()}</span>
      <button class="chip" id="btn-sonido" aria-pressed="${S.ajustes.sonido}" aria-label="${u('Sonido', 'Sound')}">${S.ajustes.sonido ? '🔊' : '🔇'}</button>
      ${vozDisponible() ? `<button class="chip" id="btn-voz" aria-pressed="${!!S.ajustes.voz}" aria-label="${u('Voz de Granma y el Abuelo', 'Voice of Granma and Grandpa')}" title="${u('Voz de los abuelos', 'Grandparents\' voice')}">🗣${S.ajustes.voz ? '' : '<span aria-hidden="true" style="position:absolute;width:22px;border-top:3px solid #fff;transform:rotate(-40deg)"></span>'}</button>` : ''}
    </div>`;
  const items = [['', 'inicio', u('Inicio', 'Home')], ['historia', 'historia', u('Historia', 'Story')], ['recetas', 'recetas', u('Recetas', 'Recipes')], ['consejos', 'consejos', u('Abuelo', 'Grandpa')], ['cotorreo', 'cotorreo', u('Cotorreo', 'Chat')], ['hablar', 'hablar', u('Hablar', 'Speak')], ['biblia', 'biblia', u('Biblia', 'Bible')]];
  const ruta = rutaActual().base;
  nav.innerHTML = items.map(([r, ic, tx]) => `<a href="#/${r}" ${(r === ruta || (r === 'consejos' && ruta === 'consejo') || (r === 'recetas' && (ruta === 'receta' || ruta === 'regiones')) || (r === 'historia' && (ruta === 'leccion' || ruta === 'prueba')) || (r === 'hablar' && ['platica', 'asi', 'reglas'].includes(ruta))) ? 'aria-current="page"' : ''}>${icono(ic)}<span>${tx}</span></a>`).join('');
}
$('#encabezado').addEventListener('click', (e) => {
  if (e.target.closest('#btn-sonido')) { sonido.alternar(); versionPintada = ''; pintarCromo(); }
  else if (e.target.closest('#btn-voz')) { alternarVoz(); versionPintada = ''; pintarCromo(); }
});

function rutaActual() {
  const h = location.hash.replace(/^#\/?/, '').split('?')[0], p = h.split('/').filter(Boolean);
  return { base: p[0] || '', args: p.slice(1) };
}

async function navegar() {
  const { base, args } = rutaActual();
  const S = estado();
  const libre = base === 'onboarding' || base === 'privacidad' || base === 'terminos';      // se pueden leer antes de aceptar
  if (!S.perfil.listo && !libre) { location.replace('#/onboarding'); return; }
  // Quien ya jugaba y el aviso de privacidad cambió (o nunca lo aceptó): lo lee y lo acepta antes de seguir.
  const debeAceptar = S.perfil.listo && S.perfil.legal !== VERSION_LEGAL;
  if (debeAceptar && !libre) { location.replace('#/onboarding?aceptar'); return; }
  if (S.perfil.listo && base === 'onboarding' && !location.hash.includes('cambiar') && !(debeAceptar && location.hash.includes('aceptar'))) { location.replace('#/'); return; }
  detenerHabla();
  if (limpiar) { try { limpiar(); } catch { /* ya no existe */ } limpiar = null; }
  document.documentElement.lang = S.perfil.listo ? nat() : 'es';
  const saltar = document.querySelector('.saltar'); if (saltar) saltar.textContent = S.perfil.listo ? u('Saltar al contenido', 'Skip to content') : 'Saltar al contenido · Skip to content';
  const carga = rutas[base] || rutas[''];
  main.innerHTML = '';
  try {
    const mod = await carga();
    limpiar = (await mod.montar(main, { ruta: base, args })) || null;
  } catch (e) {
    if (e instanceof SinDescargar) main.innerHTML = vistaSinDescargar(e.paquete);
    else { console.error(e); main.innerHTML = `<div class="vacio">${pj('granma', 'pensando')}<h1>${u('Ay, mijo…', 'Oh dear…')}</h1><p>${u('Algo no salió bien. Intenta de nuevo.', 'Something went wrong. Please try again.')}</p><a class="btn" href="#/">${u('Ir al inicio', 'Go home')}</a></div>`; }
  }
  document.title = (main.querySelector('h1')?.textContent || 'Granma Sazón') + (base ? ' — Granma Sazón' : '');
  versionPintada = ''; pintarCromo();
  if (!location.hash.includes('noscroll')) scrollTo({ top: 0 });
  main.focus({ preventScroll: true });
  window.__granmaListo = true;                    // el vigilante de index.html deja de esperar
}
export function vistaSinDescargar(paquete) {
  const off = !navigator.onLine;
  return `<div class="vacio">${pj('granma', 'pensando')}<h1>${off ? u('Esto todavía no está descargado', 'This is not downloaded yet') : u('No pude cargar esto', 'I could not load this')}</h1>
    <p>${off ? u('No hay internet y ese paquete no está en tu teléfono. Conéctate y descárgalo en «Descargas».', 'There is no internet and this package is not on your phone. Connect and download it in "Downloads".') : u('Revisa tu conexión e intenta otra vez, o descárgalo en «Descargas».', 'Check your connection and try again, or download it in "Downloads".')}</p>
    <p><a class="btn" href="#/descargas">${u('Ir a Descargas', 'Go to Downloads')}</a></p></div>`;
}

/* Avisos de juego */
alAviso((tipo, d) => {
  if (tipo === 'xp') toast(`+${d} XP`);
  if (tipo === 'insignia') { sonido.logro(); confeti(120); toast(`${d.emoji} ${u('¡Insignia!', 'Badge!')} <strong>${esc(Ln(d.nombre))}</strong>`, 'insig'); }
  if (tipo === 'mision') { sonido.logro(); toast(`🎯 ${u('Misión cumplida', 'Mission done')}: ${esc(Ln(d.texto))} (+${d.xp} XP)`, 'insig'); }
  versionPintada = ''; pintarCromo();
});
alCambiar(() => { versionPintada = ''; pintarCromo(); });

/* Indicador sin internet */
function red() {
  const el = $('#sin-internet'); el.hidden = navigator.onLine;
  $('#sin-internet-texto').textContent = estado().perfil.aprende === 'es' ? 'Offline — downloaded mode' : 'Sin internet — modo descargado';
}
addEventListener('online', red); addEventListener('offline', red); red();

/* Instalación (PWA) */
export let promptInstalar = null;
addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); promptInstalar = e; dispatchEvent(new Event('instalable')); });
export const instalar = async () => { if (!promptInstalar) return false; promptInstalar.prompt(); const r = await promptInstalar.userChoice; promptInstalar = null; return r.outcome === 'accepted'; };

/* Service worker */
// El service worker se registra hasta que la app ya abrió y pasaron unos segundos: así su instalación (70 archivos) nunca compite con la carga de la primera visita.
if ('serviceWorker' in navigator) {
  const registrar = () => setTimeout(() => navigator.serviceWorker.register('sw.js')
    .then(() => navigator.serviceWorker.ready).then((reg) => { vigilarActualizaciones(reg); import('./recordatorios.js').then((m) => m.sincronizarRecordatorio()).catch(() => {}); if (estado().cuenta?.conectada) import('./cuenta.js').then((m) => m.sincronizar()).catch(() => {}); if (!navigator.serviceWorker.controller) setTimeout(() => reg.active?.postMessage('tomar-control'), 1500); })
    .catch((e) => console.warn('SW', e)), 3000);
  if (document.readyState === 'complete') registrar(); else addEventListener('load', registrar);
}

iniciarAnimaciones();
vigilarDialogos(main);
iniciarGlosario();
iniciarLento();
addEventListener('hashchange', navegar);
navegar();
