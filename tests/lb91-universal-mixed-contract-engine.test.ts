import { describe, expect, it } from "vitest";
import { UniversalMixedContractEngine } from "../src/engines/UniversalMixedContractEngine";

const engine = new UniversalMixedContractEngine();

describe("LB91.12 - contrato mixto universal", () => {
  it("deriva servicio como principal cuando su VE es mayor que el suministro", () => {
    const result = engine.evaluate({
      components: [
        { contractType: "SERVICE", estimatedValueExVatCents: 9_000_000, functionallyLinked: true, complementaryRelationship: true },
        { contractType: "SUPPLY", estimatedValueExVatCents: 1_000_000, functionallyLinked: true, complementaryRelationship: true },
      ],
    });
    expect(result.mixedContractSupported).toBe(true);
    expect(result.principalContractType).toBe("SERVICE");
  });

  it("bloquea contradicción entre principal declarado y mayor VE suministro-servicio", () => {
    const result = engine.evaluate({
      declaredPrincipalContractType: "SUPPLY",
      components: [
        { contractType: "SERVICE", estimatedValueExVatCents: 9_000_000, functionallyLinked: true, complementaryRelationship: true },
        { contractType: "SUPPLY", estimatedValueExVatCents: 1_000_000, functionallyLinked: true, complementaryRelationship: true },
      ],
    });
    expect(result.mixedContractSupported).toBe(false);
    expect(result.blockers.some(item => item.includes("contradice"))).toBe(true);
  });

  it("no fabrica principal cuando faltan valores separados", () => {
    const result = engine.evaluate({
      components: [
        { contractType: "SERVICE", functionallyLinked: true, complementaryRelationship: true },
        { contractType: "SUPPLY", functionallyLinked: true, complementaryRelationship: true },
      ],
    });
    expect(result.principalContractType).toBeUndefined();
    expect(result.mixedContractSupported).toBe(false);
  });

  it("bloquea prestaciones no vinculadas y complementarias", () => {
    const result = engine.evaluate({
      declaredPrincipalContractType: "SERVICE",
      components: [
        { contractType: "SERVICE", functionallyLinked: true, complementaryRelationship: true },
        { contractType: "SUPPLY", functionallyLinked: false, complementaryRelationship: false },
      ],
    });
    expect(result.mixedContractSupported).toBe(false);
  });
});
