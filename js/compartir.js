// Compartir por WhatsApp (enlace wa.me: no manda datos a ningún servidor propio).
import { u } from './state.js';
export const urlApp = () => location.href.split('#')[0];
export function enlaceWhatsApp(texto) { return `https://wa.me/?text=${encodeURIComponent(`${texto}\n\n— Granma Sazón · ${urlApp()}`)}`; }
export function botonWhatsApp(texto) {
  return `<a class="btn verde" href="${enlaceWhatsApp(texto)}" target="_blank" rel="noopener noreferrer" aria-label="${u('Compartir por WhatsApp', 'Share on WhatsApp')}"><svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15L2 22l5.2-1.4A10 10 0 1 0 12 2zm5.2 13.9c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.2-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.8s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .5l-.4.6c-.1.2-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.2 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.8-1c.2-.3.4-.2.6-.1l2 1c.3.1.5.2.6.3.1.2.1.8-.1 1.3z"/></svg>${u('Compartir', 'Share')}</a>`;
}
