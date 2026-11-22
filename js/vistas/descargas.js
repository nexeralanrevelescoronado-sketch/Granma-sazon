// Descargas: paquetes para usar sin internet, con peso, progreso, pausa/reanudar y borrar.
import { u, Ln } from '../state.js';
import { listaPaquetes, estadoDe, descargar, pausar, borrar, descargarTodo, alProgreso, espacio, pedirPersistencia, esPersistente, hayCaches } from '../descargas.js';
import { instalar } from '../app.js';
import { pj } from '../personajes.js';
import { esc, MB } from '../util.js';

export async function montar(main) {
  const lista = await listaPaquetes(), estados = {};
  for (const p of lista) estados[p.id] = await estadoDe(p);
  const totalMB = lista.reduce((s, p) => s + p.bytes, 0);
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent), instalada = matchMedia('(display-mode: standalone)').matches || navigator.standalone;

  const fila = (p) => {
    const e = estados[p.id], pct = e.total ? Math.round((e.hechos / e.total) * 100) : 0;
    const estado = { listo: `<span class="estado-ok">✓ ${u('Descargado', 'Downloaded')}</span>`, bajando: u('Descargando…', 'Downloading…'), pausa: e.msg === 'corte' ? u('Se cortó el internet. Se reanudará solo al volver.', 'The internet dropped. It will resume on its own when it returns.') : u('En pausa', 'Paused'), parcial: u('Incompleto', 'Incomplete'), no: u('No descargado', 'Not downloaded'), proximamente: u('Próximamente', 'Coming soon') }[e.estado];
    const botones = e.estado === 'proximamente' ? '' : e.estado === 'bajando' ? `<button class="btn sec" data-pausar="${p.id}">⏸ ${u('Pausar', 'Pause')}</button>`
      : e.estado === 'listo' ? `<button class="btn sec" data-borrar="${p.id}">🗑 ${u('Borrar', 'Delete')}</button>`
      : `<button class="btn" data-bajar="${p.id}">${e.estado === 'no' ? '⬇ ' + u('Descargar', 'Download') : '▶ ' + u('Reanudar', 'Resume')}</button>${e.hechos ? `<button class="btn sec" data-borrar="${p.id}">🗑 ${u('Borrar', 'Delete')}</button>` : ''}`;
    return `<section class="tarjeta paquete ${e.estado === 'proximamente' ? 'prox' : ''}" id="pq-${p.id}" aria-label="${esc(Ln(p.nombre))}"><span class="ico" aria-hidden="true">${p.icono}</span>
      <div><h2 style="font-size:1.1rem;margin:0">${esc(Ln(p.nombre))}</h2><span class="muted">${p.proximamente ? '' : MB(p.bytes)}${e.estado === 'listo' || e.hechos ? ` · ${u('usado', 'used')}: ${MB(e.bytes || 0)}` : ''}</span></div>
      <span data-estado aria-live="polite">${estado}</span>
      ${e.estado === 'bajando' || e.estado === 'pausa' || e.estado === 'parcial' ? `<div class="barra" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${pct}" aria-label="${esc(Ln(p.nombre))}"><i style="width:${pct}%"></i></div>` : ''}
      <div class="acciones">${botones}</div></section>`;
  };
  const pintar = async () => {
    const sp = await espacio(), per = await esPersistente();
    main.innerHTML = `<div class="dialogo">${pj('granma', 'contento', { ancho: 100 })}<div class="globo"><span class="quien">Granma</span><h1 style="font-size:1.3rem;margin:0">${u('Descargas: úsala sin internet', 'Downloads: use it offline')}</h1><p>${u('Baja lo que quieras y llévame a todas partes, aunque no haya señal.', 'Download what you want and take me everywhere, even with no signal.')}</p></div></div>
      ${hayCaches() ? '' : `<p class="tarjeta crema2" role="alert">${u('Tu navegador no permite guardar paquetes sin internet.', 'Your browser does not allow saving offline packages.')}</p>`}
      <button class="btn grande olla" data-todo>⬇ ${u('Descargar todo para usar sin internet', 'Download everything to use offline')} (${MB(totalMB)})</button>
      <p class="muted mt">${u('Espacio usado por la app', 'Space used by the app')}: <strong>${MB(sp.usado)}</strong>${sp.cuota ? ` ${u('de', 'of')} ${MB(sp.cuota)}` : ''} · ${per ? '🔒 ' + u('almacenamiento protegido', 'storage protected') : u('almacenamiento sin proteger', 'storage not protected')}</p>
      <div class="mt">${lista.map(fila).join('')}</div>
      <section class="tarjeta crema2"><h2>📲 ${u('Instálala en tu pantalla de inicio', 'Install it on your home screen')}</h2>
        <p>${instalada ? '✓ ' + u('Ya está instalada.', 'Already installed.') : ios ? u('iPhone/iPad: toca <strong>Compartir</strong> y luego <strong>Agregar a pantalla de inicio</strong>. En iOS, instalada protege mejor lo que descargaste.', 'iPhone/iPad: tap <strong>Share</strong> then <strong>Add to Home Screen</strong>. On iOS, installing protects your downloads better.') : u('Android/Chrome: menú ⋮ → <strong>Instalar app</strong>.', 'Android/Chrome: menu ⋮ → <strong>Install app</strong>.')}</p>
        <button class="btn verde" id="btn-instalar" hidden>${u('Instalar app', 'Install app')}</button>
        <p class="muted">${u('Tip: descarga con Wi-Fi, apaga el internet y prueba que todo abre. Biblia NTV/NLT (con licencia) solo funciona con internet.', 'Tip: download on Wi-Fi, turn the internet off and check everything opens. The NTV/NLT Bible (licensed) works online only.')}</p></section>`;
    const bi = main.querySelector('#btn-instalar'); import('../app.js').then((m) => { bi.hidden = !m.promptInstalar; });
  };
  const alInstalable = () => { const bi = main.querySelector('#btn-instalar'); if (bi) bi.hidden = false; };
  addEventListener('instalable', alInstalable);
  await pintar();

  const parar = alProgreso((d) => {
    estados[d.id] = { ...estados[d.id], ...d }; const p = lista.find((x) => x.id === d.id), sec = main.querySelector(`#pq-${d.id}`); if (!p || !sec) return;
    if (d.estado === 'bajando') { const pct = Math.round((d.hechos / d.total) * 100); const b = sec.querySelector('.barra>i'); if (b) { b.style.width = pct + '%'; b.parentElement.setAttribute('aria-valuenow', pct); } else sec.outerHTML = fila(p); }
    else sec.outerHTML = fila(p);
    if (d.estado === 'listo') pedirPersistencia();
  });
  main.onclick = async (e) => {
    const b = e.target.closest('button'); if (!b) return;
    const por = (id) => lista.find((x) => x.id === id);
    if (b.dataset.bajar) descargar(por(b.dataset.bajar), { manual: true });
    else if (b.dataset.pausar) pausar(b.dataset.pausar);
    else if (b.dataset.borrar) { if (confirm(u('¿Borrar este paquete del teléfono?', 'Delete this package from your phone?'))) { await borrar(por(b.dataset.borrar)); estados[b.dataset.borrar] = await estadoDe(por(b.dataset.borrar)); pintar(); } }
    else if (b.hasAttribute('data-todo')) { b.disabled = true; await pedirPersistencia(); await descargarTodo(lista); b.disabled = false; pintar(); }
    else if (b.id === 'btn-instalar') { await instalar(); b.hidden = true; }
  };
  return () => { parar(); main.onclick = null; removeEventListener('instalable', alInstalable); };
}
