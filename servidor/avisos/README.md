# Recordatorio diario: cómo está armado

Granma manda un aviso al día a quien lo activa en **Perfil → La app en tu teléfono**. Piezas:

| Pieza | Dónde vive | Qué hace |
|---|---|---|
| Función de Pages | `functions/api/avisos/[[ruta]].js` (se publica sola con cada cambio en `main`) | Alta, baja, clave pública y el envío de avisos |
| Base de datos D1 `granma-avisos` | Cloudflare (enlazada en `wrangler.toml` como `DB`) | Guarda la dirección de avisos de cada teléfono y su hora en UTC. Esquema: `esquema.sql` |
| Despertador | Worker `granma-despertador` en Cloudflare (código: `despertador.js`) | Cron cada 5 minutos: llama a `/api/avisos/cron` con un secreto |
| Teléfono | `js/recordatorios.js` y `sw.js` | Se suscribe, y al llegar el aviso (sin contenido) arma el texto en su idioma |

## Secretos (solo en Cloudflare, nunca en el repositorio)

- `VAPID_PRIVADA` (proyecto de Pages): firma los avisos. Se generó dentro de Cloudflare; nadie la ha visto.
- `CRON_SECRETO` (proyecto de Pages y Worker despertador): para que solo el despertador pueda pedir el envío.

Si se pierde o se cambia `VAPID_PRIVADA`, hay que cambiar también `VAPID_PUBLICA` en `wrangler.toml` y cada persona tendrá que volver a activar su recordatorio.

## Límites del plan gratis

Cada vuelta del despertador avisa a 40 teléfonos como máximo (Cloudflare limita las llamadas por ejecución). Con 12 vueltas por hora caben unos 480 avisos por cada hora del día. Si algún día no alcanza, se sube la frecuencia del cron o se pasa al plan de pago.

## Cómo saber si están llegando

La tabla `envios` cuenta, por día, cuántos avisos aceptó cada servicio (Google, Apple, Mozilla) y con qué código. No guarda nada de las personas.

## Volver a publicar el despertador

Solo hace falta si se cambia `despertador.js`: se sube como Worker `granma-despertador` con el secreto `CRON_SECRETO` y el cron `*/5 * * * *`.
