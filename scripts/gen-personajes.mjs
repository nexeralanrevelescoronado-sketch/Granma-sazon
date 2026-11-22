// Genera los SVG de Granma y el Abuelo (diseño propio) en assets/personajes/.
// Por personaje: 4 variantes completas (contento, pensando, aplaudiendo, animo),
// y piezas separables: cabeza por expresión y cuerpo por pose.
import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
const OUT = join(dirname(fileURLToPath(import.meta.url)), '..', 'assets', 'personajes');
mkdirSync(OUT, { recursive: true });

const C = { terracota:'#C8553D', olla:'#F2A93B', crema:'#FFF1DC', verde:'#2E8B83', cafe:'#4A2E1B' };
const svg = (vb, body, titulo) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${vb}" role="img" aria-label="${titulo}"><title>${titulo}</title>${body}</svg>\n`;
const brazo = (d, col, w = 24) => `<path d="${d}" fill="none" stroke="${col}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"/>`;
const mano = (x, y, col, r = 11) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${col}"/>`;

/* ---------------- GRANMA ---------------- */
const G = { piel:'#B97A56', pielSombra:'#A06644', pelo:'#F1EEE9', peloSombra:'#D8D3CB', vestido:C.verde, rebozo:'#B8322A', dalia:'#E0568C' };
const cuchara = (x, y, largo = 60, ang = 0) => `<g transform="rotate(${ang} ${x} ${y})"><line x1="${x}" y1="${y}" x2="${x}" y2="${y + largo}" stroke="#A9743F" stroke-width="6" stroke-linecap="round"/><ellipse cx="${x}" cy="${y - 4}" rx="9" ry="14" fill="#B9834B" stroke="#8D5F31" stroke-width="2"/></g>`;
const granmaCuerpo = (pose) => {
  const base = `
  <path d="M58 320 L70 172 Q120 148 170 172 L182 320 Z" fill="${G.vestido}"/>
  <path d="M88 188 L152 188 L162 320 L78 320 Z" fill="#FBE3BE" stroke="#D9B98A" stroke-width="3"/>
  <path d="M88 188 H152" stroke="#E5D2B3" stroke-width="3"/>
  <g transform="translate(120 246)"><circle r="3" fill="${C.olla}"/>${[0,72,144,216,288].map(a=>`<ellipse cx="0" cy="-7" rx="3.4" ry="5.2" fill="#E0568C" transform="rotate(${a})"/>`).join('')}<path d="M0 8 q-9 8 -16 4 q6 -8 16 -4z" fill="#2E8B83"/></g>
  <path d="M60 176 Q120 146 180 176 L190 236 Q152 218 120 254 Q88 218 50 236 Z" fill="${G.rebozo}"/>
  <path d="M52 232 Q88 216 120 252 Q152 216 188 232" fill="none" stroke="${C.olla}" stroke-width="6" stroke-linecap="round"/>
  <path d="M58 200 Q120 172 182 200" fill="none" stroke="${C.olla}" stroke-width="3" stroke-dasharray="2 7" stroke-linecap="round"/>`;
  const poses = {
    contento: brazo('M68 182 Q52 230 60 262', G.vestido) + mano(60, 268, G.piel) + brazo('M172 182 Q188 230 180 262', G.vestido) + mano(180, 268, G.piel) + cuchara(180, 262, 44, 0),
    aplaudiendo: `<line x1="58" y1="150" x2="48" y2="140" stroke="${C.olla}" stroke-width="4" stroke-linecap="round"/><line x1="182" y1="150" x2="192" y2="140" stroke="${C.olla}" stroke-width="4" stroke-linecap="round"/><line x1="120" y1="168" x2="120" y2="156" stroke="${C.olla}" stroke-width="4" stroke-linecap="round"/>`
      + cuchara(150, 214, 50, -8) + brazo('M68 184 Q70 224 108 214', G.vestido) + brazo('M172 184 Q170 224 132 214', G.vestido) + mano(110, 212, G.piel) + mano(130, 212, G.piel),
    pensando: brazo('M172 184 Q188 230 180 262', G.vestido) + mano(180, 268, G.piel) + cuchara(180, 262, 44, 0) + brazo('M68 184 Q40 214 76 190 Q100 172 112 156', G.vestido, 22) + mano(112, 150, G.piel, 12),
    animo: brazo('M68 182 Q52 230 60 262', G.vestido) + mano(60, 268, G.piel) + brazo('M172 182 Q206 160 196 112', G.vestido) + mano(196, 104, G.piel, 12) + cuchara(196, 66, 36, 0)
      + `<line x1="214" y1="80" x2="226" y2="72" stroke="${C.olla}" stroke-width="4" stroke-linecap="round"/><line x1="216" y1="100" x2="230" y2="100" stroke="${C.olla}" stroke-width="4" stroke-linecap="round"/><line x1="170" y1="62" x2="168" y2="48" stroke="${C.olla}" stroke-width="4" stroke-linecap="round"/>`,
  };
  return base + poses[pose];
};
const granmaCara = (ex) => {
  const ojos = {
    contento: `<path d="M86 99 Q96 89 106 99" fill="none" stroke="${C.cafe}" stroke-width="3.4" stroke-linecap="round"/><path d="M134 99 Q144 89 154 99" fill="none" stroke="${C.cafe}" stroke-width="3.4" stroke-linecap="round"/>`,
    aplaudiendo: `<path d="M86 99 Q96 89 106 99" fill="none" stroke="${C.cafe}" stroke-width="3.4" stroke-linecap="round"/><path d="M134 99 Q144 89 154 99" fill="none" stroke="${C.cafe}" stroke-width="3.4" stroke-linecap="round"/>`,
    pensando: `<circle cx="100" cy="95" r="4.6" fill="${C.cafe}"/><circle cx="146" cy="95" r="4.6" fill="${C.cafe}"/><circle cx="101.6" cy="93.4" r="1.4" fill="#fff"/><circle cx="147.6" cy="93.4" r="1.4" fill="#fff"/>`,
    animo: `<circle cx="98" cy="98" r="5" fill="${C.cafe}"/><circle cx="142" cy="98" r="5" fill="${C.cafe}"/><circle cx="99.8" cy="96" r="1.7" fill="#fff"/><circle cx="143.8" cy="96" r="1.7" fill="#fff"/>`,
  }[ex];
  const cejas = ex === 'pensando'
    ? `<path d="M86 78 Q98 70 110 76" fill="none" stroke="${G.peloSombra}" stroke-width="3" stroke-linecap="round"/><path d="M132 80 Q144 78 154 82" fill="none" stroke="${G.peloSombra}" stroke-width="3" stroke-linecap="round"/>`
    : ex === 'animo' ? `<path d="M86 76 Q98 68 110 74" fill="none" stroke="${G.peloSombra}" stroke-width="3" stroke-linecap="round"/><path d="M130 74 Q142 68 154 76" fill="none" stroke="${G.peloSombra}" stroke-width="3" stroke-linecap="round"/>` : '';
  const boca = {
    contento: `<path d="M104 118 Q120 134 136 118" fill="none" stroke="#7A2E2E" stroke-width="3.4" stroke-linecap="round"/>`,
    aplaudiendo: `<path d="M102 116 Q120 142 138 116 Z" fill="#8A2F2F"/><path d="M110 129 Q120 136 130 129 Q120 125 110 129Z" fill="#E88A8A"/>`,
    pensando: `<path d="M110 124 Q122 120 132 126" fill="none" stroke="#7A2E2E" stroke-width="3.4" stroke-linecap="round"/>`,
    animo: `<path d="M100 114 Q120 146 140 114 Z" fill="#8A2F2F"/><path d="M108 128 Q120 138 132 128 Q120 122 108 128Z" fill="#E88A8A"/>`,
  }[ex];
  const dalia = `<g transform="translate(160 40)">${[0,45,90,135,180,225,270,315].map(a=>`<ellipse cx="0" cy="-11" rx="6.5" ry="11" fill="${G.dalia}" stroke="#C03F74" stroke-width="1.2" transform="rotate(${a})"/>`).join('')}<circle r="6" fill="${C.olla}"/></g>`;
  return `
  <rect x="106" y="132" width="28" height="30" rx="8" fill="${G.pielSombra}"/>
  <circle cx="120" cy="34" r="25" fill="${G.pelo}" stroke="${G.peloSombra}" stroke-width="2"/>
  <ellipse cx="120" cy="86" rx="54" ry="56" fill="${G.pelo}"/>
  <circle cx="72" cy="102" r="9" fill="${G.piel}"/><circle cx="168" cy="102" r="9" fill="${G.piel}"/>
  <circle cx="71" cy="112" r="3" fill="${C.olla}"/><circle cx="169" cy="112" r="3" fill="${C.olla}"/>
  <ellipse cx="120" cy="100" rx="48" ry="50" fill="${G.piel}"/>
  <path d="M70 92 Q70 46 120 44 Q170 46 170 92 Q150 66 120 66 Q90 66 70 92 Z" fill="${G.pelo}"/>
  <path d="M88 68 Q120 58 152 68" fill="none" stroke="${G.peloSombra}" stroke-width="2.5" stroke-linecap="round"/>
  <circle cx="92" cy="114" r="9" fill="#E88A8A" opacity=".55"/><circle cx="148" cy="114" r="9" fill="#E88A8A" opacity=".55"/>
  ${cejas}${ojos}
  <circle cx="98" cy="98" r="16" fill="#fff" fill-opacity=".18" stroke="${C.cafe}" stroke-width="3"/><circle cx="142" cy="98" r="16" fill="#fff" fill-opacity=".18" stroke="${C.cafe}" stroke-width="3"/>
  <path d="M114 97 Q120 93 126 97" fill="none" stroke="${C.cafe}" stroke-width="3"/>
  <path d="M118 104 Q120 112 124 112" fill="none" stroke="${G.pielSombra}" stroke-width="2.4" stroke-linecap="round"/>
  ${boca}${dalia}`;
};

/* ---------------- ABUELO ---------------- */
const A = { piel:'#8E5A3C', pielSombra:'#774A31', blanco:'#F4F1EC', chaleco:'#5F7C8C', camisa:'#F3EAD8', sarape:C.terracota, baston:'#8B5A2B', paja:'#E3C07A', pajaSombra:'#C9A25C', banda:'#6B3F22' };
const abueloCuerpo = (pose) => {
  const baston = (x = 190) => `<path d="M${x} 312 L${x} 190 Q${x} 168 ${x - 14} 170" fill="none" stroke="${A.baston}" stroke-width="8" stroke-linecap="round"/>`;
  const base = `
  <path d="M60 320 L68 172 Q120 150 172 172 L180 320 Z" fill="${A.chaleco}"/>
  <path d="M100 166 L120 214 L140 166 Z" fill="${A.camisa}"/>
  <line x1="120" y1="214" x2="120" y2="320" stroke="#47606E" stroke-width="3"/>
  ${[236,258,280].map(y=>`<circle cx="120" cy="${y}" r="3.4" fill="${C.cafe}"/>`).join('')}
  <path d="M70 172 Q120 150 170 172 L196 252 L162 262 L130 200 Q100 190 70 196 Z" fill="${A.sarape}"/>
  <path d="M76 196 Q100 190 130 204 L164 262" fill="none" stroke="${C.olla}" stroke-width="6"/>
  <path d="M72 184 Q112 176 134 192 L176 262" fill="none" stroke="${C.crema}" stroke-width="2.5" stroke-dasharray="5 6"/>`;
  const poses = {
    contento: brazo('M66 182 Q52 232 62 262', A.chaleco) + mano(62, 268, A.piel) + baston() + brazo('M174 184 Q192 214 190 190', A.chaleco, 22) + mano(190, 178, A.piel),
    aplaudiendo: brazo('M68 186 Q70 226 108 216', A.chaleco) + brazo('M172 186 Q170 226 132 216', A.chaleco) + mano(110, 214, A.piel) + mano(130, 214, A.piel)
      + `<line x1="120" y1="196" x2="120" y2="186" stroke="${C.olla}" stroke-width="4" stroke-linecap="round"/><line x1="102" y1="198" x2="96" y2="190" stroke="${C.olla}" stroke-width="4" stroke-linecap="round"/><line x1="138" y1="198" x2="144" y2="190" stroke="${C.olla}" stroke-width="4" stroke-linecap="round"/>` + baston(212),
    pensando: baston() + brazo('M174 184 Q192 214 190 190', A.chaleco, 22) + mano(190, 178, A.piel) + brazo('M66 186 Q36 214 76 190 Q100 172 112 158', A.chaleco, 22) + mano(112, 152, A.piel, 12),
    animo: brazo('M66 182 Q52 232 62 262', A.chaleco) + mano(62, 268, A.piel) + baston(206) + brazo('M172 184 Q206 160 196 122', A.chaleco)
      + `<g transform="translate(196 108)"><rect x="-11" y="-6" width="22" height="22" rx="8" fill="${A.piel}"/><rect x="-5" y="-30" width="10" height="28" rx="5" fill="${A.piel}"/></g>`,
  };
  return base + poses[pose];
};
const abueloCara = (ex) => {
  const ojos = {
    contento: `<path d="M90 98 Q100 92 110 98" fill="none" stroke="${C.cafe}" stroke-width="3.4" stroke-linecap="round"/><path d="M130 98 Q140 92 150 98" fill="none" stroke="${C.cafe}" stroke-width="3.4" stroke-linecap="round"/>`,
    aplaudiendo: `<path d="M90 98 Q100 92 110 98" fill="none" stroke="${C.cafe}" stroke-width="3.4" stroke-linecap="round"/><path d="M130 98 Q140 92 150 98" fill="none" stroke="${C.cafe}" stroke-width="3.4" stroke-linecap="round"/>`,
    pensando: `<circle cx="104" cy="98" r="4.4" fill="${C.cafe}"/><circle cx="144" cy="98" r="4.4" fill="${C.cafe}"/>`,
    animo: `<circle cx="100" cy="98" r="4.4" fill="${C.cafe}"/><circle cx="140" cy="98" r="4.4" fill="${C.cafe}"/>`,
  }[ex];
  const cejas = ex === 'pensando'
    ? `<path d="M88 84 Q100 74 114 82" fill="none" stroke="${A.blanco}" stroke-width="9" stroke-linecap="round"/><path d="M128 86 Q140 84 152 88" fill="none" stroke="${A.blanco}" stroke-width="9" stroke-linecap="round"/>`
    : `<path d="M88 86 Q100 80 114 86" fill="none" stroke="${A.blanco}" stroke-width="9" stroke-linecap="round"/><path d="M126 86 Q140 80 152 86" fill="none" stroke="${A.blanco}" stroke-width="9" stroke-linecap="round"/>`;
  const boca = {
    contento: `<path d="M108 136 Q120 142 132 136" fill="none" stroke="#3D2412" stroke-width="3.4" stroke-linecap="round"/>`,
    aplaudiendo: `<path d="M106 135 Q120 144 134 135" fill="none" stroke="#3D2412" stroke-width="3.4" stroke-linecap="round"/>`,
    pensando: `<path d="M110 137 H130" stroke="#3D2412" stroke-width="3.4" stroke-linecap="round"/>`,
    animo: `<path d="M108 136 Q120 141 132 135" fill="none" stroke="#3D2412" stroke-width="3.4" stroke-linecap="round"/>`,
  }[ex];
  return `
  <rect x="106" y="138" width="28" height="26" rx="8" fill="${A.pielSombra}"/>
  <circle cx="74" cy="104" r="9" fill="${A.piel}"/><circle cx="166" cy="104" r="9" fill="${A.piel}"/>
  <ellipse cx="120" cy="102" rx="46" ry="50" fill="${A.piel}"/>
  <path d="M84 104 q-3 4 -1 8 M156 104 q3 4 1 8" fill="none" stroke="${A.pielSombra}" stroke-width="2" stroke-linecap="round"/>
  ${cejas}${ojos}
  <path d="M120 98 Q112 114 122 116" fill="none" stroke="${A.pielSombra}" stroke-width="3" stroke-linecap="round"/>
  ${boca}
  <path d="M90 122 Q106 110 120 119 Q134 110 150 122 Q138 136 120 129 Q102 136 90 122 Z" fill="${A.blanco}" stroke="#D8D3CB" stroke-width="1.5"/>
  <ellipse cx="120" cy="66" rx="88" ry="15" fill="${A.paja}" stroke="${A.pajaSombra}" stroke-width="2.5"/>
  <path d="M80 66 Q80 18 120 18 Q160 18 160 66 Z" fill="${A.paja}" stroke="${A.pajaSombra}" stroke-width="2.5"/>
  <path d="M80 66 Q120 74 160 66 L160 50 Q120 58 80 50 Z" fill="${A.banda}"/>
  <path d="M92 30 Q120 24 148 30 M88 42 Q120 36 152 42" fill="none" stroke="${A.pajaSombra}" stroke-width="2" stroke-linecap="round"/>
  <path d="M40 66 Q120 84 200 66" fill="none" stroke="${A.pajaSombra}" stroke-width="2" opacity=".7"/>`;
};

const VARIANTES = ['contento', 'pensando', 'aplaudiendo', 'animo'];
const PERSONAJES = {
  granma: { nombre: 'Granma', cuerpo: granmaCuerpo, cara: granmaCara },
  abuelo: { nombre: 'El Abuelo', cuerpo: abueloCuerpo, cara: abueloCara },
};
for (const [id, p] of Object.entries(PERSONAJES)) {
  for (const v of VARIANTES) {
    writeFileSync(join(OUT, `${id}-${v}.svg`), svg('0 0 240 320', p.cuerpo(v) + p.cara(v), `${p.nombre}, ${v}`));
    writeFileSync(join(OUT, `${id}-cabeza-${v}.svg`), svg('50 0 140 170', p.cara(v), `${p.nombre}, cabeza ${v}`));
    writeFileSync(join(OUT, `${id}-cuerpo-${v}.svg`), svg('0 140 240 180', p.cuerpo(v), `${p.nombre}, cuerpo ${v}`));
  }
}
console.log('personajes listos en', OUT);
