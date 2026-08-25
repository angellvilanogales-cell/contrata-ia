import { describe, expect, it } from "vitest";
import { SERVICE_REGRESSION_CASE_005_CARL_ANNEX_I_CLOSURE } from "../src/regression/ServiceRegressionCase005CarlAnnexIClosure";

describe("Paso 11.8.4 - revisión Anexo I CARL", () => {
  it("conserva solo la evidencia confirmada y mantiene abiertos los extremos no recuperados", () => {
    const c = SERVICE_REGRESSION_CASE_005_CARL_ANNEX_I_CLOSURE;

    expect(c.id).toBe("REG-SERVICE-005");
    expect(c.step).toBe("11.8.4");
    expect(c.confirmedFromSources.solvencyRequired).toBe(true);
    expect(c.confirmedFromSources.solvencyLocation).toBe("ANEXO_I_APARTADO_4");
    expect(c.confirmedFromSources.economicProposalModelPresent).toBe(true);
    expect(c.confirmedFromSources.awardCriteriaAllFormulaBased).toBe(true);
    expect(c.confirmedFromSources.awardCriteriaTotalPoints).toBe(100);
    expect(c.confirmedFromSources.economicOfferPoints).toBe(80);
    expect(c.confirmedFromSources.plannedModificationPercent).toBe(20);
    expect(c.evidencePolicy.noInferenceToFillAnnexI).toBe(true);
    expect(c.evidencePolicy.sourceTextRequiredForFreeze).toBe(true);
    expect(c.evidencePolicy.humanValidationRequired).toBe(true);
    expect(c.unresolvedBecauseExactAnnexITextNotReliablyRecovered.some((x) => x.includes("solvencia económica"))).toBe(true);
    expect(c.unresolvedBecauseExactAnnexITextNotReliablyRecovered.some((x) => x.includes("garantía definitiva"))).toBe(true);
    expect(c.unresolvedBecauseExactAnnexITextNotReliablyRecovered.some((x) => x.includes("20 puntos restantes"))).toBe(true);
    expect(c.unresolvedBecauseExactAnnexITextNotReliablyRecovered.some((x) => x.includes("DA 33"))).toBe(true);
  });
});
