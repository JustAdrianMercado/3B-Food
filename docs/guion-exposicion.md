# Guion de exposición: 6–8 minutos

Sitio: **https://ecorescate-chi.vercel.app** (producción en Vercel, base de datos Supabase). Tres integrantes; una computadora para la demostración y, si es posible, un celular para mostrar el diseño adaptable.

## Cuentas para la demostración

Todas usan la contraseña `Rescate2026`.

| Rol | Correo | Para mostrar |
| --- | --- | --- |
| Administración | `admin@ecorescate.bo` | Indicadores globales, historial de toda la plataforma, usuarios y roles, mensajes |
| Establecimiento | `laespiga@ecorescate.bo` (La Espiga de Tupuraya) | Panel, alertas, inventario PEPS, publicar, confirmar retiros |
| Cliente | `ana.rojas@correo.bo` (Ana Rojas) | Reservar, Mis reservas, cancelar |

Otros locales: `cocinadebarrio@`, `mercadoverde@`, `mesarecoleta@`, `cafeelprado@`, `saboresqueru@`, `supersarco@`, `muyurina@`, `donajulia@`, `despensahipodromo@` (todos `@ecorescate.bo`).

## Preparación (10 minutos antes)

1. Si quieres los datos «frescos» (ofertas vigentes desde ahora y hasta la noche), ejecuta `npm run db:seed` en la carpeta del proyecto. Recarga ofertas, reservas e historial con fechas relativas al momento de la carga. **Borra cualquier cuenta u oferta creada durante el ensayo.**
2. Abre tres ventanas: una normal (cliente), una de incógnito (establecimiento) y otra de otro navegador o perfil (administración). Cada ventana conserva su propia sesión.
3. Prepara el ejemplo para publicar: **Empanadas de queso del día**, 12 unidades, precio habitual Bs 7, oferta Bs 4.

## Integrante 1 · Problema y propuesta · 0:00–1:30

Mostrar el inicio y el catálogo.

> El informe identifica tres dificultades en restaurantes y supermercados de Cochabamba: se reconocen tarde los excedentes, el inventario se registra y rota de forma inadecuada y la comunicación con los consumidores llega tarde. EcoRescate es una solución web responsiva que conecta el inventario de excedentes con su publicación, reserva y entrega, cuando todavía son aptos para el consumo.

Mostrar: filtros por categoría y **zona**, búsqueda, «Solo próximas a su límite», detalle de una oferta (precio, descuento, horario de retiro, dirección, tipo de fecha, aptitud declarada por el local).

## Integrante 2 · Roles, establecimiento y cliente · 1:30–5:00

1. **Registro y autenticación con perfiles.** Sin sesión, pulsar «Reservar»: el sistema pide ingresar. Mostrar `/registro` (cliente: 3 datos) y `/negocios/unirse` (negocio: asistente de 3 pasos). Explicar que cada rol solo ve su espacio: una clienta que abre `/panel` recibe el aviso «Esta sección requiere una cuenta de establecimiento».
2. **Panel del establecimiento** (La Espiga): tarjetas de ofertas vigentes, **alertas preventivas** («A tiempo de aprovechar», con la anticipación que define cada oferta) y contadores en el menú.
3. **Inventario:** alternar «PEPS · Ingreso» y «Fecha límite». Pausar y reactivar una oferta. **Editar precio:** el descuento se recalcula en vivo y las reservas existentes conservan su precio.
4. **Publicar excedente** en 5 pasos cortos: Producto → Cantidad y precio (muestra el % de descuento) → Retiro (tiempo límite) → Fechas (vencimiento o consumo preferente, e ingreso para el orden PEPS) → Revisar y declarar aptitud. En esta versión, registrar el producto en el inventario y publicarlo se hacen en el mismo formulario. Mostrar también **«Registrar lotes (Excel)» · Próximamente** junto a «Publicar excedente» y la tarjeta en Inventario: el registro masivo de lotes desde una planilla es la siguiente funcionalidad.
5. **Cliente** (Ana): buscar la oferta publicada, reservar, mostrar el código y «Mis reservas».

> El precio lo fija el establecimiento. La reserva descuenta existencias en una transacción de la base de datos, así que dos personas no pueden reservar la última unidad a la vez. El retiro es presencial y el pago se acuerda en el local.

## Integrante 3 · Entrega, seguimiento y reportes · 5:00–7:30

1. En el panel: **Reservas y retiros** → buscar el código → «Confirmar retiro» (verificación manual).
2. **Historial:** filtrar por Publicación, Reserva, Retiro, Cancelación, Plazo finalizado o Cambio de precio; paginación y exportación CSV.
3. **Mis indicadores:** publicado, por retirar y retirado por unidad (kg, unidades y porciones nunca se suman) y proporción retirada.
4. **Administración:** indicadores globales con filtro por establecimiento y período, CSV, historial global y **Usuarios y roles**.
5. Cerrar con las pruebas funcionales: reglas de dominio, reglas SQL (concurrencia, permisos) y recorridos automatizados con Playwright, incluida una auditoría de accesibilidad.

## Preguntas previsibles

| Pregunta | Respuesta precisa |
| --- | --- |
| ¿Los datos son reales? | Son datos simulados con nombres y operaciones verosímiles para mostrar el funcionamiento. El piloto con establecimientos voluntarios es la etapa siguiente del informe. |
| ¿Cómo se protegen las cuentas? | Contraseñas cifradas con scrypt, sesión en cookie `httpOnly` y verificación del rol en el servidor en cada página y operación. La base no es accesible con la clave pública. |
| ¿Cómo evitan vender alimentos vencidos? | Al publicar se valida que el tiempo límite no supere la fecha del alimento; las ofertas fuera de plazo se cierran solas y no admiten reservas. |
| ¿Quién garantiza la inocuidad? | El establecimiento declara la aptitud y la conservación. La plataforma no certifica calidad sanitaria (límite del informe). |
| ¿Cuánto desperdicio redujeron? | Todavía no hay mediciones de campo; los reportes están listos para registrar lo publicado, reservado y entregado durante el piloto. |
| ¿Se puede pagar o pedir delivery? | No, por diseño: el informe excluye pagos integrados y reparto en la primera versión. |
| ¿Notificaciones? | Las alertas aparecen en el panel según la anticipación de cada lote; no se promete un aviso fijo de 48 horas porque algunos alimentos duran menos. |

## Si falla algo

- **Pocas ofertas o «Retiro aún no disponible»:** ejecutar `npm run db:seed` para renovar las fechas.
- **No deja entrar al panel:** revisar que la sesión sea de una cuenta de establecimiento o administración (menú de cuenta, arriba a la derecha).
- **Sin internet:** el sitio muestra una pantalla informativa; tener capturas del ensayo como respaldo.
