/* Granma Sazón — Service Worker
 * - Núcleo de la app (HTML/CSS/JS/íconos/personajes): precache al instalar, en `granma-core-<versión>`.
 * - Paquetes descargables (historia, recetas, cotorreo, consejos, biblia): los guarda la página en
 *   `granma-pkg-<id>-f<FMT>` cuando el usuario los descarga; aquí solo se sirven.
 * - Estrategia: cache-first para contenido; stale-while-revalidate para actualizaciones en segundo plano.
 * - Los cachés viejos se limpian en `activate`.
 */
/*NUCLEO:INICIO*/
const VERSION = '8283730dd3';
const NUCLEO = [
 "assets/animaciones/animaciones.css",
 "assets/animaciones/confeti.js",
 "assets/animaciones/fiesta.js",
 "assets/animaciones/index.js",
 "assets/animaciones/personajes.js",
 "assets/animaciones/tortilla.js",
 "assets/animaciones/vapor.js",
 "assets/animaciones/visibilidad.js",
 "assets/iconos/apple-touch-icon.png",
 "assets/iconos/icon-192.png",
 "assets/iconos/icon-512.png",
 "assets/iconos/icon-maskable-192.png",
 "assets/iconos/icon-maskable-512.png",
 "assets/logo/icono-maskable.svg",
 "assets/logo/icono.svg",
 "assets/logo/logo.svg",
 "assets/personajes/abuelo-aconsejando.svg",
 "assets/personajes/abuelo-asintiendo.svg",
 "assets/personajes/abuelo-hablando.svg",
 "assets/personajes/abuelo-serio.svg",
 "assets/personajes/abuelo-sonrisa.svg",
 "assets/personajes/granma-aplaudiendo.svg",
 "assets/personajes/granma-carinosa.svg",
 "assets/personajes/granma-contenta.svg",
 "assets/personajes/granma-hablando.svg",
 "assets/personajes/granma-pensando.svg",
 "css/app.css",
 "data/audios.json",
 "data/glosario.json",
 "data/paquetes.json",
 "demo-animaciones.html",
 "index.html",
 "js/app.js",
 "js/biblia/base.js",
 "js/biblia/config.js",
 "js/biblia/local.js",
 "js/biblia/provider.js",
 "js/biblia/remote.js",
 "js/coloquial.js",
 "js/compartir.js",
 "js/constancia.js",
 "js/cronometros.js",
 "js/datos.js",
 "js/descargas.js",
 "js/ejercicios.js",
 "js/escucha.js",
 "js/fx.js",
 "js/glosario.js",
 "js/habla.js",
 "js/lento.js",
 "js/oido-propio.js",
 "js/oido.js",
 "js/personajes.js",
 "js/porras.js",
 "js/pruebas.js",
 "js/sound.js",
 "js/state.js",
 "js/util.js",
 "js/vistas/biblia.js",
 "js/vistas/consejos.js",
 "js/vistas/cotorreo.js",
 "js/vistas/descargas.js",
 "js/vistas/hablar.js",
 "js/vistas/historia.js",
 "js/vistas/inicio.js",
 "js/vistas/leccion.js",
 "js/vistas/onboarding.js",
 "js/vistas/perfil.js",
 "js/vistas/prueba.js",
 "js/vistas/receta.js",
 "js/vistas/recetas.js",
 "js/vistas/reto.js",
 "js/vistas/sin-energia.js",
 "js/voz.js",
 "manifest.webmanifest"
];
/*NUCLEO:FIN*/
const FMT = 1; // sube este número solo si cambia el formato de los paquetes (borra los paquetes viejos)
const CORE = `granma-core-${VERSION}`;
const PKG = 'granma-pkg-';
const ALCANCE = self.registration.scope;
const aUrl = (ruta) => new URL(ruta, ALCANCE).href;

self.addEventListener('install', (ev) => {
  ev.waitUntil((async () => {
    const cache = await caches.open(CORE);
    await cache.addAll(NUCLEO.map((r) => new Request(aUrl(r), { cache: 'reload' })));
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (ev) => {
  ev.waitUntil((async () => {
    for (const nombre of await caches.keys()) {
      const viejoNucleo = nombre.startsWith('granma-core-') && nombre !== CORE;
      const viejoPaquete = nombre.startsWith(PKG) && !nombre.endsWith(`-f${FMT}`);
      if (viejoNucleo || viejoPaquete) await caches.delete(nombre);
    }
    // Respuesta adelantada de navegación: la página empieza a bajar mientras el service worker despierta.
    try { if (self.registration.navigationPreload) await self.registration.navigationPreload.enable(); } catch { /* sin soporte */ }
    // Sin clients.claim(): en la primera visita el service worker NO toma el control de la página que ya está cargando
    // (en WebKit eso puede dejar peticiones colgadas). Controla desde la siguiente vez que se abre; las actualizaciones sí pasan solas.
  })());
});

async function buscar(req) {
  const nombres = (await caches.keys()).filter((n) => n.startsWith('granma-')).sort((a, b) => (b === CORE) - (a === CORE));
  for (const nombre of nombres) {
    const cache = await caches.open(nombre);
    const hit = await cache.match(req);
    if (hit) return { hit, cache, nombre };
  }
  return null;
}

async function revalidar(req, cache) {
  try {
    const res = await fetch(req, { cache: 'no-cache' });
    if (res && res.ok) await cache.put(req, res.clone());
    return res;
  } catch { return null; }
}

self.addEventListener('fetch', (ev) => {
  const req = ev.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;           // solo lo propio; nada de terceros
  if (url.pathname.includes('/api/')) return;           // la API (proxy de Biblia con licencia) va directo a la red

  ev.respondWith((async () => {
    // Navegación: la app es una sola página; las recetas estáticas se sirven de su caché si existen.
    // Navegación: primero la red (con la respuesta adelantada del navegador si existe), pero NUNCA esperando sin límite:
    // si en 4 s no contesta, se sirve la copia guardada de la página. Así la página nunca queda en blanco esperando.
    if (req.mode === 'navigate') {
      const copia = async () => { const n = await caches.open(CORE); return (await n.match(req, { ignoreSearch: true })) || (await buscar(req))?.hit || (await n.match(aUrl('index.html'))); };
      const red = (async () => { const pre = await ev.preloadResponse; return pre || fetch(req); })();
      const limite = new Promise((ok) => setTimeout(ok, 4000, 'tiempo'));
      try {
        const r = await Promise.race([red, limite]);
        if (r !== 'tiempo' && r) return r;
        const guardada = await copia(); if (guardada) return guardada;
        return await red;                                   // sin copia: se espera a la red (como sin service worker)
      } catch {
        const guardada = await copia();
        return guardada || new Response('Sin internet', { status: 503, headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
      }
    }
    const encontrado = await buscar(req);
    // Los paquetes que la persona descargó son de una versión fija: se sirven tal cual, sin volver a bajarlos.
    // Código (js/css/html) y paquetes: se sirven tal cual; el código solo cambia con una versión nueva del service worker, para no mezclar archivos viejos con nuevos.
    // Solo los datos sueltos se refrescan en segundo plano.
    if (encontrado) { if (!encontrado.nombre.startsWith(PKG) && !/\.(js|css|html)$/.test(url.pathname) && url.pathname !== new URL(ALCANCE).pathname) ev.waitUntil(revalidar(req, encontrado.cache)); return encontrado.hit; }
    try {
      const res = await fetch(req);
      // Solo el núcleo se guarda al navegar; los paquetes se guardan únicamente al descargarlos.
      return res;
    } catch {
      if (url.pathname.endsWith('.json')) {
        return new Response(JSON.stringify({ sinInternet: true }), { status: 503, headers: { 'Content-Type': 'application/json' } });
      }
      return new Response('', { status: 503 });
    }
  })());
});

// La página pide tomar el control cuando ya abrió y pasaron unos segundos (nunca durante la carga): así la primera visita
// también funciona sin internet sin que el service worker se meta a media carga.
self.addEventListener('message', (ev) => { if (ev.data === 'tomar-control') ev.waitUntil(self.clients.claim()); });

// Notificación del cronómetro: al tocarla se enfoca la app (o se abre si estaba cerrada).
self.addEventListener('notificationclick', (ev) => {
  ev.notification.close();
  ev.waitUntil((async () => {
    const ventanas = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    if (ventanas.length) return ventanas[0].focus();
    return self.clients.openWindow(ALCANCE);
  })());
});
