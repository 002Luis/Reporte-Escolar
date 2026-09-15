# Reporte Escolar

Aplicación web para que los alumnos reporten problemas dentro de la escuela. Los datos se almacenan en **Supabase** (base de datos PostgreSQL y almacenamiento de imágenes en la nube).

## Características
- Registrar un reporte (categoría, ubicación, descripción, imagen).
- Guardar fecha y hora automáticamente.
- Ver el estado del reporte: Pendiente, En revisión, Resuelto.
- Panel de administración para cambiar el estado de los reportes.
- Lista de todos los reportes.
- Imágenes en Supabase Storage.

## Tecnologías
- **Node.js** + **Express** (servidor)
- **Supabase** (PostgreSQL + Storage) con `@supabase/supabase-js`
- **EJS** (plantillas HTML)
- **Multer** (procesamiento de imágenes en memoria)
- **bcryptjs** + **express-session** (login de administrador)

## Configuración de Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. Abre el **SQL Editor** de tu proyecto y ejecuta el contenido de `supabase_setup.sql`. Esto crea:
   - Las tablas `reportes` y `admin`.
   - Políticas de seguridad (RLS) para la app.
   - El bucket público `reportes` para las imágenes.
3. En **Settings → API** copia la *Project URL* y la *anon public key*.

## Instalación

### Requisito previo
Node.js v22.5 o superior.

```bash
git clone https://github.com/002Luis/Reporte-Escolar.git
cd Reporte-Escolar
npm install
```

Crea tu archivo de configuración:
```bash
cp .env.example .env
```
Llena `.env` con los datos de tu proyecto:
```
SUPABASE_URL=https://tu_codigo.supabase.co
SUPABASE_ANON_KEY=tu_anon_key
```

Inicia la aplicación:
```bash
npm start
```

Abre http://localhost:3000

## Usuario administrador
- Usuario: `admin`
- Contraseña: `admin123`

El usuario admin se crea automáticamente la primera vez que arranca el servidor.

## Estructura
```
reporte-escolar/
├── server.js            # servidor Express
├── supabase.js          # cliente de Supabase (lee .env)
├── supabase_setup.sql   # SQL para configurar Supabase
├── .env.example         # plantilla de configuración
├── package.json
├── public/
│   └── css/style.css    # estilos de la aplicación
├── views/
│   ├── index.ejs        # página principal + formulario de reporte
│   ├── mis-reportes.ejs # lista de todos los reportes
│   ├── detalle.ejs      # detalle de un reporte
│   ├── error.ejs        # página de error
│   ├── parciales/       # header y footer compartidos
│   └── admin/
│       ├── login.ejs    # login del administrador
│       └── panel.ejs    # panel para gestionar reportes
└── routes/
    ├── reportes.js      # rutas públicas (crear, listar, ver)
    └── admin.js         # rutas de administración
```