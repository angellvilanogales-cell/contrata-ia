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

## Evidencia disponible

- **SUPPLY**: existe caso dorado documental de suministro por necesidades/DA 33.ª y varios casos de regresión.
- **SERVICE**: existen PCAP y memorias reales de servicios, incluido limpieza.
- **MIXED**: existe caso real de limpieza calificado como mixto servicios+suministros, con prestación principal de servicios.
- **WORKS**: se ha localizado un PCAP real de obras mediante procedimiento abierto. Se incorpora como fuente de calibración, sin convertirlo por sí solo en cobertura operativa completa ni en regla general.
- **CONCESSION**: existe cobertura normativa LCSP, pero todavía no se ha recuperado un expediente/pliego real de concesión suficientemente identificable para regresión.

La ausencia de un caso real de concesión en esta búsqueda no significa que no exista en el repositorio de fuentes; significa que LB91 no lo considera acreditado hasta localizarlo y verificarlo expresamente. Del mismo modo, la existencia de un PCAP real de obras no habilita generación de obras hasta verificar el modelo editable, sus datos y los módulos específicos.

## Arquitectura

`UniversalContractCoverage.ts` mantiene una matriz conservadora de capacidades por familia. `UniversalContractPlan.ts` transforma esa matriz en un plan operativo.

Los módulos transversales consolidados o acotados incluyen objeto/necesidad, CPV, lotes, economía, procedimiento, solvencia, publicidad, criterios, garantías, ejecución, modificaciones, revisión de precios y ámbito contractual del recurso especial. Ninguno sustituye la validación humana cuando la decisión depende de configuración del expediente.

LB91.12-LB91.13 añaden además una frontera específica de familia:

- `UniversalWorksPreparationEngine`: proyecto, aprobación, replanteo, supervisión y disponibilidad de terrenos conforme a los arts. 231, 235 y 236 LCSP.
- `UniversalConcessionPreparationEngine`: riesgo operacional, viabilidad, duración y preparación previa de obras/servicio conforme a los arts. 14, 15, 29.6, 247-250, 284 y 285 LCSP.
- `UniversalMixedContractEngine`: vinculación/complementariedad y prestación principal conforme a los arts. 18 y 34.2 LCSP, sin inventar valores separados.
- `UniversalFamilyPreparationGate`: impide que WORKS, CONCESSION o MIXED entren en el pipeline general si faltan esos hechos estructurales.

La matriz y los gates son mecanismos de bloqueo, no motores de relleno. Nunca convierten ausencia de evidencia en una decisión jurídica afirmativa.

## Prioridad siguiente

1. Convertir el PCAP real de obras localizado en regresión documental controlada y verificar si existe activo editable oficial correspondiente.
2. Localizar y validar al menos un caso real de concesión; hasta entonces la generación concesional permanece bloqueada.
3. Ampliar el modelo económico específico de obras y concesiones sin contaminar las semánticas protegidas de suministro/DA 33.ª.
4. Registrar perfiles documentales oficiales por tipo y procedimiento.
5. Generalizar render editable y auditoría cruzada física Memoria-PCAP-PPT.
6. Ejecutar una matriz multicaso real antes de cualquier declaración de cobertura universal.

## Coste

LB91 no introduce APIs de pago, embeddings comerciales ni dependencias externas obligatorias de pago. Cualquier cambio futuro que introduzca coste adicional deberá elevarse como decisión explícita.
