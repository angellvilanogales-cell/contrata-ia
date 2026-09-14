import { describe, expect, it } from "vitest";
import { LB109_PROCEDURE_PROCESSING_SCRIPT } from "../src/interfaces/lb103/LB109ProcedureAndProcessingScript";

describe("LB109 · interfaz de procedimiento", () => {
  it("explica la magnitud legal y solicita las condiciones que cambian la propuesta", () => {
    expect(LB109_PROCEDURE_PROCESSING_SCRIPT).toContain("Los umbrales del procedimiento se calculan con el valor estimado sin IVA");
    expect(LB109_PROCEDURE_PROCESSING_SCRIPT).toContain("Junta de Andalucía");
    expect(LB109_PROCEDURE_PROCESSING_SCRIPT).toContain("Necesidad recurrente");
    expect(LB109_PROCEDURE_PROCESSING_SCRIPT).toContain("riesgo de fraccionamiento");
    expect(LB109_PROCEDURE_PROCESSING_SCRIPT).toContain("Servicio de carácter intelectual");
  });

  it("solo persiste el procedimiento tras confirmación humana", () => {
    expect(LB109_PROCEDURE_PROCESSING_SCRIPT).toContain('validate(caseId,"procedure",r.proposedProcedure)');
    expect(LB109_PROCEDURE_PROCESSING_SCRIPT).toContain('validate(caseId,"processing.processingType",r.processingType)');
    expect(LB109_PROCEDURE_PROCESSING_SCRIPT).toContain("lb109-human-validation");
    expect(LB109_PROCEDURE_PROCESSING_SCRIPT).toContain("La alegación de emergencia debe revisarse fuera de este recorrido");
  });
});
