# LB-7 — Comparativa documental: servicios de organización de premios y eventos

## Corpus leído

Se han leído en profundidad seis documentos aportados por el usuario, organizados en dos expedientes completos:

### Expediente A — Premios Meridiana 2026
- Memoria justificativa: 5 páginas.
- PCAP: 101 páginas.
- PPT: 8 páginas.
- Expediente: CONTR 2025 645768.
- Servicio: planificación, organización, producción y desarrollo del acto de los Premios Meridiana 2026.
- CPV observado: 79952000-2 Servicios de Eventos.
- Procedimiento observado en PCAP: abierto simplificado ordinario.

### Expediente B — Premios de Artesanía / Congreso / Comercio Interior / Día del Comercio
- Memoria justificativa: 30 páginas.
- PCAP: 111 páginas.
- PPT: 12 páginas.
- Expediente: ADM/2026/007 (CONTR 2026 58905).
- Servicio: organización integral de cuatro eventos diferenciados.
- CPV observado: 79950000-8 Servicios de organización de exposiciones, ferias y congresos.
- Procedimiento observado en PCAP: abierto.
- División observada: cuatro lotes.

## Hallazgos sobre Memoria

1. No existe una única extensión o plantilla rígida. La Memoria Meridiana es breve y estructurada; la de Artesanía es extensa y desarrolla con mucho detalle objeto, antecedentes sectoriales, prestaciones y configuración económica.
2. En ambos casos la necesidad se construye desde la función pública e institucional que da sentido al evento, no desde una fórmula genérica.
3. La identificación inicial del contrato es altamente reutilizable: expediente, título/objeto, tipo y CPV.
4. Resultan recurrentes o relevantes según el caso: necesidad, procedimiento, plazo, solvencia, criterios de adjudicación, condiciones especiales de ejecución, presupuesto/valor estimado, lugar, garantía, forma de pago y responsable.
5. En contratos de eventos la Memoria puede contener ya una descripción funcional importante de la prestación, pero el detalle operativo debe quedar coordinado con el PPT.

## Hallazgos sobre PCAP

1. Los dos PCAP se apoyan expresamente en modelos recomendados por la Comisión Consultiva de Contratación Pública.
2. La selección del modelo cambia con el procedimiento: Meridiana usa abierto simplificado ordinario; Artesanía usa abierto.
3. La estructura troncal es muy estable: elementos del contrato, adjudicación, ejecución, prerrogativas/jurisdicción/recursos y anexos.
4. El centro de parametrización del expediente está en el Anexo I / características del contrato y anexos específicos.
5. La versión del modelo importa. El PCAP de Artesanía declara modelo recomendado en diciembre de 2025; Meridiana declara modelo de 2024 actualizado en febrero de 2025.
6. Contrata-IA no debe redactar libremente el cuerpo completo del PCAP cuando exista modelo oficial aplicable; debe seleccionar versión y procedimiento y completar los campos jurídicamente permitidos/previstos.

## Hallazgos sobre PPT de eventos

Se confirma una familia técnica distinta de limpieza/mantenimiento. Los elementos observados incluyen:

- concepto/propuesta creativa del evento;
- calendario de producción y escaleta técnica;
- imagen gráfica e identidad corporativa;
- piezas audiovisuales;
- invitaciones y bases de asistentes;
- búsqueda/atención de intervinientes y participantes;
- presentador/a e interpretación de lengua de signos cuando proceda;
- equipo humano de producción y coordinación;
- contratación/acondicionamiento de espacios;
- escenario, mobiliario, sonido, iluminación, proyección, streaming y prensa;
- montaje/desmontaje y transporte;
- catering;
- premios/estatuillas/obsequios y elementos gráficos específicos;
- autorizaciones, licencias y seguros;
- informe final del evento e indicadores de asistencia/repercusión;
- propiedad intelectual;
- confidencialidad y protección de datos;
- prevención de riesgos laborales.

## Datos técnicos que Contrata-IA no debe inventar

Para esta familia se añaden como datos de alto riesgo que requieren aportación del usuario, documento fuente o propuesta humana validada:

- número de asistentes;
- localidad/espacio concreto;
- aforos y distribución del espacio;
- número y perfil del personal;
- presentador/a o actuaciones;
- número y tipo de estatuillas/regalos;
- necesidades de catering y número de servicios;
- equipos audiovisuales y cantidades;
- necesidades de streaming;
- alojamientos y transportes;
- fechas exactas de ensayo/montaje/evento;
- requisitos gráficos/creativos particulares;
- elementos sujetos a propiedad intelectual;
- datos personales a tratar.

## Invariantes Memoria-PCAP-PPT específicas para eventos

Además de los invariantes generales del expediente, en contratos de eventos deben comprobarse:

- denominación exacta de cada evento;
- número y composición de lotes;
- localidad y lugar de ejecución;
- calendario o ventana temporal;
- público/asistencia prevista cuando afecte a presupuesto o prestaciones;
- alcance de producción audiovisual y streaming;
- catering;
- personal mínimo/perfiles;
- obligaciones de accesibilidad;
- propiedad intelectual e imagen;
- tratamiento de datos personales;
- seguro de responsabilidad civil cuando proceda;
- entregables finales e indicadores.

## Consecuencia para el generador

Se define una futura familia `EVENT_SERVICES` separada del perfil `SERVICES_CLEANING`. La Ficha de Datos deberá activar preguntas condicionales específicas de eventos solo cuando el objeto lo requiera. No se amplía todavía la cobertura jurídica operativa de LB-4: estos casos alimentan la regresión documental y el diseño de entrada hasta que sus reglas jurídicas específicas sean validadas contra normativa vigente.
