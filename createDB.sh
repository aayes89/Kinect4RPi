#!/bin/bash

# Crea la base de datos
sqlite3 BD/db.db <<EOF
-- Crea la tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT NOT NULL,
    password TEXT NOT NULL
);

-- Inserta datos de ejemplo en la tabla de usuarios
INSERT INTO users (username, password) VALUES ('slam', 'YXllc3BlcmRp');
EOF
