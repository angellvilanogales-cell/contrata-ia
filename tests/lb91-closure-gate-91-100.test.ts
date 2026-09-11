import { describe, expect, it } from "vitest";
import { assessLB91Closure, LB91_EXTERNAL_BLOCKERS } from "../src/domain/capabilities/LB91ClosureGate";
import { canBulkReuseMain, getUnsafeMainReuseItems } from "../src/domain/capabilities/MainBranchReuseClosureAudit";

const COMPLETE_ENGINEERING = {
  coreUniversalEnginesImplemented: true,
  familyPreparationImplemented: true,
  documentSelectionGuarded: true,
  physicalRenderGuarded: true,
  crossDocumentAuditImplemented: true,
  supplyMultiCaseCorpusImplemented: true,
  supplyVariantIsolationImplemented: true,
  ciGreen: true,
} as const;

describe("LB91.91-100 - cierre técnico conservador", () => {
  it("permite cerrar ingeniería sin declarar producción ni cobertura universal", () => {
    const result = assessLB91Closure(COMPLETE_ENGINEERING);
    expect(result.engineeringClosed).toBe(true);
    expect(result.productionReady).toBe(false);
    expect(result.universalOperationalCoverage).toBe(false);
    expect(result.humanValidationRequired).toBe(true);
    expect(result.unresolvedExternalBlockers).toEqual(LB91_EXTERNAL_BLOCKERS);
  });

  it("bloquea el cierre técnico si la CI no está verde", () => {
    const result = assessLB91Closure({ ...COMPLETE_ENGINEERING, ciGreen: false });
    expect(result.engineeringClosed).toBe(false);
    expect(result.blockers.join(" ")).toContain("CI");
  });

  it("permite resolver bloqueos externos uno a uno sin convertir el producto en productionReady", () => {
    const result = assessLB91Closure({
      ...COMPLETE_ENGINEERING,
      resolvedExternalBlockers: ["DEPLOYED_PERSISTENCE_RESTART_RECOVERY"],
    });
    expect(result.unresolvedExternalBlockers).not.toContain("DEPLOYED_PERSISTENCE_RESTART_RECOVERY");
    expect(result.productionReady).toBe(false);
  });

  it("prohíbe la reutilización masiva de main y mantiene piezas no confiables fuera", () => {
    expect(canBulkReuseMain()).toBe(false);
    const unsafe = getUnsafeMainReuseItems().map(item => item.path);
    expect(unsafe).toContain("src/documental/generators/MemoryComposer.ts");
    expect(unsafe).toContain("src/domain/conocimiento/KnowledgeEngine.ts");
  });
});
