# Auditoría de reutilización de motores heredados de `main`

Fecha: 2026-08-25
Rama auditada: `agent/lb7-qa-seguridad-v1`
Base histórica: `main`

## 1. Criterio

La rama de trabajo contiene la historia de `main` y debe reutilizar el trabajo heredado antes de crear motores equivalentes nuevos. La reutilización nunca implica promover automáticamente una conclusión jurídica: las salidas de motores deben entrar en el estado canónico como propuesta o decisión normativa trazable, con fuente, diagnóstico y validación humana cuando corresponda.

## 2. Hallazgo estructural

`main` contiene la familia histórica `src/engines`: `BaseEngine`, `CPVEngine`, `ContrataIAEngine`, `DocumentEngine`, `ExpedienteEngine`, `KnowledgeEngine`, `ObjetoEngine`, `ProcedimientoEngine`, `PublicidadEngine`, `RuleEngine` y `SolvenciaEngine`.

La rama actual conserva esa familia y además incorpora una capa canónica de integración (`CanonicalExpedienteEngine`, `CanonicalEnginePromotion`, `CanonicalDocumentContextBuilder`, `CanonicalDocumentGenerationGate`, `CanonicalDocumentProfileSelector`, `CanonicalDocumentReadiness`, etc.). Por tanto, el patrón correcto no es copiar motores desde `main`, sino explotarlos a través de la frontera canónica ya existente.

## 3. Clasificación

### REUTILIZAR / CONTINUAR EVOLUCIONANDO

- `src/domain/cpv/CPVEngine.ts`: la versión de la rama amplía la base heredada con modelos de validación, compatibilidad, propuesta y configuración. Debe seguir siendo motor de propuesta CPV, nunca autoridad final.
- `src/domain/conocimiento/KnowledgeEngine.ts`: la versión actual amplía la base heredada con artículos, jurisprudencia, informes, versiones, interpretación, motivación, explicabilidad y validación. Reutilizable como motor de recuperación/razonamiento, sujeto a fuentes verificadas y trazabilidad.
- `src/domain/rules/RuleEngine.ts`: la rama amplía la versión de `main` con prioridad, categoría, ámbito, fuente y acción. Reutilizable como infraestructura de reglas; las reglas jurídicas materiales deben proceder del conocimiento validado y no de constantes opacas.
- `src/engines/CPVEngine.ts`, `ProcedimientoEngine.ts`, `SolvenciaEngine.ts`, `PublicidadEngine.ts`: reutilización ya materializada mediante `CanonicalExpedienteEngine`.
- `src/infrastructure/persistence/RepositoryFactory.ts` y repositorios derivados: reutilizar el patrón de repositorio como abstracción, evitando acoplar dominio e interfaz directamente a Supabase.

### ADAPTAR / ENCAPSULAR

- `ContrataIAEngine.ts` y `ExpedienteEngine.ts`: conservar como lógica heredada aprovechable, pero no convertirlos en nuevo centro de verdad. El estado de verdad debe permanecer en `CanonicalExpedienteState` y sus `EvidenceField`.
- `DocumentEngine.ts`: aprovechar composición/utilidades que no contradigan el pipeline documental protegido, pero someter toda generación a perfiles oficiales, readiness y auditorías físicas.
- `ExpedienteRepository.ts`: sus consultas por código, estado, procedimiento, tipo y CPV son aprovechables como contrato funcional; la implementación JSON local no debe ser el backend persistente del piloto Render Free.

### REFERENCIA / NO PRODUCCIÓN DIRECTA

- `src/domain/pcap/PCAPGeneratorEngine.ts`: conserva lógica histórica útil para entender estructura, cláusulas y auditoría, pero no debe sustituir al pipeline protegido basado en plantilla oficial y fuentes reales. Su salida no es producción V1.
- Cualquier generador legacy de PCAP/PPT/Memoria que no pase por el estado canónico, los gates documentales y las auditorías protegidas debe permanecer fuera de producción.

## 4. Integración canónica ya existente

`CanonicalExpedienteEngine` ya convierte `CanonicalExpedienteState` en el contexto heredado mínimo necesario para ejecutar motores existentes y promociona sus resultados mediante `CanonicalEnginePromotion`.

Reglas de promoción comprobadas:

1. CPV se introduce como `SYSTEM_PROPOSAL` y requiere validación humana.
2. Procedimiento conserva artículos, reglas aplicadas, confianza y diagnóstico, y requiere validación humana.
3. Solvencia y publicidad siguen el mismo patrón de decisión normativa trazable.
4. Una salida de motor no sustituye evidencia ya promocionable/validada del expediente.

Este patrón es la vía preferente para incorporar otros motores heredados.

## 5. Persistencia a coste 0

El mismo criterio de desacoplamiento se aplica a persistencia:

- Render Free = ejecución efímera.
- Supabase Free = persistencia externa.
- GitHub = código, reglas, tests, plantillas y trazabilidad de desarrollo.
- Contrata-IA debe depender de un puerto/repositorio de persistencia, no de Supabase directamente desde el dominio.

La implementación de Supabase debe poder sustituirse en el futuro por otro backend sin reescribir motores ni reglas.

## 6. Gate de coste

Durante la fase actual, toda incorporación arquitectónica debe cumplir `coste operativo requerido = 0 EUR`. No se admitirán como requisito técnico discos Render de pago, bases de datos con pago obligatorio, branches Supabase de pago ni servicios externos cuya funcionalidad necesaria exija upgrade.

## 7. Próximos candidatos a promoción

Prioridad de auditoría/integración:

1. `ObjetoEngine` — propuesta y normalización del objeto contractual.
2. `ProcedimientoEngine` — ampliar cobertura solo desde reglas normativas validadas.
3. `SolvenciaEngine` — adaptar por tipo de contrato/procedimiento y preservar decisiones pendientes.
4. `PublicidadEngine` — publicidad y régimen SARA/no SARA con fuente normativa.
5. `DocumentEngine` — recuperar exclusivamente utilidades compatibles con el pipeline protegido.
6. `ContrataIAEngine` — evaluar si aporta orquestación útil o si su función ya está absorbida por la arquitectura canónica.

## 8. Prohibiciones

- No hacer merge de `main` sobre la rama: la rama ya desciende de `main`.
- No duplicar motores con nombres nuevos si existe una pieza reutilizable.
- No promover resultados jurídicos sin fuente, trazabilidad y gate humano cuando corresponda.
- No reactivar generación legacy en producción.
- No introducir dependencia de pago necesaria para ejecutar el piloto.
