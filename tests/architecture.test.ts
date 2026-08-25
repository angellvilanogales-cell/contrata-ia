import { describe, expect, it } from "vitest";
import { getCanonicalArchitecture, getCanonicalComponent } from "../src/architecture";

describe("Canonical architecture", () => {
  it("registers one unique provider per responsibility", () => {
    const architecture = getCanonicalArchitecture();
    const ids = architecture.components.map(component => component.id);
    const paths = architecture.components.map(component => component.canonicalPath);

    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(paths).size).toBe(paths.length);
    expect(ids).toEqual([
      "configuration",
      "events",
      "rules",
      "inference",
      "knowledge",
      "legalReasoning",
      "cpv",
      "procedure",
      "expediente",
      "documents",
      "export",
      "ai"
    ]);
  });

  it("keeps legacy providers outside the canonical selection", () => {
    for (const component of getCanonicalArchitecture().components) {
      expect(component.legacyPaths).not.toContain(component.canonicalPath);
    }
  });

  it("resolves the selected rule engine deterministically", () => {
    expect(getCanonicalComponent("rules").canonicalPath).toBe("src/domain/rules/RuleEngine.ts");
  });

  it("declares UniversalExpedienteV13 as the only canonical expediente provider", () => {
    const expediente = getCanonicalComponent("expediente");
    expect(expediente.contract).toBe("UniversalExpedienteV13");
    expect(expediente.canonicalPath).toBe("src/domain/expediente/UniversalExpedienteV13.ts");
    expect(expediente.legacyPaths).toContain("src/domain/expediente/CanonicalExpedienteState.ts");
    expect(expediente.legacyPaths).toContain("src/domain/expediente/Expediente.ts");
    expect(expediente.legacyPaths).toContain("src/domain/expediente/ExpedienteContext.ts");
  });
});
