// Logo vivo: la insignia con la olla y 3 hilos de vapor que suben y se desvanecen (CSS en animaciones.css).
export function logoVapor(ancho = 120, alt = 'Granma Sazón') {
  const hilo = (d) => `<path data-g="hilo" d="${d}" fill="none" stroke="#FFF1DC" stroke-width="9" stroke-linecap="round"/>`;
  return `<svg class="vapor" viewBox="0 0 512 512" width="${ancho}" height="${ancho}" role="img" aria-label="${alt}">
<circle cx="256" cy="256" r="252" fill="#C8553D"/><circle cx="256" cy="256" r="236" fill="none" stroke="#FFF1DC" stroke-width="5"/>
<g transform="translate(256 300) scale(1.55)">
${hilo('M-34 -52 Q-48 -72 -34 -92 Q-22 -110 -34 -128')}${hilo('M0 -58 Q-14 -80 0 -100 Q12 -120 0 -140')}${hilo('M34 -52 Q20 -72 34 -92 Q46 -110 34 -128')}
<rect x="-64" y="-38" width="128" height="14" rx="7" fill="#D98A1F"/>
<path d="M-58 -26 Q-84 -2 -78 30 Q-70 80 -34 88 L34 88 Q70 80 78 30 Q84 -2 58 -26 Z" fill="#F2A93B"/>
<path d="M-72 8 Q-80 14 -80 30 Q-70 28 -66 22 Z M72 8 Q80 14 80 30 Q70 28 66 22 Z" fill="#D98A1F"/>
<path d="M-60 30 Q0 46 60 30" fill="none" stroke="#C8553D" stroke-width="6" stroke-linecap="round"/>
<path d="M-52 48 Q0 62 52 48" fill="none" stroke="#2E8B83" stroke-width="5" stroke-linecap="round"/></g></svg>`;
}
