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
