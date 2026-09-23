import { describe, expect, it } from "vitest";
import { LB113_SPECIAL_EXECUTION_SCRIPT } from "../src/interfaces/lb103/LB113SpecialExecutionScript";

describe("LB113 · interfaz", () => {
  it("presenta una propuesta organizada, editable y fundamentada", () => {
    for (const text of ["Propuesta del sistema", "Circunstancias especiales", "Condiciones propuestas y modificables", "Título comprensible", "Obligación concreta durante la ejecución", "Cómo comprobará su cumplimiento la Administración", "Documento o evidencia que deberá aportar la empresa", "Consecuencia del incumplimiento", "Abrir el artículo 202 LCSP en el BOE"]) expect(LB113_SPECIAL_EXECUTION_SCRIPT).toContain(text);
    expect(LB113_SPECIAL_EXECUTION_SCRIPT).not.toContain("columnas separadas por |");
  });

  it("traduce códigos y permite revisar las redacciones documentales", () => {
    for (const text of ["Medioambiental", "Social y laboral", "Obligación contractual esencial", "Incumplimiento grave", "Redacciones propuestas para los documentos", "lb113ReviewText", "Restaurar propuesta del sistema", "Confirmar redacciones y continuar", "Modificar condiciones"]) expect(LB113_SPECIAL_EXECUTION_SCRIPT).toContain(text);
  });

  it("persiste vínculo, control, consecuencia y subcontratistas", () => {
    for (const path of ["execution.specialExecutionConditions", "execution.specialExecutionConditionsJustification", "execution.specialExecutionConditionsVerification", "execution.specialExecutionConditionsConsequences", "execution.specialExecutionConditionsApplyToSubcontractors"]) expect(LB113_SPECIAL_EXECUTION_SCRIPT).toContain(`validate(id,"${path}"`);
    expect(LB113_SPECIAL_EXECUTION_SCRIPT).toContain("lb113-human-validation");
  });
});
