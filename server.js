const express = require('express');
const session = require('express-session');
const path = require('path');
const bcrypt = require('bcryptjs');
const supabase = require('./supabase');

const reportesRouter = require('./routes/reportes');
const adminRouter = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
    secret: process.env.SESSION_SECRET || 'secreto_del_proyecto',
    resave: false,
    saveUninitialized: true
  })
);

app.use((req, res, next) => {
  app.locals.admin = req.session.admin || null;
  next();
});

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