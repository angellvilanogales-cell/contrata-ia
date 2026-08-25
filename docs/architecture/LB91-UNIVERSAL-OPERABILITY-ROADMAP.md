# LB91 — Universalización operativa

## Regla de cierre

Contrata-IA no declarará cobertura universal por la mera existencia de motores, plantillas o ejemplos. La cobertura operativa por familia contractual exige, como mínimo:

1. modelo universal capaz de representar el expediente;
2. módulos jurídicos/económicos aplicables y trazables;
3. evidencia real suficiente para calibración/regresión;
4. selección acreditada de modelo documental;
5. generación editable preservando el modelo administrativo;
6. auditoría cruzada entre documentos;
7. validación humana antes del cierre documental;
8. persistencia y recuperación del expediente.

## Evidencia disponible al abrir LB91

- **SUPPLY**: existe caso dorado documental de suministro por necesidades/DA 33.ª y varios casos de regresión de suministros.
- **SERVICE**: existen PCAP y memorias reales de servicios, incluido limpieza.
- **MIXED**: existe caso real de limpieza calificado como mixto servicios+suministros, con prestación principal de servicios.
- **WORKS**: se ha localizado un PCAP real de obras mediante procedimiento abierto. Se incorpora como fuente de calibración, sin convertirlo por sí solo en cobertura operativa completa ni en regla general.
- **CONCESSION**: existe cobertura normativa base LCSP. La búsqueda específica realizada en las fuentes no ha recuperado todavía un expediente/pliego real de concesión suficientemente identificable para usarlo como regresión.

La ausencia de un caso real de concesión en esta búsqueda no significa que no exista en el repositorio de fuentes; significa que LB91 no lo considera acreditado hasta localizarlo y verificarlo expresamente. Del mismo modo, la existencia de un PCAP real de obras no habilita generación de obras hasta verificar el modelo editable, sus datos y los módulos específicos.

## Arquitectura de la matriz

`UniversalContractCoverage.ts` mantiene una matriz conservadora de capacidades por familia. `UniversalContractPlan.ts` transforma esa matriz en un plan operativo:

- `RUN_EXISTING_COMPONENT`: existe componente reutilizable; su salida sigue sujeta a evidencia y validación humana.
- `COLLECT_AND_VALIDATE_EVIDENCE`: existe estructura/fuente parcial, pero no cobertura suficiente para automatización plena.
- `BLOCK_UNTIL_IMPLEMENTED`: el hueco impide afirmar operatividad universal.

La matriz es un **gate**, no un mecanismo de inferencia. Nunca completa automáticamente una decisión jurídica ausente.

## Prioridad de implementación

1. Persistencia externa gratuita y prueba real de reinicio/restauración.
2. Cierre del inventario de cobertura del repositorio y fuentes.
3. Completar módulos transversales: recursos, criterios, garantías, ejecución, modificaciones y revisión de precios.
4. Extender el modelo universal para hechos específicos de obras, concesiones y contratos mixtos.
5. Convertir el caso real de obras en regresión controlada y localizar/validar al menos un caso real de concesión, sin generalizar sus decisiones particulares.
6. Registrar modelos documentales oficiales por tipo/procedimiento.
7. Generalizar la generación editable y la auditoría cruzada.
8. Ejecutar una matriz real multicaso antes de cualquier declaración de cobertura universal.

## Coste

LB91 mantiene **coste obligatorio 0 €** durante la fase de desarrollo/piloto: no se introducen APIs de pago, embeddings comerciales ni almacenamiento obligatorio de pago. Cualquier dependencia externa futura que comprometa esta regla debe bloquearse y elevarse como decisión explícita.
