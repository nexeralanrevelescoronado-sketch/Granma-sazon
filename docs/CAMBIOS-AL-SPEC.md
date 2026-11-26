# Cambios frente al SPEC original

`SPEC.md` se conserva tal como se entregó. Esta nota registra lo que el dueño pidió después y cómo quedó, para que todo sea consistente.

| Tema | SPEC original | Cómo está hoy | Por qué |
|---|---|---|---|
| Historia 1 | 5 capítulos, «su niñez en México» | **6 capítulos**, «La vida de Granma en México» | Se agregó «La noche de las posadas»; los capítulos 5 y 6 ya son de su vida adulta, así que el título y la constancia dejaron de decir «niñez» |
| Recetas | Mole, pozole, champurrado y buñuelos | Las 4 más **ponche navideño** (capítulo 6) | Cada capítulo enseña una receta |
| Constancia | Al terminar la historia | Pide los **6 capítulos**; dice «La vida de Granma en México» | Consistencia con la historia |
| Vidas | «Tortillitas» como vidas | **Energía del día: 10 tortillitas.** Cada error se come una. Con **más de 10 errores** se acaba la energía y la lección o prueba **se repite mañana** | Pedido del dueño: que no se pierda el contexto. Ya no se regeneran durante el día ni se ganan repasando |
| Pruebas | No existían | **Pruebas pequeñas y acumulativas** después de cada capítulo | Pedido del dueño: preguntar lo aprendido, primero en español y después en inglés |
| Personajes y voz | 4 variantes | 5 estados por personaje, habla con efecto de escritura y voz opcional | Segundo SPEC de personajes |
| Gesto del Abuelo | «Aconsejando (dedo levantado)» | **Mano abierta levantada** (palma, cuatro dedos y pulgar) | Pedido del dueño: un dedo solo se puede malinterpretar. Ningún personaje dibuja un dedo solo (lo vigila una prueba) |
| Voz | Opcional, apagada por defecto | **Encendida por defecto**; se apaga con 🗣. El Abuelo habla grave y pausado (voz de hombre si el dispositivo la tiene); Granma, cálida | Pedido del dueño: que el Abuelo se escuche como abuelo sabio |
| Vocabulario por interés | El interés «personaliza vocabulario y ejemplos» | Cada capítulo suma **3 palabras propias por interés**, con su frase | Antes solo cambiaban las frases |
| Animaciones | Confeti, aplausos, asentir | Módulo `assets/animaciones/` (ver README) | SPEC de animaciones y su revisión |

## Energía (tortillitas)

- 10 por día (`MAX_VIDAS` en `js/state.js`). Se usan en las **lecciones** y en las **pruebas**.
- Con 10 errores todavía se puede seguir; el error número 11 agota la energía.
- Al agotarse: la lección o prueba en curso queda marcada para **repetirse al día siguiente** (el inicio lo muestra primero: «Hoy repetimos…»). No se bloquea el resto de la app.
- **No gastan energía:** leer el relato, las recetas, los consejos, el cotorreo, la Biblia, el repaso de palabras y el reto de 60 segundos.
- El tono sigue siendo el del SPEC: Granma anima («eso también es aprender») y el Abuelo aconseja sin regañar.

## Pruebas

- Una por capítulo, disponible al terminarlo (`#/prueba/N`, estrella en el mapa). **No bloquean** el capítulo siguiente.
- **Acumulativas:** mitad del capítulo actual y mitad de repaso de los anteriores, con las frases del interés elegido.
- **Dos partes:** primero cada palabra y frase se pregunta en el idioma que la persona ya habla (español, si aprende inglés) y después en el idioma que aprende. Para quien aprende español es al revés.
- **Crecen:** de 5 palabras y 2 frases (14 preguntas) en la prueba 1 a 8 palabras y 5 frases (26 preguntas) desde la prueba 4.
- Se aprueba con 70 %; 1, 2 o 3 estrellas (70 %, 80 %, 90 %). Se puede repetir; se guarda el mejor resultado.

## Voz de los abuelos

- Usa las voces instaladas en el dispositivo (Web Speech API): no se descarga ni se envía nada. `js/voz.js` elige, para el Abuelo, una voz de hombre en español de México si existe, con tono grave y ritmo lento; para Granma, una voz de mujer.
- **Límite real:** con voces del sistema no se puede elegir un acento regional (por ejemplo, de los Altos de Jalisco) ni un timbre de abuelo de verdad; depende de lo que traiga cada teléfono, y en algunos solo hay una voz en español.
- **Para tener esa voz de verdad** hace falta audio grabado por una persona (o una voz con licencia). El contenido ya está listo para eso: son 45 consejos y 6 consejos de capítulo; se pueden grabar y servir como archivos de audio dentro del paquete «Consejos del Abuelo».

### Grabaciones con voz real (listo para recibirlas)

- El guion está en `docs/GUION-ABUELO.md` (51 frases). `node scripts/audios.mjs procesar <carpeta|archivo>` corta, limpia el ruido, empareja el volumen y guarda en `assets/audio/abuelo/`; `npm run build` las mete al paquete «Consejos del Abuelo» (suenan sin internet).
- En la app, si la frase del Abuelo tiene grabación se oye esa (aunque la persona esté aprendiendo inglés: el Abuelo habla con su voz, en español); si no hay o no carga, sigue la voz del dispositivo.
- La voz debe ser de una persona que dio su permiso por escrito para usarla en la app. No se usa la voz de nadie sin permiso ni voces de otras marcas.

## Glosario al toque, hablar y más juego

- **Glosario al toque** (`js/glosario.js`): al tocar cualquier palabra del idioma que se aprende sale una burbuja con su significado y 🔊. Sirve en relatos, consejos, cotorreos, frases de los ejercicios y versículos. La fuente es `scripts/datos/glosario/en.json` y `es.json` (una entrada por cada forma que aparece en el contenido); una prueba falla si se agrega contenido con una palabra sin glosa. El texto de la Biblia no está glosado completo: ahí solo salen las palabras que coinciden.
- **Mi cuaderno** (Perfil): las últimas palabras que la persona tocó.
- **Dilo en voz alta** (`js/oido.js`): 2 ejercicios por lección. Si el navegador reconoce voz, compara lo dicho con la frase (con 6 de cada 10 palabras se da por bueno). Si no puede (sin internet, sin permiso o sin esa función), la persona se graba y se escucha, o lo dice y sigue. Nunca quita energía y se puede saltar con «Ahora no puedo hablar».
- **Privacidad:** la app no guarda ni sube audio. La primera vez pregunta cómo practicar: «que mi teléfono me escuche» (usa el servicio de voz del teléfono, de Apple o Google, que procesa la voz fuera del teléfono) o «solo grabarme» (nada sale del teléfono). La grabación de práctica vive en memoria y se borra sola en 1 minuto o al pasar de ejercicio. Se cambia en Perfil, donde también está «Probar mi micrófono» y el aviso de privacidad. No es asesoría legal: si la app se publica en tiendas o para menores, conviene que un abogado revise el aviso.
- **Más juego:** la lección pasa de 5 a 9 ejercicios (se suman «¿Qué escuchaste?», deletrear con fichas y los 2 de voz), racha de aciertos 🔥 con sonido que sube y puntos extra, y estrellas al cerrar el capítulo.

## Pendiente (recordar al dueño)

- **Voz real del Abuelo:** grabar las 51 frases de `docs/GUION-ABUELO.pdf` y pasarlas para integrarlas. El dueño pidió dejarlo para después y que se le recuerde.

## Biblia: texto intacto y glosario formal

- **Versión en español: Reina-Valera 1909** (dominio público). La **Reina-Valera 1960 no se puede incluir**: tiene derechos vigentes (Sociedades Bíblicas en América Latina, renovados por Sociedades Bíblicas Unidas) y pide licencia. Si algún día se consigue por escrito, entra por el mismo camino previsto para NTV/NLT (`docs/BIBLIA.md`).
- **El texto no se toca.** `scripts/datos/biblia-huella.json` guarda la huella (SHA-256) de RV1909, KJV y WEB tal como se bajaron de sus fuentes; `npm test` falla si cambia una sola letra.
- **Glosario bíblico aparte y completo** (paquete «Biblia»): solo el significado de la palabra, formal, sin bromas ni interpretación. Cubre **todas** las palabras de RV1909, KJV y WEB (una prueba falla si falta una). Tiene tres capas: (1) base revisada (`biblia-en.json`, `biblia-es.json`); (2) lotes glosados palabra por palabra (`biblia-*-resto.json`); (3) lo deducido por `scripts/glosario-biblia-auto.mjs` (`biblia-*-auto.json`): nombres propios emparejados versículo por versículo entre el español y el inglés, y formas de palabras ya glosadas (posesivos, formas antiguas, plurales, verbos con pronombre pegado). Las glosas deducidas dicen de qué palabra vienen («forma antigua de «deny»: negar»). Las capas 2 y 3 no se revisaron una por una: si alguna glosa se ve rara, se corrige en su archivo.

## Verificador propio de voz («que me escuche Granma, aquí en mi teléfono»)

- Corre entero en el teléfono, en vivo, sin internet y sin servicio de terceros (`js/oido.js`: `grabar`, `analizarVoz`, `silabas`). Funciona en el navegador y con la app en la pantalla de inicio: solo necesita el permiso del micrófono.
- **Qué comprueba:** que la persona sí habló, que dijo la frase completa (cuenta los golpes de voz y los compara con las sílabas de la frase) y que no se quedó a medias. El micrófono se mueve con su voz y se detiene solo al terminar. Luego puede oírse y compararse con 🔊.
- **Qué no hace:** no reconoce palabras ni califica la pronunciación. Eso solo lo hace un servicio de voz (el del teléfono, que sigue disponible si la persona lo elige) o un modelo de reconocimiento, que pesa decenas de MB y sería una librería de terceros.
- Los tres caminos conviven: servicio de voz del teléfono (con permiso) → verificador propio → decirlo en voz alta sin micrófono.

## Oído de Granma: reconocimiento de palabras dentro del teléfono

- **Qué es:** paquetes opcionales «Oído de Granma: inglés» (≈ 45 MB) y «español» (≈ 44 MB) en Descargas. El de español usa el modelo 0.42, con licencia Apache 2.0 publicada (ver `assets/oido/LICENCIAS.md`). Con el paquete, el modo «Granma, en mi teléfono» reconoce las palabras sin internet y sin enviar la voz a nadie (`js/oido-propio.js`). Funciona igual en el navegador y con la app instalada.
- **Librería:** Vosk compilado a WebAssembly (`vosk-browser` 0.0.8) y sus modelos pequeños, todo con licencia **Apache-2.0** (`assets/oido/LICENCIAS.md`). Es la única librería de terceros de la app y no cuenta para la meta de 50 MB.
- **Cómo oye:** en vivo, palabra por palabra (cada palabra reconocida se pinta de verde y suena). Corren dos reconocedores: uno guiado por la frase y uno libre. Con 6 de cada 10 palabras se da por bueno.
- **Calificación de pronunciación:** al reconocedor se le dan también palabras «rivales» que suenan parecido (bread → bed, red; kitchen → chicken; love → live), así que tiene que elegir cuál oyó. Cada palabra queda **clara** (verde), **casi** (amarilla, con la pista «sonó como bed») o **falta**, y la frase recibe de 1 a 3 estrellas.
- **Límites:** (1) califica qué palabra se oyó y con cuánta seguridad; no mide cada sonido ni el acento (para eso hace falta un modelo de fonemas, que pesa cientos de MB); (2) se probó con voz sintética en el navegador de pruebas, no en un iPhone ni con acentos reales; (3) palabras que el modelo no conoce (mijo, champurrado) no se pueden reconocer y no cuentan en contra si el resto sale.
- **Fiesta:** cuando la app sí oyó la frase: «¡Viva México!» (sonido, voz de Granma y confeti tricolor). Al cerrar el capítulo, Granma avienta tortillas hacia la persona y dice «¡Te ganaste 1 kilo de tortillas hechas con mucho amor, mijo!»; los kilos se suman en el perfil.

## Arranque a prueba de fallas (iPhone nuevo que se quedaba «cargando»)

- **Qué pasó:** varios iPhone que abrían la app por primera vez se quedaban en la pantalla de carga. No se pudo reproducir en Chromium (ni con red y procesador lentos, ni quitando funciones del navegador); el sitio publicado era idéntico al del repositorio. La causa exacta en Safari no se pudo confirmar desde el entorno de desarrollo, así que se cerraron todas las puertas conocidas y se agregó una red de seguridad.
- **Vigilante** (`index.html`): si la app no abre en 8 s, o un archivo no carga, se repara sola una vez (quita el service worker y la caché del núcleo y recarga); si sigue sin abrir, muestra «No pude abrir la app», un botón «Reintentar» y el detalle técnico (modelo de iOS y archivos que fallaron). Con un iPhone demasiado viejo (sin soporte de módulos o de sintaxis moderna) avisa que hay que actualizar iOS.
- **Service worker** (`sw.js`): ya no toma el control a media carga; se registra hasta 3 s después de que la app abrió y toma el control más tarde, cuando la página lo pide. El código (js/css/html) ya no se refresca archivo por archivo en segundo plano (podía mezclar versiones viejas con nuevas); solo cambia con una versión nueva.
- **Prueba** (`scripts/qa-primera-vez.mjs`): abre la app de primera vez con funciones del navegador desactivadas, y comprueba que un archivo que falla una vez se repara solo y que uno que falla siempre muestra el mensaje con el motivo.
- **Si vuelve a pasar:** pedir una captura de la pantalla «No pude abrir la app»: el detalle técnico dice qué falló.
- **Página en blanco con la barra de carga detenida** (captura del 24 nov): al teléfono no le llegaba ni el HTML. El service worker de una visita anterior esperaba a la red sin límite al pedir la página. Ahora la navegación usa la respuesta adelantada del navegador y, si la red no contesta en 4 s, sirve la copia guardada; además busca primero en el núcleo y no en los paquetes grandes. Lo prueba `qa-primera-vez.mjs` («red colgada»). Si le pasa a alguien que **nunca** había abierto la app, el problema es de su red hacia github.io (probar con Wi-Fi o con datos) y la salida sería hospedar la app en otro dominio.

## Publicación en Cloudflare Pages (para que abra también con datos móviles)

- **Por qué:** varios iPhone no abrían la app con datos móviles y sí con Wi-Fi: el camino de su operador hacia `github.io` falla. Cloudflare tiene servidores en México y es mucho menos probable que un operador lo bloquee (no se puede garantizar).
- **Cómo:** `node scripts/publicar-pages.mjs` arma `dist/`. Pages no acepta archivos de más de 25 MiB, así que los modelos del Oído se publican partidos en pedazos de 4 MiB (`assets/oido/partes/`) y `functions/assets/oido/[archivo].js` los junta en la misma dirección de siempre, respetando Range. Los pedazos miden lo mismo que los que pide la app al descargar, así cada petición es un pedazo entero. `_routes.json` hace que solo esas dos rutas usen la función; todo lo demás es estático. No hace falta R2 ni ningún token.
- **Probado** con el simulador oficial (wrangler 4): rangos y archivo completo idénticos byte por byte al original, descarga del Oído desde la pantalla Descargas y reconocimiento de una frase.
- **Plan gratis** (verificado en la documentación de Cloudflare): Pages 20,000 archivos y 25 MiB por archivo; las peticiones a archivos estáticos son gratis e ilimitadas; la función solo corre al bajar los modelos.
- GitHub Pages sigue publicándose igual; los dos sitios funcionan a la vez.

## Dominio propio: granmasazon.app (26 nov)
- Registrado en Cloudflare (1.er año 8.20 USD; renueva a 14.20 USD/año, renovación automática). Conectado al proyecto de Pages `granma-sazon` con un CNAME en la zona.
- Canonical, Open Graph, `sitemap.xml`, `robots.txt` y recetas apuntan a `https://granmasazon.app/` (fuente: `scripts/sitio.mjs`).
- `granma-sazon.pages.dev` redirige a `granmasazon.app` con un script al inicio de `index.html` (solo en ese host; conserva ruta y hash). Quien llegue por la dirección vieja pierde su avance local, que vive en el teléfono por dirección.

## Aprender hablando y escuchando, modo perezoso, porras y turnos de voz (26 nov)

Pedido por el dueño. Todo es código propio, sin librerías ni archivos de terceros.

- **Sección nueva «Hablar»** (`#/hablar`, en la barra justo antes de Biblia; `js/vistas/hablar.js` y `js/escucha.js`): rondas de 8 ejercicios de puro oído y voz con las palabras y frases de los capítulos que la persona ya abrió (y las de su interés). Cuatro formas: **Escucha y elige** (se oye una palabra y se escoge cuál fue o qué significa; la palabra no se muestra), **Escucha y repite** (decir en voz alta, con el Oído de Granma si está descargado), **Escucha y arma la frase** (dictado) y **De todo un poco**. No gasta energía y da XP.
- **Modo perezoso** (`js/lento.js`): junto a **cada** bocina 🔊 de la app aparece sola otra con un perezoso y el letrero «modo perezoso», que dice lo mismo despacio (velocidad × 0.62; las grabaciones del Abuelo a 0.78). El perezoso es un dibujo SVG propio, no un emoji, para que se vea igual en todos los teléfonos.
- **Voces más pausadas:** Granma pasó de 0.90 a 0.84 y el Abuelo de 0.80 a 0.76.
- **Parejas con voz:** al tocar la palabra del idioma que se aprende, se oye (inglés para quien aprende inglés, español para quien aprende español). Se apaga con el botón 🗣.
- **Turnos:** entre que habla Granma y habla el Abuelo (o al revés) pasan **5 segundos como mínimo**; entre dos globos de la misma persona, 0.7 s. Mientras espera, el globo no aparece. Si la pantalla cambia, el globo que hablaba se calla (antes podía seguir hablando encima de lo nuevo). Solo aplica con la voz encendida.
- **Porras** (`js/porras.js`): al completar una lección, una prueba aprobada, un reto, un repaso, una receta o una ronda de Hablar, Granma grita «¡Épale!» con una porra (6, van en orden), lo dice en voz alta y anuncia el premio: el kilo de tortillas en la lección y **«¡Te ganaste unos taquitos de barbacoa, mijo!»** en lo demás.
- **Tortillas estrelladas** (`assets/animaciones/fiesta.js`): de las que avienta Granma, 2 o 3 se estrellan contra la pantalla, quedan pegadas medio saliéndose por la orilla, resbalan y caen (con un «plaf» y una vibración corta). Solo `transform` y `opacity`, una vez; con «reducir movimiento» no vuela nada.
- **Lo que se dejó igual a propósito:** la Biblia no lleva porras ni tortillas (se pidió formal), y los mini-ejercicios de una sola pregunta de Consejos y Cotorreo tampoco, para que la fiesta no canse.
- **De paso:** el botón «Comprobar» ya no flota translúcido encima de la barra de abajo.
- **Pruebas:** `npm test` (32) y `node scripts/qa-escucha.mjs` en navegador real a 360, 390 y 1280 px (voz simulada que anota texto, idioma, velocidad y momento).
- **Palabras coloquiales explicadas** (`js/coloquial.js`): debajo de cada porra hay un recuadro «¿Qué significa «¡Épale!»?» que explica, en el idioma de la persona, qué quiere decir, de dónde es y cuándo se usa (y cuándo no) cada palabra coloquial de esa porra: «épale», «ándale», «mijo/mija» y la porra «a la bio, a la bao». También entraron al glosario al toque, en los dos idiomas. Es la base para la sección de habla regional que pidió el dueño.

## Historia 2, pláticas, frases coloquiales y reglas (26 nov)

Pedido por el dueño. El contenido lo escribieron seis ayudantes con la skill `contenido-granma` y un guion fijo; se revisó a mano antes de integrarlo.

- **Historia 2: «Granma a los 25: cómo conocí a Dios»** (`scripts/datos/historia2.json` → `data/historia2.json`; capítulos 7 a 12, mapa en `#/historia/2`). Granma cuenta en primera persona cómo su mamá le hablaba de Dios y de Jesús, cómo ella no creía y cómo empezó a hablar con Dios. La fe entra poco a poco (el primer capítulo no trae versículo), desde una relación y no desde reglas; se anima a hablar lo difícil con la familia y los amigos, a acompañar a los demás en sus debilidades y, sin presión, a leer la Biblia. «Sanidad» es consuelo del corazón: no se prometen curas físicas ni dinero.
  - **Versículos:** cada capítulo guarda solo la cita (`versiculo`). El texto se lee de `data/biblia/` (Reina-Valera 1909 y KJV, dominio público) y se muestra en una tarjeta formal, sin botones ni ejercicio. Una prueba vigila que el relato no copie el versículo.
  - **Es sobria** (`sobria: true`): al terminar un capítulo o su prueba no hay porra, confeti ni tortillas; Granma agradece con calma. Los ejercicios son de vocabulario, no de versículos.
  - El primer capítulo de cada historia está abierto; la Historia 2 no exige terminar la 1. La constancia sigue siendo de la Historia 1.
- **Platica con Granma** (`#/platica`, `data/platicas.json`, 14 temas): Granma saca conversación; la persona escoge qué contestar (se oye cómo suena) y Granma responde alegre. No hay respuestas malas ni energía. En «un día pesado» escucha y anima a platicarlo con alguien de confianza y a pedir ayuda. También se entra desde el inicio.
- **Así se habla** (`#/asi`, `data/coloquial.json`, 94 frases): para quien aprende español, México por región (todo el país, Jalisco y Guadalajara, Sinaloa y Mazatlán, Ciudad de México, Monterrey) y cómo funciona el humor mexicano; para quien aprende inglés, el inglés de todos los días, frases hechas, humor y regiones. Cada frase dice qué significa, cuándo se usa y cuándo no, con un ejemplo que se oye. Solo expresiones sanas: quedaron fuera las que son o vienen de una grosería. **El dueño debe revisar las de Jalisco y las demás regiones antes de darlas por definitivas.**
- **Reglas claras** (`#/reglas`, `data/reglas.json`, 12 lecciones): seis para quien aprende inglés (empieza por el verbo «to be») y seis para quien aprende español (empieza por ser y estar; tú y usted, género, diminutivos, signos y acentos, presente). Se explican en el idioma de la persona, con ejemplos y cuatro preguntas de práctica.
- **Glosario al toque:** pasó de 1,229 a 2,519 palabras en español y de 1,126 a 2,032 en inglés; toda palabra del contenido nuevo tiene su glosa (`node scripts/glosario-faltan.mjs <archivo>` dice cuáles faltan, sin IA).
- **Guion del Abuelo:** ahora son 57 frases (se sumaron los 6 consejos de la Historia 2); `docs/GUION-ABUELO.md` y `.pdf` regenerados.
- **Pruebas:** `npm test` (34) y `node scripts/qa-historia2.mjs` en navegador real.

## Historia 3 «Las fiestas de mi familia» y ocho recetas de fiesta (26 nov)

Pedido por el dueño, con sus propios recuerdos como guion. Lo escribieron cuatro ayudantes con la skill `contenido-granma`; se revisó a mano.

- **Historia 3** (`scripts/datos/historia3.json` → `data/historia3.json`; capítulos 13 a 18, mapa en `#/historia/3`): la rosca y el monito (todos expectantes mientras la abuelita prepara chocolate caliente y café), los tamales de la Candelaria (los hacen entre todos), las piñatas (dos o tres golpes sin romperla, y el hermano mayor que la rompe de un solo movimiento), los quince años en Durango con la birria de la abuelita, los chiles en nogada de septiembre y el pipián de los domingos. La idea que la atraviesa: esas fiestas reunían a la familia. Es alegre: lleva porras y tortillas como la Historia 1.
  - **Puebla y Durango:** Granma creció en un rancho de Puebla (Historia 1); su abuelita vivía en Durango y la familia viajó allá para los quince años. Así no choca con lo ya publicado.
  - **Verso de la piñata:** «Dale, dale, dale, no pierdas el tino, porque si lo pierdes, pierdes el camino» es un canto tradicional sin autor; va completo, y en inglés con su sentido. No se cita ninguna otra canción.
  - **Chiles en nogada:** se dice que son de Puebla, de septiembre y con los colores de la bandera. No se cuenta la leyenda de su origen ni se dan años o nombres históricos (una prueba lo vigila).
  - En inglés, «monito» es la figurita de la rosca (no «monkey»).
- **Ocho recetas** (`scripts/datos/recetas-fiestas.json`, se suman a las cinco de siempre): rosca de Reyes, tamales, chocolate caliente, enchiladas, birria, chiles en nogada, chiles rellenos y pipián. Medidas exactas, pasos con cronómetro, aviso de pedir ayuda a un adulto, cuidado con los chiles y aviso de alergia a nueces en la nogada. En la rosca, la figurita (apta para alimentos) se mete ya fría por abajo y se avisa a los invitados. En la lista van juntas bajo «Las recetas de las fiestas».
- **La app admite tres historias:** `historiaN`, `mapaDe` y `historiaDe` en `js/datos.js`; desde cada mapa se asoman las otras dos.
- **Glosario:** 2,971 palabras en español y 2,363 en inglés. **Guion del Abuelo:** 63 frases.
- **Pruebas:** `npm test` (35) y `node scripts/qa-historia2.mjs` (ahora con la Historia 3 y las recetas).

- **Modo perezoso más lento (26 nov):** el dueño lo sintió todavía rápido en su teléfono y pidió la mitad. La velocidad pasó de × 0.62 a × 0.31 (Granma 0.26, el Abuelo 0.24; piso 0.2) y las grabaciones del Abuelo de 0.78 a 0.39. Si el motor de voz de un teléfono no baja de cierto mínimo, lo siguiente es decir la frase palabra por palabra con pausas.
