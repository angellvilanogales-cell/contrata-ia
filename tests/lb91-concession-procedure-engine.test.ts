import { describe, expect, it } from "vitest";
import { UniversalConcessionProcedureEngine } from "../src/engines/UniversalConcessionProcedureEngine";

const engine = new UniversalConcessionProcedureEngine();

describe("LB91.24 - procedimiento concesional", () => {
  it("acepta abierto como opción ordinaria sujeta a decisión humana", () => {
    const result = engine.evaluate({ selectedProcedure: "OPEN" });
    expect(result.valid).toBe(true);
    expect(result.humanValidationRequired).toBe(true);
  });

  it("impone restringido en concesiones de servicios especiales del Anexo IV", () => {
    const invalid = engine.evaluate({ selectedProcedure: "OPEN", serviceConcessionAnnexIVSpecialService: true });
    const valid = engine.evaluate({ selectedProcedure: "RESTRICTED", serviceConcessionAnnexIVSpecialService: true });
    expect(invalid.valid).toBe(false);
    expect(valid.valid).toBe(true);
  });

  it("no permite procedimientos excepcionales sin supuesto legal documentado", () => {
    const result = engine.evaluate({ selectedProcedure: "NEGOTIATED_WITHOUT_PUBLICITY" });
    expect(result.valid).toBe(false);
    expect(result.blockers.length).toBeGreaterThan(0);
  });

  it("admite un procedimiento excepcional solo cuando consta fundamento legal y factual", () => {
    const result = engine.evaluate({
      selectedProcedure: "TENDER_WITH_NEGOTIATION",
      exceptionalProcedureLegalGroundDocumented: true,
      exceptionalProcedureLegalGroundReference: "Supuesto del art. 167 LCSP acreditado en memoria específica",
    });
    expect(result.valid).toBe(true);
  });
});
