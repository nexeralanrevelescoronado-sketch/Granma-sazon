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
