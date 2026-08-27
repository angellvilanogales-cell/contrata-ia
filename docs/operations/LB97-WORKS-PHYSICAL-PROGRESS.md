# LB97 — Vertical Works físico operativo · estado de avance

## Autoridad documental y normativa

- Portal de modelos recomendados de la Comisión Consultiva de Contratación Pública de la Junta de Andalucía: matriz Works de procedimiento abierto, abierto simplificado ordinario, abierto simplificado abreviado, redacción de proyecto + ejecución de obra y negociación, en autofinanciado y fondos europeos.
- Referencia de actualización de los modelos catalogados: diciembre de 2025.
- LCSP: preparación y ejecución de obras conforme a los artículos 231 a 244, con gates explícitos de proyecto, contenido mínimo, supervisión cuando proceda, aprobación, replanteo, ejecución, certificaciones y recepción.

## Activos físicos Contrata-IA

Se dispone de un paquete general Works derivado, no oficial, con validación humana obligatoria:

- PCAP: `contrata-ia:works:pcap:general:LB97-WORKS-GENERAL-ODT-V1`.
- Memoria: `contrata-ia:works:memory:general:LB97-WORKS-GENERAL-ODT-V1`.
- PPT/marco técnico: `contrata-ia:works:ppt:general:LB97-WORKS-GENERAL-ODT-V1`.

Los tres activos están persistidos en el almacén durable y protegidos por SHA-256, huella de estilo, inventario exacto de slots, procedencia `CONTRATA_IA_DERIVED_GENERAL_TEMPLATE` y `officialModel=false`.

La existencia de estos activos no implica promoción de los ODT oficiales catalogados de la Junta: los binarios oficiales continúan siendo candidatos preferentes pendientes de recuperación física verificable.

## Gates implementados

1. `WorksPreparationGate`: proyecto, aprobación, supervisión del artículo 235, replanteo y disponibilidad de terrenos.
2. `WorksProjectContentGate`: contenido mínimo del proyecto del artículo 233 y prohibición de aplicar simplificación sin supuesto habilitante y motivación expresa.
3. `WorksGeneralTemplatePhysicalGate`: ODT, SHA, estilo, slots y procedencia.
4. `WorksGeneralEditableTemplateRenderer`: exige todos los valores documentales y no infiere decisiones pendientes.
5. `WorksVerticalClosureGate`: documentos + preparación + contenido del proyecto + generador.
6. `WorksUserDocumentPackageGenerator`: PCAP + Memoria + PPT + manifest, con auditoría cruzada de objeto, CPV, PBL y VE.

## Runtime

`LB97RuntimeServer` hereda los verticales Supply y Service y añade:

- `/works`
- `GET /api/lb97/cases/:caseId/journey`
- `POST /api/lb97/cases/:caseId/generate-package`

La descarga solo se habilita cuando el expediente supera todos los gates. Un expediente incompleto se bloquea antes de acceder a las plantillas físicas.

## Estado de cierre

A fecha de este documento:

- catálogo oficial Works: **registrado**, bytes oficiales **no promovidos**;
- activos Works derivados: **persistidos y verificados**;
- preparación jurídica: **implementada**;
- contenido del proyecto: **implementado**;
- renderer y ZIP: **implementados**;
- runtime `/works`: **implementado**;
- regresiones negativas: **implementadas**;
- E2E positivo de expediente Works completamente validado: **pendiente**;
- `engineeringClosed`: **false hasta superar E2E positivo y CI final del HEAD**;
- `productionReady`: **false**;
- `humanValidationRequired`: **true**.

No debe modificarse este estado a cerrado por la sola disponibilidad de las tres plantillas.
