# CONTRATA-IA — 02_ROADMAP_V1
**Documento maestro operativo e inamovible salvo decisión formal**  
**Versión:** 1.0  
**Fecha:** 2026-08-06  
**Línea base funcional oficial:** 42 %  
**Regla:** el progreso se acredita por puertas de aceptación, no por número de archivos.
## 1. Estado de las fuentes permanentes
Los Principios Inamovibles han sido confirmados como fuente independiente del proyecto. Este roadmap desarrolla sus reglas y no puede contradecirlas.
## 2. Resumen de fases
| Fase | Tareas | Completadas | Pendientes | Puerta |
|---|---:|---:|---:|---|
| LB-0 — Congelación y trazabilidad | 12 | 3 | 9 | Baseline restaurable y gobierno archivado |
| LB-1 — Proyecto compilable | 49 | 0 | 49 | typecheck/build/test/start = código 0 |
| LB-2 — Arquitectura canónica | 43 | 0 | 43 | una implementación activa por responsabilidad |
| LB-3 — Recorrido vertical mínimo | 24 | 0 | 24 | flujo E2E técnico reproducible |
| LB-4 — Motor normativo mínimo viable | 36 | 0 | 36 | batería jurídica del MVP aprobada |
| LB-5 — Documentos administrativos reales | 32 | 0 | 32 | DOCX/PDF reales comparables con modelos |
| LB-6 — API, interfaz, IA integrada y exportación operativa | 40 | 0 | 40 | recorrido accesible desde navegador |
| LB-7 — Calidad, seguridad, piloto y uso real | 46 | 0 | 46 | V1 desplegada, aceptada y utilizada |

**Total de tareas estables:** 282  
**Completadas a la fecha:** 3  
**Pendientes:** 279  

## 3. Reglas de uso del roadmap
1. Los IDs no se renumeran ni se reutilizan.
2. Una tarea solo pasa a COMPLETADA cuando existe evidencia.
3. Las tareas pueden desglosarse en subtareas sin alterar la puerta.
4. Ninguna fase posterior puede cerrar si su dependencia no ha cerrado.
5. Los cambios de alcance requieren ADR y changelog.

# LB-0 — Congelación y trazabilidad

## LB0-001 — Confirmar los Principios Inamovibles en las fuentes
- **Área:** Gobierno
- **Estado:** COMPLETADA
- **Descripción:** Comprobar que el documento permanente está disponible como fuente separada y contiene PI-01 a PI-20.
- **Archivos/recursos:** `CONTRATA_IA_PRINCIPIOS_INAMOVIBLES.md`
- **Dependencias:** Ninguna
- **Prueba:** `Búsqueda en fuentes por título y PI-20`
- **Criterio de aceptación:** El documento aparece como fuente independiente y recuperable.
- **Evidencia exigida:** Referencia de fuente registrada

## LB0-002 — Identificar el ZIP auditado
- **Área:** Baseline
- **Estado:** COMPLETADA
- **Descripción:** Fijar como snapshot oficial el ZIP sobre el que se realizó la auditoría maestra.
- **Archivos/recursos:** `contrata-ia-main (20)(1).zip`
- **Dependencias:** Ninguna
- **Prueba:** `Comprobar nombre y presencia del ZIP`
- **Criterio de aceptación:** El ZIP de baseline está identificado inequívocamente.
- **Evidencia exigida:** Nombre de baseline

## LB0-003 — Registrar la huella SHA-256
- **Área:** Baseline
- **Estado:** COMPLETADA
- **Descripción:** Conservar la huella del ZIP para detectar cualquier alteración futura.
- **Archivos/recursos:** `AUDITORIA_MAESTRA_Y_LINEA_BASE_CONTRATA_IA.md`
- **Dependencias:** LB0-002
- **Prueba:** `sha256sum del ZIP`
- **Criterio de aceptación:** La huella coincide con bfbc11511ea6745c5a977a4e578bf1fe9529167faeb9267af8332e945b4fd8e1.
- **Evidencia exigida:** Hash documentado

## LB0-004 — Archivar el informe maestro
- **Área:** Auditoría
- **Estado:** PENDIENTE
- **Descripción:** Incorporar el informe de auditoría al repositorio canónico.
- **Archivos/recursos:** `docs/audit/01_AUDITORIA_MAESTRA.md`
- **Dependencias:** LB0-002, LB0-003
- **Prueba:** `Comprobar existencia en el repositorio`
- **Criterio de aceptación:** El informe está versionado en docs/audit.
- **Evidencia exigida:** Commit

## LB0-005 — Archivar el inventario completo
- **Área:** Auditoría
- **Estado:** PENDIENTE
- **Descripción:** Incorporar el inventario de 535 archivos a la documentación del repositorio.
- **Archivos/recursos:** `docs/audit/INVENTARIO_AUDITORIA_CONTRATA_IA.csv`
- **Dependencias:** LB0-004
- **Prueba:** `Validar CSV y número de filas`
- **Criterio de aceptación:** El inventario abre correctamente y conserva todos los registros.
- **Evidencia exigida:** CSV versionado

## LB0-006 — Archivar incidencias técnicas
- **Área:** Auditoría
- **Estado:** PENDIENTE
- **Descripción:** Incorporar errores sintácticos, imports no resueltos, duplicidades y YAML inválidos.
- **Archivos/recursos:** `docs/audit/ERRORES_SINTAXIS_CONTRATA_IA.csv; docs/audit/IMPORTS_NO_RESUELTOS_CONTRATA_IA.csv; docs/audit/DUPLICIDADES_NOMBRE_CONTRATA_IA.csv; docs/audit/YAML_INVALIDOS_CONTRATA_IA.csv`
- **Dependencias:** LB0-004
- **Prueba:** `Abrir y validar los cuatro CSV`
- **Criterio de aceptación:** Los cuatro informes son accesibles y versionados.
- **Evidencia exigida:** Commit

## LB0-007 — Incorporar los Principios Inamovibles al repositorio
- **Área:** Gobierno
- **Estado:** PENDIENTE
- **Descripción:** Copiar el documento ya presente en fuentes al árbol documental del proyecto.
- **Archivos/recursos:** `docs/governance/CONTRATA_IA_PRINCIPIOS_INAMOVIBLES.md`
- **Dependencias:** LB0-001
- **Prueba:** `Comparar hash/contenido con la fuente`
- **Criterio de aceptación:** El repositorio contiene la misma versión 1.0.
- **Evidencia exigida:** Commit

## LB0-008 — Crear ADR-0001 de línea base
- **Área:** Gobierno
- **Estado:** PENDIENTE
- **Descripción:** Registrar snapshot, alcance, riesgos, porcentaje oficial del 42 % y reglas de medición.
- **Archivos/recursos:** `docs/architecture/ADR-0001-BASELINE.md`
- **Dependencias:** LB0-003, LB0-004, LB0-007
- **Prueba:** `Revisión documental`
- **Criterio de aceptación:** ADR aprobado y enlazado desde el roadmap.
- **Evidencia exigida:** ADR

## LB0-009 — Crear el registro maestro de decisiones
- **Área:** Gobierno
- **Estado:** PENDIENTE
- **Descripción:** Crear el índice permanente de ADRs y decisiones canónicas.
- **Archivos/recursos:** `docs/03_ARCHITECTURE_DECISIONS.md`
- **Dependencias:** LB0-008
- **Prueba:** `Comprobar índice y enlace a ADR-0001`
- **Criterio de aceptación:** Existe un índice único de decisiones.
- **Evidencia exigida:** Documento

## LB0-010 — Crear el changelog
- **Área:** Gobierno
- **Estado:** PENDIENTE
- **Descripción:** Registrar la auditoría y el cambio desde contadores de archivos a hitos verificables.
- **Archivos/recursos:** `docs/04_CHANGELOG.md`
- **Dependencias:** LB0-008
- **Prueba:** `Revisión documental`
- **Criterio de aceptación:** Primera entrada fechada y trazable.
- **Evidencia exigida:** Documento

## LB0-011 — Incorporar el roadmap maestro
- **Área:** Gobierno
- **Estado:** PENDIENTE
- **Descripción:** Guardar la versión aprobada del roadmap operativo LB-0 a LB-7.
- **Archivos/recursos:** `docs/02_ROADMAP_V1.md; docs/02_ROADMAP_V1.csv`
- **Dependencias:** LB0-007, LB0-008
- **Prueba:** `Comprobar IDs, dependencias y puertas`
- **Criterio de aceptación:** Roadmap versionado y utilizable como tracker.
- **Evidencia exigida:** Commit

## LB0-012 — Cerrar LB-0
- **Área:** Puerta
- **Estado:** PENDIENTE
- **Descripción:** Verificar que snapshot, auditoría, principios, ADR, changelog y roadmap están preservados.
- **Archivos/recursos:** `docs/`
- **Dependencias:** LB0-001 a LB0-011
- **Prueba:** `Checklist LB-0`
- **Criterio de aceptación:** Todos los elementos de gobierno están en el repositorio y el baseline es restaurable.
- **Evidencia exigida:** Acta de cierre LB-0

## PUERTA DE LB-0
**Baseline restaurable y gobierno archivado**

# LB-1 — Proyecto compilable

## LB1-001 — Seleccionar el ZIP de trabajo
- **Área:** Toolchain
- **Estado:** PENDIENTE
- **Descripción:** Extraer una copia de trabajo desde la baseline sin modificar el snapshot original.
- **Archivos/recursos:** `worktree/contrata-ia`
- **Dependencias:** LB0-012
- **Prueba:** `Comparar hash de la fuente`
- **Criterio de aceptación:** La copia es reproducible y la baseline permanece intacta.
- **Evidencia exigida:** Registro

## LB1-002 — Fijar versiones de runtime
- **Área:** Toolchain
- **Estado:** PENDIENTE
- **Descripción:** Definir versión LTS de Node.js, TypeScript y npm compatibles con el entorno objetivo.
- **Archivos/recursos:** `.nvmrc; docs/technical/RUNTIME.md`
- **Dependencias:** LB1-001
- **Prueba:** `node --version; npm --version`
- **Criterio de aceptación:** Versiones explícitas y reproducibles.
- **Evidencia exigida:** Archivos versionados

## LB1-003 — Crear package.json
- **Área:** Toolchain
- **Estado:** PENDIENTE
- **Descripción:** Definir identidad del proyecto, módulos, engines, scripts y dependencias mínimas.
- **Archivos/recursos:** `package.json`
- **Dependencias:** LB1-002
- **Prueba:** `npm pkg get name`
- **Criterio de aceptación:** package.json válido y sin dependencias innecesarias.
- **Evidencia exigida:** Archivo

## LB1-004 — Crear lockfile
- **Área:** Toolchain
- **Estado:** PENDIENTE
- **Descripción:** Instalar dependencias y fijar versiones exactas.
- **Archivos/recursos:** `package-lock.json`
- **Dependencias:** LB1-003
- **Prueba:** `npm ci`
- **Criterio de aceptación:** npm ci reproduce la instalación.
- **Evidencia exigida:** Lockfile

## LB1-005 — Crear tsconfig.base.json
- **Área:** TypeScript
- **Estado:** PENDIENTE
- **Descripción:** Definir opciones compartidas: strict, noImplicitOverride, noUncheckedIndexedAccess y casing coherente.
- **Archivos/recursos:** `tsconfig.base.json`
- **Dependencias:** LB1-003
- **Prueba:** `npx tsc -p tsconfig.base.json --showConfig`
- **Criterio de aceptación:** Configuración válida.
- **Evidencia exigida:** Archivo

## LB1-006 — Crear tsconfig.json de producción
- **Área:** TypeScript
- **Estado:** PENDIENTE
- **Descripción:** Definir rootDir, outDir, include y exclude del código canónico inicial.
- **Archivos/recursos:** `tsconfig.json`
- **Dependencias:** LB1-005
- **Prueba:** `npm run typecheck`
- **Criterio de aceptación:** tsconfig carga el árbol previsto.
- **Evidencia exigida:** Archivo

## LB1-007 — Crear tsconfig.tests.json
- **Área:** TypeScript
- **Estado:** PENDIENTE
- **Descripción:** Separar configuración de pruebas de la compilación de producción.
- **Archivos/recursos:** `tsconfig.tests.json`
- **Dependencias:** LB1-005
- **Prueba:** `npx tsc -p tsconfig.tests.json --noEmit`
- **Criterio de aceptación:** Configuración de tests válida.
- **Evidencia exigida:** Archivo

## LB1-008 — Crear scripts de build y typecheck
- **Área:** Scripts
- **Estado:** PENDIENTE
- **Descripción:** Añadir build, clean, typecheck y rebuild.
- **Archivos/recursos:** `package.json; scripts/`
- **Dependencias:** LB1-003, LB1-006
- **Prueba:** `npm run typecheck; npm run build`
- **Criterio de aceptación:** Los scripts se ejecutan y devuelven códigos correctos.
- **Evidencia exigida:** Salida CI

## LB1-009 — Crear script de auditoría de imports
- **Área:** Scripts
- **Estado:** PENDIENTE
- **Descripción:** Automatizar la detección de imports relativos que no resuelven.
- **Archivos/recursos:** `scripts/check-relative-imports.mjs`
- **Dependencias:** LB1-003
- **Prueba:** `npm run audit:imports`
- **Criterio de aceptación:** Informe reproducible de imports.
- **Evidencia exigida:** CSV/console

## LB1-010 — Crear script de validación YAML/JSON
- **Área:** Scripts
- **Estado:** PENDIENTE
- **Descripción:** Validar sintaxis y esquema básico del conocimiento.
- **Archivos/recursos:** `scripts/validate-knowledge.mjs`
- **Dependencias:** LB1-003
- **Prueba:** `npm run validate:knowledge`
- **Criterio de aceptación:** Todos los ficheros procesados y errores identificados.
- **Evidencia exigida:** Informe

## LB1-011 — Configurar framework de pruebas
- **Área:** Tests
- **Estado:** PENDIENTE
- **Descripción:** Incorporar Vitest o alternativa equivalente con entorno Node.
- **Archivos/recursos:** `vitest.config.ts; tests/`
- **Dependencias:** LB1-003
- **Prueba:** `npm test`
- **Criterio de aceptación:** Un smoke test pasa.
- **Evidencia exigida:** Resultado tests

## LB1-012 — Crear main mínimo
- **Área:** Entrypoint
- **Estado:** PENDIENTE
- **Descripción:** Crear un punto de entrada que imprima versión, inicialice configuración y cierre limpiamente.
- **Archivos/recursos:** `src/main.ts`
- **Dependencias:** LB1-006
- **Prueba:** `npm start`
- **Criterio de aceptación:** La aplicación arranca y termina sin excepción.
- **Evidencia exigida:** Log

## LB1-013 — Clasificar los 25 archivos sintácticamente rotos
- **Área:** Clasificación
- **Estado:** PENDIENTE
- **Descripción:** Asignar A válida reparable, B parcial, C duplicada, D obsoleta, E integrable o F archivable.
- **Archivos/recursos:** `docs/audit/CLASIFICACION_ERRORES_SINTAXIS.csv`
- **Dependencias:** LB1-001
- **Prueba:** `Revisión de los 25 archivos`
- **Criterio de aceptación:** Todos tienen clasificación y decisión provisional.
- **Evidencia exigida:** CSV

## LB1-014 — Resolver sintaxis de knowledge/inference/InferenceEngine.ts
- **Área:** Sintaxis
- **Estado:** PENDIENTE
- **Descripción:** Reparar, aislar o archivar el archivo conforme a su clasificación; no concatenar bloques sin consolidación.
- **Archivos/recursos:** `knowledge/inference/InferenceEngine.ts`
- **Dependencias:** LB1-013
- **Prueba:** `npx tsc --noEmit knowledge/inference/InferenceEngine.ts`
- **Criterio de aceptación:** El archivo compila o queda formalmente excluido y documentado.
- **Evidencia exigida:** Commit + prueba

## LB1-015 — Resolver sintaxis de knowledge/reasoning/LegalReasoner.ts
- **Área:** Sintaxis
- **Estado:** PENDIENTE
- **Descripción:** Reparar, aislar o archivar el archivo conforme a su clasificación; no concatenar bloques sin consolidación.
- **Archivos/recursos:** `knowledge/reasoning/LegalReasoner.ts`
- **Dependencias:** LB1-013
- **Prueba:** `npx tsc --noEmit knowledge/reasoning/LegalReasoner.ts`
- **Criterio de aceptación:** El archivo compila o queda formalmente excluido y documentado.
- **Evidencia exigida:** Commit + prueba

## LB1-016 — Resolver sintaxis de src/domain/cpv/CPVEngine.ts
- **Área:** Sintaxis
- **Estado:** PENDIENTE
- **Descripción:** Reparar, aislar o archivar el archivo conforme a su clasificación; no concatenar bloques sin consolidación.
- **Archivos/recursos:** `src/domain/cpv/CPVEngine.ts`
- **Dependencias:** LB1-013
- **Prueba:** `npx tsc --noEmit src/domain/cpv/CPVEngine.ts`
- **Criterio de aceptación:** El archivo compila o queda formalmente excluido y documentado.
- **Evidencia exigida:** Commit + prueba

## LB1-017 — Resolver sintaxis de src/domain/conocimiento/KnowledgeEngine.ts
- **Área:** Sintaxis
- **Estado:** PENDIENTE
- **Descripción:** Reparar, aislar o archivar el archivo conforme a su clasificación; no concatenar bloques sin consolidación.
- **Archivos/recursos:** `src/domain/conocimiento/KnowledgeEngine.ts`
- **Dependencias:** LB1-013
- **Prueba:** `npx tsc --noEmit src/domain/conocimiento/KnowledgeEngine.ts`
- **Criterio de aceptación:** El archivo compila o queda formalmente excluido y documentado.
- **Evidencia exigida:** Commit + prueba

## LB1-018 — Resolver sintaxis de src/domain/rules/RuleEngine.ts
- **Área:** Sintaxis
- **Estado:** PENDIENTE
- **Descripción:** Reparar, aislar o archivar el archivo conforme a su clasificación; no concatenar bloques sin consolidación.
- **Archivos/recursos:** `src/domain/rules/RuleEngine.ts`
- **Dependencias:** LB1-013
- **Prueba:** `npx tsc --noEmit src/domain/rules/RuleEngine.ts`
- **Criterio de aceptación:** El archivo compila o queda formalmente excluido y documentado.
- **Evidencia exigida:** Commit + prueba

## LB1-019 — Resolver sintaxis de src/application/documents/DocumentGenerator.ts
- **Área:** Sintaxis
- **Estado:** PENDIENTE
- **Descripción:** Reparar, aislar o archivar el archivo conforme a su clasificación; no concatenar bloques sin consolidación.
- **Archivos/recursos:** `src/application/documents/DocumentGenerator.ts`
- **Dependencias:** LB1-013
- **Prueba:** `npx tsc --noEmit src/application/documents/DocumentGenerator.ts`
- **Criterio de aceptación:** El archivo compila o queda formalmente excluido y documentado.
- **Evidencia exigida:** Commit + prueba

## LB1-020 — Resolver sintaxis de src/domain/legal/LegalReasoner.ts
- **Área:** Sintaxis
- **Estado:** PENDIENTE
- **Descripción:** Reparar, aislar o archivar el archivo conforme a su clasificación; no concatenar bloques sin consolidación.
- **Archivos/recursos:** `src/domain/legal/LegalReasoner.ts`
- **Dependencias:** LB1-013
- **Prueba:** `npx tsc --noEmit src/domain/legal/LegalReasoner.ts`
- **Criterio de aceptación:** El archivo compila o queda formalmente excluido y documentado.
- **Evidencia exigida:** Commit + prueba

## LB1-021 — Resolver sintaxis de src/infrastructure/ai/AIManager.ts
- **Área:** Sintaxis
- **Estado:** PENDIENTE
- **Descripción:** Reparar, aislar o archivar el archivo conforme a su clasificación; no concatenar bloques sin consolidación.
- **Archivos/recursos:** `src/infrastructure/ai/AIManager.ts`
- **Dependencias:** LB1-013
- **Prueba:** `npx tsc --noEmit src/infrastructure/ai/AIManager.ts`
- **Criterio de aceptación:** El archivo compila o queda formalmente excluido y documentado.
- **Evidencia exigida:** Commit + prueba

## LB1-022 — Resolver sintaxis de src/domain/events/EventBus.ts
- **Área:** Sintaxis
- **Estado:** PENDIENTE
- **Descripción:** Reparar, aislar o archivar el archivo conforme a su clasificación; no concatenar bloques sin consolidación.
- **Archivos/recursos:** `src/domain/events/EventBus.ts`
- **Dependencias:** LB1-013
- **Prueba:** `npx tsc --noEmit src/domain/events/EventBus.ts`
- **Criterio de aceptación:** El archivo compila o queda formalmente excluido y documentado.
- **Evidencia exigida:** Commit + prueba

## LB1-023 — Resolver sintaxis de src/bootstrap/ArchitectureBootstrap.ts
- **Área:** Sintaxis
- **Estado:** PENDIENTE
- **Descripción:** Reparar, aislar o archivar el archivo conforme a su clasificación; no concatenar bloques sin consolidación.
- **Archivos/recursos:** `src/bootstrap/ArchitectureBootstrap.ts`
- **Dependencias:** LB1-013
- **Prueba:** `npx tsc --noEmit src/bootstrap/ArchitectureBootstrap.ts`
- **Criterio de aceptación:** El archivo compila o queda formalmente excluido y documentado.
- **Evidencia exigida:** Commit + prueba

## LB1-024 — Resolver sintaxis de src/application/modules/contract-generator/ContractContext.ts
- **Área:** Sintaxis
- **Estado:** PENDIENTE
- **Descripción:** Reparar, aislar o archivar el archivo conforme a su clasificación; no concatenar bloques sin consolidación.
- **Archivos/recursos:** `src/application/modules/contract-generator/ContractContext.ts`
- **Dependencias:** LB1-013
- **Prueba:** `npx tsc --noEmit src/application/modules/contract-generator/ContractContext.ts`
- **Criterio de aceptación:** El archivo compila o queda formalmente excluido y documentado.
- **Evidencia exigida:** Commit + prueba

## LB1-025 — Resolver sintaxis de src/application/modules/contract-generator/GenerationResult.ts
- **Área:** Sintaxis
- **Estado:** PENDIENTE
- **Descripción:** Reparar, aislar o archivar el archivo conforme a su clasificación; no concatenar bloques sin consolidación.
- **Archivos/recursos:** `src/application/modules/contract-generator/GenerationResult.ts`
- **Dependencias:** LB1-013
- **Prueba:** `npx tsc --noEmit src/application/modules/contract-generator/GenerationResult.ts`
- **Criterio de aceptación:** El archivo compila o queda formalmente excluido y documentado.
- **Evidencia exigida:** Commit + prueba

## LB1-026 — Resolver sintaxis de src/domain/documental/DocumentAssembler.ts
- **Área:** Sintaxis
- **Estado:** PENDIENTE
- **Descripción:** Reparar, aislar o archivar el archivo conforme a su clasificación; no concatenar bloques sin consolidación.
- **Archivos/recursos:** `src/domain/documental/DocumentAssembler.ts`
- **Dependencias:** LB1-013
- **Prueba:** `npx tsc --noEmit src/domain/documental/DocumentAssembler.ts`
- **Criterio de aceptación:** El archivo compila o queda formalmente excluido y documentado.
- **Evidencia exigida:** Commit + prueba

## LB1-027 — Resolver sintaxis de src/domain/rules/solvency/ClassificationRule.ts
- **Área:** Sintaxis
- **Estado:** PENDIENTE
- **Descripción:** Reparar, aislar o archivar el archivo conforme a su clasificación; no concatenar bloques sin consolidación.
- **Archivos/recursos:** `src/domain/rules/solvency/ClassificationRule.ts`
- **Dependencias:** LB1-013
- **Prueba:** `npx tsc --noEmit src/domain/rules/solvency/ClassificationRule.ts`
- **Criterio de aceptación:** El archivo compila o queda formalmente excluido y documentado.
- **Evidencia exigida:** Commit + prueba

## LB1-028 — Resolver sintaxis de src/domain/plugins/PluginManager.ts
- **Área:** Sintaxis
- **Estado:** PENDIENTE
- **Descripción:** Reparar, aislar o archivar el archivo conforme a su clasificación; no concatenar bloques sin consolidación.
- **Archivos/recursos:** `src/domain/plugins/PluginManager.ts`
- **Dependencias:** LB1-013
- **Prueba:** `npx tsc --noEmit src/domain/plugins/PluginManager.ts`
- **Criterio de aceptación:** El archivo compila o queda formalmente excluido y documentado.
- **Evidencia exigida:** Commit + prueba

## LB1-029 — Resolver sintaxis de src/domain/resolvers/AwardCriteriaResolver.ts
- **Área:** Sintaxis
- **Estado:** PENDIENTE
- **Descripción:** Reparar, aislar o archivar el archivo conforme a su clasificación; no concatenar bloques sin consolidación.
- **Archivos/recursos:** `src/domain/resolvers/AwardCriteriaResolver.ts`
- **Dependencias:** LB1-013
- **Prueba:** `npx tsc --noEmit src/domain/resolvers/AwardCriteriaResolver.ts`
- **Criterio de aceptación:** El archivo compila o queda formalmente excluido y documentado.
- **Evidencia exigida:** Commit + prueba

## LB1-030 — Resolver sintaxis de src/domain/validation/ValidationFramework.ts
- **Área:** Sintaxis
- **Estado:** PENDIENTE
- **Descripción:** Reparar, aislar o archivar el archivo conforme a su clasificación; no concatenar bloques sin consolidación.
- **Archivos/recursos:** `src/domain/validation/ValidationFramework.ts`
- **Dependencias:** LB1-013
- **Prueba:** `npx tsc --noEmit src/domain/validation/ValidationFramework.ts`
- **Criterio de aceptación:** El archivo compila o queda formalmente excluido y documentado.
- **Evidencia exigida:** Commit + prueba

## LB1-031 — Resolver los restantes archivos sintácticamente rotos
- **Área:** Sintaxis
- **Estado:** PENDIENTE
- **Descripción:** Procesar todos los registros restantes del CSV de sintaxis hasta dejar cero archivos rotos en el árbol activo.
- **Archivos/recursos:** `ERRORES_SINTAXIS_CONTRATA_IA.csv`
- **Dependencias:** LB1-013
- **Prueba:** `npm run audit:syntax`
- **Criterio de aceptación:** 0 archivos activos con errores sintácticos.
- **Evidencia exigida:** Informe vacío

## LB1-032 — Clasificar los imports no resueltos por familia
- **Área:** Imports
- **Estado:** PENDIENTE
- **Descripción:** Agrupar framework/types, conocimiento, documental, contract-generator, resolvers, IA y workflow.
- **Archivos/recursos:** `docs/audit/CLASIFICACION_IMPORTS.csv`
- **Dependencias:** LB1-009
- **Prueba:** `Revisión de informe`
- **Criterio de aceptación:** Cada import tiene acción: corregir, reemplazar, archivar o excluir.
- **Evidencia exigida:** CSV

## LB1-033 — Resolver imports de knowledge/inference
- **Área:** Imports
- **Estado:** PENDIENTE
- **Descripción:** Resolver ContextResolver, RuleExecutor, LegalReasoner, ConflictResolver, RecommendationEngine, ExplanationEngine, EvidenceCollector, DecisionValidator, ConfidenceCalculator y TraceabilityManager.
- **Archivos/recursos:** `knowledge/inference/InferenceEngine.ts; knowledge/inference/`
- **Dependencias:** LB1-014, LB1-032
- **Prueba:** `npm run audit:imports`
- **Criterio de aceptación:** 0 imports rotos en la familia.
- **Evidencia exigida:** Informe

## LB1-034 — Resolver imports del contract-generator
- **Área:** Imports
- **Estado:** PENDIENTE
- **Descripción:** Corregir tipos comunes, CPV, ContractTypes, LegalReference, RuleEngine, InferenceEngine, LegalReasoner, ValidationEngine, WorkflowEngine, DocumentGenerator y ExportManager.
- **Archivos/recursos:** `src/application/modules/contract-generator/`
- **Dependencias:** LB1-024, LB1-025, LB1-032
- **Prueba:** `npm run typecheck`
- **Criterio de aceptación:** El módulo compila aisladamente.
- **Evidencia exigida:** Resultado

## LB1-035 — Resolver imports documentales
- **Área:** Imports
- **Estado:** PENDIENTE
- **Descripción:** Corregir DocumentContext, FrameworkTypes, resultados de resolvers, generadores y modelos de solicitud.
- **Archivos/recursos:** `src/domain/documental/; src/domain/document-composer/; src/documental/`
- **Dependencias:** LB1-019, LB1-026, LB1-032
- **Prueba:** `npm run typecheck`
- **Criterio de aceptación:** La familia documental no contiene imports rotos.
- **Evidencia exigida:** Resultado

## LB1-036 — Resolver imports de resolvers y reglas
- **Área:** Imports
- **Estado:** PENDIENTE
- **Descripción:** Corregir imports de ContractType, CPVCode, DecisionContext, tipos de procedimiento, solvencia, garantías y criterios.
- **Archivos/recursos:** `src/domain/resolvers/; src/domain/rules/`
- **Dependencias:** LB1-018, LB1-027, LB1-029, LB1-032
- **Prueba:** `npm run typecheck`
- **Criterio de aceptación:** 0 imports no resueltos en resolvers/reglas.
- **Evidencia exigida:** Resultado

## LB1-037 — Resolver imports de aplicación e integración
- **Área:** Imports
- **Estado:** PENDIENTE
- **Descripción:** Corregir CostEstimator y dependencias reales de ApplicationKernel, WorkflowOrchestrator, ServiceRegistry y ApplicationContext.
- **Archivos/recursos:** `src/application/integration/; src/infrastructure/services/`
- **Dependencias:** LB1-032
- **Prueba:** `npm run typecheck`
- **Criterio de aceptación:** El bootstrap de servicios compila.
- **Evidencia exigida:** Resultado

## LB1-038 — Resolver el resto de imports relativos
- **Área:** Imports
- **Estado:** PENDIENTE
- **Descripción:** Procesar el CSV completo hasta dejar cero imports relativos no resueltos en el árbol activo.
- **Archivos/recursos:** `IMPORTS_NO_RESUELTOS_CONTRATA_IA.csv`
- **Dependencias:** LB1-033 a LB1-037
- **Prueba:** `npm run audit:imports`
- **Criterio de aceptación:** 0 referencias relativas no resueltas.
- **Evidencia exigida:** Informe vacío

## LB1-039 — Corregir 00-core.rules.yaml
- **Área:** Conocimiento
- **Estado:** PENDIENTE
- **Descripción:** Reparar la sintaxis en la zona auditada y validar que la semántica no se alteró.
- **Archivos/recursos:** `knowledge/rule-engine/00-core.rules.yaml`
- **Dependencias:** LB1-010
- **Prueba:** `npm run validate:knowledge`
- **Criterio de aceptación:** YAML válido y reglas contabilizadas.
- **Evidencia exigida:** Resultado

## LB1-040 — Corregir extincion.rules.yaml
- **Área:** Conocimiento
- **Estado:** PENDIENTE
- **Descripción:** Reparar estructura YAML, validar claves y conservar la intención de las reglas.
- **Archivos/recursos:** `knowledge/rules/extincion.rules.yaml`
- **Dependencias:** LB1-010
- **Prueba:** `npm run validate:knowledge`
- **Criterio de aceptación:** YAML válido y cargable.
- **Evidencia exigida:** Resultado

## LB1-041 — Corregir criterios.rules.yaml
- **Área:** Conocimiento
- **Estado:** PENDIENTE
- **Descripción:** Reparar estructura YAML, validar claves y conservar la intención de las reglas.
- **Archivos/recursos:** `knowledge/rules/criterios.rules.yaml`
- **Dependencias:** LB1-010
- **Prueba:** `npm run validate:knowledge`
- **Criterio de aceptación:** YAML válido y cargable.
- **Evidencia exigida:** Resultado

## LB1-042 — Corregir evaluacion.rules.yaml
- **Área:** Conocimiento
- **Estado:** PENDIENTE
- **Descripción:** Reparar estructura YAML, validar claves y conservar la intención de las reglas.
- **Archivos/recursos:** `knowledge/rules/evaluacion.rules.yaml`
- **Dependencias:** LB1-010
- **Prueba:** `npm run validate:knowledge`
- **Criterio de aceptación:** YAML válido y cargable.
- **Evidencia exigida:** Resultado

## LB1-043 — Corregir pliegos.rules.yaml
- **Área:** Conocimiento
- **Estado:** PENDIENTE
- **Descripción:** Reparar estructura YAML, validar claves y conservar la intención de las reglas.
- **Archivos/recursos:** `knowledge/rules/pliegos.rules.yaml`
- **Dependencias:** LB1-010
- **Prueba:** `npm run validate:knowledge`
- **Criterio de aceptación:** YAML válido y cargable.
- **Evidencia exigida:** Resultado

## LB1-044 — Corregir ejecucion.rules.yaml
- **Área:** Conocimiento
- **Estado:** PENDIENTE
- **Descripción:** Reparar estructura YAML, validar claves y conservar la intención de las reglas.
- **Archivos/recursos:** `knowledge/rules/ejecucion.rules.yaml`
- **Dependencias:** LB1-010
- **Prueba:** `npm run validate:knowledge`
- **Criterio de aceptación:** YAML válido y cargable.
- **Evidencia exigida:** Resultado

## LB1-045 — Corregir documentos.rules.yaml
- **Área:** Conocimiento
- **Estado:** PENDIENTE
- **Descripción:** Reparar estructura YAML, validar claves y conservar la intención de las reglas.
- **Archivos/recursos:** `knowledge/rules/documentos.rules.yaml`
- **Dependencias:** LB1-010
- **Prueba:** `npm run validate:knowledge`
- **Criterio de aceptación:** YAML válido y cargable.
- **Evidencia exigida:** Resultado

## LB1-046 — Eliminar errores de dependencias externas
- **Área:** Toolchain
- **Estado:** PENDIENTE
- **Descripción:** Instalar o sustituir las dependencias realmente utilizadas; prohibido añadir librerías para código archivado.
- **Archivos/recursos:** `package.json; package-lock.json`
- **Dependencias:** LB1-031, LB1-038
- **Prueba:** `npm ci && npm run typecheck`
- **Criterio de aceptación:** No faltan módulos externos en el árbol activo.
- **Evidencia exigida:** Resultado

## LB1-047 — Integrar bootstrap mínimo
- **Área:** Entrypoint
- **Estado:** PENDIENTE
- **Descripción:** Inicializar configuración, logger y una versión mínima del contenedor sin cargar motores rotos.
- **Archivos/recursos:** `src/main.ts; src/bootstrap/`
- **Dependencias:** LB1-012, LB1-031, LB1-038
- **Prueba:** `npm start`
- **Criterio de aceptación:** Arranque limpio y cierre controlado.
- **Evidencia exigida:** Log

## LB1-048 — Crear smoke tests de configuración y arranque
- **Área:** Tests
- **Estado:** PENDIENTE
- **Descripción:** Comprobar que configuración, rutas temporales y bootstrap mínimo funcionan.
- **Archivos/recursos:** `tests/smoke/bootstrap.test.ts`
- **Dependencias:** LB1-011, LB1-047
- **Prueba:** `npm test`
- **Criterio de aceptación:** Smoke tests verdes.
- **Evidencia exigida:** Informe

## LB1-049 — Cerrar LB-1
- **Área:** Puerta
- **Estado:** PENDIENTE
- **Descripción:** Ejecutar instalación limpia, typecheck, build, tests y start.
- **Archivos/recursos:** `Proyecto completo activo`
- **Dependencias:** LB1-001 a LB1-048
- **Prueba:** `npm ci && npm run typecheck && npm run build && npm test && npm start`
- **Criterio de aceptación:** Todos los comandos terminan con código 0.
- **Evidencia exigida:** Acta de cierre LB-1

## PUERTA DE LB-1
**typecheck/build/test/start = código 0**

# LB-2 — Arquitectura canónica

## LB2-001 — Crear mapa AS-IS
- **Área:** Arquitectura
- **Estado:** PENDIENTE
- **Descripción:** Documentar módulos actuales, dependencias y familias paralelas.
- **Archivos/recursos:** `docs/architecture/AS_IS_ARCHITECTURE.md`
- **Dependencias:** LB1-049
- **Prueba:** `Revisión contra inventario`
- **Criterio de aceptación:** El mapa refleja el repositorio compilable.
- **Evidencia exigida:** Documento

## LB2-002 — Diseñar arquitectura TO-BE
- **Área:** Arquitectura
- **Estado:** PENDIENTE
- **Descripción:** Definir capas UI/API/Application/Domain/Infrastructure y reglas de dependencia.
- **Archivos/recursos:** `docs/architecture/ARCHITECTURE.md`
- **Dependencias:** LB2-001
- **Prueba:** `Revisión arquitectónica`
- **Criterio de aceptación:** Arquitectura objetivo aprobada.
- **Evidencia exigida:** Documento

## LB2-003 — Crear plantilla ADR
- **Área:** Gobierno
- **Estado:** PENDIENTE
- **Descripción:** Definir plantilla con problema, contexto, alternativas, decisión, impacto y migración.
- **Archivos/recursos:** `docs/architecture/ADR-TEMPLATE.md`
- **Dependencias:** LB2-002
- **Prueba:** `Revisión`
- **Criterio de aceptación:** Plantilla disponible.
- **Evidencia exigida:** Archivo

## LB2-004 — Seleccionar implementación canónica: Configuración
- **Área:** Consolidación
- **Estado:** PENDIENTE
- **Descripción:** Comparar APIs, cobertura, dependencias, pruebas potenciales y capacidad de integración; registrar la decisión y plan de migración.
- **Archivos/recursos:** `AppConfiguration.ts; ApplicationConfiguration.ts; ConfigManager.ts; ConfigurationManager.ts; Environment.ts; docs/architecture/ADR-0002-CONFIGURATION.md`
- **Dependencias:** LB2-002, LB2-003
- **Prueba:** `Matriz comparativa + typecheck`
- **Criterio de aceptación:** Existe una única implementación canónica declarada y un plan para retirar alternativas.
- **Evidencia exigida:** ADR

## LB2-005 — Seleccionar implementación canónica: EventBus
- **Área:** Consolidación
- **Estado:** PENDIENTE
- **Descripción:** Comparar APIs, cobertura, dependencias, pruebas potenciales y capacidad de integración; registrar la decisión y plan de migración.
- **Archivos/recursos:** `src/infrastructure/events/EventBus.ts; src/domain/events/EventBus.ts; docs/architecture/ADR-0003-EVENTS.md`
- **Dependencias:** LB2-002, LB2-003
- **Prueba:** `Matriz comparativa + typecheck`
- **Criterio de aceptación:** Existe una única implementación canónica declarada y un plan para retirar alternativas.
- **Evidencia exigida:** ADR

## LB2-006 — Seleccionar implementación canónica: RuleEngine
- **Área:** Consolidación
- **Estado:** PENDIENTE
- **Descripción:** Comparar APIs, cobertura, dependencias, pruebas potenciales y capacidad de integración; registrar la decisión y plan de migración.
- **Archivos/recursos:** `src/engines/RuleEngine.ts; src/knowledge/RuleEngine.ts; src/domain/conocimiento/RuleEngine.ts; src/domain/knowledge/RuleEngine.ts; src/domain/rules/RuleEngine.ts; docs/architecture/ADR-0004-RULE-ENGINE.md`
- **Dependencias:** LB2-002, LB2-003
- **Prueba:** `Matriz comparativa + typecheck`
- **Criterio de aceptación:** Existe una única implementación canónica declarada y un plan para retirar alternativas.
- **Evidencia exigida:** ADR

## LB2-007 — Seleccionar implementación canónica: InferenceEngine
- **Área:** Consolidación
- **Estado:** PENDIENTE
- **Descripción:** Comparar APIs, cobertura, dependencias, pruebas potenciales y capacidad de integración; registrar la decisión y plan de migración.
- **Archivos/recursos:** `src/knowledge/InferenceEngine.ts; src/domain/conocimiento/InferenceEngine.ts; src/domain/legal/core/InferenceEngine.ts; src/domain/legal/reasoner/InferenceEngine.ts; knowledge/inference/InferenceEngine.ts; docs/architecture/ADR-0005-INFERENCE.md`
- **Dependencias:** LB2-002, LB2-003
- **Prueba:** `Matriz comparativa + typecheck`
- **Criterio de aceptación:** Existe una única implementación canónica declarada y un plan para retirar alternativas.
- **Evidencia exigida:** ADR

## LB2-008 — Seleccionar implementación canónica: KnowledgeRepository
- **Área:** Consolidación
- **Estado:** PENDIENTE
- **Descripción:** Comparar APIs, cobertura, dependencias, pruebas potenciales y capacidad de integración; registrar la decisión y plan de migración.
- **Archivos/recursos:** `src/repositories/KnowledgeRepository.ts; src/infrastructure/persistence/KnowledgeRepository.ts; src/domain/conocimiento/KnowledgeRepository.ts; src/domain/knowledge/KnowledgeRepository.ts; docs/architecture/ADR-0006-KNOWLEDGE.md`
- **Dependencias:** LB2-002, LB2-003
- **Prueba:** `Matriz comparativa + typecheck`
- **Criterio de aceptación:** Existe una única implementación canónica declarada y un plan para retirar alternativas.
- **Evidencia exigida:** ADR

## LB2-009 — Seleccionar implementación canónica: LegalReasoner
- **Área:** Consolidación
- **Estado:** PENDIENTE
- **Descripción:** Comparar APIs, cobertura, dependencias, pruebas potenciales y capacidad de integración; registrar la decisión y plan de migración.
- **Archivos/recursos:** `src/domain/legal/LegalReasoner.ts; src/domain/legal/core/LegalReasoner.ts; knowledge/reasoning/LegalReasoner.ts; docs/architecture/ADR-0007-LEGAL-REASONER.md`
- **Dependencias:** LB2-002, LB2-003
- **Prueba:** `Matriz comparativa + typecheck`
- **Criterio de aceptación:** Existe una única implementación canónica declarada y un plan para retirar alternativas.
- **Evidencia exigida:** ADR

## LB2-010 — Seleccionar implementación canónica: DecisionEngine
- **Área:** Consolidación
- **Estado:** PENDIENTE
- **Descripción:** Comparar APIs, cobertura, dependencias, pruebas potenciales y capacidad de integración; registrar la decisión y plan de migración.
- **Archivos/recursos:** `src/domain/knowledge/DecisionEngine.ts; src/domain/decision/DecisionEngine.ts; src/domain/legal/core/DecisionEngine.ts; docs/architecture/ADR-0008-DECISIONS.md`
- **Dependencias:** LB2-002, LB2-003
- **Prueba:** `Matriz comparativa + typecheck`
- **Criterio de aceptación:** Existe una única implementación canónica declarada y un plan para retirar alternativas.
- **Evidencia exigida:** ADR

## LB2-011 — Seleccionar implementación canónica: CPVEngine y CPVResolver
- **Área:** Consolidación
- **Estado:** PENDIENTE
- **Descripción:** Comparar APIs, cobertura, dependencias, pruebas potenciales y capacidad de integración; registrar la decisión y plan de migración.
- **Archivos/recursos:** `src/engines/CPVEngine.ts; src/domain/cpv/CPVEngine.ts; src/domain/resolvers/CPVResolver.ts; src/domain/legal/modules/cpv/CPVResolver.ts; docs/architecture/ADR-0009-CPV.md`
- **Dependencias:** LB2-002, LB2-003
- **Prueba:** `Matriz comparativa + typecheck`
- **Criterio de aceptación:** Existe una única implementación canónica declarada y un plan para retirar alternativas.
- **Evidencia exigida:** ADR

## LB2-012 — Seleccionar implementación canónica: Solvencia
- **Área:** Consolidación
- **Estado:** PENDIENTE
- **Descripción:** Comparar APIs, cobertura, dependencias, pruebas potenciales y capacidad de integración; registrar la decisión y plan de migración.
- **Archivos/recursos:** `src/domain/resolvers/SolvencyResolver.ts; src/domain/rules/solvency/SolvencyResolver.ts; src/domain/legal/modules/solvencia/SolvencyResolver.ts; docs/architecture/ADR-0010-SOLVENCY.md`
- **Dependencias:** LB2-002, LB2-003
- **Prueba:** `Matriz comparativa + typecheck`
- **Criterio de aceptación:** Existe una única implementación canónica declarada y un plan para retirar alternativas.
- **Evidencia exigida:** ADR

## LB2-013 — Seleccionar implementación canónica: Garantías
- **Área:** Consolidación
- **Estado:** PENDIENTE
- **Descripción:** Comparar APIs, cobertura, dependencias, pruebas potenciales y capacidad de integración; registrar la decisión y plan de migración.
- **Archivos/recursos:** `src/domain/resolvers/GuaranteeResolver.ts; src/domain/rules/guarantees/GuaranteeResolver.ts; src/domain/legal/modules/garantias/GuaranteeResolver.ts; docs/architecture/ADR-0011-GUARANTEES.md`
- **Dependencias:** LB2-002, LB2-003
- **Prueba:** `Matriz comparativa + typecheck`
- **Criterio de aceptación:** Existe una única implementación canónica declarada y un plan para retirar alternativas.
- **Evidencia exigida:** ADR

## LB2-014 — Seleccionar implementación canónica: Procedimiento
- **Área:** Consolidación
- **Estado:** PENDIENTE
- **Descripción:** Comparar APIs, cobertura, dependencias, pruebas potenciales y capacidad de integración; registrar la decisión y plan de migración.
- **Archivos/recursos:** `src/domain/resolvers/ProcedureResolver.ts; src/domain/legal/modules/procedimiento/ProcedureResolver.ts; docs/architecture/ADR-0012-PROCEDURE.md`
- **Dependencias:** LB2-002, LB2-003
- **Prueba:** `Matriz comparativa + typecheck`
- **Criterio de aceptación:** Existe una única implementación canónica declarada y un plan para retirar alternativas.
- **Evidencia exigida:** ADR

## LB2-015 — Seleccionar implementación canónica: Modelo de expediente
- **Área:** Consolidación
- **Estado:** PENDIENTE
- **Descripción:** Comparar APIs, cobertura, dependencias, pruebas potenciales y capacidad de integración; registrar la decisión y plan de migración.
- **Archivos/recursos:** `src/domain/expediente/; src/domain/value-objects/; src/domain/objeto/; docs/architecture/ADR-0013-EXPEDIENTE.md`
- **Dependencias:** LB2-002, LB2-003
- **Prueba:** `Matriz comparativa + typecheck`
- **Criterio de aceptación:** Existe una única implementación canónica declarada y un plan para retirar alternativas.
- **Evidencia exigida:** ADR

## LB2-016 — Seleccionar implementación canónica: Modelo documental
- **Área:** Consolidación
- **Estado:** PENDIENTE
- **Descripción:** Comparar APIs, cobertura, dependencias, pruebas potenciales y capacidad de integración; registrar la decisión y plan de migración.
- **Archivos/recursos:** `src/generators/; src/domain/documental/; src/domain/document-composer/; src/documental/; docs/architecture/ADR-0014-DOCUMENTS.md`
- **Dependencias:** LB2-002, LB2-003
- **Prueba:** `Matriz comparativa + typecheck`
- **Criterio de aceptación:** Existe una única implementación canónica declarada y un plan para retirar alternativas.
- **Evidencia exigida:** ADR

## LB2-017 — Seleccionar implementación canónica: Exportación
- **Área:** Consolidación
- **Estado:** PENDIENTE
- **Descripción:** Comparar APIs, cobertura, dependencias, pruebas potenciales y capacidad de integración; registrar la decisión y plan de migración.
- **Archivos/recursos:** `src/application/export/; exportadores previos; docs/architecture/ADR-0015-EXPORT.md`
- **Dependencias:** LB2-002, LB2-003
- **Prueba:** `Matriz comparativa + typecheck`
- **Criterio de aceptación:** Existe una única implementación canónica declarada y un plan para retirar alternativas.
- **Evidencia exigida:** ADR

## LB2-018 — Seleccionar implementación canónica: IA
- **Área:** Consolidación
- **Estado:** PENDIENTE
- **Descripción:** Comparar APIs, cobertura, dependencias, pruebas potenciales y capacidad de integración; registrar la decisión y plan de migración.
- **Archivos/recursos:** `src/infrastructure/ai/AIManager.ts; providers; registry; health; docs/architecture/ADR-0016-AI.md`
- **Dependencias:** LB2-002, LB2-003
- **Prueba:** `Matriz comparativa + typecheck`
- **Criterio de aceptación:** Existe una única implementación canónica declarada y un plan para retirar alternativas.
- **Evidencia exigida:** ADR

## LB2-019 — Seleccionar implementación canónica: Workflow
- **Área:** Consolidación
- **Estado:** PENDIENTE
- **Descripción:** Comparar APIs, cobertura, dependencias, pruebas potenciales y capacidad de integración; registrar la decisión y plan de migración.
- **Archivos/recursos:** `src/application/workflow/; src/application/workflows/; QuestionFlowEngine; docs/architecture/ADR-0017-WORKFLOW.md`
- **Dependencias:** LB2-002, LB2-003
- **Prueba:** `Matriz comparativa + typecheck`
- **Criterio de aceptación:** Existe una única implementación canónica declarada y un plan para retirar alternativas.
- **Evidencia exigida:** ADR

## LB2-020 — Definir DecisionResult común
- **Área:** Contratos
- **Estado:** PENDIENTE
- **Descripción:** Crear contrato de salida para decisiones con resultado, confianza, evidencia, fuente, motivación, advertencias y validación humana.
- **Archivos/recursos:** `src/domain/decisions/DecisionResult.ts`
- **Dependencias:** LB2-006 a LB2-014
- **Prueba:** `Tests de tipos`
- **Criterio de aceptación:** Todos los resolvers pueden devolver el contrato.
- **Evidencia exigida:** Archivo + test

## LB2-021 — Definir DecisionContext común
- **Área:** Contratos
- **Estado:** PENDIENTE
- **Descripción:** Crear entrada normalizada con expediente, fecha de referencia, configuración y conocimiento.
- **Archivos/recursos:** `src/domain/decisions/DecisionContext.ts`
- **Dependencias:** LB2-015, LB2-020
- **Prueba:** `Tests de construcción`
- **Criterio de aceptación:** Contexto suficiente y sin any estructural.
- **Evidencia exigida:** Archivo + test

## LB2-022 — Definir Evidence y LegalReference
- **Área:** Contratos
- **Estado:** PENDIENTE
- **Descripción:** Unificar la representación de fuentes, artículos, vigencia y fragmentos probatorios.
- **Archivos/recursos:** `src/domain/legal/Evidence.ts; src/domain/legal/LegalReference.ts`
- **Dependencias:** LB2-008, LB2-009
- **Prueba:** `Tests de serialización`
- **Criterio de aceptación:** Las decisiones enlazan fuentes trazables.
- **Evidencia exigida:** Archivos

## LB2-023 — Crear carpeta archive controlada
- **Área:** Migración
- **Estado:** PENDIENTE
- **Descripción:** Preparar una ubicación no compilada para alternativas retiradas temporalmente.
- **Archivos/recursos:** `archive/; tsconfig.json`
- **Dependencias:** LB2-004 a LB2-019
- **Prueba:** `npm run typecheck`
- **Criterio de aceptación:** archive queda fuera del build.
- **Evidencia exigida:** Estructura

## LB2-024 — Migrar configuración a la implementación canónica
- **Área:** Migración
- **Estado:** PENDIENTE
- **Descripción:** Actualizar imports, bootstrap y tests; archivar alternativas.
- **Archivos/recursos:** `src/infrastructure/config/; archive/`
- **Dependencias:** LB2-004, LB2-023
- **Prueba:** `npm run typecheck && npm test`
- **Criterio de aceptación:** Una sola configuración activa.
- **Evidencia exigida:** Commit

## LB2-025 — Migrar EventBus canónico
- **Área:** Migración
- **Estado:** PENDIENTE
- **Descripción:** Actualizar publishers, handlers y store al contrato seleccionado.
- **Archivos/recursos:** `src/infrastructure/events/; src/domain/events/; archive/`
- **Dependencias:** LB2-005, LB2-023
- **Prueba:** `Tests publish/subscribe`
- **Criterio de aceptación:** Un EventBus activo.
- **Evidencia exigida:** Commit

## LB2-026 — Migrar familia canónica de RuleEngine
- **Área:** Migración
- **Estado:** PENDIENTE
- **Descripción:** Actualizar imports y adaptadores; archivar alternativas solo después de comparar y conservar funcionalidad útil.
- **Archivos/recursos:** `Rutas definidas en ADR correspondiente`
- **Dependencias:** LB2-006, LB2-020 a LB2-023
- **Prueba:** `npm run typecheck; tests de familia`
- **Criterio de aceptación:** Una sola familia activa de RuleEngine, compilable y probada.
- **Evidencia exigida:** Commit + test

## LB2-027 — Migrar familia canónica de InferenceEngine
- **Área:** Migración
- **Estado:** PENDIENTE
- **Descripción:** Actualizar imports y adaptadores; archivar alternativas solo después de comparar y conservar funcionalidad útil.
- **Archivos/recursos:** `Rutas definidas en ADR correspondiente`
- **Dependencias:** LB2-007, LB2-020 a LB2-023
- **Prueba:** `npm run typecheck; tests de familia`
- **Criterio de aceptación:** Una sola familia activa de InferenceEngine, compilable y probada.
- **Evidencia exigida:** Commit + test

## LB2-028 — Migrar familia canónica de KnowledgeRepository
- **Área:** Migración
- **Estado:** PENDIENTE
- **Descripción:** Actualizar imports y adaptadores; archivar alternativas solo después de comparar y conservar funcionalidad útil.
- **Archivos/recursos:** `Rutas definidas en ADR correspondiente`
- **Dependencias:** LB2-008, LB2-020 a LB2-023
- **Prueba:** `npm run typecheck; tests de familia`
- **Criterio de aceptación:** Una sola familia activa de KnowledgeRepository, compilable y probada.
- **Evidencia exigida:** Commit + test

## LB2-029 — Migrar familia canónica de LegalReasoner
- **Área:** Migración
- **Estado:** PENDIENTE
- **Descripción:** Actualizar imports y adaptadores; archivar alternativas solo después de comparar y conservar funcionalidad útil.
- **Archivos/recursos:** `Rutas definidas en ADR correspondiente`
- **Dependencias:** LB2-009, LB2-020 a LB2-023
- **Prueba:** `npm run typecheck; tests de familia`
- **Criterio de aceptación:** Una sola familia activa de LegalReasoner, compilable y probada.
- **Evidencia exigida:** Commit + test

## LB2-030 — Migrar familia canónica de DecisionEngine
- **Área:** Migración
- **Estado:** PENDIENTE
- **Descripción:** Actualizar imports y adaptadores; archivar alternativas solo después de comparar y conservar funcionalidad útil.
- **Archivos/recursos:** `Rutas definidas en ADR correspondiente`
- **Dependencias:** LB2-010, LB2-020 a LB2-023
- **Prueba:** `npm run typecheck; tests de familia`
- **Criterio de aceptación:** Una sola familia activa de DecisionEngine, compilable y probada.
- **Evidencia exigida:** Commit + test

## LB2-031 — Migrar familia canónica de CPV
- **Área:** Migración
- **Estado:** PENDIENTE
- **Descripción:** Actualizar imports y adaptadores; archivar alternativas solo después de comparar y conservar funcionalidad útil.
- **Archivos/recursos:** `Rutas definidas en ADR correspondiente`
- **Dependencias:** LB2-011, LB2-020 a LB2-023
- **Prueba:** `npm run typecheck; tests de familia`
- **Criterio de aceptación:** Una sola familia activa de CPV, compilable y probada.
- **Evidencia exigida:** Commit + test

## LB2-032 — Migrar familia canónica de Solvencia
- **Área:** Migración
- **Estado:** PENDIENTE
- **Descripción:** Actualizar imports y adaptadores; archivar alternativas solo después de comparar y conservar funcionalidad útil.
- **Archivos/recursos:** `Rutas definidas en ADR correspondiente`
- **Dependencias:** LB2-012, LB2-020 a LB2-023
- **Prueba:** `npm run typecheck; tests de familia`
- **Criterio de aceptación:** Una sola familia activa de Solvencia, compilable y probada.
- **Evidencia exigida:** Commit + test

## LB2-033 — Migrar familia canónica de Garantías
- **Área:** Migración
- **Estado:** PENDIENTE
- **Descripción:** Actualizar imports y adaptadores; archivar alternativas solo después de comparar y conservar funcionalidad útil.
- **Archivos/recursos:** `Rutas definidas en ADR correspondiente`
- **Dependencias:** LB2-013, LB2-020 a LB2-023
- **Prueba:** `npm run typecheck; tests de familia`
- **Criterio de aceptación:** Una sola familia activa de Garantías, compilable y probada.
- **Evidencia exigida:** Commit + test

## LB2-034 — Migrar familia canónica de Procedimiento
- **Área:** Migración
- **Estado:** PENDIENTE
- **Descripción:** Actualizar imports y adaptadores; archivar alternativas solo después de comparar y conservar funcionalidad útil.
- **Archivos/recursos:** `Rutas definidas en ADR correspondiente`
- **Dependencias:** LB2-014, LB2-020 a LB2-023
- **Prueba:** `npm run typecheck; tests de familia`
- **Criterio de aceptación:** Una sola familia activa de Procedimiento, compilable y probada.
- **Evidencia exigida:** Commit + test

## LB2-035 — Migrar familia canónica de Expediente
- **Área:** Migración
- **Estado:** PENDIENTE
- **Descripción:** Actualizar imports y adaptadores; archivar alternativas solo después de comparar y conservar funcionalidad útil.
- **Archivos/recursos:** `Rutas definidas en ADR correspondiente`
- **Dependencias:** LB2-015, LB2-020 a LB2-023
- **Prueba:** `npm run typecheck; tests de familia`
- **Criterio de aceptación:** Una sola familia activa de Expediente, compilable y probada.
- **Evidencia exigida:** Commit + test

## LB2-036 — Migrar familia canónica de Documentos
- **Área:** Migración
- **Estado:** PENDIENTE
- **Descripción:** Actualizar imports y adaptadores; archivar alternativas solo después de comparar y conservar funcionalidad útil.
- **Archivos/recursos:** `Rutas definidas en ADR correspondiente`
- **Dependencias:** LB2-016, LB2-020 a LB2-023
- **Prueba:** `npm run typecheck; tests de familia`
- **Criterio de aceptación:** Una sola familia activa de Documentos, compilable y probada.
- **Evidencia exigida:** Commit + test

## LB2-037 — Migrar familia canónica de Exportación
- **Área:** Migración
- **Estado:** PENDIENTE
- **Descripción:** Actualizar imports y adaptadores; archivar alternativas solo después de comparar y conservar funcionalidad útil.
- **Archivos/recursos:** `Rutas definidas en ADR correspondiente`
- **Dependencias:** LB2-017, LB2-020 a LB2-023
- **Prueba:** `npm run typecheck; tests de familia`
- **Criterio de aceptación:** Una sola familia activa de Exportación, compilable y probada.
- **Evidencia exigida:** Commit + test

## LB2-038 — Migrar familia canónica de IA
- **Área:** Migración
- **Estado:** PENDIENTE
- **Descripción:** Actualizar imports y adaptadores; archivar alternativas solo después de comparar y conservar funcionalidad útil.
- **Archivos/recursos:** `Rutas definidas en ADR correspondiente`
- **Dependencias:** LB2-018, LB2-020 a LB2-023
- **Prueba:** `npm run typecheck; tests de familia`
- **Criterio de aceptación:** Una sola familia activa de IA, compilable y probada.
- **Evidencia exigida:** Commit + test

## LB2-039 — Migrar familia canónica de Workflow
- **Área:** Migración
- **Estado:** PENDIENTE
- **Descripción:** Actualizar imports y adaptadores; archivar alternativas solo después de comparar y conservar funcionalidad útil.
- **Archivos/recursos:** `Rutas definidas en ADR correspondiente`
- **Dependencias:** LB2-019, LB2-020 a LB2-023
- **Prueba:** `npm run typecheck; tests de familia`
- **Criterio de aceptación:** Una sola familia activa de Workflow, compilable y probada.
- **Evidencia exigida:** Commit + test

## LB2-040 — Eliminar ciclos arquitectónicos
- **Área:** Dependencias
- **Estado:** PENDIENTE
- **Descripción:** Analizar el grafo y romper dependencias Domain→Infrastructure o UI→Domain directas indebidas.
- **Archivos/recursos:** `src/`
- **Dependencias:** LB2-024 a LB2-039
- **Prueba:** `dependency-cruiser o script equivalente`
- **Criterio de aceptación:** 0 ciclos prohibidos.
- **Evidencia exigida:** Informe

## LB2-041 — Crear barrels canónicos
- **Área:** API interna
- **Estado:** PENDIENTE
- **Descripción:** Exponer APIs públicas controladas por módulo sin colisiones de nombres.
- **Archivos/recursos:** `src/**/index.ts`
- **Dependencias:** LB2-024 a LB2-040
- **Prueba:** `npm run typecheck`
- **Criterio de aceptación:** Sin exportaciones ambiguas.
- **Evidencia exigida:** Commit

## LB2-042 — Actualizar ARCHITECTURE.md con rutas reales
- **Área:** Documentación
- **Estado:** PENDIENTE
- **Descripción:** Incorporar implementaciones canónicas y dependencias permitidas.
- **Archivos/recursos:** `docs/architecture/ARCHITECTURE.md`
- **Dependencias:** LB2-024 a LB2-041
- **Prueba:** `Revisión contra imports`
- **Criterio de aceptación:** Mapa TO-BE coincide con código.
- **Evidencia exigida:** Documento

## LB2-043 — Cerrar LB-2
- **Área:** Puerta
- **Estado:** PENDIENTE
- **Descripción:** Verificar ausencia de duplicidad funcional activa, build limpio y ADRs completos.
- **Archivos/recursos:** `Proyecto completo`
- **Dependencias:** LB2-001 a LB2-042
- **Prueba:** `npm run typecheck && npm run build && npm test && npm run audit:architecture`
- **Criterio de aceptación:** Una implementación canónica por responsabilidad y un grafo coherente.
- **Evidencia exigida:** Acta de cierre LB-2

## PUERTA DE LB-2
**una implementación activa por responsabilidad**

# LB-3 — Recorrido vertical mínimo

## LB3-001 — Definir el caso de demostración
- **Área:** Caso vertical
- **Estado:** PENDIENTE
- **Descripción:** Elegir un expediente sencillo y controlado para probar el recorrido completo.
- **Archivos/recursos:** `tests/fixtures/vertical-case-001.json`
- **Dependencias:** LB2-043
- **Prueba:** `npm test o comando indicado`
- **Criterio de aceptación:** Caso documentado y estable.
- **Evidencia exigida:** Test/artefacto

## LB3-002 — Crear comando CreateExpediente
- **Área:** Expediente
- **Estado:** PENDIENTE
- **Descripción:** Implementar caso de uso de creación con ID y datos mínimos.
- **Archivos/recursos:** `src/application/expedientes/CreateExpediente.ts`
- **Dependencias:** LB3-001
- **Prueba:** `npm test o comando indicado`
- **Criterio de aceptación:** El comando crea un expediente válido.
- **Evidencia exigida:** Test/artefacto

## LB3-003 — Guardar expediente
- **Área:** Persistencia
- **Estado:** PENDIENTE
- **Descripción:** Integrar el repositorio canónico y persistir la entidad.
- **Archivos/recursos:** `src/infrastructure/persistence/ExpedienteRepository.ts`
- **Dependencias:** LB3-002
- **Prueba:** `npm test o comando indicado`
- **Criterio de aceptación:** El expediente existe tras reinicio del repositorio.
- **Evidencia exigida:** Test/artefacto

## LB3-004 — Recuperar expediente
- **Área:** Persistencia
- **Estado:** PENDIENTE
- **Descripción:** Implementar consulta por ID y manejo de no encontrado.
- **Archivos/recursos:** `src/application/expedientes/GetExpediente.ts`
- **Dependencias:** LB3-003
- **Prueba:** `npm test o comando indicado`
- **Criterio de aceptación:** La lectura reproduce los datos guardados.
- **Evidencia exigida:** Test/artefacto

## LB3-005 — Crear regla real de tipo de contrato
- **Área:** Reglas
- **Estado:** PENDIENTE
- **Descripción:** Aplicar una regla mínima sobre el objeto del caso.
- **Archivos/recursos:** `knowledge/rules/vertical-case.rules.yaml`
- **Dependencias:** LB3-001, LB2-026
- **Prueba:** `npm test o comando indicado`
- **Criterio de aceptación:** La regla devuelve resultado y evidencia.
- **Evidencia exigida:** Test/artefacto

## LB3-006 — Persistir decisión motivada
- **Área:** Decisiones
- **Estado:** PENDIENTE
- **Descripción:** Guardar resultado, regla, fuente, confianza y estado de validación.
- **Archivos/recursos:** `src/infrastructure/persistence/DecisionRepository.ts`
- **Dependencias:** LB3-005, LB2-020
- **Prueba:** `npm test o comando indicado`
- **Criterio de aceptación:** La decisión es recuperable y trazable.
- **Evidencia exigida:** Test/artefacto

## LB3-007 — Preparar catálogo controlado del caso
- **Área:** CPV
- **Estado:** PENDIENTE
- **Descripción:** Incluir candidatos suficientes para el objeto de demostración.
- **Archivos/recursos:** `knowledge/cpv/vertical-case-cpv.json`
- **Dependencias:** LB3-001, LB2-031
- **Prueba:** `npm test o comando indicado`
- **Criterio de aceptación:** Catálogo validado y versionado.
- **Evidencia exigida:** Test/artefacto

## LB3-008 — Proponer CPV principal y alternativos
- **Área:** CPV
- **Estado:** PENDIENTE
- **Descripción:** Ejecutar matcher/resolver canónico con puntuación y explicación.
- **Archivos/recursos:** `src/application/analysis/ProposeCPV.ts`
- **Dependencias:** LB3-007
- **Prueba:** `npm test o comando indicado`
- **Criterio de aceptación:** Devuelve principal, alternativas, confianza y evidencia.
- **Evidencia exigida:** Test/artefacto

## LB3-009 — Definir estados mínimos
- **Área:** Workflow
- **Estado:** PENDIENTE
- **Descripción:** CREADO, ANALISIS, PROPUESTA, PENDIENTE_VALIDACION, VALIDADO, GENERADO.
- **Archivos/recursos:** `src/application/workflow/VerticalWorkflow.ts`
- **Dependencias:** LB2-039
- **Prueba:** `npm test o comando indicado`
- **Criterio de aceptación:** Transiciones válidas y protegidas.
- **Evidencia exigida:** Test/artefacto

## LB3-010 — Ejecutar transición a análisis
- **Área:** Workflow
- **Estado:** PENDIENTE
- **Descripción:** Integrar expediente y decisiones con workflow.
- **Archivos/recursos:** `src/application/workflow/AnalyzeExpediente.ts`
- **Dependencias:** LB3-004, LB3-005, LB3-008, LB3-009
- **Prueba:** `npm test o comando indicado`
- **Criterio de aceptación:** El expediente alcanza PROPUESTA.
- **Evidencia exigida:** Test/artefacto

## LB3-011 — Crear acción ValidateDecision
- **Área:** Human in loop
- **Estado:** PENDIENTE
- **Descripción:** Permitir validar, modificar o rechazar una decisión.
- **Archivos/recursos:** `src/application/decisions/ValidateDecision.ts`
- **Dependencias:** LB3-006, LB3-010
- **Prueba:** `npm test o comando indicado`
- **Criterio de aceptación:** La intervención humana queda registrada.
- **Evidencia exigida:** Test/artefacto

## LB3-012 — Crear modelo intermedio de Memoria
- **Área:** Documentos
- **Estado:** PENDIENTE
- **Descripción:** Mapear expediente y decisiones a secciones documentales.
- **Archivos/recursos:** `src/application/documents/BuildMemoryModel.ts`
- **Dependencias:** LB3-011, LB2-036
- **Prueba:** `npm test o comando indicado`
- **Criterio de aceptación:** Modelo completo y serializable.
- **Evidencia exigida:** Test/artefacto

## LB3-013 — Validar modelo de Memoria
- **Área:** Documentos
- **Estado:** PENDIENTE
- **Descripción:** Comprobar apartados y decisiones justificadas.
- **Archivos/recursos:** `src/application/documents/ValidateMemoryModel.ts`
- **Dependencias:** LB3-012
- **Prueba:** `npm test o comando indicado`
- **Criterio de aceptación:** 0 errores bloqueantes.
- **Evidencia exigida:** Test/artefacto

## LB3-014 — Exportar JSON real
- **Área:** Exportación
- **Estado:** PENDIENTE
- **Descripción:** Generar JSON válido desde el modelo documental.
- **Archivos/recursos:** `src/application/export/JsonExporter.ts`
- **Dependencias:** LB3-013, LB2-037
- **Prueba:** `npm test o comando indicado`
- **Criterio de aceptación:** JSON parseable y fiel al modelo.
- **Evidencia exigida:** Test/artefacto

## LB3-015 — Exportar HTML real
- **Área:** Exportación
- **Estado:** PENDIENTE
- **Descripción:** Renderizar HTML semántico y legible.
- **Archivos/recursos:** `src/application/export/HtmlExporter.ts`
- **Dependencias:** LB3-013, LB2-037
- **Prueba:** `npm test o comando indicado`
- **Criterio de aceptación:** HTML válido y visualizable.
- **Evidencia exigida:** Test/artefacto

## LB3-016 — Registrar el recorrido completo
- **Área:** Auditoría
- **Estado:** PENDIENTE
- **Descripción:** Crear eventos de creación, reglas, CPV, validación, generación y exportación.
- **Archivos/recursos:** `src/infrastructure/audit/; logs/audit`
- **Dependencias:** LB3-002 a LB3-015
- **Prueba:** `npm test o comando indicado`
- **Criterio de aceptación:** La secuencia se reconstruye íntegramente.
- **Evidencia exigida:** Test/artefacto

## LB3-017 — Crear comando demo:vertical
- **Área:** CLI
- **Estado:** PENDIENTE
- **Descripción:** Ejecutar el recorrido sin interfaz gráfica.
- **Archivos/recursos:** `src/cli/vertical-demo.ts; package.json`
- **Dependencias:** LB3-016
- **Prueba:** `npm test o comando indicado`
- **Criterio de aceptación:** npm run demo:vertical termina correctamente.
- **Evidencia exigida:** Test/artefacto

## LB3-018 — Test de persistencia vertical
- **Área:** Tests
- **Estado:** PENDIENTE
- **Descripción:** Probar crear, guardar y recuperar.
- **Archivos/recursos:** `tests/integration/vertical-persistence.test.ts`
- **Dependencias:** LB3-004
- **Prueba:** `npm test o comando indicado`
- **Criterio de aceptación:** Test verde.
- **Evidencia exigida:** Test/artefacto

## LB3-019 — Test de decisión y CPV
- **Área:** Tests
- **Estado:** PENDIENTE
- **Descripción:** Probar regla, evidencia y propuesta CPV.
- **Archivos/recursos:** `tests/integration/vertical-decision-cpv.test.ts`
- **Dependencias:** LB3-008
- **Prueba:** `npm test o comando indicado`
- **Criterio de aceptación:** Test verde.
- **Evidencia exigida:** Test/artefacto

## LB3-020 — Test de workflow
- **Área:** Tests
- **Estado:** PENDIENTE
- **Descripción:** Probar transiciones y validación humana.
- **Archivos/recursos:** `tests/integration/vertical-workflow.test.ts`
- **Dependencias:** LB3-011
- **Prueba:** `npm test o comando indicado`
- **Criterio de aceptación:** Test verde.
- **Evidencia exigida:** Test/artefacto

## LB3-021 — Test documental
- **Área:** Tests
- **Estado:** PENDIENTE
- **Descripción:** Probar modelo y validación de Memoria.
- **Archivos/recursos:** `tests/integration/vertical-document.test.ts`
- **Dependencias:** LB3-013
- **Prueba:** `npm test o comando indicado`
- **Criterio de aceptación:** Test verde.
- **Evidencia exigida:** Test/artefacto

## LB3-022 — Test de exportación y auditoría
- **Área:** Tests
- **Estado:** PENDIENTE
- **Descripción:** Probar JSON, HTML y traza completa.
- **Archivos/recursos:** `tests/integration/vertical-export-audit.test.ts`
- **Dependencias:** LB3-016
- **Prueba:** `npm test o comando indicado`
- **Criterio de aceptación:** Test verde.
- **Evidencia exigida:** Test/artefacto

## LB3-023 — Documentar recorrido vertical
- **Área:** Documentación
- **Estado:** PENDIENTE
- **Descripción:** Describir comandos, entrada, decisiones y salidas.
- **Archivos/recursos:** `docs/vertical-slice/CASE-001.md`
- **Dependencias:** LB3-017 a LB3-022
- **Prueba:** `npm test o comando indicado`
- **Criterio de aceptación:** Otro desarrollador puede reproducirlo.
- **Evidencia exigida:** Test/artefacto

## LB3-024 — Cerrar LB-3
- **Área:** Puerta
- **Estado:** PENDIENTE
- **Descripción:** Ejecutar el caso vertical en instalación limpia y conservar salidas.
- **Archivos/recursos:** `tests/fixtures/output/vertical-case-001/`
- **Dependencias:** LB3-001 a LB3-023
- **Prueba:** `npm ci && npm run demo:vertical && npm test`
- **Criterio de aceptación:** Recorrido completo reproducible sin edición manual del código.
- **Evidencia exigida:** Acta de cierre LB-3

## PUERTA DE LB-3
**flujo E2E técnico reproducible**

# LB-4 — Motor normativo mínimo viable

## LB4-001 — Aprobar el primer caso de uso normativo
- **Área:** Alcance
- **Estado:** PENDIENTE
- **Descripción:** Definir tipo de contrato, rango económico, procedimiento y ámbito Junta de Andalucía.
- **Archivos/recursos:** `docs/normative/MVP_SCOPE.md`
- **Dependencias:** LB3-024
- **Prueba:** `npm run test:normative o revisión indicada`
- **Criterio de aceptación:** Alcance jurídico inequívoco.
- **Evidencia exigida:** Test/documento

## LB4-002 — Inventariar fuentes aplicables
- **Área:** Fuentes
- **Estado:** PENDIENTE
- **Descripción:** Enumerar LCSP, normas complementarias, instrucciones y modelos oficiales necesarios.
- **Archivos/recursos:** `docs/normative/SOURCE_REGISTER.csv`
- **Dependencias:** LB4-001
- **Prueba:** `npm run test:normative o revisión indicada`
- **Criterio de aceptación:** Cada fuente tiene URL/origen, fecha, vigencia y ámbito.
- **Evidencia exigida:** Test/documento

## LB4-003 — Crear modelo de vigencia normativa
- **Área:** Vigencia
- **Estado:** PENDIENTE
- **Descripción:** Representar entrada en vigor, derogación y fecha de consulta.
- **Archivos/recursos:** `src/domain/legal/Validity.ts`
- **Dependencias:** LB4-002
- **Prueba:** `npm run test:normative o revisión indicada`
- **Criterio de aceptación:** Puede decidir si una referencia está vigente en una fecha.
- **Evidencia exigida:** Test/documento

## LB4-004 — Definir esquema de regla jurídica
- **Área:** Esquema
- **Estado:** PENDIENTE
- **Descripción:** ID, condición, resultado, fundamento, fuente, prioridad, excepciones y versión.
- **Archivos/recursos:** `knowledge/schema/legal-rule.schema.json`
- **Dependencias:** LB4-002
- **Prueba:** `npm run test:normative o revisión indicada`
- **Criterio de aceptación:** Schema valida ejemplos positivos y rechaza negativos.
- **Evidencia exigida:** Test/documento

## LB4-005 — Definir esquema de fuente jurídica
- **Área:** Esquema
- **Estado:** PENDIENTE
- **Descripción:** Norma, artículo, apartado, fragmento, vigencia, jurisdicción y procedencia.
- **Archivos/recursos:** `knowledge/schema/legal-source.schema.json`
- **Dependencias:** LB4-002, LB4-003
- **Prueba:** `npm run test:normative o revisión indicada`
- **Criterio de aceptación:** Fuentes validables.
- **Evidencia exigida:** Test/documento

## LB4-006 — Normalizar artículos LCSP del caso
- **Área:** Conocimiento
- **Estado:** PENDIENTE
- **Descripción:** Estructurar todos los artículos necesarios para el MVP.
- **Archivos/recursos:** `knowledge/lcsp/articles/`
- **Dependencias:** LB4-001, LB4-005
- **Prueba:** `npm run test:normative o revisión indicada`
- **Criterio de aceptación:** Cobertura del 100 % del caso aprobado.
- **Evidencia exigida:** Test/documento

## LB4-007 — Normalizar normativa complementaria
- **Área:** Conocimiento
- **Estado:** PENDIENTE
- **Descripción:** Estructurar normas y referencias adicionales del caso.
- **Archivos/recursos:** `knowledge/regulations/`
- **Dependencias:** LB4-002, LB4-005
- **Prueba:** `npm run test:normative o revisión indicada`
- **Criterio de aceptación:** Fuentes completas para el MVP.
- **Evidencia exigida:** Test/documento

## LB4-008 — Definir fuente controlada CPV
- **Área:** CPV
- **Estado:** PENDIENTE
- **Descripción:** Seleccionar catálogo completo o mecanismo oficial y condiciones de actualización.
- **Archivos/recursos:** `docs/normative/CPV_SOURCE.md`
- **Dependencias:** LB4-001
- **Prueba:** `npm run test:normative o revisión indicada`
- **Criterio de aceptación:** Origen y licencia documentados.
- **Evidencia exigida:** Test/documento

## LB4-009 — Importar y validar catálogo CPV
- **Área:** CPV
- **Estado:** PENDIENTE
- **Descripción:** Cargar códigos, descripciones y jerarquía requeridos.
- **Archivos/recursos:** `knowledge/cpv/`
- **Dependencias:** LB4-008
- **Prueba:** `npm run test:normative o revisión indicada`
- **Criterio de aceptación:** Catálogo sin duplicados y consultable.
- **Evidencia exigida:** Test/documento

## LB4-010 — Crear normalización lingüística CPV
- **Área:** CPV
- **Estado:** PENDIENTE
- **Descripción:** Sinónimos, lematización y términos administrativos controlados.
- **Archivos/recursos:** `knowledge/cpv/synonyms.json`
- **Dependencias:** LB4-009
- **Prueba:** `npm run test:normative o revisión indicada`
- **Criterio de aceptación:** Casos de prueba recuperan candidatos esperados.
- **Evidencia exigida:** Test/documento

## LB4-011 — Implementar reglas de tipo de contrato
- **Área:** Tipo contractual
- **Estado:** PENDIENTE
- **Descripción:** Determinar tipo a partir de objeto y prestación principal.
- **Archivos/recursos:** `knowledge/rules/contract-type.rules.yaml`
- **Dependencias:** LB4-004, LB4-006
- **Prueba:** `npm run test:normative o revisión indicada`
- **Criterio de aceptación:** Casos positivos, negativos y mixtos pasan.
- **Evidencia exigida:** Test/documento

## LB4-012 — Implementar reglas de lotes
- **Área:** Lotes
- **Estado:** PENDIENTE
- **Descripción:** Proponer división/no división y exigir motivación.
- **Archivos/recursos:** `knowledge/rules/lots.rules.yaml`
- **Dependencias:** LB4-004, LB4-006
- **Prueba:** `npm run test:normative o revisión indicada`
- **Criterio de aceptación:** Resultado motivado y trazable.
- **Evidencia exigida:** Test/documento

## LB4-013 — Implementar reglas de procedimiento
- **Área:** Procedimiento
- **Estado:** PENDIENTE
- **Descripción:** Determinar procedimiento compatible con tipo, valor y circunstancias.
- **Archivos/recursos:** `knowledge/rules/procedure.rules.yaml`
- **Dependencias:** LB4-004, LB4-006
- **Prueba:** `npm run test:normative o revisión indicada`
- **Criterio de aceptación:** Casos límite de umbral pasan.
- **Evidencia exigida:** Test/documento

## LB4-014 — Implementar reglas de tramitación
- **Área:** Tramitación
- **Estado:** PENDIENTE
- **Descripción:** Ordinaria, urgente o emergencia cuando proceda.
- **Archivos/recursos:** `knowledge/rules/processing.rules.yaml`
- **Dependencias:** LB4-004, LB4-006
- **Prueba:** `npm run test:normative o revisión indicada`
- **Criterio de aceptación:** Excepciones justificadas.
- **Evidencia exigida:** Test/documento

## LB4-015 — Implementar regulación armonizada
- **Área:** Regulación
- **Estado:** PENDIENTE
- **Descripción:** Resolver sujeción y efectos.
- **Archivos/recursos:** `knowledge/rules/harmonized.rules.yaml`
- **Dependencias:** LB4-004, LB4-006
- **Prueba:** `npm run test:normative o revisión indicada`
- **Criterio de aceptación:** Casos de umbral pasan.
- **Evidencia exigida:** Test/documento

## LB4-016 — Implementar reglas de publicidad
- **Área:** Publicidad
- **Estado:** PENDIENTE
- **Descripción:** Perfil, plataforma y DOUE conforme al caso.
- **Archivos/recursos:** `knowledge/rules/publication.rules.yaml`
- **Dependencias:** LB4-013, LB4-015
- **Prueba:** `npm run test:normative o revisión indicada`
- **Criterio de aceptación:** Canales y motivación correctos.
- **Evidencia exigida:** Test/documento

## LB4-017 — Implementar reglas de plazos
- **Área:** Plazos
- **Estado:** PENDIENTE
- **Descripción:** Presentación, adjudicación y formalización.
- **Archivos/recursos:** `knowledge/rules/deadlines.rules.yaml`
- **Dependencias:** LB4-013 a LB4-016
- **Prueba:** `npm run test:normative o revisión indicada`
- **Criterio de aceptación:** Cálculos reproducibles.
- **Evidencia exigida:** Test/documento

## LB4-018 — Implementar exigibilidad de solvencia
- **Área:** Solvencia
- **Estado:** PENDIENTE
- **Descripción:** Resolver si se exige y qué categorías aplican.
- **Archivos/recursos:** `knowledge/rules/solvency.rules.yaml`
- **Dependencias:** LB4-004, LB4-006
- **Prueba:** `npm run test:normative o revisión indicada`
- **Criterio de aceptación:** Casos pasan.
- **Evidencia exigida:** Test/documento

## LB4-019 — Implementar mínimos de solvencia
- **Área:** Solvencia
- **Estado:** PENDIENTE
- **Descripción:** Generar umbrales o criterios proporcionados y justificados.
- **Archivos/recursos:** `knowledge/rules/solvency-thresholds.rules.yaml`
- **Dependencias:** LB4-018
- **Prueba:** `npm run test:normative o revisión indicada`
- **Criterio de aceptación:** No excede proporcionalidad configurada.
- **Evidencia exigida:** Test/documento

## LB4-020 — Implementar garantías
- **Área:** Garantías
- **Estado:** PENDIENTE
- **Descripción:** Provisional, definitiva y complementaria.
- **Archivos/recursos:** `knowledge/rules/guarantees.rules.yaml`
- **Dependencias:** LB4-004, LB4-006
- **Prueba:** `npm run test:normative o revisión indicada`
- **Criterio de aceptación:** Resultados motivados.
- **Evidencia exigida:** Test/documento

## LB4-021 — Implementar estructura de criterios
- **Área:** Criterios
- **Estado:** PENDIENTE
- **Descripción:** Automáticos y juicio de valor, pesos y vinculación al objeto.
- **Archivos/recursos:** `knowledge/rules/award-criteria.rules.yaml`
- **Dependencias:** LB4-004, LB4-006
- **Prueba:** `npm run test:normative o revisión indicada`
- **Criterio de aceptación:** Ponderaciones válidas y suma controlada.
- **Evidencia exigida:** Test/documento

## LB4-022 — Implementar validación de fórmulas
- **Área:** Fórmulas
- **Estado:** PENDIENTE
- **Descripción:** Comprobar rango, monotonicidad y ausencia de resultados absurdos.
- **Archivos/recursos:** `src/domain/evaluation/FormulaValidator.ts`
- **Dependencias:** LB4-021
- **Prueba:** `npm run test:normative o revisión indicada`
- **Criterio de aceptación:** Batería matemática verde.
- **Evidencia exigida:** Test/documento

## LB4-023 — Implementar cláusulas sociales
- **Área:** Cláusulas
- **Estado:** PENDIENTE
- **Descripción:** Seleccionar y motivar las aplicables al caso.
- **Archivos/recursos:** `knowledge/rules/social-clauses.rules.yaml`
- **Dependencias:** LB4-004, LB4-006
- **Prueba:** `npm run test:normative o revisión indicada`
- **Criterio de aceptación:** Cláusulas vinculadas y trazables.
- **Evidencia exigida:** Test/documento

## LB4-024 — Implementar cláusulas ambientales
- **Área:** Cláusulas
- **Estado:** PENDIENTE
- **Descripción:** Seleccionar y motivar las aplicables al caso.
- **Archivos/recursos:** `knowledge/rules/environmental-clauses.rules.yaml`
- **Dependencias:** LB4-004, LB4-006
- **Prueba:** `npm run test:normative o revisión indicada`
- **Criterio de aceptación:** Cláusulas vinculadas y trazables.
- **Evidencia exigida:** Test/documento

## LB4-025 — Implementar condiciones especiales y penalidades
- **Área:** Ejecución
- **Estado:** PENDIENTE
- **Descripción:** Resolver condiciones de ejecución, seguimiento y penalidades.
- **Archivos/recursos:** `knowledge/rules/execution.rules.yaml`
- **Dependencias:** LB4-004, LB4-006
- **Prueba:** `npm run test:normative o revisión indicada`
- **Criterio de aceptación:** Salida coherente con el caso.
- **Evidencia exigida:** Test/documento

## LB4-026 — Crear ExplanationBuilder jurídico
- **Área:** Explicación
- **Estado:** PENDIENTE
- **Descripción:** Componer decisión, porqué, regla, fuente, evidencia, alternativas y riesgo.
- **Archivos/recursos:** `src/domain/legal/ExplanationBuilder.ts`
- **Dependencias:** LB4-011 a LB4-025
- **Prueba:** `npm run test:normative o revisión indicada`
- **Criterio de aceptación:** Todas las decisiones del MVP son explicables.
- **Evidencia exigida:** Test/documento

## LB4-027 — Crear resolución de reglas en conflicto
- **Área:** Conflictos
- **Estado:** PENDIENTE
- **Descripción:** Prioridad, especificidad, vigencia y registro del conflicto.
- **Archivos/recursos:** `src/domain/rules/ConflictResolver.ts`
- **Dependencias:** LB4-004, LB4-026
- **Prueba:** `npm run test:normative o revisión indicada`
- **Criterio de aceptación:** Conflictos de fixture resueltos de forma determinista.
- **Evidencia exigida:** Test/documento

## LB4-028 — Crear validador de decisión normativa
- **Área:** Validación
- **Estado:** PENDIENTE
- **Descripción:** Rechazar decisiones sin fuente, vigencia o motivación.
- **Archivos/recursos:** `src/domain/legal/LegalDecisionValidator.ts`
- **Dependencias:** LB4-026, LB4-027
- **Prueba:** `npm run test:normative o revisión indicada`
- **Criterio de aceptación:** No se emiten decisiones incompletas.
- **Evidencia exigida:** Test/documento

## LB4-029 — Crear fixtures positivos
- **Área:** Casos
- **Estado:** PENDIENTE
- **Descripción:** Casos donde cada regla debe activar.
- **Archivos/recursos:** `tests/normative/fixtures/positive/`
- **Dependencias:** LB4-011 a LB4-025
- **Prueba:** `npm run test:normative o revisión indicada`
- **Criterio de aceptación:** Todos producen el resultado esperado.
- **Evidencia exigida:** Test/documento

## LB4-030 — Crear fixtures negativos
- **Área:** Casos
- **Estado:** PENDIENTE
- **Descripción:** Casos donde las reglas no deben activar.
- **Archivos/recursos:** `tests/normative/fixtures/negative/`
- **Dependencias:** LB4-011 a LB4-025
- **Prueba:** `npm run test:normative o revisión indicada`
- **Criterio de aceptación:** No hay falsos positivos definidos.
- **Evidencia exigida:** Test/documento

## LB4-031 — Crear fixtures límite
- **Área:** Casos
- **Estado:** PENDIENTE
- **Descripción:** Umbrales, fechas, objetos mixtos y excepciones.
- **Archivos/recursos:** `tests/normative/fixtures/boundary/`
- **Dependencias:** LB4-011 a LB4-025
- **Prueba:** `npm run test:normative o revisión indicada`
- **Criterio de aceptación:** Todos los límites están cubiertos.
- **Evidencia exigida:** Test/documento

## LB4-032 — Crear suite de regresión normativa
- **Área:** Tests
- **Estado:** PENDIENTE
- **Descripción:** Ejecutar fixtures y comparar decisión, regla y fuente.
- **Archivos/recursos:** `tests/normative/`
- **Dependencias:** LB4-029 a LB4-031
- **Prueba:** `npm run test:normative o revisión indicada`
- **Criterio de aceptación:** Suite verde y reproducible.
- **Evidencia exigida:** Test/documento

## LB4-033 — Realizar revisión jurídica del MVP
- **Área:** Revisión
- **Estado:** PENDIENTE
- **Descripción:** Contrastar reglas y motivaciones con técnico responsable.
- **Archivos/recursos:** `docs/normative/MVP_LEGAL_REVIEW.md`
- **Dependencias:** LB4-032
- **Prueba:** `npm run test:normative o revisión indicada`
- **Criterio de aceptación:** Observaciones resueltas o registradas.
- **Evidencia exigida:** Test/documento

## LB4-034 — Versionar el paquete normativo
- **Área:** Versionado
- **Estado:** PENDIENTE
- **Descripción:** Asignar versión, fecha y changelog de reglas.
- **Archivos/recursos:** `knowledge/VERSION.json; knowledge/CHANGELOG.md`
- **Dependencias:** LB4-033
- **Prueba:** `npm run test:normative o revisión indicada`
- **Criterio de aceptación:** Paquete normativo identificable.
- **Evidencia exigida:** Test/documento

## LB4-035 — Definir procedimiento de actualización normativa
- **Área:** Actualización
- **Estado:** PENDIENTE
- **Descripción:** Fuentes, revisión, aprobación y regresión obligatoria.
- **Archivos/recursos:** `docs/normative/UPDATE_PROCEDURE.md`
- **Dependencias:** LB4-034
- **Prueba:** `npm run test:normative o revisión indicada`
- **Criterio de aceptación:** Procedimiento aprobado.
- **Evidencia exigida:** Test/documento

## LB4-036 — Cerrar LB-4
- **Área:** Puerta
- **Estado:** PENDIENTE
- **Descripción:** Ejecutar suite normativa y aprobar formalmente el caso MVP.
- **Archivos/recursos:** `knowledge/; tests/normative/`
- **Dependencias:** LB4-001 a LB4-035
- **Prueba:** `npm run validate:knowledge && npm run test:normative`
- **Criterio de aceptación:** Batería jurídica verde y revisión técnica aprobada.
- **Evidencia exigida:** Acta de cierre LB-4

## PUERTA DE LB-4
**batería jurídica del MVP aprobada**

# LB-5 — Documentos administrativos reales

## LB5-001 — Definir DocumentModel canónico
- **Área:** Modelo
- **Estado:** PENDIENTE
- **Descripción:** Metadatos, secciones, tablas, anexos, referencias y validaciones.
- **Archivos/recursos:** `src/domain/documents/DocumentModel.ts`
- **Dependencias:** LB2-036, LB4-036
- **Prueba:** `npm run test:documents o revisión indicada`
- **Criterio de aceptación:** Modelo serializable y sin dependencia de formato.
- **Evidencia exigida:** Test/documento

## LB5-002 — Definir DocumentContext canónico
- **Área:** Modelo
- **Estado:** PENDIENTE
- **Descripción:** Expediente, decisiones validadas, fuentes, usuario y configuración.
- **Archivos/recursos:** `src/domain/documents/DocumentContext.ts`
- **Dependencias:** LB5-001
- **Prueba:** `npm run test:documents o revisión indicada`
- **Criterio de aceptación:** Contexto suficiente para todos los generadores.
- **Evidencia exigida:** Test/documento

## LB5-003 — Consolidar DocumentComposer
- **Área:** Composición
- **Estado:** PENDIENTE
- **Descripción:** Componer secciones y anexos sin formato específico.
- **Archivos/recursos:** `src/application/documents/DocumentComposer.ts`
- **Dependencias:** LB5-001, LB5-002
- **Prueba:** `npm run test:documents o revisión indicada`
- **Criterio de aceptación:** Compone fixture de ejemplo.
- **Evidencia exigida:** Test/documento

## LB5-004 — Consolidar NumberingEngine
- **Área:** Composición
- **Estado:** PENDIENTE
- **Descripción:** Numerar títulos, cláusulas, apartados y anexos.
- **Archivos/recursos:** `src/application/documents/NumberingEngine.ts`
- **Dependencias:** LB5-001
- **Prueba:** `npm run test:documents o revisión indicada`
- **Criterio de aceptación:** Numeración estable y probada.
- **Evidencia exigida:** Test/documento

## LB5-005 — Consolidar TableModel
- **Área:** Composición
- **Estado:** PENDIENTE
- **Descripción:** Representar tablas administrativas y celdas complejas.
- **Archivos/recursos:** `src/domain/documents/TableModel.ts`
- **Dependencias:** LB5-001
- **Prueba:** `npm run test:documents o revisión indicada`
- **Criterio de aceptación:** Tablas serializables.
- **Evidencia exigida:** Test/documento

## LB5-006 — Inventariar modelos aportados
- **Área:** Plantillas
- **Estado:** PENDIENTE
- **Descripción:** Clasificar Memoria, PCAP, PPT e informes por tipo y vigencia.
- **Archivos/recursos:** `docs/documents/MODEL_REGISTER.csv`
- **Dependencias:** LB4-036
- **Prueba:** `npm run test:documents o revisión indicada`
- **Criterio de aceptación:** Cada modelo tiene procedencia y uso.
- **Evidencia exigida:** Test/documento

## LB5-007 — Extraer guía corporativa
- **Área:** Estilo
- **Estado:** PENDIENTE
- **Descripción:** Tipografía, márgenes, encabezados, pies, numeración, tablas y símbolos.
- **Archivos/recursos:** `docs/documents/STYLE_GUIDE.md`
- **Dependencias:** LB5-006
- **Prueba:** `npm run test:documents o revisión indicada`
- **Criterio de aceptación:** Guía revisada contra modelos.
- **Evidencia exigida:** Test/documento

## LB5-008 — Crear plantilla canónica de Memoria
- **Área:** Plantillas
- **Estado:** PENDIENTE
- **Descripción:** Estructura y tokens del caso MVP.
- **Archivos/recursos:** `templates/memory/`
- **Dependencias:** LB5-002, LB5-006, LB5-007
- **Prueba:** `npm run test:documents o revisión indicada`
- **Criterio de aceptación:** Plantilla valida todos los apartados.
- **Evidencia exigida:** Test/documento

## LB5-009 — Crear plantilla de Informe de Necesidad
- **Área:** Plantillas
- **Estado:** PENDIENTE
- **Descripción:** Estructura y tokens.
- **Archivos/recursos:** `templates/need-report/`
- **Dependencias:** LB5-002, LB5-006, LB5-007
- **Prueba:** `npm run test:documents o revisión indicada`
- **Criterio de aceptación:** Plantilla completa.
- **Evidencia exigida:** Test/documento

## LB5-010 — Crear plantilla de Insuficiencia de Medios
- **Área:** Plantillas
- **Estado:** PENDIENTE
- **Descripción:** Aplicable cuando proceda y con condiciones de uso.
- **Archivos/recursos:** `templates/means-insufficiency/`
- **Dependencias:** LB5-002, LB5-006, LB5-007
- **Prueba:** `npm run test:documents o revisión indicada`
- **Criterio de aceptación:** Plantilla completa.
- **Evidencia exigida:** Test/documento

## LB5-011 — Crear plantilla de Resolución de Inicio
- **Área:** Plantillas
- **Estado:** PENDIENTE
- **Descripción:** Estructura y fundamentos.
- **Archivos/recursos:** `templates/start-resolution/`
- **Dependencias:** LB5-002, LB5-006, LB5-007
- **Prueba:** `npm run test:documents o revisión indicada`
- **Criterio de aceptación:** Plantilla completa.
- **Evidencia exigida:** Test/documento

## LB5-012 — Crear plantilla PCAP MVP
- **Área:** Plantillas
- **Estado:** PENDIENTE
- **Descripción:** Cuadro resumen, cláusulas y anexos del caso.
- **Archivos/recursos:** `templates/pcap/`
- **Dependencias:** LB5-002, LB5-006, LB5-007
- **Prueba:** `npm run test:documents o revisión indicada`
- **Criterio de aceptación:** Plantilla completa para el alcance.
- **Evidencia exigida:** Test/documento

## LB5-013 — Crear plantilla PPT MVP
- **Área:** Plantillas
- **Estado:** PENDIENTE
- **Descripción:** Objeto, alcance, prestaciones, entregables, control y aceptación.
- **Archivos/recursos:** `templates/ppt/`
- **Dependencias:** LB5-002, LB5-006, LB5-007
- **Prueba:** `npm run test:documents o revisión indicada`
- **Criterio de aceptación:** Plantilla completa para el alcance.
- **Evidencia exigida:** Test/documento

## LB5-014 — Implementar MemoryGenerator canónico
- **Área:** Generación
- **Estado:** PENDIENTE
- **Descripción:** Transformar contexto validado a DocumentModel.
- **Archivos/recursos:** `src/application/documents/generators/MemoryGenerator.ts`
- **Dependencias:** LB5-003, LB5-008
- **Prueba:** `npm run test:documents o revisión indicada`
- **Criterio de aceptación:** Genera modelo completo.
- **Evidencia exigida:** Test/documento

## LB5-015 — Implementar NeedReportGenerator canónico
- **Área:** Generación
- **Estado:** PENDIENTE
- **Descripción:** Generar informe de necesidad.
- **Archivos/recursos:** `src/application/documents/generators/NeedReportGenerator.ts`
- **Dependencias:** LB5-003, LB5-009
- **Prueba:** `npm run test:documents o revisión indicada`
- **Criterio de aceptación:** Genera modelo completo.
- **Evidencia exigida:** Test/documento

## LB5-016 — Implementar MeansInsufficiencyGenerator
- **Área:** Generación
- **Estado:** PENDIENTE
- **Descripción:** Generar o marcar no aplicable según decisión.
- **Archivos/recursos:** `src/application/documents/generators/MeansInsufficiencyGenerator.ts`
- **Dependencias:** LB5-003, LB5-010
- **Prueba:** `npm run test:documents o revisión indicada`
- **Criterio de aceptación:** Comportamiento condicional correcto.
- **Evidencia exigida:** Test/documento

## LB5-017 — Implementar StartResolutionGenerator
- **Área:** Generación
- **Estado:** PENDIENTE
- **Descripción:** Generar resolución de inicio.
- **Archivos/recursos:** `src/application/documents/generators/StartResolutionGenerator.ts`
- **Dependencias:** LB5-003, LB5-011
- **Prueba:** `npm run test:documents o revisión indicada`
- **Criterio de aceptación:** Genera modelo completo.
- **Evidencia exigida:** Test/documento

## LB5-018 — Implementar PCAPGenerator canónico
- **Área:** Generación
- **Estado:** PENDIENTE
- **Descripción:** Generar PCAP del caso MVP con decisiones y fuentes.
- **Archivos/recursos:** `src/application/documents/generators/PCAPGenerator.ts`
- **Dependencias:** LB5-003, LB5-012
- **Prueba:** `npm run test:documents o revisión indicada`
- **Criterio de aceptación:** Genera todos los apartados del alcance.
- **Evidencia exigida:** Test/documento

## LB5-019 — Implementar PPTGenerator canónico
- **Área:** Generación
- **Estado:** PENDIENTE
- **Descripción:** Generar PPT del caso MVP.
- **Archivos/recursos:** `src/application/documents/generators/PPTGenerator.ts`
- **Dependencias:** LB5-003, LB5-013
- **Prueba:** `npm run test:documents o revisión indicada`
- **Criterio de aceptación:** Genera todos los apartados del alcance.
- **Evidencia exigida:** Test/documento

## LB5-020 — Implementar DocumentValidator canónico
- **Área:** Validación
- **Estado:** PENDIENTE
- **Descripción:** Comprobar obligatorios, incoherencias, fuentes y decisiones no validadas.
- **Archivos/recursos:** `src/application/documents/DocumentValidator.ts`
- **Dependencias:** LB5-014 a LB5-019
- **Prueba:** `npm run test:documents o revisión indicada`
- **Criterio de aceptación:** Bloquea documentos defectuosos.
- **Evidencia exigida:** Test/documento

## LB5-021 — Seleccionar librería DOCX
- **Área:** Exportación
- **Estado:** PENDIENTE
- **Descripción:** Evaluar docx u otra alternativa compatible con entorno y licencia.
- **Archivos/recursos:** `docs/architecture/ADR-0018-DOCX.md`
- **Dependencias:** LB5-007
- **Prueba:** `npm run test:documents o revisión indicada`
- **Criterio de aceptación:** Decisión registrada.
- **Evidencia exigida:** Test/documento

## LB5-022 — Implementar DOCX real
- **Área:** Exportación
- **Estado:** PENDIENTE
- **Descripción:** Renderizar DocumentModel a Word editable.
- **Archivos/recursos:** `src/infrastructure/export/DocxExporter.ts`
- **Dependencias:** LB5-020, LB5-021
- **Prueba:** `npm run test:documents o revisión indicada`
- **Criterio de aceptación:** Fichero abre en Word/LibreOffice y es editable.
- **Evidencia exigida:** Test/documento

## LB5-023 — Validar estructura interna DOCX
- **Área:** Exportación
- **Estado:** PENDIENTE
- **Descripción:** Comprobar ZIP OOXML, document.xml y relaciones.
- **Archivos/recursos:** `tests/export/docx-structure.test.ts`
- **Dependencias:** LB5-022
- **Prueba:** `npm run test:documents o revisión indicada`
- **Criterio de aceptación:** DOCX técnicamente válido.
- **Evidencia exigida:** Test/documento

## LB5-024 — Seleccionar estrategia PDF
- **Área:** Exportación
- **Estado:** PENDIENTE
- **Descripción:** Definir conversión reproducible desde DOCX/HTML o generador PDF.
- **Archivos/recursos:** `docs/architecture/ADR-0019-PDF.md`
- **Dependencias:** LB5-021
- **Prueba:** `npm run test:documents o revisión indicada`
- **Criterio de aceptación:** Decisión registrada.
- **Evidencia exigida:** Test/documento

## LB5-025 — Implementar PDF real
- **Área:** Exportación
- **Estado:** PENDIENTE
- **Descripción:** Generar PDF válido desde fuente documental aprobada.
- **Archivos/recursos:** `src/infrastructure/export/PdfExporter.ts`
- **Dependencias:** LB5-024
- **Prueba:** `npm run test:documents o revisión indicada`
- **Criterio de aceptación:** PDF abre, pagina y contiene texto seleccionable.
- **Evidencia exigida:** Test/documento

## LB5-026 — Implementar ZIP real
- **Área:** Exportación
- **Estado:** PENDIENTE
- **Descripción:** Empaquetar documentos y manifiesto.
- **Archivos/recursos:** `src/infrastructure/export/ZipExporter.ts`
- **Dependencias:** LB5-022, LB5-025
- **Prueba:** `npm run test:documents o revisión indicada`
- **Criterio de aceptación:** ZIP válido y extraíble.
- **Evidencia exigida:** Test/documento

## LB5-027 — Generar manifiesto y checksums
- **Área:** Integridad
- **Estado:** PENDIENTE
- **Descripción:** Registrar ruta, tamaño, versión y SHA-256.
- **Archivos/recursos:** `src/infrastructure/export/ManifestGenerator.ts`
- **Dependencias:** LB5-026
- **Prueba:** `npm run test:documents o revisión indicada`
- **Criterio de aceptación:** Manifest reproduce los archivos.
- **Evidencia exigida:** Test/documento

## LB5-028 — Crear checklist visual contra modelos
- **Área:** Comparación
- **Estado:** PENDIENTE
- **Descripción:** Comparar tipografía, márgenes, encabezados, pies, tablas y numeración.
- **Archivos/recursos:** `tests/golden/documents/`
- **Dependencias:** LB5-022, LB5-025
- **Prueba:** `npm run test:documents o revisión indicada`
- **Criterio de aceptación:** Checklist aprobado para cada documento.
- **Evidencia exigida:** Test/documento

## LB5-029 — Crear documentos de referencia
- **Área:** Golden tests
- **Estado:** PENDIENTE
- **Descripción:** Conservar salidas aceptadas del caso MVP.
- **Archivos/recursos:** `tests/golden/documents/approved/`
- **Dependencias:** LB5-028
- **Prueba:** `npm run test:documents o revisión indicada`
- **Criterio de aceptación:** Comparación automatizable.
- **Evidencia exigida:** Test/documento

## LB5-030 — Registrar versión documental y fuentes
- **Área:** Auditoría
- **Estado:** PENDIENTE
- **Descripción:** Cada documento debe señalar versión del expediente, reglas y plantilla.
- **Archivos/recursos:** `src/domain/documents/DocumentMetadata.ts`
- **Dependencias:** LB5-014 a LB5-027
- **Prueba:** `npm run test:documents o revisión indicada`
- **Criterio de aceptación:** Metadatos completos.
- **Evidencia exigida:** Test/documento

## LB5-031 — Documentar generación y exportación
- **Área:** Manual
- **Estado:** PENDIENTE
- **Descripción:** Explicar plantillas, validación y resolución de errores.
- **Archivos/recursos:** `docs/documents/GENERATION_GUIDE.md`
- **Dependencias:** LB5-030
- **Prueba:** `npm run test:documents o revisión indicada`
- **Criterio de aceptación:** Guía reproducible.
- **Evidencia exigida:** Test/documento

## LB5-032 — Cerrar LB-5
- **Área:** Puerta
- **Estado:** PENDIENTE
- **Descripción:** Generar Memoria, informes, PCAP y PPT reales en DOCX y PDF para el MVP.
- **Archivos/recursos:** `tests/golden/documents/output/`
- **Dependencias:** LB5-001 a LB5-031
- **Prueba:** `npm run test:documents && npm run generate:mvp-documents`
- **Criterio de aceptación:** Documentos editables y comparables con los modelos, revisión aprobada.
- **Evidencia exigida:** Acta de cierre LB-5

## PUERTA DE LB-5
**DOCX/PDF reales comparables con modelos**

# LB-6 — API, interfaz, IA integrada y exportación operativa

## LB6-001 — Seleccionar framework HTTP
- **Área:** Backend
- **Estado:** PENDIENTE
- **Descripción:** Comparar Fastify/Express u opción equivalente y registrar ADR.
- **Archivos/recursos:** `docs/architecture/ADR-0020-HTTP.md`
- **Dependencias:** LB3-024
- **Prueba:** `npm test / npm run e2e / revisión indicada`
- **Criterio de aceptación:** Framework compatible y mantenible.
- **Evidencia exigida:** Test/documento

## LB6-002 — Crear servidor y configuración
- **Área:** Backend
- **Estado:** PENDIENTE
- **Descripción:** Servidor, health endpoint, CORS controlado y apagado limpio.
- **Archivos/recursos:** `src/api/server.ts; src/api/app.ts`
- **Dependencias:** LB6-001, LB1-049
- **Prueba:** `npm test / npm run e2e / revisión indicada`
- **Criterio de aceptación:** GET /health responde.
- **Evidencia exigida:** Test/documento

## LB6-003 — Definir DTOs y validación
- **Área:** Backend
- **Estado:** PENDIENTE
- **Descripción:** DTOs de expediente, decisiones, generación y exportación.
- **Archivos/recursos:** `src/api/dto/`
- **Dependencias:** LB2-035, LB2-020
- **Prueba:** `npm test / npm run e2e / revisión indicada`
- **Criterio de aceptación:** Entradas inválidas se rechazan.
- **Evidencia exigida:** Test/documento

## LB6-004 — POST /expedientes
- **Área:** Backend
- **Estado:** PENDIENTE
- **Descripción:** Crear expediente.
- **Archivos/recursos:** `src/api/routes/expedientes.ts`
- **Dependencias:** LB6-002, LB6-003, LB3-002
- **Prueba:** `npm test / npm run e2e / revisión indicada`
- **Criterio de aceptación:** 201 y entidad persistida.
- **Evidencia exigida:** Test/documento

## LB6-005 — GET /expedientes
- **Área:** Backend
- **Estado:** PENDIENTE
- **Descripción:** Listar con paginación básica.
- **Archivos/recursos:** `src/api/routes/expedientes.ts`
- **Dependencias:** LB6-004
- **Prueba:** `npm test / npm run e2e / revisión indicada`
- **Criterio de aceptación:** Respuesta tipada.
- **Evidencia exigida:** Test/documento

## LB6-006 — GET /expedientes/:id
- **Área:** Backend
- **Estado:** PENDIENTE
- **Descripción:** Consultar expediente.
- **Archivos/recursos:** `src/api/routes/expedientes.ts`
- **Dependencias:** LB6-004
- **Prueba:** `npm test / npm run e2e / revisión indicada`
- **Criterio de aceptación:** 200/404 correctos.
- **Evidencia exigida:** Test/documento

## LB6-007 — PUT /expedientes/:id
- **Área:** Backend
- **Estado:** PENDIENTE
- **Descripción:** Actualizar con control de versión.
- **Archivos/recursos:** `src/api/routes/expedientes.ts`
- **Dependencias:** LB6-006
- **Prueba:** `npm test / npm run e2e / revisión indicada`
- **Criterio de aceptación:** Actualización auditada.
- **Evidencia exigida:** Test/documento

## LB6-008 — DELETE /expedientes/:id
- **Área:** Backend
- **Estado:** PENDIENTE
- **Descripción:** Borrado lógico o política aprobada.
- **Archivos/recursos:** `src/api/routes/expedientes.ts`
- **Dependencias:** LB6-006
- **Prueba:** `npm test / npm run e2e / revisión indicada`
- **Criterio de aceptación:** Política y auditoría correctas.
- **Evidencia exigida:** Test/documento

## LB6-009 — POST /expedientes/:id/analyze
- **Área:** Backend
- **Estado:** PENDIENTE
- **Descripción:** Ejecutar motores normativos del alcance.
- **Archivos/recursos:** `src/api/routes/analysis.ts`
- **Dependencias:** LB4-036, LB6-006
- **Prueba:** `npm test / npm run e2e / revisión indicada`
- **Criterio de aceptación:** Devuelve decisiones explicadas.
- **Evidencia exigida:** Test/documento

## LB6-010 — POST /expedientes/:id/validate
- **Área:** Backend
- **Estado:** PENDIENTE
- **Descripción:** Validar/modificar/rechazar propuestas.
- **Archivos/recursos:** `src/api/routes/decisions.ts`
- **Dependencias:** LB6-009
- **Prueba:** `npm test / npm run e2e / revisión indicada`
- **Criterio de aceptación:** Acción humana registrada.
- **Evidencia exigida:** Test/documento

## LB6-011 — GET decisions/explanations
- **Área:** Backend
- **Estado:** PENDIENTE
- **Descripción:** Consultar decisiones y motivaciones.
- **Archivos/recursos:** `src/api/routes/decisions.ts`
- **Dependencias:** LB6-010
- **Prueba:** `npm test / npm run e2e / revisión indicada`
- **Criterio de aceptación:** Respuesta con fuentes.
- **Evidencia exigida:** Test/documento

## LB6-012 — POST /generate
- **Área:** Backend
- **Estado:** PENDIENTE
- **Descripción:** Generar documentos validados.
- **Archivos/recursos:** `src/api/routes/documents.ts`
- **Dependencias:** LB5-032, LB6-010
- **Prueba:** `npm test / npm run e2e / revisión indicada`
- **Criterio de aceptación:** Devuelve documentos y estado.
- **Evidencia exigida:** Test/documento

## LB6-013 — POST /export
- **Área:** Backend
- **Estado:** PENDIENTE
- **Descripción:** Exportar formatos reales.
- **Archivos/recursos:** `src/api/routes/export.ts`
- **Dependencias:** LB5-032, LB6-012
- **Prueba:** `npm test / npm run e2e / revisión indicada`
- **Criterio de aceptación:** Descarga real.
- **Evidencia exigida:** Test/documento

## LB6-014 — GET /audit
- **Área:** Backend
- **Estado:** PENDIENTE
- **Descripción:** Consultar trazabilidad del expediente.
- **Archivos/recursos:** `src/api/routes/audit.ts`
- **Dependencias:** LB3-016, LB6-006
- **Prueba:** `npm test / npm run e2e / revisión indicada`
- **Criterio de aceptación:** Secuencia completa.
- **Evidencia exigida:** Test/documento

## LB6-015 — Definir modelo de usuario y roles
- **Área:** Seguridad
- **Estado:** PENDIENTE
- **Descripción:** Técnico, administrador y auditor; mínimo privilegio.
- **Archivos/recursos:** `src/domain/security/; docs/security/ROLES.md`
- **Dependencias:** LB6-002
- **Prueba:** `npm test / npm run e2e / revisión indicada`
- **Criterio de aceptación:** Permisos documentados.
- **Evidencia exigida:** Test/documento

## LB6-016 — Implementar autenticación piloto
- **Área:** Seguridad
- **Estado:** PENDIENTE
- **Descripción:** Mecanismo mínimo aprobado para el piloto.
- **Archivos/recursos:** `src/api/security/`
- **Dependencias:** LB6-015
- **Prueba:** `npm test / npm run e2e / revisión indicada`
- **Criterio de aceptación:** Rutas protegidas.
- **Evidencia exigida:** Test/documento

## LB6-017 — Implementar autorización
- **Área:** Seguridad
- **Estado:** PENDIENTE
- **Descripción:** Control por acción y expediente.
- **Archivos/recursos:** `src/api/security/authorization.ts`
- **Dependencias:** LB6-016
- **Prueba:** `npm test / npm run e2e / revisión indicada`
- **Criterio de aceptación:** Tests 401/403/200.
- **Evidencia exigida:** Test/documento

## LB6-018 — Integrar gestión de secretos
- **Área:** Seguridad
- **Estado:** PENDIENTE
- **Descripción:** Variables de entorno, validación y redacción en logs.
- **Archivos/recursos:** `src/infrastructure/config/SecretsManager.ts; .env.example`
- **Dependencias:** LB2-024, LB6-016
- **Prueba:** `npm test / npm run e2e / revisión indicada`
- **Criterio de aceptación:** No hay secretos en repo/logs.
- **Evidencia exigida:** Test/documento

## LB6-019 — Consolidar AIManager y providers
- **Área:** IA
- **Estado:** PENDIENTE
- **Descripción:** Adaptar ProviderRegistry, ProviderHealth y construcción por DI.
- **Archivos/recursos:** `src/infrastructure/ai/`
- **Dependencias:** LB2-038, LB6-018
- **Prueba:** `npm test / npm run e2e / revisión indicada`
- **Criterio de aceptación:** AIManager compila y puede usar provider mock.
- **Evidencia exigida:** Test/documento

## LB6-020 — Crear provider mock determinista
- **Área:** IA
- **Estado:** PENDIENTE
- **Descripción:** Permitir tests sin red ni coste.
- **Archivos/recursos:** `src/infrastructure/ai/providers/MockProvider.ts`
- **Dependencias:** LB6-019
- **Prueba:** `npm test / npm run e2e / revisión indicada`
- **Criterio de aceptación:** Respuestas reproducibles.
- **Evidencia exigida:** Test/documento

## LB6-021 — Definir prompts versionados
- **Área:** IA
- **Estado:** PENDIENTE
- **Descripción:** CPV, procedimiento, solvencia, cláusulas, redacción y revisión.
- **Archivos/recursos:** `prompts/; prompts/VERSION.json`
- **Dependencias:** LB4-036, LB6-019
- **Prueba:** `npm test / npm run e2e / revisión indicada`
- **Criterio de aceptación:** Prompts trazables.
- **Evidencia exigida:** Test/documento

## LB6-022 — Implementar grounding
- **Área:** IA
- **Estado:** PENDIENTE
- **Descripción:** Enviar únicamente contexto, reglas y fuentes necesarias.
- **Archivos/recursos:** `src/application/ai/GroundedAssistant.ts`
- **Dependencias:** LB6-021
- **Prueba:** `npm test / npm run e2e / revisión indicada`
- **Criterio de aceptación:** Respuesta enlaza evidencias.
- **Evidencia exigida:** Test/documento

## LB6-023 — Implementar revisión de respuesta
- **Área:** IA
- **Estado:** PENDIENTE
- **Descripción:** Detectar fuentes ausentes, afirmaciones no soportadas y formato inválido.
- **Archivos/recursos:** `src/application/ai/AIResponseValidator.ts`
- **Dependencias:** LB6-022
- **Prueba:** `npm test / npm run e2e / revisión indicada`
- **Criterio de aceptación:** Respuestas no fundamentadas se bloquean.
- **Evidencia exigida:** Test/documento

## LB6-024 — Implementar costes, timeout y fallback
- **Área:** IA
- **Estado:** PENDIENTE
- **Descripción:** Registrar consumo y degradar a modo determinista.
- **Archivos/recursos:** `src/infrastructure/ai/`
- **Dependencias:** LB6-019
- **Prueba:** `npm test / npm run e2e / revisión indicada`
- **Criterio de aceptación:** Fallos no bloquean el expediente.
- **Evidencia exigida:** Test/documento

## LB6-025 — Seleccionar stack y crear build
- **Área:** Frontend
- **Estado:** PENDIENTE
- **Descripción:** Consolidar el esqueleto React y dependencias.
- **Archivos/recursos:** `frontend/package.json; frontend/tsconfig.json`
- **Dependencias:** LB6-002
- **Prueba:** `npm test / npm run e2e / revisión indicada`
- **Criterio de aceptación:** Frontend arranca.
- **Evidencia exigida:** Test/documento

## LB6-026 — Crear shell y navegación principal
- **Área:** Frontend
- **Estado:** PENDIENTE
- **Descripción:** Menú Crear, Consultar, Revisar y Biblioteca.
- **Archivos/recursos:** `frontend/src/`
- **Dependencias:** LB6-025
- **Prueba:** `npm test / npm run e2e / revisión indicada`
- **Criterio de aceptación:** Navegación operativa.
- **Evidencia exigida:** Test/documento

## LB6-027 — Crear wizard: identificación y necesidad
- **Área:** Frontend
- **Estado:** PENDIENTE
- **Descripción:** Preguntas mínimas y guardado progresivo.
- **Archivos/recursos:** `frontend/src/features/wizard/`
- **Dependencias:** LB6-004, LB6-026
- **Prueba:** `npm test / npm run e2e / revisión indicada`
- **Criterio de aceptación:** Crea expediente parcial.
- **Evidencia exigida:** Test/documento

## LB6-028 — Crear wizard: objeto, presupuesto y medios
- **Área:** Frontend
- **Estado:** PENDIENTE
- **Descripción:** Continuación del formulario guiado.
- **Archivos/recursos:** `frontend/src/features/wizard/`
- **Dependencias:** LB6-027
- **Prueba:** `npm test / npm run e2e / revisión indicada`
- **Criterio de aceptación:** Datos persistidos.
- **Evidencia exigida:** Test/documento

## LB6-029 — Crear pantalla de propuestas
- **Área:** Frontend
- **Estado:** PENDIENTE
- **Descripción:** Mostrar decisión, justificación, fuente, confianza y riesgos.
- **Archivos/recursos:** `frontend/src/features/decisions/`
- **Dependencias:** LB6-009, LB6-028
- **Prueba:** `npm test / npm run e2e / revisión indicada`
- **Criterio de aceptación:** Propuestas legibles.
- **Evidencia exigida:** Test/documento

## LB6-030 — Crear validación humana
- **Área:** Frontend
- **Estado:** PENDIENTE
- **Descripción:** Botones Validar, Modificar y Rechazar con comentario.
- **Archivos/recursos:** `frontend/src/features/decisions/`
- **Dependencias:** LB6-010, LB6-029
- **Prueba:** `npm test / npm run e2e / revisión indicada`
- **Criterio de aceptación:** Decisión registrada.
- **Evidencia exigida:** Test/documento

## LB6-031 — Crear gestor de expedientes
- **Área:** Frontend
- **Estado:** PENDIENTE
- **Descripción:** Listado, búsqueda y apertura.
- **Archivos/recursos:** `frontend/src/features/expedientes/`
- **Dependencias:** LB6-005, LB6-026
- **Prueba:** `npm test / npm run e2e / revisión indicada`
- **Criterio de aceptación:** Consulta operativa.
- **Evidencia exigida:** Test/documento

## LB6-032 — Crear visor documental
- **Área:** Frontend
- **Estado:** PENDIENTE
- **Descripción:** Previsualizar estructura y validaciones.
- **Archivos/recursos:** `frontend/src/features/documents/`
- **Dependencias:** LB6-012, LB6-030
- **Prueba:** `npm test / npm run e2e / revisión indicada`
- **Criterio de aceptación:** Vista de documentos.
- **Evidencia exigida:** Test/documento

## LB6-033 — Crear descargas y paquete
- **Área:** Frontend
- **Estado:** PENDIENTE
- **Descripción:** Descargar DOCX, PDF y ZIP.
- **Archivos/recursos:** `frontend/src/features/export/`
- **Dependencias:** LB6-013, LB6-032
- **Prueba:** `npm test / npm run e2e / revisión indicada`
- **Criterio de aceptación:** Descargas válidas.
- **Evidencia exigida:** Test/documento

## LB6-034 — Crear visor de auditoría
- **Área:** Frontend
- **Estado:** PENDIENTE
- **Descripción:** Mostrar timeline por expediente.
- **Archivos/recursos:** `frontend/src/features/audit/`
- **Dependencias:** LB6-014, LB6-031
- **Prueba:** `npm test / npm run e2e / revisión indicada`
- **Criterio de aceptación:** Trazabilidad visible.
- **Evidencia exigida:** Test/documento

## LB6-035 — Aplicar accesibilidad y lenguaje claro
- **Área:** Accesibilidad
- **Estado:** PENDIENTE
- **Descripción:** Teclado, etiquetas, contraste y mensajes comprensibles.
- **Archivos/recursos:** `frontend/src/; tests/accessibility/`
- **Dependencias:** LB6-026 a LB6-034
- **Prueba:** `npm test / npm run e2e / revisión indicada`
- **Criterio de aceptación:** Chequeo axe sin incidencias críticas.
- **Evidencia exigida:** Test/documento

## LB6-036 — Configurar proxy y cliente API tipado
- **Área:** Integración
- **Estado:** PENDIENTE
- **Descripción:** Cliente central y manejo uniforme de errores.
- **Archivos/recursos:** `frontend/src/api/`
- **Dependencias:** LB6-025, LB6-002
- **Prueba:** `npm test / npm run e2e / revisión indicada`
- **Criterio de aceptación:** Frontend consume API.
- **Evidencia exigida:** Test/documento

## LB6-037 — Crear prueba navegador del recorrido MVP
- **Área:** E2E
- **Estado:** PENDIENTE
- **Descripción:** Crear, analizar, validar, generar, exportar y consultar.
- **Archivos/recursos:** `tests/e2e/mvp.spec.ts`
- **Dependencias:** LB6-004 a LB6-036
- **Prueba:** `npm test / npm run e2e / revisión indicada`
- **Criterio de aceptación:** E2E verde.
- **Evidencia exigida:** Test/documento

## LB6-038 — Crear configuración local reproducible
- **Área:** Despliegue
- **Estado:** PENDIENTE
- **Descripción:** Scripts para iniciar backend y frontend sin instalaciones globales.
- **Archivos/recursos:** `package.json; frontend/package.json; README.md`
- **Dependencias:** LB6-037
- **Prueba:** `npm test / npm run e2e / revisión indicada`
- **Criterio de aceptación:** Un comando documentado arranca ambos.
- **Evidencia exigida:** Test/documento

## LB6-039 — Crear guía de uso del piloto
- **Área:** Manual
- **Estado:** PENDIENTE
- **Descripción:** Explicar recorrido, límites y validación humana.
- **Archivos/recursos:** `docs/user/PILOT_GUIDE.md`
- **Dependencias:** LB6-037
- **Prueba:** `npm test / npm run e2e / revisión indicada`
- **Criterio de aceptación:** Usuario de prueba puede seguirla.
- **Evidencia exigida:** Test/documento

## LB6-040 — Cerrar LB-6
- **Área:** Puerta
- **Estado:** PENDIENTE
- **Descripción:** Ejecutar el recorrido completo desde navegador con provider mock y exportaciones reales.
- **Archivos/recursos:** `Aplicación integrada`
- **Dependencias:** LB6-001 a LB6-039
- **Prueba:** `npm run test && npm run e2e`
- **Criterio de aceptación:** Usuario crea, valida, genera, descarga y consulta el expediente.
- **Evidencia exigida:** Acta de cierre LB-6

## PUERTA DE LB-6
**recorrido accesible desde navegador**

# LB-7 — Calidad, seguridad, piloto y uso real

## LB7-001 — Definir estrategia de pruebas
- **Área:** QA
- **Estado:** PENDIENTE
- **Descripción:** Pirámide unitarias, integración, normativa, documentos y E2E.
- **Archivos/recursos:** `docs/qa/TEST_STRATEGY.md`
- **Dependencias:** LB6-040
- **Prueba:** `Prueba/revisión indicada`
- **Criterio de aceptación:** Cobertura y responsables definidos.
- **Evidencia exigida:** Test/documento/acta

## LB7-002 — Establecer umbrales de cobertura
- **Área:** QA
- **Estado:** PENDIENTE
- **Descripción:** Definir mínimos por módulos críticos.
- **Archivos/recursos:** `vitest.config.ts; docs/qa/`
- **Dependencias:** LB7-001
- **Prueba:** `Prueba/revisión indicada`
- **Criterio de aceptación:** CI falla bajo umbral.
- **Evidencia exigida:** Test/documento/acta

## LB7-003 — Completar unit tests de repositorios
- **Área:** QA
- **Estado:** PENDIENTE
- **Descripción:** CRUD, errores, concurrencia básica y backups.
- **Archivos/recursos:** `tests/unit/repositories/`
- **Dependencias:** LB7-001
- **Prueba:** `Prueba/revisión indicada`
- **Criterio de aceptación:** Suite verde.
- **Evidencia exigida:** Test/documento/acta

## LB7-004 — Completar unit tests de RuleEngine
- **Área:** QA
- **Estado:** PENDIENTE
- **Descripción:** Prioridad, conflictos, vigencia y evidencia.
- **Archivos/recursos:** `tests/unit/rules/`
- **Dependencias:** LB4-036, LB7-001
- **Prueba:** `Prueba/revisión indicada`
- **Criterio de aceptación:** Suite verde.
- **Evidencia exigida:** Test/documento/acta

## LB7-005 — Completar unit tests de CPV
- **Área:** QA
- **Estado:** PENDIENTE
- **Descripción:** Matching, jerarquía, sinónimos y confianza.
- **Archivos/recursos:** `tests/unit/cpv/`
- **Dependencias:** LB4-036, LB7-001
- **Prueba:** `Prueba/revisión indicada`
- **Criterio de aceptación:** Suite verde.
- **Evidencia exigida:** Test/documento/acta

## LB7-006 — Completar unit tests de procedimiento y solvencia
- **Área:** QA
- **Estado:** PENDIENTE
- **Descripción:** Casos y límites.
- **Archivos/recursos:** `tests/unit/legal/`
- **Dependencias:** LB4-036, LB7-001
- **Prueba:** `Prueba/revisión indicada`
- **Criterio de aceptación:** Suite verde.
- **Evidencia exigida:** Test/documento/acta

## LB7-007 — Completar tests de documentos
- **Área:** QA
- **Estado:** PENDIENTE
- **Descripción:** Estructura, obligatorios, DOCX/PDF/ZIP.
- **Archivos/recursos:** `tests/documents/`
- **Dependencias:** LB5-032, LB7-001
- **Prueba:** `Prueba/revisión indicada`
- **Criterio de aceptación:** Suite verde.
- **Evidencia exigida:** Test/documento/acta

## LB7-008 — Completar tests API
- **Área:** QA
- **Estado:** PENDIENTE
- **Descripción:** DTOs, estados HTTP, errores y autorización.
- **Archivos/recursos:** `tests/api/`
- **Dependencias:** LB6-040, LB7-001
- **Prueba:** `Prueba/revisión indicada`
- **Criterio de aceptación:** Suite verde.
- **Evidencia exigida:** Test/documento/acta

## LB7-009 — Completar E2E
- **Área:** QA
- **Estado:** PENDIENTE
- **Descripción:** Casos feliz, error y recuperación.
- **Archivos/recursos:** `tests/e2e/`
- **Dependencias:** LB6-040, LB7-001
- **Prueba:** `Prueba/revisión indicada`
- **Criterio de aceptación:** Suite verde.
- **Evidencia exigida:** Test/documento/acta

## LB7-010 — Ejecutar regresión normativa completa
- **Área:** Normativa
- **Estado:** PENDIENTE
- **Descripción:** Repetir fixtures tras cualquier cambio.
- **Archivos/recursos:** `tests/normative/`
- **Dependencias:** LB4-036
- **Prueba:** `Prueba/revisión indicada`
- **Criterio de aceptación:** 0 regresiones no aprobadas.
- **Evidencia exigida:** Test/documento/acta

## LB7-011 — Realizar threat model
- **Área:** Seguridad
- **Estado:** PENDIENTE
- **Descripción:** Activos, actores, superficies y mitigaciones.
- **Archivos/recursos:** `docs/security/THREAT_MODEL.md`
- **Dependencias:** LB6-040
- **Prueba:** `Prueba/revisión indicada`
- **Criterio de aceptación:** Riesgos clasificados.
- **Evidencia exigida:** Test/documento/acta

## LB7-012 — Auditar dependencias
- **Área:** Seguridad
- **Estado:** PENDIENTE
- **Descripción:** Vulnerabilidades y licencias.
- **Archivos/recursos:** `package.json; package-lock.json`
- **Dependencias:** LB7-011
- **Prueba:** `Prueba/revisión indicada`
- **Criterio de aceptación:** 0 vulnerabilidades críticas sin plan.
- **Evidencia exigida:** Test/documento/acta

## LB7-013 — Validar autenticación y autorización
- **Área:** Seguridad
- **Estado:** PENDIENTE
- **Descripción:** Sesiones, expiración, escalada y acceso horizontal.
- **Archivos/recursos:** `tests/security/auth.spec.ts`
- **Dependencias:** LB7-011
- **Prueba:** `Prueba/revisión indicada`
- **Criterio de aceptación:** Tests verdes.
- **Evidencia exigida:** Test/documento/acta

## LB7-014 — Validar inputs y ficheros
- **Área:** Seguridad
- **Estado:** PENDIENTE
- **Descripción:** Path traversal, nombres, tamaño, tipos y contenido.
- **Archivos/recursos:** `tests/security/files.spec.ts`
- **Dependencias:** LB7-011
- **Prueba:** `Prueba/revisión indicada`
- **Criterio de aceptación:** Ataques de fixture bloqueados.
- **Evidencia exigida:** Test/documento/acta

## LB7-015 — Validar secretos y logs
- **Área:** Seguridad
- **Estado:** PENDIENTE
- **Descripción:** No exponer claves, tokens ni datos sensibles.
- **Archivos/recursos:** `tests/security/secrets.spec.ts`
- **Dependencias:** LB6-018, LB7-011
- **Prueba:** `Prueba/revisión indicada`
- **Criterio de aceptación:** 0 fugas.
- **Evidencia exigida:** Test/documento/acta

## LB7-016 — Crear inventario de datos personales
- **Área:** Privacidad
- **Estado:** PENDIENTE
- **Descripción:** Datos, finalidad, ubicación y responsables.
- **Archivos/recursos:** `docs/privacy/DATA_INVENTORY.md`
- **Dependencias:** LB6-040
- **Prueba:** `Prueba/revisión indicada`
- **Criterio de aceptación:** Inventario completo.
- **Evidencia exigida:** Test/documento/acta

## LB7-017 — Definir conservación y eliminación
- **Área:** Privacidad
- **Estado:** PENDIENTE
- **Descripción:** Plazos, borrado y anonimización.
- **Archivos/recursos:** `docs/privacy/RETENTION_POLICY.md`
- **Dependencias:** LB7-016
- **Prueba:** `Prueba/revisión indicada`
- **Criterio de aceptación:** Política aprobada.
- **Evidencia exigida:** Test/documento/acta

## LB7-018 — Definir control de acceso y trazabilidad
- **Área:** Privacidad
- **Estado:** PENDIENTE
- **Descripción:** Acceso a expedientes y logs.
- **Archivos/recursos:** `docs/privacy/ACCESS_POLICY.md`
- **Dependencias:** LB7-016
- **Prueba:** `Prueba/revisión indicada`
- **Criterio de aceptación:** Política aprobada.
- **Evidencia exigida:** Test/documento/acta

## LB7-019 — Implementar backup
- **Área:** Operación
- **Estado:** PENDIENTE
- **Descripción:** Datos, conocimiento, configuración y auditoría.
- **Archivos/recursos:** `scripts/backup.mjs`
- **Dependencias:** LB6-040
- **Prueba:** `Prueba/revisión indicada`
- **Criterio de aceptación:** Backup verificable.
- **Evidencia exigida:** Test/documento/acta

## LB7-020 — Implementar restore
- **Área:** Operación
- **Estado:** PENDIENTE
- **Descripción:** Restauración a entorno limpio.
- **Archivos/recursos:** `scripts/restore.mjs`
- **Dependencias:** LB7-019
- **Prueba:** `Prueba/revisión indicada`
- **Criterio de aceptación:** Restore reproduce estado.
- **Evidencia exigida:** Test/documento/acta

## LB7-021 — Probar integridad post-restore
- **Área:** Operación
- **Estado:** PENDIENTE
- **Descripción:** Checksums y pruebas funcionales.
- **Archivos/recursos:** `tests/operations/restore.spec.ts`
- **Dependencias:** LB7-020
- **Prueba:** `Prueba/revisión indicada`
- **Criterio de aceptación:** Integridad demostrada.
- **Evidencia exigida:** Test/documento/acta

## LB7-022 — Configurar logs y rotación
- **Área:** Operación
- **Estado:** PENDIENTE
- **Descripción:** Niveles, tamaño, conservación y redacción.
- **Archivos/recursos:** `src/infrastructure/logging/; docs/operations/LOGGING.md`
- **Dependencias:** LB6-040
- **Prueba:** `Prueba/revisión indicada`
- **Criterio de aceptación:** Logs operativos y controlados.
- **Evidencia exigida:** Test/documento/acta

## LB7-023 — Configurar health y diagnóstico
- **Área:** Operación
- **Estado:** PENDIENTE
- **Descripción:** Backend, almacenamiento, conocimiento e IA.
- **Archivos/recursos:** `src/api/routes/health.ts`
- **Dependencias:** LB6-040
- **Prueba:** `Prueba/revisión indicada`
- **Criterio de aceptación:** Estado observable.
- **Evidencia exigida:** Test/documento/acta

## LB7-024 — Definir objetivos de rendimiento
- **Área:** Rendimiento
- **Estado:** PENDIENTE
- **Descripción:** Latencias máximas para operaciones clave.
- **Archivos/recursos:** `docs/qa/PERFORMANCE_TARGETS.md`
- **Dependencias:** LB6-040
- **Prueba:** `Prueba/revisión indicada`
- **Criterio de aceptación:** Objetivos aprobados.
- **Evidencia exigida:** Test/documento/acta

## LB7-025 — Ejecutar pruebas de carga piloto
- **Área:** Rendimiento
- **Estado:** PENDIENTE
- **Descripción:** Usuarios concurrentes y expedientes de muestra.
- **Archivos/recursos:** `tests/performance/`
- **Dependencias:** LB7-024
- **Prueba:** `Prueba/revisión indicada`
- **Criterio de aceptación:** Cumple objetivos piloto.
- **Evidencia exigida:** Test/documento/acta

## LB7-026 — Probar fallos de IA
- **Área:** Resiliencia
- **Estado:** PENDIENTE
- **Descripción:** Timeout, provider caído y respuesta inválida.
- **Archivos/recursos:** `tests/resilience/ai.spec.ts`
- **Dependencias:** LB6-024
- **Prueba:** `Prueba/revisión indicada`
- **Criterio de aceptación:** Fallback operativo.
- **Evidencia exigida:** Test/documento/acta

## LB7-027 — Probar fallos de almacenamiento
- **Área:** Resiliencia
- **Estado:** PENDIENTE
- **Descripción:** Disco no disponible, JSON corrupto y recuperación.
- **Archivos/recursos:** `tests/resilience/storage.spec.ts`
- **Dependencias:** LB7-019
- **Prueba:** `Prueba/revisión indicada`
- **Criterio de aceptación:** Errores controlados.
- **Evidencia exigida:** Test/documento/acta

## LB7-028 — Crear manual técnico
- **Área:** Documentación
- **Estado:** PENDIENTE
- **Descripción:** Arquitectura, instalación, build, pruebas y mantenimiento.
- **Archivos/recursos:** `docs/technical/MANUAL_TECNICO.md`
- **Dependencias:** LB7-001 a LB7-027
- **Prueba:** `Prueba/revisión indicada`
- **Criterio de aceptación:** Otro técnico puede desplegar.
- **Evidencia exigida:** Test/documento/acta

## LB7-029 — Crear manual de usuario
- **Área:** Documentación
- **Estado:** PENDIENTE
- **Descripción:** Crear, consultar, validar, generar y exportar.
- **Archivos/recursos:** `docs/user/MANUAL_USUARIO.md`
- **Dependencias:** LB6-039
- **Prueba:** `Prueba/revisión indicada`
- **Criterio de aceptación:** Usuario puede operar sin asistencia técnica.
- **Evidencia exigida:** Test/documento/acta

## LB7-030 — Crear manual de administración
- **Área:** Documentación
- **Estado:** PENDIENTE
- **Descripción:** Usuarios, roles, backups, logs y actualización normativa.
- **Archivos/recursos:** `docs/admin/MANUAL_ADMIN.md`
- **Dependencias:** LB7-017 a LB7-023
- **Prueba:** `Prueba/revisión indicada`
- **Criterio de aceptación:** Administrador puede mantener el piloto.
- **Evidencia exigida:** Test/documento/acta

## LB7-031 — Crear CHANGELOG de V1
- **Área:** Release
- **Estado:** PENDIENTE
- **Descripción:** Cambios, límites y problemas conocidos.
- **Archivos/recursos:** `CHANGELOG.md`
- **Dependencias:** LB7-028 a LB7-030
- **Prueba:** `Prueba/revisión indicada`
- **Criterio de aceptación:** Changelog completo.
- **Evidencia exigida:** Test/documento/acta

## LB7-032 — Versionar 1.0.0-rc.1
- **Área:** Release
- **Estado:** PENDIENTE
- **Descripción:** Etiquetar candidata reproducible.
- **Archivos/recursos:** `package.json; git tag`
- **Dependencias:** LB7-031
- **Prueba:** `Prueba/revisión indicada`
- **Criterio de aceptación:** Build asociado al tag.
- **Evidencia exigida:** Test/documento/acta

## LB7-033 — Crear paquete desplegable
- **Área:** Release
- **Estado:** PENDIENTE
- **Descripción:** Backend, frontend, knowledge y documentación.
- **Archivos/recursos:** `dist/; release/`
- **Dependencias:** LB7-032
- **Prueba:** `Prueba/revisión indicada`
- **Criterio de aceptación:** Paquete instala en entorno limpio.
- **Evidencia exigida:** Test/documento/acta

## LB7-034 — Definir plan de piloto
- **Área:** Aceptación
- **Estado:** PENDIENTE
- **Descripción:** Usuarios, casos, duración, soporte y métricas.
- **Archivos/recursos:** `docs/pilot/PILOT_PLAN.md`
- **Dependencias:** LB7-033
- **Prueba:** `Prueba/revisión indicada`
- **Criterio de aceptación:** Plan aprobado.
- **Evidencia exigida:** Test/documento/acta

## LB7-035 — Preparar datos de demostración
- **Área:** Aceptación
- **Estado:** PENDIENTE
- **Descripción:** Expedientes ficticios sin datos sensibles.
- **Archivos/recursos:** `demo-data/`
- **Dependencias:** LB7-034
- **Prueba:** `Prueba/revisión indicada`
- **Criterio de aceptación:** Datos validados.
- **Evidencia exigida:** Test/documento/acta

## LB7-036 — Formar usuarios piloto
- **Área:** Aceptación
- **Estado:** PENDIENTE
- **Descripción:** Sesión y material formativo.
- **Archivos/recursos:** `docs/pilot/TRAINING.md`
- **Dependencias:** LB7-029, LB7-034
- **Prueba:** `Prueba/revisión indicada`
- **Criterio de aceptación:** Usuarios completan ejercicio.
- **Evidencia exigida:** Test/documento/acta

## LB7-037 — Ejecutar piloto controlado
- **Área:** Piloto
- **Estado:** PENDIENTE
- **Descripción:** Usuarios reales de prueba completan el flujo.
- **Archivos/recursos:** `Entorno piloto`
- **Dependencias:** LB7-035, LB7-036
- **Prueba:** `Prueba/revisión indicada`
- **Criterio de aceptación:** Casos completados y métricas registradas.
- **Evidencia exigida:** Test/documento/acta

## LB7-038 — Registrar incidencias y feedback
- **Área:** Piloto
- **Estado:** PENDIENTE
- **Descripción:** Clasificar bloqueantes, importantes y mejoras.
- **Archivos/recursos:** `docs/pilot/ISSUES.csv; docs/pilot/FEEDBACK.csv`
- **Dependencias:** LB7-037
- **Prueba:** `Prueba/revisión indicada`
- **Criterio de aceptación:** Feedback completo.
- **Evidencia exigida:** Test/documento/acta

## LB7-039 — Resolver bloqueantes
- **Área:** Piloto
- **Estado:** PENDIENTE
- **Descripción:** Corregir defectos necesarios para aceptación.
- **Archivos/recursos:** `Código afectado`
- **Dependencias:** LB7-038
- **Prueba:** `Prueba/revisión indicada`
- **Criterio de aceptación:** 0 bloqueantes abiertos.
- **Evidencia exigida:** Test/documento/acta

## LB7-040 — Ejecutar UAT final
- **Área:** Aceptación
- **Estado:** PENDIENTE
- **Descripción:** Pruebas de aceptación del usuario.
- **Archivos/recursos:** `docs/pilot/UAT_REPORT.md`
- **Dependencias:** LB7-039
- **Prueba:** `Prueba/revisión indicada`
- **Criterio de aceptación:** UAT aprobada.
- **Evidencia exigida:** Test/documento/acta

## LB7-041 — Publicar V1.0.0
- **Área:** Release
- **Estado:** PENDIENTE
- **Descripción:** Build reproducible, tag, manuales y notas.
- **Archivos/recursos:** `release/v1.0.0/`
- **Dependencias:** LB7-040
- **Prueba:** `Prueba/revisión indicada`
- **Criterio de aceptación:** Release firmada/aprobada.
- **Evidencia exigida:** Test/documento/acta

## LB7-042 — Desplegar en entorno de uso autorizado
- **Área:** Uso real
- **Estado:** PENDIENTE
- **Descripción:** Aplicar configuración, usuarios, backup y monitorización.
- **Archivos/recursos:** `Entorno objetivo`
- **Dependencias:** LB7-041
- **Prueba:** `Prueba/revisión indicada`
- **Criterio de aceptación:** Aplicación accesible y saludable.
- **Evidencia exigida:** Test/documento/acta

## LB7-043 — Ejecutar primer expediente acompañado
- **Área:** Uso real
- **Estado:** PENDIENTE
- **Descripción:** Realizar el recorrido con supervisión y sin asumir uso oficial no autorizado.
- **Archivos/recursos:** `Registro de operación`
- **Dependencias:** LB7-042
- **Prueba:** `Prueba/revisión indicada`
- **Criterio de aceptación:** Recorrido completo y auditado.
- **Evidencia exigida:** Test/documento/acta

## LB7-044 — Establecer soporte y mantenimiento
- **Área:** Uso real
- **Estado:** PENDIENTE
- **Descripción:** Canal de incidencias, SLA interno, responsables y calendario normativo.
- **Archivos/recursos:** `docs/operations/SUPPORT.md`
- **Dependencias:** LB7-043
- **Prueba:** `Prueba/revisión indicada`
- **Criterio de aceptación:** Soporte activo.
- **Evidencia exigida:** Test/documento/acta

## LB7-045 — Establecer revisión postimplantación
- **Área:** Uso real
- **Estado:** PENDIENTE
- **Descripción:** Evaluar utilidad, errores, adopción y siguiente versión.
- **Archivos/recursos:** `docs/operations/POST_IMPLEMENTATION_REVIEW.md`
- **Dependencias:** LB7-044
- **Prueba:** `Prueba/revisión indicada`
- **Criterio de aceptación:** Revisión fechada y acciones aprobadas.
- **Evidencia exigida:** Test/documento/acta

## LB7-046 — Cerrar LB-7 y declarar V1 operativa
- **Área:** Puerta
- **Estado:** PENDIENTE
- **Descripción:** Confirmar QA, seguridad, privacidad, piloto, UAT, release, despliegue y primer uso acompañado.
- **Archivos/recursos:** `Proyecto y entorno objetivo`
- **Dependencias:** LB7-001 a LB7-045
- **Prueba:** `Checklist de release y acta de aceptación`
- **Criterio de aceptación:** V1.0 reproducible, aceptada, desplegada y utilizada conforme al alcance autorizado.
- **Evidencia exigida:** Acta final

## PUERTA DE LB-7
**V1 desplegada, aceptada y utilizada**

# 4. Definición de fin
Contrata-IA V1 solo se considera operativa cuando LB7-046 está COMPLETADA. Esto exige compilación, arquitectura canónica, recorrido vertical, motor normativo MVP, documentos reales, API/UI, integración IA controlada, QA, seguridad, piloto, UAT, despliegue y primer uso acompañado.
