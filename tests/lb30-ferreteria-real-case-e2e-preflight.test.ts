import { describe, expect, it } from "vitest";
import {
  evaluateFerreteriaRealCaseE2EPreflight,
  FERRETERIA_REAL_CASE_E2E_PREFLIGHT,
} from "../src/application/intake/lb30/FerreteriaRealCaseE2EPreflight";
import { JDA_SUPPLY_ASA_VERIFIED_MANIFEST } from "../src/application/intake/lb25/JuntaSupplyAsaOfficialActivation";
import { JDA_SUPPLY_ASA_LB28_REMAINING_PHYSICAL_BLOCKERS } from "../src/application/intake/lb28/JuntaSupplyAsaExpandedPhysicalProfile";

describe("LB30 - preflight E2E del expediente real CONTR/2026/240267", () => {
  it("conserva identidad exacta del expediente y del ODT oficial", () => {
    expect(FERRETERIA_REAL_CASE_E2E_PREFLIGHT.caseId).toBe("CONTR/2026/240267");
    expect(FERRETERIA_REAL_CASE_E2E_PREFLIGHT.contentHash).toBe(JDA_SUPPLY_ASA_VERIFIED_MANIFEST.contentHash);
    expect(FERRETERIA_REAL_CASE_E2E_PREFLIGHT.styleFingerprint).toBe(JDA_SUPPLY_ASA_VERIFIED_MANIFEST.styleFingerprint);
  });

  it("no declara render real mientras existan huecos físicos certificados por LB28", () => {
    const result = evaluateFerreteriaRealCaseE2EPreflight(true);
    expect(result.readyForRealRender).toBe(false);
    expect(result.stage).toBe("PHYSICAL_COVERAGE_INCOMPLETE");
    expect(result.blockers).toEqual(JDA_SUPPLY_ASA_LB28_REMAINING_PHYSICAL_BLOCKERS);
  });

  it("no permite que la presencia local de bytes oculte una cobertura documental incompleta", () => {
    const withoutRuntimeBytes = evaluateFerreteriaRealCaseE2EPreflight(false);
    const withRuntimeBytes = evaluateFerreteriaRealCaseE2EPreflight(true);
    expect(withoutRuntimeBytes.stage).toBe("PHYSICAL_COVERAGE_INCOMPLETE");
    expect(withRuntimeBytes.stage).toBe("PHYSICAL_COVERAGE_INCOMPLETE");
    expect(withRuntimeBytes.blockers.length).toBeGreaterThan(0);
  });

  it("mantiene explícita la revisión visual/humana posterior al futuro render", () => {
    expect(FERRETERIA_REAL_CASE_E2E_PREFLIGHT.warnings.join(" ")).toMatch(/comparación visual/i);
    expect(FERRETERIA_REAL_CASE_E2E_PREFLIGHT.warnings.join(" ")).toMatch(/validación humana final/i);
  });
});
