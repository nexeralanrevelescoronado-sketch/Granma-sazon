-- Cuentas con Google (Cloudflare D1, misma base «granma-avisos»). Solo una huella del identificador de Google y el avance.
CREATE TABLE IF NOT EXISTS cuentas (
  id TEXT PRIMARY KEY,          -- SHA-256 de «google:<identificador>»: no se guarda el identificador, ni el correo, ni el nombre
  creado INTEGER NOT NULL,      -- milisegundos
  actualizado INTEGER,          -- última vez que se guardó el avance
  progreso TEXT                 -- el avance de la app (el mismo que vive en el teléfono), en JSON
);
CREATE TABLE IF NOT EXISTS sesiones (
  token TEXT PRIMARY KEY,       -- SHA-256 de la cookie de sesión (la cookie en sí solo la tiene el teléfono)
  cuenta TEXT NOT NULL,
  expira INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS sesiones_por_cuenta ON sesiones (cuenta);
