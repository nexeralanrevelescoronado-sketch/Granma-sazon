// Configuración de versiones de la Biblia y banderas (feature flags).
// NTV y NLT tienen derechos de autor (Tyndale House): su texto NO está en este repositorio ni en los JSON.
// Están APAGADAS. Para encenderlas hace falta una licencia y desplegar el proxy (ver docs/BIBLIA.md).
export const FLAGS = {
  ntv: false,   // Nueva Traducción Viviente (proveedor externo con licencia)
  nlt: false,   // New Living Translation (NLT API de Tyndale / API.Bible)
};

// Dirección del proxy serverless (api/biblia.js). La clave de API vive SOLO en el servidor.
export const PROXY_URL = 'api/biblia';

export const VERSIONES = [
  { id: 'rv1909', idioma: 'es', nombre: 'Reina-Valera 1909', corto: 'RV1909', proveedor: 'local', activa: true, offline: true,
    attribution: { es: 'Reina-Valera 1909. Texto de dominio público.', en: 'Reina-Valera 1909. Public domain text.' } },
  { id: 'ntv', idioma: 'es', nombre: 'Nueva Traducción Viviente', corto: 'NTV', proveedor: 'remoto', activa: FLAGS.ntv, offline: false, licenciaOffline: 'pendiente-de-confirmar',
    attribution: { es: 'Nueva Traducción Viviente © 2010 Tyndale House Foundation. Usada con licencia; todos los derechos reservados.', en: 'Nueva Traducción Viviente © 2010 Tyndale House Foundation. Used under license; all rights reserved.' } },
  { id: 'kjv', idioma: 'en', nombre: 'King James Version', corto: 'KJV', proveedor: 'local', activa: true, offline: true,
    attribution: { es: 'King James Version (1769). Dominio público en casi todo el mundo (en el Reino Unido, la Corona conserva una patente de impresión).', en: 'King James Version (1769). Public domain in most of the world (in the United Kingdom, the Crown holds a letters patent on printing).' } },
  { id: 'web', idioma: 'en', nombre: 'World English Bible', corto: 'WEB', proveedor: 'local', activa: true, offline: true,
    attribution: { es: 'World English Bible. Texto de dominio público.', en: 'World English Bible. Public domain text.' } },
  { id: 'nlt', idioma: 'en', nombre: 'New Living Translation', corto: 'NLT', proveedor: 'remoto', activa: FLAGS.nlt, offline: false, licenciaOffline: 'pendiente-de-confirmar',
    attribution: { es: 'Scripture quotations are taken from the Holy Bible, New Living Translation, copyright © 1996, 2004, 2015 by Tyndale House Foundation. Used by permission of Tyndale House Publishers, Carol Stream, Illinois 60188. All rights reserved.', en: 'Scripture quotations are taken from the Holy Bible, New Living Translation, copyright © 1996, 2004, 2015 by Tyndale House Foundation. Used by permission of Tyndale House Publishers, Carol Stream, Illinois 60188. All rights reserved.' } },
];
export const versionPorId = (id) => VERSIONES.find((v) => v.id === id);
export const versionesDe = (idioma) => VERSIONES.filter((v) => v.idioma === idioma);
