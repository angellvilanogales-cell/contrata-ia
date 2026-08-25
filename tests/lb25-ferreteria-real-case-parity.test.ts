import { describe, expect, it } from "vitest";
import {
  evaluateFerreteriaRealCaseAcceptance,
  FERRETERIA_REAL_CASE_EXPECTED,
} from "../src/application/intake/lb25/FerreteriaRealCaseAcceptanceProfile";

describe("LB25 - aceptación real CONTR/2026/240267", () => {
  it("acepta únicamente la paridad factual y jurídica validada", () => {
    const result = evaluateFerreteriaRealCaseAcceptance(FERRETERIA_REAL_CASE_EXPECTED);
    expect(result.ready).toBe(true);
    expect(result.blockers).toEqual([]);
    expect(result.warnings.join(" ")).toMatch(/servicios.*no se usa para alterar la tipología/i);
  });

  it("rechaza inventar división o lote en un expediente sin lotes", () => {
    const result = evaluateFerreteriaRealCaseAcceptance({ ...FERRETERIA_REAL_CASE_EXPECTED, divisionIntoLots: true });
    expect(result.ready).toBe(false);
    expect(result.blockers.join(" ")).toMatch(/no existe división en lotes/i);
  });

  it("rechaza que las prórrogas incrementen automáticamente el presupuesto máximo DA 33ª", () => {
    const result = evaluateFerreteriaRealCaseAcceptance({ ...FERRETERIA_REAL_CASE_EXPECTED, budgetCoversEntireContractLife: false });
    expect(result.ready).toBe(false);
    expect(result.blockers.join(" ")).toMatch(/toda la vigencia.*prórrogas/i);
  });

  it("rechaza el criterio único precio si falta su motivación específica", () => {
    const result = evaluateFerreteriaRealCaseAcceptance({ ...FERRETERIA_REAL_CASE_EXPECTED, singleCriterionSpecialMotivationPresent: false });
    expect(result.ready).toBe(false);
    expect(result.blockers.join(" ")).toMatch(/motivación específica/i);
  });

  it("rechaza reintroducir artículos nuevos indeterminados como causa de modificación", () => {
    const result = evaluateFerreteriaRealCaseAcceptance({ ...FERRETERIA_REAL_CASE_EXPECTED, includesIndeterminateNewArticlesModificationCause: true });
    expect(result.ready).toBe(false);
    expect(result.blockers.join(" ")).toMatch(/artículos no contemplados.*precio unitario/i);
  });

  it("rechaza alterar el valor estimado o el límite de modificación", () => {
    const ve = evaluateFerreteriaRealCaseAcceptance({ ...FERRETERIA_REAL_CASE_EXPECTED, legalEstimatedValueCents: 2_179_316 });
    const modification = evaluateFerreteriaRealCaseAcceptance({ ...FERRETERIA_REAL_CASE_EXPECTED, modificationPercent: 10 });
    expect(ve.ready).toBe(false);
    expect(ve.blockers.join(" ")).toMatch(/21\.793,15/);
    expect(modification.ready).toBe(false);
    expect(modification.blockers.join(" ")).toMatch(/20 %/);
  });
});
