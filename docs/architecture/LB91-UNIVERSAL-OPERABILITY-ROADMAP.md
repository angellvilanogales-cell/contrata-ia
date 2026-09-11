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

- **SUPPLY**: caso dorado editable de suministro por necesidades/DA 33.ª y corpus multicaso independiente con Memorias y PPT de Panda/AVRA, aulas digitales, tablets+plataforma, acuerdo marco SAS, mobiliario judicial y VEIASA.
- **SERVICE**: PCAP, memorias y PPT reales de varias subfamilias, incluido limpieza y mantenimiento.
- **MIXED**: caso real de limpieza calificado como mixto servicios+suministros, con prestación principal de servicios.
- **WORKS**: referencia real de PCAP de obras por procedimiento abierto utilizada como calibración estructural; la generación física sigue condicionada a activo editable acreditado.
- **CONCESSION**: cobertura normativa y motores específicos, pero no se ha acreditado todavía en LB91 un expediente/pliego real suficientemente identificable para regresión documental física.

Un ejemplo nunca se convierte por sí solo en regla jurídica universal ni en plantilla productiva.

## Bloques ejecutados LB91.12-LB91.30

### Familia, economía, procedimiento y ejecución

- `UniversalWorksPreparationEngine`, `UniversalWorksEconomicEngine`, `UniversalWorksExecutionEngine`.
- `UniversalConcessionPreparationEngine`, `UniversalConcessionEconomicEngine`, `UniversalConcessionProcedureEngine`, `UniversalConcessionExecutionEngine`.
- `UniversalMixedContractEngine` y `UniversalFamilyPreparationGate`.
- `UniversalFamilyAdaptivePreparation` para preguntar únicamente hechos especiales realmente necesarios.

### Documentos y auditoría

- `WorksPcapDefinition`: modelo estructural, nunca `FULL_MODEL` por inferencia.
- `EditableTemplateAssetRegistry`: ODT/DOCX, SHA-256, huella de estilo, fuente, verificación y activación.
- `UniversalPhysicalDocumentGenerationGate` y `UniversalAdministrativePackageGate`.
- `UniversalAdministrativePackageAudit` y `UniversalCrossDocumentAudit`.
- `UniversalDocumentModelGapReport`, `SourceBackedDocumentAssetCatalogue`, `UniversalPhysicalCoverageMatrix`.

### Activos protegidos acreditados de CONTR/2026/240267

1. PCAP ODT `JDA-PCAP-SUPPLY-ASA-AUTOFINANCED-2025-12-17`, SHA `45e1e6b16ec41d77206d3ef385c70f87c9120bb0ccce4e43d9a24d245812cadc`.
2. Memoria V12 ODT `case:CONTR-2026-240267:memoria:v12:editable`, SHA `36ed482048e19bc8b1f9c4fe1b8f1bd47eb81ac9e256dd4f0488e7bc97b8e4dc`.
3. PPT V6 ODT `case:CONTR-2026-240267:ppt:v6:editable`, SHA `c3f4199e3929718f278cc7d77c04d7e6082b79858e52ff193f1a79b17edd3f09`.

Son un paquete protegido completo; no se promueven a plantilla general por el mero hecho de estar verificados.

## Bloques ejecutados LB91.31-LB91.55 — biblioteca productiva

- PCAP general oficial de suministro ASA editable acreditado.
- Separación estricta entre modelo lógico, fuente real, activo de caso y plantilla general productiva.
- Catálogo documental por contrato, documento, procedimiento, financiación y subfamilia técnica.
- Selector canónico multidimensional y preguntas adaptativas de financiación/subfamilia.
- Preflight Memoria + PCAP + PPT con decisiones `RENDER_ALLOWED/BLOCKED`.
- Registro/versionado de candidatos editables y gate de promoción por procedencia, SHA y estilo.
- Adapter `UniversalPhysicalDocumentRenderer`: solo ejecuta renderer tras `GENERAL_EDITABLE_SELECTED`.

## Bloques ejecutados LB91.56-LB91.75 — evidencia y adquisición

- `UniversalTemplatePromotionEvidence`: las versiones del mismo expediente no cuentan como contraste independiente.
- Núcleo común + overlay técnico por subfamilia; nunca sustituye requisitos particulares.
- `UniversalTemplateAcquisitionPlan`: cola determinista de activos que faltan.
- `UniversalDocumentDiscoveryEngine`: registra casos reales como `CASE_DOCUMENTED`, `EDITABLE_VERIFIED` o `GENERAL_MODEL_VERIFIED`.
- `UniversalCoverageReconciler` y `UniversalPackagePromotionForecast`: distinguen abundancia documental de preparación física productiva.

## Bloques ejecutados LB91.76-LB91.90 — corpus Supply multicaso

- Corpus real de Memorias/PPT Supply de al menos siete expedientes independientes.
- Variantes separadas: catálogo/necesidades, TIC/licencias, equipamiento digital, suministro con servicio, sanitario/acuerdo marco, mobiliario+instalación y suministro ordinario a precio global.
- `UniversalSupplyBlockEvidenceMatrix`: acredita bloques estructurales recurrentes sin generalizar MRR/DNSH, protección de datos u otras cláusulas circunstanciales.
- `UniversalSupplyPromotionReadiness`: la estructura de Memoria/PPT está suficientemente contrastada; el bloqueo restante es físico, no de muestras.
- `UniversalSupplyVariantGate`: impide heredar overlays técnicos de otra subfamilia por compartir `SUPPLY`.

## LB91.91-LB91.100 — cierre técnico

### Cantera `main`

`main` se utiliza como cantera, no como fuente de verdad ni como merge automático. `MainBranchReuseClosureAudit` clasifica expresamente:

- componentes ya heredados y reutilizados, como el ciclo base de generación y la orquestación histórica;
- exportadores/catálogos que pueden adaptarse únicamente aguas abajo de los gates LB91;
- piezas que no deben reutilizarse tal cual, como la fachada vacía `MemoryComposer` o conocimiento sin procedencia suficientemente cerrada.

`canBulkReuseMain()` permanece siempre `false`.

### Gate final LB91

`LB91ClosureGate` separa dos conceptos:

- **engineeringClosed**: todos los motores, gates, corpus, aislamiento de variantes y CI del alcance LB91 están completos;
- **productionReady**: permanece siempre `false` en LB91.

También mantiene `universalOperationalCoverage = false` y `humanValidationRequired = true`.

### Bloqueos externos que LB91 no debe falsear

1. `UNIVERSAL_EDITABLE_TEMPLATE_COVERAGE`: faltan activos editables generales para todas las familias/documentos.
2. `CONCESSION_REAL_DOCUMENTARY_CASE`: falta regresión documental real suficientemente acreditada de concesión.
3. `DEPLOYED_PERSISTENCE_RESTART_RECOVERY`: falta demostrar create → restart/redeploy → recover del estado universal desplegado.
4. `KNOWLEDGE_PROVENANCE_QUARANTINE`: queda pendiente sanear/procedenciar completamente conocimiento histórico no canónico.
5. `INSTITUTIONAL_SECURITY_PRIVACY_REVIEW`: evaluación institucional RGPD/LOPDGDD/ENS/DPA/residencia antes de producción real.

Estos pendientes no impiden considerar terminado **el bloque de ingeniería LB91** cuando su HEAD pasa CI, pero sí impiden cualquier afirmación de V1 productiva o cobertura universal completa.

## Estado de cierre

**LB91 se considera técnicamente cerrable** cuando el HEAD con `LB91ClosureGate` y sus regresiones está en verde. El cierre no fusiona `main`, no modifica `main`, no crea una versión 1.0.0 y no elimina los bloqueos externos anteriores.

## Coste

LB91 mantiene coste adicional obligatorio **0 €**. No introduce APIs de pago, embeddings comerciales ni almacenamiento obligatorio de pago. Cualquier cambio futuro con coste distinto de cero queda bloqueado hasta autorización expresa.
