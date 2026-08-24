import { describe, expect, it } from "vitest";
import {
  FERRETERIA_MEMORY_REQUIRED_CORRECTIONS,
  FERRETERIA_MEMORY_V12_EDITABLE_SOURCE,
  FERRETERIA_MEMORY_V13_CORRECTED_CANDIDATE,
} from "../src/application/intake/lb40/FerreteriaMemoryEditableActivation";

describe("LB40 - memoria justificativa editable CONTR/2026/240267", () => {
  it("registra el ODT editable exacto con identidad y estilo verificables", () => {
    expect(FERRETERIA_MEMORY_V12_EDITABLE_SOURCE.exactEditableSourceVerified).toBe(true);
    expect(FERRETERIA_MEMORY_V12_EDITABLE_SOURCE.contentHash).toBe("sha256:36ed482048e19bc8b1f9c4fe1b8f1bd47eb81ac9e256dd4f0488e7bc97b8e4dc");
    expect(FERRETERIA_MEMORY_V12_EDITABLE_SOURCE.styleFingerprint).toBe("sha256:60bdf03935c18ee8c925e3184fc7bc864db873ffc7d32154098885b47e78448d");
  });

  it("no acepta los errores jurídicos heredados de V12", () => {
    const ids = FERRETERIA_MEMORY_REQUIRED_CORRECTIONS.map(item => item.id);
    expect(ids).toEqual(expect.arrayContaining(["estimated-value-da33", "no-new-articles", "rolece-registration", "specific-business-qualification"]));
    expect(FERRETERIA_MEMORY_REQUIRED_CORRECTIONS.find(item => item.id === "estimated-value-da33")?.requiredDecision).toMatch(/21\.793,15/);
    expect(FERRETERIA_MEMORY_REQUIRED_CORRECTIONS.find(item => item.id === "no-new-articles")?.requiredDecision).toMatch(/sin artículos nuevos/i);
    expect(FERRETERIA_MEMORY_REQUIRED_CORRECTIONS.find(item => item.id === "rolece-registration")?.requiredDecision).toMatch(/159\.4\.a/);
  });

  it("mantiene el candidato corregido pendiente de aceptación humana", () => {
    expect(FERRETERIA_MEMORY_V13_CORRECTED_CANDIDATE.generatedCandidateHash).toBe("sha256:36da0d5156e106a8e67a76cf14954b8981e98141308850ca88ea5cd5b3923486");
    expect(FERRETERIA_MEMORY_V13_CORRECTED_CANDIDATE.humanAcceptanceRequired).toBe(true);
    expect(FERRETERIA_MEMORY_V13_CORRECTED_CANDIDATE.productionReady).toBe(false);
  });
});
