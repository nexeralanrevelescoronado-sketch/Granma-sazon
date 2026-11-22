---
name: contenido-granma
description: Genera contenido de Granma Sazón siempre parejo y validado — cotorreos (chistes, adivinanzas, refranes, trabalenguas, juegos de palabras), consejos del Abuelo, capítulos y lecciones bilingües, relatos de Granma, recetas mexicanas y ejercicios de la ruta Biblia. Úsala SIEMPRE que el usuario pida escribir, agregar, traducir, ampliar o revisar cualquier texto que vaya a la app (chistes, consejos, dichos, relatos, vocabulario, recetas, pasajes), aunque no diga «skill» ni «contenido», y también cuando mencione data/consejos.json, data/cotorreo.json, historia.json o recetas.json. Trae las reglas de voz (Granma tierna, Abuelo sereno), humor 100% sano, bilingüe español/inglés, Biblia solo de dominio público, y un validador de JSON.
---

# Contenido de Granma Sazón

Esta app enseña inglés y español a gente de todas las edades (familias, abuelos, niños). Por eso el contenido tiene que sentirse **de la misma casa** tanto si lo escribió alguien hoy como si lo escribe otro mañana: misma voz, mismo cariño, mismo esquema, cero sustos. Esta skill fija esa vara y trae un validador para no depender de la memoria.

## Flujo (en este orden)

1. **Lee antes de escribir.** Abre 3–5 elementos reales del tipo pedido en `data/` (`consejos.json`, `cotorreo.json`, `historia.json`, `recetas.json`, `biblia/ruta.json`) para calcar tono, largo y esquema. Mira también los que ya existen del mismo tema para **no repetir**. El esquema exacto está en `references/esquemas.md`.
2. **Escribe la tanda** respetando las reglas de abajo. Para dudas de forma, mira los ejemplos buenos y malos en `references/ejemplos.md`.
3. **Valida:** guarda la tanda como JSON y corre
   `node .claude/skills/contenido-granma/scripts/validar.mjs <tipo> tanda.json` (tipos: `consejos`, `cotorreos`, `capitulos`, `recetas`, `biblia`; o `tanda` con un objeto de varios tipos). Corrige hasta quedar sin errores y lee cada ⚠: son dudas que una persona debe decidir.
4. **Cierra con el checklist** (abajo) pegado en tu respuesta, marcando cada punto de verdad.
5. **Integrar (solo si el usuario lo pide):** la fuente de verdad NO es `data/*.json` (se genera), son `scripts/datos/*.mjs`. Agrega ahí con los mismos ayudantes (`K(...)` consejos, `T(...)` cotorreos, `E(...)` ejemplos de capítulo, `I(...)`/`S(...)` receta), luego agrega al glosario (`scripts/datos/glosario/en.json` y `es.json`) cada palabra nueva que traiga la tanda, y corre `npm run build` y `npm test` (la prueba dice qué palabras faltan). Si no pidieron integrar, entrega la tanda como JSON y di que falta ese paso.

## Voces

- **Granma**: tierna, cariñosa, cuenta historias, bromea sano, dice «mijo/mija», **siempre anima** (también cuando algo sale mal: «Ándale, otra vez, mijo»). Frases cálidas y sencillas.
- **El Abuelo**: serio, pausado, de pocas palabras; **un consejo sabio por frase**, como si levantara la mano para que lo escuchen. A veces se le escapa una sonrisa leve de orgullo, nunca una carcajada. Sin regaños duros, sin culpa, sin exclamaciones, sin «mijo/mija» (eso es de Granma). Ideal: ≤ 100 caracteres por idioma.

Por qué: los niños copian el tono. Un Abuelo que regaña o una Granma sarcástica rompen la promesa de la marca («calma y cariño»).

## Reglas de contenido (no negociables)

- **Siempre bilingüe** español/inglés, completo en los dos idiomas. Natural, no traducción palabra por palabra (si el juego de palabras no pasa, adáptalo o cambia de chiste, no lo expliques).
- **2–3 palabras clave** (consejos: 2–3; cotorreos: exactamente 3; consejo del capítulo: 2) que aparecen literalmente en el texto de cada idioma, más un **mini-ejercicio** (`q`: respuesta correcta + 2 distractores). Los distractores también se leen: que sean equivocados pero **amables**, jamás un mensaje hiriente.
- **Humor 100% sano, apto para toda la familia:** cero groserías, albures ni doble sentido; cero burlas a personas, religión, regiones, cuerpos o profesiones; poco sarcasmo, siempre ligero y cariñoso. Si dudas de un chiste, es que no pasa.
- **Sin culpa ni miedo:** nada de «te vas a arrepentir», «quedarás mal», «no sirves». Tampoco en las opciones equivocadas.
- **Nada de otras apps, marcas, personajes o estilos** (ni «como en…», ni nombres comerciales de ingredientes: «masa harina», no una marca).
- **Dichos y refranes:** solo los de uso común y popular, sin atribuir a personas reales (ni «dijo Fulano», ni «— Nombre Apellido»). Si no estás seguro de que sea común, escribe un consejo original del Abuelo en su lugar.
- **Biblia:** solo dominio público: **Reina-Valera 1909, KJV y WEB** (están en `data/biblia/`). **Jamás** copies ni parafrasees de memoria texto de **NTV o NLT** (Tyndale House, con derechos). En contenido guarda solo la **referencia** y los **pares de palabras** que existan realmente en RV1909 y KJV; el texto del versículo se lee de `data/biblia/`, no se escribe a mano.
- **Recetas:** ingredientes con **medidas exactas** (número + unidad, nunca «al gusto» ni «un poco»), **pasos numerados**, **tiempo por paso** (`min`), versión **ES/EN**, nota de seguridad (si hay fritura o aceite caliente, pide ayuda de un adulto). Cocina mexicana tradicional, sin inventar datos (ni «EST. 1950» ni fotos ajenas).
- **Solo los campos del esquema.** No inventes `autor`, `atribucion`, `nota` ni ningún campo extra para «ayudar»: rompen el esquema y las pruebas del repo. Si algo no cabe, díselo a la persona en la respuesta, no en el JSON.
- **Capítulos:** relato corto de Granma (3–5 párrafos breves, con «mijo/mija»), 8–10 palabras nuevas, y las 5 listas de ejemplos (trabajo, amigos, biblia, viajes, cocina) con 3 frases cada una; cada frase usa una palabra distinta del capítulo, completa, en ambos idiomas. Además, **3 palabras propias por interés** (`palabrasInteres`), cada una con su frase: es lo que hace que el vocabulario cambie según lo que le interesa a la persona.

## Checklist de validación (pégalo al final de cada tanda)

```
CHECKLIST — tanda de <tipo> (<n> elementos)
[ ] Idiomas completos: todo texto tiene es y en
[ ] Palabras clave: 2-3 (cotorreos: 3), aparecen literales en cada idioma
[ ] Mini-ejercicio en todo elemento: 1 correcta + 2 distractores amables
[ ] Voz: Granma tierna con «mijo/mija»; Abuelo sereno, 1 consejo por frase
[ ] Humor sano: sin groserías/albures/burlas (personas, religión, regiones, cuerpos, profesiones)
[ ] Sin culpa/miedo, ni en las opciones incorrectas
[ ] Sin apps, marcas, personajes ni estilos ajenos
[ ] Dichos comunes, sin autor
[ ] Biblia: solo RV1909/KJV/WEB; nada de NTV/NLT; palabras verificadas en el versículo
[ ] Receta: medidas exactas, pasos numerados, min por paso, ES/EN, nota de seguridad
[ ] No repite contenido existente (validador sin «duplicado»)
[ ] JSON válido y mismo esquema: validar.mjs sin errores  →  resultado: <pegar la última línea>
[ ] Avisos ⚠ revisados y resueltos (o justificados)
```

Marca ✔ solo lo que verificaste. Si algo no se pudo comprobar con el script (humor, tono), dilo con honestidad en vez de marcarlo.

## Recursos

- `references/esquemas.md` — esquema exacto de cada tipo y cómo se integra en `scripts/datos/*.mjs`.
- `references/ejemplos.md` — 2 ejemplos buenos y 2 malos por tipo, con el porqué.
- `scripts/validar.mjs` — validador sin dependencias (`--repo` valida todo `data/`, `--autoprueba` verifica al propio validador contra `ejemplos/malos.json`).
- `evals/` — casos de prueba de la skill.
