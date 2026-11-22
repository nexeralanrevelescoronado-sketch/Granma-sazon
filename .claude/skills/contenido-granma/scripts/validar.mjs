#!/usr/bin/env node
// Validador ligero del contenido de Granma Sazón (sin dependencias).
//   node validar.mjs <tipo> <archivo.json>   tipo: consejos | cotorreos | capitulos | recetas | biblia | tanda
//   node validar.mjs --repo                  valida todo lo que ya está en data/ (más duplicados)
//   node validar.mjs --autoprueba            comprueba que el validador acepta lo bueno y rechaza lo malo
// «tanda» = un objeto { consejos: [...], cotorreos: [...], ... } con varios tipos a la vez.
// Sale con código 1 si hay errores. Las advertencias (⚠) no fallan, pero hay que revisarlas.
import { readFileSync, existsSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const AQUI = dirname(fileURLToPath(import.meta.url));
let RAIZ = resolve(AQUI); while (!existsSync(join(RAIZ, 'package.json')) && dirname(RAIZ) !== RAIZ) RAIZ = dirname(RAIZ);
const leer = (r) => JSON.parse(readFileSync(join(RAIZ, r), 'utf8'));

/* ---------------- listas de reglas ---------------- */
const PALABRAS_PROHIBIDAS = ['puta', 'puto', 'pendejo', 'pendeja', 'cabrón', 'cabron', 'verga', 'chingar', 'chingada', 'culero', 'mierda', 'coño', 'joder', 'carajo', 'idiota', 'imbécil', 'maricón', 'pinche', 'fuck', 'shit', 'bitch', 'asshole', 'damn', 'stupid', 'idiot', 'dumb', 'hell', 'infierno', 'castigo',
  'gordo', 'gorda', 'flaco', 'flaca', 'calvo', 'enano', 'feo', 'fea', 'tonto', 'tonta', 'ugly', 'fat', 'sexy', 'sexo', 'nalgas', 'chichis', 'borracho', 'borracha', 'drunk'];
const RAICES = ['estúpid', 'pendej', 'maric'];
const FRASES_PROHIBIDAS = ['te vas a arrepentir', 'vas a quedar mal', 'todos se burlarán', 'todos se burlaran', 'no sirves', 'eres un fracaso', 'give up now', 'you will regret', 'serás castigado', 'te irá mal'];
const MARCAS = ['duolingo', 'babbel', 'rosetta', 'busuu', 'memrise', 'disney', 'pixar', 'netflix', 'ghibli', 'mafalda', 'tiktok', 'instagram', 'facebook', 'youtube', 'google', 'canva', 'thermomix', 'maseca', 'nestlé', 'nestle', 'knorr', 'coca-cola', 'pepsi'];
const BIBLIA_CON_DERECHOS = ['ntv', 'nlt', 'tyndale', 'nueva traducción viviente', 'new living translation'];
const UNIDADES = new Set(['g', 'kg', 'ml', 'L', 'cda', 'cdta', 'tazas', 'taza', 'pza', 'dientes', 'cm', 'pizca', 'rebanadas', 'hojas', 'ramas']);
const TEMAS = { consejos: ['trabajo', 'amistad', 'familia', 'constancia', 'fe', 'dinero', 'cocina'], cotorreos: ['cocina', 'trabajo', 'amigos', 'fe', 'viajes'] };
const TIPOS_COTORREO = ['chiste', 'adivinanza', 'refrán', 'trabalenguas', 'juego de palabras'];
const INTERESES = ['trabajo', 'amigos', 'biblia', 'viajes', 'cocina'];

/* ---------------- utilidades ---------------- */
const norm = (s) => String(s).toLowerCase();
const sinAc = (s) => norm(s).normalize('NFD').replace(/[̀-ͯ]/g, '');
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const esTexto = (v) => typeof v === 'string' && v.trim().length > 0;
const par = (o) => o && esTexto(o.es) && esTexto(o.en);
const textoPlano = (o) => JSON.stringify(o, (_k, v) => v).toLowerCase();
const contiene = (texto, palabra) => new RegExp(`(^|[^\\p{L}])${esc(norm(palabra))}($|[^\\p{L}])`, 'iu').test(norm(texto));
const incluye = (texto, palabra) => norm(texto).includes(norm(palabra));

/** Reglas de lenguaje que valen para cualquier tipo de contenido. Devuelve [errores, avisos]. */
function reglasGenerales(item) {
  const e = [], a = [], t = textoPlano(item);
  for (const p of PALABRAS_PROHIBIDAS) if (new RegExp(`(^|[^\\p{L}])${esc(p)}(?:s|es)?($|[^\\p{L}])`, "u").test(t)) e.push(`palabra no permitida: «${p}»`);
  for (const r of RAICES) if (new RegExp(`(^|[^\\p{L}])${r}`, 'u').test(t)) e.push(`palabra no permitida (raíz «${r}»)`);
  for (const f of FRASES_PROHIBIDAS) if (t.includes(f)) e.push(`mensaje de culpa o miedo: «${f}»`);
  for (const m of MARCAS) if (new RegExp(`(^|[^\\p{L}])${esc(m)}($|[^\\p{L}])`, 'u').test(t)) e.push(`menciona una marca o app ajena: «${m}»`);
  for (const b of BIBLIA_CON_DERECHOS) if (new RegExp(`(^|[^\\p{L}])${esc(b)}($|[^\\p{L}])`, 'u').test(t)) e.push(`texto o mención de Biblia con derechos (${b}): solo RV1909, KJV y WEB`);
  const crudo = JSON.stringify(item);
  if (/(?:dijo|decía|según|escribió|afirmó|said|according to)\s+(?!Dios\b|God\b|Granma\b|Abuelo\b|Jesús\b|Jesus\b|Grandpa\b)[A-ZÁÉÍÓÚ][\p{L}]+/u.test(crudo)) a.push('¿atribuye una frase a una persona? los dichos deben ser de uso común, sin autor');
  if (/[—–]\s*[A-ZÁÉÍÓÚ][\p{L}]+\s+[A-ZÁÉÍÓÚ][\p{L}]+["”]?\s*[",}]/u.test(crudo)) a.push('parece una atribución «— Nombre Apellido»: quítala');
  if (/<[a-z][^>]*>|javascript:|https?:\/\//i.test(crudo)) e.push('no se permite HTML ni enlaces en el contenido');
  return [e, a];
}
const exclam = (o) => /[!¡]/.test(`${o?.es ?? ''}${o?.en ?? ''}`);

/* ---------------- validadores por tipo ---------------- */
function claves(item, min, max, errs) {
  if (!Array.isArray(item.clave) || item.clave.length < min || item.clave.length > max) return errs.push(`debe traer ${min === max ? min : `${min}-${max}`} palabras clave`);
  for (const k of item.clave) {
    if (!par(k)) errs.push('palabra clave sin es/en');
    else { if (!incluye(item.es ?? item.texto?.es ?? '', k.es)) errs.push(`clave «${k.es}» no aparece en el texto en español`); if (!incluye(item.en ?? item.texto?.en ?? '', k.en)) errs.push(`clave «${k.en}» no aparece en el texto en inglés`); }
  }
}
function miniEjercicio(q, errs, conPregunta) {
  if (!q || !par(q.ok)) return errs.push('mini-ejercicio: falta la respuesta correcta (q.ok es/en)');
  if (!Array.isArray(q.mal) || q.mal.length !== 2 || !q.mal.every(par)) errs.push('mini-ejercicio: deben ser exactamente 2 distractores (q.mal) con es/en');
  else if (q.mal.some((m) => norm(m.es) === norm(q.ok.es))) errs.push('mini-ejercicio: un distractor repite la respuesta correcta');
  if (conPregunta && !par(q.p)) errs.push('mini-ejercicio: falta la pregunta (q.p es/en)');
}

function validarConsejo(c) {
  const e = [], a = [];
  if (!TEMAS.consejos.includes(c.tema)) e.push(`tema no válido «${c.tema}» (${TEMAS.consejos.join(', ')})`);
  if (!par(c)) e.push('falta es o en'); else {
    for (const l of ['es', 'en']) if (c[l].length > 110) a.push(`consejo ${l} muy largo (${c[l].length}): el Abuelo dice pocas palabras`);
    if (exclam(c)) a.push('el Abuelo es sereno: evita signos de exclamación');
    if (/\b(mijo|mija|mijito)\b/i.test(c.es)) a.push('«mijo/mija» es de Granma, no del Abuelo');
  }
  claves(c, 2, 3, e); miniEjercicio(c.q, e, false); return [e, a];
}
function validarCotorreo(c) {
  const e = [], a = [];
  if (!TEMAS.cotorreos.includes(c.tema)) e.push(`tema no válido «${c.tema}» (${TEMAS.cotorreos.join(', ')})`);
  if (!TIPOS_COTORREO.includes(c.tipo)) e.push(`tipo no válido «${c.tipo}» (${TIPOS_COTORREO.join(', ')})`);
  if (!par(c)) e.push('falta es o en'); else if (norm(c.es) === norm(c.en)) a.push('es y en son idénticos: ¿es un trabalenguas? sí está permitido solo si el juego de sonidos cambia por idioma');
  claves(c, 3, 3, e); miniEjercicio(c.q, e, true);
  if (c.abuelo !== undefined) { if (!par(c.abuelo)) e.push('remate del Abuelo sin es/en'); else if (exclam(c.abuelo)) a.push('el remate del Abuelo debe ser serio, sin exclamaciones'); }
  if (c.tipo === 'refrán' && /\b(dijo|decía)\b/i.test(c.es)) a.push('los refranes no se atribuyen a nadie');
  return [e, a];
}
function validarCapitulo(c) {
  const e = [], a = [];
  if (!par(c.titulo)) e.push('titulo sin es/en');
  const r = c.relato;
  if (!r || !Array.isArray(r.es) || !Array.isArray(r.en) || r.es.length !== r.en.length || r.es.length < 3 || r.es.length > 5) e.push('relato: 3-5 párrafos y los mismos en es y en');
  else if (![...r.es, ...r.en].every(esTexto)) e.push('relato con párrafos vacíos');
  else {
    if (![...r.es, ...r.en].join(' ').match(/\bmij[oa]\b/i)) a.push('Granma debe decir «mijo/mija» en el relato');
    if (r.es.join(' ').length > 900) a.push('relato largo: «relato corto» (≈ 4 párrafos breves)');
  }
  if (!Array.isArray(c.palabras) || c.palabras.length < 8 || c.palabras.length > 10 || !c.palabras.every((p) => esTexto(p.en) && esTexto(p.es))) e.push('palabras: de 8 a 10, cada una con en y es');
  const pal = c.palabras || [];
  if (!c.ejemplos) e.push('faltan ejemplos'); else for (const i of INTERESES) {
    const ej = c.ejemplos[i];
    if (!Array.isArray(ej) || ej.length !== 3) { e.push(`ejemplos.${i}: deben ser 3 frases`); continue; }
    if (new Set(ej.map((x) => x.we)).size !== 3) e.push(`ejemplos.${i}: las 3 frases deben usar 3 palabras distintas`);
    for (const x of ej) {
      if (!esTexto(x.en) || !esTexto(x.es) || !esTexto(x.we) || !esTexto(x.ws)) { e.push(`ejemplos.${i}: frase incompleta (en, es, we, ws)`); continue; }
      if (!pal.some((p) => norm(p.en) === norm(x.we) && norm(p.es) === norm(x.ws))) e.push(`ejemplos.${i}: «${x.we}/${x.ws}» no es una de las palabras del capítulo`);
      if (!contiene(x.en, x.we)) e.push(`ejemplos.${i}: «${x.we}» no aparece (palabra completa) en «${x.en}»`);
      if (!contiene(x.es, x.ws)) e.push(`ejemplos.${i}: «${x.ws}» no aparece (palabra completa) en «${x.es}»`);
    }
  }
  if (!c.consejo || !par(c.consejo)) e.push('consejo del Abuelo sin es/en'); else { claves({ ...c.consejo }, 2, 2, e); if (exclam(c.consejo)) a.push('consejo del Abuelo con exclamaciones'); }
  if (!esTexto(c.receta)) e.push('falta receta (id de la receta ligada al capítulo)');
  else { try { if (!leer('data/recetas.json').some((r2) => r2.id === c.receta)) a.push(`la receta «${c.receta}» no existe todavía en data/recetas.json`); } catch { /* sin repo */ } }
  return [e, a];
}
function validarReceta(r) {
  const e = [], a = [];
  if (!/^[a-z0-9-]+$/.test(r.id || '')) e.push('id en minúsculas sin espacios');
  for (const k of ['nombre', 'resumen', 'nota', 'nivel']) if (!par(r[k])) e.push(`${k} sin es/en`);
  for (const k of ['porciones', 'tiempoPrep', 'tiempoCoccion']) if (!(Number.isFinite(r[k]) && r[k] > 0)) e.push(`${k} debe ser un número > 0`);
  if (!Array.isArray(r.ingredientes) || r.ingredientes.length < 4) e.push('ingredientes: al menos 4');
  else r.ingredientes.forEach((i, n) => {
    if (typeof i.cant !== 'number' || !(i.cant > 0)) e.push(`ingrediente ${n + 1}: «cant» debe ser un número exacto > 0 (nada de «al gusto» ni «un poco»)`);
    if (!esTexto(i.un)) e.push(`ingrediente ${n + 1}: falta la unidad`); else if (!UNIDADES.has(i.un)) a.push(`ingrediente ${n + 1}: unidad «${i.un}» poco común (usa ${[...UNIDADES].join(', ')})`);
    if (!par(i)) e.push(`ingrediente ${n + 1}: falta es/en`);
  });
  if (!Array.isArray(r.pasos) || r.pasos.length < 4) e.push('pasos: al menos 4, en orden');
  else {
    r.pasos.forEach((p, n) => { if (!par(p)) e.push(`paso ${n + 1}: falta es/en`); if (p.min !== undefined && !(Number.isInteger(p.min) && p.min > 0)) e.push(`paso ${n + 1}: «min» debe ser un entero > 0`); });
    const sinMin = r.pasos.filter((p) => p.min === undefined).length;
    if (sinMin === r.pasos.length) e.push('ningún paso lleva tiempo («min»): cada paso con espera o cocción necesita su cronómetro');
    else if (sinMin > 0) a.push(`${sinMin} paso(s) sin «min»: da un tiempo a todo paso que dure o espere`);
    const texto = r.pasos.map((p) => p.es).join(' ');
    if (/fr[ií]e|fre[ií]r|aceite caliente/i.test(texto) && !/adulto|adult/i.test(`${r.nota?.es} ${r.nota?.en}`)) e.push('hay fritura o aceite caliente: la nota debe pedir ayuda de un adulto');
    if (/(?:\d+)\s?(?:minutos?|min)\b/i.test(texto) && !r.pasos.some((p) => p.min)) a.push('el texto menciona minutos pero ningún paso tiene «min»');
  }
  return [e, a];
}
function validarBiblia(p) {
  const e = [], a = [];
  if (p.version || p.texto || p.ntv || p.nlt) e.push('no se guarda texto bíblico en el contenido: solo la referencia y los pares de palabras');
  if (!par(p.titulo)) e.push('titulo sin es/en');
  try {
    const libros = leer('data/biblia/libros.json').libros, l = libros.find((x) => x.id === p.ref?.libro);
    if (!l) { e.push(`libro «${p.ref?.libro}» no existe (ids de data/biblia/libros.json)`); return [e, a]; }
    if (!(p.ref.cap >= 1 && p.ref.cap <= l.caps.length)) { e.push('capítulo fuera de rango'); return [e, a]; }
    const rv = leer(`data/biblia/rv1909/${l.id}.json`).c[p.ref.cap - 1], kj = leer(`data/biblia/kjv/${l.id}.json`).c[p.ref.cap - 1];
    if (!(p.ref.desde >= 1 && p.ref.hasta >= p.ref.desde && p.ref.hasta <= rv.length)) { e.push('versículos fuera de rango'); return [e, a]; }
    const tEs = rv.slice(p.ref.desde - 1, p.ref.hasta).join(' '), tEn = kj.slice(p.ref.desde - 1, p.ref.hasta).join(' ');
    if (!Array.isArray(p.pares) || p.pares.length < 3 || p.pares.length > 4) e.push('pares: 3 o 4 [es, en]');
    else for (const [es, en] of p.pares) { if (!incluye(tEs, es)) e.push(`«${es}» no está en el versículo de RV1909`); if (!incluye(tEn, en)) e.push(`«${en}» no está en el versículo de KJV`); }
    if (p.ref.hasta - p.ref.desde > 2) a.push('«pasaje corto»: 1-3 versículos');
  } catch { a.push('no pude leer data/biblia: ¿estás dentro del repo?'); }
  return [e, a];
}

/* campos permitidos por tipo: nada de `autor`, `atribucion`, `nota`… inventados (rompen el esquema y las pruebas del repo) */
const CAMPOS = {
  consejos: ['id', 'tema', 'es', 'en', 'clave', 'q'],
  cotorreos: ['id', 'tema', 'tipo', 'es', 'en', 'clave', 'q', 'abuelo'],
  capitulos: ['id', 'receta', 'titulo', 'relato', 'palabras', 'ejemplos', 'consejo'],
  recetas: ['id', 'icono', 'estrella', 'insignia', 'nombre', 'resumen', 'porciones', 'tiempoPrep', 'tiempoCoccion', 'nivel', 'nota', 'ingredientes', 'pasos'],
  biblia: ['id', 'ref', 'titulo', 'pares'],
};
/* gentilicios y apodos regionales: no son error por sí solos (puede haber un «poblano» legítimo), pero un chiste con ellos casi siempre es una burla */
const GENTILICIOS = ['regio', 'regios', 'regiomontano', 'regiomontanos', 'chilango', 'chilangos', 'jarocho', 'jarochos', 'tapatío', 'tapatíos', 'norteño', 'norteños', 'yucateco', 'yucatecos', 'naco', 'nacos', 'gringo', 'gringos', 'paisa'];

const VALIDADORES = { consejos: validarConsejo, cotorreos: validarCotorreo, capitulos: validarCapitulo, recetas: validarReceta, biblia: validarBiblia };
const ARCHIVO = { consejos: 'data/consejos.json', cotorreos: 'data/cotorreo.json', capitulos: null, recetas: 'data/recetas.json', biblia: 'data/biblia/ruta.json' };
const etiqueta = (tipo, it, n) => `${tipo.slice(0, -1)} ${it.id ?? n + 1}${it.es ? ` «${String(it.es).slice(0, 38)}…»` : it.titulo?.es ? ` «${it.titulo.es}»` : it.nombre?.es ? ` «${it.nombre.es}»` : ''}`;

function validarLista(tipo, lista, { duplicadosContra = [] } = {}) {
  let errores = 0, avisos = 0; const salida = [], vistos = new Set(duplicadosContra.map((x) => norm(x)));
  lista.forEach((it, n) => {
    const [e, a] = VALIDADORES[tipo](it), [e2, a2] = reglasGenerales(it), clave = norm(it.es ?? it.titulo?.es ?? it.nombre?.es ?? it.id ?? '');
    const extra = Object.keys(it).filter((k) => !CAMPOS[tipo].includes(k));
    if (extra.length) e2.push(`campo(s) fuera del esquema: ${extra.join(', ')} (usa solo ${CAMPOS[tipo].join(', ')})`);
    if (tipo === 'cotorreos' || tipo === 'consejos') { const texto = norm(`${it.es} ${it.en}`); const g = GENTILICIOS.filter((w) => new RegExp(`(^|[^\\p{L}])${esc(w)}($|[^\\p{L}])`, 'u').test(texto)); if (g.length) a2.push(`menciona a un grupo regional («${g.join(', ')}»): ¿es una burla? el humor no se ríe de regiones`); }
    const todo = [...e, ...e2], av = [...a, ...a2];
    if (clave && vistos.has(clave)) todo.push('duplicado: ya existe contenido con el mismo texto'); vistos.add(clave);
    errores += todo.length; avisos += av.length;
    salida.push({ rotulo: etiqueta(tipo, it, n), errores: todo, avisos: av });
  });
  return { salida, errores, avisos };
}
function imprimir(tipo, r) {
  for (const s of r.salida) { console.log(`${s.errores.length ? '✘' : '✔'} ${s.rotulo}`); s.errores.forEach((m) => console.log(`    ✘ ${m}`)); s.avisos.forEach((m) => console.log(`    ⚠ ${m}`)); }
  console.log(`  → ${tipo}: ${r.salida.length} elemento(s), ${r.errores} error(es), ${r.avisos} aviso(s)\n`);
}
const comoLista = (x) => (Array.isArray(x) ? x : [x]);
const existentes = (tipo) => { try { const f = ARCHIVO[tipo]; return f ? leer(f).map((x) => x.es ?? x.titulo?.es ?? x.nombre?.es ?? '') : []; } catch { return []; } };

/* ---------------- modos ---------------- */
const [, , a1, a2] = process.argv;
let fallo = 0;
if (a1 === '--repo') {
  const caps = leer('data/historia.json').capitulos;
  for (const [tipo, lista] of [['consejos', leer('data/consejos.json')], ['cotorreos', leer('data/cotorreo.json')], ['capitulos', caps], ['recetas', leer('data/recetas.json')], ['biblia', leer('data/biblia/ruta.json')]]) { const r = validarLista(tipo, lista); imprimir(tipo, r); fallo += r.errores; }
} else if (a1 === '--autoprueba') {
  const malos = JSON.parse(readFileSync(join(AQUI, '..', 'ejemplos', 'malos.json'), 'utf8'));
  const buenos = { consejos: leer('data/consejos.json').slice(0, 2), cotorreos: leer('data/cotorreo.json').slice(0, 2), capitulos: leer('data/historia.json').capitulos.slice(0, 2), recetas: leer('data/recetas.json').slice(2, 4), biblia: leer('data/biblia/ruta.json').slice(0, 2) };
  for (const tipo of Object.keys(VALIDADORES)) {
    const b = validarLista(tipo, buenos[tipo]), m = validarLista(tipo, malos[tipo]);
    const okBuenos = b.errores === 0, okMalos = m.salida.length === 2 && m.salida.every((s) => s.errores.length > 0);
    console.log(`${okBuenos && okMalos ? '✔' : '✘'} ${tipo}: buenos pasan=${okBuenos} · malos rechazados=${m.salida.filter((s) => s.errores.length).length}/${m.salida.length}`);
    if (!okBuenos) b.salida.forEach((s) => s.errores.forEach((x) => console.log(`    (bueno rechazado) ${s.rotulo}: ${x}`)));
    if (!okMalos) m.salida.forEach((s) => { if (!s.errores.length) console.log(`    (malo aceptado) ${s.rotulo}`); });
    if (!okBuenos || !okMalos) fallo++;
  }
} else if (a1 && a2) {
  const datos = JSON.parse(readFileSync(a2, 'utf8'));
  const tipos = a1 === 'tanda' ? Object.keys(datos) : [a1];
  for (const tipo of tipos) {
    if (!VALIDADORES[tipo]) { console.error(`tipo desconocido: ${tipo}`); process.exit(2); }
    const r = validarLista(tipo, comoLista(a1 === 'tanda' ? datos[tipo] : datos), { duplicadosContra: existentes(tipo) }); imprimir(tipo, r); fallo += r.errores;
  }
} else { console.error('Uso: node validar.mjs <consejos|cotorreos|capitulos|recetas|biblia|tanda> <archivo.json> | --repo | --autoprueba'); process.exit(2); }
console.log(fallo ? `✘ ${fallo} problema(s): corrige y vuelve a validar` : '✔ Validación completa: sin errores');
process.exit(fallo ? 1 : 0);
