# Graph Report - granma-sazon  (2026-11-28)

## Corpus Check
- 143 files · ~243,988 words
- Verdict: corpus is large enough that graph structure adds value.
- Unclassified: 7 file(s) not represented in the graph (top: (none) 3, .css 2, .webmanifest 1)

## Summary
- 1312 nodes · 3524 edges · 64 communities (60 shown, 4 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 52 edges (avg confidence: 0.87)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `f207e398`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- avisos.test.mjs
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
- qa-regiones.mjs
- qa-animaciones.mjs
- scripts
- ejercicios.js
- qa-hablar-glosario.mjs
- Granma Sazón
- qa-pruebas.mjs
- ref_node_path
- qa-offline.mjs
- app.js
- gen-logo.mjs
- build-biblia.py
- contenido.test.mjs
- qa-escucha.mjs
- Esquemas exactos (copiados de `data/*.json`)
- Derechos y licencias de Granma Sazón
- ref_node_module
- receta.js
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
- estado
- qa-historia2.mjs
- qa-cuenta.mjs
- qa-app.mjs
- Guion del Abuelo: 51 frases para grabar
- audios.mjs
- glosario-faltan.mjs
- cotorreo.mjs
- j
- qa-loteria-familia.mjs
- Recordatorio diario: cómo está armado
- voz.js
- vistas/loteria.js
- qa-loteria.mjs
- pruebas.js
- ref_node_url
- coloquial.js
- loteria/[[ruta]].js
- cuentas.test.mjs
- cuenta/[[ruta]].js
- montar

## God Nodes (most connected - your core abstractions)
1. `u()` - 121 edges
2. `esc()` - 84 edges
3. `estado()` - 80 edges
4. `pj()` - 71 edges
5. `guardar()` - 69 edges
6. `jugar()` - 61 edges
7. `nat()` - 55 edges
8. `tgt()` - 51 edges
9. `$$` - 45 edges
10. `montar()` - 36 edges

## Surprising Connections (you probably didn't know these)
- `Micrófono que se trababa y modo perezoso palabra por palabra (27 nov)` --references--> `audioDelToque()`  [INFERRED]
  docs/CAMBIOS-AL-SPEC.md → js/oido-propio.js
- `Premium de $50 MXN` --references--> `descargar()`  [INFERRED]
  docs/EXTENDER.md → js/descargas.js
- `«Mijo» o «mija», botón «Actualizar» y permisos con un botón (26 nov)` --references--> `tratarComo()`  [INFERRED]
  docs/CAMBIOS-AL-SPEC.md → js/state.js
- `«Mijo» o «mija», botón «Actualizar» y permisos con un botón (26 nov)` --references--> `conTrato()`  [INFERRED]
  docs/CAMBIOS-AL-SPEC.md → js/state.js
- `«Mijo» o «mija», botón «Actualizar» y permisos con un botón (26 nov)` --references--> `u()`  [INFERRED]
  docs/CAMBIOS-AL-SPEC.md → js/state.js

## Import Cycles
- None detected.

## Communities (64 total, 4 thin omitted)

### Community 0 - "avisos.test.mjs"
Cohesion: 0.14
Nodes (23): atender(), avisar(), b64u(), cuerpo(), DIAS_DE_FALLO, endpointValido(), firmaVapid(), huella() (+15 more)

### Community 1 - "u"
Cohesion: 0.06
Nodes (143): confeti(), lluviaTortillas(), Historia 3 «Las fiestas de mi familia» y ocho recetas de fiesta (26 nov), vistaSinDescargar(), notaColoquial(), botonWhatsApp(), enlaceWhatsApp(), urlApp() (+135 more)

### Community 2 - "habla.js"
Cohesion: 0.07
Nodes (44): COLORES, MAX_CONFETI, GOLPE, MAX_PEGADAS, MAX_TORTILLAS, PEGADA_MS, TRICOLOR, iniciarAnimaciones() (+36 more)

### Community 3 - "build.mjs"
Cohesion: 0.09
Nodes (16): audioFiles, audios, bibliaFiles, esc(), hash, historia2, historia3, historiaHTML() (+8 more)

### Community 4 - "validar.mjs"
Cohesion: 0.10
Nodes (37): AQUI, ARCHIVO, BIBLIA_CON_DERECHOS, CAMPOS, claves(), contiene(), esc(), esTexto() (+29 more)

### Community 5 - "glosario-biblia-auto.mjs"
Cohesion: 0.08
Nodes (30): auto, B, base, derivarEn(), derivarEs(), distancia(), ESCRIBIR, esNombre() (+22 more)

### Community 6 - "js/descargas.js"
Cohesion: 0.13
Nodes (31): Comida italiana, Cómo extender la app (estructura lista para crecer), Más contenido, Premium de $50 MXN, Recetas subidas por usuarios, instalar(), activos, alProgreso() (+23 more)

### Community 7 - "vistas/biblia.js"
Cohesion: 0.12
Nodes (20): BibleProvider, FLAGS, PROXY_URL, VERSIONES, versionesDe(), versionPorId(), libros(), LocalPublicDomain (+12 more)

### Community 8 - "gen-personajes.mjs"
Cohesion: 0.10
Nodes (15): A, ABUELO_ESTADOS, abueloCuerpo(), baston(), brazo(), C, corazon(), cuchara() (+7 more)

### Community 9 - "publicar.yml"
Cohesion: 0.10
Nodes (20): concurrency, cancel-in-progress, group, jobs, publicar, name, on, push (+12 more)

### Community 10 - "qa-oido-propio.mjs"
Cohesion: 0.09
Nodes (16): ./js/oido-propio.js, CAPT, { chromium }, ejs, errores, estado, fallas, hastaHablar() (+8 more)

### Community 12 - "qa-regiones.mjs"
Cohesion: 0.17
Nodes (10): CAPT, { chromium }, errores, estado, fallas, grupos, R, reg (+2 more)

### Community 13 - "qa-animaciones.mjs"
Cohesion: 0.11
Nodes (14): ejs, errores, fallas, hist, malas, nom, pal, PERMITIDAS (+6 more)

### Community 14 - "scripts"
Cohesion: 0.11
Nodes (17): description, engines, node, name, private, scripts, biblia, build (+9 more)

### Community 15 - "ejercicios.js"
Cohesion: 0.09
Nodes (56): confetiMexicano(), tortillaPierde(), Verificador propio de voz («que me escuche Granma, aquí en mi teléfono»), BORRADO_MS, comillas(), jugar(), borrarLuego(), delegado() (+48 more)

### Community 16 - "qa-hablar-glosario.mjs"
Cohesion: 0.13
Nodes (13): abrir(), CAPT, { chromium }, ejs, errores, estado(), fallas, glos (+5 more)

### Community 17 - "Granma Sazón"
Cohesion: 0.05
Nodes (38): Aprender hablando y escuchando, modo perezoso, porras y turnos de voz (26 nov), Arranque a prueba de fallas (iPhone nuevo que se quedaba «cargando»), Aviso de privacidad y términos al empezar; avisos desde el inicio (27 nov), Avisos con días y «Te espero en clase» (27 nov), Biblia: texto intacto y glosario formal, Cambios frente al SPEC original, Cuentos de Granma (27 nov), Dominio propio: granmasazon.app (26 nov) (+30 more)

### Community 18 - "qa-pruebas.mjs"
Cohesion: 0.14
Nodes (11): cap1, dic, errores, fallas, hist, pal, pregunta(), RAIZ (+3 more)

### Community 19 - "ref_node_path"
Cohesion: 0.11
Nodes (13): { chromium }, ENTORNOS, fallas, R, srv, TIPOS, boton, { chromium } (+5 more)

### Community 20 - "qa-offline.mjs"
Cohesion: 0.14
Nodes (11): ejs, errores, fallas, hist, pal, propias, RAIZ, rec (+3 more)

### Community 21 - "app.js"
Cohesion: 0.10
Nodes (50): hilo(), logoVapor(), aplicarActualizacion(), buscarActualizacion(), hayNueva(), mostrarAviso(), versionInstalada(), vigilarActualizaciones() (+42 more)

### Community 22 - "gen-logo.mjs"
Cohesion: 0.25
Nodes (7): C, { chromium }, icono(), ICONOS, LOGO, olla(), RAIZ

### Community 23 - "build-biblia.py"
Cohesion: 0.31
Nodes (4): bajar(), desde_scrollmapper(), desde_web(), limpiar()

### Community 24 - "contenido.test.mjs"
Cohesion: 0.10
Nodes (15): armarEscucha(), material(), MODOS, TXT, huellas(), RAIZ, VERSIONES_PD, consejos (+7 more)

### Community 25 - "qa-escucha.mjs"
Cohesion: 0.11
Nodes (16): abrir(), CAPT, { chromium }, errores, estado(), fallas, hist, izq (+8 more)

### Community 26 - "Esquemas exactos (copiados de `data/*.json`)"
Cohesion: 0.20
Nodes (9): Capítulo / lección — `data/historia.json` → `capitulos[]`, Consejo del Abuelo — `data/consejos.json`, Cotorreo — `data/cotorreo.json`, Esquemas exactos (copiados de `data/*.json`), Glosario al toque (obligatorio al agregar contenido), Glosario bíblico (completo), Historia 2, pláticas, frases coloquiales y reglas (fuente directa en JSON: `scripts/datos/*.json`), Receta — `data/recetas.json` (+1 more)

### Community 27 - "Derechos y licencias de Granma Sazón"
Cohesion: 0.20
Nodes (9): 1. Lo que es propio (creación original del proyecto), 2. Lo que es de dominio público, 3. Lo que es de terceros (con licencia abierta), 4. Servicios que usa el teléfono (no son de la app), 5. Privacidad y voz, 6. Lo que le toca al dueño (no se puede resolver desde el código), 7. Regla para lo que venga, Derechos y licencias de Granma Sazón (+1 more)

### Community 28 - "ref_node_module"
Cohesion: 0.11
Nodes (11): recetas, errores, fallas, librosDistintos, RAIZ, srv, TIPOS, n() (+3 more)

### Community 29 - "receta.js"
Cohesion: 0.26
Nodes (18): alternar(), avisosDisponibles(), notificar(), nuevo(), pedirPermisoDeAviso(), reiniciar(), restante(), revisar() (+10 more)

### Community 30 - "publicar-pages.mjs"
Cohesion: 0.18
Nodes (10): andar(), DIST, fuera, grandes, INCLUIR, lista, MODELOS, PEDAZO (+2 more)

### Community 31 - "api/biblia.js"
Cohesion: 0.43
Nodes (6): ATRIB, con_reintento(), entero(), handler(), LIBROS, sanear()

### Community 32 - "Ejemplos: 2 buenos y 2 malos por tipo"
Cohesion: 0.29
Nodes (6): 1. Consejos del Abuelo, 2. Cotorreos (chistes y juegos de palabras), 3. Capítulos y lecciones bilingües (relato de Granma), 4. Recetas, 5. Ruta Biblia (solo dominio público), Ejemplos: 2 buenos y 2 malos por tipo

### Community 33 - "Contenido de Granma Sazón"
Cohesion: 0.25
Nodes (7): Checklist de validación (pégalo al final de cada tanda), Contenido de Granma Sazón, Flujo (en este orden), «Mijo» o «mija»: lo elige la persona, Recursos, Reglas de contenido (no negociables), Voces

### Community 34 - "Biblia: arquitectura, versiones y derechos"
Cohesion: 0.29
Nodes (6): Aviso de derechos, Biblia: arquitectura, versiones y derechos, Capa BibleProvider (`js/biblia/`), Ejercicios de la ruta Biblia, Encender NTV/NLT (cuando haya licencia), Versiones

### Community 35 - "qa-rendimiento.mjs"
Cohesion: 0.25
Nodes (7): ./assets/animaciones/index.js, estado, R, RAIZ, srv, stress(), TIPOS

### Community 36 - "sw.js"
Cohesion: 0.20
Nodes (8): CLASE, MATERIA, NUCLEO, RECORDATORIOS, textoDelAviso(), textoDelRecordatorio(), tipoQueToca(), YA_PRACTICO

### Community 37 - "Granma Sazón — instrucciones para Claude"
Cohesion: 0.25
Nodes (7): Contenido de la app: usa siempre la skill `contenido-granma`, Granma Sazón — instrucciones para Claude, Mapa de Graphify, Regla permanente: empezar recomendando modelo y esfuerzo, Regla permanente: este repositorio es lo único que se toca, Regla permanente: todo va en granmasazon.app, Reglas del repo

### Community 38 - "guion-pdf.mjs"
Cohesion: 0.22
Nodes (6): {chromium}, DOCS, esc(), fmt(), md, {chromium}

### Community 39 - "[archivo].js"
Cohesion: 0.67
Nodes (3): onRequest(), pedirEstatico(), PERMITIDOS

### Community 40 - "estado"
Cohesion: 0.07
Nodes (60): encabezado, icono(), ICONOS, main, nav, navegar(), pintarCromo(), promptInstalar (+52 more)

### Community 41 - "qa-historia2.mjs"
Cohesion: 0.10
Nodes (16): abrir(), CAPT, { chromium }, col, errores, estado(), fallas, h2 (+8 more)

### Community 42 - "qa-cuenta.mjs"
Cohesion: 0.12
Nodes (10): bt, CAPT, { chromium }, errores, fallas, R, srv, st (+2 more)

### Community 43 - "qa-app.mjs"
Cohesion: 0.14
Nodes (12): CAPT, { chromium }, ctx3, errores, estado(), fallas, nueva(), prepararAvisos() (+4 more)

### Community 44 - "Guion del Abuelo: 51 frases para grabar"
Cohesion: 0.50
Nodes (3): Cómo grabar, Frases, Guion del Abuelo: 63 frases para grabar

### Community 45 - "audios.mjs"
Cohesion: 0.14
Nodes (6): RAIZ, SALIDA, consejos, lista, historia, PALABRAS_INTERES

### Community 46 - "glosario-faltan.mjs"
Cohesion: 0.32
Nodes (6): anda(), faltan, g, palabrasDe(), R, suma()

### Community 47 - "cotorreo.mjs"
Cohesion: 0.33
Nodes (6): cotorreos, lista, P(), QQ, QR, T()

### Community 48 - "j"
Cohesion: 0.40
Nodes (6): capas(), fuente(), glos(), j(), paquetes, peso()

### Community 49 - "qa-loteria-familia.mjs"
Cohesion: 0.09
Nodes (19): CAPT, [cg, cb], { chromium }, codigo, db, env, errores, estado() (+11 more)

### Community 50 - "Recordatorio diario: cómo está armado"
Cohesion: 0.33
Nodes (5): Cómo saber si están llegando, Límites del plan gratis, Recordatorio diario: cómo está armado, Secretos (solo en Cloudflare, nunca en el repositorio), Volver a publicar el despertador

### Community 54 - "voz.js"
Cohesion: 0.17
Nodes (18): cancelarVoz(), cargarMapa(), claveAudio(), decir(), decirSintetica(), decirUna(), elegirVoz(), LANG (+10 more)

### Community 55 - "vistas/loteria.js"
Cohesion: 0.32
Nodes (10): armarPartida(), azar(), barajar(), cartaEn(), IDS_CARTAS, llena(), NIVELES, siguienteNivel() (+2 more)

### Community 56 - "qa-loteria.mjs"
Cohesion: 0.14
Nodes (8): CAPT, { chromium }, errores, fallas, R, srv, TIPOS, U

### Community 57 - "pruebas.js"
Cohesion: 0.43
Nodes (6): armarPrueba(), distintos(), NOTA_MINIMA, repartir(), tamanoPrueba(), TXT

### Community 58 - "ref_node_url"
Cohesion: 0.29
Nodes (4): B, formas, G, RAIZ

### Community 59 - "coloquial.js"
Cohesion: 0.40
Nodes (4): CLAVE, COLOQUIAL, coloquialesEn(), TITULO

### Community 60 - "loteria/[[ruta]].js"
Cohesion: 0.18
Nodes (19): atender(), codigoValido(), ESPERA_INICIO, hex(), json(), jugadorDe(), leer(), limpiarApodo() (+11 more)

### Community 61 - "cuentas.test.mjs"
Cohesion: 0.12
Nodes (8): ORIGEN, ORIGEN, VIDA_MS, b64u(), google(), NONCE, RAIZ, R

### Community 62 - "cuenta/[[ruta]].js"
Cohesion: 0.20
Nodes (17): atender(), cookie(), deB64u(), DIAS_SESION, EMISORES, hex(), json(), leerCookie() (+9 more)

### Community 63 - "montar"
Cohesion: 0.29
Nodes (16): api(), montar(), crear(), detener(), empezarFamilia(), entrarSala(), gritarLoteria(), jugar() (+8 more)

## Knowledge Gaps
- **1 isolated node(s):** `./js/oido-propio.js`
  These have ≤1 connection - possible missing edges or undocumented components. (Counts symbols only; 588 node(s) total have ≤1 connection when file, concept and rationale nodes are included.)
- **4 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `pj()` connect `u` to `js/descargas.js`, `vistas/biblia.js`, `estado`, `ejercicios.js`, `app.js`, `vistas/loteria.js`, `contenido.test.mjs`, `receta.js`, `montar`?**
  _High betweenness centrality (0.052) - this node is a cross-community bridge._
- **What connects `./js/oido-propio.js` to the rest of the system?**
  _1 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `avisos.test.mjs` be split into smaller, more focused modules?**
  _Cohesion score 0.1396011396011396 - nodes in this community are weakly interconnected._
- **Why does `u()` connect `u` to `habla.js`, `js/descargas.js`, `vistas/biblia.js`, `estado`, `ejercicios.js`, `Granma Sazón`, `app.js`, `vistas/loteria.js`, `coloquial.js`, `receta.js`, `montar`?**
  _High betweenness centrality (0.051) - this node is a cross-community bridge._
- **Should `u` be split into smaller, more focused modules?**
  _Cohesion score 0.06190029579395426 - nodes in this community are weakly interconnected._
- **Why does `Cambios frente al SPEC original` connect `Granma Sazón` to `u`, `ejercicios.js`?**
  _High betweenness centrality (0.042) - this node is a cross-community bridge._
- **Should `habla.js` be split into smaller, more focused modules?**
  _Cohesion score 0.07450980392156863 - nodes in this community are weakly interconnected._