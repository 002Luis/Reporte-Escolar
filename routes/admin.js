const express = require('express');
const bcrypt = require('bcryptjs');
const db = require('../database');

const router = express.Router();

const ESTADOS = ['Pendiente', 'En revisión', 'Resuelto'];

router.get('/login', (req, res) => {
  res.render('admin/login');
});

router.post('/login', (req, res) => {
  const { usuario, password } = req.body;
  const admin = db.prepare('SELECT * FROM admin WHERE usuario = ?').get(usuario);

  if (!admin || !bcrypt.compareSync(password, admin.password)) {
    return res.status(401).render('admin/login', { error: 'Usuario o contraseña incorrectos' });
  }

  req.session.admin = { id: Number(admin.id), usuario: admin.usuario };
  res.redirect('/admin');
});

router.post('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/admin/login');
  });
});

router.use((req, res, next) => {
  if (!req.session.admin) {
    return res.redirect('/admin/login');
  }
  next();
});

router.get('/', (req, res) => {
  const estado = req.query.estado || 'Todos';
  let reportes;
  if (estado === 'Todos') {
    reportes = db.prepare('SELECT * FROM reportes ORDER BY fecha DESC').all();
  } else {
    reportes = db.prepare('SELECT * FROM reportes WHERE estado = ? ORDER BY fecha DESC').all(estado);
  }
  const conteos = {};
  for (const e of ESTADOS) {
    conteos[e] = db.prepare('SELECT COUNT(*) AS c FROM reportes WHERE estado = ?').get(e).c;
  }
  conteos['Todos'] = db.prepare('SELECT COUNT(*) AS c FROM reportes').get().c;
  res.render('admin/panel', { reportes, estados: ESTADOS, estado, conteos });
});

router.post('/reportes/:id/estado', (req, res) => {
  const { estado } = req.body;
  if (!ESTADOS.includes(estado)) {
    return res.status(400).render('error', { mensaje: 'Estado no válido' });
  }
  db.prepare('UPDATE reportes SET estado = ? WHERE id = ?').run(estado, Number(req.params.id));
  res.redirect('/admin');
});

module.exports = router;