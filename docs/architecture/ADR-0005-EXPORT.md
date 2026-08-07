# ADR-0005 — Frontera canónica de exportación

- Estado: Aceptado
- Fase: LB-2

## Contexto

Las familias de exportación históricas exponen firmas incompatibles (`DocumentExporter`, `ExportResult`, opciones y rutas de salida distintas).

## Decisión

La responsabilidad `export` se asigna a `src/application/export/ExportManager.ts`. El código nuevo dependerá únicamente de `DocumentExporterPort` y `ExportedDocument` desde `src/architecture`.

El contrato separa:

1. documento intermedio;
2. formato solicitado;
3. resultado físico exportado.

## Consecuencias

- Los exporters concretos deberán adaptarse a esta frontera antes de activarse.
- DOCX/PDF solo se considerarán terminados cuando produzcan formatos reales y verificables en LB-5/LB-6.
- Las firmas históricas incompatibles no se utilizarán directamente desde el runtime.
