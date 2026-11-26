# Granma Sazón — instrucciones para Claude

Responde siempre en español. El SPEC del producto está en `SPEC.md` y el mapa del repo en `README.md`.

## Regla permanente: este repositorio es lo único que se toca

El dueño pidió (nov 2026) que en las conversaciones de Granma Sazón **solo se trabaje en Granma Sazón**. No se abren, editan, suben ni unen cambios en otros repositorios (por ejemplo Genesis), ni se crean entornos, PR o sesiones para otros proyectos. Si algo parece necesitar otro repositorio, se dice y se espera su «sí» explícito.

## Regla permanente: todo va en granmasazon.app

El dueño lo pidió (nov 2026): el dominio principal y único que se comparte es **https://granmasazon.app** (Cloudflare Pages, se publica solo desde `main`).

- Todo trabajo terminado y probado (`npm run build`, `npm test` y las pruebas de navegador que apliquen) **se une a `main`** para que se vea en granmasazon.app, sin esperar otro «únelo». Al terminar se avisa qué se unió y se comprueba que Cloudflare lo publicó.
- Se pregunta antes solo si las pruebas fallan, si falta una decisión del dueño que cambie el contenido, o si el cambio no tiene vuelta atrás (borrar datos de las personas, cambiar de dominio, licencias).
- En mensajes, documentos, enlaces canónicos, sitemap y lo que se comparta va siempre granmasazon.app. Las direcciones `pages.dev` y `github.io` son técnicas o de respaldo: no se le dan a la gente como la dirección de la app.

## Regla permanente: empezar recomendando modelo y esfuerzo

El dueño lo pidió para no gastar tokens de más. **Antes de trabajar en cada petición**, la primera línea de la respuesta dice qué modelo y qué esfuerzo conviene para esa tarea y por qué, en una sola línea. Si la sesión está en un modelo más caro de lo necesario, se dice ahí mismo para que el dueño lo cambie antes de seguir.

| Tarea | Modelo | Esfuerzo |
|---|---|---|
| Preguntas, textos cortos, un cambio puntual, correr pruebas | el ligero | bajo |
| Contenido (cotorreos, consejos, glosas), cambios acotados de código, documentación | el intermedio | medio |
| Funciones nuevas grandes, arquitectura, fallas difíciles, seguridad y licencias | el más capaz | alto |

Además:
- Los ayudantes (subagentes) usan siempre el modelo más barato que pueda con la tarea: trabajo por lotes y mecánico, el intermedio o el ligero; nunca el más capaz.
- Antes de lanzar más de 3 ayudantes o un trabajo largo, se dice cuánto va a costar en términos sencillos (cuántos ayudantes, de qué tamaño) y se espera el «sí».
- Lo que se pueda hacer con un script sin IA (deducir, contar, validar, generar el mapa), se hace con script.

## Mapa de Graphify

El mapa del código está en `graphify-out/` (se guardan `GRAPH_REPORT.md` y `graph.json`). Sirve para no explorar a ciegas:

1. Antes de buscar con grep o abrir archivos para entender algo, consulta el mapa: `graphify query "<pregunta>"`, `graphify explain "<archivo o función>"`, `graphify path "<A>" "<B>"`. `GRAPH_REPORT.md` es para una vista general.
2. Si el comando `graphify` no existe en la sesión: `pip install -q graphifyy` (tarda unos segundos).
3. Después de cambiar código: `graphify update .` (no usa IA ni cuesta) y se sube el mapa junto con el cambio.
4. `.graphifyignore` deja fuera los datos (Biblia, glosarios, modelos de voz) para que el mapa sea solo del código y los documentos.
5. Todo lo nuevo que se instale o conecte (skills, herramientas, guías) se agrega al mapa. La skill `/graphify` está en `.claude/skills/graphify/`.

## Contenido de la app: usa siempre la skill `contenido-granma`

Antes de **escribir, agregar, traducir, ampliar o revisar** cualquier texto que vaya a la app —cotorreos (chistes, adivinanzas, refranes, trabalenguas), consejos del Abuelo, capítulos y relatos de Granma, vocabulario, recetas o pasajes de la ruta Biblia— invoca la skill `contenido-granma` (está en `.claude/skills/contenido-granma/`). No lo escribas directo aunque parezca sencillo: la skill trae reglas que no están en ningún otro archivo (dichos sin autor, cero humor sobre regiones o cuerpos, esquema estricto, Biblia solo RV1909/KJV/WEB) y el validador que hay que correr al final.

No aplica a tareas de código, animaciones, rendimiento o pruebas: ahí trabaja normal.

## Reglas del repo

- La fuente del contenido es `scripts/datos/*.mjs`; `data/*.json` se genera. Después de cambiar contenido o archivos del núcleo: `npm run build` y luego `npm test` (el build actualiza la versión del service worker; la prueba lo exige).
- Sin frameworks ni librerías: HTML, CSS y JS nativos. **Única excepción** (pedida por el dueño): el «Oído de Granma» (`assets/oido/`, Vosk con licencia Apache-2.0), que es un paquete opcional y nunca se carga en el arranque; sus licencias están en `assets/oido/LICENCIAS.md`. Animaciones solo con `transform` y `opacity`, en `assets/animaciones/`.
- Nunca texto de NTV/NLT en el repo, ni claves de API en el frontend.
- **Único servidor:** el recordatorio diario (`functions/api/avisos/`, `servidor/avisos/README.md`). Guarda solo la dirección de avisos del teléfono y la hora. No se le agregan más datos de las personas (nombre, avance, idioma) sin el «sí» del dueño y sin actualizar la privacidad en Perfil y en `docs/DERECHOS-Y-LICENCIAS.md`. Los secretos viven en Cloudflare, nunca en el repositorio.
