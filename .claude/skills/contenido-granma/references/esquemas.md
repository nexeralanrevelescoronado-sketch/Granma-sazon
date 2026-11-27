# Esquemas exactos (copiados de `data/*.json`)

Los `id` los pone el build (posición + 1): en una tanda nueva déjalos fuera. Todo par `{es, en}` es obligatorio en los dos idiomas.

## Consejo del Abuelo — `data/consejos.json`
```json
{ "tema": "trabajo", "es": "…", "en": "…",
  "clave": [ { "es": "bien", "en": "well" }, { "es": "habla", "en": "speaks" } ],
  "q": { "ok": { "es": "…", "en": "…" }, "mal": [ { "es": "…", "en": "…" }, { "es": "…", "en": "…" } ] } }
```
- `tema`: `trabajo | amistad | familia | constancia | fe | dinero | cocina`
- `clave`: 2–3; cada `es` está dentro de `es` y cada `en` dentro de `en` (sin importar mayúsculas).
- `q`: `ok` + **exactamente 2** `mal`. Pregunta implícita: «¿Qué quiso decir el Abuelo?».
- Fuente: `scripts/datos/consejos.mjs` → `K(tema, es, en, [[es,en],…], [okEs,okEn], [m1Es,m1En], [m2Es,m2En])`.

## Cotorreo — `data/cotorreo.json`
```json
{ "tema": "cocina", "tipo": "adivinanza", "es": "…", "en": "…",
  "clave": [ {"es":"…","en":"…"}, {"es":"…","en":"…"}, {"es":"…","en":"…"} ],
  "q": { "p": {"es":"¿Cuál es la respuesta?","en":"What is the answer?"}, "ok": {"es":"…","en":"…"}, "mal": [ {…}, {…} ] },
  "abuelo": { "es": "…", "en": "…" } }
```
- `tema`: `cocina | trabajo | amigos | fe | viajes`
- `tipo`: `chiste | adivinanza | refrán | trabalenguas | juego de palabras`
- `clave`: **exactamente 3**. `q.p`: «¿Qué quiso decir?» (chistes, refranes, juegos), «¿Cuál es la respuesta?» (adivinanzas), «¿De qué trata?» (trabalenguas).
- `abuelo` es opcional: el remate serio y suave del Abuelo (sin exclamaciones, nunca burla).
- Trabalenguas: el `en` es un trabalenguas equivalente del inglés, no una traducción literal.
- Fuente: `scripts/datos/cotorreo.mjs` → `T(tema, tipo, es, en, claves, pregunta, ok, mal1, mal2, remate?)`.

## Capítulo / lección — `data/historia.json` → `capitulos[]`
```json
{ "id": 6, "receta": "mole",
  "titulo": { "es": "…", "en": "…" },
  "relato": { "es": ["párrafo", "…"], "en": ["paragraph", "…"] },
  "palabras": [ { "en": "house", "es": "casa" } ],
  "ejemplos": { "trabajo": [ { "en": "…", "es": "…", "we": "morning", "ws": "mañana" } ], "amigos": [], "biblia": [], "viajes": [], "cocina": [] },
  "consejo": { "es": "…", "en": "…", "clave": [ {"es":"…","en":"…"}, {"es":"…","en":"…"} ] } }
```
- `relato`: 3–5 párrafos breves, los mismos en `es` y `en`, narrados por Granma (con «mijo/mija»).
- `palabras`: 8–10, forma `{en, es}` (¡en primero!).
- `ejemplos.<interés>`: **3** frases por interés (`trabajo, amigos, biblia, viajes, cocina`); `we/ws` es la palabra del capítulo y debe aparecer **como palabra completa** en `en`/`es`; las 3 frases usan palabras distintas. La app cambia los ejercicios según el interés elegido.
- `palabrasInteres.<interés>`: **3** palabras nuevas propias de ese interés, cada una con su frase: `{ "en": "schedule", "es": "horario", "f": { "en": "My schedule starts early.", "es": "Mi horario empieza temprano." } }`. No repiten las palabras base del capítulo, no son iguales en los dos idiomas y aparecen completas en su frase. Con ellas, quien eligió «trabajo» aprende palabras distintas de quien eligió «cocina».
- `receta`: id existente en `data/recetas.json`.
- Fuente: `scripts/datos/historia.mjs` → `E(en, es, we, ws)`; el vocabulario por interés va en `scripts/datos/palabras-interes.mjs` → `W(en, es, fraseEn, fraseEs)`.

## Receta — `data/recetas.json`
```json
{ "id": "champurrado", "icono": "champurrado", "insignia": null,
  "nombre": {…}, "resumen": {…}, "nota": {…}, "nivel": {…},
  "porciones": 6, "tiempoPrep": 5, "tiempoCoccion": 25,
  "ingredientes": [ { "cant": 90, "un": "g", "es": "chocolate de mesa (1 tableta)", "en": "Mexican table chocolate (1 tablet)" } ],
  "pasos": [ { "es": "…", "en": "…", "min": 8 } ] }
```
- `cant` es **número** > 0 (`0.5` para ½). `un`: `g, kg, ml, L, cda, cdta, tazas, pza, dientes, cm, pizca`.
- `pasos` en orden, ≥ 4; `min` entero en todo paso que dure o espere (alimenta el cronómetro).
- `nota`: seguridad (aceite caliente → «ayuda de un adulto»).
- Fuente: `scripts/datos/recetas.mjs` → `I(cant, un, es, en)` y `S(es, en, min?)`. El build crea además `recetas/<id>.html` con JSON-LD.

- **Recetas por región y por tema** — `scripts/datos/recetas-regiones.json` (mismo esquema de receta + `historia` y `aprende`). Los grupos (Guadalajara, Torreón… y Aguas, Pozoles, Postres, Barbacoas) están en `scripts/datos/regiones.json` (`{ regiones:[ {id, icono, nombre, lugar, recetas:[ids]} ], temas:[ {id, icono, nombre, recetas} ] }`). La historia de recetas que ya existían va en `scripts/datos/recetas-historias.json` (`{ "<id>": { historia, aprende } }`).
  - `historia`: `{ nombre:{es,en} (por qué se llama así), origen:{es,en} (solo hechos comprobables), leyenda?:{es,en} (empieza con «Se cuenta que…» / «Legend says…», sin años ni nombres de personas), curiosos:[{es,en} ×2-3] }`. Máx. ~420 caracteres por idioma.
  - `aprende`: 3 a 5 `{ es, en }`; la palabra en español aparece en la receta.

## Ruta Biblia — `data/biblia/ruta.json`
```json
{ "id": "sal23", "ref": { "libro": "sal", "cap": 23, "desde": 1, "hasta": 1 },
  "titulo": { "es": "El Señor es mi pastor", "en": "The Lord is my shepherd" },
  "pares": [ ["pastor", "shepherd"], ["salmo", "Psalm"], ["faltará", "want"] ] }
```
- `libro`: id de `data/biblia/libros.json` (`gen, sal, jua, mat…`). Pasaje corto (1–3 versículos).
- `pares[i] = [palabra en RV1909, palabra en KJV]`, **tal como aparecen** en esos versículos (el validador los busca).
- No guardes el texto del versículo. Fuente: `scripts/datos/biblia.mjs`.

## Historia 2, pláticas, frases coloquiales y reglas (fuente directa en JSON: `scripts/datos/*.json`)

- **Historia 2** — `scripts/datos/historia2.json`: mismo esquema de capítulo (ids 7 a 12), más `versiculo: { libro, cap, desde, hasta }` (solo la cita; el texto sale de `data/biblia/`). Es sobria: fe con respeto, desde una relación con Dios y no desde reglas, sin presión, sin prometer curas ni dinero, sin hablar mal de ninguna iglesia ni persona.
- **Historia 3** — `scripts/datos/historia3.json` (ids 13 a 18, alegre, sin `versiculo`) y sus recetas en `scripts/datos/recetas-fiestas.json` (mismo esquema de receta). «Monito» es la figurita de la rosca: en inglés, *little figure*, nunca *monkey*.
- **Plática** — `scripts/datos/platicas.json`: `{ id, tema:{es,en}, turnos:[ { granma:{es,en}, respuestas:[ { t:{es,en}, r:{es,en} } ×3 ] } ×3 ], cierre:{es,en} }`. No hay respuestas malas; Granma contesta alegre a las tres.
- **Frase coloquial** — `scripts/datos/coloquial.json`: `{ id, idioma, region, frase, significa:{es,en}, uso:{es,en}, ejemplo:{es,en} }`. `uso` dice cuándo sí y cuándo no. Solo expresiones sanas y comprobables; cero burlas a regiones o acentos.
- **Regla** — `scripts/datos/reglas.json`: `{ id, para, titulo, resumen, puntos:[ { regla:{es,en}, ejemplos:[{en,es}] } ], practica:[ { p:{es,en}, frase, ok, mal:[2] } ×4 ] }`.

## Glosario al toque (obligatorio al agregar contenido)

Cada palabra nueva que aparezca en un texto (`es`/`en`) necesita su entrada en `scripts/datos/glosario/en.json` (inglés → significado en español) o `es.json` (español → significado en inglés). La clave es la forma exacta en minúsculas (`cooked`, `manzanas`, `don't`); el valor, un significado corto (≤ 45 caracteres, sin punto final; dos sentidos se separan con `; `). `npm test` dice qué palabras faltan, y `node scripts/glosario-faltan.mjs <archivo.json>` lo dice para un archivo suelto.

### Glosario bíblico (completo)

Cubre todas las palabras de RV1909, KJV y WEB; `npm test` falla si falta una. Va aparte del glosario general y es **formal**: solo el significado de la palabra, sin bromas ni interpretación. Capas (la primera manda): `biblia-<idioma>.json` (base revisada) → `biblia-<idioma>-resto.json` (lotes) → `biblia-<idioma>-auto.json` (deducido; se regenera con `node scripts/glosario-biblia-auto.mjs --escribir`, no se edita a mano). Para corregir una glosa, ponla en `biblia-<idioma>.json`.
