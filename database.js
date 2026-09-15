const { DatabaseSync } = require('node:sqlite');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');

const dbDir = path.join(__dirname, 'database');
const dbPath = path.join(dbDir, 'escuela.db');

if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new DatabaseSync(dbPath);

db.exec(`
  CREATE TABLE IF NOT EXISTS reportes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    categoria TEXT NOT NULL,
    ubicacion TEXT NOT NULL,
    descripcion TEXT NOT NULL,
    imagen TEXT,
    estado TEXT NOT NULL DEFAULT 'Pendiente',
    fecha TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS admin (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    usuario TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL
  );
`);

const adminCount = db.prepare('SELECT COUNT(*) AS count FROM admin').get().count;
if (adminCount === 0) {
  const passwordHash = bcrypt.hashSync('admin123', 10);
  db.prepare('INSERT INTO admin (usuario, password) VALUES (?, ?)').run('admin', passwordHash);
  console.log('Usuario admin creado: admin / admin123');
}

module.exports = db;