const express = require('express');
const multer = require('multer');
const supabase = require('../supabase');

const router = express.Router();

const CATEGORIAS = ['Baños', 'Mobiliario', 'Equipos de cómputo', 'Instalaciones eléctricas', 'Limpieza', 'Otros'];

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const permitidos = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const ext = file.originalname.split('.').pop().toLowerCase();
    if (!permitidos.includes('.' + ext)) {
      return cb(new Error('Solo se permiten imágenes (jpg, png, gif, webp)'));
    }
    cb(null, true);
  }
});

async function subirImagen(buffer, nombreOriginal) {
  const ext = nombreOriginal.split('.').pop().toLowerCase();
  const nombreArchivo = `reporte-${Date.now()}-${Math.round(Math.random() * 1e9)}.${ext}`;
  const contentType = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    gif: 'image/gif',
    webp: 'image/webp'
  }[ext] || 'application/octet-stream';

  const { error } = await supabase.storage.from('reportes').upload(nombreArchivo, buffer, {
    contentType
  });
  if (error) throw new Error(`No se pudo subir la imagen: ${error.message}`);

  const { data } = supabase.storage.from('reportes').getPublicUrl(nombreArchivo);
  return data.publicUrl;
}

router.get('/', async (req, res) => {
  const { data: reportes } = await supabase
    .from('reportes')
    .select('*')
    .order('id', { ascending: false })
    .limit(6);
  res.render('index', { categorias: CATEGORIAS, reportes: reportes || [] });
});

router.get('/reportes', async (req, res) => {
  const { data: reportes } = await supabase
    .from('reportes')
    .select('*')
    .order('id', { ascending: false });
  res.render('mis-reportes', { reportes: reportes || [], categorias: CATEGORIAS });
});

router.get('/reportes/:id', async (req, res) => {
  const { data } = await supabase.from('reportes').select('*').eq('id', req.params.id).maybeSingle();
  if (!data) {
    return res.status(404).render('error', { mensaje: 'El reporte no existe' });
  }
  res.render('detalle', { reporte: data });
});

router.post('/reportes', upload.single('imagen'), async (req, res) => {
  const { categoria, ubicacion, descripcion } = req.body;

  if (!categoria || !ubicacion || !descripcion) {
    return res.status(400).render('error', { mensaje: 'Todos los campos son obligatorios' });
  }

  let imagen = null;
  if (req.file) {
    imagen = await subirImagen(req.file.buffer, req.file.originalname);
  }

  const fecha = new Date().toLocaleString('es-MX', { dateStyle: 'short', timeStyle: 'short' });

  const { data, error } = await supabase
    .from('reportes')
    .insert([{ categoria, ubicacion, descripcion, imagen, estado: 'Pendiente', fecha }])
    .select()
    .single();

  if (error) {
    return res.status(500).render('error', { mensaje: `Error al guardar: ${error.message}` });
  }

  res.redirect(`/reportes/${data.id}`);
});

module.exports = router;