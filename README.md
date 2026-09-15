# Reporte Escolar

Aplicación web para que los alumnos reporten problemas dentro de la escuela.

## Características
- Registrar un reporte (categoría, ubicación, descripción, imagen).
- Guardar fecha y hora automáticamente.
- Ver el estado del reporte: Pendiente, En revisión, Resuelto.
- Panel de administración para cambiar el estado de los reportes.
- Lista de todos los reportes.

## Tecnologías
- **Node.js** + **Express** (servidor)
- **SQLite** integrado via `node:sqlite` (base de datos, sin dependencia externa)
- **EJS** (plantillas HTML)
- **Multer** (subida de imágenes)
- **bcryptjs** + **express-session** (login de administrador)

## Instalación

### Requisito previo
Node.js v22.5 o superior (necesario para `node:sqlite`).

```bash
git clone https://github.com/002Luis/Reporte-Escolar.git
cd Reporte-Escolar
npm install
npm start
```

Abre http://localhost:3000

## Usuario administrador
- Usuario: `admin`
- Contraseña: `admin123`

## Estructura
```
reporte-escolar/
├── server.js            # servidor Express
├── database.js          # configuración de SQLite (node:sqlite)
├── database/            # archivo de la base de datos (auto-generado)
├── package.json
├── public/
│   ├── css/style.css    # estilos de la aplicación
│   └── uploads/         # imágenes subidas por los usuarios
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