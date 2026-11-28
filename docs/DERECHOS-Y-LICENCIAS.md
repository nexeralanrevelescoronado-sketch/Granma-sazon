# Derechos y licencias de Granma Sazón

Revisión hecha sobre el contenido del repositorio. **No es asesoría legal**: es un inventario para que el dueño (y, si
la app se vende, un abogado) sepa qué hay, de quién es y qué falta. Se actualiza cada vez que entra algo de terceros.

## 1. Lo que es propio (creación original del proyecto)

| Qué | Dónde | Notas |
|---|---|---|
| Código de la app | `js/`, `css/`, `sw.js`, `scripts/` | Sin frameworks ni librerías (salvo el Oído, abajo) |
| Personajes Granma y el Abuelo, logo e íconos | `assets/personajes/`, `assets/logo/`, `assets/iconos/` | Dibujados por código (`scripts/gen-personajes.mjs`, `gen-logo.mjs`). No imitan personajes ni marcas existentes |
| Relatos, capítulos, consejos, cotorreos, vocabulario, glosarios | `scripts/datos/` | Escritos para la app. Los refranes son dichos populares de uso común, sin atribuir a personas |
| Historia 2, pláticas, frases coloquiales y reglas | `scripts/datos/*.json` | Escritas para la app. Los versículos de la Historia 2 no se escriben: solo se guarda la cita y el texto se lee de RV1909/KJV. Los chistes de ejemplo son juegos de palabras populares, sin autor |
| Historia 3 y recetas de fiesta | `scripts/datos/historia3.json`, `recetas-fiestas.json` | Escritas para la app con los recuerdos del dueño. El verso de la piñata («Dale, dale, dale…») es un canto tradicional mexicano sin autor conocido; es la única letra de canción que se cita |
| Recetas | `scripts/datos/recetas.mjs` | Redacción propia de platillos tradicionales (la lista de ingredientes de un platillo tradicional no tiene dueño; la redacción sí es nuestra) |
| Ilustraciones de la Lotería | `assets/loteria/` | Generadas con IA (Figma, con el plan del dueño) a partir de descripciones propias de `docs/loteria-prompts.md`; sin texto, sin personajes ni marcas ajenas y sin parecerse a ninguna baraja comercial. En la app se rotulan «Ilustración generada con IA». Falta confirmar con los términos de Figma el uso comercial de lo generado |
| Animaciones, sonidos | `assets/animaciones/`, `js/sound.js` | Los sonidos se sintetizan en el teléfono: no hay archivos de audio ni música de terceros |
| Tipografías | — | Solo las del sistema del teléfono (Georgia, system-ui). No se distribuye ninguna fuente |
| Fotos | — | No hay fotos. Si se agregan, deben ser del dueño o con permiso por escrito |

## 2. Lo que es de dominio público

| Qué | Estado | Cuidado |
|---|---|---|
| Reina-Valera 1909 | Dominio público | El texto no se modifica (lo vigila `scripts/datos/biblia-huella.json`) |
| King James Version (1769) | Dominio público en casi todo el mundo | En el **Reino Unido** la Corona conserva una patente de impresión. Si algún día se vende ahí, revisar |
| World English Bible | Dominio público | «World English Bible» es una marca: se puede usar el nombre solo si el texto no se altera (no se altera) |

**No incluidas por tener derechos vigentes:** Reina-Valera 1960 (Sociedades Bíblicas), NTV y NLT (Tyndale House). El código para
conectarlas existe pero está apagado; ningún texto suyo está en el repositorio (lo vigila una prueba).

## 3. Lo que es de terceros (con licencia abierta)

Solo el **Oído de Granma** (`assets/oido/`): Vosk y sus modelos de inglés y español, licencia **Apache-2.0**. Detalle, titulares, huellas y
dónde consta cada licencia: `assets/oido/LICENCIAS.md`. Obligaciones que ya se cumplen: se distribuye el texto de la licencia
(`LICENSE-APACHE-2.0.txt`), se conserva el aviso de derechos, los archivos no se modificaron y los créditos aparecen en Perfil.
El modelo de español es el **0.42**, bajado de la página oficial, donde consta como Apache 2.0 (el 0.3 anterior se retiró porque su licencia no estaba a la vista).

## 4. Servicios que usa el teléfono (no son de la app)

| Servicio | Cuándo | Quién responde |
|---|---|---|
| Voces del teléfono (leer en voz alta) | Siempre que la voz está encendida | El sistema del teléfono; corre en el dispositivo |
| Reconocimiento de voz del teléfono | Solo si la persona elige «Que mi teléfono me escuche» | Apple o Google, con sus propias reglas de privacidad. La app pide permiso antes |
| WhatsApp (compartir) | Solo si la persona toca «compartir» | Abre WhatsApp con un texto; la app no envía datos por su cuenta |
| GitHub Pages (respaldo) | Solo si se abre la dirección de respaldo | GitHub registra las visitas como cualquier hospedaje |
| Cloudflare (hospedaje y recordatorio) | Al abrir la app, y solo si se activa el recordatorio diario | Cloudflare registra las visitas como cualquier hospedaje. El recordatorio guarda en una base propia (D1) la dirección de avisos del teléfono y la hora |
| Servicio de avisos del navegador | Solo con el recordatorio diario activado | Google, Apple, Mozilla o Microsoft entregan el aviso al teléfono. El aviso viaja sin contenido |
| Lotería en familia (opcional) | Solo si la persona crea una partida o entra con código | En la base D1 se guarda el apodo (no el nombre), cuántas cartas lleva y quién ganó; se borra solo a las 24 horas |
| Cuenta con Google (opcional) | Solo si la persona toca «Entrar con Google» | Google confirma que es ella (permiso `openid`: sin correo ni nombre). En la base D1 se guarda una huella del identificador de Google y el avance, sin el nombre de la constancia ni los avisos. Se borra con «Borrar mi cuenta» |

La app **no tiene analítica, anuncios ni cookies de rastreo**. El avance vive en el teléfono; solo si la persona entra con Google se guarda también en su cuenta (la única cookie es la de esa sesión, `HttpOnly`, y no rastrea).

**Datos que salen del teléfono**, solo si la persona los activa: (1) con los avisos, la dirección de avisos que genera su navegador, la hora y los días
elegidos, en UTC; (2) con la cuenta de Google, una huella de su identificador y su avance (código: `functions/api/cuenta/`). En los avisos: No se guarda nombre, correo, idioma ni avance; el texto del aviso lo arma el propio teléfono. Se borra al quitar el recordatorio,
al borrar el progreso, cuando el teléfono deja de existir para el servicio de avisos, o tras 7 días de fallos. Código: `servidor/avisos/`.

## 5. Privacidad y voz

- La voz nunca se guarda ni se sube desde la app. La grabación de práctica vive en memoria y se borra sola en 1 minuto.
- El aviso de privacidad y los términos se aceptan al empezar y están en Perfil (`#/privacidad`, `#/terminos`), en español e inglés. Responsable: Nexer Alan Reveles Coronado, privacidad@granmasazon.app.
- **Voz real del Abuelo (pendiente):** quien grabe debe firmar un permiso por escrito para usar su voz en la app (alcance, tiempo y si es pagado).

## 6. Lo que le toca al dueño (no se puede resolver desde el código)

1. **Marca «Granma Sazón».** Buscarla y registrarla en el IMPI (clases 9 y 41, por ser app y educación) antes de invertir en publicidad.
   Si se va a ofrecer en Estados Unidos, buscar también en USPTO. Desde aquí no se pudo consultar ninguna de las dos bases.
2. **Aviso de privacidad integral y términos de uso** revisados por un abogado (ahora con más razón: el recordatorio diario guarda un dato en un servidor) si la app se publica en tiendas, cobra, o se dirige a
   menores (en México, LFPDPPP; en Estados Unidos, COPPA para menores de 13 años).
3. **Tiendas de apps:** Apple y Google piden declarar el uso del micrófono y una política de privacidad en una dirección pública.
4. **Frase «¡Viva México!» y símbolos patrios:** la frase y los colores son de uso libre. El **Escudo y la Bandera** tienen reglas
   de uso (Ley sobre el Escudo, la Bandera y el Himno Nacionales); la app no los usa, y conviene no agregarlos.
5. **Licencias de Biblia con derechos** (RV1960, NTV, NLT): se piden por escrito a su titular (Sociedades Bíblicas Unidas para
   RV1960; Tyndale House para NTV/NLT). Suelen preguntar: nombre de la app, si es gratuita, cuántos versículos se muestran y si
   funcionará sin internet. Pasos técnicos en `docs/BIBLIA.md`.

## 7. Regla para lo que venga

Nada de terceros entra sin: (a) licencia escrita o dominio público comprobable, (b) su fila en este documento, y (c) si es un archivo,
su huella en `assets/oido/LICENCIAS.md` o equivalente. Fotos, audios y música: solo propios o con permiso por escrito.

## Lotería de Granma: cartas propias

El juego de la lotería es de todos, pero las imágenes y los versos de las barajas comerciales tienen dueño y marca. La Lotería de Granma usa
42 cartas propias: el dibujo es el emoji del teléfono (cada sistema dibuja el suyo, de uso libre para mostrar texto) y la palabra, con versos
inventados por Granma (`scripts/datos/loteria.json`). Una prueba vigila que no se cuelen versos conocidos de otras barajas.
