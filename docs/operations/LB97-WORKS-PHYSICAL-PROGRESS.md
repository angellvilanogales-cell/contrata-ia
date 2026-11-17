# LB97 — Vertical Works físico operativo · CIERRE

## Autoridad documental y normativa

- Portal de modelos recomendados de la Comisión Consultiva de Contratación Pública de la Junta de Andalucía: matriz Works de procedimiento abierto, abierto simplificado ordinario, abierto simplificado abreviado, redacción de proyecto + ejecución de obra y negociación, en autofinanciado y fondos europeos.
- Referencia de actualización de los modelos catalogados: diciembre de 2025.
- LCSP: preparación y ejecución de obras conforme a los artículos 231 a 244, con gates explícitos de proyecto, contenido mínimo, supervisión cuando proceda, aprobación, replanteo, ejecución, certificaciones y recepción.

## Activos físicos Contrata-IA

Paquete general Works derivado, no oficial, con validación humana obligatoria:

- PCAP: `contrata-ia:works:pcap:general:LB97-WORKS-GENERAL-ODT-V1`.
- Memoria: `contrata-ia:works:memory:general:LB97-WORKS-GENERAL-ODT-V1`.
- PPT/marco técnico: `contrata-ia:works:ppt:general:LB97-WORKS-GENERAL-ODT-V1`.

Los tres activos están persistidos en el almacén durable y protegidos por SHA-256, huella de estilo, inventario exacto de slots, procedencia `CONTRATA_IA_DERIVED_GENERAL_TEMPLATE` y `officialModel=false`.

La existencia de estos activos no implica promoción de los ODT oficiales catalogados de la Junta: los binarios oficiales continúan siendo candidatos preferentes pendientes de recuperación física verificable. El cierre LB97 acredita el paquete físico derivado Contrata-IA source-backed, no una falsa identidad oficial.

## Gates acreditados

1. `WorksPreparationGate`: proyecto, aprobación, supervisión del artículo 235, replanteo y disponibilidad de terrenos.
2. `WorksProjectContentGate`: contenido mínimo del proyecto del artículo 233 y prohibición de aplicar simplificación sin supuesto habilitante y motivación expresa.
3. `WorksGeneralTemplatePhysicalGate`: ODT, SHA, estilo, slots y procedencia.
4. `WorksGeneralEditableTemplateRenderer`: exige todos los valores documentales y no infiere decisiones pendientes.
5. `WorksVerticalClosureGate`: documentos + preparación + contenido del proyecto + generador.
6. `WorksUserDocumentPackageGenerator`: PCAP + Memoria + PPT + manifest, con auditoría cruzada de objeto, CPV, PBL y VE.
7. Regresión negativa: un expediente incompleto se bloquea antes de consultar las plantillas físicas.
8. Regresión positiva E2E: expediente `REG-WORKS-LB97-E2E-001` genera realmente PCAP, Memoria, PPT y ZIP utilizando los mismos binarios acreditados en persistencia.

## Runtime

`LB97RuntimeServer` hereda Supply y Service y añade:

- `/works`
- `GET /api/lb97/cases/:caseId/journey`
- `POST /api/lb97/cases/:caseId/generate-package`

La descarga solo se habilita cuando el expediente supera todos los gates y conserva `humanValidationRequired=true`.

## Evidencia de cierre

- Commit funcional E2E: `cc625a12bdb6c29c4c942a17c20b97c180e78f31`.
- GitHub Actions: CI #2504, run `33119825340`.
- Resultado: `COMPLETED / SUCCESS`.
- TypeScript typecheck: success.
- Production build + smoke tests: success.
- Unit/vertical/normative/document/intake/security tests: success.
- E2E positivo Works sobre los tres binarios físicos persistidos: success.
- Auditoría cruzada del paquete: success.

## Declaración de cierre

- `LB97 engineeringClosed = true`.
- `LB97 physicalPackageOperational = true` para el paquete general Works derivado acreditado y para expedientes que superen todos los gates jurídicos/documentales.
- `productionReady = false`.
- `humanValidationRequired = true`.
- Los modelos oficiales Works de la Junta no se declaran físicamente promovidos hasta recuperar y verificar sus bytes exactos.

El siguiente bloque de roadmap es **LB98 — Vertical Concession físico operativo**.
