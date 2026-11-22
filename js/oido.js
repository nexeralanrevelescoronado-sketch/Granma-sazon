// «Dilo en voz alta»: la app escucha a la persona para que empiece a hablar el idioma.
//  1) Si el navegador reconoce voz (Web Speech API), compara lo que oyó con la frase.
//  2) Si no puede (sin internet, sin permiso, navegador sin esa función) o la persona no quiere, entra el verificador
//     propio: mide la voz en vivo dentro del teléfono y comprueba que dijo la frase completa; además se graba y se escucha.
// Nada se guarda ni se sube desde la app: la grabación vive en memoria y se borra al pasar de ejercicio.
// (El reconocimiento de voz lo hace el navegador y puede mandar el audio a su proveedor; por eso se avisa la primera vez.)
const LANG = { es: 'es-MX', en: 'en-US' };
const Reco = () => (typeof window !== 'undefined' ? window.SpeechRecognition || window.webkitSpeechRecognition : null);
export const puedeReconocer = () => !!Reco();
export const puedeGrabar = () => typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia && typeof MediaRecorder !== 'undefined';

/** Deja solo letras y números, sin acentos ni signos, para comparar lo dicho con lo esperado. Pura. */
export const limpiar = (t) => String(t || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9ñ\s']/g, ' ').replace(/'/g, '').replace(/\s+/g, ' ').trim();
function distancia(a, b) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}
/** Qué tanto de la frase esperada se oyó (0 a 1). Tolera una letra de diferencia en palabras largas. Pura. */
export function parecido(dicho, esperado) {
  const e = limpiar(esperado).split(' ').filter(Boolean), d = limpiar(dicho).split(' ').filter(Boolean);
  if (!e.length) return 0;
  const libres = [...d]; let hallo = 0;
  for (const w of e) { const i = libres.findIndex((x) => x === w || (w.length > 3 && distancia(x, w) <= (w.length > 6 ? 2 : 1))); if (i >= 0) { hallo++; libres.splice(i, 1); } }
  return hallo / e.length;
}
export const UMBRAL = 0.6;   // con 6 de cada 10 palabras se da por bueno: lo importante es animarse a hablar

/**
 * Escucha una frase. → { ok: true, textos: [...] }  |  { ok: false, motivo: 'permiso' | 'red' | 'silencio' | 'sin-soporte' | 'error' }
 * `alEmpezar` avisa cuando el micrófono ya está oyendo. Devuelve además `parar()` en la promesa.
 */
export function escuchar(idioma, { ms = 8000, alEmpezar } = {}) {
  const R = Reco(); let rec, parar = () => {};
  const p = new Promise((fin) => {
    if (!R) return fin({ ok: false, motivo: 'sin-soporte' });
    let listo = false; const cerrar = (v) => { if (listo) return; listo = true; clearTimeout(tope); try { rec.abort(); } catch { /* ya cerró */ } fin(v); };
    const tope = setTimeout(() => cerrar({ ok: false, motivo: 'silencio' }), ms);
    try {
      rec = new R(); rec.lang = LANG[idioma] || LANG.en; rec.interimResults = false; rec.maxAlternatives = 5; rec.continuous = false;
      rec.onstart = () => alEmpezar?.();
      rec.onresult = (ev) => { const textos = []; for (const r of ev.results) for (const a of r) textos.push(a.transcript); cerrar(textos.length ? { ok: true, textos } : { ok: false, motivo: 'silencio' }); };
      rec.onerror = (ev) => cerrar({ ok: false, motivo: /not-allowed|service-not-allowed/.test(ev.error) ? 'permiso' : ev.error === 'network' ? 'red' : /no-speech|aborted/.test(ev.error) ? 'silencio' : 'error' });
      rec.onend = () => cerrar({ ok: false, motivo: 'silencio' });
      parar = () => { try { rec.stop(); } catch { /* ya cerró */ } };
      rec.start();
    } catch { cerrar({ ok: false, motivo: 'error' }); }
  });
  p.parar = () => parar();
  return p;
}

/* ---------- Verificador propio de Granma Sazón ----------
   Corre entero en el teléfono, en vivo y sin internet. NO reconoce palabras (eso solo lo hace un servicio de voz):
   mide la voz mientras la persona habla y comprueba que SÍ habló, que dijo la frase completa (mismo número de golpes
   de voz que sílabas tiene la frase) y que no se quedó a medias. La pronunciación la compara la persona con su grabación. */

/** Cuántas sílabas tiene una frase (aproximado, suficiente para medir el largo). Pura. */
export function silabas(texto, idioma) {
  let total = 0;
  for (const w of limpiar(texto).split(' ').filter(Boolean)) {
    if (/^\d+$/.test(w)) { total += w.length; continue; }
    let n;
    if (idioma === 'es') n = (w.replace(/qu/g, 'q').replace(/gu(?=[ei])/g, 'g').match(/[aeo]+[iu]?|[iu]+[aeo]?[iu]?/g) || []).length;
    else { const base = w.length > 3 ? w.replace(/(?:[^laeiouy]es|[^aeiouy]ed|[^aeiouyl]e)$/, (m) => m[0]) : w; n = (base.match(/[aeiouy]+/g) || []).length; }
    total += Math.max(1, n);
  }
  return total;
}

/**
 * Analiza el volumen de la voz medido en vivo. `niveles` = [{ t (ms), v (0..1) }].  Pura (se puede probar sin micrófono).
 * → { hablo, golpes, duracion (s), esperado, veredicto: 'completa' | 'corta' | 'silencio' }
 */
export function analizarVoz(niveles, esperado) {
  if (!niveles || niveles.length < 4) return { hablo: false, golpes: 0, duracion: 0, esperado, veredicto: 'silencio' };
  const orden = niveles.map((x) => x.v).sort((a, b) => a - b), piso = orden[Math.floor(orden.length * 0.1)], pico = orden[orden.length - 1];
  const umbral = Math.max(0.012, piso * 2.5, pico * 0.18);
  // suavizado (~60 ms) para que cada sílaba sea un solo «golpe»
  const suave = niveles.map((x, i) => { let s = 0, n = 0; for (let j = i; j >= 0 && x.t - niveles[j].t <= 60; j--) { s += niveles[j].v; n++; } return { t: x.t, v: s / n }; });
  let duracion = 0, golpes = 0, ultimo = -1e9;
  for (let i = 1; i < suave.length; i++) if (suave[i].v > umbral) duracion += Math.min(80, suave[i].t - suave[i - 1].t);
  for (let i = 1; i < suave.length - 1; i++) {
    const x = suave[i];
    if (x.v > umbral && x.v >= suave[i - 1].v && x.v > suave[i + 1].v && x.t - ultimo >= 110) {
      // solo cuenta si entre este golpe y el anterior la voz bajó de verdad (un valle)
      let valle = x.v; for (let j = i - 1; j >= 0 && suave[j].t > ultimo; j--) valle = Math.min(valle, suave[j].v);
      if (ultimo < 0 || valle < x.v * 0.72) { golpes++; ultimo = x.t; }
    }
  }
  duracion /= 1000;
  const hablo = pico > 0.02 && duracion >= 0.1 && golpes >= 1;
  // Tolerancia amplia: quien empieza habla más lento o junta sílabas. Lo que no pasa es quedarse a medias.
  const minimo = Math.max(1, Math.ceil(esperado * 0.55)), completa = hablo && golpes >= minimo && duracion >= Math.max(0.1, esperado * 0.09);
  return { hablo, golpes, duracion, esperado, veredicto: !hablo ? 'silencio' : completa ? 'completa' : 'corta' };
}

/**
 * Escucha en vivo y graba (máx. `ms`). `alNivel(v)` avisa del volumen ~60 veces por segundo; se detiene sola
 * cuando la persona termina de hablar. → { ok, fin: Promise<{ url, niveles }>, parar }
 * La grabación queda en una URL local (memoria); quien la usa la libera con soltar().
 */
export async function grabar({ ms = 9000, alNivel } = {}) {
  if (!puedeGrabar()) return { ok: false, motivo: 'sin-soporte' };
  let flujo;
  try { flujo = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: true, noiseSuppression: true } }); } catch { return { ok: false, motivo: 'permiso' }; }
  const trozos = [], mr = new MediaRecorder(flujo), niveles = [];
  let ctx = null, cuadro = 0, vivo = true;
  try {
    const AC = window.AudioContext || window.webkitAudioContext; ctx = new AC(); if (ctx.state === 'suspended') ctx.resume();
    const an = ctx.createAnalyser(); an.fftSize = 1024; ctx.createMediaStreamSource(flujo).connect(an);
    const buf = new Float32Array(an.fftSize), t0 = performance.now(); let hablando = 0, ultimaVoz = 0;
    (function medir() {
      if (!vivo) return;
      an.getFloatTimeDomainData(buf); let s = 0; for (let i = 0; i < buf.length; i++) s += buf[i] * buf[i];
      const v = Math.sqrt(s / buf.length), t = performance.now() - t0; niveles.push({ t, v }); alNivel?.(v);
      if (v > 0.03) { hablando++; ultimaVoz = t; }
      if (hablando > 6 && t - ultimaVoz > 1100 && mr.state === 'recording') return void mr.stop();     // ya terminó de hablar
      cuadro = requestAnimationFrame(medir);
    })();
  } catch { /* sin medidor: queda solo la grabación */ }
  const fin = new Promise((ok) => {
    mr.ondataavailable = (e) => { if (e.data.size) trozos.push(e.data); };
    mr.onstop = () => {
      vivo = false; cancelAnimationFrame(cuadro); flujo.getTracks().forEach((t) => t.stop()); try { ctx?.close(); } catch { /* ya cerró */ }
      ok({ url: trozos.length ? URL.createObjectURL(new Blob(trozos, { type: mr.mimeType || 'audio/mp4' })) : null, niveles });
    };
  });
  mr.start(); const tope = setTimeout(() => mr.state === 'recording' && mr.stop(), ms);
  return { ok: true, fin, parar: () => { clearTimeout(tope); if (mr.state === 'recording') mr.stop(); } };
}
export const soltar = (url) => { try { if (url) URL.revokeObjectURL(url); } catch { /* nada */ } };
