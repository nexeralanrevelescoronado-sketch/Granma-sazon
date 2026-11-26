-- Recordatorio diario de Granma Sazón (Cloudflare D1).
-- De cada teléfono que lo activa se guarda SOLO la dirección de avisos que generó su navegador y la hora (en UTC) a la que quiere el aviso.
-- No hay nombre, correo, avance ni idioma: el texto del aviso lo arma el propio teléfono.
CREATE TABLE IF NOT EXISTS suscripciones (
  id TEXT PRIMARY KEY,            -- huella SHA-256 de la dirección (para no repetir y poder borrar)
  endpoint TEXT NOT NULL,         -- dirección de avisos del navegador (Google, Apple, Mozilla o Microsoft)
  hora_utc INTEGER NOT NULL,      -- 0 a 23
  creado TEXT NOT NULL,           -- día en que se activó
  ultimo TEXT,                    -- último día en que se intentó avisar (uno por día)
  fallos INTEGER NOT NULL DEFAULT 0
);
CREATE INDEX IF NOT EXISTS por_hora ON suscripciones (hora_utc, ultimo);
-- Cuenta diaria de envíos por servicio y resultado, sin nada de la persona: sirve para saber si los avisos están llegando.
CREATE TABLE IF NOT EXISTS envios (
  dia TEXT NOT NULL, servicio TEXT NOT NULL, estado INTEGER NOT NULL, n INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (dia, servicio, estado)
);
