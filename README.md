# EcoRescate Cochabamba

Demostración académica del segundo entregable de **Metodología de la Investigación**, Ingeniería de Sistemas. Ilustra una propuesta para identificar, gestionar y comercializar oportunamente excedentes alimentarios aptos para el consumo en restaurantes y supermercados participantes de Cochabamba.

**La entrega del jueves 12 de noviembre de 2026 es una demo interactiva.** Los establecimientos son ficticios, los datos se guardan en este navegador y los indicadores no constituyen resultados de campo. No se requiere una cuenta, una base de datos ni variables de entorno.

## Ejecutar

Requisito: Node.js 22 o posterior.

```bash
npm ci
npm run dev
```

Abrir **http://localhost:3000**. En PowerShell, si la política bloquea `npm.ps1`, utilizar `npm.cmd ci` y `npm.cmd run dev`.

Para la exposición, utilizar la compilación optimizada:

```bash
npm run build
npm start
```

El modo de producción habilita el service worker de la PWA. Las fotografías y las fuentes están incluidas y se sirven localmente. La aplicación necesita conexión con su servidor; la pantalla sin conexión explica cómo volver a entrar. En un teléfono, la instalación PWA exige HTTPS; `localhost` se considera seguro en el mismo equipo. Una IP de la red local mediante HTTP permite probar el diseño, pero no garantiza instalación o acceso al portapapeles.

## Recorrido de demostración

1. Abrir el inicio y usar **Restablecer demo**, en el pie de página, para generar ejemplos con fechas vigentes.
2. Entrar a **Mi negocio / Establecimiento · demo**, publicar un lote y revisar sus existencias.
3. Ir a **Explorar ofertas**, encontrar el producto y reservar una cantidad.
4. Abrir **Mis reservas**, comprobar el código y recargar: la reserva se conserva.
5. Volver al panel del establecimiento, abrir **Reservas y retiros** y confirmar manualmente la entrega durante el horario configurado.
6. Consultar **Mis indicadores** o **Administrador · demo** y exportar el resumen CSV.
7. Mostrar **El proyecto** para explicar la relación con la investigación, los límites y las próximas etapas.

Los registros iniciales incluyen reservas y retiros de ejemplo. Todos pertenecen a una cuenta ficticia de demostración. El selector cambia de vista y no representa autenticación ni autorización real.

## Funciones incluidas

- Next.js App Router, TypeScript, Tailwind CSS y Motion para React.
- Diseño para móvil, tablet y escritorio, navegación táctil, diálogos nativos con control de foco y movimiento reducido.
- Búsqueda por producto/establecimiento, categoría, zona registrada, precio publicado, descuento y plazo.
- Lotes con ingreso PEPS, fecha alimentaria, límite comercial, ventana de retiro y alertas configurables en el panel.
- Publicación, modificación de precio y pausa/reactivación de ofertas vigentes.
- Reserva, cancelación, confirmación manual de retiro e historial de movimientos.
- Cantidades enteras para unidades y porciones; decimales para kg.
- Indicadores separados por unidad de medida, filtros por establecimiento/período y exportación CSV.
- Persistencia local validada, recuperación de datos incompatibles y restablecimiento de ejemplos.
- Manifiesto PWA, iconos y pantalla informativa sin conexión. El service worker no guarda páginas de usuario ni APIs.

## Verificar

```bash
npm run typecheck
npm run lint
npm test
npm run build
npm run test:e2e
```

Playwright utiliza Microsoft Edge si está instalado en su ruta habitual de Windows. En otro equipo, ejecutar una vez `npx playwright install chromium`, o indicar `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`. Las pruebas E2E inician la compilación de producción en el puerto 3100; requieren ejecutar `npm run build` antes. Se puede usar un servidor existente con `PLAYWRIGHT_BASE_URL`.

El script `node scripts/review-ui.mjs` genera capturas locales en `tmp/qa` de un servidor en el puerto 3000. Esa carpeta y los reportes de pruebas están excluidos de Git.

## Organización

```text
src/app/          Rutas, metadatos y estilos de la aplicación
src/components/  Interfaz, formularios y proveedor de la demo
src/lib/         Modelo, reglas de negocio, datos ficticios y utilidades
public/          Fotografías locales, iconos y soporte PWA
tests/           Pruebas del dominio y recorridos de navegador
docs/            Investigación, trazabilidad, protocolo y guion de exposición
scripts/         Herramientas de imágenes, iconos y revisión visual
legacy/          Prototipo HTML/CSS/JS original, conservado como referencia
```

## Decisiones y límites

Cada lote de excedente se publica una sola vez y tiene una oferta en esta versión. El total publicado es su cantidad inicial; reservar descuenta existencias, retirar confirma la reserva sin descontar de nuevo, y cancelar libera la cantidad una sola vez. Terminar el plazo no reactiva ofertas. Un cambio de precio no modifica reservas anteriores.

Los reportes seleccionan ofertas por fecha de publicación y muestran el estado actual de sus reservas. La proporción retirada se calcula por unidad homogénea: `(retirado / publicado) × 100`. No equivale a una reducción medida del desperdicio.

Fechas y horarios se interpretan para `America/La_Paz` (UTC−4). Las alertas se actualizan al abrir el panel y mientras está abierto; no son notificaciones push. La consulta por ubicación utiliza zonas y direcciones de ejemplo; no determina la ubicación GPS ni calcula distancias.

La persistencia local no es una base de datos multiusuario ni garantiza transacciones entre pestañas o dispositivos. Para el piloto real se contempla Supabase, autenticación, permisos por establecimiento, reservas transaccionales y mediciones con participantes voluntarios. No se procesan pagos ni se gestiona reparto; el oferente respalda la aptitud alimentaria y la plataforma no certifica inocuidad.

Documentación para la entrega: [guion](docs/guion-exposicion.md), [trazabilidad](docs/trazabilidad.md), [protocolo del piloto](docs/protocolo-piloto.md) y [base conceptual](docs/base-conceptual.md). Fotografías y licencias: [créditos](docs/creditos-imagenes.md).
