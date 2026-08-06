# AUDITORÍA MAESTRA Y LÍNEA BASE DE DESARROLLO — CONTRATA-IA

**Fecha de auditoría:** 6 de agosto de 2026  
**Fuente auditada:** `contrata-ia-main (20)(1).zip`  
**SHA-256 del ZIP:** `bfbc11511ea6745c5a977a4e578bf1fe9529167faeb9267af8332e945b4fd8e1`

## 1. Dictamen ejecutivo

El proyecto es **técnicamente viable**, contiene una base de código extensa y una arquitectura ambiciosa, pero el ZIP actual **no es todavía un producto ejecutable ni una versión 1.0 integrada**. La cifra histórica del 90 % medía fundamentalmente la creación nominal de archivos de una lista provisional; no medía compilación, integración, pruebas ni funcionamiento real.

La línea base oficial que se fija con esta auditoría es:

- **Cobertura de componentes redactados:** 68 %.
- **Consolidación técnica e integración verificable:** 31 %.
- **Avance funcional ponderado de la versión 1.0:** **42 %**.
- **Preparación para producción administrativa:** 0 % hasta superar compilación, pruebas, cobertura normativa y seguridad.

A partir de esta fecha, el progreso no se medirá por número de archivos copiados, sino por **hitos con criterios de aceptación verificables**.

## 2. Inventario objetivo

| Indicador | Resultado |
|---|---:|
| Archivos totales del ZIP | 535 |
| Archivos dentro de `src` | 488 |
| Archivos TypeScript en `src` | 485 |
| Archivos TypeScript auditados (`src` + `knowledge`) | 487 |
| Líneas TypeScript aproximadas | 177,946 |
| Archivos del lote histórico 1–80 presentes | 80/80 |
| Archivos con errores sintácticos | 25 |
| Líneas contenidas en archivos sintácticamente rotos | 81,168 (45.6 %) |
| Referencias relativas no resueltas | 232 |
| Archivos afectados por imports no resueltos | 60 |
| Nombres de archivo TypeScript repetidos | 30 |
| Nombres de símbolos superiores repetidos | 94 |
| Grupos de archivos exactamente idénticos | 0 |
| Ficheros de pruebas localizados | 0 |
| `package.json` | No existe |
| `tsconfig.json` de proyecto | No existe |
| Lockfile de dependencias | No existe |
| API HTTP | No localizada |
| Ficheros YAML de conocimiento | 31; 7 inválidos |
| Artículos LCSP estructurados | 2 |
| Entradas CPV del catálogo JSON | 15 |

## 3. Comprobación del lote 1–80

Los 80 archivos generados durante la conversación están físicamente presentes. Esto confirma que el trabajo de copia se realizó. Sin embargo, el lote **no supera una aceptación integrada**:

- `ServiceRegistry.ts`, `ApplicationKernel.ts` y `WorkflowOrchestrator.ts` importan un `CostEstimator` desde rutas inexistentes.
- `ApplicationConfiguration.ts` usa `Environment` como instancia, mientras que el `Environment.ts` existente expone sus operaciones como miembros estáticos.
- `ServiceRegistry.ts` importa `ConfigurationManager` desde `ConfigManager.ts`, aunque ese archivo exporta `ConfigManager`; además existe otro `ConfigurationManager.ts` singleton.
- `AIManager` requiere `ProviderRegistry` y `ProviderHealth`, pero `ServiceRegistry` intenta construirlo sin argumentos.
- `CostEstimator` requiere `TokenCounter`, pero `ServiceRegistry` intenta construirlo sin argumentos.
- `WorkflowOrchestrator` llama a `RuleEngine.execute`, `AIManager.complete`, `CostEstimator.estimate(expediente)` y `WorkflowEngine.run(expediente)`. Esas llamadas no coinciden con las APIs reales.
- `DocumentGenerationPipeline` entrega el expediente directamente a generadores que esperan un `GenerationContext`; la firma compila por la tolerancia de métodos, pero el comportamiento en ejecución es incorrecto.
- El módulo `application/export` presenta dos contratos diferentes llamados `DocumentExporter` y dos `ExportResult`. El compilador devuelve incompatibilidades, colisiones de exportación y ausencia de `filePath`.
- Los exportadores DOCX, PDF y ZIP son provisionales: crean ficheros de texto/JSON con extensiones `.docx`, `.pdf` y `.zip`; no generan esos formatos reales.

Conclusión: **80/80 presentes no equivale a 80/80 integrados**.

## 4. Compilación y calidad estructural

La ejecución de TypeScript sobre el árbol completo produjo **5.809 diagnósticos de sintaxis en 25 archivos**. Son pocos archivos en número, pero representan el **45,6 % de todas las líneas TypeScript**, porque incluyen motores centrales de gran tamaño.

Principales archivos sintácticamente rotos:

- `knowledge/inference/InferenceEngine.ts`
- `src/domain/cpv/CPVEngine.ts`
- `src/domain/conocimiento/KnowledgeEngine.ts`
- `src/domain/rules/RuleEngine.ts`
- `src/application/documents/DocumentGenerator.ts`
- `src/domain/legal/LegalReasoner.ts`
- `src/application/modules/contract-generator/ContractContext.ts`
- `src/application/modules/contract-generator/GenerationResult.ts`
- `src/infrastructure/ai/AIManager.ts`
- `knowledge/reasoning/LegalReasoner.ts`
- `src/domain/events/EventBus.ts`
- `src/bootstrap/ArchitectureBootstrap.ts`

En varios motores se observan bloques generados y concatenados fuera de la clase original, por ejemplo interfaces o métodos insertados después del cierre de una clase. Cinco archivos conservan marcadores explícitos `FIN BLOQUE`, señal de que fueron construidos por entregas parciales y no consolidados posteriormente.

## 5. Duplicidades y arquitectura paralela

No hay copias byte a byte idénticas, pero sí duplicidad semántica:

- 30 nombres de archivo repetidos.
- 94 nombres de símbolos superiores repetidos en 227 declaraciones.
- 5 `RuleEngine` físicos más una interfaz del mismo nombre.
- 5 `InferenceEngine`.
- 4 `KnowledgeRepository`.
- 3 familias de `DecisionEngine`.
- múltiples `CPVResolver`, `SolvencyResolver`, `GuaranteeResolver` y `LegalReasoner`.
- dos `EventBus`.
- generadores de Memoria, PCAP y PPT en rutas paralelas.
- `AppConfiguration.ts` y `ApplicationConfiguration.ts` con modelos incompatibles.
- `ConfigManager.ts` y `ConfigurationManager.ts` con responsabilidades solapadas.

Esta duplicidad no es meramente estética: impide saber qué implementación es canónica y provoca imports incompatibles.

## 6. Base normativa y datos

La base de conocimiento tiene contenido valioso y considerable, pero no puede considerarse completa ni validada:

- Los 7 JSON analizados son sintácticamente válidos.
- De 31 YAML, 7 no se pueden parsear.
- El catálogo CPV JSON contiene 15 entradas: sirve como muestra, no como catálogo CPV completo.
- Solo existen dos artículos LCSP estructurados (`art. 99` y `art. 100`).
- Hay reglas YAML extensas, pero siete de las más relevantes son inválidas, entre ellas `documentos`, `pliegos`, `criterios`, `evaluacion`, `ejecucion` y `extincion`.

Por ello, el sistema todavía no puede garantizar una decisión normativa completa o una generación de pliegos conforme a toda la LCSP.

## 7. Estado parcial por bloque y línea base ponderada

La valoración combina cuatro dimensiones: cobertura de diseño, compilación, integración en ejecución y pruebas/salidas reales. Los pesos se fijan para la versión 1.0 y no deben modificarse salvo aprobación expresa.

| Bloque V1 | Peso | Ejecución verificada | Aportación al total |
|---|---:|---:|---:|
| Infrastructure Core y persistencia | 12 % | 65 % | 7.80 % |
| Dominio y expediente | 8 % | 54 % | 4.32 % |
| Motores jurídicos, reglas, conocimiento y CPV | 22 % | 41 % | 9.02 % |
| Workflow e integración de aplicación | 10 % | 55 % | 5.50 % |
| Motor documental y generación | 15 % | 44 % | 6.60 % |
| Infraestructura IA | 10 % | 37 % | 3.70 % |
| Exportación | 8 % | 53 % | 4.24 % |
| API | 5 % | 0 % | 0.00 % |
| Frontend/UI | 4 % | 15 % | 0.60 % |
| Build, empaquetado y despliegue | 3 % | 0 % | 0.00 % |
| Pruebas y QA | 3 % | 0 % | 0.00 % |
| **TOTAL V1** | **100 %** |  | **41.78 %** |

### Justificación resumida de los parciales

- **Infrastructure Core y persistencia: 65 %.** Persistencia y monitorización compilan por separado; configuración y servicios necesitan consolidación.
- **Dominio y expediente: 54 %.** Amplio modelo de dominio, pero con ramas paralelas y una parte sin integración verificable.
- **Motores jurídicos, reglas, conocimiento y CPV: 41 %.** Gran volumen de código y reglas; motores centrales con errores sintácticos, imports rotos y datos normativos incompletos.
- **Workflow e integración de aplicación: 55 %.** El núcleo Workflow compila parcialmente; bootstrap y orquestadores invocan APIs que no existen o tienen firmas distintas.
- **Motor documental y generación: 44 %.** Hay varias generaciones y modelos; el generador central no compila y la cadena nueva no produce documentos editables reales.
- **Infraestructura IA: 37 %.** Proveedores y servicios abundantes; AIManager central no compila y los orquestadores no coinciden con su API.
- **Exportación: 53 %.** Los 28 componentes existen, pero el bloque no compila y DOCX/PDF/ZIP son provisionales.
- **API: 0 %.** No existe capa HTTP/API verificable.
- **Frontend/UI: 15 %.** Existe un esqueleto React de 6 archivos, sin dependencias ni configuración de construcción.
- **Build, empaquetado y despliegue: 0 %.** No hay package.json, tsconfig de proyecto, lockfile ni scripts de ejecución.
- **Pruebas y QA: 0 %.** No se localizaron pruebas automatizadas.

## 8. Viabilidad actual

### Viabilidad conceptual y arquitectónica: alta

El proyecto aborda un problema real, tiene un dominio bien identificado y ya dispone de una cantidad significativa de modelos, reglas, repositorios, generadores y servicios. La arquitectura por capas es recuperable.

### Viabilidad como prototipo local: media

Es viable tras consolidar compilación, elegir implementaciones canónicas, corregir imports y crear un arranque mínimo. La persistencia JSON puede servir para un prototipo monousuario.

### Viabilidad como aplicación funcional hoy: baja

El ZIP no incluye sistema de construcción, no compila globalmente, no tiene API, no contiene pruebas y no genera DOCX/PDF/ZIP reales. No existe un recorrido ejecutable y verificado desde “Crear expediente” hasta un documento editable final.

### Viabilidad para uso administrativo real: no disponible todavía

No debe utilizarse para producir expedientes oficiales hasta completar y validar la base normativa, pruebas jurídicas, trazabilidad, seguridad, protección de datos, control de versiones normativas y revisión humana obligatoria.

## 9. Riesgos prioritarios

1. **Arquitectura paralela:** seleccionar una sola implementación por concepto antes de seguir añadiendo archivos.
2. **Motores centrales sintácticamente rotos:** su tamaño hace que el volumen aparente de código no equivalga a funcionalidad.
3. **Imports inexistentes:** 245 referencias relativas no resueltas.
4. **Ausencia de proyecto ejecutable:** sin dependencias, scripts, compilador configurado ni entrada principal.
5. **Conocimiento incompleto o inválido:** riesgo jurídico alto.
6. **Exportaciones ficticias:** extensiones válidas con contenido que no corresponde al formato.
7. **Sin pruebas:** no hay protección contra regresiones.
8. **Sin API ni seguridad:** no existe aún aplicación multiusuario o integrable.

## 10. Línea base única de desarrollo V1.0

A partir de esta auditoría queda prohibido utilizar contadores abiertos del tipo `81/240` como indicador de avance. La línea base se organiza por hitos cerrados y puertas de aceptación.

### LB-0 — Congelación y trazabilidad

- Conservar el ZIP auditado con su SHA-256.
- Crear `AUDIT_BASELINE.md`, inventario CSV y registro de decisiones arquitectónicas.
- No añadir nuevas funcionalidades hasta cerrar LB-1.

**Puerta:** snapshot identificable y hoja de ruta aprobada.

### LB-1 — Proyecto compilable

- Crear `package.json`, `tsconfig.json`, scripts `build`, `typecheck`, `test` y entrada mínima.
- Reparar los 25 archivos con errores sintácticos o excluir formalmente las ramas obsoletas.
- Resolver las 245 referencias relativas inexistentes.
- Corregir los 7 YAML inválidos.

**Puerta:** `npm run typecheck` y `npm run build` terminan sin errores.

### LB-2 — Arquitectura canónica

- Elegir una única familia para configuración, eventos, reglas, inferencia, conocimiento, CPV, solvencia y generación documental.
- Mover alternativas a `archive/` o eliminarlas tras comparación.
- Crear un `Architecture Decision Record` por decisión.

**Puerta:** ninguna duplicidad funcional activa y un único grafo de dependencias.

### LB-3 — Recorrido vertical mínimo

- Crear expediente.
- Guardarlo y recuperarlo.
- Ejecutar una regla real.
- Proponer CPV desde catálogo validado.
- Ejecutar workflow mínimo.
- Generar una memoria en modelo intermedio.
- Exportar JSON y HTML reales.

**Puerta:** prueba de integración reproducible de extremo a extremo.

### LB-4 — Motor normativo mínimo viable

- Completar el conjunto normativo necesario para un primer caso de uso delimitado.
- Validar reglas, fuentes, vigencia y motivación.
- Incorporar catálogo CPV completo o una fuente controlada.
- Añadir pruebas jurídicas de casos positivos, negativos y límites.

**Puerta:** batería jurídica aprobada para el caso de uso inicial.

### LB-5 — Documentos administrativos reales

- Unificar modelo documental.
- Generar Memoria, informe de necesidad, insuficiencia de medios, PCAP y PPT.
- Implementar DOCX editable real con plantilla corporativa.
- Generar PDF a partir de una fuente documental válida, no de JSON renombrado.

**Puerta:** documentos editables comparables con los modelos aportados y revisión técnica satisfactoria.

### LB-6 — API y aplicación

- API REST tipada.
- Autenticación y autorización mínimas.
- Gestión de expedientes y auditoría.
- Integración real con IA y secretos.
- Interfaz guiada “Crear nuevo expediente”.

**Puerta:** recorrido vertical accesible desde navegador.

### LB-7 — Calidad y versión 1.0

- Pruebas unitarias, integración, E2E y regresión normativa.
- Seguridad, privacidad, logs, backup y recuperación.
- Manual técnico y manual de usuario.
- Paquete desplegable y versionado.

**Puerta:** release candidate reproducible y aceptada.

## 11. Regla de medición a partir de ahora

Cada bloque conservará el peso fijado en la tabla. Su porcentaje solo aumentará cuando se cumplan criterios verificables:

- 25 %: diseño y archivos canónicos presentes.
- 50 %: compila de forma aislada.
- 75 %: integrado en el recorrido vertical y con pruebas.
- 100 %: salida real, documentación y criterios de aceptación superados.

No se contará como progreso la mera creación de archivos, interfaces o implementaciones temporales.

## 12. Conclusión

Contrata-IA **no debe reiniciarse desde cero**. Existe trabajo valioso y recuperable. La acción correcta es consolidar y convertir la masa de código actual en un único producto compilable. La línea base oficial de la versión 1.0 queda fijada en **42 % de ejecución funcional ponderada**. El primer trabajo posterior a esta auditoría debe ser LB-1, no un nuevo módulo.
