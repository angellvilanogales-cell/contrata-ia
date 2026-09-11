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
    expect(decision?.evidenceFieldPath).toBe("lots.noDivisionJustification");
  });

  it("enlaza las decisiones con EvidenceField canónicos ya expuestos por la UI universal", () => {
    const supply = Object.fromEntries(UNIVERSAL_GUIDED_UI_MANIFEST.SUPPLY.map(item => [item.id, item]));
    expect(supply["common:object"].evidenceFieldPath).toBe("object");
    expect(supply["common:cpv"].evidenceFieldPath).toBe("cpvMain");
    expect(supply["common:lots"].evidenceFieldPath).toBe("lots.divisionIntoLots");
    expect(supply["common:procedure"].evidenceFieldPath).toBe("procedure");
    expect(supply["common:financing-profile"].evidenceFieldPath).toBe("economic.fundingSource");
    expect(supply["supply:pbl"].evidenceFieldPath).toBe("baseTenderBudgetCents");
    expect(supply["supply:estimated-value"].evidenceFieldPath).toBe("economic.legalEstimatedValueCents");
    expect(supply["supply:delivery-mode"].evidenceFieldPath).toBe("economic.needsBasedContractDa33");
    expect(supply["supply:delivery-mode"].evidenceTransform).toBe("DELIVERY_MODE_TO_DA33_BOOLEAN");
  });

  it("valida el tipo contractual antes de iniciar y cada respuesta mediante evidencia universal", () => {
    expect(ADAPTIVE_PERSISTENCE_SCRIPT).toContain('evidence(caseId,"contractType",t,"ui:lb103:contract-type")');
    expect(ADAPTIVE_PERSISTENCE_SCRIPT).toContain("/universal-evidence");
    expect(ADAPTIVE_PERSISTENCE_SCRIPT).toContain("/universal-evidence/validate");
    expect(ADAPTIVE_PERSISTENCE_SCRIPT).toContain("UNIVERSAL_EVIDENCE_API");
    expect(ADAPTIVE_PERSISTENCE_SCRIPT).toContain("ui:lb103:");
    expect(ADAPTIVE_PERSISTENCE_SCRIPT).toContain("Validar esta respuesta");
    expect(ADAPTIVE_PERSISTENCE_SCRIPT).toContain("Fundamento jurídico");
  });

  it("ofrece opciones cerradas para procedimiento y perfil de financiación", () => {
    expect(ADAPTIVE_PERSISTENCE_SCRIPT).toContain("ABIERTO_SIMPLIFICADO_ORDINARIO");
    expect(ADAPTIVE_PERSISTENCE_SCRIPT).toContain("ABIERTO_SIMPLIFICADO_ABREVIADO");
    expect(ADAPTIVE_PERSISTENCE_SCRIPT).toContain("AUTOFINANCED");
    expect(ADAPTIVE_PERSISTENCE_SCRIPT).toContain("EU_FUNDS");
    expect(ADAPTIVE_PERSISTENCE_SCRIPT).toContain("selección del modelo documental permanecerá bloqueada");
  });

  it("ejecuta el preflight en servidor y presenta SHA, modelos y bloqueos", () => {
    expect(ADAPTIVE_PERSISTENCE_SCRIPT).toContain("/lb103-preflight");
    expect(ADAPTIVE_PERSISTENCE_SCRIPT).toContain("Construir snapshot y comprobar modelos");
    expect(ADAPTIVE_PERSISTENCE_SCRIPT).toContain("Snapshot canónico validado");
    expect(ADAPTIVE_PERSISTENCE_SCRIPT).toContain("SHA-256");
    expect(ADAPTIVE_PERSISTENCE_SCRIPT).toContain("Selección documental");
  });

  it("no confunde revisión final con producción institucional", () => {
    expect(ADAPTIVE_PERSISTENCE_SCRIPT).toContain("READY_FOR_DOCUMENT_GENERATION");
    expect(ADAPTIVE_PERSISTENCE_SCRIPT).toContain("todavía no implica generación ni producción institucional");
  });
});
