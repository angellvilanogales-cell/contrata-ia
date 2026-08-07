# ADR-0006 — Recorrido vertical mínimo

## Estado
Aceptado para LB-3.

## Contexto
LB-2 fijó una frontera canónica y contratos estables, pero todavía no demostraba un caso de uso completo. LB-3 debe probar que la aplicación puede recorrer de extremo a extremo la creación de un expediente, su persistencia, análisis, propuesta, generación documental, exportación y auditoría.

## Decisión
Se incorpora `src/application/vertical/VerticalSlice.ts` como primer recorrido vertical ejecutable.

El recorrido usa los contratos canónicos de LB-2 y adapters mínimos deliberadamente conservadores. En particular:

- las reglas de LB-3 son validaciones técnicas de presencia de datos, no reglas jurídicas;
- la propuesta CPV queda como `UNASSIGNED`;
- el procedimiento queda como `PENDING_HUMAN_VALIDATION`;
- toda decisión generada declara `requiresHumanValidation: true`;
- la memoria generada es `MEMORIA_PRELIMINAR` y advierte expresamente que no es un documento administrativo validado;
- JSON y HTML son exportaciones reales de la representación intermedia;
- la auditoría registra cada transición relevante.

## Justificación
LB-3 debe demostrar integración técnica sin adelantar la cobertura normativa de LB-4 ni fabricar decisiones jurídicas. Esta separación permite probar el recorrido completo manteniendo el principio PROPOSAL -> JUSTIFICATION -> SOURCE -> HUMAN VALIDATION.

## Puerta de aceptación
La CI debe demostrar en el mismo HEAD:

1. `npm ci` PASS.
2. `npm run audit:imports` PASS.
3. `npm run audit:architecture` PASS.
4. `npm run audit:knowledge` PASS.
5. `npm run typecheck` PASS.
6. `npm test` PASS, incluyendo el recorrido vertical y el rechazo de expedientes incompletos.
7. `npm run build` PASS.
8. `npm start` PASS.
9. `npm run demo:vertical` PASS.

## Consecuencias
LB-4 sustituirá progresivamente los adapters pendientes por motores normativos respaldados por fuentes validadas. LB-5 sustituirá la memoria intermedia por documentos administrativos reales y exportadores de formatos oficiales.