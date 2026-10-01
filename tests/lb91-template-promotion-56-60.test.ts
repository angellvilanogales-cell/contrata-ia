import { describe, expect, it } from "vitest";
import { DocumentType } from "../src/domain/documentModel/DocumentType";
import { assessUniversalTemplatePromotion, composeUniversalDocumentStructure } from "../src/domain/documentModel/UniversalTemplatePromotionEvidence";

describe("LB91.56-60 - promoción segura de Memoria/PPT", () => {
  it("no cuenta múltiples versiones del mismo expediente como contraste universal", () => {
    const result = assessUniversalTemplatePromotion("SUPPLY", DocumentType.MEMORY, "CATALOGUE_NEEDS_SUPPLY", [
      { id: "v12", contractType: "SUPPLY", documentType: DocumentType.MEMORY, technicalFamily: "CATALOGUE_NEEDS_SUPPLY", kind: "INDEPENDENT_CASE", expediente: "CONTR/2026/240267", editable: true, sourceVerified: true },
      { id: "v14", contractType: "SUPPLY", documentType: DocumentType.MEMORY, technicalFamily: "CATALOGUE_NEEDS_SUPPLY", kind: "SAME_CASE_VERSION", expediente: "CONTR/2026/240267", editable: true, sourceVerified: true },
    ]);
    expect(result.independentCases).toBe(1);
    expect(result.promotable).toBe(false);
  });

  it("exige además base editable verificada aunque existan dos casos", () => {
    const result = assessUniversalTemplatePromotion("SERVICE", DocumentType.PPT, "CLEANING", [
      { id: "carl", contractType: "SERVICE", documentType: DocumentType.PPT, technicalFamily: "CLEANING", kind: "INDEPENDENT_CASE", expediente: "ADM-2024-0004", editable: false, sourceVerified: true },
      { id: "huelva", contractType: "SERVICE", documentType: DocumentType.PPT, technicalFamily: "CLEANING", kind: "INDEPENDENT_CASE", expediente: "SAE-HUELVA", editable: false, sourceVerified: true },
    ]);
    expect(result.independentCases).toBe(2);
    expect(result.hasVerifiedEditableBase).toBe(false);
    expect(result.promotable).toBe(false);
  });

  it("solo promociona con contraste independiente y editable verificado", () => {
    const result = assessUniversalTemplatePromotion("SERVICE", DocumentType.PPT, "CLEANING", [
      { id: "carl", contractType: "SERVICE", documentType: DocumentType.PPT, technicalFamily: "CLEANING", kind: "INDEPENDENT_CASE", expediente: "ADM-2024-0004", editable: false, sourceVerified: true },
      { id: "huelva-odt", contractType: "SERVICE", documentType: DocumentType.PPT, technicalFamily: "CLEANING", kind: "INDEPENDENT_CASE", expediente: "SAE-HUELVA", editable: true, sourceVerified: true },
    ]);
    expect(result.promotable).toBe(true);
  });

  it("mantiene overlays técnicos separados del núcleo común", () => {
    const cleaning = composeUniversalDocumentStructure(DocumentType.PPT, "CLEANING");
    const maintenance = composeUniversalDocumentStructure(DocumentType.PPT, "MAINTENANCE");
    expect(cleaning.commonBlocks).toEqual(maintenance.commonBlocks);
    expect(cleaning.technicalOverlay).not.toEqual(maintenance.technicalOverlay);
    expect(maintenance.technicalOverlay).toContain("GMAO y niveles de servicio");
  });

  it("mantiene aceptación humana incluso en composición lógica", () => {
    expect(composeUniversalDocumentStructure(DocumentType.MEMORY, "GENERAL_ADMINISTRATIVE").humanValidationRequired).toBe(true);
  });
});
