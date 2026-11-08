# Protocolo inicial para evaluación posterior

**Estado:** propuesta de trabajo, pendiente de revisión con el docente y participantes. No se ha realizado reclutamiento ni se reportan resultados empíricos en esta entrega.

## Propósito y diseño

Evaluar descriptivamente el funcionamiento y la utilización de la solución en establecimientos voluntarios de Cochabamba. La primera etapa será exploratoria y aplicada, con selección por conveniencia y registro explícito de la muestra efectivamente alcanzada. No se inferirá representatividad de todos los restaurantes, supermercados o consumidores de la ciudad.

La meta operativa inicial propuesta es invitar al menos a un restaurante y un supermercado y a consumidores interesados de su entorno. La cantidad final, fechas y duración se acordarán y registrarán antes de iniciar el piloto. Si no se consigue acceso, se entregarán resultados de pruebas funcionales y se mantendrá la evaluación de campo como pendiente.

## Condiciones previas

- Contar con sistema compartido, autenticación y permisos reales, validación de fechas en servidor y reservas transaccionales.
- Explicar participación voluntaria, propósito académico, retiro de participación y tratamiento de los datos. Registrar consentimiento según las indicaciones de la universidad.
- Recoger únicamente datos necesarios; identificar establecimientos y participantes mediante códigos en los instrumentos de análisis.
- Acordar tipos de alimento, unidades, horarios, responsabilidad de conservación y confirmación manual de retiros.
- Capacitar brevemente a los participantes y distinguir fallos del sistema de incidencias operativas.

## Instrumento A · Entrevista de diagnóstico al establecimiento

1. ¿Cómo identifican actualmente alimentos que podrían quedar como excedentes?
2. ¿Qué registran de ingreso, cantidad, conservación y fechas aplicables?
3. ¿Cómo rotan esos productos y quién decide qué puede comercializarse?
4. ¿Cómo comunican actualmente una oferta y qué dificulta hacerlo a tiempo?
5. ¿Qué unidad pueden registrar de manera consistente y qué tiempo dedicarían a la plataforma?

Registrar código de establecimiento, tipo, fecha, responsable entrevistado por función y síntesis de respuestas. No atribuir porcentajes ni cantidades que el participante no haya medido.

## Instrumento B · Registro diario de alimentos

| Campo | Registro |
| --- | --- |
| Fecha, establecimiento y lote | Identificadores consistentes |
| Producto y categoría | Descripción suficiente para comparar |
| Cantidad identificada como excedente | Valor y unidad |
| Cantidad publicada | Valor y misma unidad |
| Cantidad reservada y sus estados | Pendiente, retirada, cancelada o no retirada |
| Cantidad efectivamente entregada | Confirmación manual y fecha |
| Cantidad descartada declarada | Solo si existe medición y criterio documentado |
| Incidencia y condiciones relevantes | Cierre del local, error de registro, cambio de horario u otras |

Para evaluar desperdicio, levantar una línea de base previa usando el mismo establecimiento, productos comparables, unidad y procedimiento de registro. Registrar duración y variaciones del contexto, como cambios en producción, ventas u horarios. La simple cantidad retirada por la plataforma no permite atribuir causalmente una reducción del desperdicio.

## Instrumento C · Prueba de tareas

**Establecimiento:** registrar lote, distinguir PEPS y límite comercial, publicar, ajustar precio, identificar reserva y confirmar retiro.

**Consumidor:** localizar una oferta por zona, comprender contenido/precio/horario, reservar, encontrar el código y cancelar si corresponde.

Por tarea, registrar completada/no completada, tiempo aproximado, ayuda necesaria, error o incidencia y comentario del participante. Al finalizar, preguntar qué resultó confuso y qué cambiaría. Una pregunta de facilidad de 1 a 5 se interpretará como instrumento exploratorio propio, no como una escala validada.

## Análisis y comunicación

- Informar muestra real, método de selección, fechas, contexto y limitaciones.
- Separar resultados funcionales, uso registrado y percepciones de participantes.
- Calcular publicados, pendientes y retirados por establecimiento, período, producto cuando corresponda y unidad homogénea.
- Calcular proporción retirada solo para el mismo conjunto de publicaciones: `(cantidad retirada / cantidad publicada) × 100`.
- No sumar kg, porciones y unidades ni estimar kg por porción sin una conversión medida.
- Comparar línea de base y piloto solo cuando existan medidas consistentes; describir factores alternativos y evitar afirmaciones causales que el diseño no soporte.
- Mantener resultados simulados de la demo fuera de la base empírica.
