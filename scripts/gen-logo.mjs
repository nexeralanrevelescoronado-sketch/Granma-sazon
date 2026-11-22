// Genera el logo (SVG) y los iconos PWA (PNG 192, 512, maskable, apple-touch) con Chromium.
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const LOGO = join(RAIZ, 'assets', 'logo'); const ICONOS = join(RAIZ, 'assets', 'iconos');
mkdirSync(LOGO, { recursive: true }); mkdirSync(ICONOS, { recursive: true });
const C = { terracota:'#C8553D', olla:'#F2A93B', crema:'#FFF1DC', verde:'#2E8B83', cafe:'#4A2E1B' };

// Olla de barro con tres hilos de vapor. (cx,cy) = centro del dibujo; s = escala
const olla = (cx, cy, s) => `<g transform="translate(${cx} ${cy}) scale(${s})">
  <g fill="none" stroke="${C.crema}" stroke-width="9" stroke-linecap="round">
    <path d="M-34 -52 Q-48 -72 -34 -92 Q-22 -110 -34 -128"/>
    <path d="M0 -58 Q-14 -80 0 -100 Q12 -120 0 -140"/>
    <path d="M34 -52 Q20 -72 34 -92 Q46 -110 34 -128"/>
  </g>
  <rect x="-64" y="-38" width="128" height="14" rx="7" fill="#D98A1F"/>
  <path d="M-58 -26 Q-84 -2 -78 30 Q-70 80 -34 88 L34 88 Q70 80 78 30 Q84 -2 58 -26 Z" fill="${C.olla}"/>
  <path d="M-72 8 Q-80 14 -80 30 Q-70 28 -66 22 Z M72 8 Q80 14 80 30 Q70 28 66 22 Z" fill="#D98A1F"/>
  <path d="M-60 30 Q0 46 60 30" fill="none" stroke="${C.terracota}" stroke-width="6" stroke-linecap="round"/>
  <path d="M-52 48 Q0 62 52 48" fill="none" stroke="${C.verde}" stroke-width="5" stroke-linecap="round"/>
  <path d="M-48 -10 Q-58 10 -50 34" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="6" stroke-linecap="round"/>
</g>`;

const insignia = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" role="img" aria-label="Granma Sazón: Recetas de México para el mundo"><title>Granma Sazón</title>
<defs><path id="arc-sup" d="M70 256 A186 186 0 0 1 442 256"/><path id="arc-inf" d="M62 256 A194 194 0 0 0 450 256"/></defs>
<circle cx="256" cy="256" r="252" fill="${C.terracota}"/>
<circle cx="256" cy="256" r="236" fill="none" stroke="${C.crema}" stroke-width="5"/>
<circle cx="256" cy="256" r="226" fill="none" stroke="${C.olla}" stroke-width="2" stroke-dasharray="3 9" stroke-linecap="round"/>
<text font-family="Georgia, 'Times New Roman', serif" font-weight="700" font-size="54" fill="${C.crema}" letter-spacing="2"><textPath href="#arc-sup" startOffset="50%" text-anchor="middle">Granma Sazón</textPath></text>
${olla(256, 262, 1.28)}
<text font-family="Georgia, 'Times New Roman', serif" font-style="italic" font-size="25" fill="${C.crema}" letter-spacing=".5"><textPath href="#arc-inf" startOffset="50%" text-anchor="middle">Recetas de México para el mundo</textPath></text>
</svg>\n`;
writeFileSync(join(LOGO, 'logo.svg'), insignia);

// Icono sin texto (la olla grande) para tamaños pequeños y favicon
const icono = (r, margen) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" fill="${C.terracota}" ${r ? `rx="${r}"` : ''}/>${olla(256, 300, margen)}</svg>`;
writeFileSync(join(LOGO, 'icono.svg'), icono(112, 1.55));
writeFileSync(join(LOGO, 'icono-maskable.svg'), icono(0, 1.2));

const { chromium } = createRequire('/opt/node-tools/x.js')('playwright');
const b = await chromium.launch();
async function png(svgTexto, tam, ruta) {
  const pg = await b.newPage({ viewport: { width: tam, height: tam } });
  await pg.setContent(`<body style="margin:0;background:transparent">${svgTexto.replace('<svg ', `<svg width="${tam}" height="${tam}" `)}</body>`);
  await pg.screenshot({ path: ruta, omitBackground: true, clip: { x: 0, y: 0, width: tam, height: tam } });
  await pg.close();
}
await png(icono(0, 1.2), 192, join(ICONOS, 'icon-192.png'));
await png(icono(0, 1.2), 512, join(ICONOS, 'icon-512.png'));
await png(icono(0, 1.0), 512, join(ICONOS, 'icon-maskable-512.png'));   // zona segura (80%) amplia
await png(icono(0, 1.0), 192, join(ICONOS, 'icon-maskable-192.png'));
await png(icono(0, 1.0), 180, join(ICONOS, 'apple-touch-icon.png'));
await png(insignia, 1200, join(ICONOS, 'og-1200.png'));
await b.close();
console.log('logo e iconos listos');
