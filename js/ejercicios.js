// Motor de ejercicios: generación (según el interés) y reproductor compartido por lecciones, retos,
// consejos, cotorreos y la ruta de Biblia. Sin librerías.
import { esc, mezclar, al, sinAcentos } from './util.js';
import { u, tgt, nat, vidas, perderVida } from './state.js';
import { pj } from './personajes.js';
import { sonido } from './sound.js';
import { confeti, animar, vibrar, hablar } from './fx.js';
import { reaccion, tortillaPierde } from '../assets/animaciones/index.js';

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
  const p1 = aPalabra(ej[1]);
  items.push({ tipo: 'mcq', prompt: u(`¿Qué significa ${comillas(p1[T])}?`, `What does ${comillas(p1[T])} mean?`), voz: p1[T], opciones: mezclar([p1[N], ...otros(pal, p1[N], 3, N).map((p) => p[N])]), correcta: p1[N] });
  // 2) Completa la frase (ejemplo del interés)
  const p2 = aPalabra(ej[0]);
  items.push({ tipo: 'mcq', prompt: u('Completa la frase', 'Complete the sentence'), frase: hueco(ej[0]), ayuda: ej[0][N], opciones: mezclar([p2[T], ...otros(pal, p2[T], 3, T).map((p) => p[T])]), correcta: p2[T] });
  // 3) Ordena la frase
  items.push({ tipo: 'orden', prompt: u('Ordena la frase', 'Put the sentence in order'), ayuda: ej[1][N], respuesta: ej[1][T], voz: ej[1][T] });
  // 4) Emparejar
  const usadas = [...new Set(ej.map((e) => aPalabra(e)))];
  const extra = mezclar(pal.filter((p) => !usadas.includes(p)));
  items.push({ tipo: 'pares', prompt: u('Une cada palabra con su significado', 'Match each word with its meaning'), pares: [...usadas, ...extra].slice(0, 4).map((p) => [p[T], p[N]]) });
  // 5) Elige la traducción
  items.push({ tipo: 'mcq', prompt: u('Elige la traducción correcta', 'Choose the right translation'), frase: ej[2][T], voz: ej[2][T], opciones: mezclar(ej.map((e) => e[N])), correcta: ej[2][N] });
  return items;
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
    const cola = items.map((it, i) => ({ ...it, id: i, reintento: false }));
    const total = items.length;
    let hechos = 0, aciertos = 0, errores = 0, actual = null, bloqueado = false;

    const cab = () => `<div class="sesion-top">
      <button class="btn-icono" data-salir aria-label="${u('Salir', 'Exit')}">✕</button>
      <div class="barra" role="progressbar" aria-valuemin="0" aria-valuemax="${total}" aria-valuenow="${hechos}" aria-label="${u('Progreso', 'Progress')}"><i style="width:${(hechos / total) * 100}%"></i></div>
      ${usarVidas ? `<span class="vidas" role="img" aria-label="${u('Tortillitas', 'Tortillas')}: ${vidas()}">${Array.from({ length: 5 }, (_, i) => `<i class="tortilla ${i < vidas() ? '' : 'vacia'}"></i>`).join('')}</span>` : ''}
    </div>`;

    const cierre = (extra) => { raiz.removeEventListener('click', delegado); resolver({ aciertos, errores, ...extra }); };

    function siguiente() {
      bloqueado = false;
      if (usarVidas && vidas() === 0) return cierre({ sinVidas: true });
      if (!cola.length) return cierre({ completo: true });
      actual = cola.shift(); pintar();
    }

    function pintar() {
      const it = actual; let cuerpo = '';
      if (it.tipo === 'mcq') {
        cuerpo = `<p class="pregunta">${esc(it.prompt)}${it.frase ? `<br><span lang="${tgt()}">${esc(it.frase)}</span>` : ''}${it.ayuda ? `<small>${esc(it.ayuda)}</small>` : ''}</p>
          ${it.voz ? `<button class="btn-icono" data-voz aria-label="${u('Escuchar', 'Listen')}">🔊</button>` : ''}
          <div class="opciones" role="group" aria-label="${u('Opciones', 'Options')}">${it.opciones.map((o) => `<button class="opcion" data-op="${esc(o)}" aria-pressed="false">${esc(o)}</button>`).join('')}</div>`;
      } else if (it.tipo === 'orden') {
        it.tokens = mezclar(it.respuesta.split(/\s+/).map((t, i) => ({ t, i }))); it.armado = [];
        cuerpo = `<p class="pregunta">${esc(it.prompt)}<small>${esc(it.ayuda)}</small></p>
          <div class="armado" data-armado aria-live="polite" aria-label="${u('Tu frase', 'Your sentence')}"></div>
          <div class="fichas" data-fichas>${it.tokens.map((k) => `<button class="ficha" data-ficha="${k.i}">${esc(k.t)}</button>`).join('')}</div>`;
      } else if (it.tipo === 'pares') {
        it.izq = mezclar(it.pares.map((p) => p[0])); it.der = mezclar(it.pares.map((p) => p[1])); it.sel = null; it.hechosPares = 0; it.fallo = false;
        cuerpo = `<p class="pregunta">${esc(it.prompt)}</p><div class="pares" data-pares>
          ${it.izq.map((a, i) => `<button class="par" data-lado="i" data-v="${esc(a)}" lang="${tgt()}">${esc(a)}</button>${`<button class="par" data-lado="d" data-v="${esc(it.der[i])}">${esc(it.der[i])}</button>`}`).join('')}</div>`;
      }
      raiz.innerHTML = `<div class="sesion">${cab()}${cuerpo}<div class="retro-espacio"></div></div>${it.tipo === 'pares' ? '' : `<div class="retro sola" data-pie><button class="btn bloque" data-comprobar disabled>${u('Comprobar', 'Check')}</button></div>`}`;
      raiz.querySelector('[data-comprobar]')?.focus?.();
    }

    function responder(ok, correcta) {
      if (bloqueado) return; bloqueado = true;
      const it = actual;
      let msg;
      if (ok) {
        aciertos++; hechos++; sonido.ok(); vibrar(25);
        msg = al(OK);
      } else {
        errores++; sonido.mal(); vibrar([40, 40, 40]);
        if (usarVidas && it.tipo !== 'pares') { perderVida(); perdioTortilla(); }
        if (!it.reintento) { cola.push({ ...it, reintento: true }); } else hechos++;
        msg = al(MAL);
      }
      const [quien, variante, es, en] = msg;
      const pie = raiz.querySelector('[data-pie]') || (() => { const d = document.createElement('div'); d.dataset.pie = ''; raiz.append(d); return d; })();
      pie.className = 'retro ' + (ok ? 'ok' : 'mal');
      pie.innerHTML = `${pj(quien, variante)}<div class="msg" role="alert">${u(es, en)}${!ok && correcta ? `<br><small>${u('Respuesta', 'Answer')}: <strong>${esc(correcta)}</strong></small>` : ''}</div><button class="btn ${ok ? 'verde' : ''}" data-seguir>${u('Continuar', 'Continue')}</button>`;
      pie.querySelector('[data-seguir]').focus();
      if (ok) reaccion(pie.querySelector('.pj'), quien === 'granma' ? 'aplauso' : 'asiente');
      const barra = raiz.querySelector('.barra>i'); if (barra) barra.style.width = `${(hechos / total) * 100}%`;
    }

    // La tortillita que acaba de perderse (la de índice = vidas actuales) se desinfla y cae
    function perdioTortilla() { tortillaPierde(raiz.querySelectorAll('.vidas .tortilla')[vidas()]); }

    function delegado(ev) {
      const b = ev.target.closest('button'); if (!b || !raiz.contains(b)) return;
      if (b.hasAttribute('data-salir')) { if (confirm(u('¿Salir? Perderás el avance de esta lección.', 'Exit? You will lose this lesson\'s progress.'))) cierre({ salio: true }); return; }
      if (b.hasAttribute('data-seguir')) return siguiente();
      if (!actual || bloqueado) return;
      if (b.hasAttribute('data-voz')) return void hablar(actual.voz, tgt());
      const it = actual, boton = raiz.querySelector('[data-comprobar]');
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
          const ok = it.armado.map((k) => k.t).join(' ') === it.respuesta;
          raiz.querySelector('[data-comprobar]')?.remove(); responder(ok, it.respuesta); return;
        }
        zona.innerHTML = it.armado.map((k, i) => `<button class="ficha" data-quitar="${i}" aria-label="${u('Quitar', 'Remove')} ${esc(k.t)}">${esc(k.t)}</button>`).join('');
        boton.disabled = it.armado.length !== it.tokens.length;
      } else if (it.tipo === 'pares' && b.dataset.lado) {
        if (b.classList.contains('hecho')) return;
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
