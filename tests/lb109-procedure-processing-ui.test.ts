import { describe, expect, it } from "vitest";
import { LB109_PROCEDURE_PROCESSING_SCRIPT } from "../src/interfaces/lb103/LB109ProcedureAndProcessingScript";
import { LB110_CAPACITY_SOLVENCY_SCRIPT } from "../src/interfaces/lb103/LB110CapacityAndSolvencyScript";
import { LB111_AWARD_CRITERIA_SCRIPT } from "../src/interfaces/lb103/LB111AwardCriteriaScript";
import { LB112_GUARANTEES_SCRIPT } from "../src/interfaces/lb103/LB112GuaranteesScript";

describe("LB109 · interfaz de procedimiento", () => {
  it("explica la magnitud legal y solicita las condiciones que cambian la propuesta", () => {
    expect(LB109_PROCEDURE_PROCESSING_SCRIPT).toContain("Los umbrales del procedimiento se calculan con el valor estimado sin IVA");
    expect(LB109_PROCEDURE_PROCESSING_SCRIPT).toContain("Junta de Andalucía");
    expect(LB109_PROCEDURE_PROCESSING_SCRIPT).toContain("Necesidad recurrente");
    expect(LB109_PROCEDURE_PROCESSING_SCRIPT).toContain("Fraccionamiento");
    expect(LB109_PROCEDURE_PROCESSING_SCRIPT).toContain("carácter intelectual");
    expect(LB109_PROCEDURE_PROCESSING_SCRIPT).toContain('value="unknown"');
    expect(LB109_PROCEDURE_PROCESSING_SCRIPT).toContain('answer==="unknown"');
    expect(LB109_PROCEDURE_PROCESSING_SCRIPT).toContain('v.legalEstimatedValueCents<1500000');
  });

  it("solo persiste el procedimiento tras confirmación humana", () => {
    expect(LB109_PROCEDURE_PROCESSING_SCRIPT).toContain('validate(caseId,"procedure",selected,reason?');
    expect(LB109_PROCEDURE_PROCESSING_SCRIPT).toContain('s.selectedProcedure=selected');
    expect(LB109_PROCEDURE_PROCESSING_SCRIPT).toContain('a.procedure=selected');
    expect(LB109_PROCEDURE_PROCESSING_SCRIPT).toContain('lb109ChoiceReason');
    expect(LB109_PROCEDURE_PROCESSING_SCRIPT).toContain('validate(caseId,"processing.processingType",r.processingType)');
    expect(LB109_PROCEDURE_PROCESSING_SCRIPT).toContain("lb109-human-validation");
    expect(LB109_PROCEDURE_PROCESSING_SCRIPT).toContain("La alegación de emergencia debe revisarse fuera de este recorrido");
  });

  it("conserva la elección motivada en los bloques posteriores", () => {
    for (const script of [LB109_PROCEDURE_PROCESSING_SCRIPT, LB110_CAPACITY_SOLVENCY_SCRIPT, LB111_AWARD_CRITERIA_SCRIPT, LB112_GUARANTEES_SCRIPT]) {
      expect(() => new Function(script)).not.toThrow();
    }
    expect(LB109_PROCEDURE_PROCESSING_SCRIPT).toContain('reason.length<15');
    for (const script of [LB110_CAPACITY_SOLVENCY_SCRIPT, LB111_AWARD_CRITERIA_SCRIPT, LB112_GUARANTEES_SCRIPT]) {
      expect(script).toContain('selectedProcedure||');
    }
  });
});
