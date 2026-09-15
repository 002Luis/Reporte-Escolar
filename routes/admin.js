const express = require('express');
const bcrypt = require('bcryptjs');
const supabase = require('../supabase');
const crypto = require('crypto');

const router = express.Router();

const ESTADOS = ['Pendiente', 'En revisión', 'Resuelto'];
const SESSION_SECRET = process.env.SESSION_SECRET || 'secreto_del_proyecto';

function firmar(dato) {
  return crypto.createHmac('sha256', SESSION_SECRET).update(dato).digest('hex');
}

function crearToken(admin) {
  const payload = Buffer.from(JSON.stringify(admin)).toString('base64');
  return `${payload}.${firmar(payload)}`;
}

function verificarToken(token) {
  const [payload, firma] = token.split('.');
  if (!payload || !firma) return null;
  if (firmar(payload) !== firma) return null;
  try {
    return JSON.parse(Buffer.from(payload, 'base64').toString());
  } catch {
    return null;
  }
}

function leerCookie(req, nombre) {
  const cookies = req.headers.cookie || '';
  const match = cookies.split(';').map((c) => c.trim()).find((c) => c.startsWith(nombre + '='));
  return match ? decodeURIComponent(match.split('=')[1]) : null;
}

router.get('/login', (req, res) => {
  res.render('admin/login');
});

router.post('/login', async (req, res) => {
  const { usuario, password } = req.body;
  const { data: admin } = await supabase
    .from('admin')
    .select('*')
    .eq('usuario', usuario)
    .maybeSingle();

  if (!admin || !bcrypt.compareSync(password, admin.password)) {
    return res.status(401).render('admin/login', { error: 'Usuario o contraseña incorrectos' });
  }

  const token = crearToken({ id: Number(admin.id), usuario: admin.usuario });
  res.cookie('admin_token', token, { httpOnly: true, maxAge: 8 * 60 * 60 * 1000 });
  res.redirect('/admin');
});

router.post('/logout', (req, res) => {
  res.clearCookie('admin_token');
  res.redirect('/admin/login');
});

router.use((req, res, next) => {
  const token = leerCookie(req, 'admin_token');
  const admin = verificarToken(token);
  if (!admin) {
    return res.redirect('/admin/login');
  }
  req.admin = admin;
  req.app.locals.admin = admin;
  next();
});

router.get('/', async (req, res) => {
  const { data: todos } = await supabase
    .from('reportes')
    .select('*')
    .order('id', { ascending: false });

  const reportes = todos || [];
  const estado = req.query.estado || 'Todos';
  const filtrados = estado === 'Todos' ? reportes : reportes.filter((r) => r.estado === estado);

  const conteos = {};
  for (const e of ESTADOS) {
    conteos[e] = reportes.filter((r) => r.estado === e).length;
  }
  conteos['Todos'] = reportes.length;

  res.render('admin/panel', { reportes: filtrados, estados: ESTADOS, estado, conteos });
});

router.post('/reportes/:id/estado', async (req, res) => {
  const { estado } = req.body;
  if (!ESTADOS.includes(estado)) {
    return res.status(400).render('error', { mensaje: 'Estado no válido' });
  }
  await supabase.from('reportes').update({ estado }).eq('id', req.params.id);
  res.redirect('/admin');
});

module.exports = router;