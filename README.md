# Reporte Escolar

Aplicación web para que los alumnos reporten problemas dentro de la escuela. Los datos se almacenan en **Supabase** (base de datos PostgreSQL y almacenamiento de imágenes en la nube).

## Características
- Registrar un reporte (categoría, ubicación, descripción, imagen).
- Guardar fecha y hora automáticamente.
- Ver el estado del reporte: Pendiente, En revisión, Resuelto.
- Panel de administración para cambiar el estado de los reportes.
- Lista de todos los reportes.
- Imágenes en Supabase Storage.
- Login de administrador integrado en la página principal.

## Tecnologías
- **Node.js** + **Express** (servidor)
- **Supabase** (PostgreSQL + Storage) con `@supabase/supabase-js`
- **EJS** (plantillas HTML)
- **Multer** (procesamiento de imágenes en memoria)
- **bcryptjs** (login de administrador con cookie firmada)

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

## Desplegar en Vercel (gratis)

1. Crea una cuenta en [vercel.com](https://vercel.com) y vincula tu GitHub.
2. En Vercel: **Add New → Project** → importa el repositorio `Reporte-Escolar`.
3. En la configuración del proyecto, agrega las variables de entorno (Environment Variables):

   | Nombre | Valor |
   |--------|-------|
   | `SUPABASE_URL` | `https://zvsenxrwlajbfdcphviu.supabase.co` |
   | `SUPABASE_ANON_KEY` | tu publishable key `sb_publishable_...` |

4. En **Build Command** deja vacío, en **Output Directory** deja vacío (Vercel usa `vercel.json`).
5. Clic en **Deploy**. Al terminar recibes tu URL pública, por ejemplo `https://reporte-escolar.vercel.app`.

> El proyecto ya incluye `vercel.json` que envía todas las rutas a la app Express.
> La base de datos y las imágenes viven en Supabase, así que no necesitas nada más.

## Usuario administrador
- Usuario: `admin`
- Contraseña: `admin123`

El usuario admin se crea automáticamente la primera vez que arranca el servidor.

## Estructura
```
reporte-escolar/
├── server.js            # servidor Express (también sirve en Vercel)
├── supabase.js          # cliente de Supabase (lee .env)
├── supabase_setup.sql   # SQL para configurar Supabase
├── vercel.json          # configuración de despliegue en Vercel
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