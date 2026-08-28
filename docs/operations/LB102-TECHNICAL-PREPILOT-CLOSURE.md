# LB102 — Cierre técnico de prepiloto

Fecha: 2026-08-28

## Resultado

Contrata-IA alcanza **cierre técnico de prepiloto** para el alcance controlado Supply + Service. Este documento no declara aceptación funcional humana ni producción institucional.

- `technicalEngineeringReady = true`
- `technicalPrePilotReady = true` **cuando el preflight LB101 del despliegue devuelve `pilotSecurityReady=true`**
- `appViableForPilot = false` hasta registrar aceptación humana conforme al gate LB102
- `productionReady = false`
- `humanAcceptanceRequired = true`
- `ensComplianceClaimed = false`

## Evidencia real mínima

### Supply
1. `REG-SUPPLY-001` — CONTR/2026/240267 — ferretería / ASA / necesidades / DA 33.ª — `FULL_PIPELINE`.
2. `REG-SUPPLY-002` — CONTR 2025 466864 — Panda / ASO / software-licencias — `FULL_PIPELINE`.

### Service
3. `REG-SERVICE-008` — CONTR 2025 0000468715 — limpieza SAE Huelva — `FULL_PIPELINE`.
4. `REG-SERVICE-009` — CONTR/2023/957915 — formación en tecnologías 5G — `FULL_PIPELINE`.

Los cuatro casos se conservan como regresiones reales y nunca como modelos generales (`neverGeneralModel=true`).

## Controles acreditados

- Memoria + PCAP + PPT físicos en cada pipeline contado para el piloto.
- SHA e identidad de plantillas protegidos.
- Ausencia de placeholders no materializados.
- Auditoría cruzada documental.
- Conflictos de fuente bloquean y no se resuelven automáticamente.
- Ausencia de validación humana bloquea cuando es exigible.
- Manipulación binaria bloquea.
- La generación base no exige una API de IA de pago.
- Gobierno de fuentes LB100 activo.
- LB99 cerrado para alcance de piloto.

## Seguridad / preflight

El runtime LB102 expone `GET /api/lb102/preflight` y devuelve exclusivamente estados y bloqueos, nunca credenciales ni tokens.

El preflight ejecuta:
- identidades nominativas;
- separación de roles;
- auditoría append-only;
- versionado documental;
- backup;
- restore drill;
- HTTPS configurado;
- persistencia autenticada;
- secretos fuera del repositorio.

Una configuración incompleta devuelve estado bloqueado; no se degrada a readiness ni se propaga como falso éxito.

## CI de cierre

CI #2750 sobre `c817bf19a159ec0dd476190401f31532c3770378`: todos los jobs completados con `success`, incluidos unit/integration tests, typecheck, build productivo, smoke E2E, arquitectura, conocimiento, normativa, documentos, imports y seguridad.

## Frontera de aceptación

`appViableForPilot=true` solo puede alcanzarse cuando existan además:
- al menos 2 sesiones reales de aceptación funcional;
- al menos 2 usuarios distintos;
- al menos 4 paquetes generados revisados humanamente;
- 0 defectos críticos abiertos;
- decisión de aceptación funcional registrada.

La máquina no puede fabricar esas evidencias.

## Conclusión

La ingeniería necesaria para un prepiloto Supply + Service está cerrada y protegida por CI. El único requisito técnico externo pendiente de acreditar es que el despliegue real ejecute satisfactoriamente el preflight LB101. La aceptación funcional humana sigue siendo obligatoria para declarar el aplicativo viable para piloto y la preparación institucional queda fuera de LB102.
