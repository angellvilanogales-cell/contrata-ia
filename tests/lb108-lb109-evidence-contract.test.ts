import { describe, expect, it } from "vitest";
import { UNIVERSAL_V1_UI_FIELD_MANIFEST } from "../src/application/intake/lb51/UniversalV1UiFieldManifest";
import { SUPPLY_VERTICAL_FIELD_MANIFEST } from "../src/application/intake/lb93/SupplyVerticalFieldManifest";
import { SUPPLY_ASA_PCAP_FIELD_MANIFEST } from "../src/application/intake/lb95/SupplyAsaPcapFieldManifest";
import { declareUniversalUiEvidence } from "../src/application/intake/lb53/UniversalUiEvidenceDraft";
import { LB108_ECONOMIC_STARTING_POINT_SCRIPT } from "../src/interfaces/lb103/LB108EconomicStartingPointScript";
import { LB109_PROCEDURE_PROCESSING_SCRIPT } from "../src/interfaces/lb103/LB109ProcedureAndProcessingScript";

describe("LB108/LB109 · contrato entre formularios y evidencia universal", () => {
  it("expone todos los campos que ambos pasos intentan confirmar", () => {
    const fields = new Set([...UNIVERSAL_V1_UI_FIELD_MANIFEST, ...SUPPLY_VERTICAL_FIELD_MANIFEST, ...SUPPLY_ASA_PCAP_FIELD_MANIFEST].map(field => field.fieldPath));
    const paths = [
      ...LB108_ECONOMIC_STARTING_POINT_SCRIPT.matchAll(/validateEvidence(?:Raw)?\(id,"([^"]+)"/g),
      ...LB109_PROCEDURE_PROCESSING_SCRIPT.matchAll(/validate\(caseId,"([^"]+)"/g),
    ].map(match => match[1]);
    expect(paths.length).toBeGreaterThan(20);
    expect(paths.filter(path => !fields.has(path))).toEqual([]);
  });

  it("acepta la estructura real del desglose, las metodologías y el IVA", () => {
    const examples = [
      ["economic.pblCostBreakdown", [{ concept: "Costes directos", percentage: 76, amountExVatCents: 3454546 }]],
      ["economic.valuationMethodology", ["COST_STUDY", "PRIOR_CONTRACTS"]],
      ["economic.vatPercent", 21],
      ["processing.urgency", false],
      ["regulation.harmonizedRegulation", false],
    ] as const;
    for (const [fieldPath, value] of examples) {
      expect(declareUniversalUiEvidence({ fieldPath, value }, "operator").status).toBe("SOURCE_DECLARED");
    }
  });
});
