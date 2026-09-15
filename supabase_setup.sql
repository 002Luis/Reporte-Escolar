-- =============================================================
-- Reporte Escolar - Configuración de Supabase
-- Ejecuta este script en: SQL Editor de tu proyecto Supabase
-- =============================================================

-- 1. Tabla de reportes
create table if not exists public.reportes (
  id bigserial primary key,
  created_at timestamptz default now(),
  categoria text not null,
  ubicacion text not null,
  descripcion text not null,
  imagen text,
  estado text not null default 'Pendiente'
    check (estado in ('Pendiente', 'En revisión', 'Resuelto')),
  fecha text not null
);

-- 2. Tabla de administradores
create table if not exists public.admin (
  id bigserial primary key,
  created_at timestamptz default now(),
  usuario text not null unique,
  password text not null
);

-- 3. Permisos (RLS): la app usa la "anon key", habilitamos acceso
alter table public.reportes enable row level security;
alter table public.admin enable row level security;

-- reportes: leer, crear y actualizar
create policy "anon leer reportes" on public.reportes
  for select to anon using (true);

create policy "anon crear reportes" on public.reportes
  for insert to anon with check (true);

create policy "anon actualizar reportes" on public.reportes
  for update to anon using (true) with check (true);

-- admin: leer (para verificar login) e insertar (para crear el usuario inicial)
create policy "anon leer admin" on public.admin
  for select to anon using (true);

create policy "anon crear admin" on public.admin
  for insert to anon with check (true);

-- 4. Bucket para imágenes (público)
insert into storage.buckets (id, name, public)
select 'reportes', 'reportes', true
where not exists (
  select 1 from storage.buckets where id = 'reportes'
);

create policy "anon leer imagenes" on storage.objects
  for select to anon using (bucket_id = 'reportes');

create policy "anon subir imagenes" on storage.objects
  for insert to anon with check (bucket_id = 'reportes');

create policy "anon actualizar imagenes" on storage.objects
  for update to anon using (bucket_id = 'reportes') with check (bucket_id = 'reportes');

-- 5. Usuario admin inicial (contraseña: admin123)
--    Nota: el servidor también lo crea automáticamente al iniciar
--    si la tabla está vacía. Puedes omitir este paso.
insert into public.admin (usuario, password)
select 'admin', '$2a$10$X9rOapnBG2hM9NsF1rRV3etVvUWOW1TclJxyuhU9Kd.BmzSCDbuYi'
where not exists (select 1 from public.admin where usuario = 'admin');