// Botón del perezoso («escuchar despacio»): junto a cada bocina 🔊 de la app aparece otra que dice lo mismo, pero lento.
// Se pone solo (no hay que tocar cada pantalla): el perezoso avisa a la voz que va despacio y aprieta la bocina de al lado.
// El perezoso es un dibujo propio (SVG), no un emoji: así se ve igual en todos los teléfonos, también en los viejitos.
import { u } from './state.js';
import { pedirLenta } from './voz.js';

export const PEREZOSO = '<svg class="perezoso" viewBox="0 0 32 32" width="30" height="30" aria-hidden="true"><path d="M13.2 6.6c.4-1.6 1.2-2.6 2.2-3.2M16 6.3c0-1.5.3-2.6.9-3.5M18.7 6.6c.2-1.2.9-2.2 1.9-2.8" fill="none" stroke="#5E4026" stroke-width="1.4" stroke-linecap="round"/><ellipse cx="16" cy="17.5" rx="12.5" ry="11.5" fill="#A98761" stroke="#5E4026" stroke-width="1.4"/><path d="M16 9.5c5.5 0 9.5 3.3 9.5 8.3 0 5-4 8.2-9.5 8.2s-9.5-3.2-9.5-8.2c0-5 4-8.3 9.5-8.3z" fill="#F3E3C8"/><path d="M6.8 19.5c.8-3.6 3.4-5.6 6.5-5.3 1 .1 1.3 1.2.7 2.2-1.2 2-3.3 3.5-6 4.2-.8.2-1.4-.3-1.2-1.1zM25.2 19.5c-.8-3.6-3.4-5.6-6.5-5.3-1 .1-1.3 1.2-.7 2.2 1.2 2 3.3 3.5 6 4.2.8.2 1.4-.3 1.2-1.1z" fill="#5E4026"/><circle cx="11.7" cy="17.1" r="1.1" fill="#fff"/><circle cx="20.3" cy="17.1" r="1.1" fill="#fff"/><ellipse cx="16" cy="19.6" rx="2.1" ry="1.5" fill="#3F2A18"/><path d="M12.6 22.3c1.8 1.9 5 1.9 6.8 0" fill="none" stroke="#3F2A18" stroke-width="1.3" stroke-linecap="round"/></svg>';

const esBocina = (b) => !b.dataset.lento && !b.dataset.conLento && b.textContent.trim() === '🔊';

export function ponerLentos(raiz) {
  for (const b of raiz.querySelectorAll('button.btn-icono')) {
    if (!esBocina(b)) continue;
    b.dataset.conLento = '1';
    const caja = document.createElement('span'); caja.className = 'voces';
    const l = document.createElement('button'); l.type = 'button'; l.className = 'btn-icono lento'; l.dataset.lento = '1'; l.innerHTML = `<span class="lento-txt">${u('modo perezoso', 'sloth mode')}</span>${PEREZOSO}`;
    l.setAttribute('aria-label', u('Escuchar despacio', 'Listen slowly')); l.title = u('Despacio', 'Slowly');
    b.replaceWith(caja); caja.append(b, l);
  }
}

export function iniciarLento(raiz = document.body) {
  new MutationObserver(() => ponerLentos(raiz)).observe(raiz, { childList: true, subtree: true });
  ponerLentos(raiz);
  // En captura: el toque del perezoso no llega a la pantalla; en su lugar se «toca» la bocina normal, ya en modo lento.
  document.addEventListener('click', (e) => {
    const l = e.target.closest?.('[data-lento]'); if (!l) return;
    e.preventDefault(); e.stopPropagation();
    const bocina = l.previousElementSibling; if (!bocina) return;
    pedirLenta(); bocina.click();
  }, true);
}
