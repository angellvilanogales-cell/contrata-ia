import { describe, expect, it } from "vitest";
import { UniversalWorksEconomicEngine } from "../src/engines/UniversalWorksEconomicEngine";

const engine = new UniversalWorksEconomicEngine();

describe("LB91.14 - economía específica de obras", () => {
  it("incorpora suministros puestos a disposición sin confundirlos con el presupuesto de obra", () => {
    const result = engine.evaluate({
      projectExecutionAmountExVatCents: 100_000_000,
      suppliesProvidedByAuthorityExVatCents: 5_000_000,
      plannedModificationAmountExVatCents: 10_000_000,
      approvedProject: true,
      measurementsAvailable: true,
    });
    expect(result.arithmeticEstimatedValueCents).toBe(115_000_000);
    expect(result.blockers).toEqual([]);
  });

  it("bloquea el cierre si faltan proyecto aprobado o mediciones", () => {
    const result = engine.evaluate({
      projectExecutionAmountExVatCents: 100_000_000,
      approvedProject: false,
      measurementsAvailable: false,
    });
    expect(result.blockers.length).toBe(2);
  });

  it("conserva un VE declarado aunque difiera del cálculo", () => {
    const result = engine.evaluate({
      projectExecutionAmountExVatCents: 100_000_000,
      declaredEstimatedValueCents: 100_000_001,
      approvedProject: true,
      measurementsAvailable: true,
    });
    expect(result.selectedEstimatedValueCents).toBe(100_000_001);
    expect(result.selectedValueOrigin).toBe("DECLARED_SOURCE");
    expect(result.diagnostics.some(item => item.includes("diferencia"))).toBe(true);
  });
});
