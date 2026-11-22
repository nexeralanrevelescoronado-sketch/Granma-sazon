# Biblia: arquitectura, versiones y derechos

## Versiones

| Id | Versión | Idioma | Origen | Offline | Estado |
|---|---|---|---|---|---|
| `rv1909` | Reina-Valera 1909 | ES | dominio público · `scrollmapper/bible_databases` (SpaRV) | ✅ paquete «Biblia» | activa |
| `kjv` | King James Version | EN | dominio público · `scrollmapper/bible_databases` (KJV) | ✅ | activa |
| `web` | World English Bible | EN | dominio público · `TehShrike/world-english-bible` | ✅ | activa |
| `ntv` | Nueva Traducción Viviente | ES | **Tyndale House** (con derechos) | ❌ solo con internet | **apagada** → «Próximamente» |
| `nlt` | New Living Translation | EN | **Tyndale House** (con derechos) | ❌ solo con internet | **apagada** → «Próximamente» |

Notas de licencia:
- **KJV:** dominio público en casi todo el mundo; en el Reino Unido la Corona conserva una patente (*letters patent*) sobre su impresión. El aviso se muestra en la app (campo `attribution`).
- **WEB:** texto de dominio público. «World English Bible» es el nombre del proyecto; no se modifica el texto.
- **NTV / NLT:** **no se incluye ni se copia su texto** en el repositorio, en `data/` ni en ningún JSON (la prueba `test/contenido.test.mjs` lo vigila). La licencia para **uso offline está pendiente de confirmar** con el titular; mientras tanto solo se consultan en línea y no se descargan.

Para regenerar los JSON de dominio público: `npm run biblia` (descarga las fuentes y escribe `data/biblia/<versión>/<libro>.json`).

## Capa BibleProvider (`js/biblia/`)

```
provider.js   interfaz común + registro   listBooks(version) · getPassage(version, referencia) · search(version, texto, {libro})
base.js       clase BibleProvider (contrato)
local.js      LocalPublicDomain: lee data/biblia/**.json (Cache Storage si está descargado)
remote.js     RemoteLicensed: llama al proxy `api/biblia` (nunca a Tyndale directo)
config.js     VERSIONES (incluye `attribution`), FLAGS = { ntv:false, nlt:false }
```

`referencia` acepta texto (`"Juan 3:16-18"`, `"1 Cor 13:4"`) u objeto `{ libro, cap, desde, hasta }`. `getPassage` devuelve `{ version, libro, cap, desde, hasta, versos:[{v,t}], attribution? }`.

## Encender NTV/NLT (cuando haya licencia)

1. Conseguir la licencia y la clave: **NLT API de Tyndale** (`api.nlt.to`) o **API.Bible**.
2. Desplegar `api/biblia.js` (función serverless estilo Vercel; adaptable a Netlify/Cloudflare) con variables de entorno **del servidor**:
   - `NLT_API_KEY` o `API_BIBLE_KEY` (+ `NTV_BIBLE_ID` / `NLT_BIBLE_ID` si se usa API.Bible)
   - `BIBLE_FLAG_NLT=1` y/o `BIBLE_FLAG_NTV=1` (el servidor también tiene su propia bandera apagada)
3. Poner `FLAGS.ntv` / `FLAGS.nlt` en `true` en `js/biblia/config.js`.
4. Confirmar por escrito si la licencia permite **uso offline**; solo entonces cambiar `licenciaOffline` y diseñar un paquete aparte. Hasta entonces: solo en línea.

**La clave de API NUNCA va en el frontend.** El navegador llama a `GET api/biblia?version=nlt&libro=jua&cap=3&desde=16&hasta=16`; el proxy valida los parámetros contra una lista fija, aplica la bandera, llama al proveedor con la clave del servidor, reintenta con **retroceso exponencial** y devuelve `{ versos, attribution }`. El service worker no intercepta `/api/`.

> GitHub Pages es solo hosting estático: allí no corre `api/`. Para NTV/NLT hay que alojar el proxy en un servicio con funciones (Vercel, Netlify, Cloudflare Workers…) y apuntar `PROXY_URL` (en `config.js`) a su dirección.

## Ejercicios de la ruta Biblia

`scripts/datos/biblia.mjs` define 10 pasajes cortos de **RV1909 + KJV** (dominio público) con pares de vocabulario. La prueba verifica que cada palabra exista de verdad en el versículo de ambas versiones. En la app se muestra el versículo ES y EN lado a lado con las palabras clave resaltadas y luego se practica (significado, completar el versículo, emparejar).

## Aviso de derechos

Cada vista de texto muestra el aviso de cada versión visible (`attribution`). Si se enciende una versión con licencia, su aviso exacto (el de Tyndale) se muestra debajo del pasaje.
