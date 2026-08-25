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
- **WORKS**: la arquitectura reconoce el tipo contractual y existe cobertura normativa base LCSP, pero en la búsqueda de fuentes realizada al abrir LB91 no se acreditó todavía un caso real completo de obras apto para calibración documental.
- **CONCESSION**: existe cobertura normativa base LCSP, pero no se acreditó todavía un caso real completo de concesión apto para calibración documental.

La ausencia de caso real completo en esta búsqueda no significa que no exista en el repositorio de fuentes; significa que LB91 no lo considera acreditado hasta localizarlo y verificarlo expresamente.

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
5. Incorporar casos reales de obras y concesiones y convertirlos en regresiones, no en reglas generales.
6. Registrar modelos documentales oficiales por tipo/procedimiento.
7. Generalizar la generación editable y la auditoría cruzada.
8. Ejecutar una matriz real multicaso antes de cualquier declaración de cobertura universal.

## Coste

LB91 mantiene **coste obligatorio 0 €** durante la fase de desarrollo/piloto: no se introducen APIs de pago, embeddings comerciales ni almacenamiento obligatorio de pago. Cualquier dependencia externa futura que comprometa esta regla debe bloquearse y elevarse como decisión explícita.
