# Cómo extender la app (estructura lista para crecer)

## Comida italiana
- En el onboarding «Italiana» ya existe como opción deshabilitada («próximamente»; `perfil.cocina`).
- `scripts/build.mjs` ya declara el paquete **`italianas`** (`proximamente: true`, 0 archivos). Para activarlo: crear `scripts/datos/recetas-italianas.mjs` con el mismo formato que `recetas.mjs`, generar `data/recetas-italianas.json`, listar sus archivos en el paquete y quitar `proximamente`.
- La vista de recetas ya muestra la tarjeta «Recetas italianas · Próximamente»; bastaría cargar ambos JSON según `perfil.cocina`.

## Premium de $50 MXN
- Todo el contenido gratuito es estático. Para premium: agregar paquetes nuevos (p. ej. historias 2-3, recetas extra) en `scripts/build.mjs` con una bandera `premium: true`.
- Punto de control sugerido: una función `tieneAcceso(paqueteId)` en `js/descargas.js` antes de `descargar()`; el pago y la verificación del acceso viven en un servidor (nunca en el cliente) — por ejemplo un endpoint tipo `api/acceso.js` que devuelve un token firmado de corta vida.
- Si se cobra en línea, anotar la política de reembolso y la licencia del contenido premium.

## Recetas subidas por usuarios
- El formato de receta (`id, nombre, ingredientes[{cant,un,es,en}], pasos[{es,en,min}]`) ya es suficiente. Un usuario podría guardar sus recetas en `localStorage`/IndexedDB con la misma forma y la vista `receta.js` las dibujaría tal cual (cronómetro incluido).
- Antes de abrirlo a la comunidad: moderación, sanitizado del texto (la app ya escapa todo con `esc()`), aviso de derechos y reglas de contenido sano.

## Más contenido
- Capítulos nuevos: agregar al arreglo de `scripts/datos/historia.mjs` (5 interés × 3 frases por capítulo; la prueba valida que cada palabra exista en su frase en ambos idiomas).
- Consejos y cotorreos: agregar con `K(...)` / `T(...)`; la prueba valida claves, distractores y lenguaje sano.
