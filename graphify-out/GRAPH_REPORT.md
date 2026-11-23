# Graph Report - granma-sazon  (2026-11-23)

## Corpus Check
- 90 files · ~85,494 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 7 file(s) not represented in the graph (top: (none) 3, .css 2, .webmanifest 1)

## Summary
- 825 nodes · 2152 edges · 39 communities (35 shown, 4 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 30 edges (avg confidence: 0.86)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `ddc3b92a`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- contenido.test.mjs
- u
- habla.js
- build.mjs
- validar.mjs
- glosario-biblia-auto.mjs
- js/descargas.js
- provider.js
- gen-personajes.mjs
- publicar.yml
- qa-oido-propio.mjs
- .claude/CLAUDE.md
- audios.mjs
- qa-animaciones.mjs
- scripts
- ejercicios.js
- qa-hablar-glosario.mjs
- Granma Sazón
- qa-pruebas.mjs
- ref_node_fs
- qa-offline.mjs
- cotorreo.mjs
- qa-biblia-cronometro.mjs
- build-biblia.py
- glosario.js
- Esquemas exactos (copiados de `data/*.json`)
- Derechos y licencias de Granma Sazón
- qa-rendimiento.mjs
- gen-logo.mjs
- historia.mjs
- api/biblia.js
- Ejemplos: 2 buenos y 2 malos por tipo
- Contenido de Granma Sazón
- Biblia: arquitectura, versiones y derechos
- j
- sw.js
- Granma Sazón — instrucciones para Claude
- recetas.mjs
- Guion del Abuelo: 51 frases para grabar

## God Nodes (most connected - your core abstractions)
1. `u()` - 67 edges
2. `jugar()` - 54 edges
3. `esc()` - 52 edges
4. `pj()` - 48 edges
5. `estado()` - 46 edges
6. `guardar()` - 42 edges
7. `$$` - 36 edges
8. `nat()` - 34 edges
9. `tgt()` - 33 edges
10. `montar()` - 32 edges

## Surprising Connections (you probably didn't know these)
- `Premium de $50 MXN` --references--> `descargar()`  [INFERRED]
  docs/EXTENDER.md → js/descargas.js
- `Verificador propio de voz («que me escuche Granma, aquí en mi teléfono»)` --references--> `silabas()`  [INFERRED]
  docs/CAMBIOS-AL-SPEC.md → js/oido.js
- `Verificador propio de voz («que me escuche Granma, aquí en mi teléfono»)` --references--> `analizarVoz()`  [INFERRED]
  docs/CAMBIOS-AL-SPEC.md → js/oido.js
- `Verificador propio de voz («que me escuche Granma, aquí en mi teléfono»)` --references--> `grabar()`  [INFERRED]
  docs/CAMBIOS-AL-SPEC.md → js/oido.js
- `guardar()` --indirect_call--> `S()`  [INFERRED]
  js/state.js → scripts/datos/recetas.mjs

## Import Cycles
- None detected.

## Communities (39 total, 4 thin omitted)

### Community 0 - "contenido.test.mjs"
Cohesion: 0.10
Nodes (19): otros(), armarPrueba(), distintos(), NOTA_MINIMA, repartir(), tamanoPrueba(), TXT, mezclar() (+11 more)

### Community 1 - "u"
Cohesion: 0.07
Nodes (120): confeti(), lluviaTortillas(), encabezado, icono(), ICONOS, main, nav, navegar() (+112 more)

### Community 2 - "habla.js"
Cohesion: 0.07
Nodes (53): COLORES, MAX_CONFETI, MAX_TORTILLAS, TRICOLOR, iniciarAnimaciones(), ANTIGUOS, CERRADOS, crearSvg() (+45 more)

### Community 3 - "build.mjs"
Cohesion: 0.10
Nodes (11): audioFiles, audios, bibliaFiles, hash, listar(), nucleo, RAIZ, sw (+3 more)

### Community 4 - "validar.mjs"
Cohesion: 0.10
Nodes (36): AQUI, ARCHIVO, BIBLIA_CON_DERECHOS, CAMPOS, claves(), contiene(), esc(), esTexto() (+28 more)

### Community 5 - "glosario-biblia-auto.mjs"
Cohesion: 0.08
Nodes (30): auto, B, base, derivarEn(), derivarEs(), distancia(), ESCRIBIR, esNombre() (+22 more)

### Community 6 - "js/descargas.js"
Cohesion: 0.13
Nodes (30): Comida italiana, Cómo extender la app (estructura lista para crecer), Más contenido, Premium de $50 MXN, Recetas subidas por usuarios, instalar(), paquetes(), activos (+22 more)

### Community 7 - "provider.js"
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

### Community 12 - "audios.mjs"
Cohesion: 0.22
Nodes (4): RAIZ, SALIDA, consejos, lista

### Community 13 - "qa-animaciones.mjs"
Cohesion: 0.11
Nodes (14): ejs, errores, fallas, hist, malas, nom, pal, PERMITIDAS (+6 more)

### Community 14 - "scripts"
Cohesion: 0.11
Nodes (17): description, engines, node, name, private, scripts, biblia, build (+9 more)

### Community 15 - "ejercicios.js"
Cohesion: 0.08
Nodes (65): confetiMexicano(), tortillaPierde(), Verificador propio de voz («que me escuche Granma, aquí en mi teléfono»), C, cargarImg(), generarConstancia(), BORRADO_MS, comillas() (+57 more)

### Community 16 - "qa-hablar-glosario.mjs"
Cohesion: 0.13
Nodes (13): abrir(), CAPT, { chromium }, ejs, errores, estado(), fallas, glos (+5 more)

### Community 17 - "Granma Sazón"
Cohesion: 0.08
Nodes (21): Biblia: texto intacto y glosario formal, Cambios frente al SPEC original, Energía (tortillitas), Glosario al toque, hablar y más juego, Grabaciones con voz real (listo para recibirlas), Oído de Granma: reconocimiento de palabras dentro del teléfono, Pendiente (recordar al dueño), Pruebas (+13 more)

### Community 18 - "qa-pruebas.mjs"
Cohesion: 0.14
Nodes (11): cap1, dic, errores, fallas, hist, pal, pregunta(), RAIZ (+3 more)

### Community 19 - "ref_node_fs"
Cohesion: 0.13
Nodes (11): B, formas, G, RAIZ, {chromium}, DOCS, esc(), fmt() (+3 more)

### Community 20 - "qa-offline.mjs"
Cohesion: 0.14
Nodes (11): ejs, errores, fallas, hist, pal, propias, RAIZ, rec (+3 more)

### Community 21 - "cotorreo.mjs"
Cohesion: 0.33
Nodes (6): cotorreos, lista, P(), QQ, QR, T()

### Community 22 - "qa-biblia-cronometro.mjs"
Cohesion: 0.22
Nodes (6): errores, fallas, librosDistintos, RAIZ, srv, TIPOS

### Community 23 - "build-biblia.py"
Cohesion: 0.31
Nodes (4): bajar(), desde_scrollmapper(), desde_web(), limpiar()

### Community 25 - "glosario.js"
Cohesion: 0.40
Nodes (9): anotar(), buscar(), cargar(), cargarBiblico(), cerrarGlosa(), iniciarGlosario(), mostrar(), palabraEn() (+1 more)

### Community 26 - "Esquemas exactos (copiados de `data/*.json`)"
Cohesion: 0.22
Nodes (8): Capítulo / lección — `data/historia.json` → `capitulos[]`, Consejo del Abuelo — `data/consejos.json`, Cotorreo — `data/cotorreo.json`, Esquemas exactos (copiados de `data/*.json`), Glosario al toque (obligatorio al agregar contenido), Glosario bíblico (completo), Receta — `data/recetas.json`, Ruta Biblia — `data/biblia/ruta.json`

### Community 27 - "Derechos y licencias de Granma Sazón"
Cohesion: 0.22
Nodes (8): 1. Lo que es propio (creación original del proyecto), 2. Lo que es de dominio público, 3. Lo que es de terceros (con licencia abierta), 4. Servicios que usa el teléfono (no son de la app), 5. Privacidad y voz, 6. Lo que le toca al dueño (no se puede resolver desde el código), 7. Regla para lo que venga, Derechos y licencias de Granma Sazón

### Community 28 - "qa-rendimiento.mjs"
Cohesion: 0.13
Nodes (10): ./assets/animaciones/index.js, R, srv, T, estado, R, RAIZ, srv (+2 more)

### Community 29 - "gen-logo.mjs"
Cohesion: 0.18
Nodes (8): C, { chromium }, icono(), ICONOS, LOGO, olla(), RAIZ, {chromium}

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

### Community 35 - "j"
Cohesion: 0.50
Nodes (5): capas(), glos(), j(), paquetes, peso()

### Community 37 - "Granma Sazón — instrucciones para Claude"
Cohesion: 0.33
Nodes (5): Contenido de la app: usa siempre la skill `contenido-granma`, Granma Sazón — instrucciones para Claude, Mapa de Graphify, Regla permanente: empezar recomendando modelo y esfuerzo, Reglas del repo

### Community 44 - "Guion del Abuelo: 51 frases para grabar"
Cohesion: 0.50
Nodes (3): Cómo grabar, Frases, Guion del Abuelo: 51 frases para grabar

## Knowledge Gaps
- **1 isolated node(s):** `./js/oido-propio.js`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 369 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `pj()` connect `u` to `contenido.test.mjs`, `habla.js`, `js/descargas.js`, `provider.js`, `ejercicios.js`?**
  _High betweenness centrality (0.064) - this node is a cross-community bridge._
- **What connects `./js/oido-propio.js` to the rest of the system?**
  _1 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `contenido.test.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.0960591133004926 - nodes in this community are weakly interconnected._
- **Why does `Verificador propio de voz («que me escuche Granma, aquí en mi teléfono»)` connect `ejercicios.js` to `Granma Sazón`?**
  _High betweenness centrality (0.049) - this node is a cross-community bridge._
- **Should `u` be split into smaller, more focused modules?**
  _Cohesion score 0.0690982776089159 - nodes in this community are weakly interconnected._
- **Why does `Cambios frente al SPEC original` connect `Granma Sazón` to `ejercicios.js`?**
  _High betweenness centrality (0.047) - this node is a cross-community bridge._
- **Should `habla.js` be split into smaller, more focused modules?**
  _Cohesion score 0.06557377049180328 - nodes in this community are weakly interconnected._