// Granma y el Abuelo (SVG propios). variantes: contento, pensando, aplaudiendo, animo
const ALT = { granma: 'Granma', abuelo: 'El Abuelo' };
export function pj(quien, variante = 'contento', { ancho, clase = '', alt = false } = {}) {
  const w = ancho ? ` style="width:${ancho}px"` : '';
  return `<span class="pj ${clase}"${w}><img src="assets/personajes/${quien}-${variante}.svg" width="240" height="320" decoding="async" alt="${alt ? ALT[quien] : ''}"></span>`;
}
