# LB104 · Canon de Memoria y PPT

## Decisión

El PCAP conserva siempre el modelo oficial compatible de la Administración. La Memoria y el PPT no tienen en el corpus un índice oficial único y transversal: expedientes distintos usan títulos, agrupaciones y órdenes diferentes para la misma función. Contrata-IA adopta por ello un canon propio, derivado y trazable, que nunca se presenta como modelo oficial.

Versión ejecutable: `LB104-MEMORY-PPT-CANON-V1`.

## Memoria: epígrafes comunes

1. Antecedentes y competencia.
2. Necesidad e idoneidad de la contratación.
3. Objeto, naturaleza y codificación CPV.
4. División en lotes.
5. Presupuesto base de licitación y sistema de determinación del precio.
6. Valor estimado del contrato y método de cálculo.
7. Financiación y anualidades.
8. Duración, prórrogas y plazos de ejecución.
9. Procedimiento de adjudicación y tramitación.
10. Capacidad, habilitación y solvencia.
11. Criterios de adjudicación.
12. Garantías.
13. Condiciones especiales de ejecución.
14. Subcontratación y cesión.
15. Modificaciones previstas.
16. Revisión de precios.
17. Responsable del contrato, ejecución, recepción y pago.
18. Protección de datos y seguridad de la información.
19. Conclusión y propuesta.

## PPT: epígrafes comunes

1. Objeto y alcance de las prescripciones técnicas.
2. Organización e interlocución técnica.
3. Plazo, lugar y condiciones de entrega o ejecución.
4. Descripción y requisitos técnicos mínimos.
5. Medios personales y materiales.
6. Coordinación, seguimiento y control de calidad.
7. Entrega o realización, recepción y conformidad.
8. Obligaciones técnicas de la persona contratista.
9. Garantía técnica, mantenimiento y soporte.
10. Seguridad de la información, confidencialidad y protección de datos.
11. Sostenibilidad, gestión ambiental y residuos.
12. Documentación técnica y anexos.

## Regla de especialidad

Los epígrafes comunes conservan siempre número y título. Las especialidades se insertan como subepígrafes (`2.1`, `3.1`, `4.1`, etc.), de modo que nunca renumeran el núcleo.

| Supuesto | Documento | Epígrafe especial |
|---|---|---|
| Servicios | Memoria | 2.1. Insuficiencia de medios propios |
| Obras | Memoria | 3.1. Proyecto, supervisión, replanteo y actuaciones preparatorias |
| Concesiones | Memoria | 3.1. Estudio de viabilidad y transferencia del riesgo operacional |
| Mixtos | Memoria | 3.1. Prestaciones, valor estimado y régimen de la prestación principal |
| Fondos europeos | Memoria | 7.1. Obligaciones específicas de la financiación europea |
| Suministro por necesidades | Memoria | 6.1. Suministro por necesidades y disposición adicional 33.ª |
| Catálogo/precios unitarios | PPT | 4.1. Catálogo, unidades estimadas y precios unitarios |
| Suministro por necesidades | PPT | 7.1. Reposición de bienes defectuosos |
| Software | PPT | 4.1. Licenciamiento, derechos de uso, actualizaciones y soporte |
| Equipamiento digital | PPT | 4.1. Compatibilidad, configuración, interoperabilidad y puesta en servicio |
| Plataforma asociada | PPT | 4.2. Plataforma asociada, niveles de servicio y ubicación de los datos |
| Suministro sanitario | PPT | 4.1. Requisitos sanitarios, trazabilidad y logística hospitalaria |
| Mobiliario | PPT | 4.1. Medición, transporte, montaje, instalación y puesta en funcionamiento |
| Servicios con personal | PPT | 5.1. Organización del servicio, personal, horarios y subrogación |
| Obras | PPT | 4.1. Proyecto, unidades de obra y condiciones del emplazamiento |
| Concesiones | PPT | 4.1. Continuidad del servicio, personas usuarias, tarifas y reversión |
| Mixtos | PPT | 4.1. Prescripciones diferenciadas por prestación e integración técnica |

## Fuentes contrastadas

El canon se apoya en Memorias y PPT de mobiliario de Cádiz, Windows Server de VEIASA, Panda Antivirus, Aulas Digitales, Tablets con plataforma, acuerdo marco sanitario SAS 470/2025, limpieza CARL, limpieza SAE Huelva y mantenimiento SAE Sevilla. Los documentos reales se conservan como precedentes; ninguno se convierte por sí solo en plantilla general.

## Puerta de conformidad

La función `auditCanonicalMemoryPptHeadings` compara literalmente número, título y orden. Un cambio de nomenclatura, una omisión, una duplicación o un overlay no aplicable debe bloquear la promoción de una nueva plantilla física.

La selección Supply se realiza con `canonicalSupplyOverlaysFromFacts` exclusivamente a partir de la subfamilia y la financiación declaradas y validadas; nunca se deduce del CPV ni de un expediente parecido.

`auditCanonicalOdtStructure` aplica la misma comprobación directamente a `content.xml` del ODT. La puerta es literal, detecta omisiones y duplicados y solo exige los subepígrafes cuya especialidad esté activada. Esta puerta debe integrarse en cada generador al migrar su plantilla física; mientras no ocurra, la conformidad lógica no equivale a normalización física.

## Estado de implantación

- Canon lógico y nomenclatura: cerrado en LB104 V1.
- Auditoría física reutilizable de ODT: implementada.
- Plantillas físicas generales actuales: pendientes de migración y de activar la puerta en cada familia.
- PCAP: fuera de este canon; conserva el modelo oficial compatible de la Administración.
