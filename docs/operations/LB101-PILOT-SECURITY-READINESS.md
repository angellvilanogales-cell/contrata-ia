# LB101 — Seguridad multiusuario y operación de piloto

## Implementado

- Identidades nominativas configurables mediante `CONTRATA_IA_USERS_JSON`.
- Roles `VIEWER`, `OPERATOR`, `REVIEWER`, `ADMIN` y jerarquía RBAC.
- Prohibición de credencial compartida entre usuarios nominativos.
- Sesión segura `HttpOnly`, `Secure`, `SameSite=Strict` y headers de seguridad existentes.
- Auditoría append-only con cadena SHA-256 (`PilotAccessAudit`).
- Versionado inmutable de paquetes aceptados con SHA y commit de origen (`PilotDocumentVersionStore`).
- Backup determinista y ejercicio de restore con verificación SHA (`PilotBackupRestore`).
- Gate `LB101PilotSecurityReadiness` que exige identidades nominativas, separación de roles, auditoría, versionado, backup, restore drill, HTTPS, persistencia autenticada y secretos fuera del repositorio.

## Marco normativo

Los controles toman como referencia el Real Decreto 311/2022 (ENS), RGPD y LOPDGDD. El sistema **no declara conformidad ni certificación ENS**. Esa valoración pertenece a LB103 y a las actuaciones formales que correspondan.

## Compatibilidad

Los tokens históricos `CONTRATA_IA_*_TOKEN` siguen admitidos para no romper despliegues existentes, pero no bastan por sí solos para acreditar readiness multiusuario del piloto. El piloto debe usar identidades nominativas.

## Evidencia automatizada

`tests/lb101-pilot-security-readiness.test.ts` verifica:

- autenticación nominativa y RBAC;
- rechazo de credenciales compartidas;
- detección de manipulación del audit log;
- versionado inmutable y SHA;
- backup + restore drill;
- separación entre controles de piloto y falsa declaración ENS/producción.

CI #2668 (`33163110301`) terminó `SUCCESS` e incluye estas regresiones junto con typecheck, tests, build y auditorías generales.

## Estado

- componentes de seguridad/operación LB101: **engineering ready**
- suite automática: **green**
- `ensComplianceClaimed`: **false**
- `productionReady`: **false**
- `pilotSecurityReady`: se obtiene únicamente al ejecutar el gate contra la configuración real del despliegue (identidades nominativas, HTTPS, persistencia, backup y restore drill).

No se marca ficticiamente el despliegue como listo mientras esas evidencias operativas no se hayan ejecutado en el entorno efectivo del piloto.
