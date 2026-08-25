import { describe, expect, it } from "vitest";
import { SERVICE_REGRESSION_CASE_005_CARL_FINE } from "../src/regression/ServiceRegressionCase005CarlFineExtraction";

describe("Paso 11.8.2 - extracción fina CARL", () => {
  it("preserva los hechos económicos y jurídicos extraídos y mantiene abiertos los campos no acreditados", () => {
    const c = SERVICE_REGRESSION_CASE_005_CARL_FINE;

    expect(c.id).toBe("REG-SERVICE-005");
    expect(c.step).toBe("11.8.2");
    expect(c.facts.legalCharacterization).toBe("CONTRATO_MIXTO_SERVICIOS_SUMINISTROS_CON_PRESTACION_PRINCIPAL_SERVICIOS");
    expect(c.facts.serviceSharePercent).toBe(90);
    expect(c.facts.supplySharePercent).toBe(10);
    expect(c.facts.lots).toBe(false);
    expect(c.facts.initialDurationMonths).toBe(12);
    expect(c.facts.extensionMonths).toBe(12);
    expect(c.facts.pblExVat).toBe(44170.33);
    expect(c.facts.vatAmount).toBe(9275.77);
    expect(c.facts.pblIncVat).toBe(53446.10);
    expect(c.facts.estimatedValueExVat).toBe(106008.80);
    expect(c.facts.plannedModificationPercent).toBe(20);
    expect(c.facts.awardCriteriaMode).toBe("MULTIPLES_SOLO_FORMULAS");
    expect(c.facts.awardCriteriaTotalPoints).toBe(100);
    expect(c.facts.economicOfferPoints).toBe(80);
    expect(c.facts.paymentMode).toBe("MENSUALIDADES_NATURALES_VENCIDAS");
    expect(c.facts.laborCostReference2025).toBe(24697.91);
    expect(c.facts.directCosts + c.facts.indirectCosts).toBe(c.facts.pblExVat);
    expect(c.sourceBoundaries.deliberatelyPending.some((x) => x.includes("20 puntos restantes"))).toBe(true);
    expect(c.sourceBoundaries.deliberatelyPending.some((x) => x.includes("DA 33"))).toBe(true);
    expect(c.humanValidationRequired).toBe(true);
  });
});
