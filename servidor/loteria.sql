-- Lotería en familia (Cloudflare D1, misma base «granma-avisos»). Solo apodos y avance; todo se borra a las 24 horas.
CREATE TABLE IF NOT EXISTS loteria_partidas (
  codigo TEXT PRIMARY KEY,      -- 5 letras para compartir (sin 0/O ni 1/I/L)
  semilla INTEGER NOT NULL,     -- con ella todos oyen las mismas cartas en el mismo orden
  nivel INTEGER NOT NULL,
  idioma TEXT NOT NULL,         -- 'en' o 'es': en qué idioma canta Granma
  creada INTEGER NOT NULL,      -- milisegundos; a las 24 h se borra
  inicio INTEGER,               -- a qué hora empieza para todos (null = todavía esperando)
  ganador TEXT,                 -- el APODO de quien gritó «¡Lotería!» primero
  gano_en INTEGER
);
CREATE TABLE IF NOT EXISTS loteria_jugadores (
  codigo TEXT NOT NULL,
  token TEXT NOT NULL,          -- SHA-256 del token del jugador (el token solo lo tiene su teléfono)
  numero INTEGER NOT NULL,      -- 0 = quien la creó; cada número tiene su propia tabla
  apodo TEXT NOT NULL,          -- apodo, no el nombre real
  anfitrion INTEGER NOT NULL DEFAULT 0,
  marcadas INTEGER NOT NULL DEFAULT 0,
  PRIMARY KEY (codigo, token)
);
CREATE INDEX IF NOT EXISTS loteria_jugadores_codigo ON loteria_jugadores (codigo);
