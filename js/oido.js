// «Dilo en voz alta»: la app escucha a la persona para que empiece a hablar el idioma.
//  1) Si el navegador reconoce voz (Web Speech API), compara lo que oyó con la frase.
//  2) Si no puede (sin internet, sin permiso, navegador sin esa función), la persona se graba, se escucha y ella misma decide.
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

/** Graba la voz (máx. `ms`). → { ok: true, url, parar }  La URL es local (en memoria); quien la usa la libera con soltar(). */
export async function grabar({ ms = 7000 } = {}) {
  if (!puedeGrabar()) return { ok: false, motivo: 'sin-soporte' };
  let flujo;
  try { flujo = await navigator.mediaDevices.getUserMedia({ audio: true }); } catch { return { ok: false, motivo: 'permiso' }; }
  const trozos = [], mr = new MediaRecorder(flujo);
  const fin = new Promise((ok) => {
    mr.ondataavailable = (e) => { if (e.data.size) trozos.push(e.data); };
    mr.onstop = () => { flujo.getTracks().forEach((t) => t.stop()); ok(trozos.length ? URL.createObjectURL(new Blob(trozos, { type: mr.mimeType || 'audio/mp4' })) : null); };
  });
  mr.start(); const tope = setTimeout(() => mr.state === 'recording' && mr.stop(), ms);
  return { ok: true, fin, parar: () => { clearTimeout(tope); if (mr.state === 'recording') mr.stop(); } };
}
export const soltar = (url) => { try { if (url) URL.revokeObjectURL(url); } catch { /* nada */ } };
