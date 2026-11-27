// Motor de ejercicios: generación (según el interés) y reproductor compartido por lecciones, retos,
// consejos, cotorreos y la ruta de Biblia. Sin librerías.
import { esc, mezclar, al, sinAcentos } from './util.js';
import { u, tgt, nat, vidas, perderVida, sinEnergia, MAX_VIDAS, estado, guardar } from './state.js';
import { pj } from './personajes.js';
import { sonido } from './sound.js';
import { confeti, animar, vibrar, hablar } from './fx.js';
import { callar as callarVoz } from './voz.js';
import { reaccion, tortillaPierde } from '../assets/animaciones/index.js';
import { puedeReconocer, puedeGrabar, escuchar, grabar, soltar, parecido, UMBRAL, silabas, analizarVoz, limpiar as limpiarTxt } from './oido.js';
import { reducirMovimiento } from './util.js';
import { oidoPropioListo, prepararOido, escucharPropio, audioDelToque } from './oido-propio.js';
import { confetiMexicano } from '../assets/animaciones/fiesta.js';
import { hayVozPara } from './voz.js';

// «Ahora no puedo hablar»: los ejercicios de voz se saltan un rato (20 min) sin castigo.
const CLAVE_NOHABLO = 'granma:nohablo';
export const hablarPausado = () => { try { return Date.now() - +(sessionStorage.getItem(CLAVE_NOHABLO) || 0) < 20 * 60000; } catch { return false; } };
export const BORRADO_MS = 60000;   // la grabación de práctica vive, como mucho, un minuto y solo en la memoria del teléfono
const pausarHablar = () => { try { sessionStorage.setItem(CLAVE_NOHABLO, String(Date.now())); } catch { /* sin almacenamiento */ } };

/* ---------- generación ---------- */
const otros = (palabras, excluir, n, campo) => mezclar(palabras.filter((p) => p[campo] !== excluir)).slice(0, n);
const comillas = (s) => `«${s}»`;

export function ejerciciosDeCapitulo(cap, interes) {
  const T = tgt(), N = nat(), pal = cap.palabras;
  const ej = cap.ejemplos[interes] || cap.ejemplos.amigos;
  const aPalabra = (e) => pal.find((p) => p.en.toLowerCase() === e.we.toLowerCase());
  const hueco = (e) => { const w = T === 'en' ? e.we : e.ws, f = T === 'en' ? e.en : e.es; return f.replace(new RegExp(`(^|[^\\p{L}])(${w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})(?=$|[^\\p{L}])`, 'iu'), (_m, a) => `${a}_____`); };
  const items = [];
  // 1) ¿Qué significa?
  // palabras propias del interés elegido (3 por capítulo): entran en el ejercicio 1, el 4 y el 5
  const propias = cap.palabrasInteres?.[interes] || [];
  const p1 = propias[0] || aPalabra(ej[1]);
  const f5 = propias[2] ? propias[2].f : ej[2], ops5 = (propias.length === 3 ? propias.map((x) => x.f) : ej).map((x) => x[N]);
  items.push({ tipo: 'mcq', prompt: u(`¿Qué significa ${comillas(p1[T])}?`, `What does ${comillas(p1[T])} mean?`), voz: p1[T], opciones: mezclar([p1[N], ...otros(pal, p1[N], 3, N).map((p) => p[N])]), correcta: p1[N] });
  // 2) Completa la frase (ejemplo del interés)
  const p2 = aPalabra(ej[0]);
  items.push({ tipo: 'mcq', prompt: u('Completa la frase', 'Complete the sentence'), frase: hueco(ej[0]), ayuda: ej[0][N], opciones: mezclar([p2[T], ...otros(pal, p2[T], 3, T).map((p) => p[T])]), correcta: p2[T] });
  // 3) Ordena la frase
  items.push({ tipo: 'orden', prompt: u('Ordena la frase', 'Put the sentence in order'), ayuda: ej[1][N], respuesta: ej[1][T], voz: ej[1][T] });
  // 4) Emparejar
  const usadas = [...new Set(ej.map((e) => aPalabra(e)))];
  const extra = mezclar(pal.filter((p) => !usadas.includes(p)));
  items.push({ tipo: 'pares', prompt: u('Une cada palabra con su significado', 'Match each word with its meaning'), pares: [...propias.slice(1), ...usadas, ...extra].slice(0, 4).map((p) => [p[T], p[N]]) });
  // 5) Elige la traducción
  items.push({ tipo: 'mcq', prompt: u('Elige la traducción correcta', 'Choose the right translation'), frase: f5[T], voz: f5[T], opciones: mezclar(ops5), correcta: f5[N] });
  // 6-9) Más juego: oído, deletreo y hablar. Se intercalan con los anteriores para que la lección no sea pareja.
  const cortas = mezclar([...pal, ...propias].filter((x) => /^\p{L}{3,8}$/u.test(x[T]) && x.en.toLowerCase() !== x.es.toLowerCase()));
  const pE = cortas[0], pL = cortas[1] || cortas[0], pD = cortas[2] || cortas[0];
  const idiomaT = T === 'en' ? u('inglés', 'English') : u('español', 'Spanish');
  const oido = pE && hayVozPara(T) ? { tipo: 'mcq', oir: true, prompt: u('¿Qué escuchaste?', 'What did you hear?'), ayuda: u('Toca 🔊 las veces que quieras.', 'Tap 🔊 as many times as you like.'), voz: pE[T], opciones: mezclar([pE[T], ...otros(pal, pE[T], 3, T).map((x) => x[T])]), correcta: pE[T] } : null;
  const letras = pL ? { tipo: 'orden', letras: true, prompt: u(`Escribe ${comillas(pL[N])} en ${idiomaT}`, `Spell ${comillas(pL[N])} in ${idiomaT}`), ayuda: u('Toca las letras en orden.', 'Tap the letters in order.'), respuesta: pL[T] } : null;
  const diPalabra = pD ? { tipo: 'di', prompt: u('Dilo en voz alta', 'Say it out loud'), frase: pD[T], ayuda: pD[N], voz: pD[T] } : null;
  const diFrase = { tipo: 'di', prompt: u('Ahora di la frase completa', 'Now say the whole sentence'), frase: ej[0][T], ayuda: ej[0][N], voz: ej[0][T] };
  const [significa, completa, ordena, une, traduce] = items;
  return [significa, oido, completa, diPalabra, une, letras, ordena, traduce, diFrase].filter(Boolean);
}

/* ---------- reproductor ---------- */
const OK = [['granma', 'aplaudiendo', '¡Eso es, mija!', 'That is it, mija!'], ['granma', 'aplaudiendo', '¡Qué bonito, mijo!', 'How lovely, mijo!'], ['abuelo', 'asintiendo', 'Bien hecho.', 'Well done.'], ['granma', 'aplaudiendo', '¡Ándale, sigue así!', 'Go on, keep it up!'], ['abuelo', 'asintiendo', 'Muy bien.', 'Very good.']];
const MAL = [['granma', 'contenta', '¡Ándale, otra vez, mijo!', 'Come on, try again, mijo!'], ['abuelo', 'serio', 'Quien persevera, alcanza.', 'Whoever perseveres, achieves.'], ['granma', 'pensando', 'No pasa nada, mija. Así se aprende.', 'It is fine, mija. That is how we learn.']];

/**
 * Juega una lista de ejercicios dentro de `raiz`.
 * opciones: { usarVidas, titulo, alSalir }  →  Promise<{aciertos, errores, sinVidas, salio}>
 */
export function jugar(raiz, items, { usarVidas = true } = {}) {
  return new Promise((resolver) => {
    const cola = items.filter((it) => it.tipo !== 'di' || !hablarPausado()).map((it, i) => ({ ...it, id: i, reintento: false }));
    let total = cola.length;
    let hechos = 0, aciertos = 0, errores = 0, actual = null, bloqueado = false, racha = 0, mejorRacha = 0;
    const T = tgt();

    const cab = () => `<div class="sesion-top">
      <button class="btn-icono" data-salir aria-label="${u('Salir', 'Exit')}">✕</button>
      <div class="barra" role="progressbar" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${hechos}" aria-label="${u('Progreso', 'Progress')}"><i style="transform:scaleX(${total ? hechos / total : 1})"></i></div>
      <span class="combo" data-combo ${racha >= 3 ? '' : 'hidden'} role="img" aria-label="${u('Racha de aciertos', 'Streak')}: ${racha}">🔥 ${racha}</span>
      ${usarVidas ? `<span class="vidas" role="img" aria-label="${u('Energía', 'Energy')}: ${vidas()} / ${MAX_VIDAS}">${Array.from({ length: MAX_VIDAS }, (_, i) => `<i class="tortilla mini ${i < vidas() ? '' : 'vacia'}"></i>`).join('')}</span>` : ''}
    </div>`;

    // Al dejar un ejercicio de voz se apaga el micrófono y se borra la grabación (nada queda guardado).
    const soltarVoz = (it) => { if (!it || it.tipo !== 'di') return; if (it.preparando) { it.preparando.cancelado = true; it.preparando = null; } try { it.oido?.parar(); it.grab?.parar(); } catch { /* ya cerró */ } clearTimeout(it.borrado); soltar(it.url); it.url = null; it.oyendo = false; };
    const cierre = (extra) => { soltarVoz(actual); raiz.removeEventListener('click', delegado); resolver({ aciertos, errores, mejorRacha, ...extra }); };

    function siguiente() {
      bloqueado = false;
      if (usarVidas && sinEnergia()) return cierre({ sinVidas: true });
      soltarVoz(actual);
      if (!cola.length) return cierre({ completo: true });
      actual = cola.shift(); pintar();
    }

    function pintar() {
      const it = actual; let cuerpo = '';
      if (it.tipo === 'mcq') {
        cuerpo = `<p class="pregunta">${esc(it.prompt)}${it.frase ? `<br><span lang="${it.langFrase || tgt()}">${esc(it.frase)}</span>` : ''}${it.ayuda ? `<small>${esc(it.ayuda)}</small>` : ''}</p>
          ${it.voz ? `<button class="btn-icono" data-voz aria-label="${u('Escuchar', 'Listen')}">🔊</button>` : ''}
          <div class="opciones" role="group" aria-label="${u('Opciones', 'Options')}">${it.opciones.map((o) => `<button class="opcion" data-op="${esc(o)}" aria-pressed="false">${esc(o)}</button>`).join('')}</div>`;
      } else if (it.tipo === 'orden') {
        it.tokens = mezclar((it.letras ? [...it.respuesta] : it.respuesta.split(/\s+/)).map((t, i) => ({ t, i }))); it.armado = [];
        cuerpo = `<p class="pregunta">${esc(it.prompt)}<small>${esc(it.ayuda)}</small></p>
          ${it.oir && it.voz ? `<button class="btn-icono" data-voz aria-label="${u('Escuchar', 'Listen')}">🔊</button>` : ''}
          <div class="armado ${it.letras ? 'letras' : ''}" data-armado aria-live="polite" aria-label="${it.letras ? u('Tu palabra', 'Your word') : u('Tu frase', 'Your sentence')}"></div>
          <div class="fichas ${it.letras ? 'letras' : ''}" data-fichas>${it.tokens.map((k) => `<button class="ficha" data-ficha="${k.i}">${esc(k.t)}</button>`).join('')}</div>`;
      } else if (it.tipo === 'pares') {
        it.izq = mezclar(it.pares.map((p) => p[0])); it.der = mezclar(it.pares.map((p) => p[1])); it.sel = null; it.hechosPares = 0; it.fallo = false;
        cuerpo = `<p class="pregunta">${esc(it.prompt)}</p><div class="pares" data-pares>
          ${it.izq.map((a, i) => `<button class="par" data-lado="i" data-v="${esc(a)}" lang="${tgt()}">${esc(a)}</button>${`<button class="par" data-lado="d" data-v="${esc(it.der[i])}">${esc(it.der[i])}</button>`}`).join('')}</div>`;
      }
      else if (it.tipo === 'di') {
        // Privacidad: el reconocimiento de voz del teléfono solo se usa si la persona dijo que sí (se le pregunta una vez).
        const elegido = estado().ajustes.oido;
        it.intentos = 0; it.silencios = 0; it.modo = puedeReconocer() && !elegido ? 'pregunta' : puedeReconocer() && elegido === 'reco' ? 'reco' : puedeGrabar() ? 'graba' : 'solo';
        // cada palabra va en su etiqueta para pintarla de verde en cuanto se reconoce
        it.fichas = it.frase.split(/\s+/).map((w) => ({ w, n: limpiarTxt(w).split(' ').filter(Boolean).length }));
        cuerpo = `<p class="pregunta">${esc(it.prompt)}<br><span class="decir" lang="${T}">${it.fichas.map((f) => `<span class="pal">${esc(f.w)}</span>`).join(' ')}</span><small>${esc(it.ayuda)}</small></p>
          <button class="btn-icono" data-voz aria-label="${u('Escuchar cómo se dice', 'Hear how it sounds')}">🔊</button>
          <div class="hablar"><button class="btn-micro" data-micro aria-pressed="false" aria-label="${u('Toca y habla', 'Tap and speak')}">🎤</button>
            <p class="oido" data-oido role="status"></p><div class="fila" data-extra></div>
            <p class="muted chico" data-privado></p>
            <button class="btn-liga" data-nohablo>${u('Ahora no puedo hablar', 'I can\'t speak right now')}</button></div>`;
      }
      const sinBoton = it.tipo === 'pares' || it.tipo === 'di';
      raiz.innerHTML = `<div class="sesion">${cab()}${cuerpo}<div class="retro-espacio"></div></div>${sinBoton ? '' : `<div class="retro sola" data-pie><button class="btn bloque" data-comprobar disabled>${u('Comprobar', 'Check')}</button></div>`}`;
      raiz.querySelector('[data-comprobar]')?.focus?.();
      if (it.tipo === 'di') { estadoDi(it); mejorarOido(it); }
      if (it.oir || it.tipo === 'di') hablar(it.voz, T);            // se oye solo al aparecer
    }

    /* ---------- «dilo en voz alta» ---------- */
    // Si está descargado el «Oído de Granma», el modo local reconoce las palabras dentro del teléfono.
    function mejorarOido(it) {
      if (it.modo !== 'graba') return;
      oidoPropioListo(T).then((si) => { if (!si && actual === it && it.modo === 'graba') { it.sinOido = true; if (!it.oyendo && !it.url) estadoDi(it, raiz.querySelector('[data-oido]')?.textContent); }   // conserva el mensaje que ya se estaba mostrando
        if (si && actual === it && it.modo === 'graba' && !it.oyendo) { it.modo = 'propio'; estadoDi(it); prepararOido(T).catch(() => {}); } });
    }
    // Pinta de verde las palabras ya reconocidas (y suena un «tic» por cada palabra nueva).
    function pintarPalabras(it, palabras) {
      const els = raiz.querySelectorAll('.decir .pal'); let k = 0, nuevas = 0;
      it.fichas.forEach((f, i) => {
        const mias = palabras.slice(k, k + f.n); k += f.n; if (!f.n || !els[i] || mias.length !== f.n) return;
        const clara = mias.every((x) => x.estado === 'clara' || (x.ok && !x.estado)), casi = !clara && mias.every((x) => x.ok);
        if (clara && !els[i].classList.contains('ok')) { els[i].classList.remove('casi'); els[i].classList.add('ok'); nuevas++; }
        else if (casi && !els[i].classList.contains('ok')) els[i].classList.add('casi');
      });
      if (nuevas) sonido.tic();
    }
    function borrarLuego(it) {
      clearTimeout(it.borrado);
      if (it.url) it.borrado = setTimeout(() => { soltar(it.url); it.url = null; if (actual === it && !bloqueado) estadoDi(it, u('Tu grabación ya se borró. Puedes grabarte otra vez.', 'Your recording was deleted. You can record again.')); }, BORRADO_MS);
    }
    function estadoDi(it, texto) {
      const o = raiz.querySelector('[data-oido]'), m = raiz.querySelector('[data-micro]'), x = raiz.querySelector('[data-extra]'); if (!o || !m) return;
      m.classList.toggle('oyendo', !!it.oyendo); m.setAttribute('aria-pressed', String(!!it.oyendo));
      const base = it.modo === 'propio' ? u('Toca el micrófono y dilo. Te oigo aquí mismo, palabra por palabra.', 'Tap the microphone and say it. I hear you right here, word by word.') : it.modo === 'reco' ? u('Toca el micrófono y dilo.', 'Tap the microphone and say it.') : it.modo === 'graba' ? u('Toca el micrófono y dilo. Yo mido tu voz aquí mismo.', 'Tap the microphone and say it. I measure your voice right here.') : u('Dilo fuerte y claro, como te salga.', 'Say it loud and clear, as best you can.');
      o.textContent = it.oyendo ? (it.modo === 'reco' || it.modo === 'propio' ? u('Te escucho…', 'Listening…') : u('Te escucho… al terminar me detengo sola.', 'Listening… I stop by myself when you finish.')) : (texto || base);
      m.hidden = it.modo === 'solo' || it.modo === 'pregunta';
      const priv = raiz.querySelector('[data-privado]');
      if (priv) priv.textContent = it.modo === 'propio' ? u('Tu voz se reconoce dentro de tu teléfono, sin internet, y se borra sola en 1 minuto.', 'Your voice is recognized inside your phone, offline, and deletes itself in 1 minute.')
        : it.modo === 'graba' && it.sinOido ? u('Tu voz se mide solo en tu teléfono. En Descargas puedes bajar el «Oído de Granma» para que reconozca tus palabras.', 'Your voice is measured only on your phone. In Downloads you can get "Granma\'s ear" so it recognizes your words.')
        : it.modo === 'reco' ? u('Te escucha el servicio de voz de tu teléfono. La app no guarda nada.', 'Your phone\'s speech service listens. The app saves nothing.')
        : it.modo === 'graba' ? u('Tu voz se mide y se graba solo en tu teléfono, y se borra sola en 1 minuto.', 'Your voice is measured and recorded only on your phone, and deletes itself in 1 minute.')
        : it.modo === 'solo' ? u('Aquí no se usa el micrófono.', 'The microphone is not used here.') : '';
      if (it.modo === 'pregunta') {
        o.textContent = u('¿Cómo quieres practicar tu voz?', 'How do you want to practice speaking?');
        x.innerHTML = `<button class="opcion" data-oido-modo="reco"><strong>🎧 ${u('Que mi teléfono me escuche', 'Let my phone listen')}</strong><br><small>${u('Te dice si lo dijiste bien. Usa el servicio de voz de tu teléfono (Apple o Google), que procesa tu voz fuera del teléfono.', 'It tells you if you said it right. It uses your phone\'s speech service (Apple or Google), which processes your voice outside the phone.')}</small></button>
          <button class="opcion" data-oido-modo="local"><strong>🔒 ${u('Que me escuche Granma, aquí en mi teléfono', 'Let Granma listen, here on my phone')}</strong><br><small>${u('Funciona sin internet. Revisa que hables y digas la frase completa, y te deja oírte. Nada sale de tu teléfono; se borra sola en 1 minuto.', 'Works offline. It checks that you speak and say the whole sentence, and lets you hear yourself. Nothing leaves your phone; it deletes itself in 1 minute.')}</small></button>
          <p class="muted chico">${u('Puedes cambiarlo cuando quieras en Mi perfil.', 'You can change it any time in My profile.')}</p>`;
        return;
      }
      x.innerHTML = it.modo === 'solo' ? `<button class="btn verde" data-yadije>✓ ${u('Ya lo dije en voz alta', 'I said it out loud')}</button>`
        : it.url ? `<button class="btn sec" data-mivoz>▶ ${u('Mi voz', 'My voice')}</button>${it.completa !== false || it.intentos >= 2 ? `<button class="btn verde" data-yadije>✓ ${u('Ya me salió', 'I got it')}</button>` : ''}`
        : it.intentos >= 2 ? `<button class="btn sec" data-yadije>${u('Seguir adelante', 'Move on')}</button>` : '';
    }
    async function micro(it) {
      // Mientras prepara, otro toque cancela (antes abría un segundo micrófono encima del primero y se trababa).
      if (it.preparando) { it.preparando.cancelado = true; it.preparando = null; return estadoDi(it); }
      if (it.oyendo) { it.oido?.parar(); it.grab?.parar(); return; }
      callarVoz();
      if (it.modo === 'reco') {
        it.oyendo = true; estadoDi(it);
        it.oido = escuchar(T); const r = await it.oido; it.oyendo = false;
        if (actual !== it || bloqueado) return;
        if (r.ok) {
          const mejor = r.textos.reduce((m, t) => (parecido(t, it.frase) > parecido(m, it.frase) ? t : m), r.textos[0]);
          if (parecido(mejor, it.frase) >= UMBRAL) { it.verificado = true; it.completita = parecido(mejor, it.frase) === 1; raiz.querySelectorAll('.decir .pal').forEach((x) => x.classList.add('ok')); return responder(true); }
          it.intentos++; return estadoDi(it, `${u('Escuché', 'I heard')}: «${mejor}». ${u('Otra vez, despacito.', 'Once more, slowly.')}`);
        }
        if (r.motivo === 'silencio' && ++it.silencios < 2) return estadoDi(it, u('No te alcancé a oír. Acércate tantito y otra vez.', 'I could not hear you. Come a little closer and try again.'));
        // sin permiso, sin internet o sin servicio: la persona se graba y se escucha ella misma
        it.modo = puedeGrabar() ? 'graba' : 'solo'; mejorarOido(it);
        return estadoDi(it, r.motivo === 'red' ? u('Sin internet no puedo oírte, pero puedes grabarte y escucharte.', 'Without internet I cannot hear you, but you can record and hear yourself.') : '');
      }
      if (it.modo === 'propio') {
        soltar(it.url); it.url = null; clearTimeout(it.borrado);
        const boton = raiz.querySelector('[data-micro]'), mover = !reducirMovimiento(), senal = { cancelado: false };
        audioDelToque();                                    // sin await: el audio se abre dentro del toque
        it.preparando = senal; estadoDi(it, u('Preparando el oído…', 'Getting the ear ready…'));
        const e = await escucharPropio(T, it.frase, { senal,
          alNivel: (v) => { if (mover && boton?.isConnected) boton.style.transform = `scale(${(1 + Math.min(0.28, v * 2.2)).toFixed(3)})`; },
          alParcial: (r) => { if (actual === it && !bloqueado) pintarPalabras(it, r.palabras); },
        });
        if (it.preparando === senal) it.preparando = null;
        if (actual !== it || senal.cancelado) return void e.parar?.();
        if (!e.ok && e.motivo === 'audio') return estadoDi(it, u('No se abrió el micrófono. Tócalo otra vez.', 'The microphone did not open. Tap it again.'));
        if (!e.ok) { it.modo = e.motivo === 'permiso' ? 'solo' : 'graba'; return estadoDi(it, e.motivo === 'permiso' ? '' : u('No pude abrir el oído ahora; mido tu voz de la otra forma.', 'I could not open the ear now; I will measure your voice the other way.')); }
        it.grab = e; it.oyendo = true; estadoDi(it);
        const r = await e.fin; it.oyendo = false; if (boton) boton.style.transform = '';
        if (actual !== it || bloqueado) return soltar(r.url);
        it.url = r.url; borrarLuego(it); pintarPalabras(it, r.palabras);
        const casi = r.palabras.find((x) => x.sono);          // la pista de pronunciación: qué palabra pareció decir
        it.pista = casi ? u(`«${casi.w}» sonó como «${casi.sono}». Escucha 🔊 y fíjate en ese sonido.`, `«${casi.w}» sounded like «${casi.sono}». Listen to 🔊 and notice that sound.`) : '';
        if (r.pasa) { it.verificado = true; it.completita = r.claras === r.total; it.estrellasVoz = r.estrellas; return responder(true); }
        it.intentos++;
        if (r.dichas && it.pista) return estadoDi(it, it.pista);
        return estadoDi(it, !r.oyoAlgo ? u('No alcancé a oír tu voz. Acércate tantito y dilo más fuerte.', 'I could not hear your voice. Come a bit closer and say it louder.')
          : r.dichas ? u(`Te oí ${r.dichas} de ${r.total} palabras: las verdes ya salieron. Dila otra vez, completa.`, `I heard ${r.dichas} of ${r.total} words: the green ones are done. Say it again, all of it.`)
          : u('Oí tu voz, pero no las palabras de la frase. Escucha 🔊 y repite despacito.', 'I heard your voice, but not the words of the sentence. Listen to 🔊 and repeat slowly.'));
      }
      if (it.modo === 'graba') {
        soltar(it.url); it.url = null;
        const boton = raiz.querySelector('[data-micro]'), mover = !reducirMovimiento();
        const g = await grabar({ alNivel: (v) => { if (mover && boton?.isConnected) boton.style.transform = `scale(${(1 + Math.min(0.28, v * 2.2)).toFixed(3)})`; } });
        if (actual !== it) return void g.parar?.();
        if (!g.ok) { it.modo = 'solo'; return estadoDi(it); }
        it.grab = g; it.oyendo = true; estadoDi(it);
        const { url, niveles } = await g.fin; it.oyendo = false; if (boton) boton.style.transform = '';
        if (actual !== it) return soltar(url);
        // Verificador propio: ¿habló?, ¿dijo la frase completa? (no juzga la pronunciación: esa se compara oyéndose)
        const v = analizarVoz(niveles, silabas(it.frase, T)); it.url = url; it.intentos++;
        const medido = niveles.length > 8;
        estadoDi(it, !url ? '' : !medido ? u('¡Listo! Escúchate y compárate con 🔊.', 'Done! Hear yourself and compare with 🔊.')
          : v.veredicto === 'completa' ? u('✔ Se oyó completa. Escúchate y compárate con 🔊.', '✔ It sounded complete. Hear yourself and compare with 🔊.')
          : v.veredicto === 'corta' ? u('Se oyó cortita: parece que faltó un pedazo. Dila completa, sin prisa.', 'It sounded short: a piece seems to be missing. Say it all, no rush.')
          : u('No alcancé a oír tu voz. Acércate tantito y dilo más fuerte.', 'I could not hear your voice. Come a bit closer and say it louder.'));
        it.completa = medido && v.veredicto === 'completa';
        estadoDi(it, raiz.querySelector('[data-oido]')?.textContent);
        borrarLuego(it);
      }
    }

    function responder(ok, correcta) {
      if (bloqueado) return; bloqueado = true;
      const it = actual;
      let msg;
      if (ok) {
        aciertos++; hechos++; racha++; mejorRacha = Math.max(mejorRacha, racha); vibrar(25);
        if (it.tipo === 'di' && it.verificado) {            // la app SÍ oyó las palabras: grito, confeti tricolor y Granma lo celebra
          sonido.viva(); confetiMexicano(); if (estado().ajustes.voz) hablar('¡Viva México!', 'es', 'granma');
          const est = it.estrellasVoz ? ` ${'⭐'.repeat(it.estrellasVoz)}` : '', pista = it.pista ? ` ${it.pista}` : '';
          msg = ['granma', 'aplaudiendo', (it.completita ? '¡Viva México! Lo dijiste clarito, mijo.' : '¡Viva México! Ya casi te sale todo, mija.') + est + (it.completita ? '' : pista), (it.completita ? 'Viva México! You said it clearly, mijo.' : 'Viva México! You almost have it all, mija.') + est + (it.completita ? '' : pista)];
        } else { if (racha >= 3) sonido.racha(racha); else sonido.ok(); msg = al(OK); }
      } else {
        errores++; racha = 0; sonido.mal(); vibrar([40, 40, 40]);
        if (usarVidas && it.tipo !== 'pares') { perderVida(); perdioTortilla(); }
        if (!it.reintento) { cola.push({ ...it, reintento: true }); } else hechos++;
        msg = al(MAL);
      }
      const [quien, variante, es, en] = msg;
      const pie = raiz.querySelector('[data-pie]') || (() => { const d = document.createElement('div'); d.dataset.pie = ''; raiz.append(d); return d; })();
      pie.className = 'retro ' + (ok ? 'ok' : 'mal');
      pie.innerHTML = `${pj(quien, variante)}<div class="msg" role="alert">${u(es, en)}${ok && racha >= 3 ? ` <span class="racha-msg">🔥 ${racha} ${u('seguidas', 'in a row')}</span>` : ''}${!ok && correcta ? `<br><small>${u('Respuesta', 'Answer')}: <strong>${esc(correcta)}</strong></small>` : ''}</div><button class="btn ${ok ? 'verde' : ''}" data-seguir>${u('Continuar', 'Continue')}</button>`;
      pie.querySelector('[data-seguir]').focus();
      if (ok) reaccion(pie.querySelector('.pj'), quien === 'granma' ? 'aplauso' : 'asiente');
      const barra = raiz.querySelector('.barra>i'); if (barra) barra.style.transform = `scaleX(${hechos / total})`;
      const combo = raiz.querySelector('[data-combo]');
      if (combo) { combo.hidden = racha < 3; combo.textContent = `🔥 ${racha}`; if (racha >= 3) { combo.classList.remove('pop'); void combo.offsetWidth; combo.classList.add('pop'); } }
    }

    // La tortillita que acaba de perderse (la de índice = vidas actuales) se desinfla y cae
    function perdioTortilla() { const el = raiz.querySelectorAll('.vidas .tortilla')[vidas()]; if (el && !el.classList.contains('vacia')) tortillaPierde(el); }

    function delegado(ev) {
      const b = ev.target.closest('button'); if (!b || !raiz.contains(b)) return;
      if (b.hasAttribute('data-salir')) { if (confirm(u('¿Salir? Perderás el avance de esta lección.', 'Exit? You will lose this lesson\'s progress.'))) cierre({ salio: true }); return; }
      if (b.hasAttribute('data-seguir')) return siguiente();
      if (!actual || bloqueado) return;
      if (b.hasAttribute('data-voz')) return void hablar(actual.voz, tgt());
      const it = actual, boton = raiz.querySelector('[data-comprobar]');
      if (it.tipo === 'di') {
        if (b.dataset.oidoModo) {                       // respuesta a «¿cómo quieres practicar tu voz?»
          estado().ajustes.oido = b.dataset.oidoModo; guardar();
          it.modo = b.dataset.oidoModo === 'reco' ? 'reco' : puedeGrabar() ? 'graba' : 'solo'; estadoDi(it); return mejorarOido(it);
        }
        if (b.hasAttribute('data-micro')) return void micro(it);
        if (b.hasAttribute('data-mivoz')) { if (it.url) new Audio(it.url).play().catch(() => {}); return; }
        if (b.hasAttribute('data-yadije')) return responder(true);
        if (b.hasAttribute('data-nohablo')) {       // sin castigo: se quitan los de voz y la lección sigue
          pausarHablar(); const quedan = cola.filter((x) => x.tipo !== 'di'); total -= 1 + (cola.length - quedan.length); cola.length = 0; cola.push(...quedan);
          return siguiente();
        }
        return;
      }
      if (it.tipo === 'mcq') {
        if (b.hasAttribute('data-op')) { raiz.querySelectorAll('.opcion').forEach((o) => { o.classList.remove('sel'); o.setAttribute('aria-pressed', 'false'); }); b.classList.add('sel'); b.setAttribute('aria-pressed', 'true'); boton.disabled = false; }
        else if (b.hasAttribute('data-comprobar')) {
          const sel = raiz.querySelector('.opcion.sel'), ok = sel.dataset.op === it.correcta;
          raiz.querySelectorAll('.opcion').forEach((o) => { o.disabled = true; if (o.dataset.op === it.correcta) o.classList.add('ok'); });
          if (!ok) sel.classList.add('mal');
          raiz.querySelector('[data-comprobar]')?.remove(); responder(ok, it.correcta);
        }
      } else if (it.tipo === 'orden') {
        const zona = raiz.querySelector('[data-armado]');
        if (b.hasAttribute('data-ficha')) { const k = it.tokens.find((t) => String(t.i) === b.dataset.ficha); it.armado.push(k); b.classList.add('usada'); b.tabIndex = -1; }
        else if (b.hasAttribute('data-quitar')) { const i = +b.dataset.quitar; const [k] = it.armado.splice(i, 1); raiz.querySelector(`[data-ficha="${k.i}"]`).classList.remove('usada'); raiz.querySelector(`[data-ficha="${k.i}"]`).tabIndex = 0; }
        else if (b.hasAttribute('data-comprobar')) {
          const ok = it.armado.map((k) => k.t).join(it.letras ? '' : ' ') === it.respuesta;
          raiz.querySelector('[data-comprobar]')?.remove(); responder(ok, it.respuesta); return;
        }
        zona.innerHTML = it.armado.map((k, i) => `<button class="ficha" data-quitar="${i}" aria-label="${u('Quitar', 'Remove')} ${esc(k.t)}">${esc(k.t)}</button>`).join('');
        boton.disabled = it.armado.length !== it.tokens.length;
      } else if (it.tipo === 'pares' && b.dataset.lado) {
        if (b.classList.contains('hecho')) return;
        // Al tocar la palabra del idioma que se aprende, se oye (inglés para quien aprende inglés; español para quien aprende español).
        if (b.dataset.lado === 'i' && it.sel !== b && estado().ajustes.voz) hablar(b.dataset.v, T);
        if (!it.sel) { it.sel = b; b.classList.add('sel'); return; }
        if (it.sel === b) { b.classList.remove('sel'); it.sel = null; return; }
        if (it.sel.dataset.lado === b.dataset.lado) { it.sel.classList.remove('sel'); it.sel = b; b.classList.add('sel'); return; }
        const i = it.sel.dataset.lado === 'i' ? it.sel : b, d = it.sel.dataset.lado === 'i' ? b : it.sel;
        const par = it.pares.find((p) => p[0] === i.dataset.v);
        if (par && par[1] === d.dataset.v) {
          i.classList.remove('sel'); d.classList.remove('sel'); i.classList.add('hecho'); d.classList.add('hecho'); i.disabled = d.disabled = true; it.sel = null; sonido.tic();
          if (++it.hechosPares === it.pares.length) responder(!it.fallo);
        } else {
          it.fallo = true; const a = it.sel; a.classList.add('mal'); b.classList.add('mal'); it.sel = null; sonido.mal(); vibrar(40);
          if (usarVidas && !it.vidaPerdida) { it.vidaPerdida = true; perderVida(); perdioTortilla(); }
          setTimeout(() => { a.classList.remove('mal', 'sel'); b.classList.remove('mal'); }, 450);
        }
      }
    }
    raiz.addEventListener('click', delegado);
    siguiente();
  });
}
