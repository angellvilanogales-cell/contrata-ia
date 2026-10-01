# Protocolo UAT LB103 — Contrata-IA

## Objetivo

Validar con personas usuarias reales que el runtime desplegado permite tramitar y revisar expedientes de forma comprensible, segura y reproducible, sin sustituir la aceptación humana por simulaciones automáticas.

La UAT no habilita producción. Durante todo el protocolo deben mantenerse `humanAcceptanceRequired=true` y `productionReady=false`.

## Prerrequisitos técnicos obligatorios

Antes de comenzar una sesión humana deben estar verdes, sobre el mismo SHA desplegado:

1. CI completa.
2. Generation Gate LB102/LB103.
3. `LB102 technicalPrePilotReady=true`.
4. `LB101 pilotSecurityReady=true`.
5. `preHumanMachineSimulation.passed=true`.
6. `humanSimulationAllowed=true`.
7. `/adaptive` y `/pilot-acceptance` accesibles.
8. Dos identidades nominativas distintas, con contraseña, capaces de actuar como `REVIEWER` o `ADMIN`.
9. Al menos una identidad nominativa `ADMIN` con contraseña para la decisión final.

El workflow `.github/workflows/lb103-uat-readiness.yml` acredita estos prerrequisitos sin publicar nombres ni credenciales.

## Personas y roles

- **Revisor A**: identidad nominativa `REVIEWER` o `ADMIN`.
- **Revisor B**: identidad nominativa distinta, `REVIEWER` o `ADMIN`.
- **Decisor final**: identidad nominativa `ADMIN`.

Una misma persona puede actuar como decisor final y uno de los revisores, pero deben existir al menos dos identidades distintas en las sesiones UAT.

## Expedientes canónicos obligatorios

La aceptación LB102 solo computa estos cuatro expedientes:

| ID técnico | Expediente | Familia |
|---|---|---|
| `supply-ferreteria` | `CONTR/2026/240267` | SUPPLY |
| `supply-panda` | `CONTR 2025 466864` | SUPPLY |
| `service-huelva` | `CONTR 2025 0000468715` | SERVICE |
| `service-sevilla` | `CONTR 2026 38892` | SERVICE |

Cada revisión queda ligada al SHA-256 del paquete generado por el servidor. Una revisión antigua no debe validar automáticamente un paquete regenerado con otro SHA.

## Bloque A — UAT funcional de `/adaptive`

Realizar al menos una tramitación completa desde `/adaptive` con un expediente nuevo y sin reutilizar respuestas preparadas previamente.

### A1. Acceso

- Abrir `/adaptive`.
- Iniciar sesión con identidad nominativa.
- Confirmar que la sesión es aceptada y que no se exponen tokens en la interfaz.

**PASS:** acceso correcto y sesión segura.

### A2. Nuevo expediente

- Crear un expediente nuevo.
- Confirmar que se obtiene un identificador `EXP-...`.
- Copiar el identificador en el registro UAT.

**PASS:** expediente creado y recuperable.

### A3. Diálogo guiado

Responder las preguntas hasta completar la espina dorsal contractual.

Comprobar durante el recorrido:

- las preguntas son comprensibles;
- no se solicita dos veces un dato ya confirmado;
- una propuesta automática se distingue de una decisión humana;
- los importes en formato español se interpretan correctamente;
- las advertencias no se presentan como decisiones cerradas;
- los fundamentos jurídicos se muestran como apoyo y no sustituyen revisión normativa vigente.

**PASS:** recorrido comprensible y sin bloqueo técnico no justificado.

### A4. Persistencia y recuperación

- Cerrar o recargar la página en un punto intermedio.
- Reabrir el expediente mediante su ID.
- Confirmar que no se pierden respuestas ya guardadas.

**PASS:** recuperación íntegra del expediente.

### A5. Preflight LB103

Al alcanzar `READY_FOR_DOCUMENT_GENERATION`, comprobar que el preflight autoritativo devuelve:

- `snapshotReady=true`;
- `packageReady=true`;
- SHA de snapshot válido;
- SHA de selección documental válido;
- `blockers=[]`;
- `humanAcceptanceStillRequired=true`;
- `productionReady=false`.

**PASS:** preflight listo y sellos válidos.

### A6. Generación autoritativa

Generar desde `/adaptive` usando exclusivamente los sellos ofrecidos por el servidor.

Comprobar:

- descarga de un único ZIP;
- presencia de PCAP, Memoria, PPT y manifest;
- ausencia de datos de negocio reenviados desde cliente como fuente de verdad;
- cabeceras que mantienen aceptación humana obligatoria y `productionReady=false`.

**PASS:** ZIP autoritativo generado correctamente.

## Bloque B — Revisión documental humana

Abrir los documentos generados con un editor ODT compatible.

Para cada paquete revisar conjuntamente PCAP, Memoria y PPT:

- identidad del expediente;
- objeto;
- CPV;
- lotes;
- procedimiento;
- presupuesto base de licitación;
- valor estimado;
- duración y prórrogas;
- financiación;
- criterios de adjudicación;
- solvencia cuando proceda;
- condiciones especiales cuando proceda;
- coherencia entre los tres documentos;
- ausencia de placeholders o texto de plantilla no materializado;
- fidelidad al modelo administrativo aplicable;
- estructura, tablas, estilos y legibilidad;
- editabilidad real del ODT.

Registrar cualquier incidencia como:

- **CRÍTICA**: puede alterar una decisión jurídica, económica o documental esencial; impide aceptación.
- **MAYOR**: no altera por sí sola la decisión jurídica, pero impide un uso administrativo razonable sin corrección.
- **MENOR**: presentación, redacción o UX que no impide el uso piloto.

## Bloque C — Aceptación de los cuatro paquetes canónicos

En `/pilot-acceptance`:

1. Revisor A inicia sesión.
2. Registra su sesión humana.
3. Genera y descarga los cuatro paquetes.
4. Revisa cada tríada y registra la revisión correspondiente, indicando defectos críticos y observaciones.
5. Revisor A cierra sesión.
6. Revisor B inicia sesión con identidad distinta.
7. Registra su sesión humana.
8. Revisa al menos el estado general y, cuando se acuerde, realiza revisión cruzada de los paquetes o del expediente nuevo `/adaptive`.

La aceptación final exige que, para los cuatro expedientes canónicos, la revisión vigente tenga:

- `accepted=true`;
- `criticalDefectsOpen=0`.

## Bloque D — Expediente nuevo no canónico

Además de los cuatro casos de regresión, una persona debe completar un expediente nuevo desde cero en `/adaptive`.

Este expediente no sustituye los cuatro canónicos del gate LB102. Su finalidad es detectar problemas de comprensión, navegación, persistencia y generación que los casos conocidos no revelan.

Registrar:

- ID del expediente;
- tiempo aproximado de cumplimentación;
- preguntas confusas;
- campos repetitivos;
- decisiones que requirieron ayuda externa;
- errores de navegación;
- resultado de generación;
- observaciones sobre los documentos.

## Bloque E — Decisión final

Solo después de completar la evidencia anterior, una identidad `ADMIN` registra la decisión en `/pilot-acceptance`.

Para aceptar deben cumplirse simultáneamente:

- al menos 2 sesiones reales;
- al menos 2 usuarios distintos;
- 4 expedientes canónicos revisados;
- 0 defectos críticos abiertos;
- decisión motivada;
- fingerprint de evidencia vigente.

Si cambia posteriormente la evidencia que sustenta la aceptación, el fingerprint deja de ser vigente y no debe mantenerse una aceptación afirmativa como actual.

## Registro mínimo de cada incidencia

| Campo | Contenido |
|---|---|
| ID | UAT-XXX |
| Fecha | ISO o fecha local |
| Usuario | identidad nominativa o alias interno |
| Expediente | ID/caseId |
| Pantalla/documento | ubicación exacta |
| Severidad | CRÍTICA / MAYOR / MENOR |
| Descripción | qué ocurrió |
| Resultado esperado | comportamiento correcto |
| Evidencia | captura, SHA, texto de error o documento |
| Estado | ABIERTA / CORREGIDA / REVALIDADA |
| Commit de corrección | SHA Git |

## Criterio de salida hacia piloto viable

La UAT se considera superada únicamente si:

- el gate UAT técnico está verde en el SHA desplegado;
- las dos sesiones nominativas han sido registradas;
- los cuatro expedientes canónicos están aceptados con 0 defectos críticos;
- el expediente nuevo de `/adaptive` puede completarse y recuperarse sin ayuda técnica continua;
- los documentos generados son editables y administrativamente utilizables;
- no quedan defectos críticos ni mayores que impidan el uso piloto;
- la decisión final ADMIN está registrada y su fingerprint de evidencia continúa vigente;
- `productionReady` sigue en `false` hasta una fase de producción independiente.
