# Backend — GLinks CR

API REST para el sistema CRUD de GLinks Costa Rica.
Desarrollado por Jimena Méndez y Ricardo Arce.

---

## Requisitos previos

- **Node.js** v20 o superior
- **PostgreSQL** 14 o superior, instalado y corriendo

---

## Inicialización del ambiente

### 1. Crear la base de datos en PostgreSQL

Entrar a PostgreSQL y crear la base de datos:

```bash
sudo -u postgres psql
```

```sql
CREATE DATABASE glinks;
CREATE USER ricardo WITH PASSWORD 'asdf';
GRANT ALL PRIVILEGES ON DATABASE glinks TO ricardo;
\q
```

Si tu usuario de base de datos es diferente, ajusta los datos en el paso siguiente.

### 2. Configurar el archivo `.env`

Crear el archivo `backend/.env`. Hay un ejemplo del formato en `.env.example`:

```env
DATABASE_URL="postgresql://ricardo:asdf@localhost:5432/glinks"
JWT_SECRET="cambiar-esta-clave-secreta-en-produccion"
JWT_EXPIRES_IN="24h"
PORT=3000
```

### 3. Instalar dependencias

```bash
npm install
```

### 5. Generar el cliente de Prisma

```bash
npx prisma generate
```

### 6. Crear las tablas en la base de datos

```bash
npx prisma db push
```

Si hay tablas existentes y Prisma pide confirmación, usar:

```bash
npx prisma db push --accept-data-loss
```

### 7. Ejecutar el servidor

```bash
npm run dev
```

### 8. Verificar que funciona

```bash
curl http://localhost:3000/api/health
```

Respuesta esperada:

```json
{"success":true,"data":{"status":"ok","timestamp":"2026-05-05T..."}}
```

> La contraseña debe tener **mínimo 12 caracteres** (requisito OWASP ASVS).

---

## API Endpoints

| Módulo | Endpoints |
|---|---|
| **Auth** | `POST /api/auth/login`, `POST /api/auth/register`, `GET /api/auth/me` |
| **Clientes Físicos** | `GET/POST /api/clientes-fisicos`, `GET/PUT/DELETE /:id`, `GET /search?nombre=&cedula=&sectorial=` |
| **Clientes Jurídicos** | `GET/POST /api/clientes-juridicos`, `GET/PUT/DELETE /:id`, `GET /search?nombreEmpresa=&cedulaJuridica=&sectorial=` |
| **Mantenimientos** | `GET/POST /api/mantenimientos/fisicos`, `GET/POST /api/mantenimientos/juridicos` |
| **Inventario** | `GET/POST /api/productos`, `GET/PUT/DELETE /:id`, `PATCH /:id/baja`, `GET /resumen` |
| **Facturación** | `GET /api/facturas`, `GET /:id`, `POST /fisicos`, `POST /juridicos`, `PATCH /:id/anular` |
| **Health** | `GET /api/health` |

---

## Scripts disponibles

| Comando | Descripción |
|---|---|
| `npm run dev` | Desarrollo con hot-reload |
| `npm run build` | Compilar a JS en `dist/` |
| `npm start` | Correr desde `dist/` |
| `npm run db:generate` | Regenerar Prisma Client |
| `npm run db:push` | Sincronizar schema con BD |
| `npm run lint` | ESLint |
