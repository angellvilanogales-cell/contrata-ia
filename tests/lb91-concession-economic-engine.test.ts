import { describe, expect, it } from "vitest";
import { UniversalConcessionEconomicEngine } from "../src/engines/UniversalConcessionEconomicEngine";

const engine = new UniversalConcessionEconomicEngine();

describe("LB91.14 - economía específica de concesiones", () => {
  it("evita doble contabilización de componentes ya incluidos en cifra de negocios", () => {
    const result = engine.evaluate({
      subtype: "SERVICE_CONCESSION",
      forecastNetTurnoverExVatCents: 500_000_000,
      publicPaymentsAndAdvantages: { amountExVatCents: 100_000_000, alreadyIncludedInForecastNetTurnover: true },
      thirdPartySubsidiesAndAdvantages: { amountExVatCents: 25_000_000, alreadyIncludedInForecastNetTurnover: false },
      viabilityStudyApproved: true,
      operationalRiskTransferred: true,
    });
    expect(result.additionalComponentsExVatCents).toBe(25_000_000);
    expect(result.arithmeticEstimatedValueCents).toBe(525_000_000);
    expect(result.blockers).toEqual([]);
  });

  it("bloquea una falsa concesión sin riesgo operacional o viabilidad", () => {
    const result = engine.evaluate({
      subtype: "WORKS_CONCESSION",
      forecastNetTurnoverExVatCents: 500_000_000,
      viabilityStudyApproved: false,
      operationalRiskTransferred: false,
    });
    expect(result.blockers.length).toBe(2);
  });

  it("preserva el valor estimado declarado por fuente", () => {
    const result = engine.evaluate({
      subtype: "SERVICE_CONCESSION",
      forecastNetTurnoverExVatCents: 500_000_000,
      declaredEstimatedValueCents: 500_000_001,
      viabilityStudyApproved: true,
      operationalRiskTransferred: true,
    });
    expect(result.selectedValueOrigin).toBe("DECLARED_SOURCE");
    expect(result.selectedEstimatedValueCents).toBe(500_000_001);
    expect(result.diagnostics.some(item => item.includes("difiere"))).toBe(true);
  });
});
