# Granma Sazón — instrucciones para Claude

Responde siempre en español. El SPEC del producto está en `SPEC.md` y el mapa del repo en `README.md`.

## Contenido de la app: usa siempre la skill `contenido-granma`

Antes de **escribir, agregar, traducir, ampliar o revisar** cualquier texto que vaya a la app —cotorreos (chistes, adivinanzas, refranes, trabalenguas), consejos del Abuelo, capítulos y relatos de Granma, vocabulario, recetas o pasajes de la ruta Biblia— invoca la skill `contenido-granma` (está en `.claude/skills/contenido-granma/`). No lo escribas directo aunque parezca sencillo: la skill trae reglas que no están en ningún otro archivo (dichos sin autor, cero humor sobre regiones o cuerpos, esquema estricto, Biblia solo RV1909/KJV/WEB) y el validador que hay que correr al final.

No aplica a tareas de código, animaciones, rendimiento o pruebas: ahí trabaja normal.

## Reglas del repo

- La fuente del contenido es `scripts/datos/*.mjs`; `data/*.json` se genera. Después de cambiar contenido o archivos del núcleo: `npm run build` y luego `npm test` (el build actualiza la versión del service worker; la prueba lo exige).
- Sin frameworks ni librerías: HTML, CSS y JS nativos. Animaciones solo con `transform` y `opacity`, en `assets/animaciones/`.
- Nunca texto de NTV/NLT en el repo, ni claves de API en el frontend.
