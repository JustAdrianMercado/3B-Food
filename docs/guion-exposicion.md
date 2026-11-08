# Guion de exposición: 5–7 minutos

Entrega prevista: jueves 12 de noviembre de 2026. Tres integrantes; una computadora para la demostración y, si es posible, un celular para mostrar el diseño adaptable.

## Preparación

1. Ejecutar `npm run build` y `npm start` antes de la exposición. Abrir `http://localhost:3000` y comprobar las fotografías.
2. Pulsar **Restablecer demo** en el pie de página. Esto elimina cambios de ensayo y renueva las fechas.
3. Preparar pestañas de inicio, establecimiento, catálogo, reservas, administrador y proyecto.
4. Mantener la conexión con el servidor. Las fuentes y fotos son locales, pero las rutas se sirven desde Next.js.
5. Dejar preparado un ejemplo llamado **Pack de panadería del día**, con 3 unidades, precio habitual Bs 30 y oferta Bs 18. Usar horarios que incluyan la hora de exposición, una fecha alimentaria vigente y una descripción de conservación/alérgenos.

## Integrante 1 · Problema y propósito · 0:00–1:30

Mostrar inicio y **El proyecto**.

> Investigamos el desperdicio de alimentos aptos para el consumo en restaurantes y supermercados de Cochabamba. El informe identifica tres dificultades: reconocer tarde los excedentes, registrar y rotar inadecuadamente el inventario y comunicar las ofertas cuando ya queda poco tiempo para comercializarlas.
>
> Proponemos una solución web y móvil que conecte la gestión de los lotes con la publicación de ofertas y su reserva por consumidores. Esta entrega es una demostración de los alcances: los locales son ficticios y no presentamos resultados de un piloto real.

Relacionar los tres objetivos con alertas, inventario y publicación/reserva. Mostrar brevemente la adaptación a celular.

## Integrante 2 · Establecimiento y consumidor · 1:30–4:30

1. Entrar al panel de **La Espiga de Tupuraya**.
2. Mostrar que PEPS se ordena por ingreso y que priorizar el límite comercial es otro criterio. No decir que una fecha de consumo preferente equivale a vencimiento.
3. Mostrar la alerta configurable. Explicar que no se fija una anticipación universal de 48 horas.
4. Publicar el ejemplo con **Registrar y publicar oferta**.
5. Cambiar a consumidor y localizar el producto en el catálogo. Mostrar zona, contenido, precio por unidad y horario presencial.
6. Reservar una unidad. Mostrar el código y **Mis reservas**. Recargar para demostrar persistencia local.

> El precio lo establece el oferente. La reserva descuenta una cantidad disponible. El retiro es presencial y el pago se acuerda fuera de la plataforma; no hay cobros bancarios ni servicio de reparto.

## Integrante 3 · Entrega, seguimiento y evaluación · 4:30–6:30

1. Volver a **Reservas y retiros** del establecimiento.
2. Verificar el código y confirmar la entrega manualmente. La cantidad no se descuenta dos veces.
3. Mostrar el historial y los indicadores. Elegir una unidad y explicar la proporción retirada.
4. Descargar el CSV si el tiempo lo permite.
5. Abrir los próximos pasos de **El proyecto**.

> Una reserva pendiente no es un alimento entregado. Por eso se distinguen publicaciones, reservas y retiros. Los kg, las porciones y las unidades nunca se suman en un total indiferenciado.
>
> Los indicadores de la demo describen operaciones simuladas; no demuestran una reducción del desperdicio. Para evaluar la solución necesitamos incorporar autenticación, una base compartida, reservas seguras entre usuarios y un piloto con participación voluntaria y mediciones comparables.

## Preguntas previsibles

| Pregunta | Respuesta precisa |
| --- | --- |
| ¿Ya funciona con usuarios reales? | Esta entrega funciona como demo local. Las cuentas, permisos y datos compartidos pertenecen a la siguiente etapa con Supabase. |
| ¿Cómo evitan vender alimentos vencidos? | La demo valida fechas, aptitud declarada y plazo comercial; fuera de plazo no permite reservar. En el sistema real estas validaciones también se harán en servidor. |
| ¿Quién garantiza la inocuidad? | El establecimiento respalda la aptitud y conservación. La plataforma no certifica calidad sanitaria ni reemplaza cadena de frío o higiene. |
| ¿Cuánto desperdicio redujeron? | Todavía no hay una medición de campo que permita afirmarlo. Se preparó un protocolo para evaluar utilización y, con línea de base adecuada, explorar resultados. |
| ¿Es una aplicación móvil? | Es una web responsive con soporte de instalación PWA en navegadores compatibles. La aceptación de esta modalidad para el requisito académico se presentará al docente. |
| ¿Se puede pagar o pedir delivery? | No. El informe excluye pagos bancarios integrados y reparto en la primera versión. |
| ¿Los negocios que vemos participan realmente? | No. Son nombres, direcciones y operaciones ficticios para ilustrar el recorrido. |

## Si falla algo durante la exposición

- **No aparecen ofertas:** restablecer la demo; puede haber terminado su plazo o quedado un filtro activo.
- **No permite confirmar retiro:** comprobar establecimiento seleccionado y ventana horaria del lote.
- **No instala en el celular:** usar HTTPS y navegador compatible. La adaptación responsive puede mostrarse sin instalación.
- **El navegador bloquea almacenamiento:** se mostrará un aviso; la demo seguirá en memoria, pero no conservará cambios al recargar.
- **Se pierde conexión:** mostrar la pantalla informativa o volver al servidor local. Conservar capturas del ensayo como respaldo visual.
