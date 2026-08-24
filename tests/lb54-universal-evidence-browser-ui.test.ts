import { describe, expect, it } from "vitest";
import { UNIVERSAL_EVIDENCE_UI } from "../src/interfaces/lb53/UniversalEvidenceUi";
import { UNIVERSAL_EVIDENCE_SCRIPT } from "../src/interfaces/lb53/UniversalEvidenceScript";

describe("LB54 - UI navegador de evidencia universal", () => {
  it("expone una pantalla dedicada vinculada al expediente adaptativo", () => {
    expect(UNIVERSAL_EVIDENCE_UI).toContain("Expediente universal y evidencia");
    expect(UNIVERSAL_EVIDENCE_UI).toContain("universalCaseId");
    expect(UNIVERSAL_EVIDENCE_UI).toContain("/universal-evidence.js");
  });

  it("usa la API de manifiesto y evidencia persistida", () => {
    expect(UNIVERSAL_EVIDENCE_SCRIPT).toContain("/api/universal-ui-manifest");
    expect(UNIVERSAL_EVIDENCE_SCRIPT).toContain("/universal-evidence");
    expect(UNIVERSAL_EVIDENCE_SCRIPT).toContain("/universal-evidence/validate");
  });

  it("no obliga al operador a editar JSON para tablas estructuradas", () => {
    expect(UNIVERSAL_EVIDENCE_SCRIPT).toContain("año; importe en céntimos; aplicación presupuestaria");
    expect(UNIVERSAL_EVIDENCE_SCRIPT).toContain("concepto; unidad; precio unitario en céntimos");
    expect(UNIVERSAL_EVIDENCE_SCRIPT).toContain("nombre; ponderación; Sí/No evaluable mediante fórmula");
    expect(UNIVERSAL_EVIDENCE_UI).not.toContain("Pegue JSON");
  });

  it("distingue declaración de validación humana", () => {
    expect(UNIVERSAL_EVIDENCE_UI).toContain("SOURCE_DECLARED");
    expect(UNIVERSAL_EVIDENCE_UI).toContain("acción expresa de un perfil revisor");
    expect(UNIVERSAL_EVIDENCE_SCRIPT).toContain("Guardar declaración");
    expect(UNIVERSAL_EVIDENCE_SCRIPT).toContain("Validar");
  });
});
