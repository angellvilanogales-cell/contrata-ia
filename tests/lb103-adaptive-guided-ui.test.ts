import { describe, expect, it } from "vitest";
import { UNIVERSAL_GUIDED_UI_MANIFEST } from "../src/interfaces/lb103/UniversalGuidedUiManifest";
import { ADAPTIVE_PERSISTENCE_SCRIPT } from "../src/interfaces/lb7/AdaptivePersistenceScript";
import { UniversalDecisionEngine } from "../src/application/universal/UniversalDecisionEngine";

describe("LB103 · integración guiada en /adaptive", () => {
  it("deriva el manifiesto visible del mismo motor de decisiones", () => {
    const engine = new UniversalDecisionEngine();
    for (const family of ["SUPPLY", "SERVICE"] as const) {
      const expected = engine.start(family).decisions.map(item => item.definition.id);
      expect(UNIVERSAL_GUIDED_UI_MANIFEST[family].map(item => item.id)).toEqual(expected);
    }
  });

  it("mantiene la justificación de no división como decisión condicional", () => {
    const decision = UNIVERSAL_GUIDED_UI_MANIFEST.SUPPLY.find(item => item.id === "common:no-lots-justification");
    expect(decision?.activation).toEqual({ field: "dividedIntoLots", equals: false });
  });

  it("valida cada respuesta mediante la API de evidencia universal antes de promoverla", () => {
    expect(ADAPTIVE_PERSISTENCE_SCRIPT).toContain("/universal-evidence");
    expect(ADAPTIVE_PERSISTENCE_SCRIPT).toContain("/universal-evidence/validate");
    expect(ADAPTIVE_PERSISTENCE_SCRIPT).toContain("UNIVERSAL_EVIDENCE_API");
    expect(ADAPTIVE_PERSISTENCE_SCRIPT).toContain("Validar esta respuesta");
    expect(ADAPTIVE_PERSISTENCE_SCRIPT).toContain("Fundamento jurídico");
  });

  it("no confunde revisión final con producción institucional", () => {
    expect(ADAPTIVE_PERSISTENCE_SCRIPT).toContain("READY_FOR_DOCUMENT_GENERATION");
    expect(ADAPTIVE_PERSISTENCE_SCRIPT).toContain("todavía no implica generación ni producción institucional");
  });
});
