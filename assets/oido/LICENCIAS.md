# Oído de Granma: reconocimiento de voz dentro del teléfono

Es la única parte de la app que usa código y datos de terceros. Se descarga solo si la persona lo pide
(paquetes «Oído de Granma» en Descargas) y corre entero en el teléfono: la voz no sale de ahí.

| Archivo | Qué es | Origen | Licencia |
|---|---|---|---|
| `vosk.js` | Vosk compilado a WebAssembly (`vosk-browser` 0.0.8), sin modificar | paquete npm `vosk-browser` | Apache-2.0 |
| `modelo-en.tar.gz` | `vosk-model-small-en-us-0.15`, sin modificar | modelos de Vosk (Alpha Cephei Inc.) | Apache-2.0 |
| `modelo-es.tar.gz` | `vosk-model-small-es-0.3`, sin modificar | modelos de Vosk (Alpha Cephei Inc.) | Apache-2.0 |

Apache-2.0 permite usarlos y distribuirlos gratis, también en un producto comercial, conservando este aviso.
Texto de la licencia: https://www.apache.org/licenses/LICENSE-2.0

Pendiente de confirmar por el dueño antes de vender la app: la licencia del modelo de español 0.3 se tomó de la
página de modelos de Vosk; desde el entorno donde se integró no se pudo abrir esa página para releerla.
