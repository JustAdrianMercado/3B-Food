# EcoRescate Cochabamba

Sitio web para encontrar, reservar y retirar excedentes alimentarios aptos para el consumo de restaurantes y supermercados de Cochabamba, y panel para que los establecimientos gestionen sus lotes, ofertas y entregas.

## Stack

- **Next.js 16** (App Router, Server Actions), **React 19**, **TypeScript**, Tailwind CSS 4, Motion.
- **Supabase (Postgres)** provisionado con la integración de Vercel Marketplace. Toda lectura y escritura pasa por el servidor con la clave de servicio; las tablas tienen RLS sin políticas y las funciones no son ejecutables con la clave pública.
- Reglas de negocio transaccionales en SQL (`supabase/migrations`): reservar, cancelar, confirmar retiro, vencer reservas, publicar, cambiar precio y pausar, con bloqueo de filas para evitar sobre-reservas.
- Pruebas: `node:test` (dominio y reglas de la base de datos) y Playwright con axe (recorridos y accesibilidad).

## Estructura del sitio

| Área | Rutas | Acceso |
| --- | --- | --- |
| Público | `/`, `/ofertas`, `/ofertas/[id]`, `/establecimientos`, `/establecimientos/[slug]`, `/como-funciona`, `/negocios`, `/nosotros`, `/preguntas-frecuentes`, `/contacto` | Libre |
| Cuentas | `/ingresar`, `/registro` (clientes), `/negocios/unirse` (registro de establecimiento en 3 pasos) | Libre |
| Clientes | `/mis-reservas` y la acción de reservar | Rol `consumidor` |
| Establecimientos | `/panel`, `/panel/inventario`, `/panel/reservas`, `/panel/historial`, `/panel/indicadores` | Rol `establecimiento` (solo su local) o `administrador` (elige el local) |
| Administración | `/admin`, `/admin/historial`, `/admin/usuarios`, `/admin/mensajes` | Rol `administrador` |

## Cuentas y roles

- Contraseñas con `scrypt` (sal aleatoria). La sesión es un token aleatorio en una cookie `httpOnly` (`eco_session`); en la base solo se guarda su hash SHA-256 (`sessions`).
- Los layouts de `/panel` y `/admin` y la página `/mis-reservas` verifican el rol en el servidor; cada Server Action vuelve a comprobarlo. Las funciones SQL validan que quien reserva sea una cuenta de cliente y que quien cancela sea el titular o el establecimiento.
- `npm run db:seed` crea las cuentas iniciales con la contraseña `SEED_PASSWORD` de `src/lib/seed.ts`:

| Rol | Correo |
| --- | --- |
| Administración | `admin@ecorescate.bo` |
| Establecimiento (uno por local) | `laespiga@ecorescate.bo`, `cocinadebarrio@ecorescate.bo`, `mercadoverde@ecorescate.bo`, … (lista en `src/lib/seed.ts`) |
| Cliente | `ana.rojas@correo.bo`, `luis.fernandez@correo.bo`, … |

> Cambia estas contraseñas (o vuelve a cargar los datos sin cuentas iniciales) antes de abrir el sitio a usuarios reales.

## Configuración local

Requisitos: Node.js 22 o posterior y acceso al proyecto de Vercel.

```bash
npm ci
vercel link                      # una vez
vercel env pull .env.local --yes # variables de Supabase
npm run db:migrate               # crea o actualiza el esquema
npm run db:seed                  # carga datos de ejemplo (reemplaza ofertas y reservas)
npm run dev
```

Abrir **http://localhost:3000**. En PowerShell, si la política bloquea `npm.ps1`, usar `npm.cmd`.

Variables usadas: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY` (o `SUPABASE_SECRET_KEY`) para la app y `POSTGRES_URL_NON_POOLING` para los scripts. Opcional: `NEXT_PUBLIC_SITE_URL` para el sitemap y las URL de Open Graph (por defecto se usa el dominio de producción de Vercel).

## Scripts

| Comando | Qué hace |
| --- | --- |
| `npm run dev` / `build` / `start` | Desarrollo, compilación y servidor de producción |
| `npm run typecheck`, `npm run lint` | Verificación de tipos y estilo |
| `npm test` | Reglas de dominio (sin base de datos) |
| `npm run test:db` | Reglas SQL contra Supabase; cada prueba se revierte |
| `npm run test:e2e` | Playwright; requiere `npm run build` antes |
| `npm run db:migrate` | Aplica las migraciones pendientes de `supabase/migrations` |
| `npm run db:seed` | Reemplaza establecimientos, cuentas, ofertas, reservas, historial y mensajes con los datos iniciales (fechas relativas al momento de la carga) |

> **Importante:** la integración conectó la misma base de datos a desarrollo, preview y producción. `npm run db:seed` y `npm run test:e2e` (que vuelve a cargar los datos de ejemplo) **reemplazan los datos reales**. Antes de recibir usuarios reales, crea una base separada para desarrollo o ejecuta las pruebas E2E con `E2E_RESEED=0`.

Playwright usa Microsoft Edge si está instalado en su ruta habitual de Windows. En otro equipo, ejecutar `npx playwright install chromium` o definir `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`.

## Organización

```text
src/app/(sitio)/   Páginas públicas (cabecera y pie de página)
src/app/(panel)/   Panel de establecimientos y administración
src/components/    Interfaz y formularios
src/lib/domain.ts  Tipos, validaciones e indicadores
src/lib/actions.ts Server Actions (todas las escrituras)
src/lib/db/        Cliente de Supabase solo para servidor y consultas
supabase/          Migraciones SQL
scripts/           Migración, datos de ejemplo y utilidades
tests/             Pruebas de dominio, base de datos y navegador
docs/              Material de investigación del proyecto
legacy/            Prototipo HTML/CSS/JS original
```

## Políticas del servicio

El retiro es presencial y el pago se acuerda con el establecimiento; EcoRescate no procesa pagos ni gestiona envíos. Cada establecimiento respalda la aptitud para el consumo de lo que publica, y no se publican productos vencidos ni ofertas fuera de plazo. Fotografías y licencias: [créditos](docs/creditos-imagenes.md).
