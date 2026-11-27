// Páginas para leer el aviso de privacidad (#/privacidad) y los términos de uso (#/terminos) cuando se quiera.
import { estado, u, nat } from '../state.js';
import { avisoHTML, terminosHTML, VERSION_LEGAL } from '../legal.js';

export function montar(main, { ruta }) {
  const S = estado(), privacidad = ruta === 'privacidad', idioma = S.perfil.aprende ? nat() : 'es';
  const fecha = S.perfil.legalFecha ? new Date(S.perfil.legalFecha).toLocaleDateString(idioma === 'es' ? 'es-MX' : 'en-US', { day: 'numeric', month: 'long', year: 'numeric' }) : '';
  main.innerHTML = `<p><a class="volver" href="${S.perfil.listo ? '#/perfil' : '#/onboarding'}">← ${S.perfil.listo ? u('Mi perfil', 'My profile') : u('Regresar', 'Back')}</a></p>
    <h1>${privacidad ? u('Aviso de privacidad', 'Privacy notice') : u('Términos de uso', 'Terms of use')}</h1>
    <p class="muted">${u('Versión del', 'Version of')} ${VERSION_LEGAL}${fecha ? ` · ${u('Lo aceptaste el', 'You accepted it on')} ${fecha}` : ''}</p>
    <article class="tarjeta legal">${privacidad ? avisoHTML(idioma) : terminosHTML(idioma)}</article>
    <p class="centro"><a class="btn sec" href="#/${privacidad ? 'terminos' : 'privacidad'}">${privacidad ? u('Leer los términos de uso', 'Read the terms of use') : u('Leer el aviso de privacidad', 'Read the privacy notice')}</a></p>`;
}
