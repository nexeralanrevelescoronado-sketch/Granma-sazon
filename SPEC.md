SPEC: Granma/Sazón — MVP final (PWA)

OBJETIVO
App web instalable (PWA) para aprender inglés y español de
forma inmersiva, guiada por dos abuelos mexicanos ORIGINALES:
Granma (la abuelita tierna que cuenta su vida) y el Abuelo
(serio, sabio, de pocos pero buenos consejos). Cada capítulo
enseña inglés + una receta. Bilingüe español/inglés.
Debe sentirse como un JUEGO: dinámico, con ritmo y premios.
Debe poder usarse SIN INTERNET si el usuario lo descarga.
No mencionar ni imitar a ninguna otra app, marca, personaje
o estilo visual existente en el código, textos, nombres,
íconos ni metadatos.

PERSONAJES (diseño propio, dibujados como SVG)
- Granma: abuelita morena de piel cálida, cabello blanco
  recogido en chongo con una flor de dalia rosa, lentes
  redondos, mejillas rosadas, sonrisa tierna, vestido verde
  azulado, rebozo rojo con franja dorada, delantal crema con
  florecita bordada y cuchara de palo en la mano.
  Personalidad: cariñosa, cuenta historias, bromea sano, dice
  "mijo/mija".
- Abuelo: abuelo de piel morena, sombrero de palma con banda
  café, cejas blancas gruesas, bigote blanco, expresión seria
  y tranquila, chaleco azul grisáceo, sarape terracota con
  franja dorada, bastón de madera.
  Personalidad: serio, pausado, de pocas palabras; cada frase
  es un consejo sabio. Sin groserías ni regaños duros.
- Crear ambos como SVG ligeros e independientes (cabeza,
  cuerpo y expresiones separables) en /assets/personajes/,
  con variantes: contento, pensando, aplaudiendo, ánimo.
- Granma y el Abuelo deben ser distintos a cualquier personaje
  existente. No copiar rasgos de abuelitas o abuelos de
  películas, series o caricaturas.

LOGO
- Insignia circular terracota (#C8553D) con una olla de barro
  naranja echando tres hilos de vapor crema, y el texto
  "Granma Sazón" con el lema "Recetas de México para el
  mundo". Entregar en SVG y como íconos PWA (192, 512 y
  maskable) en PNG.
- Colores de marca: terracota #C8553D, naranja olla #F2A93B,
  crema #FFF1DC, verde azulado #2E8B83, café #4A2E1B.

ONBOARDING (3 pasos)
1. Idioma que aprende: inglés o español.
2. Interés (personaliza vocabulario y ejemplos):
   Trabajo | Amigos y conversación | Biblia y fe | Viajes | Cocina
3. Cocina: Mexicana o Italiana (italiana = "próximamente").
Granma da la bienvenida y el Abuelo da el primer consejo.

CONTENIDO MVP
- Historia 1 de Granma: 5 capítulos (su niñez en México).
- Cada capítulo: relato corto bilingüe contado por Granma,
  8-10 palabras nuevas, 5 ejercicios (opción múltiple,
  ordenar frase, emparejar) y al final "El consejo del
  Abuelo": una frase sabia bilingüe ligada al capítulo, con
  2 palabras clave resaltadas.
- Los ejercicios cambian sus ejemplos según el interés elegido.
- Recetas: mole poblano (la receta estrella de Granma),
  pozole (insignia "Día festivo"), champurrado de chocolate
  y buñuelos. Cada una con ingredientes con medidas exactas,
  pasos numerados, cronómetro por paso y versión ES/EN.

SECCIÓN: "EL CONSEJO DEL ABUELO"
- Consejo del día en la pantalla de inicio, con botón de
  compartir por WhatsApp.
- Mínimo 40 consejos y dichos sanos en el MVP (trabajo,
  amistad, familia, constancia, fe, dinero, cocina), cada
  uno en español e inglés con 2-3 palabras clave y un
  mini-ejercicio de comprensión.
- Tono: serio, breve y sabio. Cero groserías, cero ofensas,
  cero regaños duros ni mensajes que promuevan miedo o
  culpa. Sin dichos machistas ni discriminatorios.

SECCIÓN: BIBLIA (ESPAÑOL E INGLÉS)
- Lector bilingüe: ver el mismo pasaje en español e inglés
  lado a lado, o una sola versión a la vez.
- Selector de versión en español y en inglés.
- Versiones INCLUIDAS y descargables offline (dominio público):
  Reina-Valera 1909 (ES), KJV y WEB (EN).
- Versiones NTV (Nueva Traducción Viviente) y NLT (New Living
  Translation): tienen derechos de autor (Tyndale House). NO
  incluir ni copiar su texto en el repo ni en archivos JSON.
  Solo prepararlas como proveedores externos con licencia.
- Arquitectura: capa "BibleProvider" con una interfaz común
  (getPassage(version, referencia), search, listBooks).
  Proveedores: LocalPublicDomain (archivos JSON) y
  RemoteLicensed (API externa con licencia: NLT API de
  Tyndale o API.Bible). La clave de API NUNCA va en el
  frontend: hacerla pasar por un proxy/serverless function
  (dejar el endpoint preparado y documentado).
- Bandera de configuración (feature flag) para NTV/NLT:
  APAGADAS por defecto. Si están apagadas, mostrar
  "Próximamente" en el selector; si se encienden, solo
  funcionan con internet, NO se descargan para uso offline,
  salvo que la licencia lo permita explícitamente (dejar
  marcado como pendiente de confirmar).
- Mostrar el aviso de derechos y atribución que exija cada
  versión (campo "attribution" en la configuración).
- Ejercicios de la ruta Biblia: vocabulario y frases clave de
  pasajes cortos de versiones de dominio público, con
  versículo en ES y EN lado a lado.

SECCIÓN: "COTORREO CON GRANMA"
- Aprender inglés/español con chistes, adivinanzas, refranes,
  trabalenguas y juegos de palabras, en formato bilingüe.
- Cada cotorreo trae: el chiste, su traducción, 3 palabras
  clave resaltadas y un mini-ejercicio ("¿Qué quiso decir?").
- Chiste del día de Granma en la pantalla de inicio, con
  botón de compartir por WhatsApp.
- Mínimo 30 cotorreos en el MVP, agrupados por tema (cocina,
  trabajo, amigos, fe, viajes) según el interés del usuario.
- A veces el Abuelo aparece con su cara seria como remate
  gracioso (humor suave, nunca burla).
- REGLAS DE CONTENIDO: humor 100% sano. Cero groserías, cero
  albures, cero ofensas, nada de burlas a personas, religión,
  regiones, cuerpos o profesiones. Poco sarcasmo, y siempre
  ligero y cariñoso. Todo apto para toda la familia.

JUEGO Y DINAMISMO
- Racha diaria, puntos (XP), "tortillitas" como vidas, mapa
  de capítulos.
- Animaciones suaves al acertar (confeti, Granma aplaudiendo,
  el Abuelo asintiendo con el sombrero) y mensajes cariñosos
  al fallar (Granma: "¡Ándale, otra vez, mijo!"; Abuelo:
  "Quien persevera, alcanza.").
- Retos rápidos de 60 segundos con cronómetro.
- Misiones diarias (ej. "Aprende 5 palabras y un consejo").
- Insignias: "Día festivo" (pozole), "Maestro del mole",
  "Racha de 7 días", "Rey del cotorreo", "Alumno del Abuelo".
- Sonidos cortos opcionales con botón para silenciar.
- Respetar prefers-reduced-motion en todas las animaciones.
- Constancia Granma descargable al terminar la historia
  (nombre del usuario, nivel A1, fecha, ambos abuelos).

MODO SIN INTERNET
- Pantalla "Descargas" con el botón grande
  "Descargar todo para usar sin internet".
- Paquetes descargables por separado, cada uno con su peso
  en MB: Historia de Granma | Recetas mexicanas |
  Cotorreo | Consejos del Abuelo | Recetas italianas
  (cuando existan) | Biblia (solo versiones de dominio
  público).
- Barra de progreso durante la descarga, y que se pueda
  pausar y reanudar si se corta el internet a medias.
- Mostrar espacio usado y botón para borrar cada paquete.
- Service worker con precache por paquete (Cache Storage),
  estrategia cache-first para contenido y stale-while-revalidate
  para actualizaciones; versionar los cachés y limpiar los viejos.
- Pedir almacenamiento persistente con
  navigator.storage.persist() y avisar cómo instalar la app
  en la pantalla de inicio (en iOS protege mejor lo descargado).
- Indicador visible "Sin internet — modo descargado" y
  mensajes claros si algo no está descargado.
- Todo el juego (progreso, rachas, puntos, constancia) debe
  funcionar 100% offline; la constancia se genera en el
  dispositivo.
- Mantener el peso bajo: SVG para los personajes, imágenes
  WebP optimizadas, audio comprimido, SIN video en el MVP.
  Meta: paquete completo menor a 50 MB.
- Probar en modo avión: instalar, descargar, apagar internet,
  abrir la app y completar una lección y una receta.

CALIDAD
- Lighthouse 90+ en rendimiento y accesibilidad.
- Botones de 44px mínimo, alto contraste, sin frameworks.
- Animaciones con CSS/JS ligero, sin librerías pesadas.
- Meta tags, Open Graph y JSON-LD (Recipe) en las recetas.
- Estructura lista para agregar después: comida italiana,
  premium de $50 MXN, recetas subidas por usuarios.

AL TERMINAR
Hacer commit y push de todo a main.
