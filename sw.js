/* Granma Sazón — Service Worker
 * - Núcleo de la app (HTML/CSS/JS/íconos/personajes): precache al instalar, en `granma-core-<versión>`.
 * - Paquetes descargables (historia, recetas, cotorreo, consejos, biblia): los guarda la página en
 *   `granma-pkg-<id>-f<FMT>` cuando el usuario los descarga; aquí solo se sirven.
 * - Estrategia: cache-first para contenido; stale-while-revalidate para actualizaciones en segundo plano.
 * - Los cachés viejos se limpian en `activate`.
 */
/*NUCLEO:INICIO*/
const VERSION = '7ed45f9aa8';
const NUCLEO = [
 "assets/animaciones/animaciones.css",
 "assets/animaciones/confeti.js",
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
 "data/paquetes.json",
 "demo-animaciones.html",
 "index.html",
 "js/app.js",
 "js/biblia/base.js",
 "js/biblia/config.js",
 "js/biblia/local.js",
 "js/biblia/provider.js",
 "js/biblia/remote.js",
 "js/compartir.js",
 "js/constancia.js",
 "js/datos.js",
 "js/descargas.js",
 "js/ejercicios.js",
 "js/fx.js",
 "js/habla.js",
 "js/personajes.js",
 "js/pruebas.js",
 "js/sound.js",
 "js/state.js",
 "js/util.js",
 "js/vistas/biblia.js",
 "js/vistas/consejos.js",
 "js/vistas/cotorreo.js",
 "js/vistas/descargas.js",
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
    await self.clients.claim();
  })());
});

async function buscar(req) {
  for (const nombre of await caches.keys()) {
    if (!nombre.startsWith('granma-')) continue;
    const cache = await caches.open(nombre);
    const hit = await cache.match(req);
    if (hit) return { hit, cache };
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
    if (req.mode === 'navigate') {
      const exacto = await buscar(req);
      if (exacto) { ev.waitUntil(revalidar(req, exacto.cache)); return exacto.hit; }
      try { return await fetch(req); }
      catch {
        const inicio = await buscar(new Request(aUrl('index.html')));
        return inicio ? inicio.hit : new Response('Sin internet', { status: 503 });
      }
    }
    const encontrado = await buscar(req);
    if (encontrado) { ev.waitUntil(revalidar(req, encontrado.cache)); return encontrado.hit; } // cache-first + SWR
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
