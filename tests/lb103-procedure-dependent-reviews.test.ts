import { describe, expect, it } from "vitest";
import { LB109_PROCEDURE_PROCESSING_SCRIPT } from "../src/interfaces/lb103/LB109ProcedureAndProcessingScript";
import { LB110_CAPACITY_SOLVENCY_SCRIPT } from "../src/interfaces/lb103/LB110CapacityAndSolvencyScript";
import { LB111_AWARD_CRITERIA_SCRIPT } from "../src/interfaces/lb103/LB111AwardCriteriaScript";
import { LB112_GUARANTEES_SCRIPT } from "../src/interfaces/lb103/LB112GuaranteesScript";

describe("revisión de consecuencias del procedimiento", () => {
  it("invalida confirmaciones posteriores al revisar una decisión previa", () => {
    for (const [step, script] of [
      [109, LB109_PROCEDURE_PROCESSING_SCRIPT],
      [110, LB110_CAPACITY_SOLVENCY_SCRIPT],
      [111, LB111_AWARD_CRITERIA_SCRIPT],
      [112, LB112_GUARANTEES_SCRIPT],
    ] as const) {
      expect(script).toContain(`for(var step=${step + 1};step<=120;step++)delete a["__lb"+step]`);
    }
    expect(LB109_PROCEDURE_PROCESSING_SCRIPT).toContain('delete a.__lb103.decisions["common:procedure"]');
  });

  it("recupera los cambios del formulario al corregir una propuesta", () => {
    for (const script of [LB110_CAPACITY_SOLVENCY_SCRIPT, LB111_AWARD_CRITERIA_SCRIPT, LB112_GUARANTEES_SCRIPT]) {
      expect(script).toContain('s.draft[el.id]=el.type==="checkbox"?el.checked:el.value');
      expect(script).toContain('if(s.draft)Object.keys(s.draft)');
    }
  });
});
