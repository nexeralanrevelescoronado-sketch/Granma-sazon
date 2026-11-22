# Ejemplos: 2 buenos y 2 malos por tipo

Los buenos son contenido real de la app (`data/`). Los malos están completos en `ejemplos/malos.json` y el validador los rechaza (`node scripts/validar.mjs --autoprueba`); aquí se explica **por qué** están mal, incluso lo que ningún script puede detectar.

---

## 1. Consejos del Abuelo

**✔ Bueno 1** — breve, sereno, un solo consejo, clave en ambos idiomas, distractores amables.
```json
{ "tema": "constancia", "es": "Quien persevera, alcanza.", "en": "Whoever perseveres, achieves.",
  "clave": [ {"es":"persevera","en":"perseveres"}, {"es":"alcanza","en":"achieves"} ],
  "q": { "ok": {"es":"No te rindas y llegarás.","en":"Do not give up and you will arrive."},
         "mal": [ {"es":"Quien alcanza no necesita esfuerzo.","en":"Those who achieve need no effort."}, {"es":"Con intentar una vez ya basta.","en":"Trying once is enough."} ] } }
```
**✔ Bueno 2** — imagen sencilla de la vida diaria, ni un regaño: «Gota a gota se llena el cántaro.» / «Drop by drop the jug is filled.» (claves `gota/drop`, `cántaro/jug`).

**✘ Malo 1** — «Trabaja sin descanso o te vas a arrepentir y todos se burlarán de ti.» → culpa y miedo, regaño duro, presión social. El Abuelo aconseja, no amenaza. *Arreglo:* «Quien descansa a tiempo trabaja mejor.»
**✘ Malo 2** — «Como dijo Albert Einstein, la fe mueve montañas.» + `en` con versículo «(NLT)». → atribuye a una persona real, mezcla idiomas distintos (el `en` no traduce al `es`) y cita una Biblia con derechos. *Arreglo:* dicho común sin autor, o un consejo original; versículos solo con RV1909/KJV/WEB.

*Ojo con los distractores:* «Caerse significa que no sirves» era un distractor y es un mensaje de culpa. Un distractor es **equivocado**, no **cruel**.

---

## 2. Cotorreos (chistes y juegos de palabras)

**✔ Bueno 1** — adivinanza con 3 claves, respuesta clara y remate serio del Abuelo.
```json
{ "tema": "cocina", "tipo": "adivinanza",
  "es": "Soy redonda y de maíz; con frijoles soy feliz. ¿Qué soy?",
  "en": "I am round and made of corn; with beans I am happy. What am I?",
  "clave": [ {"es":"redonda","en":"round"}, {"es":"maíz","en":"corn"}, {"es":"frijoles","en":"beans"} ],
  "q": { "p": {"es":"¿Cuál es la respuesta?","en":"What is the answer?"}, "ok": {"es":"Una tortilla","en":"A tortilla"},
         "mal": [ {"es":"Un sombrero","en":"A hat"}, {"es":"Una pelota","en":"A ball"} ] },
  "abuelo": { "es": "Redonda y calientita: así me gusta la mañana.", "en": "Round and warm: that is how I like the morning." } }
```
**✔ Bueno 2** — juego de palabras que funciona en los dos idiomas: «¿Qué le dijo el mar a la playa? Nada, solo la saludó con la ola.» / «What did the ocean say to the beach? Nothing, it just waved.» (nada/nadar y ola/wave: el chiste vive en ambos).

**✘ Malo 1** — «¿Por qué los abogados nunca ríen? Porque son unos idiotas que solo piensan en cobrar.» → burla a una profesión + insulto. *Arreglo:* chiste sobre una situación, no sobre un gremio («¿Por qué el libro de matemáticas estaba triste? Porque tenía muchos problemas.»).
**✘ Malo 2** — sin `en`, solo 2 claves, `q` sin pregunta, «¿Qué le dijo la sopa al plato? Nada.» → incompleto (no bilingüe), chiste sin gracia ni palabras para aprender. Un cotorreo siempre enseña: 3 palabras clave y mini-ejercicio.

*Otros que NO pasan aunque el script no los vea:* albures y doble sentido; burlas a regiones («los de tal estado…»), a la religión o al cuerpo de alguien; sarcasmo hacia quien aprende («qué lento eres»); chistes que se explican con groserías en inglés; imitar el estilo de un comediante o una serie.

---

## 3. Capítulos y lecciones bilingües (relato de Granma)

**✔ Bueno 1** — relato corto, cálido, con «mija» y una enseñanza concreta (cap. 4, `data/historia.json`):
> «A los diez años, mi mamá me enseñó su receta más importante: el mole. … Ella me dijo: «Mija, el mole no tiene prisa. El secreto es el cariño y una pizca de chocolate».»

con 10 palabras (`chili/chile`, `seed/semilla`, `patience/paciencia`…) y para el interés *trabajo*: `{"en":"Patience is important at work.","es":"La paciencia es importante en el trabajo.","we":"patience","ws":"paciencia"}` — la palabra aparece completa en las dos frases.
**✔ Bueno 2** — el cap. 5 cierra el relato con una promesa y su consejo del Abuelo («Quien promete con el corazón, cumple con las manos.», claves `promete/promises`, `cumple/keeps`). Mismo número de párrafos en ES y EN.

**✘ Malo 1** — `palabras` con 2 entradas, un solo ejemplo con `we: "house"` en una frase que no la contiene, `amigos/biblia/viajes/cocina` vacíos, relato de 3 líneas sin «mijo». → no sirve para ejercicios por interés.
**✘ Malo 2** — título «Aprende como en Duolingo», relato con 3 párrafos en ES y 2 en EN, sin palabras. → nombra otra app y la traducción no coincide.

---

## 4. Recetas

**✔ Bueno 1** — champurrado (`data/recetas.json`): medidas exactas y cronómetro.
```json
{ "cant": 60, "un": "g", "es": "masa harina de maíz (½ taza)", "en": "corn masa flour (½ cup)" }
{ "es": "Cuece a fuego bajo moviendo siempre, hasta que espese y cubra la cuchara.", "en": "Cook on low heat, stirring all the time, until it thickens and coats the spoon.", "min": 12 }
```
**✔ Bueno 2** — buñuelos: `nota` «El aceite caliente salpica: la fritura es trabajo de un adulto…», 11 ingredientes con gramos y mililitros, 7 pasos con `min` en las esperas.

**✘ Malo 1** — `"cant": "un poco"`, unidad vacía, ingrediente sin `en`, solo 2 pasos sin tiempos, `id` con espacio. → no hay medidas exactas ni cronómetro, no es bilingüe.
**✘ Malo 2** — «Pollo con marca Maseca» y «Fríe 10 minutos en aceite caliente» con nota «Disfruta». → menciona una marca y hay fritura sin pedir ayuda de un adulto; además el tiempo está en el texto pero no en `min`.

---

## 5. Ruta Biblia (solo dominio público)

**✔ Bueno 1** — referencia + pares que existen de verdad:
```json
{ "id": "jua316", "ref": { "libro": "jua", "cap": 3, "desde": 16, "hasta": 16 },
  "titulo": { "es": "Un amor para el mundo", "en": "A love for the world" },
  "pares": [ ["mundo","world"], ["Hijo","Son"], ["vida","life"], ["amó","loved"] ] }
```
**✔ Bueno 2** — `sal119` (v. 105): `lámpara/lamp`, `palabra/word`, `pies/feet`, `camino/path`. El texto del versículo no se guarda: la app lo lee de RV1909 y KJV.

**✘ Malo 1** — `"version": "ntv"` y un campo `texto` con el versículo copiado. → texto con derechos (Tyndale House). Nunca; solo referencia + pares.
**✘ Malo 2** — `pares` «gato/cat», «perro/dog», «casa/house» para Salmo 23:1. → esas palabras no están en el versículo; el ejercicio enseñaría algo que el pasaje no dice. Verifica cada par contra RV1909 y KJV.
