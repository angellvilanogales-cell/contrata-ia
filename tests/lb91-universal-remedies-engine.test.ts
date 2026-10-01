import { describe, expect, it } from "vitest";
import { UniversalRemediesEngine } from "../src/engines/UniversalRemediesEngine";

const engine = new UniversalRemediesEngine();

describe("LB91.5 - ámbito contractual del recurso especial", () => {
  it("usa comparación estricta para suministros y servicios", () => {
    expect(engine.evaluate({ contractType: "SUPPLY", estimatedValueExVatCents: 10_000_000, contractingEntityIsContractingAuthority: true }).specialProcurementAppealContractScope).toBe(false);
    expect(engine.evaluate({ contractType: "SERVICE", estimatedValueExVatCents: 10_000_001, contractingEntityIsContractingAuthority: true }).specialProcurementAppealContractScope).toBe(true);
  });

  it("aplica el umbral de tres millones a obras y concesiones", () => {
    const works = engine.evaluate({ contractType: "WORKS", estimatedValueExVatCents: 300_000_001, contractingEntityIsContractingAuthority: true });
    const concession = engine.evaluate({ contractType: "CONCESSION", estimatedValueExVatCents: 300_000_001, contractingEntityIsContractingAuthority: true });
    expect(works.specialProcurementAppealContractScope).toBe(true);
    expect(concession.specialProcurementAppealContractScope).toBe(true);
    expect(concession.legalBasis).toContain("art. 44.1.c LCSP");
  });

  it("bloquea el umbral de un contrato mixto si falta prestación principal", () => {
    const result = engine.evaluate({ contractType: "MIXED", estimatedValueExVatCents: 20_000_000, contractingEntityIsContractingAuthority: true });
    expect(result.specialProcurementAppealContractScope).toBe("PENDING");
    expect(result.blockers.length).toBeGreaterThan(0);
  });

  it("usa la prestación principal declarada para el mixto sin heredar la accesoria", () => {
    const result = engine.evaluate({
      contractType: "MIXED",
      mixedPrincipalContractType: "SERVICE",
      estimatedValueExVatCents: 10_000_001,
      contractingEntityIsContractingAuthority: true,
    });
    expect(result.effectiveContractType).toBe("SERVICE");
    expect(result.specialProcurementAppealContractScope).toBe(true);
  });

  it("no presume poder adjudicador", () => {
    const result = engine.evaluate({ contractType: "SERVICE", estimatedValueExVatCents: 20_000_000, contractingEntityIsContractingAuthority: false });
    expect(result.specialProcurementAppealContractScope).toBe("PENDING");
  });

  it("no presume que todo acuerdo marco o SDA entra en el artículo 44.1.b", () => {
    const pending = engine.evaluate({
      contractType: "SUPPLY",
      estimatedValueExVatCents: 50_000_000,
      contractingEntityIsContractingAuthority: true,
      frameworkAgreementOrDynamicPurchasingSystem: true,
    });
    expect(pending.specialProcurementAppealContractScope).toBe("PENDING");
    expect(pending.blockers.length).toBeGreaterThan(0);

    const confirmed = engine.evaluate({
      contractType: "SUPPLY",
      estimatedValueExVatCents: 50_000_000,
      contractingEntityIsContractingAuthority: true,
      frameworkAgreementOrDynamicPurchasingSystem: true,
      frameworkOrDpsObjectFallsWithinArticle44_1a: true,
    });
    expect(confirmed.specialProcurementAppealContractScope).toBe(true);
  });
});
