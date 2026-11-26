// Pruebas del contenido y de las reglas del SPEC. Ejecutar:  node --test test/
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const leer = (r) => readFileSync(join(RAIZ, r), 'utf8');
const json = (r) => JSON.parse(leer(r));
const norm = (s) => s.toLowerCase();
const consejos = json('data/consejos.json'), cotorreos = json('data/cotorreo.json'), historia = json('data/historia.json'), recetas = json('data/recetas.json');

// Lista de palabras que NO deben aparecer en el contenido sano (groserías, albures, burlas, culpa/miedo).
const PROHIBIDAS = ['puta', 'puto', 'pendejo', 'pendeja', 'cabrón', 'cabron', 'verga', 'chingar', 'chingada', 'culero', 'mierda', 'coño', 'joder', 'carajo', 'idiota', 'estúpid', 'imbécil', 'maricón', 'pinche', 'fuck', 'shit', 'bitch', 'asshole', 'damn', 'stupid', 'idiot', 'infierno', 'hell', 'castigo', 'te vas a arrepentir', 'culpa', 'vergüenza'];
const textoDe = (o) => JSON.stringify(o).toLowerCase();

test('consejos del Abuelo: ≥ 40, bilingües, 2-3 claves y mini-ejercicio', () => {
  assert.ok(consejos.length >= 40, `hay ${consejos.length}`);
  const temas = new Set(consejos.map((c) => c.tema));
  for (const t of ['trabajo', 'amistad', 'familia', 'constancia', 'fe', 'dinero', 'cocina']) assert.ok(temas.has(t), 'falta tema ' + t);
  for (const c of consejos) {
    assert.ok(c.es && c.en, `consejo ${c.id} sin ES/EN`);
    assert.ok(c.clave.length >= 2 && c.clave.length <= 3, `consejo ${c.id}: claves`);
    for (const k of c.clave) { assert.ok(norm(c.es).includes(norm(k.es)), `consejo ${c.id}: «${k.es}» no está en ES`); assert.ok(norm(c.en).includes(norm(k.en)), `consejo ${c.id}: «${k.en}» no está en EN`); }
    assert.equal(c.q.mal.length, 2, `consejo ${c.id}: 2 distractores`); assert.ok(c.q.ok.es && c.q.ok.en);
  }
});

test('cotorreos de Granma: ≥ 30, 5 temas, 3 claves y pregunta', () => {
  assert.ok(cotorreos.length >= 30, `hay ${cotorreos.length}`);
  const porTema = {}; for (const c of cotorreos) porTema[c.tema] = (porTema[c.tema] || 0) + 1;
  for (const t of ['cocina', 'trabajo', 'amigos', 'fe', 'viajes']) assert.ok(porTema[t] >= 5, `tema ${t}: ${porTema[t]}`);
  const tipos = new Set(cotorreos.map((c) => c.tipo)); for (const t of ['chiste', 'adivinanza', 'refrán', 'trabalenguas', 'juego de palabras']) assert.ok(tipos.has(t), 'falta tipo ' + t);
  for (const c of cotorreos) {
    assert.equal(c.clave.length, 3, `cotorreo ${c.id}: 3 claves`);
    for (const k of c.clave) { assert.ok(norm(c.es).includes(norm(k.es)), `cotorreo ${c.id}: «${k.es}» no está en ES`); assert.ok(norm(c.en).includes(norm(k.en)), `cotorreo ${c.id}: «${k.en}» no está en EN`); }
    assert.equal(c.q.mal.length, 2); assert.ok(c.q.p.es && c.q.p.en);
  }
  assert.ok(cotorreos.some((c) => c.abuelo), 'el Abuelo debe aparecer de remate en algunos');
});

test('contenido sano: cero groserías, burlas, culpa ni miedo', () => {
  const todo = textoDe([consejos, cotorreos, historia, recetas, ...['historia2', 'coloquial', 'reglas', 'platicas'].map((f) => json(`data/${f}.json`))]);
  const RAICES = ['estúpid', 'pendej', 'imbécil', 'maric', 'stupid'];
  for (const p of PROHIBIDAS) assert.ok(!new RegExp(`(^|[^\\p{L}])${p}${RAICES.some((r) => p.startsWith(r)) ? '' : '($|[^\\p{L}])'}`, 'u').test(todo), `palabra no permitida: «${p}»`);
});

test('no se menciona ni imita a otras apps, marcas o personajes', () => {
  const marcas = ['duolingo', 'babbel', 'disney', 'pixar', 'netflix', 'ghibli', 'mafalda', 'abuelita de coco', 'mama coco', 'mamá coco', 'rosetta', 'busuu', 'memrise', 'canva'];
  const archivos = ['index.html', 'manifest.webmanifest', 'README.md', 'sw.js', 'css/app.css', ...readdirSync(join(RAIZ, 'js'), { recursive: true }).filter((f) => f.endsWith('.js')).map((f) => 'js/' + f), 'data/historia.json', 'data/recetas.json', 'data/consejos.json', 'data/cotorreo.json'];
  for (const a of archivos) { const t = leer(a).toLowerCase(); for (const m of marcas) assert.ok(!new RegExp(`(^|[^\\p{L}])${m}($|[^\\p{L}])`, 'u').test(t), `${a} menciona «${m}»`); }
  for (const f of readdirSync(join(RAIZ, 'assets/personajes'))) { const t = leer('assets/personajes/' + f).toLowerCase(); for (const m of marcas) assert.ok(!t.includes(m)); }
});

test('Historia 1: 6 capítulos, 8-10 palabras, relato bilingüe y consejo con 2 claves', () => {
  assert.equal(historia.capitulos.length, 6);
  assert.deepEqual(historia.capitulos.map((c) => c.id), [1, 2, 3, 4, 5, 6]);
  for (const c of historia.capitulos) {
    assert.ok(c.palabras.length >= 8 && c.palabras.length <= 10, `cap ${c.id}: ${c.palabras.length} palabras`);
    assert.ok(c.relato.es.length >= 3 && c.relato.es.length === c.relato.en.length, `cap ${c.id}: relato ES/EN`);
    assert.equal(c.consejo.clave.length, 2);
    for (const k of c.consejo.clave) { assert.ok(norm(c.consejo.es).includes(norm(k.es))); assert.ok(norm(c.consejo.en).includes(norm(k.en))); }
    assert.ok(recetas.some((r) => r.id === c.receta), `cap ${c.id}: receta ${c.receta}`);
    for (const interes of ['trabajo', 'amigos', 'biblia', 'viajes', 'cocina']) {
      const ej = c.ejemplos[interes]; assert.equal(ej.length, 3, `cap ${c.id} ${interes}`);
      assert.equal(new Set(ej.map((e) => e.we)).size, 3, `cap ${c.id} ${interes}: palabras repetidas`);
      for (const e of ej) {
        assert.ok(c.palabras.some((p) => norm(p.en) === norm(e.we) && norm(p.es) === norm(e.ws)), `cap ${c.id}: «${e.we}/${e.ws}» no es del capítulo`);
        assert.ok(new RegExp(`\\b${e.we}\\b`, 'i').test(e.en), `cap ${c.id}: «${e.we}» no está en «${e.en}»`);
        assert.ok(new RegExp(`(^|[^\\p{L}])${e.ws}([^\\p{L}]|$)`, 'iu').test(e.es), `cap ${c.id}: «${e.ws}» no está en «${e.es}»`);
      }
    }
  }
});

test('los ejercicios cambian según el interés (5 por capítulo, en ambos idiomas)', async () => {
  globalThis.localStorage = { _d: {}, getItem(k) { return this._d[k] ?? null; }, setItem(k, v) { this._d[k] = v; } };
  const { estado } = await import('../js/state.js'); const { ejerciciosDeCapitulo } = await import('../js/ejercicios.js');
  for (const aprende of ['en', 'es']) {
    estado().perfil.aprende = aprende;
    for (const c of historia.capitulos) {
      const huellas = new Set();
      for (const interes of ['trabajo', 'amigos', 'biblia', 'viajes', 'cocina']) {
        const items = ejerciciosDeCapitulo(c, interes).filter((x) => x.tipo !== 'di' && !x.letras && !x.oir); assert.equal(items.length, 5);
        assert.deepEqual(items.map((i) => i.tipo), ['mcq', 'mcq', 'pares', 'orden', 'mcq']);
        for (const it of items.filter((i) => i.tipo === 'mcq')) { assert.ok(it.opciones.includes(it.correcta), 'la correcta está en las opciones'); assert.equal(new Set(it.opciones).size, it.opciones.length, 'opciones repetidas'); }
        assert.ok(items[1].frase.includes('_____')); assert.ok(items[2].pares.length >= 3);
        huellas.add(JSON.stringify([items[1].frase, items[3].respuesta]));
      }
      assert.equal(huellas.size, 5, `cap ${c.id} (${aprende}): los ejemplos deben cambiar por interés`);
    }
  }
});

test('recetas: mole, pozole, champurrado, buñuelos y ponche con medidas, pasos y cronómetro', () => {
  assert.deepEqual(recetas.map((r) => r.id).sort(), ['bunuelos', 'champurrado', 'mole', 'ponche', 'pozole']);
  assert.equal(recetas.find((r) => r.id === 'mole').estrella, true);
  assert.equal(recetas.find((r) => r.id === 'pozole').insignia, 'dia-festivo'); assert.equal(recetas.find((r) => r.id === 'mole').insignia, 'maestro-mole');
  for (const r of recetas) {
    assert.ok(r.nombre.es && r.nombre.en && r.porciones > 0);
    for (const i of r.ingredientes) { assert.equal(typeof i.cant, 'number'); assert.ok(i.cant > 0 && i.un && i.es && i.en, `${r.id}: ingrediente incompleto`); }
    assert.ok(r.pasos.length >= 5 && r.pasos.every((p) => p.es && p.en), `${r.id}: pasos ES/EN`);
    assert.ok(r.pasos.some((p) => p.min > 0), `${r.id}: al menos un cronómetro`);
  }
});

test('Biblia: solo dominio público incluido; NTV/NLT apagadas y sin texto en el repo', async () => {
  assert.deepEqual(readdirSync(join(RAIZ, 'data/biblia')).filter((f) => statSync(join(RAIZ, 'data/biblia', f)).isDirectory()).sort(), ['kjv', 'rv1909', 'web']);
  const { FLAGS, VERSIONES } = await import('../js/biblia/config.js');
  assert.deepEqual(FLAGS, { ntv: false, nlt: false });
  for (const id of ['ntv', 'nlt']) { const v = VERSIONES.find((x) => x.id === id); assert.equal(v.activa, false); assert.equal(v.offline, false); assert.equal(v.licenciaOffline, 'pendiente-de-confirmar'); assert.ok(v.attribution.es && v.attribution.en); }
  for (const id of ['rv1909', 'kjv', 'web']) assert.ok(VERSIONES.find((x) => x.id === id).attribution.es);
  const libros = json('data/biblia/libros.json').libros; assert.equal(libros.length, 66);
  for (const v of ['rv1909', 'kjv', 'web']) { let n = 0; for (const l of libros) n += json(`data/biblia/${v}/${l.id}.json`).c.flat().length; assert.ok(n > 31000 && n < 31200, `${v}: ${n} versículos`); }
  // fragmentos conocidos de NTV/NLT (con derechos) no deben aparecer en ningún JSON
  const rutas = readdirSync(join(RAIZ, 'data'), { recursive: true }).filter((f) => f.endsWith('.json'));
  for (const r of rutas) { const t = leer('data/' + r); for (const frag of ['New Living Translation', 'Nueva Traducción Viviente', 'Tyndale']) assert.ok(!t.includes(frag), `data/${r} contiene «${frag}»`); }
});

test('Biblia: la ruta de ejercicios usa palabras que existen en RV1909 y KJV', () => {
  const ruta = json('data/biblia/ruta.json'); assert.ok(ruta.length >= 8);
  for (const p of ruta) {
    const rv = json(`data/biblia/rv1909/${p.ref.libro}.json`).c[p.ref.cap - 1], kj = json(`data/biblia/kjv/${p.ref.libro}.json`).c[p.ref.cap - 1];
    const tEs = rv.slice(p.ref.desde - 1, p.ref.hasta).join(' '), tEn = kj.slice(p.ref.desde - 1, p.ref.hasta).join(' ');
    for (const [es, en] of p.pares) { assert.ok(norm(tEs).includes(norm(es)), `${p.id}: «${es}» no está en RV1909`); assert.ok(norm(tEn).includes(norm(en)), `${p.id}: «${en}» no está en KJV`); }
  }
});

test('la clave de API nunca va en el frontend', () => {
  for (const f of readdirSync(join(RAIZ, 'js'), { recursive: true }).filter((x) => x.endsWith('.js'))) {
    const t = leer('js/' + f); assert.ok(!/NLT_API_KEY|API_BIBLE_KEY|api-key|process\.env/i.test(t), `js/${f} toca claves`);
  }
  const proxy = leer('api/biblia.js'); assert.ok(proxy.includes('process.env.NLT_API_KEY') && proxy.includes('process.env.API_BIBLE_KEY'));
  assert.ok(!/key=[A-Za-z0-9]{16,}/.test(proxy), 'no debe haber claves escritas');
});

test('PWA: manifest con íconos 192/512/maskable y peso total < 50 MB', () => {
  const m = json('manifest.webmanifest'); const tam = (s, p) => m.icons.some((i) => i.sizes === s && (i.purpose || 'any').includes(p));
  assert.ok(tam('192x192', 'any') && tam('512x512', 'any') && tam('512x512', 'maskable'));
  for (const i of m.icons) assert.ok(existsSync(join(RAIZ, i.src)), i.src);
  const png = readFileSync(join(RAIZ, 'assets/iconos/icon-512.png')); assert.equal(png.readUInt32BE(16), 512);
  const p = json('data/paquetes.json').paquetes; assert.deepEqual(p.map((x) => x.id), ['historia', 'recetas', 'cotorreo', 'consejos', 'italianas', 'biblia', 'oido-en', 'oido-es']);
  const total = p.filter((x) => !x.opcional).reduce((s, x) => s + x.bytes, 0); assert.ok(total < 50 * 1048576, `total ${total}`);
  assert.equal(p.find((x) => x.id === 'italianas').proximamente, true);
  const sw = leer('sw.js'); assert.ok(!sw.includes("VERSION = 'dev'"), 'corre «node scripts/build.mjs» antes de subir'); assert.ok(sw.includes('"index.html"'));
});

test('personajes: 5 estados por abuelo, con cabeza, cuerpo, ojos y boca como grupos separables', () => {
  const estados = { granma: ['contenta', 'hablando', 'carinosa', 'pensando', 'aplaudiendo'], abuelo: ['serio', 'hablando', 'sonrisa', 'asintiendo', 'aconsejando'] };
  for (const [q, lista] of Object.entries(estados)) {
    assert.ok(existsSync(join(RAIZ, `assets/personajes/${q}-cabeza.svg`)));
    for (const e of lista) for (const pref of ['', 'cara-', 'cuerpo-']) {
      const f = `assets/personajes/${q}-${pref}${e}.svg`; assert.ok(existsSync(join(RAIZ, f)), f); assert.ok(statSync(join(RAIZ, f)).size < 14000, f + ' pesa demasiado');
    }
    for (const e of lista) { const t = leer(`assets/personajes/${q}-${e}.svg`); for (const id of ['cuerpo', 'cabeza', 'cara', 'ojos', 'boca']) assert.ok(t.includes(`id="${id}"`), `${q}-${e}: falta grupo #${id}`); }
    const hab = leer(`assets/personajes/${q}-hablando.svg`); assert.ok(hab.includes('class="ma"') && hab.includes('class="mb"') && hab.includes('prefers-reduced-motion'), 'boca animada que respeta reduced-motion');
  }
});

test('voz: encendida por defecto, voz grave y pausada para el Abuelo, es-MX / en-US y aviso sin internet', async () => {
  globalThis.localStorage ||= { _d: {}, getItem(k) { return this._d[k] ?? null; }, setItem(k, v) { this._d[k] = v; } };
  const { estado } = await import('../js/state.js'); assert.equal(estado().ajustes.voz, true); assert.equal(estado().ajustes.vozV, 2);
  const v = leer('js/voz.js'); assert.ok(v.includes("'es-MX'") && v.includes("'en-US'") && v.includes('SpeechSynthesisUtterance'));
  const h = leer('js/habla.js'); assert.ok(/voces instaladas en tu dispositivo/.test(h) && /installed on your device/.test(h), 'aviso sin internet');
  const { elegirVoz, PERFIL } = await import('../js/voz.js');
  assert.ok(PERFIL.abuelo.pitch < 0.8 && PERFIL.abuelo.rate < 0.9, 'el Abuelo habla grave y pausado');
  assert.ok(PERFIL.granma.pitch > PERFIL.abuelo.pitch);
  const voces = [{ name: 'Mónica', lang: 'es-ES' }, { name: 'Paulina', lang: 'es-MX' }, { name: 'Jorge', lang: 'es-ES' }, { name: 'Juan', lang: 'es-MX' }, { name: 'Samantha', lang: 'en-US' }, { name: 'Aaron', lang: 'en-US' }];
  assert.equal(elegirVoz(voces, 'es', 'abuelo').name, 'Juan', 'Abuelo: voz de hombre y de México');
  assert.equal(elegirVoz(voces, 'es', 'granma').name, 'Paulina', 'Granma: voz de mujer y de México');
  assert.equal(elegirVoz(voces, 'en', 'abuelo').name, 'Aaron'); assert.equal(elegirVoz(voces, 'en', 'granma').name, 'Samantha');
  assert.equal(elegirVoz([{ name: 'Paulina', lang: 'es-MX' }], 'es', 'abuelo').name, 'Paulina', 'si solo hay una voz, se usa (con tono grave)');
  assert.equal(elegirVoz([{ name: 'Samantha', lang: 'en-US' }], 'es', 'abuelo'), null);
  const { pj, estadoValido } = await import('../js/personajes.js'); assert.match(pj('granma', 'carinosa'), /granma-carinosa\.svg/); assert.equal(estadoValido('abuelo', 'animo'), 'aconsejando');
});

test('animaciones: módulo propio, solo transform/opacity, movimiento reducido, pausa oculta, confeti ≤ 40, demo', () => {
  for (const f of ['animaciones.css', 'personajes.js', 'confeti.js', 'tortilla.js', 'vapor.js', 'visibilidad.js', 'index.js']) assert.ok(existsSync(join(RAIZ, 'assets/animaciones', f)), f);
  const css = leer('assets/animaciones/animaciones.css');
  for (const [, nombre, cuerpo] of css.matchAll(/@keyframes\s+([\w-]+)\s*\{([\s\S]*?\})\s*\}/g)) {
    const malas = [...cuerpo.matchAll(/([a-z-]+)\s*:/g)].map((m) => m[1]).filter((p) => !['transform', 'opacity'].includes(p));
    assert.deepEqual(malas, [], `@keyframes ${nombre} anima ${malas}`);
  }
  assert.ok(css.includes('prefers-reduced-motion:no-preference') && css.includes('prefers-reduced-motion:reduce'));
  assert.ok(css.includes('html[data-oculta]') && css.includes('animation-play-state:paused'), 'pausa con pestaña oculta');
  assert.ok(!/transition\s*:\s*all/.test(css) && !/scale\(0\)/.test(css));
  // ningún nombre de @keyframes repetido entre las hojas (uno pisaba al otro: el cronómetro se estiraba)
  const nombres = [...leer('css/app.css').matchAll(/@keyframes\s+([\w-]+)/g), ...css.matchAll(/@keyframes\s+([\w-]+)/g)].map((m) => m[1]);
  assert.deepEqual(nombres.filter((n, i) => nombres.indexOf(n) !== i), [], 'nombres de @keyframes duplicados');
  // nada de layout animado en la app: barras con scaleX, sin transition de width/height/box-shadow
  const app = leer('css/app.css'); assert.ok(!/transition:[^;}]*(width|height|margin|padding|top|left|box-shadow)/.test(app), 'transition de propiedad no GPU en app.css');
  for (const f of readdirSync(join(RAIZ, 'js'), { recursive: true }).filter((x) => x.endsWith('.js'))) assert.ok(!/style\.(width|height)\s*=/.test(leer('js/' + f)), `js/${f} anima width/height`);
  assert.ok(!/@keyframes parpadeo/.test(css) && !/\.confeti-cap i\{[^}]*will-change/.test(css), 'parpadeo programado y sin will-change en 40 partículas');
  assert.ok(leer('assets/animaciones/confeti.js').includes('MAX_CONFETI = 40'));
  assert.ok(/visibilitychange/.test(leer('assets/animaciones/visibilidad.js')));
  const demo = leer('demo-animaciones.html'); assert.ok((demo.match(/data-a="/g) || []).length >= 11, 'un botón por animación');
  for (const t of ['respira', 'sombrero', 'mano', 'aplauso']) assert.ok(leer('assets/personajes/abuelo-aconsejando.svg').includes(`id="${t}"`) || leer('assets/personajes/granma-aplaudiendo.svg').includes(`id="${t}"`) || leer('assets/personajes/abuelo-serio.svg').includes(`id="${t}"`), 'grupo ' + t);
  assert.ok(json('data/paquetes.json').paquetes.filter((x) => !x.opcional).reduce((s, x) => s + x.bytes, 0) < 50 * 1048576);
  assert.ok(leer('sw.js').includes('assets/animaciones/animaciones.css') && leer('sw.js').includes('demo-animaciones.html'), 'animaciones precacheadas');
});

test('energía diaria: 10 errores permitidos, el n.º 11 la agota y al día siguiente se recupera', async () => {
  globalThis.localStorage ||= { _d: {}, getItem(k) { return this._d[k] ?? null; }, setItem(k, v) { this._d[k] = v; } };
  const st = await import('../js/state.js');
  assert.equal(st.MAX_VIDAS, 10);
  st.estado().vidas = { n: 10, fecha: '', agotada: false };
  assert.equal(st.vidas(), 10); assert.equal(st.sinEnergia(), false);
  for (let i = 0; i < 10; i++) st.perderVida();
  assert.equal(st.vidas(), 0); assert.equal(st.sinEnergia(), false, 'con 10 errores todavía se puede seguir');
  st.perderVida();
  assert.equal(st.sinEnergia(), true, 'con más de 10 errores se acaba la energía');
  st.marcarRepetir({ cap: 2, titulo: 'Domingo de pozole' });
  assert.equal(st.tocaRepetir(), false, 'hoy no toca: se repite mañana');
  st.estado().vidas.fecha = '2000-01-01'; st.estado().repetir.fecha = '2000-01-01';   // «mañana»
  assert.equal(st.vidas(), 10); assert.equal(st.sinEnergia(), false); assert.equal(st.tocaRepetir(), true);
  st.limpiarRepetir(); assert.equal(st.estado().repetir, null);
  assert.ok(!('darVida' in st) && !('REGEN_MS' in st), 'ya no hay regeneración durante el día');
});

test('pruebas: acumulativas, primero en el idioma propio y después en el que se aprende, y van creciendo', async () => {
  const { armarPrueba, tamanoPrueba, estrellasDe, NOTA_MINIMA } = await import('../js/pruebas.js');
  let anterior = 0;
  for (const c of historia.capitulos) {
    const t = tamanoPrueba(c.id); assert.ok(t.palabras + t.frases >= anterior, 'cada prueba es igual o más grande'); anterior = t.palabras + t.frases;
    for (const [tgt, nat] of [['en', 'es'], ['es', 'en']]) for (const interes of ['trabajo', 'amigos', 'biblia', 'viajes', 'cocina']) {
      const p = armarPrueba(historia, c.id, interes, tgt, nat);
      assert.equal(p.parteA.length, p.parteB.length, 'cada palabra y frase se pregunta en los dos idiomas');
      assert.equal(p.total, (p.palabras.length + p.frases.length) * 2);
      assert.ok(p.parteA.every((q) => q.idioma === nat) && p.parteB.every((q) => q.idioma === tgt), 'parte A en el idioma propio, parte B en el que aprende');
      for (const q of [...p.parteA, ...p.parteB]) { assert.ok(q.opciones.includes(q.correcta)); assert.equal(new Set(q.opciones).size, q.opciones.length, 'opciones repetidas'); assert.ok(q.opciones.length >= 3); }
      assert.ok(p.palabras.every((w) => w.en.toLowerCase() !== w.es.toLowerCase()), 'sin palabras idénticas en los dos idiomas');
      const todas = (x) => [...x.palabras, ...x.palabrasInteres[interes]];
      const deAntes = historia.capitulos.filter((x) => x.id < c.id).flatMap(todas);
      if (c.id >= 2) assert.ok(p.palabras.some((w) => deAntes.includes(w)), `prueba ${c.id}: debe repasar capítulos anteriores`);
      assert.ok(p.palabras.some((w) => todas(c).includes(w)), `prueba ${c.id}: debe incluir el capítulo actual`);
    }
  }
  assert.ok(tamanoPrueba(6).palabras > tamanoPrueba(1).palabras && tamanoPrueba(6).frases > tamanoPrueba(1).frases, 'la última prueba es más grande que la primera');
  assert.equal(estrellasDe(1), 3); assert.equal(estrellasDe(0.8), 2); assert.equal(estrellasDe(NOTA_MINIMA), 1); assert.equal(estrellasDe(0.5), 0);
});

test('consistencia: la historia ya no se llama «niñez» y hay nota de cambios frente al SPEC', () => {
  assert.equal(historia.titulo.es, 'La vida de Granma en México');
  assert.ok(leer('js/constancia.js').includes('La vida de Granma en México') && !leer('js/constancia.js').includes('niñez'));
  const nota = leer('docs/CAMBIOS-AL-SPEC.md'); for (const t of ['6 capítulos', 'Energía', 'Pruebas']) assert.ok(nota.includes(t), 'falta en la nota: ' + t);
});

test('publicación: una sola dirección pública en index, recetas, robots y sitemap', async () => {
  const { SITIO } = await import('../scripts/sitio.mjs');
  assert.match(SITIO, /^https:\/\/.+\/$/);
  const idx = leer('index.html');
  assert.ok(idx.includes(`<link rel="canonical" href="${SITIO}">`) && idx.includes(`content="${SITIO}assets/iconos/og-1200.png"`), 'canonical e imagen social absolutas');
  assert.ok(leer('robots.txt').includes(`Sitemap: ${SITIO}sitemap.xml`));
  const mapa = leer('sitemap.xml'); for (const r of recetas) assert.ok(mapa.includes(`${SITIO}recetas/${r.id}.html`), 'sitemap sin ' + r.id);
  const mole = leer('recetas/mole.html'); assert.ok(mole.includes(`"image":["${SITIO}assets/iconos/og-1200.png"]`) && mole.includes(`rel="canonical" href="${SITIO}recetas/mole.html"`));
  assert.ok(existsSync(join(RAIZ, '.nojekyll')), 'GitHub Pages debe servir los archivos tal cual');
});

test('el interés cambia el vocabulario: 3 palabras propias con su frase por interés en cada capítulo', async () => {
  const INTERESES = ['trabajo', 'amigos', 'biblia', 'viajes', 'cocina'];
  for (const c of historia.capitulos) {
    const base = new Set(c.palabras.map((p) => p.en.toLowerCase())), vistas = new Set();
    for (const i of INTERESES) {
      const lista = c.palabrasInteres[i]; assert.equal(lista.length, 3, `cap ${c.id} ${i}`);
      for (const w of lista) {
        assert.ok(w.en && w.es && w.f.en && w.f.es, `cap ${c.id} ${i}: palabra incompleta`);
        assert.notEqual(w.en.toLowerCase(), w.es.toLowerCase(), `cap ${c.id}: «${w.en}» igual en los dos idiomas`);
        assert.ok(!base.has(w.en.toLowerCase()), `cap ${c.id}: «${w.en}» ya es palabra base`);
        assert.ok(!vistas.has(w.en.toLowerCase()), `cap ${c.id}: «${w.en}» repetida entre intereses`); vistas.add(w.en.toLowerCase());
        assert.ok(new RegExp(`(^|[^\\p{L}])${w.en}([^\\p{L}]|$)`, 'iu').test(w.f.en), `cap ${c.id}: «${w.en}» no está en «${w.f.en}»`);
        assert.ok(new RegExp(`(^|[^\\p{L}])${w.es}([^\\p{L}]|$)`, 'iu').test(w.f.es), `cap ${c.id}: «${w.es}» no está en «${w.f.es}»`);
      }
    }
  }
  // en la lección: las palabras que se preguntan son distintas según el interés
  const { estado } = await import('../js/state.js'); const { ejerciciosDeCapitulo } = await import('../js/ejercicios.js');
  estado().perfil.aprende = 'en';
  for (const c of historia.capitulos) {
    const primeras = new Set(INTERESES.map((i) => ejerciciosDeCapitulo(c, i)[0].voz));
    assert.equal(primeras.size, 5, `cap ${c.id}: la primera palabra debe ser distinta en cada interés`);
    for (const i of INTERESES) { const it = ejerciciosDeCapitulo(c, i); assert.ok(c.palabrasInteres[i].some((w) => w.en === it[0].voz)); assert.ok(it.find((x) => x.tipo === 'pares').pares.some(([a]) => c.palabrasInteres[i].some((w) => w.en === a)), 'el emparejar incluye palabras del interés'); }
  }
});

test('manos: el Abuelo levanta la mano abierta (palma, 4 dedos y pulgar), nunca un dedo solo', () => {
  for (const e of ['aconsejando', 'hablando']) {
    const t = leer(`assets/personajes/abuelo-${e}.svg`);
    const dedos = (t.match(/<rect x="(-13|-6\.5|0|6\.5)" y="-\d+" width="6" /g) || []).length;
    assert.equal(dedos, 4, `abuelo-${e}: la mano levantada debe tener 4 dedos juntos (tiene ${dedos})`);
    assert.ok(t.includes('rotate(-30 -18 -8)'), `abuelo-${e}: falta el pulgar`);
    assert.ok(!/width="9" height="34"/.test(t), `abuelo-${e}: no debe haber un dedo largo y solo`);
  }
  assert.ok(leer('assets/personajes/abuelo-aconsejando.svg').includes('id="mano"') && !leer('assets/personajes/abuelo-aconsejando.svg').includes('id="dedo"'));
  for (const f of readdirSync(join(RAIZ, 'assets/personajes'))) assert.ok(!/width="9" height="34"/.test(leer('assets/personajes/' + f)), f);
});

test('grabaciones del Abuelo: guion completo, índice coherente y respaldo con la voz del dispositivo', async () => {
  const guion = leer('docs/GUION-ABUELO.md'), consejos = JSON.parse(leer('data/consejos.json')), caps = [...JSON.parse(leer('data/historia.json')).capitulos, ...JSON.parse(leer('data/historia2.json')).capitulos];
  for (const c of consejos) assert.ok(guion.includes(c.es), `falta en el guion el consejo ${c.id}`);
  for (const c of caps) assert.ok(guion.includes(c.consejo.es), `falta en el guion el consejo del capítulo ${c.id}`);
  assert.equal((guion.match(/^\d+\. /gm) || []).length - 5, consejos.length + caps.length, 'el guion se regenera con: node scripts/audios.mjs guion');
  const audios = JSON.parse(leer('data/audios.json')), paquete = JSON.parse(leer('data/paquetes.json')).paquetes.find((p) => p.id === 'consejos');
  const frases = new Set([...consejos, ...caps.map((c) => c.consejo)].flatMap((c) => [c.es, c.en]).map((t) => t.toLowerCase().replace(/\s+/g, ' ').trim()));
  for (const l of ['es', 'en']) for (const [frase, ruta] of Object.entries(audios.abuelo[l])) {
    assert.ok(frases.has(frase), `grabación de una frase que ya no existe: ${ruta}`);
    assert.ok(existsSync(join(RAIZ, ruta)) && paquete.archivos.includes(ruta), `${ruta} debe existir y viajar en el paquete de consejos`);
  }
  const v = leer('js/voz.js'); assert.ok(/tocarGrabacion\(ruta, lenta\)\) return cerrar\(true\);[\s\S]*await decirSintetica/.test(v), 'si la grabación falla, habla la voz del dispositivo');
  const { claveAudio } = await import('../js/voz.js'); assert.equal(claveAudio('  Hola   Mijo. '), 'hola mijo.');
});

test('glosario al toque: toda palabra del contenido tiene su significado, en los dos idiomas', async () => {
  const g = JSON.parse(leer('data/glosario.json')), faltan = { en: new Set(), es: new Set() };
  const suma = (l, t) => { for (const w of String(t).toLowerCase().match(/\p{L}+(?:['’]\p{L}+)?/gu) || []) if (!g[l][w.replace('’', "'")]) faltan[l].add(w); };
  const anda = (o) => { if (!o || typeof o !== 'object') return; if (Array.isArray(o)) return o.forEach(anda);
    for (const [k, v] of Object.entries(o)) { const l = k === 'en' || k === 'we' ? 'en' : k === 'es' || k === 'ws' ? 'es' : null;
      if (l) (Array.isArray(v) ? v : [v]).forEach((x) => (typeof x === 'string' ? suma(l, x) : anda(x))); else anda(v); } };
  for (const f of ['historia', 'historia2', 'coloquial', 'reglas', 'platicas', 'consejos', 'cotorreo', 'recetas', 'biblia/ruta']) anda(JSON.parse(leer(`data/${f}.json`)));
  for (const l of ['en', 'es']) assert.equal(faltan[l].size, 0, `faltan en scripts/datos/glosario/${l}.json: ${[...faltan[l]].join(', ')}`);
  for (const l of ['en', 'es']) for (const [w, s] of Object.entries(g[l])) assert.ok(s && s.length <= 60 && w === w.toLowerCase(), `glosa rara: ${w}`);
  globalThis.localStorage ||= { _d: {}, getItem(k) { return this._d[k] ?? null; }, setItem(k, v) { this._d[k] = v; } };
  const { buscar } = await import('../js/glosario.js');
  assert.equal(buscar(g, 'Bread', 'en').significado, g.en.bread);
  assert.ok(buscar(g, "grandmother's", 'en') || buscar(g, "mother's", 'en'), 'posesivos');
  assert.equal(buscar(g, 'zzzz', 'en'), null);
});

test('hablar: compara lo dicho con la frase sin castigar, y la lección trae oído, deletreo y voz', async () => {
  const { parecido, limpiar, UMBRAL } = await import('../js/oido.js');
  assert.equal(limpiar("  Don't WORRY, mijo! "), 'dont worry mijo');
  assert.equal(parecido('the bread is warm', 'The bread is warm.'), 1);
  assert.ok(parecido('the bred is worm', 'The bread is warm.') >= UMBRAL, 'tolera pronunciación de principiante');
  assert.ok(parecido('hello', 'The bread is warm.') < UMBRAL);
  assert.equal(parecido('', 'bread'), 0);
  const { ejerciciosDeCapitulo } = await import('../js/ejercicios.js');
  const cap = JSON.parse(leer('data/historia.json')).capitulos[0], it = ejerciciosDeCapitulo(cap, 'cocina');
  assert.equal(it.filter((x) => x.tipo === 'di').length, 2, 'dos ejercicios de decir en voz alta');
  const letras = it.find((x) => x.letras); assert.ok(letras && /^\p{L}{3,8}$/u.test(letras.respuesta));
  const e = leer('js/ejercicios.js');
  assert.ok(/data-nohablo/.test(e) && /pausarHablar\(\)/.test(e), 'se puede saltar hablar sin castigo');
  assert.ok(!/tipo === 'di'[\s\S]{0,400}perderVida/.test(e.slice(e.indexOf('async function micro'), e.indexOf('function responder'))), 'hablar nunca quita energía');
  assert.ok(/mejorRacha/.test(e) && /racha = 0/.test(e), 'racha de aciertos');
});

test('Biblia: el texto es el original de dominio público, sin cambiar una letra', async () => {
  const { huellas } = await import('../scripts/biblia-huella.mjs'), guardadas = JSON.parse(leer('scripts/datos/biblia-huella.json'));
  assert.deepEqual(huellas(), guardadas, 'el texto de data/biblia cambió: solo se regenera con npm run biblia (y luego node scripts/biblia-huella.mjs --escribir)');
  const v = leer('js/vistas/biblia.js'); assert.ok(!/\.replace\(|toUpperCase|toLowerCase\(\)\s*\)/.test(v.split('\n').filter((l) => /versos|x\.t|v\.t/.test(l) && !/sinAcentos|buscar|search/.test(l)).join('\n')), 'la vista no transforma el texto del versículo');
});

test('privacidad de la voz: se pregunta antes, nada se guarda y la grabación dura 1 minuto como máximo', async () => {
  const e = leer('js/ejercicios.js'), { BORRADO_MS } = await import('../js/ejercicios.js');
  assert.ok(BORRADO_MS <= 60000);
  assert.ok(/'pregunta'/.test(e) && /data-oido-modo="reco"/.test(e) && /data-oido-modo="local"/.test(e), 'pregunta cómo practicar');
  assert.ok(/elegido === 'reco'/.test(e), 'el reconocimiento solo corre si la persona lo eligió');
  const o = leer('js/oido.js'); assert.ok(!/fetch\(|XMLHttpRequest|sendBeacon|localStorage|indexedDB/.test(o), 'el audio no se envía ni se guarda');
  assert.ok(/getTracks\(\)\.forEach\(\(t\) => t\.stop\(\)\)/.test(o), 'el micrófono se apaga al terminar');
  assert.ok(/class="privacidad"/.test(leer('js/vistas/perfil.js')));
  const pf = leer('js/vistas/perfil.js'); assert.ok(pf.indexOf("S.ajustes.oido !== 'reco'") > 0 && pf.indexOf("S.ajustes.oido !== 'reco'") < pf.indexOf('await escuchar('), '«Probar mi micrófono» no usa el reconocimiento sin permiso');
});

test('glosario bíblico: formal, y cubre cada palabra de los pasajes de la ruta', () => {
  const g = JSON.parse(leer('data/biblia/glosario.json')), ruta = JSON.parse(leer('data/biblia/ruta.json'));
  const pal = (t) => (String(t).toLowerCase().match(/\p{L}+(?:['’]\p{L}+)?/gu) || []).map((w) => w.replace('’', "'"));
  for (const p of ruta) for (const [v, l] of [['rv1909', 'es'], ['kjv', 'en'], ['web', 'en']]) {
    const c = JSON.parse(leer(`data/biblia/${v}/${p.ref.libro}.json`)).c[p.ref.cap - 1];
    for (let i = p.ref.desde; i <= p.ref.hasta; i++) for (const w of pal(c[i - 1])) assert.ok(g[l][w], `${p.id} (${v}): falta «${w}» en scripts/datos/glosario/biblia-${l}.json`);
  }
  for (const l of ['en', 'es']) for (const [w, s] of Object.entries(g[l])) { assert.ok(s && s.length <= 60, `glosa rara: ${w}`); assert.ok(!/broma|chiste|joke|\bpun\b|trabalenguas|tongue twister/i.test(s), `glosa informal en la Biblia: ${w}`); }
  assert.ok(Object.keys(g.en).length >= 2000 && Object.keys(g.es).length >= 2000);
  // Biblia completa: cada palabra de cada versículo (RV1909, KJV y WEB) tiene su glosa
  for (const [v, l] of [['rv1909', 'es'], ['kjv', 'en'], ['web', 'en']]) { const faltan = new Set();
    for (const f of readdirSync(join(RAIZ, 'data/biblia', v))) for (const c of JSON.parse(leer(`data/biblia/${v}/${f}`)).c) for (const t of c) for (const w of pal(t)) if (!g[l][w]) faltan.add(w);
    assert.equal(faltan.size, 0, `${v}: ${faltan.size} palabras sin glosa (${[...faltan].slice(0, 15).join(', ')}…). Corre scripts/glosario-biblia-auto.mjs para ver la lista`); }
  assert.ok(/INFORMAL\.test\(g\.significado\)/.test(leer('js/glosario.js')), 'en la Biblia nunca sale una glosa de chiste');
  assert.ok(JSON.parse(leer('data/paquetes.json')).paquetes.find((p) => p.id === 'biblia').archivos.includes('data/biblia/glosario.json'));
});

test('verificador propio de voz: en el teléfono, sin red; distingue silencio, frase cortada y frase completa', async () => {
  const { silabas, analizarVoz } = await import('../js/oido.js');
  assert.equal(silabas('bread', 'en'), 1); assert.equal(silabas('kitchen', 'en'), 2); assert.equal(silabas('The bread is warm.', 'en'), 4);
  assert.equal(silabas('pan', 'es'), 1); assert.equal(silabas('queso', 'es'), 2); assert.equal(silabas('guisado', 'es'), 3);
  const voz = (n, ruido = 0.004) => { const a = []; let t = 0; const pon = (v) => { a.push({ t, v }); t += 16; };
    for (let i = 0; i < 20; i++) pon(ruido); for (let s = 0; s < n; s++) { for (let i = 0; i < 9; i++) pon(0.02 + 0.12 * Math.sin(Math.PI * i / 8)); for (let i = 0; i < 4; i++) pon(ruido * 2); } for (let i = 0; i < 30; i++) pon(ruido); return a; };
  assert.equal(analizarVoz(voz(0), 5).veredicto, 'silencio');
  assert.equal(analizarVoz(voz(0, 0.01), 5).veredicto, 'silencio', 'el ruido de fondo no cuenta como voz');
  assert.equal(analizarVoz(voz(1), 1).veredicto, 'completa'); assert.equal(analizarVoz(voz(5), 5).veredicto, 'completa'); assert.equal(analizarVoz(voz(5), 5).golpes, 5);
  assert.equal(analizarVoz(voz(2), 6).veredicto, 'corta', 'quedarse a medias no pasa');
  assert.equal(analizarVoz(voz(4), 6).veredicto, 'completa', 'tolera juntar sílabas'); assert.equal(analizarVoz(voz(9), 6).veredicto, 'completa', 'tolera hablar despacio');
  assert.equal(analizarVoz([], 3).veredicto, 'silencio');
  const o = leer('js/oido.js'), v = o.slice(o.indexOf('Verificador propio'));
  assert.ok(!/fetch\(|XMLHttpRequest|WebSocket|sendBeacon/.test(o), 'nada sale del teléfono');
  assert.ok(/NO reconoce palabras/.test(v), 'el código dice con claridad lo que el verificador no hace');
});

test('Oído de Granma: califica palabra por palabra, es opcional, con licencia abierta y fiesta con tope', async () => {
  globalThis.localStorage ||= { _d: {}, getItem(k) { return this._d[k] ?? null; }, setItem(k, v) { this._d[k] = v; } };
  const { calificar } = await import('../js/oido-propio.js');
  const { rivalesDe, rivalesDeFrase } = await import('../js/oido-propio.js'), voc = Object.keys(JSON.parse(leer('data/glosario.json')).en);
  assert.ok(rivalesDe('bread', 'en', voc).includes('bed') && rivalesDe('kitchen', 'en', voc).includes('chicken') && rivalesDe('love', 'en', voc).includes('live'));
  assert.deepEqual(rivalesDe('the', 'en', voc), [], 'las palabritas de enlace no llevan rivales');
  const { paraOir } = await import('../js/oido-propio.js'), vocEs = Object.keys(JSON.parse(leer('data/glosario.json')).es);
  assert.equal(paraOir('¡El pan está caliente, mijo!'), 'el pan está caliente mijo', 'al reconocedor se le pasan los acentos');
  assert.ok(rivalesDe('perro', 'es', vocEs).includes('pero') && rivalesDe('perro', 'es', vocEs).length <= 2 && !rivalesDe('perro', 'es', vocEs).includes('peso'), 'en español la rival cambia una sola letra');
  let q = calificar('El perro come pan.', [{ word: 'pero', conf: 0.9 }, { word: 'come', conf: 1 }, { word: 'pan', conf: 1 }], '', rivalesDeFrase('El perro come pan.', 'es', vocEs));
  assert.deepEqual([q.palabras[1].estado, q.palabras[1].sono], ['casi', 'pero']);
  q = calificar('El pan está caliente.', [{ word: 'el', conf: 1 }, { word: 'pan', conf: 1 }, { word: 'está', conf: 1 }, { word: 'caliente', conf: 1 }], '', {}); assert.equal(q.estrellas, 3, 'los acentos no estorban al comparar');
  const R = rivalesDeFrase('The bread is warm.', 'en', voc); assert.ok(!Object.values(R).flat().some((x) => ['the', 'bread', 'is', 'warm'].includes(x)));
  let p = calificar('The bread is warm.', [{ word: 'the', conf: 1 }, { word: 'bread', conf: 1 }, { word: 'is', conf: 1 }, { word: 'warm', conf: 1 }], '', R); assert.equal(p.estrellas, 3); assert.equal(p.pasa, true);
  p = calificar('The bread is warm.', [{ word: 'the', conf: 0.9 }, { word: 'bed', conf: 0.86 }, { word: 'is', conf: 1 }, { word: 'warm', conf: 1 }], 'the man is warm', R);
  assert.deepEqual([p.palabras[1].estado, p.palabras[1].sono, p.estrellas, p.pasa], ['casi', 'bed', 2, true], 'si dijo «bed» por «bread», lo nota y lo dice');
  p = calificar('bread', [{ word: 'red', conf: 0.5 }], 'read', rivalesDeFrase('bread', 'en', voc)); assert.equal(p.pasa, false, 'una sola palabra mal dicha no pasa');
  p = calificar('bread', [{ word: 'bread', conf: 0.3 }], '', {}); assert.equal(p.palabras[0].estado, 'casi', 'con poca seguridad queda en «casi»');
  let r = calificar('The bread is warm.', 'the bread is warm', 'that man is warm'); assert.equal(r.todo, true); assert.equal(r.dichas, 4); assert.equal(r.exacta, false);
  r = calificar('The bread is warm.', 'the bread is warm', 'the bread is warm'); assert.equal(r.exacta, true);
  r = calificar('I love my family.', '[unk] my family', 'they live with my family'); assert.deepEqual(r.palabras.map((p) => p.ok), [false, false, true, true]); assert.equal(r.todo, false);
  r = calificar('I love my family.', '[unk]', 'hello how are you'); assert.equal(r.dichas, 0);
  r = calificar('The kitchen is warm.', 'kitchen', 'the kitchens is warm'); assert.equal(r.todo, true, 'junta lo que oyó cada reconocedor y tolera una letra');
  assert.equal(calificar('', 'hola', 'hola').todo, false);
  const paq = JSON.parse(leer('data/paquetes.json')).paquetes;
  for (const id of ['oido-en', 'oido-es']) { const p = paq.find((x) => x.id === id); assert.ok(p.opcional && p.archivos.every((f) => existsSync(join(RAIZ, f))), id); }
  assert.ok(!leer('sw.js').includes('assets/oido'), 'el Oído no viaja en el arranque de la app');
  assert.ok(!/oido-propio|vosk/i.test(leer('index.html')), 'ni se precarga');
  const lic = leer('assets/oido/LICENCIAS.md'); assert.ok(/Apache-2\.0/.test(lic) && /vosk-browser/.test(lic));
  assert.ok(/Apache License/.test(leer('assets/oido/LICENSE-APACHE-2.0.txt')), 'el texto de la licencia viaja con los archivos');
  const { createHash } = await import('node:crypto');
  for (const f of readdirSync(join(RAIZ, 'assets/oido')).filter((x) => /\.(js|gz)$/.test(x))) assert.ok(lic.includes(createHash('sha256').update(readFileSync(join(RAIZ, 'assets/oido', f))).digest('hex')), `${f}: todo archivo de terceros debe estar en LICENCIAS.md con su huella`);
  const o = leer('js/oido-propio.js'); assert.ok(!/XMLHttpRequest|WebSocket|sendBeacon|method:|body:/.test(o), 'la voz no sale del teléfono');
  assert.deepEqual(o.match(/fetch\([^)]*\)/g), ["fetch('data/glosario.json')"], 'lo único que pide por red es leer el vocabulario de la propia app');
  const { MAX_TORTILLAS, TRICOLOR } = await import('../assets/animaciones/fiesta.js'); assert.ok(MAX_TORTILLAS <= 24 && TRICOLOR.length >= 3);
  const f = leer('assets/animaciones/fiesta.js'); assert.ok(/prefers-reduced-motion/.test(f) && !/(left|top|width|height|margin)\s*:/.test(f.slice(f.indexOf('t.animate'))), 'solo transform y opacity');
  assert.ok(/Te ganaste 1 kilo de tortillas hechas con mucho amor/.test(leer('js/porras.js')) && /porraHTML\('tortillas'/.test(leer('js/vistas/leccion.js')), 'la lección premia con el kilo de tortillas');
  assert.ok(/rotateX\(/.test(f) && /perspective:\s*\d+px/.test(leer('css/app.css')), 'las tortillas giran en 3D (perspectiva + rotateX)');
  const css = leer('css/app.css'); assert.ok(/\.tortilla\{[^}]*radial-gradient[\s\S]*?--canto/.test(css), 'la tortilla lleva manchas tostadas y grosor');
  assert.ok(!/\.tortillas-cap \.tortilla\{[^}]*filter:/.test(css), 'sin filtros: se ven borrosas al crecer');
});

test('derechos: nada de terceros fuera del Oído, sin peticiones externas y con inventario escrito', () => {
  const doc = leer('docs/DERECHOS-Y-LICENCIAS.md'); for (const t of ['Apache-2.0', 'Reina-Valera 1909', 'IMPI', 'No es asesoría legal']) assert.ok(doc.includes(t), t);
  const css = leer('css/app.css') + leer('assets/animaciones/animaciones.css'); assert.ok(!/@font-face|@import|url\(\s*["']?https?:/.test(css), 'sin tipografías ni hojas ajenas');
  const html = leer('index.html'); assert.ok(!/<script[^>]+src=["']https?:|<link[^>]+href=["']https?:\/\/(?!nexeralanrevelescoronado-sketch\.github\.io|granma-sazon\.pages\.dev|granmasazon\.app)/.test(html), 'index.html no carga nada de otros sitios');
  const permitidos = /^assets\/(oido|iconos|logo|personajes|animaciones)\//;
  for (const f of readdirSync(join(RAIZ, 'assets'), { recursive: true }).map((x) => 'assets/' + String(x).split('\\').join('/'))) assert.ok(permitidos.test(f) || !f.includes('.'), `archivo fuera de inventario: ${f}`);
  const lic = leer('assets/oido/LICENCIAS.md'); assert.ok(/vosk-model-small-es-0\.42/.test(lic) && !/modelo-es\.tar\.gz` \| `vosk-model-small-es-0\.3/.test(lic), 'el español que se distribuye es el 0.42, con licencia publicada');
  for (const f of readdirSync(join(RAIZ, 'js'), { recursive: true }).filter((x) => String(x).endsWith('.js'))) { const t = leer('js/' + f); assert.ok(!/google-analytics|googletagmanager|facebook\.net|doubleclick|hotjar/.test(t), `${f}: sin rastreadores`); }
});

test('arranque a prueba de iPhone nuevo: vigilante, service worker sin tomar control a media carga y sin mezclar versiones', () => {
  const html = leer('index.html'), app = leer('js/app.js'), sw = leer('sw.js');
  assert.ok(html.indexOf('__granmaListo') > 0 && html.indexOf('granma-reintentar') > 0 && html.indexOf('<script>') < html.indexOf('type="module"'), 'el vigilante va antes del módulo y ofrece «Reintentar»');
  assert.ok(/reparado=1/.test(html) && /8000/.test(html), 'se repara solo una vez a los 8 s');
  assert.ok(/window\.__granmaListo = true/.test(app), 'la app avisa que abrió');
  assert.ok(/setTimeout\(\(\) => navigator\.serviceWorker\.register/.test(app), 'el service worker se registra después de abrir');
  const act = sw.slice(sw.indexOf("addEventListener('activate'"), sw.indexOf('async function buscar')); assert.ok(!/clients\.claim\(\)\s*;?\s*$/m.test(act.replace(/\/\/.*$/gm, '')), 'activate no toma el control a media carga');
  assert.ok(/'tomar-control'/.test(sw) && /'tomar-control'/.test(app), 'toma el control cuando la página lo pide, ya abierta');
  assert.ok(/\(js\|css\|html\)/.test(sw), 'el código no se refresca archivo por archivo');
  assert.ok(/setTimeout\(ok, 4000, 'tiempo'\)/.test(sw) && /preloadResponse/.test(sw), 'la página nunca espera a la red sin límite dentro del service worker');
});

test('Cloudflare Pages: ningún archivo pasa de 25 MiB, los modelos van partidos y el puente solo entrega los dos modelos', async () => {
  const { execFileSync } = await import('node:child_process');
  execFileSync(process.execPath, [join(RAIZ, 'scripts/publicar-pages.mjs')], { stdio: 'pipe' });
  const lista = []; const andar = (d) => { for (const n of readdirSync(d)) { const r = join(d, n); statSync(r).isDirectory() ? andar(r) : lista.push(r); } }; andar(join(RAIZ, 'dist'));
  assert.ok(lista.length > 100 && lista.length <= 20000, `${lista.length} archivos`);
  for (const f of lista) assert.ok(statSync(f).size <= 25 * 1024 * 1024, `${f} pasa de 25 MiB`);
  assert.ok(!existsSync(join(RAIZ, 'dist/assets/oido/modelo-en.tar.gz')) && existsSync(join(RAIZ, 'dist/assets/oido/vosk.js')) && existsSync(join(RAIZ, 'dist/index.html')));
  for (const m of ['modelo-en.tar.gz', 'modelo-es.tar.gz']) {   // los pedazos juntos son el modelo original, byte por byte
    const man = JSON.parse(leer(`dist/assets/oido/partes/${m}.json`)), orig = readFileSync(join(RAIZ, 'assets/oido', m));
    const junto = Buffer.concat(Array.from({ length: man.n }, (_, i) => readFileSync(join(RAIZ, `dist/assets/oido/partes/${m}.${i}`))));
    assert.ok(junto.equals(orig) && man.tam === orig.length && man.pedazo === 4 * 1024 * 1024, m);
  }
  assert.ok(/PIEZA = 4 \* 1024 \* 1024/.test(leer('js/descargas.js')), 'el pedazo de Pages mide lo mismo que el que pide la app');
  assert.ok(!existsSync(join(RAIZ, 'dist/scripts')) && !existsSync(join(RAIZ, 'dist/graphify-out')) && !existsSync(join(RAIZ, 'dist/.claude')), 'nada interno se publica');
  const rutas = JSON.parse(leer('dist/_routes.json')); assert.deepEqual(rutas.include, ['/assets/oido/modelo-en.tar.gz', '/assets/oido/modelo-es.tar.gz']);
  const fn = leer('functions/assets/oido/[archivo].js'); assert.ok(/PERMITIDOS = new Set\(\['modelo-en\.tar\.gz', 'modelo-es\.tar\.gz'\]\)/.test(fn) && /206/.test(fn) && /content-range/.test(fn));
  const w = leer('wrangler.toml'); assert.ok(/pages_build_output_dir = "\.\/dist"/.test(w) && !/r2_buckets/.test(w), 'no hace falta R2');
});

test('hablar y escuchar: sección propia, bocina lenta, parejas con voz, turnos de 5 s y porras con tortillas estrelladas', async () => {
  // 1) sección nueva, antes de la Biblia en la barra
  const app = leer('js/app.js'); assert.ok(/hablar: \(\) => import\('\.\/vistas\/hablar\.js'\)/.test(app));
  assert.ok(app.indexOf("['hablar', 'hablar'") > 0 && app.indexOf("['hablar', 'hablar'") < app.indexOf("['biblia', 'biblia'"), 'Hablar va antes de Biblia');
  const { armarEscucha, material } = await import('../js/escucha.js'), caps = historia.capitulos.slice(0, 2);
  for (const [T, N] of [['en', 'es'], ['es', 'en']]) {
    for (const modo of ['elige', 'repite', 'arma', 'mixto']) {
      const r = armarEscucha(caps, 'cocina', modo, T, N, 8); assert.equal(r.length, 8, `${modo}: 8 ejercicios`);
      for (const it of r) {
        assert.ok(it.voz, 'todo ejercicio de esta sección se oye');
        if (it.tipo === 'mcq') { assert.ok(it.oir && it.opciones.includes(it.correcta) && new Set(it.opciones).size === it.opciones.length); }
        if (it.tipo === 'orden') assert.ok(it.oir && it.respuesta === it.voz, 'dictado: se arma lo que se oye');
        if (it.tipo === 'di') assert.equal(it.frase, it.voz);
      }
    }
    assert.ok(armarEscucha(caps, 'cocina', 'mixto', T, N).some((x) => x.tipo === 'di') && armarEscucha(caps, 'cocina', 'mixto', T, N).some((x) => x.tipo === 'orden'));
  }
  const m = material(caps, 'viajes'); assert.equal(new Set(m.palabras.map((p) => p.en.toLowerCase())).size, m.palabras.length, 'sin palabras repetidas');
  assert.ok(/usarVidas: false/.test(leer('js/vistas/hablar.js')), 'practicar aquí no gasta energía');
  // 2) bocina lenta junto a cada bocina, y voces pausadas
  const { PERFIL, LENTA } = await import('../js/voz.js');
  assert.ok(PERFIL.granma.rate <= 0.85 && PERFIL.abuelo.rate <= 0.78 && LENTA <= 0.7 && PERFIL.abuelo.rate * LENTA >= 0.45, 'voz pausada, y la lenta sigue siendo entendible');
  const lento = leer('js/lento.js'); assert.ok(/MutationObserver/.test(lento) && /pedirLenta\(\); bocina\.click\(\)/.test(lento) && /Escuchar despacio/.test(lento) && /Listen slowly/.test(lento));
  assert.ok(/PEREZOSO = '<svg/.test(lento) && !/🐢/.test(lento + leer('js/escucha.js') + leer('js/vistas/hablar.js')), 'el modo lento es un perezoso dibujado (no tortuga, no emoji)');
  assert.ok(/modo perezoso/.test(lento) && /sloth mode/.test(lento), 'el botón dice «modo perezoso»');
  assert.ok(/iniciarLento\(\)/.test(app));
  // 3) parejas: la palabra del idioma que se aprende suena al tocarla; dictado con bocina
  const ej = leer('js/ejercicios.js'); assert.ok(/b\.dataset\.lado === 'i'[^\n]*hablar\(b\.dataset\.v, T\)/.test(ej), 'las parejas suenan');
  assert.ok(/it\.oir && it\.voz \? `<button class="btn-icono" data-voz/.test(ej), 'el dictado trae bocina');
  // 4) entre Granma y el Abuelo pasan al menos 5 segundos
  const { faltaParaHablar, PAUSA_CAMBIO, PAUSA_MISMA } = await import('../js/habla.js');
  assert.ok(PAUSA_CAMBIO >= 5000 && PAUSA_MISMA >= 500);
  assert.equal(faltaParaHablar({ quien: 'granma', fin: 10000 }, 'abuelo', 11000), 4000);
  assert.equal(faltaParaHablar({ quien: 'granma', fin: 10000 }, 'abuelo', 15000), 0);
  assert.equal(faltaParaHablar({ quien: 'abuelo', fin: 10000 }, 'granma', 10100), 4900);
  assert.equal(faltaParaHablar({ quien: 'granma', fin: Infinity }, 'abuelo', 99999), Infinity, 'mientras Granma habla, el Abuelo espera');
  assert.equal(faltaParaHablar({ quien: 'granma', fin: 10000 }, 'granma', 10100), PAUSA_MISMA - 100);
  assert.equal(faltaParaHablar({ quien: null, fin: 0 }, 'abuelo', 5), 0);
  // 5) porras, premio de taquitos y tortillas que se estrellan (2 o 3, con tope, solo transform y opacity)
  const { PORRAS, PREMIOS } = await import('../js/porras.js');
  assert.ok(PORRAS.length >= 5 && PORRAS.filter(([es]) => /épale/i.test(es)).length >= 4, 'Granma grita «¡Épale!»');
  for (const [es, en] of [...PORRAS, ...Object.values(PREMIOS)]) { assert.ok(es && en); for (const p of PROHIBIDAS) assert.ok(!(es + ' ' + en).toLowerCase().includes(p), p); }
  assert.match(PREMIOS.taquitos[0], /Te ganaste unos taquitos de barbacoa/);
  const { MAX_PEGADAS, GOLPE } = await import('../assets/animaciones/fiesta.js'); assert.ok(MAX_PEGADAS <= 3 && GOLPE > 0 && GOLPE < 0.5);
  assert.ok(/lluviaTortillas\([^\n]*2 \+ \(Math\.random\(\) < 0\.5 \? 1 : 0\)/.test(leer('js/porras.js')), 'se estrellan 2 o 3');
  for (const v of ['leccion', 'prueba', 'reto', 'receta', 'hablar']) assert.ok(/porraHTML\(/.test(leer(`js/vistas/${v}.js`)) && /fiesta\(main/.test(leer(`js/vistas/${v}.js`)), `${v}: porra y fiesta al completar`);
  assert.ok(!/porraHTML/.test(leer('js/vistas/biblia.js')), 'la Biblia se queda formal, sin tortillas');
  // 6) las palabras coloquiales se explican en los dos idiomas, y están en el glosario al toque
  const { COLOQUIAL, coloquialesEn } = await import('../js/coloquial.js'), glo = json('data/glosario.json');
  for (const k of ['épale', 'ándale', 'mijo', 'a la bio']) { assert.ok(COLOQUIAL[k].es.length > 60 && COLOQUIAL[k].en.length > 60, `${k}: explicado con contexto en español e inglés`); for (const p of PROHIBIDAS) assert.ok(!(COLOQUIAL[k].es + COLOQUIAL[k].en).toLowerCase().includes(p), p); }
  assert.ok(/México/.test(COLOQUIAL.épale.es) && /Mexican/.test(COLOQUIAL.épale.en) && /confianza/.test(COLOQUIAL.épale.es) && /informal/.test(COLOQUIAL.épale.en), '«épale»: de dónde es y cuándo se usa');
  for (const [es] of PORRAS) assert.ok(coloquialesEn(es).length >= 1, `la porra «${es}» trae su explicación`);
  assert.ok(/notaColoquial\(es\)/.test(leer('js/porras.js')));
  for (const [i, l] of [[0, 'es'], [1, 'en']]) for (const t of [...PORRAS, ...Object.values(PREMIOS)]) for (const w of t[i].toLowerCase().match(/[\p{L}']+/gu)) assert.ok(w in glo[l], `falta en el glosario (${l}): «${w}»`);
  assert.ok(/\.tortilla\.pegada\{width:\d+px/.test(leer('css/app.css')), 'la estrellada se dibuja grande, no se agranda borrosa');
});

test('Historia 2 (Granma a los 25): 6 capítulos sobrios, fe con respeto y versículos solo de dominio público', async () => {
  const h2 = json('data/historia2.json'), libros = json('data/biblia/libros.json').libros;
  assert.equal(h2.id, 'historia-2'); assert.equal(h2.sobria, true, 'sin porras ni tortillas'); assert.ok(/Dios/.test(h2.titulo.es) && /God/.test(h2.titulo.en), 'el título dice claro de qué trata');
  assert.deepEqual(h2.capitulos.map((c) => c.id), [7, 8, 9, 10, 11, 12], 'la numeración sigue a la Historia 1: el avance no choca');
  const vistas = new Set(historia.capitulos.flatMap((c) => c.palabras.map((p) => p.en.toLowerCase())));
  for (const c of h2.capitulos) {
    assert.ok(c.palabras.length >= 8 && c.palabras.length <= 10 && c.relato.es.length >= 3 && c.relato.es.length === c.relato.en.length, `cap ${c.id}`);
    assert.ok(/mij[oa]/i.test(c.relato.es.join(' ')), `cap ${c.id}: lo cuenta Granma`);
    assert.equal(c.consejo.clave.length, 2); for (const k of c.consejo.clave) { assert.ok(norm(c.consejo.es).includes(norm(k.es))); assert.ok(norm(c.consejo.en).includes(norm(k.en))); }
    assert.ok(c.consejo.es.length <= 100 && !/[!¡]|mij[oa]/i.test(c.consejo.es), `cap ${c.id}: el Abuelo, sereno`);
    assert.ok(recetas.some((r) => r.id === c.receta));
    for (const p of c.palabras) { assert.ok(!vistas.has(p.en.toLowerCase()), `cap ${c.id}: «${p.en}» ya salió antes`); vistas.add(p.en.toLowerCase()); }
    for (const interes of ['trabajo', 'amigos', 'biblia', 'viajes', 'cocina']) {
      const ej = c.ejemplos[interes]; assert.equal(ej.length, 3); assert.equal(new Set(ej.map((e) => e.we)).size, 3);
      for (const e of ej) { assert.ok(c.palabras.some((p) => norm(p.en) === norm(e.we) && norm(p.es) === norm(e.ws)), `cap ${c.id}: «${e.we}/${e.ws}»`); assert.ok(new RegExp(`\\b${e.we}\\b`, 'i').test(e.en) && new RegExp(`(^|[^\\p{L}])${e.ws}([^\\p{L}]|$)`, 'iu').test(e.es), `cap ${c.id}: «${e.we}» en su frase`); }
      const pi = c.palabrasInteres[interes]; assert.equal(pi.length, 3);
      for (const w of pi) assert.ok(new RegExp(`\\b${w.en}\\b`, 'i').test(w.f.en) && new RegExp(`(^|[^\\p{L}])${w.es}([^\\p{L}]|$)`, 'iu').test(w.f.es), `cap ${c.id} ${interes}: «${w.en}/${w.es}» en su frase`);
    }
    // el versículo es solo una referencia: el texto sale de RV1909 y KJV, nunca se escribe a mano
    if (c.versiculo) { const l = libros.find((x) => x.id === c.versiculo.libro); assert.ok(l && c.versiculo.desde <= l.caps[c.versiculo.cap - 1], `cap ${c.id}: la cita existe`);
      for (const v of ['rv1909', 'kjv']) { const t = json(`data/biblia/${v}/${c.versiculo.libro}.json`).c[c.versiculo.cap - 1][c.versiculo.desde - 1]; assert.ok(t && t.length > 20); assert.ok(!JSON.stringify(c.relato).includes(t.slice(0, 40)), `cap ${c.id}: el relato no copia el versículo`); } }
  }
  assert.equal(h2.capitulos[0].versiculo, undefined, 'la fe entra poco a poco: el primer capítulo no trae versículo');
  assert.ok(h2.capitulos.slice(1).every((c) => c.versiculo), 'del segundo en adelante, cada capítulo trae su versículo');
  const todo = JSON.stringify(h2).toLowerCase();
  for (const mala of ['ntv', 'nlt', 'reina-valera 1960', 'rv1960', 'pecador', 'condena', 'tienes que creer', 'debes creer', 'te vas a', 'falsa religión', 'religiosos']) assert.ok(!todo.includes(mala), `Historia 2: «${mala}» no va con el tono`);
  assert.ok(/sin prisa|no hay prisa/.test(todo) && /si un día quieres/.test(todo), 'la invitación a leer la Biblia es sin presión');
  const lec = leer('js/vistas/leccion.js'); assert.ok(/if \(!sobria\) fiesta\(/.test(lec) && /sobria \? cierreSobrio\(\)/.test(lec) && /class="versos"/.test(lec), 'cierre sobrio y versículo en tarjeta formal');
  assert.ok(/'rv1909'/.test(lec) && /'kjv'/.test(lec) && !/rv1960|ntv|nlt/i.test(lec));
});

test('Así se habla, Reglas claras y Platica con Granma: esquema completo, sano y bilingüe', () => {
  const col = json('data/coloquial.json'), reg = json('data/reglas.json'), pla = json('data/platicas.json'), par = (o) => o && typeof o.es === 'string' && typeof o.en === 'string' && o.es.trim() && o.en.trim();
  // frases coloquiales: México por región e inglés de todos los días, cada una con contexto
  assert.equal(new Set(col.map((x) => x.id)).size, col.length);
  for (const x of col) { assert.ok(['es', 'en'].includes(x.idioma) && x.frase && par(x.significa) && par(x.uso) && par(x.ejemplo), x.id); assert.ok(x.significa.es.length <= 160 && x.uso.es.length <= 240 && x.uso.en.length <= 240, `${x.id}: corto`); assert.deepEqual(Object.keys(x).sort(), ['ejemplo', 'frase', 'id', 'idioma', 'region', 'significa', 'uso']); }
  for (const r of ['mexico', 'jalisco', 'sinaloa', 'cdmx', 'monterrey', 'humor']) assert.ok(col.filter((x) => x.idioma === 'es' && x.region === r).length >= 4, `México: región ${r}`);
  for (const r of ['diario', 'modismos', 'humor', 'sur', 'regiones']) assert.ok(col.filter((x) => x.idioma === 'en' && x.region === r).length >= 4, `inglés: ${r}`);
  for (const f of ['güey', 'wey', 'no mames', 'pex', 'naco', 'gringo', 'chingón', 'cabrón']) assert.ok(!col.some((x) => x.frase.toLowerCase().includes(f)), `«${f}» no entra`);
  assert.ok(/nunca para hablar de una persona/.test(col.find((x) => x.frase === 'cochi').uso.es), 'ninguna frase se presta a burlas del cuerpo');
  // reglas: 6 para quien aprende inglés (empieza por «to be») y 6 para quien aprende español (empieza por ser y estar)
  assert.equal(reg.filter((l) => l.para === 'en').length, 6); assert.equal(reg.filter((l) => l.para === 'es').length, 6);
  assert.equal(reg.find((l) => l.para === 'en').id, 'to-be'); assert.equal(reg.find((l) => l.para === 'es').id, 'ser-estar');
  for (const l of reg) { assert.ok(par(l.titulo) && par(l.resumen) && l.puntos.length >= 3 && l.puntos.length <= 4, l.id);
    for (const p of l.puntos) { assert.ok(par(p.regla) && p.ejemplos.length >= 2 && p.ejemplos.every(par), l.id); }
    assert.equal(l.practica.length, 4, l.id);
    for (const q of l.practica) assert.ok(par(q.p) && q.frase.includes('___') && q.ok && q.mal.length === 2 && !q.mal.includes(q.ok) && new Set(q.mal).size === 2, `${l.id}: ${q.frase}`); }
  // pláticas: 3 turnos de 3 respuestas, todas válidas, y Granma siempre contesta
  assert.ok(pla.length >= 12 && new Set(pla.map((p) => p.id)).size === pla.length);
  for (const p of pla) { assert.ok(par(p.tema) && par(p.cierre) && p.turnos.length === 3, p.id);
    for (const t of p.turnos) { assert.ok(par(t.granma) && t.respuestas.length === 3, p.id); for (const r of t.respuestas) assert.ok(par(r.t) && par(r.r) && r.t.es.length <= 70 && r.r.es.length <= 120, p.id); } }
  const pesado = JSON.stringify(pla.find((p) => p.id === 'un-dia-pesado')); assert.ok(/confianza/.test(pesado) && /Pedir ayuda/.test(pesado), 'cuando el día fue pesado, Granma escucha y anima a platicarlo y a pedir ayuda');
  // pantallas y enlaces
  const app = leer('js/app.js'); for (const r of ['platica', 'asi', 'reglas']) assert.ok(new RegExp(`${r}: \\(\\) => import\\('\\./vistas/${r}\\.js'\\)`).test(app), `ruta ${r}`);
  const hab = leer('js/vistas/hablar.js'); for (const h of ['#/platica', '#/asi', '#/reglas']) assert.ok(hab.includes(h), `Hablar enlaza ${h}`);
  assert.ok(leer('js/vistas/inicio.js').includes('#/platica'), 'Granma saca plática desde el inicio');
  const sw = leer('sw.js'); for (const f of ['data/coloquial.json', 'data/reglas.json', 'data/platicas.json']) assert.ok(sw.includes(f), `${f} funciona sin internet`);
  assert.ok(json('data/paquetes.json').paquetes.find((p) => p.id === 'historia').archivos.includes('data/historia2.json'), 'la Historia 2 se descarga con la historia');
});
