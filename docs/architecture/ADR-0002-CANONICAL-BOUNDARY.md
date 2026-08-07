# ADR-0002 — Frontera arquitectónica canónica

- Estado: Aceptado
- Fase: LB-2

## Contexto

El repositorio contiene generaciones paralelas de motores, resolvers, repositorios y servicios. Compilar o consumirlos indiscriminadamente vuelve a introducir contratos incompatibles y hace imposible saber qué implementación es autoritativa.

## Decisión

Se establece `src/architecture` como frontera pública del runtime. `canonical-manifest.json` registra una única implementación seleccionada por responsabilidad y `contracts.ts` define los contratos entre capas.

`src/main.ts` solo puede entrar a los subsistemas a través de esta frontera.

## Consecuencias

- El código histórico no seleccionado pasa a estado de legado.
- Código nuevo no puede depender directamente de alternativas históricas.
- La integración física de cada proveedor detrás de su puerto se realizará progresivamente, comenzando en LB-3.
- Cambiar un proveedor canónico exige modificar el manifiesto, pruebas y ADR correspondiente.
