export type MainReuseDisposition =
  | "REUSED_ALREADY"
  | "ADAPT_WITH_GUARDS"
  | "DO_NOT_REUSE_AS_IS";

export interface MainReuseItem {
  path: string;
  disposition: MainReuseDisposition;
  reason: string;
}

/**
 * LB91.91-93 — inventario explícito de la cantera histórica de `main`.
 * No implica merge ni copia masiva. Solo permite reutilización cuando la pieza
 * respeta la arquitectura canónica, la trazabilidad normativa y los gates
 * documentales construidos en LB91.
 */
export const MAIN_BRANCH_REUSE_CLOSURE_AUDIT: readonly MainReuseItem[] = [
  {
    path: "src/generators/BaseDocumentGenerator.ts",
    disposition: "REUSED_ALREADY",
    reason: "La abstracción de ciclo prepare/validate/generate/finalize ya está heredada; LB91 no la duplica.",
  },
  {
    path: "src/application/generation/DocumentGenerationPipeline.ts",
    disposition: "REUSED_ALREADY",
    reason: "La orquestación histórica permanece disponible, pero LB91 añade preflight físico previo al render.",
  },
  {
    path: "src/application/export",
    disposition: "ADAPT_WITH_GUARDS",
    reason: "Los exportadores pueden reutilizarse aguas abajo del renderer, nunca para eludir selección de modelo, auditoría o aceptación humana.",
  },
  {
    path: "src/documental/generators/MemoryComposer.ts",
    disposition: "DO_NOT_REUSE_AS_IS",
    reason: "Es una fachada sin composición efectiva; no sustituye el corpus multicaso ni la selección de modelo físico.",
  },
  {
    path: "src/domain/documentModel",
    disposition: "ADAPT_WITH_GUARDS",
    reason: "Definiciones y catálogos históricos son reutilizables solo tras reconciliación con perfiles, fuentes y activos verificados de LB91.",
  },
  {
    path: "src/domain/conocimiento/KnowledgeEngine.ts",
    disposition: "DO_NOT_REUSE_AS_IS",
    reason: "La procedencia de resúmenes/doctrina incorporada no está cerrada de forma suficiente para promoción automática a regla jurídica.",
  },
] as const;

export function getUnsafeMainReuseItems(): readonly MainReuseItem[] {
  return MAIN_BRANCH_REUSE_CLOSURE_AUDIT.filter(item => item.disposition === "DO_NOT_REUSE_AS_IS");
}

export function canBulkReuseMain(): false {
  return false;
}
