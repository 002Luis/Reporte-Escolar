const express = require('express');
const session = require('express-session');
const path = require('path');
const fs = require('fs');

const db = require('./database');
const reportesRouter = require('./routes/reportes');
const adminRouter = require('./routes/admin');

const app = express();
const PORT = process.env.PORT || 3000;

const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

app.use(
  session({
    secret: 'secreto_del_proyecto',
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

app.listen(PORT, () => {
  console.log('Base de datos lista.');
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});