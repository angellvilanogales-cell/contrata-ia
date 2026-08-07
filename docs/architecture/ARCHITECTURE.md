# CONTRATA-IA — Arquitectura canónica

## Estado

Arquitectura canónica de LB-2. La fuente ejecutable de verdad es `src/architecture/canonical-manifest.json` y la frontera pública es `src/architecture/index.ts`.

## Regla principal

Cada responsabilidad tiene un único proveedor canónico. Las implementaciones históricas que compitan con ese proveedor se consideran legado: pueden conservarse temporalmente para recuperación o comparación, pero no forman parte del runtime activo ni deben ser importadas por código nuevo.

## Capas

```text
UI / API (LB-6)
      |
      v
Application / workflows
      |
      v
src/architecture  <-- frontera canónica
      |
      +-- configuración
      +-- eventos
      +-- reglas
      +-- inferencia
      +-- conocimiento
      +-- razonamiento jurídico
      +-- CPV
      +-- procedimiento
      +-- documentos
      +-- exportación
      +-- IA
      |
      v
Domain / Infrastructure providers
```

## Proveedores seleccionados

| Responsabilidad | Contrato canónico | Proveedor seleccionado |
|---|---|---|
| Configuración | `ApplicationConfiguration` | `src/architecture/runtime/EnvironmentConfiguration.ts` |
| Eventos | `EventBusPort` | `src/domain/events/EventBus.ts` |
| Reglas | `RuleEnginePort` | `src/domain/rules/RuleEngine.ts` |
| Inferencia | `InferenceEnginePort` | `src/domain/conocimiento/InferenceEngine.ts` |
| Conocimiento | `KnowledgeEnginePort` | `src/domain/conocimiento/KnowledgeEngine.ts` |
| Razonamiento jurídico | `LegalReasonerPort` | `src/domain/legal/LegalReasoner.ts` |
| CPV | `CPVEnginePort` | `src/domain/cpv/CPVEngine.ts` |
| Procedimiento | `ProcedureResolverPort` | `src/domain/resolvers/ProcedureResolver.ts` |
| Documentos | `DocumentGeneratorPort` | `src/application/documents/DocumentGenerator.ts` |
| Exportación | `DocumentExporterPort` | `src/application/export/ExportManager.ts` |
| IA | `AIServicePort` | `src/infrastructure/ai/AIManager.ts` |

## Contratos

Los contratos públicos entre capas viven en `src/architecture/contracts.ts`. El código nuevo debe depender de esos contratos o de la fachada `src/architecture/index.ts`, no de una implementación histórica concreta.

Esta separación permite adaptar gradualmente los motores existentes sin volver a acoplar el runtime a APIs paralelas.

## Estado de implementaciones históricas

El manifiesto contiene `legacyPaths` para las alternativas conocidas. La condición de legado no implica eliminación inmediata. Significa:

1. no forma parte de la selección activa;
2. no debe recibir funcionalidad nueva;
3. solo puede reutilizarse mediante una decisión arquitectónica explícita;
4. cuando no tenga consumidores ni valor de recuperación, podrá archivarse o eliminarse en una tarea de limpieza.

## Dependencias permitidas

`src/main.ts` entra por `src/architecture`. No puede importar directamente `domain`, `application` o `infrastructure`.

Los futuros módulos de aplicación deberán recibir puertos canónicos. Las implementaciones concretas se conectarán mediante adapters/bootstrap en LB-3, manteniendo la dirección de dependencias.

## Trazabilidad jurídica

Los contratos jurídicos conservan como invariantes:

- propuesta, no decisión automática definitiva;
- justificación explícita;
- identificadores de reglas y fuentes;
- evidencia recuperable;
- validación humana para decisiones con efectos administrativos.

La IA se mantiene como servicio auxiliar y no sustituye el motor normativo ni la validación humana.

## Puerta LB-2

LB-2 se acepta solo cuando, sobre el mismo HEAD:

- `npm run audit:architecture` PASS;
- `npm run audit:imports` PASS;
- `npm run audit:knowledge` PASS;
- `npm run typecheck` PASS;
- `npm test` PASS;
- `npm run build` PASS;
- `npm start` PASS;
- manifiesto con una ruta canónica única por responsabilidad;
- arquitectura y decisiones documentadas;
- `main` sin modificar ni fusionar.

## Próxima fase

LB-3 conectará adapters reales detrás de estos contratos y demostrará el primer recorrido vertical: expediente -> reglas -> propuesta CPV/procedimiento -> documento intermedio -> exportación -> auditoría.
