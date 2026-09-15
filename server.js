const express = require('express');
const path = require('path');
const crypto = require('crypto');
const bcrypt = require('bcryptjs');
const supabase = require('./supabase');

const reportesRouter = require('./routes/reportes');
const adminRouter = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;
const SESSION_SECRET = process.env.SESSION_SECRET || 'secreto_del_proyecto';

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

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

app.use((req, res, next) => {
  let admin = null;
  const token = leerCookie(req, 'admin_token');
  if (token) {
    admin = verificarToken(token);
  }
  req.admin = admin;
  app.locals.admin = admin;
  next();
});

app.locals.admin = null;

app.use('/', reportesRouter);
app.use('/admin', adminRouter);

app.use((req, res) => {
  res.status(404).render('error', { mensaje: 'Página no encontrada' });
});

async function seedAdmin() {
  const { data: admin, error } = await supabase
    .from('admin')
    .select('usuario')
    .eq('usuario', 'admin')
    .maybeSingle();

  if (error) {
    console.error('⚠️  No se pudo verificar el admin en Supabase:', error.message);
    console.error('    Revisa que ejecutaste supabase_setup.sql en el SQL Editor.');
    return;
  }

  if (!admin) {
    const passwordHash = bcrypt.hashSync('admin123', 10);
    const { error: insertError } = await supabase
      .from('admin')
      .insert({ usuario: 'admin', password: passwordHash });

    if (insertError) {
      console.error('⚠️  No se pudo crear el usuario admin:', insertError.message);
    } else {
      console.log('Usuario admin creado: admin / admin123');
    }
  }
}

if (process.env.VERCEL) {
  module.exports = app;
} else {
  async function main() {
    await seedAdmin();
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
  }
  main().catch((err) => {
    console.error('Error al iniciar:', err.message);
    process.exit(1);
  });
}