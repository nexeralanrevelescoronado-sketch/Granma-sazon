# Granma Sazón

**Recetas de México para el mundo.** App web instalable (PWA) para aprender **inglés y español** de forma inmersiva, guiada por dos abuelos mexicanos originales: **Granma** (la abuelita tierna que cuenta su vida) y **el Abuelo** (serio, sabio, de pocos pero buenos consejos). Cada capítulo enseña idioma + una receta. Se siente como un juego y **funciona sin internet**.

> El SPEC completo está en [`SPEC.md`](SPEC.md); lo que cambió después, en [`docs/CAMBIOS-AL-SPEC.md`](docs/CAMBIOS-AL-SPEC.md).

## Qué trae

| Sección | Contenido |
|---|---|
| **Historia de Granma** | 6 capítulos de su vida · relato bilingüe · 10 palabras por capítulo · 5 ejercicios (opción múltiple, ordenar frase, emparejar) que **cambian según el interés** · «El consejo del Abuelo» con 2 palabras clave |
| **Recetas** | Mole poblano (la estrella), pozole («Día festivo»), champurrado, buñuelos y ponche navideño · medidas exactas · pasos con **cronómetro** · ES/EN · JSON-LD `Recipe` |
| **El consejo del Abuelo** | 45 consejos (trabajo, amistad, familia, constancia, fe, dinero, cocina) con claves y mini-ejercicio · consejo del día + WhatsApp |
| **Cotorreo con Granma** | 33 chistes, adivinanzas, refranes, trabalenguas y juegos de palabras sanos · «¿Qué quiso decir?» · el Abuelo de remate serio · chiste del día + WhatsApp |
| **Biblia** | Lado a lado o una versión · **RV1909, KJV y WEB** (dominio público, offline) · búsqueda · ruta de ejercicios con versículos ES/EN · NTV/NLT preparadas como proveedores con licencia (apagadas) |
| **Juego** | Racha diaria, XP, **energía del día** (10 «tortillitas»: con más de 10 errores la lección se repite mañana), **pruebas acumulativas** tras cada capítulo (primero en español, luego en inglés), mapa de capítulos, retos de 60 s, misiones diarias, 5 insignias, sonidos opcionales, confeti, **Constancia Granma** (PNG generado en el dispositivo) |
| **Palabras al toque** | Toca cualquier palabra del idioma que aprendes y sale su significado (con 🔊) · glosario general de 2,326 palabras y **glosario bíblico completo** (toda palabra de RV1909, KJV y WEB) · «Mi cuaderno» en el perfil |
| **Hablar** | Ejercicios «Dilo en voz alta» con tres caminos: servicio de voz del teléfono (con permiso), **Oído de Granma** (reconocimiento dentro del teléfono, sin internet, califica palabra por palabra y da estrellas de pronunciación) y medidor de voz propio · «¡Viva México!» y lluvia de tortillas al terminar el capítulo |
| **Sin internet** | Pantalla «Descargas»: paquetes con su peso, progreso, **pausa/reanudación** (los archivos grandes se bajan por pedazos de 4 MB y se retoman donde se cortaron), reanuda sola al volver el internet, espacio usado, borrar por paquete |

## Personajes y voz

- **Granma** (contenta · hablando · cariñosa · pensando · aplaudiendo) y **el Abuelo** (serio · hablando · sonrisa leve · asintiendo · aconsejando con la mano levantada), dibujados como SVG propios en `assets/personajes/`. Cada SVG trae grupos separables `#cuerpo`, `#cabeza`, `#cara > #ojos + #boca`; además hay `<personaje>-cabeza.svg` (sin cara), `<personaje>-cara-<estado>.svg` (cara intercambiable, mismo lienzo) y `<personaje>-cuerpo-<estado>.svg`. Se regeneran con `npm run personajes`.
- **Cuando hablan** (`js/habla.js`): el globo se escribe letra por letra, tocarlo lo completa, y la boca alterna cerrada/abierta con una animación CSS dentro del SVG `-hablando` (respeta `prefers-reduced-motion`: con movimiento reducido el texto aparece completo y la boca queda quieta).
- **Voz** (Web Speech API, es-MX y en-US, `js/voz.js`): **encendida por defecto**; se apaga con el botón 🗣 del encabezado o en Perfil. El Abuelo habla grave y pausado, con voz de hombre si el dispositivo la tiene; Granma, con voz de mujer. Sin internet depende de las voces instaladas en el dispositivo (la app lo avisa). Los botones 🔊 leen una frase puntual aunque la voz automática esté apagada.

## Animaciones (`assets/animaciones/`)

CSS y JS ligeros, sin librerías. Reglas: solo `transform` y `opacity` (nunca layout); acciones de 150–600 ms con ease-out; reposo en loops lentos; `prefers-reduced-motion` ⇒ nada se mueve y los estados cambian al instante; con la pestaña oculta todo se pausa (`html[data-oculta]` + WAAPI).

| Animación | Dónde | Cómo |
|---|---|---|
| Granma aplaude | al acertar un ejercicio | 2 palmadas de 300 ms + saltito |
| Abuelo asiente con el sombrero | al acertar | 2 cabeceos de 300 ms; el sombrero baja un poco más |
| Abuelo levanta la mano abierta | cuando da un consejo | 450 ms, ease-out |
| Boca que alterna | mientras se escribe el globo | `.ma`/`.mb` con `steps(1)`, en cualquier estado |
| Parpadeo + respiración | en reposo | loops de ~5 s y 4,6 s, a ritmo distinto por personaje |
| Cambio de cara | entre estados | fundido de 180 ms |
| Tortillita | al perder una vida | se desinfla y cae (520 ms) |
| Confeti | al terminar una lección | máx. **40** partículas, 520–580 ms |
| Vapor de la olla | logo de la bienvenida y la demo | 3 hilos en loop de 3,4 s (no en el encabezado: se ve todo el día) |

**Rendimiento (revisión de animaciones):** la respiración corre en el `<svg>` raíz y cada hilo de vapor es su propia capa (se animan en el compositor, sin repintar); el parpadeo es una animación corta programada cada 3–7 s (no un loop); el efecto de escritura revela letras/palabras con `opacity` sobre un texto ya maquetado (cero reflujo); las barras de progreso usan `scaleX`; nada de `width`, `height` ni `box-shadow` animados; con la pestaña oculta o con movimiento reducido no arranca ninguna animación nueva. Banco: `node scripts/qa-rendimiento.mjs` (CPU frenada 4×, personaje hablando + confeti + reacciones + vapor).

Los personajes se convierten en SVG en línea al cargar (así cada parte —ojos, boca, sombrero, manos— se anima con CSS y se pausa). **Demo para el iPhone:** `demo-animaciones.html` tiene un botón por animación. Prueba automática: `node scripts/qa-animaciones.mjs`.

## Publicación

Está publicada en Cloudflare Pages: <https://granmasazon.app/> (también en <https://granma-sazon.pages.dev/> y, como respaldo, en GitHub Pages: <https://nexeralanrevelescoronado-sketch.github.io/Granma-sazon/>). Cada push a `main` corre las pruebas y copia `main` a la rama `gh-pages` (`.github/workflows/publicar.yml`); **no edites `gh-pages` a mano**. La dirección pública vive en `scripts/sitio.mjs` (y en `index.html`); si se cambia de dominio, se cambia ahí.

## Ejecutar

No hay dependencias ni paso de compilación en el navegador (HTML + CSS + JS nativo, sin frameworks).

```bash
node scripts/servidor.mjs 8080     # http://localhost:8080
```

> Un service worker necesita `https://` o `localhost`. Para publicar sirve cualquier hosting estático (GitHub Pages: Settings → Pages → rama `main`, carpeta raíz; ya incluye `.nojekyll`). Todas las rutas son relativas, así que funciona también en un subdirectorio (`/granma-sazon/`).

## Estructura

```
index.html · manifest.webmanifest · sw.js     PWA y service worker
css/app.css                                    estilos (móvil primero, variables de marca)
js/                                            app.js (router) · state.js (juego) · ejercicios.js · descargas.js ·
                                               sound.js · fx.js · constancia.js · compartir.js · vistas/ · biblia/ ·
                                               glosario.js · voz.js · oido.js · oido-propio.js · pruebas.js
data/                                          historia, recetas, consejos, cotorreo, paquetes (generados) y biblia/
assets/personajes · logo · iconos              SVG de los abuelos, logo y PNG 192/512/maskable
assets/oido/                                   Oído de Granma (Vosk + modelos, Apache-2.0; paquete opcional)
api/biblia.js                                  proxy serverless para versiones con licencia
scripts/                                       generadores y pruebas con navegador real
scripts/datos/*.mjs                            ★ FUENTE del contenido (se edita aquí)
test/contenido.test.mjs                        pruebas del contenido y de las reglas del SPEC
docs/                                          BIBLIA.md · EXTENDER.md · CAMBIOS-AL-SPEC.md · DERECHOS-Y-LICENCIAS.md · GUION-ABUELO.md/.pdf
```

### Flujo de trabajo

1. Edita el contenido en `scripts/datos/*.mjs` (historia, recetas, consejos, cotorreo, ruta Biblia).
2. `npm run build` → regenera `data/*.json`, `data/paquetes.json` (con el peso real de cada paquete), `recetas/*.html` (SEO + JSON-LD) y **la lista y versión del núcleo dentro de `sw.js`**. Hay que correrlo antes de subir (la prueba lo exige).
3. `npm test` → valida contenido (≥ 40 consejos, ≥ 30 cotorreos, claves dentro del texto, cero groserías, sin marcas ajenas, NTV/NLT sin texto, sin claves de API en el frontend, íconos, peso < 50 MB…).
4. `npm run qa` → navegador real (Chromium/Playwright): instalar → descargar → **modo avión** → lección y receta completas; y pausa/corte/reanudación de la descarga.

Otros scripts: `npm run personajes` (SVG de Granma y el Abuelo), `npm run logo` (logo e íconos PNG), `npm run biblia` (vuelve a generar los JSON de la Biblia desde fuentes de dominio público).

## Cómo funciona el modo sin internet

- **Núcleo** (HTML/CSS/JS/íconos/personajes, ~230 KB): se precachea al instalar el service worker en `granma-core-<versión>`.
- **Paquetes** (Historia · Recetas · Cotorreo · Consejos · Recetas italianas · Biblia): los guarda la página en su propio caché, `granma-pkg-<id>-f<FMT>`, cuando el usuario los descarga. Cada uno se mide, se pausa, se reanuda y se borra por separado.
- **Estrategia:** *cache-first* para el contenido y *stale-while-revalidate* para las actualizaciones en segundo plano. Los cachés están versionados y los viejos se limpian en `activate` (los paquetes sobreviven a las actualizaciones de la app; solo se borran si cambia el formato `FMT`).
- Se pide `navigator.storage.persist()` y se explica cómo instalarla en la pantalla de inicio (en iOS protege mejor lo descargado).
- Indicador visible «Sin internet — modo descargado» y mensajes claros si algo no está descargado.
- Progreso, racha, XP, insignias y la Constancia viven en `localStorage` y se generan en el dispositivo: 100 % offline.
- **Peso:** el paquete base ≈ **13.6 MB** (meta < 50 MB; los dos «Oído de Granma» son opcionales, ≈ 45 MB cada uno). Personajes en SVG; no hay fotos, audio ni video (los sonidos se sintetizan con WebAudio). Si más adelante se agregan fotos, deben ir en WebP.

## Calidad medida

- Lighthouse (móvil): bienvenida y página de receta **100 / 100 / 100 / 100** (rendimiento, accesibilidad, buenas prácticas, SEO); inicio con sesión iniciada **96–97** de rendimiento y 100 en lo demás; CLS 0. Con red y CPU lentas aplicadas de verdad, el inicio pinta en 1,5 s y muestra el contenido en 2,8 s.
- axe-core en **todas** las pantallas (móvil 390 px y escritorio 1280 px, ES y EN): 0 violaciones; sin desborde horizontal; botones ≥ 44 px.
- `prefers-reduced-motion` respetado (CSS y confeti en JS). Sin librerías de animación.

## Derechos y licencias

- Personajes, logo, textos, chistes, consejos y recetas: creación original de este proyecto.
- Biblia: **RV1909**, **KJV** y **WEB** son de dominio público (ver `docs/BIBLIA.md` para fuentes y la nota sobre la KJV en el Reino Unido). **NTV y NLT** (Tyndale House) **no están en el repositorio**; solo existe la capa para consultarlas con licencia a través de un proxy, apagada por defecto.

## Skill del proyecto: `contenido-granma`

En `.claude/skills/contenido-granma/` (viaja con el repo). Genera cotorreos, consejos, capítulos, recetas y ejercicios de Biblia con la misma voz, esquema y reglas de contenido sano, y trae `scripts/validar.mjs` (también corre en `npm test`). Ver su `SKILL.md`.
