import { describe, expect, it } from "vitest";
import type { UniversalEvidenceRecord } from "../src/application/intake/lb52/UniversalEvidenceWorkspace";
import { evaluateSupplyPcapParametrizationGate } from "../src/application/intake/lb95/SupplyPcapParametrizationGate";
import type { SupplyUserJourney } from "../src/application/intake/lb95/SupplyUserJourneyCoordinator";

function record(values: Record<string, unknown>): UniversalEvidenceRecord {
  return {
    caseId: "REG-SUPPLY-LB95-PCAP-001",
    updatedAt: new Date(0).toISOString(),
    fields: Object.fromEntries(Object.entries(values).map(([key, value]) => [key, {
      key, value, status: "HUMAN_VALIDATED", sources: [{ kind: "USER_INPUT", sourceId: "test" }], humanValidationRequired: true, humanValidated: true,
    }])),
  };
}

function journey(finalStatus: "COMPLETE" | "IN_PROGRESS" = "COMPLETE"): SupplyUserJourney {
  return {
    caseId: "REG-SUPPLY-LB95-PCAP-001", family: "SUPPLY", currentStage: finalStatus === "COMPLETE" ? "DOCUMENTS" : "FINAL_REVIEW", progressPercent: finalStatus === "COMPLETE" ? 90 : 80, blockers: [], humanValidationRequired: true,
    readyForFinalReview: true, readyForDocuments: false,
    stages: [
      { id: "FINAL_REVIEW", label: "Revisión final", status: finalStatus, applicablePaths: [], completedPaths: [], blockers: [] },
      { id: "DOCUMENTS", label: "Documentos", status: "IN_PROGRESS", applicablePaths: [], completedPaths: [], blockers: [] },
    ],
  };
}

describe("LB95 Supply PCAP parametrization gate", () => {
  it("habilita solo Supply ASA autofinanciado con revisión humana y activo oficial", () => {
    const result = evaluateSupplyPcapParametrizationGate(record({ contractType: "SUPPLY", procedure: "ABIERTO_SIMPLIFICADO_ABREVIADO", "economic.fundingSource": "AUTOFINANCED" }), journey(), true);
    expect(result.ready).toBe(true);
    expect(result.templateId).toBe("JDA-PCAP-SUPPLY-ASA-AUTOFINANCED-2025-12-17");
  });

  it("impide reutilizar el modelo ASA en otro procedimiento", () => {
    const result = evaluateSupplyPcapParametrizationGate(record({ contractType: "SUPPLY", procedure: "ABIERTO", "economic.fundingSource": "AUTOFINANCED" }), journey(), true);
    expect(result.ready).toBe(false);
    expect(result.blockers.join(" ")).toContain("exclusivamente al abierto simplificado abreviado");
  });

  it("impide usarlo con financiación distinta o revisión incompleta", () => {
    const result = evaluateSupplyPcapParametrizationGate(record({ contractType: "SUPPLY", procedure: "ABIERTO_SIMPLIFICADO_ABREVIADO", "economic.fundingSource": "EU_FUNDS" }), journey("IN_PROGRESS"), true);
    expect(result.ready).toBe(false);
    expect(result.blockers.join(" ")).toContain("autofinanciada");
    expect(result.blockers.join(" ")).toContain("validación humana");
  });
});
