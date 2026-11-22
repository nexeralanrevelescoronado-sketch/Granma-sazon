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
  const todo = textoDe([consejos, cotorreos, historia, recetas]);
  const RAICES = ['estúpid', 'pendej', 'imbécil', 'maric', 'stupid'];
  for (const p of PROHIBIDAS) assert.ok(!new RegExp(`(^|[^\\p{L}])${p}${RAICES.some((r) => p.startsWith(r)) ? '' : '($|[^\\p{L}])'}`, 'u').test(todo), `palabra no permitida: «${p}»`);
});

test('no se menciona ni imita a otras apps, marcas o personajes', () => {
  const marcas = ['duolingo', 'babbel', 'disney', 'pixar', 'netflix', 'ghibli', 'mafalda', 'abuelita de coco', 'mama coco', 'mamá coco', 'rosetta', 'busuu', 'memrise', 'canva'];
  const archivos = ['index.html', 'manifest.webmanifest', 'README.md', 'sw.js', 'css/app.css', ...readdirSync(join(RAIZ, 'js'), { recursive: true }).filter((f) => f.endsWith('.js')).map((f) => 'js/' + f), 'data/historia.json', 'data/recetas.json', 'data/consejos.json', 'data/cotorreo.json'];
  for (const a of archivos) { const t = leer(a).toLowerCase(); for (const m of marcas) assert.ok(!new RegExp(`(^|[^\\p{L}])${m}($|[^\\p{L}])`, 'u').test(t), `${a} menciona «${m}»`); }
  for (const f of readdirSync(join(RAIZ, 'assets/personajes'))) { const t = leer('assets/personajes/' + f).toLowerCase(); for (const m of marcas) assert.ok(!t.includes(m)); }
});

test('Historia 1: 5 capítulos, 8-10 palabras, relato bilingüe y consejo con 2 claves', () => {
  assert.equal(historia.capitulos.length, 5);
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
        const items = ejerciciosDeCapitulo(c, interes); assert.equal(items.length, 5);
        assert.deepEqual(items.map((i) => i.tipo), ['mcq', 'mcq', 'orden', 'pares', 'mcq']);
        for (const it of items.filter((i) => i.tipo === 'mcq')) { assert.ok(it.opciones.includes(it.correcta), 'la correcta está en las opciones'); assert.equal(new Set(it.opciones).size, it.opciones.length, 'opciones repetidas'); }
        assert.ok(items[1].frase.includes('_____')); assert.ok(items[3].pares.length >= 3);
        huellas.add(JSON.stringify([items[1].frase, items[2].respuesta]));
      }
      assert.equal(huellas.size, 5, `cap ${c.id} (${aprende}): los ejemplos deben cambiar por interés`);
    }
  }
});

test('recetas: mole, pozole, champurrado y buñuelos con medidas, pasos y cronómetro', () => {
  assert.deepEqual(recetas.map((r) => r.id).sort(), ['bunuelos', 'champurrado', 'mole', 'pozole']);
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
  const p = json('data/paquetes.json').paquetes; assert.deepEqual(p.map((x) => x.id), ['historia', 'recetas', 'cotorreo', 'consejos', 'italianas', 'biblia']);
  const total = p.reduce((s, x) => s + x.bytes, 0); assert.ok(total < 50 * 1048576, `total ${total}`);
  assert.equal(p.find((x) => x.id === 'italianas').proximamente, true);
  const sw = leer('sw.js'); assert.ok(!sw.includes("VERSION = 'dev'"), 'corre «node scripts/build.mjs» antes de subir'); assert.ok(sw.includes('"index.html"'));
});

test('personajes: 4 variantes por abuelo, con cabeza y cuerpo separables', () => {
  for (const q of ['granma', 'abuelo']) for (const v of ['contento', 'pensando', 'aplaudiendo', 'animo']) for (const pref of ['', '-cabeza', '-cuerpo']) {
    const f = `assets/personajes/${q}${pref}-${v}.svg`; assert.ok(existsSync(join(RAIZ, f)), f); assert.ok(statSync(join(RAIZ, f)).size < 12000, f + ' pesa demasiado');
  }
});
