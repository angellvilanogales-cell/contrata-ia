# LB102 — Piloto operativo y aceptación funcional

## Objetivo

Declarar `appViableForPilot=true` únicamente cuando exista evidencia técnica y humana suficiente. Una CI verde no sustituye sesiones de usuario.

## Casos de referencia ya disponibles en fuentes

El inventario canónico de casos se conserva en `knowledge/sources/lb102-pilot-cases.yaml`. Los casos reales son evidencia de contraste/aceptación y nunca se convierten automáticamente en plantillas generales.

### Supply

- `CONTR/2026/240267` — suministro de materiales de ferretería SAE. Las fuentes contienen PCAP, PPT, memoria/trazabilidad y un manifest de paquete generado con PCAP + Memoria + PPT y auditoría cruzada. Es el primer caso Supply completo controlado.
- `GGI0263OSV0` / `CONTR 2025 0000265459` — suministro, instalación y renovación de infraestructuras TIC para los sistemas informáticos de la Agencia de Obra Pública de la Junta de Andalucía. Se han verificado en fuente oficial Junta la Memoria justificativa y el PPT; la ficha de licitación acredita naturaleza de suministro, procedimiento abierto simplificado y presupuesto de 58.000 €. Es un segundo Supply real independiente, pero **no cuenta todavía como PASS documental completo** hasta recuperar/verificar el PCAP exacto y revisar humanamente el paquete resultante.

Como evidencia adicional de suministro ordinario distinto del golden existe `REG-SUPPLY-006` / VEIASA Windows Server; sus fuentes/regresiones protegen procedimiento, precio global, ausencia de DA 33.ª, prórroga y modificación. No se utiliza para sustituir la completitud documental exigida al segundo caso.

### Service

- `REG-SERVICE-005` / `ADM-2024-0004` (`CONTR/2024/636510`) — limpieza sede CARL, con Memoria + PCAP + PPT y particularidades de insuficiencia de medios/subrogación.
- `REG-SERVICE-007` — mantenimiento integral SAE Sevilla, segundo patrón real de servicios, multilote/SARA y distinto del caso de limpieza.

Los campos que las fuentes marquen como pendientes permanecen pendientes; el protocolo no los completa por inferencia.

## Criterios mínimos automatizados

`LB102PilotAcceptanceGate` exige antes de la aceptación humana:

- LB99 cerrado para alcance del piloto;
- gobierno de fuentes LB100;
- generación base sin API de IA de pago obligatoria;
- seguridad LB101 acreditada en el entorno real mediante `npm run pilot:lb101-preflight`;
- al menos 2 ejecuciones Supply reales/controladas completas;
- al menos 2 ejecuciones Service reales/controladas completas;
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
