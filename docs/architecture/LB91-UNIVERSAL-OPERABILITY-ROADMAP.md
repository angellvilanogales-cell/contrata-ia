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

## Bloqueos reales después de LB91.25

1. **WORKS**: falta verificar/registrar un `FULL_MODEL` editable de PCAP y los modelos/activos editables de Memoria y PPT/proyecto aplicables. La definición estructural no habilita render físico.
2. **CONCESSION**: falta caso real acreditado, perfiles documentales y activos editables; el sistema jurídico/económico puede validar datos, pero no generar pliegos concesionales de producción.
3. **MIXED**: falta selector documental formal según prestación principal/combinación y activos editables calibrados; no se reutilizará ciegamente el modelo de la prestación principal cuando las cláusulas mixtas exijan adaptación.
4. **SERVICE/SUPPLY**: existen pipelines y modelos parciales/protegidos, pero el gate universal exige registrar los tres activos físicos completos por perfil antes de declarar una familia universalmente generable.
5. **PERSISTENCIA DESPLEGADA**: el código de persistencia externa debe superar además la prueba real create → restart/redeploy → recover en Render/Supabase antes de una V1 operativa desplegada.
6. **MULTICASO**: antes de cobertura universal debe ejecutarse una matriz de expedientes reales suficientemente diversa por familia/procedimiento y mantener las contradicciones como bloqueos, no autocorrecciones.

## Próxima prioridad

1. Inventariar y verificar activos editables reales de Memoria/PCAP/PPT ya disponibles en fuentes/repo, empezando por servicios, suministros y obras.
2. Incorporar esos activos al registro físico solo cuando se conozcan SHA, huella de estilo, fuente y procedimiento aplicable.
3. Localizar un expediente real de concesión y convertirlo en regresión sin generalizar sus decisiones particulares.
4. Completar selección documental de contratos mixtos y su orquestación de ejecución.
5. Conectar las preguntas familiares al flujo `/adaptive` persistido y después al gate de paquete.
6. Ejecutar E2E multicaso físico y prueba real de persistencia desplegada.

## Coste

LB91 mantiene coste adicional obligatorio **0 €**. No introduce APIs de pago, embeddings comerciales ni almacenamiento obligatorio de pago. Cualquier cambio futuro con coste distinto de cero queda bloqueado hasta autorización expresa.
