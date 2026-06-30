# Vacaciones de invierno (test)

App chica para coordinar las 2 semanas de vacaciones de invierno y guardias de la oficina, en lugar de un Excel compartido. Cada empleado elige semana 1 o semana 2 de vacaciones (queda de guardia en la otra), con cupo configurable por equipo y por semana.

## Setup local

1. Copiar `.env.example` a `.env` y completar:
   - `DATABASE_URL`: una base Postgres (ej. gratis en [Neon](https://neon.tech) o Vercel Postgres).
   - `AUTH_SECRET`: generar con `openssl rand -base64 32`.
   - `ADMIN_EMAILS`: tu email (y los de otros admins), separados por coma.

2. Instalar dependencias y preparar la base:
   ```
   npm install
   npx prisma db push
   npm run db:seed   # carga 2 equipos y 4 empleados de ejemplo
   ```

3. Levantar la app:
   ```
   npm run dev
   ```

## Cómo funciona el acceso

No hay usuario ni contraseña: cada empleado entra con un **link personal único** (`/e/<token>`). El admin carga a cada persona desde `/admin` (nombre, email, equipo) y ahí mismo puede copiar su link para compartirlo por el canal que usen (WhatsApp, Teams, etc.). Solo quien tiene su link puede entrar, y solo puede tocar su propio casillero.

Los admins se definen por la variable `ADMIN_EMAILS`; si el email de un empleado está en esa lista, ve un link a "Admin" para crear equipos, cargar empleados, configurar cupos y exportar un CSV.

## Deploy a Vercel

1. Crear cuenta en [vercel.com](https://vercel.com) y conectar este repo (o `npx vercel`).
2. Crear una base Postgres (Vercel Postgres / Neon) y copiar la `DATABASE_URL` a las variables de entorno del proyecto en Vercel, junto con `AUTH_SECRET` y `ADMIN_EMAILS`.
3. Sincronizar el esquema contra la base de producción: `npx prisma db push`.
4. Deployar y cargar los equipos/empleados reales desde `/admin`, copiando y compartiendo el link personal de cada uno.
