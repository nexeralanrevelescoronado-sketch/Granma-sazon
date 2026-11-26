// «Despertador» del recordatorio diario: un Worker mínimo de Cloudflare con cron cada 5 minutos (*/5 * * * *).
// Las funciones de Pages no pueden tener cron, así que este solo llama a la app para que revise a quién le toca aviso.
// Toda la lógica está en functions/api/avisos/[[ruta]].js. Enlace: CRON_SECRETO (secreto, el mismo del proyecto de Pages).
export default {
  async scheduled(_evento, env, ctx) {
    ctx.waitUntil(fetch('https://granmasazon.app/api/avisos/cron', { method: 'POST', headers: { 'X-Cron-Secreto': env.CRON_SECRETO } }));
  },
};
