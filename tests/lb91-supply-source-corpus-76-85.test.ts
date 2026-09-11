import { describe, expect, it } from "vitest";
import { DocumentType } from "../src/domain/documentModel/DocumentType";
import { assessDiscoveryCoverage } from "../src/domain/documentModel/UniversalDocumentDiscoveryEngine";
import { UNIVERSAL_SUPPLY_SOURCE_CORPUS, getSupplyCasesForDocument } from "../src/domain/documentModel/UniversalSupplySourceCorpus";
import { assessSupplyPromotionReadiness, buildSupplyStructuralCore } from "../src/domain/documentModel/UniversalSupplyPromotionReadiness";
import { buildSupplyBlockEvidenceMatrix, canPromoteSupplyPhysicalPackage } from "../src/domain/documentModel/UniversalSupplyBlockEvidenceMatrix";

describe("LB91.76-85 - corpus real Memoria/PPT de suministros", () => {
  it("reconoce múltiples expedientes independientes con Memoria y PPT", () => {
    expect(getSupplyCasesForDocument(DocumentType.MEMORY).length).toBeGreaterThanOrEqual(7);
    expect(getSupplyCasesForDocument(DocumentType.PPT).length).toBeGreaterThanOrEqual(7);
    expect(new Set(UNIVERSAL_SUPPLY_SOURCE_CORPUS.map(x => x.expediente)).size).toBeGreaterThanOrEqual(7);
  });

  it("corrige la cobertura histórica: VEIASA y SAS también aportan memoria", () => {
    const memory = assessDiscoveryCoverage("SUPPLY", DocumentType.MEMORY);
    expect(memory.independentCases).toBeGreaterThanOrEqual(7);
    expect(memory.documented).toBe(true);
  });

  it("no confunde abundancia documental con plantilla física universal", () => {
    const memory = assessSupplyPromotionReadiness(DocumentType.MEMORY);
    const ppt = assessSupplyPromotionReadiness(DocumentType.PPT);
    expect(memory.state).toBe("PHYSICAL_TEMPLATE_BLOCKED");
    expect(ppt.state).toBe("PHYSICAL_TEMPLATE_BLOCKED");
    expect(memory.independentVariants).toBeGreaterThanOrEqual(6);
    expect(ppt.independentVariants).toBeGreaterThanOrEqual(6);
    expect(canPromoteSupplyPhysicalPackage()).toBe(false);
  });

  it("separa núcleo común de overlays técnicos", () => {
    const ppt = buildSupplyStructuralCore(DocumentType.PPT);
    expect(ppt.commonBlocks).toContain("especificaciones");
    expect(ppt.variantSpecificExamples.FURNITURE_INSTALLATION).toContain("montaje");
    expect(ppt.variantSpecificExamples.SUPPLY_WITH_SERVICE_COMPONENT).toContain("protección de datos");
    expect(ppt.physicalGenerationAllowed).toBe(false);
  });

  it("consolida bloques estructurales solo como patrón, nunca como copia física", () => {
    const matrix = buildSupplyBlockEvidenceMatrix();
    expect(matrix.find(x => x.block === "ECONOMICS")?.reusableAsStructuralPattern).toBe(true);
    expect(matrix.find(x => x.block === "TECHNICAL_SPECIFICATIONS")?.reusableAsStructuralPattern).toBe(true);
    expect(matrix.every(x => x.physicalTemplateStillRequired)).toBe(true);
  });
});
