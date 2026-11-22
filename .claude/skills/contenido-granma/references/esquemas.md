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
- `receta`: id existente en `data/recetas.json`.
- Fuente: `scripts/datos/historia.mjs` → `E(en, es, we, ws)`.

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

## Ruta Biblia — `data/biblia/ruta.json`
```json
{ "id": "sal23", "ref": { "libro": "sal", "cap": 23, "desde": 1, "hasta": 1 },
  "titulo": { "es": "El Señor es mi pastor", "en": "The Lord is my shepherd" },
  "pares": [ ["pastor", "shepherd"], ["salmo", "Psalm"], ["faltará", "want"] ] }
```
- `libro`: id de `data/biblia/libros.json` (`gen, sal, jua, mat…`). Pasaje corto (1–3 versículos).
- `pares[i] = [palabra en RV1909, palabra en KJV]`, **tal como aparecen** en esos versículos (el validador los busca).
- No guardes el texto del versículo. Fuente: `scripts/datos/biblia.mjs`.
