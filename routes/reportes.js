const express = require('express');
const multer = require('multer');
const path = require('path');
const db = require('../database');

const router = express.Router();

const CATEGORIAS = ['Baños', 'Mobiliario', 'Equipos de cómputo', 'Instalaciones eléctricas', 'Limpieza', 'Otros'];

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, path.join(__dirname, '..', 'public', 'uploads')),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `reporte-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const permitidos = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const ext = path.extname(file.originalname).toLowerCase();
    if (!permitidos.includes(ext)) {
      return cb(new Error('Solo se permiten imágenes (jpg, png, gif, webp)'));
    }
    cb(null, true);
  }
});

router.get('/', (req, res) => {
  const reportes = db.prepare('SELECT * FROM reportes ORDER BY fecha DESC LIMIT 6').all();
  res.render('index', { categorias: CATEGORIAS, reportes });
});

router.get('/reportes', (req, res) => {
  const reportes = db.prepare('SELECT * FROM reportes ORDER BY fecha DESC').all();
  res.render('mis-reportes', { reportes, categorias: CATEGORIAS });
});

router.get('/reportes/:id', (req, res) => {
  const reporte = db.prepare('SELECT * FROM reportes WHERE id = ?').get(req.params.id);
  if (!reporte) {
    return res.status(404).render('error', { mensaje: 'El reporte no existe' });
  }
  res.render('detalle', { reporte });
});

router.post('/reportes', upload.single('imagen'), (req, res) => {
  const { categoria, ubicacion, descripcion } = req.body;
  const imagen = req.file ? '/uploads/' + req.file.filename : null;

  if (!categoria || !ubicacion || !descripcion) {
    return res.status(400).render('error', { mensaje: 'Todos los campos son obligatorios' });
  }

  const fecha = new Date().toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' });

  const info = db
    .prepare(
      'INSERT INTO reportes (categoria, ubicacion, descripcion, imagen, estado, fecha) VALUES (?, ?, ?, ?, ?, ?)'
    )
    .run(categoria, ubicacion, descripcion, imagen, 'Pendiente', fecha);

  res.redirect(`/reportes/${Number(info.lastInsertRowid)}`);
});

module.exports = router;