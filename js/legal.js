// Aviso de privacidad y términos de uso de Granma Sazón (español e inglés). Se aceptan al empezar el juego; si cambia la versión,
// la app los vuelve a mostrar para aceptarlos. Describen lo que la app hace DE VERDAD: si cambia algo de los datos, se cambia aquí.
// No es asesoría legal: conviene que un abogado lo revise antes de publicar en tiendas o de cobrar.
export const VERSION_LEGAL = '2026-11-27';
// Quién responde por la app. Lo pone el dueño (Ley Federal de Protección de Datos Personales en Posesión de los Particulares).
export const RESPONSABLE = { nombre: null, correo: null, domicilio: null };
const falta = (v, es) => v || (es ? '(pendiente)' : '(pending)');

const AVISO = (es) => {
  const R = RESPONSABLE, c = falta(R.correo, es);
  return es ? [
    ['Quién es responsable', `${falta(R.nombre, true)}, responsable de Granma Sazón (granmasazon.app). Domicilio: ${falta(R.domicilio, true)}. Contacto: ${c}.`],
    ['Lo que se guarda solo en tu teléfono', 'Tu avance, el idioma que aprendes, tu interés, si quieres que Granma te diga «mijo» o «mija», tu cuaderno, tus ajustes y tu nombre si lo escribes para la constancia. Todo eso vive en el almacenamiento de tu teléfono: no nos llega a nosotros y no lo podemos ver.'],
    ['Tu voz', 'El micrófono solo se usa mientras tú lo tocas para practicar. Con el «Oído de Granma», tu voz se reconoce dentro del teléfono, sin internet. Si te grabas, la grabación vive solo en la memoria del teléfono y se borra sola en 1 minuto. Si eliges «que mi teléfono me escuche», quien procesa tu voz es el servicio de voz de tu teléfono (Apple o Google), con sus propias reglas.'],
    ['Avisos de Granma (solo si los activas)', 'Para mandarte los avisos que elijas, el servidor de Granma Sazón (en Cloudflare) guarda la dirección de avisos que genera tu navegador, la hora y los días. No guarda tu nombre, tu idioma ni tu avance: el texto del aviso lo arma tu propio teléfono. Se usa solo para enviarte esos avisos.'],
    ['Visitas a la página', 'Como cualquier sitio, el hospedaje (Cloudflare) recibe datos técnicos de cada visita, como la dirección de internet y el tipo de navegador, para funcionar y protegerse de abusos.'],
    ['Para qué NO usamos tus datos', 'No hay publicidad, ni analítica, ni cookies de rastreo. No vendemos ni rentamos datos, y no armamos perfiles de nadie.'],
    ['Con quién se comparten', 'Solo con quienes hacen posible el servicio: Cloudflare (hospedaje y avisos) y el servicio de avisos de tu navegador (Google, Apple, Mozilla o Microsoft), que entrega el aviso sin ver su contenido porque viaja vacío. Con nadie más.'],
    ['Tus derechos', `Puedes quitar los avisos cuando quieras en Mi perfil y se borran del servidor en ese momento. «Borrar mi progreso» elimina todo lo guardado en tu teléfono y también quita los avisos. Para acceder, corregir, cancelar u oponerte al uso de tus datos (derechos ARCO), o para cualquier duda, escribe a ${c}.`],
    ['Niñas y niños', 'Granma Sazón es para toda la familia. Si eres menor de edad, usa la app con permiso y compañía de tu papá, tu mamá o la persona que te cuida, y que sea una persona adulta quien decida si se activan los avisos.'],
    ['Cambios', 'Si este aviso cambia, la app te lo mostrará otra vez para que lo leas y lo aceptes.'],
  ] : [
    ['Who is responsible', `${falta(R.nombre, false)}, responsible for Granma Sazón (granmasazon.app). Address: ${falta(R.domicilio, false)}. Contact: ${c}.`],
    ['What stays only on your phone', 'Your progress, the language you are learning, your interest, whether Granma calls you "mijo" or "mija", your notebook, your settings and your name if you type it for the certificate. All of that lives in your phone\'s storage: it never reaches us and we cannot see it.'],
    ['Your voice', 'The microphone is only used while you tap it to practice. With "Granma\'s ear", your voice is recognized inside your phone, offline. If you record yourself, the recording lives only in the phone\'s memory and deletes itself in 1 minute. If you choose "let my phone listen", your voice is processed by your phone\'s speech service (Apple or Google), under their own rules.'],
    ['Granma\'s notifications (only if you turn them on)', 'To send you the notifications you choose, the Granma Sazón server (on Cloudflare) stores the notification address your browser generates, the time and the days. It does not store your name, language or progress: your own phone writes the notification text. It is only used to send you those notifications.'],
    ['Visits to the page', 'Like any website, the host (Cloudflare) receives technical data from each visit, such as the internet address and browser type, to work and to protect itself from abuse.'],
    ['What we do NOT use your data for', 'There is no advertising, analytics or tracking cookies. We do not sell or rent data, and we do not build profiles of anyone.'],
    ['Who it is shared with', 'Only with those who make the service possible: Cloudflare (hosting and notifications) and your browser\'s notification service (Google, Apple, Mozilla or Microsoft), which delivers the notification without seeing its content because it travels empty. No one else.'],
    ['Your rights', `You can turn off the notifications any time in My profile and they are deleted from the server right away. "Delete my progress" removes everything stored on your phone and also turns off the notifications. To access, correct, cancel or object to the use of your data, or for any question, write to ${c}.`],
    ['Children', 'Granma Sazón is for the whole family. If you are a minor, use the app with permission and company from your mom, your dad or the person who takes care of you, and let an adult decide whether to turn on notifications.'],
    ['Changes', 'If this notice changes, the app will show it to you again so you can read it and accept it.'],
  ];
};
const TERMINOS = (es) => es ? [
  ['Qué es', 'Granma Sazón es una app gratuita para aprender inglés y español con historias, recetas mexicanas y consejos. Es para uso personal y familiar.'],
  ['En la cocina', 'Cocina con cuidado. Lo que tenga fuego, aceite caliente, horno, vapor o cuchillos, hazlo con una persona adulta. Revisa los ingredientes si tienes alergias (por ejemplo, nueces). Las recetas no son consejo médico ni de nutrición.'],
  ['El contenido', 'Las historias, los personajes, los dibujos y los textos de Granma Sazón son de su titular. Puedes usarlos para aprender y compartirlos con tu familia y amigos diciendo que son de Granma Sazón, pero no venderlos ni publicarlos como tuyos. La Biblia que trae la app (Reina-Valera 1909, King James y World English Bible) es de dominio público, y el «Oído de Granma» usa programas con licencia abierta (Apache 2.0).'],
  ['Lo opcional', 'La voz, el micrófono y los avisos son opcionales: puedes jugar sin ellos y apagarlos cuando quieras.'],
  ['Cómo se ofrece', 'Hacemos lo posible para que la app funcione bien, también sin internet, pero se ofrece tal como está y puede tener errores. Si algo falla, avísanos.'],
  ['Cambios', 'La app puede cambiar o mejorar. Si cambian estos términos, la app te los mostrará otra vez para aceptarlos.'],
  ['Leyes', 'Estos términos se rigen por las leyes de México.'],
] : [
  ['What it is', 'Granma Sazón is a free app to learn English and Spanish with stories, Mexican recipes and advice. It is for personal and family use.'],
  ['In the kitchen', 'Cook carefully. Anything with fire, hot oil, an oven, steam or knives, do it with an adult. Check the ingredients if you have allergies (for example, nuts). The recipes are not medical or nutrition advice.'],
  ['The content', 'The stories, characters, drawings and texts of Granma Sazón belong to its owner. You may use them to learn and share them with family and friends saying they are from Granma Sazón, but not sell them or publish them as your own. The Bible in the app (Reina-Valera 1909, King James and World English Bible) is in the public domain, and "Granma\'s ear" uses open-license software (Apache 2.0).'],
  ['What is optional', 'Voice, microphone and notifications are optional: you can play without them and turn them off any time.'],
  ['How it is offered', 'We do our best for the app to work well, offline too, but it is offered as is and may have errors. If something fails, let us know.'],
  ['Changes', 'The app may change or improve. If these terms change, the app will show them to you again to accept them.'],
  ['Law', 'These terms are governed by the laws of Mexico.'],
];

const lista = (secciones) => secciones.map(([t, p]) => `<h3>${t}</h3><p>${p}</p>`).join('');
/** El texto completo, en el idioma dado ('es' o 'en'). */
export const avisoHTML = (idioma) => lista(AVISO(idioma === 'es'));
export const terminosHTML = (idioma) => lista(TERMINOS(idioma === 'es'));
/** Lo esencial en 4 renglones, para la pantalla de aceptar. */
export const resumen = (es) => es
  ? ['Tu avance, tu nombre y tus ajustes se guardan solo en tu teléfono.', 'Tu voz no se guarda ni sale de tu teléfono (salvo que elijas el servicio de voz de tu teléfono).', 'Los avisos son opcionales; si los activas, el servidor guarda solo la dirección de avisos, la hora y los días.', 'Sin publicidad, sin analítica y sin vender datos.']
  : ['Your progress, name and settings are stored only on your phone.', 'Your voice is not saved and does not leave your phone (unless you choose your phone\'s speech service).', 'Notifications are optional; if you turn them on, the server stores only the notification address, the time and the days.', 'No advertising, no analytics and no selling of data.'];
export const responsableListo = () => !!(RESPONSABLE.nombre && RESPONSABLE.correo && RESPONSABLE.domicilio);
