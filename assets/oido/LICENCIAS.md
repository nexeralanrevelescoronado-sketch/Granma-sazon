# Oído de Granma: reconocimiento de voz dentro del teléfono

Es la única parte de la app que usa código y datos de terceros. Se descarga solo si la persona lo pide
(paquete «Oído de Granma» en Descargas) y corre entero en el teléfono: la voz no sale de ahí.

| Archivo | Qué es | Titular | Licencia | Dónde consta |
|---|---|---|---|---|
| `vosk.js` | Vosk compilado a WebAssembly (`vosk-browser` 0.0.8), sin modificar | Ciaran O'Reilly; Vosk: Alpha Cephei Inc. | Apache-2.0 | campo `license` del paquete npm `vosk-browser`; archivo `COPYING` del repositorio `alphacep/vosk-api` |
| `modelo-en.tar.gz` | `vosk-model-small-en-us-0.15`, sin modificar | Alpha Cephei Inc. (README del modelo: «Copyright 2020 Alpha Cephei Inc») | Apache-2.0 | tabla oficial de modelos de Vosk (`models.md` del repositorio `alphacep/vosk-space`, que es la fuente de alphacephei.com/vosk/models) |

- El texto completo de la licencia está en `LICENSE-APACHE-2.0.txt` (se distribuye junto con los archivos, como pide la licencia).
- Apache-2.0 permite usar y distribuir gratis, también en un producto comercial, sin pagar regalías, conservando el aviso de
  derechos y la licencia. No da derecho a usar las marcas «Vosk» ni «Alpha Cephei» como si la app fuera de ellos.
- Los archivos no se modificaron. Huellas (SHA-256) al integrarlos:
  - `vosk.js` 29504515526e974f4cb053cf08811c4de5fb2a74007c0a5a957db50eaa8d5d0c
  - `modelo-en.tar.gz` f0b24bb92a48ca575b6a96500d6b543f0f079c573dfe85bbe16001fc0404e1d8

## Español: retirado hasta tener el modelo con licencia publicada

Se había incluido `vosk-model-small-es-0.3`. Esa versión ya no aparece en la tabla oficial de modelos y su README no trae
licencia, así que **se retiró** de la app para no distribuir nada sin licencia a la vista. El modelo vigente,
`vosk-model-small-es-0.42`, sí está publicado como **Apache 2.0** en la tabla oficial. Para integrarlo hay que bajarlo de
alphacephei.com (39 MB) y guardarlo como `assets/oido/modelo-es.tar.gz`; luego se vuelve a registrar el paquete «oido-es»
en `scripts/build.mjs`. Mientras tanto, quien aprende español practica con el servicio de voz del teléfono o con el medidor de voz.
