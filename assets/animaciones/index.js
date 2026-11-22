// Punto de entrada de las animaciones (CSS en animaciones.css).
import { vigilarPersonajes, estadoPj, reaccion, hablando, listoPj } from './personajes.js';
import { confeti, MAX_CONFETI } from './confeti.js';
import { tortillaPierde } from './tortilla.js';
import { logoVapor } from './vapor.js';
import { pausarSiOculta, forzarOculta } from './visibilidad.js';
export { estadoPj, reaccion, hablando, listoPj, confeti, MAX_CONFETI, tortillaPierde, logoVapor, forzarOculta };
export function iniciarAnimaciones() { pausarSiOculta(); vigilarPersonajes(document.body); }
