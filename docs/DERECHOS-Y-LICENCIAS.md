# Derechos y licencias de Granma Sazón

Revisión hecha sobre el contenido del repositorio. **No es asesoría legal**: es un inventario para que el dueño (y, si
la app se vende, un abogado) sepa qué hay, de quién es y qué falta. Se actualiza cada vez que entra algo de terceros.

## 1. Lo que es propio (creación original del proyecto)

| Qué | Dónde | Notas |
|---|---|---|
| Código de la app | `js/`, `css/`, `sw.js`, `scripts/` | Sin frameworks ni librerías (salvo el Oído, abajo) |
| Personajes Granma y el Abuelo, logo e íconos | `assets/personajes/`, `assets/logo/`, `assets/iconos/` | Dibujados por código (`scripts/gen-personajes.mjs`, `gen-logo.mjs`). No imitan personajes ni marcas existentes |
| Relatos, capítulos, consejos, cotorreos, vocabulario, glosarios | `scripts/datos/` | Escritos para la app. Los refranes son dichos populares de uso común, sin atribuir a personas |
| Recetas | `scripts/datos/recetas.mjs` | Redacción propia de platillos tradicionales (la lista de ingredientes de un platillo tradicional no tiene dueño; la redacción sí es nuestra) |
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

Solo el **Oído de Granma** (`assets/oido/`): Vosk y su modelo de inglés, licencia **Apache-2.0**. Detalle, titulares, huellas y
dónde consta cada licencia: `assets/oido/LICENCIAS.md`. Obligaciones que ya se cumplen: se distribuye el texto de la licencia
(`LICENSE-APACHE-2.0.txt`), se conserva el aviso de derechos, los archivos no se modificaron y los créditos aparecen en Perfil.
El modelo de **español 0.3 se retiró** porque su licencia no estaba a la vista; el 0.42 (Apache 2.0) queda pendiente de integrar.

## 4. Servicios que usa el teléfono (no son de la app)

| Servicio | Cuándo | Quién responde |
|---|---|---|
| Voces del teléfono (leer en voz alta) | Siempre que la voz está encendida | El sistema del teléfono; corre en el dispositivo |
| Reconocimiento de voz del teléfono | Solo si la persona elige «Que mi teléfono me escuche» | Apple o Google, con sus propias reglas de privacidad. La app pide permiso antes |
| WhatsApp (compartir) | Solo si la persona toca «compartir» | Abre WhatsApp con un texto; la app no envía datos por su cuenta |
| GitHub Pages (hospedaje) | Al abrir la app con internet | GitHub registra las visitas como cualquier hospedaje |

La app **no tiene cuentas, servidor propio, analítica, anuncios ni cookies de rastreo**. Todo el avance vive en el teléfono.

## 5. Privacidad y voz

- La voz nunca se guarda ni se sube desde la app. La grabación de práctica vive en memoria y se borra sola en 1 minuto.
- El aviso de privacidad está en Perfil, en español e inglés.
- **Voz real del Abuelo (pendiente):** quien grabe debe firmar un permiso por escrito para usar su voz en la app (alcance, tiempo y si es pagado).

## 6. Lo que le toca al dueño (no se puede resolver desde el código)

1. **Marca «Granma Sazón».** Buscarla y registrarla en el IMPI (clases 9 y 41, por ser app y educación) antes de invertir en publicidad.
   Si se va a ofrecer en Estados Unidos, buscar también en USPTO. Desde aquí no se pudo consultar ninguna de las dos bases.
2. **Aviso de privacidad integral y términos de uso** revisados por un abogado si la app se publica en tiendas, cobra, o se dirige a
   menores (en México, LFPDPPP; en Estados Unidos, COPPA para menores de 13 años).
3. **Tiendas de apps:** Apple y Google piden declarar el uso del micrófono y una política de privacidad en una dirección pública.
4. **Frase «¡Viva México!» y símbolos patrios:** la frase y los colores son de uso libre. El **Escudo y la Bandera** tienen reglas
   de uso (Ley sobre el Escudo, la Bandera y el Himno Nacionales); la app no los usa, y conviene no agregarlos.
5. **Licencias de Biblia con derechos** (RV1960, NTV, NLT): se piden por escrito a su titular (Sociedades Bíblicas Unidas para
   RV1960; Tyndale House para NTV/NLT). Suelen preguntar: nombre de la app, si es gratuita, cuántos versículos se muestran y si
   funcionará sin internet. Pasos técnicos en `docs/BIBLIA.md`.
6. **Modelo de voz en español 0.42:** bajarlo de la página oficial de modelos de Vosk y pasarlo para integrarlo (o abrir una sesión
   nueva en el entorno «Granma Sazon y Genesis», que ya permite ese sitio).

## 7. Regla para lo que venga

Nada de terceros entra sin: (a) licencia escrita o dominio público comprobable, (b) su fila en este documento, y (c) si es un archivo,
su huella en `assets/oido/LICENCIAS.md` o equivalente. Fotos, audios y música: solo propios o con permiso por escrito.
