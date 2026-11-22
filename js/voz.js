// Voces de los personajes con la Web Speech API (las voces son las que tenga instaladas el dispositivo).
//  · El Abuelo: voz de hombre, grave y pausada (tono bajo, ritmo lento), como abuelo que aconseja.
//  · Granma: voz de mujer, cálida, un poco más ligera.
// Se prefiere español de México. El acento exacto (por ejemplo, de los Altos de Jalisco) NO se puede elegir
// con voces del sistema: para eso haría falta audio grabado por una persona (ver docs/CAMBIOS-AL-SPEC.md).
const LANG = { es: ['es-MX', 'es-US', 'es-419', 'es'], en: ['en-US', 'en'] };
export const PERFIL = {
  abuelo: { pitch: 0.55, rate: 0.8 },
  granma: { pitch: 1.12, rate: 0.9 },
};
const HOMBRE = /(juan|jorge|diego|carlos|enrique|pablo|andr[eé]s|miguel|ra[uú]l|reed|eddy|rocko|grandpa|abuelo|\bmale\b|hombre|masculin|daniel|aaron|arthur|gordon|fred|\btom\b|alex|david|mark|guy)/i;
const MUJER = /(paulina|m[oó]nica|ang[eé]lica|marisol|sabina|esperanza|paloma|luciana|francisca|helena|laura|flo|sandy|shelley|grandma|abuela|female|mujer|femenin|samantha|karen|victoria|susan|allison|ava|moira|tessa|zira|jenny|aria)/i;

export const vozDisponible = () => typeof window !== 'undefined' && 'speechSynthesis' in window && 'SpeechSynthesisUtterance' in window;
const normal = (l) => String(l || '').toLowerCase().replace('_', '-');

/** Elige la mejor voz instalada para ese idioma y personaje. Pura: recibe la lista de voces (se puede probar). */
export function elegirVoz(voces, idioma, quien) {
  const orden = LANG[idioma] || LANG.es;
  const delIdioma = voces.filter((v) => normal(v.lang).startsWith(idioma));
  if (!delIdioma.length) return null;
  const rango = (v) => { const i = orden.findIndex((o) => normal(v.lang) === o.toLowerCase() || (o.length === 2 && normal(v.lang).startsWith(o))); return i < 0 ? orden.length : i; };
  const genero = quien === 'abuelo' ? HOMBRE : MUJER, contrario = quien === 'abuelo' ? MUJER : HOMBRE;
  const puntos = (v) => (genero.test(v.name) ? 0 : contrario.test(v.name) ? 2 : 1) * 10 + rango(v);
  return [...delIdioma].sort((a, b) => puntos(a) - puntos(b))[0];
}
export function hayVozPara(idioma) { try { return speechSynthesis.getVoices().some((v) => normal(v.lang).startsWith(idioma)); } catch { return false; } }
export const cancelarVoz = () => { try { speechSynthesis.cancel(); } catch { /* sin voz */ } };

/** Dice un texto con la voz del personaje. Devuelve una promesa que termina cuando acaba de hablar. */
export function decir(texto, idioma, quien = 'granma') {
  return new Promise((ok) => {
    try {
      if (!vozDisponible() || !texto) return ok(false);
      cancelarVoz();
      const ut = new SpeechSynthesisUtterance(texto), perfil = PERFIL[quien] || PERFIL.granma, voz = elegirVoz(speechSynthesis.getVoices(), idioma, quien);
      ut.lang = voz?.lang || (LANG[idioma] || LANG.es)[0]; if (voz) ut.voice = voz;
      ut.pitch = perfil.pitch; ut.rate = perfil.rate;
      // Si la voz no arranca pronto (sin voces, o el navegador la bloquea hasta el primer toque), no se espera:
      // así los globos nunca se quedan detenidos por una voz que no va a sonar.
      let arranco = false;
      const sinArranque = setTimeout(() => { if (!arranco) ok(false); }, 900);
      const tope = setTimeout(() => ok(true), Math.min(25000, 1500 + texto.length * 110));
      ut.onstart = () => { arranco = true; };
      ut.onend = ut.onerror = () => { clearTimeout(sinArranque); clearTimeout(tope); ok(arranco); };
      speechSynthesis.speak(ut);
    } catch { ok(false); }
  });
}
// Algunos navegadores cargan la lista de voces más tarde: pedirla una vez las deja listas para la primera frase.
try { if (vozDisponible()) { speechSynthesis.getVoices(); speechSynthesis.onvoiceschanged = () => speechSynthesis.getVoices(); } } catch { /* sin voz */ }
