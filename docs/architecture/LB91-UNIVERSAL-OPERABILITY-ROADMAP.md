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
- **WORKS**: consta una referencia real de PCAP de obras por procedimiento abierto en el inventario de fuentes, utilizada únicamente como calibración estructural. No se habilita generación física hasta verificar el activo editable concreto.
- **CONCESSION**: existe cobertura normativa LCSP, pero no se ha acreditado todavía en LB91 un expediente/pliego real de concesión suficientemente identificable para regresión documental.

La ausencia de caso real de concesión significa exactamente falta de evidencia de regresión, no inexistencia en todas las fuentes. Un ejemplo nunca se convierte por sí solo en regla jurídica universal.

## Bloques ejecutados LB91.12-LB91.25

### Familia y preparación

- `UniversalWorksPreparationEngine`: proyecto, aprobación, replanteo, supervisión y disponibilidad de terrenos.
- `UniversalConcessionPreparationEngine`: subtipo, riesgo operacional, viabilidad, duración y preparación previa.
- `UniversalMixedContractEngine`: prestaciones vinculadas/complementarias y prestación principal.
- `UniversalFamilyPreparationGate`: frontera obligatoria antes de documentos para WORKS, CONCESSION y MIXED.
- `UniversalFamilyAdaptivePreparation`: preguntas progresivas específicas de familia; no pregunta datos propios de obras/concesiones a suministros o servicios.

### Economía

- `UniversalWorksEconomicEngine`: VE de obras sobre componentes acreditados, proyecto/mediciones y suministros puestos a disposición, conservando diferencias declaradas.
- `UniversalConcessionEconomicEngine`: cifra neta de negocios prevista y componentes del art. 101 sin doble contabilización; riesgo y viabilidad permanecen obligatorios.

### Procedimiento y ejecución

- `UniversalConcessionProcedureEngine`: abierto/restringido como vías ordinarias, restringido obligatorio en concesiones de servicios especiales del Anexo IV y bloqueo de procedimientos excepcionales sin supuesto habilitante documentado. El art. 159 no se extrapola a concesiones.
- `UniversalWorksExecutionEngine`: comprobación de replanteo, dirección facultativa, certificaciones, recepción, certificación final, garantía y vicios ocultos.
- `UniversalConcessionExecutionEngine`: riesgo operacional durante la ejecución, régimen económico, inspección, incumplimientos, intervención/secuestro, reequilibrio y especialidades de concesión de obras/servicios.

### Documentos y auditoría

- `WorksPcapDefinition`: definición estructural de PCAP de obras. `STRUCTURAL_MODEL`, nunca `FULL_MODEL` por inferencia.
- `EditableTemplateAssetRegistry`: exige ODT/DOCX físico, SHA-256, huella de estilo, fuente, verificación y activación.
- `UniversalPhysicalDocumentGenerationGate`: combina aptitud lógica con activo físico verificado.
- `UniversalAdministrativePackageAudit`: hechos mínimos obligatorios y coherencia Memoria-PCAP-PPT, con reglas familiares.
- `UniversalAdministrativePackageGate`: los tres documentos deben ser físicamente generables y superar auditoría cruzada; aceptación humana siempre obligatoria.
- `UniversalDocumentModelGapReport`: informa qué perfil/activo falta por familia y documento.

### Cobertura

- `UniversalCoverageReconciliation` superpone únicamente capacidades efectivamente implementadas sobre la matriz conservadora de apertura.
- `UniversalContractPlan` utiliza la cobertura reconciliada, pero mantiene bloqueos de evidencia/modelo físico.
- La existencia de motores universales no equivale a cobertura documental universal.

## Bloques ejecutados LB91.26-LB91.30 — biblioteca física

- `SourceBackedDocumentAssetCatalogue`: inventario trazable de activos documentales físicos por familia, documento, procedimiento y alcance.
- `UniversalDocumentAssetClassifier`: clasifica cada activo como general oficial, caso protegido o referencia estructural y evita borrar ese alcance por simple coincidencia de tipo/procedimiento.
- `ProtectedEditableAssetManifest`: exige exactamente Memoria, PCAP y PPT editables, con identidad, SHA-256 y huella de estilo válidos, para cerrar el paquete físico protegido.
- `UniversalPhysicalModelReadiness`: solo considera cobertura universal un modelo **general oficial + editable verificado + candidato de generación**. Un activo de caso protegido nunca cuenta como modelo universal.
- `UniversalPhysicalCoverageMatrix`: matriz multicaso/familia que distingue expresamente `PROTECTED_CASE` de `UNIVERSAL_FAMILY`.

### Activos protegidos acreditados del expediente CONTR/2026/240267

1. **PCAP**: `JDA-PCAP-SUPPLY-ASA-AUTOFINANCED-2025-12-17`, ODT, SHA `45e1e6b16ec41d77206d3ef385c70f87c9120bb0ccce4e43d9a24d245812cadc`, huella de estilo `sha256:9eb23463f4d56abd03531cb909206ef47d749054bf284087bd45867b39e6ceee`.
2. **Memoria V12**: `case:CONTR-2026-240267:memoria:v12:editable`, ODT, SHA `36ed482048e19bc8b1f9c4fe1b8f1bd47eb81ac9e256dd4f0488e7bc97b8e4dc`, huella `sha256:60bdf03935c18ee8c925e3184fc7bc864db873ffc7d32154098885b47e78448d`.
3. **PPT V6**: `case:CONTR-2026-240267:ppt:v6:editable`, ODT, SHA `c3f4199e3929718f278cc7d77c04d7e6082b79858e52ff193f1a79b17edd3f09`, huella `sha256:deadf7c2a176c83de774fad7022a0ac1d5adfcca514d8c0cddeb0b01029d1390`.

Los tres forman un paquete físico protegido completo y siguen requiriendo aceptación humana. No se promueven a plantilla general de suministros por el mero hecho de estar verificados.

## Bloqueos reales después de LB91.30

1. **SUPPLY universal**: el caso protegido está físicamente cerrado, pero faltan activos generales oficiales editables completos para Memoria/PCAP/PPT aplicables fuera del caso protegido.
2. **SERVICE**: existe fuente general de PCAP y perfiles lógicos, pero falta verificar y registrar el binario editable oficial concreto; PPT y Memoria generales siguen pendientes de cobertura física suficiente.
3. **WORKS**: existe PCAP real de referencia estructural, pero faltan activos editables oficiales completos y la relación correcta entre PCAP, Memoria y proyecto/PPT.
4. **CONCESSION**: faltan caso real acreditado, perfiles documentales y activos editables; no puede existir generación concesional de producción todavía.
5. **MIXED**: falta selector documental formal y activos editables calibrados para las combinaciones reales; no se reutilizará ciegamente el modelo de la prestación principal.
6. **PERSISTENCIA DESPLEGADA**: debe superarse create → restart/redeploy → recover en Render/Supabase antes de una V1 operativa desplegada.
7. **MULTICASO FÍSICO**: la matriz ya existe, pero solo el caso protegido de ferretería puede marcarse listo físicamente con la evidencia acreditada actual.

## Próxima prioridad

1. Recuperar de fuentes/repositorio los binarios editables generales oficiales de servicios y suministros y verificar identidad, SHA y estilo.
2. Incorporar activos de obras únicamente cuando sean realmente editables y correspondan al procedimiento/modelo administrativo aplicable.
3. Localizar un expediente real de concesión y convertirlo en regresión antes de cualquier perfil físico concesional.
4. Construir el selector documental formal de mixtos manteniendo las cláusulas específicas del componente combinado.
5. Conectar la biblioteca física al flujo `/adaptive` y al gate de paquete, conservando el alcance `CASE_PROTECTED`/`GENERAL_OFFICIAL`.
6. Ejecutar E2E físico multicaso y prueba real de persistencia desplegada.

## Coste

LB91 mantiene coste adicional obligatorio **0 €**. No introduce APIs de pago, embeddings comerciales ni almacenamiento obligatorio de pago. Cualquier cambio futuro con coste distinto de cero queda bloqueado hasta autorización expresa.
