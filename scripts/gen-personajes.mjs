// Genera los SVG de Granma y el Abuelo (diseño propio) en assets/personajes/.
// Estados — Granma: contenta | hablando | carinosa | pensando | aplaudiendo
//          Abuelo: serio | hablando | sonrisa | asintiendo | aconsejando
// Cada SVG completo trae grupos separables: #cuerpo, #cabeza y dentro #cara > #ojos + #boca.
// Piezas sueltas: <q>-cabeza.svg (sin cara), <q>-cara-<estado>.svg (ojos+boca, mismo lienzo), <q>-cuerpo-<estado>.svg.
// Los estados «hablando» llevan dentro una animación CSS ligera (boca cerrada/abierta) que respeta prefers-reduced-motion.
import { writeFileSync, mkdirSync, readdirSync, unlinkSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'personajes');
mkdirSync(OUT, { recursive: true });
for (const f of readdirSync(OUT)) if (f.endsWith('.svg')) unlinkSync(join(OUT, f));

const C = { terracota:'#C8553D', olla:'#F2A93B', crema:'#FFF1DC', verde:'#2E8B83', cafe:'#4A2E1B' };
const svg = (vb, body, titulo, extra = '') => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" role="img" aria-label="${titulo}"><title>${titulo}</title>${extra}${body}</svg>\n`;
const brazo = (d, col, w = 24) => `<path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const mano = (x, y, col, r = 11) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${col}"/>`;
const corazon = (x, y, s, col = '#E0568C') => `<path transform="translate(${x} ${y}) scale(${s})" d="M0 5 C-10 -3 -9 -11 -4 -11 C-1.5 -11 0 -9 0 -8 C0 -9 1.5 -11 4 -11 C9 -11 10 -3 0 5Z" fill="${col}"/>`;
// Animación de hablar: dos bocas que se alternan. Dentro del propio SVG: no requiere JS ni audio.
const ESTILO_HABLA = `<style>.ma{animation:ma .46s steps(1,end) infinite}.mb{animation:mb .46s steps(1,end) infinite}@keyframes ma{0%{opacity:1}45%{opacity:0}100%{opacity:0}}@keyframes mb{0%{opacity:0}45%{opacity:1}100%{opacity:1}}@media (prefers-reduced-motion:reduce){.ma{animation:none;opacity:1}.mb{display:none}}</style>`;

/* ================= GRANMA ================= */
const G = { piel:'#B97A56', pielSombra:'#A06644', pelo:'#F1EEE9', peloSombra:'#D8D3CB', vestido:C.verde, rebozo:'#B8322A', dalia:'#E0568C', armazon:'#8A6A55' };
const cuchara = (x, y, largo = 60, ang = 0) => `<g transform="rotate(${ang} ${x} ${y})"><line x1="${x}" y1="${y}" x2="${x}" y2="${y + largo}" stroke="#A9743F" stroke-width="6" stroke-linecap="round"/><ellipse cx="${x}" cy="${y - 4}" rx="9" ry="14" fill="#B9834B" stroke="#8D5F31" stroke-width="2"/></g>`;
const granmaCuerpo = (pose) => {
  const base = `
  <path d="M58 320 L70 176 Q120 152 170 176 L182 320 Z" fill="${G.vestido}"/>
  <path d="M88 192 L152 192 L162 320 L78 320 Z" fill="#FBE3BE" stroke="#D9B98A" stroke-width="3"/>
  <path d="M88 192 H152" stroke="#E5D2B3" stroke-width="3"/>
  <g transform="translate(120 250)"><circle r="3" fill="${C.olla}"/>${[0,72,144,216,288].map(a=>`<ellipse cx="0" cy="-7" rx="3.4" ry="5.2" fill="#E0568C" transform="rotate(${a})"/>`).join('')}<path d="M0 8 q-9 8 -16 4 q6 -8 16 -4z" fill="#2E8B83"/></g>
  <path d="M60 180 Q120 150 180 180 L190 240 Q152 222 120 258 Q88 222 50 240 Z" fill="${G.rebozo}"/>
  <path d="M52 236 Q88 220 120 256 Q152 220 188 236" fill="none" stroke="${C.olla}" stroke-width="6" stroke-linecap="round"/>
  <path d="M58 204 Q120 176 182 204" fill="none" stroke="${C.olla}" stroke-width="3" stroke-dasharray="2 7" stroke-linecap="round"/>`;
  const poses = {
    contenta: brazo('M68 186 Q52 234 60 266', G.vestido) + mano(60, 272, G.piel) + brazo('M172 186 Q188 234 180 266', G.vestido) + mano(180, 272, G.piel) + cuchara(180, 266, 44, 0),
    hablando: brazo('M68 186 Q52 234 60 266', G.vestido) + mano(60, 272, G.piel) + brazo('M172 186 Q208 176 200 134', G.vestido) + mano(200, 126, G.piel, 12) + cuchara(200, 90, 36, 0),
    carinosa: brazo('M68 188 Q70 228 106 220', G.vestido) + brazo('M172 188 Q170 228 134 220', G.vestido) + mano(108, 216, G.piel) + mano(132, 216, G.piel) + corazon(120, 204, 1.2),
    pensando: brazo('M172 188 Q188 234 180 266', G.vestido) + mano(180, 272, G.piel) + cuchara(180, 266, 44, 0) + brazo('M68 188 Q40 218 76 194 Q100 176 112 160', G.vestido, 22) + mano(112, 154, G.piel, 12),
    aplaudiendo: `<g id="chispas"><line x1="58" y1="156" x2="48" y2="146" stroke="${C.olla}" stroke-width="4" stroke-linecap="round"/><line x1="182" y1="156" x2="192" y2="146" stroke="${C.olla}" stroke-width="4" stroke-linecap="round"/><line x1="120" y1="172" x2="120" y2="160" stroke="${C.olla}" stroke-width="4" stroke-linecap="round"/></g>`
      + cuchara(150, 218, 50, -8) + `<g id="aplauso">` + brazo('M68 188 Q70 228 108 218', G.vestido) + brazo('M172 188 Q170 228 132 218', G.vestido) + mano(110, 216, G.piel) + mano(130, 216, G.piel) + `</g>`,
  };
  return base + poses[pose];
};
const gOjo = (cx, dx = 0, dy = 0) => `<ellipse cx="${cx + dx}" cy="${108 + dy}" rx="8.5" ry="10.5" fill="#3A2417"/><circle cx="${cx + dx + 3}" cy="${103 + dy}" r="3.4" fill="#fff"/><circle cx="${cx + dx - 3}" cy="${113 + dy}" r="1.6" fill="#fff"/>`;
const gCerrado = (cx) => `<path d="M${cx - 10} 110 Q${cx} 98 ${cx + 10} 110" fill="none" stroke="${C.cafe}" stroke-width="3.6" stroke-linecap="round"/><path d="M${cx - 10} 110 l-3 3 M${cx + 10} 110 l3 3" stroke="${C.cafe}" stroke-width="2.4" stroke-linecap="round"/>`;
const gCejaArq = (cx, dy = 0) => `<path d="M${cx - 11} ${86 + dy} Q${cx} ${80 + dy} ${cx + 11} ${86 + dy}" fill="none" stroke="${G.peloSombra}" stroke-width="3" stroke-linecap="round"/>`;
const gBocaCerrada = `<path d="M106 137 Q120 151 134 137" fill="none" stroke="#7A2E2E" stroke-width="3.6" stroke-linecap="round"/>`;
const gBocaAbierta = `<path d="M106 135 Q120 160 134 135 Z" fill="#7A2A2A"/><path d="M112 148 Q120 155 128 148 Q120 144 112 148Z" fill="#E88A8A"/>`;
const par = (cerrada, abierta) => `<g class="ma">${cerrada}</g><g class="mb" opacity="0">${abierta}</g>`;
const GRANMA_ESTADOS = {
  contenta: { pose: 'contenta', ojos: gOjo(98) + gOjo(142), boca: par(gBocaCerrada, gBocaAbierta) },
  hablando: { pose: 'hablando', ojos: gOjo(98) + gOjo(142) + gCejaArq(98, -2) + gCejaArq(142, -2), boca: par(gBocaCerrada, gBocaAbierta), estilo: ESTILO_HABLA },
  carinosa: { pose: 'carinosa', ojos: gCerrado(98) + gCerrado(142), boca: par(gBocaCerrada, gBocaAbierta), extra: corazon(56, 66, 1.3) + corazon(186, 50, 1.6) + corazon(196, 84, 1) },
  pensando: { pose: 'pensando', ojos: gOjo(98, 3, -4) + gOjo(142, 3, -4) + `<path d="M86 84 Q98 74 110 80" fill="none" stroke="${G.peloSombra}" stroke-width="3" stroke-linecap="round"/><path d="M132 86 Q144 84 154 88" fill="none" stroke="${G.peloSombra}" stroke-width="3" stroke-linecap="round"/>`, boca: par(`<path d="M110 140 Q122 135 132 142" fill="none" stroke="#7A2E2E" stroke-width="3.6" stroke-linecap="round"/>`, gBocaAbierta), extra: `<circle cx="190" cy="56" r="4" fill="#C9B9A4"/><circle cx="200" cy="42" r="6" fill="#C9B9A4"/><circle cx="214" cy="24" r="9" fill="#C9B9A4"/>` },
  aplaudiendo: { pose: 'aplaudiendo', ojos: gCerrado(98) + gCerrado(142), boca: par(gBocaAbierta, gBocaAbierta) },
};
const granmaCabeza = () => `
  <rect x="104" y="150" width="32" height="30" rx="9" fill="${G.pielSombra}"/>
  <circle cx="120" cy="30" r="23" fill="${G.pelo}" stroke="${G.peloSombra}" stroke-width="2"/>
  <ellipse cx="120" cy="92" rx="68" ry="62" fill="${G.pelo}"/>
  <circle cx="62" cy="110" r="10" fill="${G.piel}"/><circle cx="178" cy="110" r="10" fill="${G.piel}"/>
  <circle cx="61" cy="121" r="3.2" fill="${C.olla}"/><circle cx="179" cy="121" r="3.2" fill="${C.olla}"/>
  <ellipse cx="120" cy="104" rx="58" ry="54" fill="${G.piel}"/>
  <path d="M62 98 Q62 50 120 48 Q178 50 178 98 Q152 70 120 70 Q88 70 62 98 Z" fill="${G.pelo}"/>
  <path d="M86 70 Q120 58 154 70" fill="none" stroke="${G.peloSombra}" stroke-width="2.5" stroke-linecap="round"/>
  <circle cx="84" cy="128" r="10" fill="#E88A8A" opacity=".55"/><circle cx="156" cy="128" r="10" fill="#E88A8A" opacity=".55"/>
  <path d="M117 118 Q119 126 125 126" fill="none" stroke="${G.pielSombra}" stroke-width="2.6" stroke-linecap="round"/>
  <g transform="translate(150 30)">${[0,45,90,135,180,225,270,315].map(a=>`<ellipse cx="0" cy="-11" rx="6.5" ry="11" fill="${G.dalia}" stroke="#C03F74" stroke-width="1.2" transform="rotate(${a})"/>`).join('')}<circle r="6" fill="${C.olla}"/></g>`;
const granmaLentes = `<circle cx="98" cy="108" r="21" fill="#fff" fill-opacity=".14" stroke="${G.armazon}" stroke-width="2.6"/><circle cx="142" cy="108" r="21" fill="#fff" fill-opacity=".14" stroke="${G.armazon}" stroke-width="2.6"/><path d="M118 106 Q120 102 122 106" fill="none" stroke="${G.armazon}" stroke-width="2.6"/>`;

/* ================= ABUELO ================= */
const A = { piel:'#8E5A3C', pielSombra:'#774A31', blanco:'#F4F1EC', chaleco:'#5F7C8C', camisa:'#F3EAD8', sarape:C.terracota, baston:'#8B5A2B', paja:'#E3C07A', pajaSombra:'#C9A25C', banda:'#6B3F22' };
const baston = (x = 190) => `<path d="M${x} 314 L${x} 192 Q${x} 170 ${x - 14} 172" fill="none" stroke="${A.baston}" stroke-width="8" stroke-linecap="round"/>`;
// Mano abierta y bien definida: palma, cuatro dedos juntos y pulgar. Es un saludo o un «escucha»;
// nunca se dibuja un dedo solo (se puede malinterpretar). (x, y) = muñeca; la mano sube desde ahí.
const manoAbierta = (x, y, col, sombra) => `<g transform="translate(${x} ${y})"><rect x="-13" y="-24" width="26" height="27" rx="9" fill="${col}"/>${[[-13, 14], [-6.5, 18], [0, 17], [6.5, 13]].map(([fx, h]) => `<rect x="${fx}" y="${-22 - h}" width="6" height="${h + 6}" rx="3" fill="${col}"/>`).join('')}<rect x="-22" y="-20" width="7.5" height="17" rx="3.75" fill="${col}" transform="rotate(-30 -18 -8)"/><path d="M-6.8 -25 v-9 M-0.3 -25 v-10 M6.2 -25 v-8" stroke="${sombra}" stroke-width="1" stroke-linecap="round" opacity=".7"/></g>`;
const abueloCuerpo = (pose) => {
  const base = `
  <path d="M60 320 L68 176 Q120 154 172 176 L180 320 Z" fill="${A.chaleco}"/>
  <path d="M100 170 L120 218 L140 170 Z" fill="${A.camisa}"/>
  <line x1="120" y1="218" x2="120" y2="320" stroke="#47606E" stroke-width="3"/>
  ${[240,262,284].map(y=>`<circle cx="120" cy="${y}" r="3.4" fill="${C.cafe}"/>`).join('')}
  <path d="M70 176 Q120 154 170 176 L196 256 L162 266 L130 204 Q100 194 70 200 Z" fill="${A.sarape}"/>
  <path d="M76 200 Q100 194 130 208 L164 266" fill="none" stroke="${C.olla}" stroke-width="6"/>
  <path d="M72 188 Q112 180 134 196 L176 266" fill="none" stroke="${C.crema}" stroke-width="2.5" stroke-dasharray="5 6"/>`;
  const poses = {
    serio: brazo('M66 186 Q52 236 62 266', A.chaleco) + mano(62, 272, A.piel) + baston() + brazo('M174 188 Q192 218 190 194', A.chaleco, 22) + mano(190, 182, A.piel),
    hablando: brazo('M66 186 Q52 236 62 266', A.chaleco) + mano(62, 272, A.piel) + baston(46) + brazo('M174 188 Q204 204 200 172', A.chaleco, 22) + manoAbierta(200, 170, A.piel, A.pielSombra),
    sonrisa: brazo('M66 186 Q52 236 62 266', A.chaleco) + mano(62, 272, A.piel) + baston() + brazo('M174 188 Q192 218 190 194', A.chaleco, 22) + mano(190, 182, A.piel),
    asintiendo: baston(190) + brazo('M66 188 Q78 244 182 210', A.chaleco, 22) + mano(186, 206, A.piel, 12) + brazo('M174 188 Q196 214 190 188', A.chaleco, 22) + mano(190, 180, A.piel, 12),
    aconsejando: brazo('M66 186 Q52 236 62 266', A.chaleco) + mano(62, 272, A.piel) + baston(208) + `<g id="mano">` + brazo('M172 188 Q206 168 198 128', A.chaleco)
      + `` + manoAbierta(198, 126, A.piel, A.pielSombra) + `</g><path id="chispas" d="M214 84 l8 -8 M218 100 l12 0 M180 78 l-4 -10" stroke="${C.olla}" stroke-width="4" stroke-linecap="round" fill="none"/>`,
  };
  return base + poses[pose];
};
const aPunto = (cx, dx = 0, dy = 0) => `<circle cx="${cx + dx}" cy="${100 + dy}" r="4.6" fill="${C.cafe}"/><circle cx="${cx + dx + 1.5}" cy="${98.5 + dy}" r="1.4" fill="#fff"/>`;
const aCerrado = (cx) => `<path d="M${cx - 9} 101 Q${cx} 94 ${cx + 9} 101" fill="none" stroke="${C.cafe}" stroke-width="3.4" stroke-linecap="round"/>`;
const aCejas = (dyL = 0, dyR = 0) => `<path d="M86 ${88 + dyL} Q100 ${82 + dyL} 114 ${88 + dyL}" fill="none" stroke="${A.blanco}" stroke-width="10" stroke-linecap="round"/><path d="M126 ${88 + dyR} Q140 ${82 + dyR} 154 ${88 + dyR}" fill="none" stroke="${A.blanco}" stroke-width="10" stroke-linecap="round"/>`;
const aBocaSeria = `<path d="M109 139 H131" stroke="#3D2412" stroke-width="3.6" stroke-linecap="round"/>`;
const aBocaAbierta = `<ellipse cx="120" cy="141" rx="8" ry="5.5" fill="#3D1F10"/>`;
const ABUELO_ESTADOS = {
  serio: { pose: 'serio', ojos: aPunto(100) + aPunto(140) + aCejas(), boca: par(aBocaSeria, aBocaAbierta) },
  hablando: { pose: 'hablando', ojos: aPunto(100) + aPunto(140) + aCejas(-2, -2), boca: par(aBocaSeria, aBocaAbierta), estilo: ESTILO_HABLA },
  sonrisa: { pose: 'sonrisa', ojos: aCerrado(100) + aCerrado(140) + aCejas(-1, -1) + `<path d="M84 110 l-5 -3 M156 110 l5 -3" stroke="${A.pielSombra}" stroke-width="2.4" stroke-linecap="round"/>`, boca: par(`<path d="M107 138 Q120 146 133 138" fill="none" stroke="#3D2412" stroke-width="3.6" stroke-linecap="round"/>`, aBocaAbierta) },
  asintiendo: { pose: 'asintiendo', ojos: aCerrado(100) + aCerrado(140) + aCejas(), boca: par(aBocaSeria, aBocaAbierta) },
  aconsejando: { pose: 'aconsejando', ojos: aPunto(104, 2, -2) + aPunto(144, 2, -2) + aCejas(-3, 0), boca: par(`<path d="M109 139 Q120 141 131 138" fill="none" stroke="#3D2412" stroke-width="3.6" stroke-linecap="round"/>`, aBocaAbierta) },
};
const abueloCabeza = () => `
  <rect x="104" y="142" width="32" height="28" rx="9" fill="${A.pielSombra}"/>
  <circle cx="72" cy="106" r="10" fill="${A.piel}"/><circle cx="168" cy="106" r="10" fill="${A.piel}"/>
  <ellipse cx="120" cy="104" rx="49" ry="52" fill="${A.piel}"/>
  <path d="M84 108 q-3 4 -1 8 M156 108 q3 4 1 8" fill="none" stroke="${A.pielSombra}" stroke-width="2" stroke-linecap="round"/>
  <path d="M120 100 Q111 117 122 119" fill="none" stroke="${A.pielSombra}" stroke-width="3" stroke-linecap="round"/>`;
const abueloAdelante = `
  <path d="M90 124 Q106 112 120 121 Q134 112 150 124 Q138 138 120 131 Q102 138 90 124 Z" fill="${A.blanco}" stroke="#D8D3CB" stroke-width="1.5"/>
  <g id="sombrero"><ellipse cx="120" cy="66" rx="90" ry="15" fill="${A.paja}" stroke="${A.pajaSombra}" stroke-width="2.5"/>
  <path d="M80 66 Q80 16 120 16 Q160 16 160 66 Z" fill="${A.paja}" stroke="${A.pajaSombra}" stroke-width="2.5"/>
  <path d="M80 66 Q120 74 160 66 L160 50 Q120 58 80 50 Z" fill="${A.banda}"/>
  <path d="M92 28 Q120 22 148 28 M88 40 Q120 34 152 40" fill="none" stroke="${A.pajaSombra}" stroke-width="2" stroke-linecap="round"/>
  <path d="M38 66 Q120 86 202 66" fill="none" stroke="${A.pajaSombra}" stroke-width="2" opacity=".7"/></g>`;

const PERSONAJES = {
  granma: { nombre: 'Granma', estados: GRANMA_ESTADOS, cuerpo: granmaCuerpo, cabeza: granmaCabeza, delante: '', lentes: granmaLentes, vbCabeza: '40 0 160 176' },
  abuelo: { nombre: 'El Abuelo', estados: ABUELO_ESTADOS, cuerpo: abueloCuerpo, cabeza: abueloCabeza, delante: abueloAdelante, lentes: '', vbCabeza: '30 0 180 176' },
};
for (const [id, p] of Object.entries(PERSONAJES)) {
  // cabeza sin cara (para componer con cualquier -cara-<estado>)
  writeFileSync(join(OUT, `${id}-cabeza.svg`), svg('0 0 240 320', `<g id="cabeza">${p.cabeza()}${p.delante}</g>`, `${p.nombre}, cabeza sin cara`));
  for (const [estado, e] of Object.entries(p.estados)) {
    const cara = `<g id="cara"><g id="ojos">${e.ojos}</g><g id="boca">${e.boca}</g>${p.lentes}</g>`;
    const completo = `<g id="respira"><g id="cuerpo">${p.cuerpo(e.pose)}</g><g id="cabeza">${p.cabeza()}${cara}${p.delante}</g></g>${e.extra || ''}`;
    writeFileSync(join(OUT, `${id}-${estado}.svg`), svg('0 0 240 320', completo, `${p.nombre}, ${estado}`, (e.estilo || '')));
    writeFileSync(join(OUT, `${id}-cara-${estado}.svg`), svg('0 0 240 320', cara, `${p.nombre}, cara ${estado}`, (e.estilo || '')));
    writeFileSync(join(OUT, `${id}-cuerpo-${estado}.svg`), svg('0 140 240 180', `<g id="cuerpo">${p.cuerpo(e.pose)}</g>`, `${p.nombre}, cuerpo ${estado}`));
  }
}
console.log('personajes listos en', OUT);
