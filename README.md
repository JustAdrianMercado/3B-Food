# EcoRescate Cochabamba

Sitio web para encontrar, reservar y retirar excedentes alimentarios aptos para el consumo de restaurantes y supermercados de Cochabamba, y panel para que los establecimientos gestionen sus lotes, ofertas y entregas.

## Stack

- **Next.js 16** (App Router, Server Actions), **React 19**, **TypeScript**, Tailwind CSS 4, Motion.
- **Supabase (Postgres)** provisionado con la integración de Vercel Marketplace. Toda lectura y escritura pasa por el servidor con la clave de servicio; las tablas tienen RLS sin políticas y las funciones no son ejecutables con la clave pública.
- Reglas de negocio transaccionales en SQL (`supabase/migrations`): reservar, cancelar, confirmar retiro, vencer reservas, publicar, cambiar precio y pausar, con bloqueo de filas para evitar sobre-reservas.
- Pruebas: `node:test` (dominio y reglas de la base de datos) y Playwright con axe (recorridos y accesibilidad).

## Estructura del sitio

| Área | Rutas |
| --- | --- |
| Público | `/`, `/ofertas`, `/ofertas/[id]`, `/establecimientos`, `/establecimientos/[slug]`, `/como-funciona`, `/negocios`, `/negocios/unirse`, `/nosotros`, `/preguntas-frecuentes`, `/contacto`, `/mis-reservas` |
| Establecimientos | `/panel`, `/panel/inventario`, `/panel/reservas`, `/panel/indicadores` |
| Administración (sin enlace público) | `/admin`, `/admin/solicitudes`, `/admin/mensajes` |

«Mis reservas» identifica a cada visitante con una cookie anónima (`eco_cid`); el establecimiento seleccionado en el panel se guarda en `eco_panel_est`.

> **Todavía no hay autenticación.** Cualquiera que conozca la URL puede usar `/panel` y `/admin`. Mantén la URL privada hasta incorporar cuentas y permisos por establecimiento.

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
| `npm run db:seed` | Reemplaza establecimientos, ofertas, reservas e historial con datos de ejemplo |

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
