// Palabras coloquiales de México que usan Granma y el Abuelo, explicadas con contexto en los dos idiomas:
// qué quieren decir, cuándo se usan y cuándo no. Sirve a quien aprende español y a quien habla español de otro país.
// Regla: solo palabras sanas y de uso común; nada de groserías ni de burlas a regiones.
import { u } from './state.js';
import { esc } from './util.js';

export const COLOQUIAL = {
  épale: {
    es: 'Es un grito alegre muy de México. Sirve para llamar la atención («¡épale, espérame!»), para avisar «¡cuidado!» o, como lo usa Granma, para celebrar: algo así como «¡eso!» o «¡bravo!». Es habla de confianza, entre familia y amigos; no se usa en un trámite ni en una carta.',
    en: 'A cheerful, very Mexican shout. People use it to get someone\'s attention ("Hey, wait for me!"), to warn ("Whoa, careful!") or, the way Granma uses it, to celebrate: something like "Way to go!". It is friendly, informal speech for family and friends, not for paperwork or a formal letter.',
  },
  ándale: {
    es: 'Anima o apura: «¡vamos!», «¡dale!». También se dice para dar la razón: «ándale, así es».',
    en: 'It cheers you on or hurries you up: "Come on!", "Go for it!". People also say it to agree: "That\'s right!".',
  },
  mijo: {
    es: '«Mijo» y «mija» vienen de «mi hijo» y «mi hija». En México se dicen con cariño a cualquiera, aunque no sea de la familia: una abuelita se lo dice a un vecino o a un joven en la tienda.',
    en: '"Mijo" and "mija" come from "mi hijo" (my son) and "mi hija" (my daughter). In Mexico people say them lovingly to anyone, family or not: a grandmother may say it to a neighbor or to a young person at the store.',
  },
  'a la bio': {
    es: '«A la bio, a la bao, a la bim, bom, ba» es la porra más conocida de México. Las palabras no significan nada: son puro ritmo para gritar en coro en la escuela, en el estadio o en una fiesta. Termina con el nombre de la persona y «ra, ra, ra».',
    en: '"A la bio, a la bao, a la bim, bom, ba" is Mexico\'s best-known cheer. The words mean nothing: they are pure rhythm to shout together at school, at the stadium or at a party. It ends with the person\'s name and "ra, ra, ra". It is the Mexican cousin of "Hip, hip, hooray!".',
  },
};
const CLAVE = { épale: /épale/i, ándale: /ándale/i, mijo: /mij[oa]/i, 'a la bio': /a la bio/i };
const TITULO = { épale: '¡Épale!', ándale: '¡Ándale!', mijo: 'Mijo / mija', 'a la bio': 'A la bio, a la bao…' };

/** Las palabras coloquiales que aparecen en un texto (en el orden de la lista). */
export const coloquialesEn = (texto) => Object.keys(COLOQUIAL).filter((k) => CLAVE[k].test(texto));

/** Recuadro plegable «¿Qué significa…?» con la explicación de cada palabra coloquial del texto. Vacío si no hay ninguna. */
export function notaColoquial(texto) {
  const ks = coloquialesEn(texto); if (!ks.length) return '';
  return `<details class="coloquial"><summary>💬 ${u(`¿Qué significa «${TITULO[ks[0]]}»?`, `What does "${TITULO[ks[0]]}" mean?`)}</summary>
    ${ks.map((k) => `<p><strong lang="es">${esc(TITULO[k])}</strong> ${esc(u(COLOQUIAL[k].es, COLOQUIAL[k].en))}</p>`).join('')}
    <p class="muted chico">${u('Son palabras coloquiales: se oyen en la calle y en la casa, y cambian de una región a otra.', 'These are colloquial words: you hear them on the street and at home, and they change from one region to another.')}</p></details>`;
}
