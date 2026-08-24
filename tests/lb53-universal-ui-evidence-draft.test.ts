import { describe, expect, it } from "vitest";
import { declareUniversalUiEvidence, markUniversalUiEvidenceConflict, validateUniversalUiEvidence } from "../src/application/intake/lb53/UniversalUiEvidenceDraft";

const ref = { kind: "PRIMARY_DOCUMENT" as const, sourceId: "doc:v7" };

describe("LB53 - evidencia desde UI universal", () => {
  it("registra una entrada del operador como SOURCE_DECLARED pendiente de revisión", () => {
    const field = declareUniversalUiEvidence({ fieldPath: "economic.needsBasedContractDa33", value: true, sourceId: "memoria:v13" }, "operator");
    expect(field.status).toBe("SOURCE_DECLARED");
    expect(field.humanValidated).toBe(false);
    expect(field.humanValidationRequired).toBe(true);
    expect(field.sources[0]?.sourceId).toBe("memoria:v13");
  });

  it("solo convierte la declaración en HUMAN_VALIDATED tras acción expresa del revisor", () => {
    const declared = declareUniversalUiEvidence({ fieldPath: "execution.extensionNoticeMonths", value: 2 }, "operator");
    const validated = validateUniversalUiEvidence(declared, "reviewer");
    expect(validated.status).toBe("HUMAN_VALIDATED");
    expect(validated.humanValidated).toBe(true);
    expect(validated.diagnostics?.join(" ")).toMatch(/reviewer/);
  });

  it("preserva un conflicto sin elegir automáticamente un valor", () => {
    const conflict = markUniversalUiEvidenceConflict("execution.plannedModificationRegime", ["No procede", "20 % a la baja"], [ref, { kind: "PRIMARY_DOCUMENT", sourceId: "doc:otro" }]);
    expect(conflict.status).toBe("SOURCE_CONFLICT");
    expect(conflict.value).toBeNull();
    expect(conflict.conflict?.treatment).toBe("DO_NOT_AUTO_RESOLVE");
    expect(() => validateUniversalUiEvidence(conflict, "reviewer")).toThrow(/conflicto/);
  });

  it("rechaza tipos de valor incompatibles con el control UI", () => {
    expect(() => declareUniversalUiEvidence({ fieldPath: "economic.initialVatAmountCents", value: "2216,01" }, "operator")).toThrow(/número entero/);
    expect(() => declareUniversalUiEvidence({ fieldPath: "lots.divisionIntoLots", value: "No" }, "operator")).toThrow(/booleano/);
  });

  it("no permite mutar paths que no formen parte del manifiesto universal", () => {
    expect(() => declareUniversalUiEvidence({ fieldPath: "legacy.foo", value: "x" }, "operator")).toThrow(/no expuesto/);
  });
});
