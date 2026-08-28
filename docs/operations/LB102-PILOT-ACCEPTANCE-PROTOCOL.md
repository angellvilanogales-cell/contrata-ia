# LB102 — Piloto operativo y aceptación funcional

## Objetivo

Declarar `appViableForPilot=true` únicamente cuando exista evidencia técnica y humana suficiente. Una CI verde no sustituye sesiones de usuario.

## Casos de referencia ya disponibles en fuentes

### Supply

- `CONTR/2026/240267` — suministro de materiales de ferretería SAE. Las fuentes contienen PCAP, PPT, memoria/trazabilidad y un manifest de paquete generado con PCAP + Memoria + PPT y auditoría cruzada. Debe utilizarse como caso controlado, no como plantilla general.
- Debe seleccionarse un **segundo expediente Supply real independiente** antes de cerrar LB102; las regresiones sintéticas o subfamilias de la guía no sustituyen este requisito.

### Service

- `REG-SERVICE-005` / `ADM-2024-0004` (`CONTR/2024/636510`) — limpieza sede CARL, con Memoria + PCAP + PPT y particularidades de insuficiencia de medios/subrogación.
- `REG-SERVICE-007` — mantenimiento integral SAE Sevilla, segundo patrón real de servicios, multilote/SARA y distinto del caso de limpieza.

Los campos que las fuentes marquen como pendientes permanecen pendientes; el protocolo no los completa por inferencia.

## Criterios mínimos automatizados

`LB102PilotAcceptanceGate` exige antes de la aceptación humana:

- LB99 cerrado para alcance del piloto;
- gobierno de fuentes LB100;
- generación base sin API de IA de pago obligatoria;
- seguridad LB101 acreditada en el entorno real;
- al menos 2 ejecuciones Supply reales/controladas;
- al menos 2 ejecuciones Service reales/controladas;
- regresión de conflicto de fuentes;
- regresión de falta de validación humana;
- regresión de integridad de plantilla.

## Criterios humanos mínimos

- 2 sesiones de aceptación funcional superadas;
- al menos 2 usuarios distintos;
- al menos 4 paquetes Supply/Service revisados humanamente;
- 0 defectos críticos abiertos;
- decisión `ACCEPT_FOR_PILOT` registrada.

`PilotAcceptanceRegistry` conserva los eventos de caso, sesión, regresión, defecto y decisión de aceptación de forma append-only.

## Regla de cierre

Solo cuando todos esos extremos concurran puede devolverse:

- `technicalPrePilotReady=true`
- `appViableForPilot=true`

Incluso entonces:

- `productionReady=false`
- `institutionalReadinessRequired=true`

La producción institucional pertenece a LB103 y requiere las validaciones formales correspondientes.
