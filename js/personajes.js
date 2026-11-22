// Granma y el Abuelo (SVG propios).
//   Granma: contenta | hablando | carinosa | pensando | aplaudiendo
//   Abuelo: serio | hablando | sonrisa | asintiendo | aconsejando
// Nombres antiguos (contento, pensando, aplaudiendo, animo) se traducen al estado nuevo equivalente.
const ALT = { granma: 'Granma', abuelo: 'El Abuelo' };
const ESTADOS = {
  granma: ['contenta', 'hablando', 'carinosa', 'pensando', 'aplaudiendo'],
  abuelo: ['serio', 'hablando', 'sonrisa', 'asintiendo', 'aconsejando'],
};
const ANTIGUOS = {
  granma: { contento: 'contenta', animo: 'contenta' },
  abuelo: { contento: 'sonrisa', pensando: 'serio', aplaudiendo: 'asintiendo', animo: 'aconsejando' },
};
export const estadosDe = (q) => ESTADOS[q];
export const estadoValido = (q, e) => ANTIGUOS[q][e] || (ESTADOS[q].includes(e) ? e : ESTADOS[q][0]);
export const rutaPj = (q, e) => `assets/personajes/${q}-${estadoValido(q, e)}.svg`;
export function pj(quien, estado = 'contenta', { ancho, clase = '', alt = false } = {}) {
  const w = ancho ? ` style="width:${ancho}px"` : '';
  return `<span class="pj ${clase}"${w}><img src="${rutaPj(quien, estado)}" width="240" height="320" decoding="async" alt="${alt ? ALT[quien] : ''}"></span>`;
}
