# Graph Report - granma-sazon  (2026-11-26)

## Corpus Check
- 99 files · ~96,802 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 7 file(s) not represented in the graph (top: (none) 3, .css 2, .webmanifest 1)

## Summary
- 922 nodes · 2378 edges · 41 communities (39 shown, 2 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 30 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `83995be8`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- montar
- u
- habla.js
- build.mjs
- validar.mjs
- glosario-biblia-auto.mjs
- js/descargas.js
- vistas/biblia.js
- gen-personajes.mjs
- publicar.yml
- qa-oido-propio.mjs
- .claude/CLAUDE.md
- glosario.js
- qa-animaciones.mjs
- scripts
- ejercicios.js
- qa-hablar-glosario.mjs
- Granma Sazón
- qa-pruebas.mjs
- ref_node_fs
- qa-offline.mjs
- index.js
- qa-primera-vez.mjs
- build-biblia.py
- contenido.test.mjs
- qa-escucha.mjs
- Esquemas exactos (copiados de `data/*.json`)
- Derechos y licencias de Granma Sazón
- ref_node_module
- gen-logo.mjs
- publicar-pages.mjs
- api/biblia.js
- Ejemplos: 2 buenos y 2 malos por tipo
- Contenido de Granma Sazón
- Biblia: arquitectura, versiones y derechos
- qa-rendimiento.mjs
- sw.js
- Granma Sazón — instrucciones para Claude
- guion-pdf.mjs
- [archivo].js
- Guion del Abuelo: 51 frases para grabar

## God Nodes (most connected - your core abstractions)
1. `u()` - 75 edges
2. `jugar()` - 55 edges
3. `pj()` - 54 edges
4. `esc()` - 52 edges
5. `estado()` - 50 edges
6. `guardar()` - 44 edges
7. `nat()` - 38 edges
8. `tgt()` - 37 edges
9. `$$` - 36 edges
10. `montar()` - 31 edges

## Surprising Connections (you probably didn't know these)
- `Premium de $50 MXN` --references--> `descargar()`  [INFERRED]
  docs/EXTENDER.md → js/descargas.js
- `Verificador propio de voz («que me escuche Granma, aquí en mi teléfono»)` --references--> `analizarVoz()`  [INFERRED]
  docs/CAMBIOS-AL-SPEC.md → js/oido.js
- `Verificador propio de voz («que me escuche Granma, aquí en mi teléfono»)` --references--> `grabar()`  [INFERRED]
  docs/CAMBIOS-AL-SPEC.md → js/oido.js
- `Verificador propio de voz («que me escuche Granma, aquí en mi teléfono»)` --references--> `silabas()`  [INFERRED]
  docs/CAMBIOS-AL-SPEC.md → js/oido.js
- `guardar()` --indirect_call--> `S()`  [INFERRED]
  js/state.js → scripts/datos/recetas.mjs

## Import Cycles
- None detected.

## Communities (41 total, 2 thin omitted)

### Community 0 - "montar"
Cohesion: 0.23
Nodes (17): alternar(), avisosDisponibles(), notificar(), nuevo(), pedirPermisoDeAviso(), reiniciar(), restante(), revisar() (+9 more)

### Community 1 - "u"
Cohesion: 0.07
Nodes (112): lluviaTortillas(), encabezado, icono(), ICONOS, main, nav, navegar(), pintarCromo() (+104 more)

### Community 2 - "habla.js"
Cohesion: 0.07
Nodes (43): confeti(), C, cargarImg(), generarConstancia(), alternarVoz(), cola, conBoca(), dividir() (+35 more)

### Community 3 - "build.mjs"
Cohesion: 0.05
Nodes (28): audioFiles, audios, bibliaFiles, capas(), glos(), hash, j(), listar() (+20 more)

### Community 4 - "validar.mjs"
Cohesion: 0.10
Nodes (36): AQUI, ARCHIVO, BIBLIA_CON_DERECHOS, CAMPOS, claves(), contiene(), esc(), esTexto() (+28 more)

### Community 5 - "glosario-biblia-auto.mjs"
Cohesion: 0.08
Nodes (30): auto, B, base, derivarEn(), derivarEs(), distancia(), ESCRIBIR, esNombre() (+22 more)

### Community 6 - "js/descargas.js"
Cohesion: 0.12
Nodes (32): Comida italiana, Cómo extender la app (estructura lista para crecer), Más contenido, Premium de $50 MXN, Recetas subidas por usuarios, instalar(), paquetes(), activos (+24 more)

### Community 7 - "vistas/biblia.js"
Cohesion: 0.12
Nodes (24): BibleProvider, FLAGS, PROXY_URL, VERSIONES, versionesDe(), versionPorId(), libros(), LocalPublicDomain (+16 more)

### Community 8 - "gen-personajes.mjs"
Cohesion: 0.10
Nodes (15): A, ABUELO_ESTADOS, abueloCuerpo(), baston(), brazo(), C, corazon(), cuchara() (+7 more)

### Community 9 - "publicar.yml"
Cohesion: 0.10
Nodes (20): concurrency, cancel-in-progress, group, jobs, publicar, name, on, push (+12 more)

### Community 10 - "qa-oido-propio.mjs"
Cohesion: 0.10
Nodes (15): ./js/oido-propio.js, CAPT, { chromium }, ejs, errores, estado, fallas, hastaHablar() (+7 more)

### Community 12 - "glosario.js"
Cohesion: 0.24
Nodes (14): anotar(), buscar(), cargar(), cargarBiblico(), cerrarGlosa(), iniciarGlosario(), mostrar(), palabraEn() (+6 more)

### Community 13 - "qa-animaciones.mjs"
Cohesion: 0.11
Nodes (14): ejs, errores, fallas, hist, malas, nom, pal, PERMITIDAS (+6 more)

### Community 14 - "scripts"
Cohesion: 0.11
Nodes (17): description, engines, node, name, private, scripts, biblia, build (+9 more)

### Community 15 - "ejercicios.js"
Cohesion: 0.09
Nodes (55): confetiMexicano(), Verificador propio de voz («que me escuche Granma, aquí en mi teléfono»), BORRADO_MS, comillas(), hablarPausado(), jugar(), borrarLuego(), delegado() (+47 more)

### Community 16 - "qa-hablar-glosario.mjs"
Cohesion: 0.13
Nodes (13): abrir(), CAPT, { chromium }, ejs, errores, estado(), fallas, glos (+5 more)

### Community 17 - "Granma Sazón"
Cohesion: 0.07
Nodes (25): Aprender hablando y escuchando, modo perezoso, porras y turnos de voz (26 nov), Arranque a prueba de fallas (iPhone nuevo que se quedaba «cargando»), Biblia: texto intacto y glosario formal, Cambios frente al SPEC original, Dominio propio: granmasazon.app (26 nov), Energía (tortillitas), Glosario al toque, hablar y más juego, Grabaciones con voz real (listo para recibirlas) (+17 more)

### Community 18 - "qa-pruebas.mjs"
Cohesion: 0.14
Nodes (11): cap1, dic, errores, fallas, hist, pal, pregunta(), RAIZ (+3 more)

### Community 19 - "ref_node_fs"
Cohesion: 0.12
Nodes (11): RAIZ, SALIDA, huellas(), RAIZ, VERSIONES_PD, B, formas, G (+3 more)

### Community 20 - "qa-offline.mjs"
Cohesion: 0.14
Nodes (11): ejs, errores, fallas, hist, pal, propias, RAIZ, rec (+3 more)

### Community 21 - "index.js"
Cohesion: 0.09
Nodes (31): COLORES, MAX_CONFETI, GOLPE, MAX_PEGADAS, MAX_TORTILLAS, PEGADA_MS, TRICOLOR, iniciarAnimaciones() (+23 more)

### Community 22 - "qa-primera-vez.mjs"
Cohesion: 0.22
Nodes (6): { chromium }, ENTORNOS, fallas, R, srv, TIPOS

### Community 23 - "build-biblia.py"
Cohesion: 0.31
Nodes (4): bajar(), desde_scrollmapper(), desde_web(), limpiar()

### Community 24 - "contenido.test.mjs"
Cohesion: 0.10
Nodes (20): otros(), armarEscucha(), material(), MODOS, TXT, armarPrueba(), distintos(), NOTA_MINIMA (+12 more)

### Community 25 - "qa-escucha.mjs"
Cohesion: 0.11
Nodes (15): abrir(), CAPT, { chromium }, errores, estado(), fallas, hist, izq (+7 more)

### Community 26 - "Esquemas exactos (copiados de `data/*.json`)"
Cohesion: 0.22
Nodes (8): Capítulo / lección — `data/historia.json` → `capitulos[]`, Consejo del Abuelo — `data/consejos.json`, Cotorreo — `data/cotorreo.json`, Esquemas exactos (copiados de `data/*.json`), Glosario al toque (obligatorio al agregar contenido), Glosario bíblico (completo), Receta — `data/recetas.json`, Ruta Biblia — `data/biblia/ruta.json`

### Community 27 - "Derechos y licencias de Granma Sazón"
Cohesion: 0.22
Nodes (8): 1. Lo que es propio (creación original del proyecto), 2. Lo que es de dominio público, 3. Lo que es de terceros (con licencia abierta), 4. Servicios que usa el teléfono (no son de la app), 5. Privacidad y voz, 6. Lo que le toca al dueño (no se puede resolver desde el código), 7. Regla para lo que venga, Derechos y licencias de Granma Sazón

### Community 28 - "ref_node_module"
Cohesion: 0.09
Nodes (15): errores, fallas, librosDistintos, RAIZ, srv, TIPOS, R, srv (+7 more)

### Community 29 - "gen-logo.mjs"
Cohesion: 0.25
Nodes (7): C, { chromium }, icono(), ICONOS, LOGO, olla(), RAIZ

### Community 30 - "publicar-pages.mjs"
Cohesion: 0.17
Nodes (10): andar(), DIST, fuera, grandes, INCLUIR, lista, MODELOS, PEDAZO (+2 more)

### Community 31 - "api/biblia.js"
Cohesion: 0.43
Nodes (6): ATRIB, con_reintento(), entero(), handler(), LIBROS, sanear()

### Community 32 - "Ejemplos: 2 buenos y 2 malos por tipo"
Cohesion: 0.29
Nodes (6): 1. Consejos del Abuelo, 2. Cotorreos (chistes y juegos de palabras), 3. Capítulos y lecciones bilingües (relato de Granma), 4. Recetas, 5. Ruta Biblia (solo dominio público), Ejemplos: 2 buenos y 2 malos por tipo

### Community 33 - "Contenido de Granma Sazón"
Cohesion: 0.29
Nodes (6): Checklist de validación (pégalo al final de cada tanda), Contenido de Granma Sazón, Flujo (en este orden), Recursos, Reglas de contenido (no negociables), Voces

### Community 34 - "Biblia: arquitectura, versiones y derechos"
Cohesion: 0.29
Nodes (6): Aviso de derechos, Biblia: arquitectura, versiones y derechos, Capa BibleProvider (`js/biblia/`), Ejercicios de la ruta Biblia, Encender NTV/NLT (cuando haya licencia), Versiones

### Community 35 - "qa-rendimiento.mjs"
Cohesion: 0.25
Nodes (7): ./assets/animaciones/index.js, estado, R, RAIZ, srv, stress(), TIPOS

### Community 37 - "Granma Sazón — instrucciones para Claude"
Cohesion: 0.29
Nodes (6): Contenido de la app: usa siempre la skill `contenido-granma`, Granma Sazón — instrucciones para Claude, Mapa de Graphify, Regla permanente: empezar recomendando modelo y esfuerzo, Regla permanente: este repositorio es lo único que se toca, Reglas del repo

### Community 38 - "guion-pdf.mjs"
Cohesion: 0.33
Nodes (5): {chromium}, DOCS, esc(), fmt(), md

### Community 39 - "[archivo].js"
Cohesion: 0.67
Nodes (3): onRequest(), pedirEstatico(), PERMITIDOS

### Community 44 - "Guion del Abuelo: 51 frases para grabar"
Cohesion: 0.50
Nodes (3): Cómo grabar, Frases, Guion del Abuelo: 51 frases para grabar

## Knowledge Gaps
- **1 isolated node(s):** `./js/oido-propio.js`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 431 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **2 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `pj()` connect `u` to `montar`, `habla.js`, `js/descargas.js`, `vistas/biblia.js`, `ejercicios.js`, `contenido.test.mjs`?**
  _High betweenness centrality (0.059) - this node is a cross-community bridge._
- **What connects `./js/oido-propio.js` to the rest of the system?**
  _1 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `u` be split into smaller, more focused modules?**
  _Cohesion score 0.07495854063018242 - nodes in this community are weakly interconnected._
- **Why does `Verificador propio de voz («que me escuche Granma, aquí en mi teléfono»)` connect `ejercicios.js` to `Granma Sazón`?**
  _High betweenness centrality (0.051) - this node is a cross-community bridge._
- **Should `habla.js` be split into smaller, more focused modules?**
  _Cohesion score 0.0746606334841629 - nodes in this community are weakly interconnected._
- **Why does `Cambios frente al SPEC original` connect `Granma Sazón` to `ejercicios.js`?**
  _High betweenness centrality (0.050) - this node is a cross-community bridge._
- **Should `build.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.05319148936170213 - nodes in this community are weakly interconnected._