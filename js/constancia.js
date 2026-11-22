// Constancia Granma: se dibuja en el dispositivo con canvas (sin internet, sin servidor).
const C = { terra: '#C8553D', terraOsc: '#8F3A27', olla: '#F2A93B', crema: '#FFF1DC', verde: '#256F69', cafe: '#4A2E1B' };
const cargarImg = (src) => new Promise((ok, mal) => { const i = new Image(); i.onload = () => ok(i); i.onerror = mal; i.src = src; });

export async function generarConstancia({ nombre, fecha, aprende }) {
  const W = 1600, H = 1130, c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d');
  const [granma, abuelo, logo] = await Promise.all([cargarImg('assets/personajes/granma-aplaudiendo.svg'), cargarImg('assets/personajes/abuelo-contento.svg'), cargarImg('assets/logo/logo.svg')]);
  x.fillStyle = C.crema; x.fillRect(0, 0, W, H);
  x.strokeStyle = C.terra; x.lineWidth = 14; x.strokeRect(36, 36, W - 72, H - 72);
  x.strokeStyle = C.olla; x.lineWidth = 4; x.setLineDash([4, 14]); x.lineCap = 'round'; x.strokeRect(64, 64, W - 128, H - 128); x.setLineDash([]);
  x.drawImage(logo, W / 2 - 80, 92, 160, 160);
  const centro = (t, y, fuente, color) => { x.font = fuente; x.fillStyle = color; x.textAlign = 'center'; x.fillText(t, W / 2, y); };
  const es = aprende === 'es';
  centro('Constancia Granma', 340, 'bold 92px Georgia, serif', C.terraOsc);
  centro(es ? 'Certificate of Achievement' : 'Certificado de logro', 390, 'italic 34px Georgia, serif', C.cafe);
  centro(es ? 'Granma and Grandpa proudly certify that' : 'Granma y el Abuelo certifican con orgullo que', 470, '34px Georgia, serif', C.cafe);
  let t = 76; x.font = `bold ${t}px Georgia, serif`; while (x.measureText(nombre).width > 900 && t > 36) { t -= 4; x.font = `bold ${t}px Georgia, serif`; }
  centro(nombre, 570, `bold ${t}px Georgia, serif`, C.verde);
  x.strokeStyle = C.olla; x.lineWidth = 4; x.beginPath(); x.moveTo(W / 2 - 330, 594); x.lineTo(W / 2 + 330, 594); x.stroke();
  centro(es ? 'completed "Granma\'s childhood in Mexico" and learned Spanish with recipes from Mexico.' : 'terminó «La niñez de Granma en México» y aprendió inglés con recetas de México.', 660, '31px Georgia, serif', C.cafe);
  centro(es ? 'Level A1 · Spanish' : 'Nivel A1 · Inglés', 730, 'bold 46px Georgia, serif', C.terra);
  centro(fecha, 800, '30px Georgia, serif', C.cafe);
  x.drawImage(granma, 120, 560, 330, 440); x.drawImage(abuelo, W - 450, 560, 330, 440);
  centro('Granma Sazón · Recetas de México para el mundo', 1040, 'italic 28px Georgia, serif', C.terraOsc);
  x.font = '26px Georgia, serif'; x.fillStyle = C.cafe; x.textAlign = 'center'; x.fillText('Granma', 540, 1010); x.fillText(es ? 'Grandpa' : 'El Abuelo', W - 540, 1010);
  return new Promise((ok) => c.toBlob(ok, 'image/png'));
}
