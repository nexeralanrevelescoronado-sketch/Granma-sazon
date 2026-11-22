// Reto rápido de 60 segundos y repaso de palabras (devuelve una tortillita).
import { estado, guardar, u, tgt, nat, ganarXP, evento, darVida, vidas } from '../state.js';
import { historia } from '../datos.js';
import { pj } from '../personajes.js';
import { esc, mezclar, mmss, al } from '../util.js';
import { sonido } from '../sound.js';
import { confeti, vibrar, hablar } from '../fx.js';

const todasLasPalabras = (h) => h.capitulos.flatMap((c) => c.palabras);

export async function montar(main, { ruta }) {
  const h = await historia(), pool = todasLasPalabras(h), S = estado();
  return ruta === 'repaso' ? repaso(main, pool, S) : reto(main, pool, S);
}

function reto(main, pool, S) {
  const T = tgt(), N = nat(); let timer = null, activo = true;
  const portada = () => {
    main.innerHTML = `<div class="centro">${pj('granma', 'animo', { ancho: 150, clase: 'anim-brinca' })}</div><h1 class="centro">${u('Reto de 60 segundos', '60-second challenge')}</h1>
      <p class="centro">${u('Responde cuantas puedas. Cada acierto vale 2 XP. ¡Aquí no se gastan tortillitas!', 'Answer as many as you can. Each correct answer is worth 2 XP. No tortillas are used here!')}</p>
      <p class="centro muted">${u('Tu mejor marca', 'Your best score')}: <strong>${S.stats.retoMejor}</strong></p><button class="btn grande olla" data-ir>${u('¡Empezar!', 'Start!')}</button>`;
  };
  function jugar() {
    let aciertos = 0, fallos = 0, ocupado = false; const fin = Date.now() + 60000;
    const nueva = () => {
      const p = al(pool), invertir = Math.random() < 0.5, q = invertir ? p[N] : p[T], ok = invertir ? p[T] : p[N], campo = invertir ? T : N;
      const ops = mezclar([ok, ...mezclar(pool.filter((x) => x[campo] !== ok)).slice(0, 3).map((x) => x[campo])]);
      main.querySelector('#reto-q').innerHTML = `<p class="pregunta" lang="${invertir ? N : T}">${esc(q)}<small>${invertir ? u('¿Cómo se dice en el idioma que aprendes?', 'How do you say it in the language you are learning?') : u('¿Qué significa?', 'What does it mean?')}</small></p>
        <div class="opciones">${ops.map((o) => `<button class="opcion" data-o="${esc(o)}">${esc(o)}</button>`).join('')}</div>`;
      main.querySelector('#reto-q').dataset.ok = ok; ocupado = false;
    };
    main.innerHTML = `<div class="sesion"><div class="fila" style="justify-content:space-between"><span class="reto-tiempo" id="reto-t" role="timer" aria-label="${u('Tiempo', 'Time')}">01:00</span><span class="estrella" aria-live="polite">✔ <span id="reto-a">0</span></span></div><div class="barra olla"><i id="reto-b" style="transform:scaleX(1)"></i></div><div id="reto-q"></div></div>`;
    nueva();
    main.onclick = (e) => {
      const b = e.target.closest('[data-o]'); if (!b || ocupado) return; ocupado = true;
      const ok = main.querySelector('#reto-q').dataset.ok === b.dataset.o;
      b.classList.add(ok ? 'ok' : 'mal'); ok ? (aciertos++, sonido.ok()) : (fallos++, sonido.mal(), vibrar(30));
      main.querySelector('#reto-a').textContent = aciertos;
      if (!ok) main.querySelectorAll('.opcion').forEach((o) => { if (o.dataset.o === main.querySelector('#reto-q').dataset.ok) o.classList.add('ok'); });
      setTimeout(() => activo && Date.now() < fin && nueva(), ok ? 250 : 650);
    };
    timer = setInterval(() => {
      const resto = (fin - Date.now()) / 1000; const t = main.querySelector('#reto-t'), b = main.querySelector('#reto-b');
      if (t) t.textContent = mmss(resto); if (b) b.style.transform = `scaleX(${Math.max(0, resto / 60)})`;
      if (resto <= 0) { clearInterval(timer); terminar(aciertos, fallos); }
    }, 250);
  }
  function terminar(aciertos, fallos) {
    if (!activo) return; main.onclick = null; sonido.logro();
    const nuevo = aciertos > S.stats.retoMejor; S.stats.retoMejor = Math.max(S.stats.retoMejor, aciertos); S.stats.retos++; guardar();
    ganarXP(aciertos * 2); evento('retos'); evento('palabras', aciertos); if (aciertos >= 8) confeti(120);
    main.innerHTML = `<div class="centro">${pj(aciertos >= 8 ? 'granma' : 'abuelo', aciertos >= 8 ? 'aplaudiendo' : 'contento', { ancho: 150, clase: 'anim-aplaude' })}<h1>${u('¡Se acabó el tiempo!', 'Time is up!')}</h1>
      <p style="font-size:1.4rem"><strong>${aciertos}</strong> ${u('aciertos', 'correct')} · ${fallos} ${u('fallos', 'misses')}</p><p class="estrella">+${aciertos * 2} XP ${nuevo ? '· 🏅 ' + u('¡nueva mejor marca!', 'new best!') : ''}</p>
      <p>${aciertos >= 8 ? u('¡Ándale, mijo, qué rápido!', 'Wow, mijo, so fast!') : u('Quien persevera, alcanza.', 'Whoever perseveres, achieves.')}</p></div>
      <button class="btn grande olla" data-otra>${u('Otro reto', 'Another challenge')}</button><p class="mt centro"><a href="#/">${u('Ir al inicio', 'Go home')}</a></p>`;
    main.onclick = (e) => { if (e.target.closest('[data-otra]')) jugar(); };
  }
  portada();
  main.onclick = (e) => { if (e.target.closest('[data-ir]')) jugar(); };
  return () => { activo = false; clearInterval(timer); main.onclick = null; };
}

function repaso(main, pool, S) {
  const T = tgt(), N = nat(), cartas = mezclar(pool).slice(0, 8); let i = 0, visto = false;
  const pintar = () => {
    if (i >= cartas.length) {
      darVida(1); sonido.logro();
      main.innerHTML = `<div class="vacio">${pj('granma', 'aplaudiendo', { ancho: 150, clase: 'anim-aplaude' })}<h1>${u('¡Repaso listo!', 'Review done!')}</h1><p>${u('Te regalo una tortillita.', 'Here is a tortilla for you.')} <span class="tortilla"></span> ${vidas()}</p><a class="btn olla" href="#/historia">${u('Volver a la historia', 'Back to the story')}</a></div>`; return;
    }
    const c = cartas[i];
    main.innerHTML = `<h1>${u('Repaso de palabras', 'Word review')}</h1><p class="muted">${i + 1} / ${cartas.length}</p>
      <div class="tarjeta centro" style="min-height:140px;display:grid;place-content:center;gap:6px"><strong style="font-size:1.8rem" lang="${T}">${esc(c[T])}</strong>${visto ? `<span style="font-size:1.3rem" lang="${N}">${esc(c[N])}</span>` : ''}</div>
      <div class="fila"><button class="btn-icono" data-voz aria-label="${u('Escuchar', 'Listen')}">🔊</button>${visto ? `<button class="btn grande" style="flex:1" data-sig>${u('Siguiente', 'Next')}</button>` : `<button class="btn grande sec" style="flex:1" data-ver>${u('Ver significado', 'Show meaning')}</button>`}</div>`;
  };
  main.onclick = (e) => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.hasAttribute('data-ver')) { visto = true; pintar(); } else if (b.hasAttribute('data-sig')) { i++; visto = false; pintar(); } else if (b.hasAttribute('data-voz')) hablar(cartas[i][T], T);
  };
  pintar();
  return () => { main.onclick = null; };
}
