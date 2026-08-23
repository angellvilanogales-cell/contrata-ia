import { describe, expect, it } from "vitest";
import {
  evaluateFerreteriaRealCaseE2EPreflight,
  FERRETERIA_REAL_CASE_E2E_PREFLIGHT,
} from "../src/application/intake/lb30/FerreteriaRealCaseE2EPreflight";
import { JDA_SUPPLY_ASA_VERIFIED_MANIFEST } from "../src/application/intake/lb25/JuntaSupplyAsaOfficialActivation";
import { evaluateJdaSupplyAsaLb34PhysicalClosure } from "../src/application/intake/lb34/JuntaSupplyAsaModificationSection";

describe("LB30/LB34 - preflight E2E del expediente real CONTR/2026/240267", () => {
  it("conserva identidad exacta del expediente y del ODT oficial", () => {
    expect(FERRETERIA_REAL_CASE_E2E_PREFLIGHT.caseId).toBe("CONTR/2026/240267");
    expect(FERRETERIA_REAL_CASE_E2E_PREFLIGHT.contentHash).toBe(JDA_SUPPLY_ASA_VERIFIED_MANIFEST.contentHash);
    expect(FERRETERIA_REAL_CASE_E2E_PREFLIGHT.styleFingerprint).toBe(JDA_SUPPLY_ASA_VERIFIED_MANIFEST.styleFingerprint);
  });

  it("acredita cierre de cobertura física tras LB34", () => {
    const physical = evaluateJdaSupplyAsaLb34PhysicalClosure();
    expect(physical.fullPhysicalCoverageReady).toBe(true);
    expect(physical.remainingBlockingCount).toBe(0);
    expect(physical.blockers).toEqual([]);
  });

  it("sin bytes exactos se detiene en la dependencia de runtime", () => {
    const result = evaluateFerreteriaRealCaseE2EPreflight(false);
    expect(result.readyForRealRender).toBe(false);
    expect(result.stage).toBe("NEEDS_RUNTIME_TEMPLATE_BYTES");
    expect(result.blockers.join(" ")).toContain(JDA_SUPPLY_ASA_VERIFIED_MANIFEST.contentHash);
  });

  it("con bytes exactos alcanza READY_FOR_REAL_RENDER sin simular el render", () => {
    const result = evaluateFerreteriaRealCaseE2EPreflight(true);
    expect(result.readyForRealRender).toBe(true);
    expect(result.stage).toBe("READY_FOR_REAL_RENDER");
    expect(result.blockers).toEqual([]);
  });

  it("mantiene explícita la revisión visual/humana posterior al futuro render", () => {
    expect(FERRETERIA_REAL_CASE_E2E_PREFLIGHT.warnings.join(" ")).toMatch(/comparación visual/i);
    expect(FERRETERIA_REAL_CASE_E2E_PREFLIGHT.warnings.join(" ")).toMatch(/validación humana final/i);
  });
});
