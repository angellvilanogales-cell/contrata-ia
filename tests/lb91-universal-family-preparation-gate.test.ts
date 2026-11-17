import { describe, expect, it } from "vitest";
import { UniversalFamilyPreparationGate } from "../src/application/universal/UniversalFamilyPreparationGate";

const gate = new UniversalFamilyPreparationGate();

describe("LB91.13 - gate de preparación por familia", () => {
  it("no exige hechos familiares adicionales a suministro y servicio", () => {
    expect(gate.evaluate({ contractType: "SUPPLY" }).ready).toBe(true);
    expect(gate.evaluate({ contractType: "SERVICE" }).ready).toBe(true);
  });

  it("bloquea obras sin hechos específicos", () => {
    const result = gate.evaluate({ contractType: "WORKS" });
    expect(result.ready).toBe(false);
    expect(result.appliedGate).toBe("WORKS");
  });

  it("bloquea concesión sin riesgo/viabilidad", () => {
    const result = gate.evaluate({ contractType: "CONCESSION" });
    expect(result.ready).toBe(false);
    expect(result.appliedGate).toBe("CONCESSION");
  });

  it("bloquea mixto sin estructura principal", () => {
    const result = gate.evaluate({ contractType: "MIXED" });
    expect(result.ready).toBe(false);
    expect(result.appliedGate).toBe("MIXED");
  });

  it("deja pasar un mixto servicio-suministro coherente y trazable", () => {
    const result = gate.evaluate({
      contractType: "MIXED",
      mixed: {
        components: [
          { contractType: "SERVICE", estimatedValueExVatCents: 9_000_000, functionallyLinked: true, complementaryRelationship: true },
          { contractType: "SUPPLY", estimatedValueExVatCents: 1_000_000, functionallyLinked: true, complementaryRelationship: true },
        ],
      },
    });
    expect(result.ready).toBe(true);
  });
});
