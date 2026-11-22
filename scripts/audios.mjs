// Grabaciones del Abuelo (voz real de una persona).
//   node scripts/audios.mjs guion                      → docs/GUION-ABUELO.md (lo que hay que leer, numerado)
//   node scripts/audios.mjs procesar <carpeta|archivo> → limpia, empareja el volumen y guarda en assets/audio/abuelo/
//        opciones: --idioma es|en (por defecto es) · --desde N (número del guion con el que empieza lo grabado)
// <carpeta>: un archivo por frase, en el orden del guion (se ordenan por nombre: 01, 02, 03…).
// <archivo>: una sola grabación larga con una pausa de 2 segundos entre frase y frase; se corta sola en las pausas.
// Después: npm run build (arma data/audios.json y mete los audios al paquete «Consejos del Abuelo»).
import { execFileSync, spawnSync } from 'node:child_process';
import { mkdirSync, readdirSync, statSync, writeFileSync, existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { consejos } from './datos/consejos.mjs';
import { historia } from './datos/historia.mjs';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const SALIDA = join(RAIZ, 'assets', 'audio', 'abuelo');

/** El guion completo, en orden: primero los consejos, luego el consejo de cada capítulo. */
export const guion = () => [
  ...consejos.map((c) => ({ archivo: `consejo-${c.id}`, es: c.es, en: c.en })),
  ...historia.capitulos.map((c) => ({ archivo: `cap-${c.id}`, es: c.consejo.es, en: c.consejo.en })),
];

const [, , orden, ...resto] = process.argv;
const opcion = (n, d) => { const i = resto.indexOf(`--${n}`); return i < 0 ? d : resto[i + 1]; };

if (orden === 'guion') {
  const g = guion();
  const md = `# Guion del Abuelo: ${g.length} frases para grabar

Generado con \`node scripts/audios.mjs guion\`. No lo edites a mano: sale de \`scripts/datos/\`.

## Cómo grabar

1. Un cuarto callado y con cosas blandas (una recámara con cortinas, un clóset con ropa, o dentro del carro apagado). Sin tele, ventilador ni refrigerador cerca.
2. El celular a un palmo de la boca, un poco de lado (no soplarle de frente), apoyado en algo, no en la mano.
3. Tono: tranquilo, pausado, como quien aconseja a un nieto. Sin prisa y sin leer «cantadito».
4. Se lee **solo la frase**, no el número. Si sale mal, se repite: después se escoge la buena.
5. Dos formas, la que sea más cómoda:
   - **Una grabación por frase**, nombradas en orden: \`01\`, \`02\`, \`03\`…
   - **Una grabación larga**, dejando **2 segundos de silencio** entre frase y frase (y sin pausas largas a media frase).

## Frases

${g.map((x, i) => `${i + 1}. ${x.es}`).join('\n')}
`;
  writeFileSync(join(RAIZ, 'docs', 'GUION-ABUELO.md'), md);
  console.log(`docs/GUION-ABUELO.md: ${g.length} frases`);
} else if (orden === 'procesar') {
  const entrada = resto.find((a, i) => !a.startsWith('--') && !(resto[i - 1] || '').startsWith('--'));
  const idioma = opcion('idioma', 'es'), desde = +opcion('desde', 1);
  if (!entrada || !existsSync(entrada) || !['es', 'en'].includes(idioma) || !(desde >= 1)) { console.error('Uso: node scripts/audios.mjs procesar <carpeta|archivo> [--idioma es|en] [--desde N]'); process.exit(2); }
  const g = guion();
  // Limpieza: quita el retumbo grave y el soplido de fondo, recorta el silencio de las orillas y empareja el volumen
  // (−16 LUFS, lo habitual para voz en celular). No cambia el timbre ni el acento: la voz es la de la persona.
  const LIMPIA = 'highpass=f=70,afftdn=nf=-25,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.08,areverse,silenceremove=start_periods=1:start_threshold=-45dB:start_silence=0.25,areverse,loudnorm=I=-16:TP=-1.5:LRA=11';
  const ff = (args) => execFileSync('ffmpeg', ['-hide_banner', '-loglevel', 'error', '-y', ...args]);
  const dura = (f) => +execFileSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', f]).toString().trim();

  let tramos;                                       // [{ archivo, inicio?, fin? }]
  if (statSync(entrada).isDirectory()) {
    tramos = readdirSync(entrada).filter((f) => /\.(m4a|mp3|wav|aac|caf|ogg|opus|flac|mp4|mov|webm|3gp|amr)$/i.test(f))
      .sort((a, b) => a.localeCompare(b, 'es', { numeric: true })).map((f) => ({ archivo: join(entrada, f) }));
  } else {
    const log = spawnSync('ffmpeg', ['-hide_banner', '-i', entrada, '-af', 'silencedetect=noise=-38dB:d=1.2', '-f', 'null', '-'], { encoding: 'utf8' }).stderr;
    const total = dura(entrada), ini = [...log.matchAll(/silence_start: ([\d.]+)/g)].map((m) => +m[1]), fin = [...log.matchAll(/silence_end: ([\d.]+)/g)].map((m) => +m[1]);
    const cortes = []; let t = 0;
    ini.forEach((s, i) => { if (s - t > 0.4) cortes.push({ archivo: entrada, inicio: Math.max(0, t - 0.15), fin: s + 0.15 }); t = fin[i] ?? total; });
    if (total - t > 0.4) cortes.push({ archivo: entrada, inicio: Math.max(0, t - 0.15), fin: total });
    tramos = cortes;
  }
  const esperadas = g.length - (desde - 1);
  if (!tramos.length) { console.error('No encontré grabaciones.'); process.exit(1); }
  if (tramos.length > esperadas) { console.error(`Hay ${tramos.length} grabaciones y desde la frase ${desde} solo quedan ${esperadas} en el guion. Revisa que no haya repetidas o pausas largas a media frase.`); process.exit(1); }
  mkdirSync(SALIDA, { recursive: true });
  let avisos = 0;
  tramos.forEach((t, i) => {
    const frase = g[desde - 1 + i], destino = join(SALIDA, `${frase.archivo}.${idioma}.m4a`);
    ff([...(t.inicio != null ? ['-ss', String(t.inicio), '-to', String(t.fin)] : []), '-i', t.archivo, '-vn', '-af', LIMPIA, '-ac', '1', '-ar', '44100', '-c:a', 'aac', '-b:a', '64k', '-movflags', '+faststart', destino]);
    const s = dura(destino), palabras = frase[idioma].split(/\s+/).length, minimo = palabras * 0.18, maximo = palabras * 1.1 + 3;
    const raro = s < minimo ? ' ⚠ muy corta: ¿se cortó?' : s > maximo ? ' ⚠ muy larga: ¿trae dos frases o mucho silencio?' : '';
    if (raro) avisos++;
    console.log(`${String(desde + i).padStart(2)}. ${frase.archivo}.${idioma}.m4a  ${s.toFixed(1)} s${raro}  «${frase[idioma].slice(0, 60)}»`);
  });
  console.log(`\n${tramos.length} de ${g.length} frases listas${tramos.length < esperadas ? ` (faltan ${esperadas - tramos.length}: se siguen oyendo con la voz del dispositivo)` : ''}.${avisos ? ` ${avisos} con aviso: escúchalas.` : ''}`);
  console.log('El orden se da por bueno tal como viene: escucha dos o tres para confirmar que cada audio dice su frase. Luego: npm run build');
} else {
  console.error('Uso: node scripts/audios.mjs guion | procesar <carpeta|archivo> [--idioma es|en] [--desde N]'); process.exit(2);
}
