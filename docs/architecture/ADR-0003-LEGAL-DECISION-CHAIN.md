# ADR-0003 — Cadena canónica de decisión jurídica

- Estado: Aceptado
- Fase: LB-2

## Contexto

Existían motores paralelos de reglas, inferencia, conocimiento y razonamiento jurídico con límites poco claros.

## Decisión

La cadena conceptual canónica queda fijada como:

```text
Knowledge -> Rules -> Inference -> Legal Reasoning -> Proposal -> Human Validation
```

Proveedores seleccionados:

- conocimiento: `src/domain/conocimiento/KnowledgeEngine.ts`;
- reglas: `src/domain/rules/RuleEngine.ts`;
- inferencia: `src/domain/conocimiento/InferenceEngine.ts`;
- razonamiento jurídico: `src/domain/legal/LegalReasoner.ts`.

Los contratos públicos son `KnowledgeEnginePort`, `RuleEnginePort`, `InferenceEnginePort` y `LegalReasonerPort`.

## Invariantes

- Ninguna inferencia equivale por sí sola a una decisión administrativa definitiva.
- Toda propuesta jurídica debe poder enlazar reglas, fuentes y justificación.
- Las decisiones con efectos administrativos requieren validación humana registrada.
- La IA puede asistir en análisis/redacción, pero no sustituye esta cadena.

## Consecuencias

Las implementaciones alternativas se consideran legado y no recibirán nueva funcionalidad salvo decisión explícita de sustitución del proveedor canónico.
