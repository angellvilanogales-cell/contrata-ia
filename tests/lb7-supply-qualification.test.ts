import { describe, expect, it } from "vitest";
import { SUPPLY_QUALIFICATION_SCRIPT } from "../src/interfaces/lb7/SupplyQualificationScript";
import { ADAPTIVE_FLOW_UI } from "../src/interfaces/lb7/AdaptiveFlowUi";

describe("LB-7 supply qualification branch", () => {
  it("asks user-friendly capability, guarantee and execution questions", () => {
    expect(SUPPLY_QUALIFICATION_SCRIPT).toContain("¿Para ejecutar correctamente este suministro necesita exigir a la empresa alguna capacidad o experiencia específica");
    expect(SUPPLY_QUALIFICATION_SCRIPT).toContain("No, es un suministro ordinario de mercado");
    expect(SUPPLY_QUALIFICATION_SCRIPT).toContain("¿Existe algún riesgo de ejecución que aconseje exigir una garantía específica adicional?");
    expect(SUPPLY_QUALIFICATION_SCRIPT).toContain("¿Qué tipo de condición especial de ejecución encaja mejor con este suministro?");
  });

  it("keeps unknown answers provisional instead of inventing facts", () => {
    expect(SUPPLY_QUALIFICATION_SCRIPT).toContain("No lo sé todavía");
    expect(SUPPLY_QUALIFICATION_SCRIPT).toContain("La solvencia queda provisionalmente pendiente");
    expect(SUPPLY_QUALIFICATION_SCRIPT).toContain("PENDING_VALIDATION");
  });

  it("requires human validation and current-law verification before documents", () => {
    expect(SUPPLY_QUALIFICATION_SCRIPT).toContain("validación humana y verificación normativa vigente");
    expect(ADAPTIVE_FLOW_UI).toContain('/supply-qualification.js');
  });
});
