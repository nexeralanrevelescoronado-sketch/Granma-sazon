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
