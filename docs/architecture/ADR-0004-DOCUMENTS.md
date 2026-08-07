# ADR-0004 — Modelo documental canónico

- Estado: Aceptado
- Fase: LB-2

## Contexto

El repositorio contiene varias generaciones de generadores, composers y tipos documentales. Mantener varias familias activas provoca incompatibilidades de tipos y exportación.

## Decisión

La responsabilidad `documents` se asigna a `src/application/documents/DocumentGenerator.ts` y el contrato público para nuevo código es `DocumentGeneratorPort` definido en `src/architecture/contracts.ts`.

La composición y exportación son responsabilidades separadas. Un generador devuelve un modelo documental intermedio; no debe escribir directamente DOCX/PDF ni mezclar formato físico con decisión jurídica.

## Consecuencias

- `src/generators/BaseDocumentGenerator.ts` y otras familias no seleccionadas quedan como legado hasta su comparación/retirada.
- LB-3 deberá adaptar el generador seleccionado al contrato canónico.
- LB-5 validará que los documentos administrativos resultantes respeten plantillas, estructura, tipografía y formatos reales.
