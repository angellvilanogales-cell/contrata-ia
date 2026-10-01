# LB93 — Vertical Supply operativo completo

## Objetivo

LB93 convierte la infraestructura universal de LB91 y la persistencia durable demostrada en LB92 en un recorrido de usuario coherente para contratos de suministro. El cierre de LB93 no equivale a `productionReady` ni a disponibilidad física universal de todos los documentos.

## Principios de diseño

1. **Un solo expediente de evidencia.** Los nuevos datos Supply se guardan en `UniversalEvidenceWorkspace` y, cuando existe espejo remoto, en la misma persistencia durable de Supabase. No se crea un segundo estado paralelo.
2. **Preguntas solo cuando no procede inferir.** Procedimiento, perfil de financiación, subfamilia técnica y solvencia se declaran expresamente y requieren validación humana.
3. **No resolución automática de contradicciones.** `SOURCE_CONFLICT` bloquea el progreso y conserva el tratamiento `DO_NOT_AUTO_RESOLVE`.
4. **Separación entre preparación jurídica y generación física.** Un expediente puede estar preparado para revisión y seguir sin paquete universal generable si falta Memoria o PPT general editable acreditado.
5. **No generalización del caso protegido.** Los ODT del expediente `CONTR/2026/240267` siguen siendo activos de caso; no se convierten en plantillas universales por el mero hecho de ser editables.
6. **Aceptación humana obligatoria.** `productionReady` permanece `false` en el gate de LB93.

## Campos añadidos al recorrido Supply

El manifiesto complementario incorpora necesidad, procedimiento, financiación, subfamilia técnica, hechos necesarios para aplicar el overlay técnico, solvencia económica/técnica, prescripciones esenciales y recepción/conformidad. Todos se escriben mediante la misma API universal de evidencia.

La subfamilia técnica admite actualmente:

- `CATALOGUE_NEEDS`
- `ICT_LICENSE_OR_SOFTWARE`
- `DIGITAL_EQUIPMENT`
- `SUPPLY_WITH_SERVICE_COMPONENT`
- `MEDICAL_FRAMEWORK`
- `FURNITURE_INSTALLATION`
- `ORDINARY_GLOBAL_PRICE`

La declaración no se deduce automáticamente del CPV.

## Evaluación jurídica mínima del vertical

`SupplyVerticalCoordinator` agrega estado de secciones y regresiones de frontera sin sustituir el análisis jurídico completo existente:

- necesidad/objeto y lotes: arts. 28 y 99 LCSP;
- PBL, valor estimado y precio: arts. 100-102;
- contrato menor de suministro: VE inferior a 15.000 € — art. 118;
- abierto simplificado abreviado de suministro: VE inferior a 60.000 € — art. 159.6;
- solvencia: arts. 74 y 86-92, sin inventar umbrales;
- criterios: arts. 145-146;
- ejecución: arts. 192-202;
- modificaciones: arts. 203-207.

No se codifica un umbral SARA universal de suministros porque depende del tipo de poder adjudicador y del contexto aplicable.

## Documentos

El vertical sigue utilizando el selector físico conservador existente. Para cada Memoria, PCAP y PPT solo se devuelve `RENDER_ALLOWED` si el catálogo alcanza `GENERAL_EDITABLE_SELECTED`.

Estado esperado al cierre LB93:

- PCAP Supply ASA autofinanciado: activo general editable acreditado disponible.
- Memoria Supply universal: estructura multicaso acreditada, activo general editable todavía no promocionado.
- PPT Supply universal: estructura multicaso y aislamiento por subfamilia acreditados, activo general editable todavía no promocionado.
- paquete universal Memoria + PCAP + PPT: bloqueado hasta disponer de los tres activos generales editables compatibles.

## Interfaz

La pantalla de tramitación universal incorpora los campos Supply y un panel de progreso legible para el usuario. No muestra nomenclatura interna LB. Las advertencias de procedimiento, lotes, financiación y conflictos aparecen antes de intentar la generación.

## Persistencia

Los campos de LB93 son rutas permitidas del mismo `UniversalEvidenceWorkspace`; por ello entran en el snapshot durable completo y heredan checksum canónico, versión de esquema, aislamiento por expediente y espejo Supabase de LB92.

## Criterio de cierre

`LB93SupplyVerticalClosureGate` puede declarar `engineeringClosed=true` y `pilotWorkflowViable=true` solo si están acreditados: workspace canónico, persistencia durable, campos guiados, progreso visible, regresiones jurídicas de frontera, aislamiento de subfamilias, gate físico intacto, validación humana y CI completa verde.

Aunque cierre LB93:

- `fullPhysicalPackageReady=false`;
- `productionReady=false`;
- `humanAcceptanceRequired=true`.

El siguiente cuello de botella documental es la promoción acreditada de una Memoria y un PPT Supply generales editables, sin convertir por atajo documentos de un expediente concreto en modelo universal.
