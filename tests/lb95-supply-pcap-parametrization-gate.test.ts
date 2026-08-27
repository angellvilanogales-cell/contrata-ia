import { describe, expect, it } from "vitest";
import type { UniversalEvidenceRecord } from "../src/application/intake/lb52/UniversalEvidenceWorkspace";
import { evaluateSupplyPcapParametrizationGate } from "../src/application/intake/lb95/SupplyPcapParametrizationGate";
import { supplyAsaPcapRequiredFieldPaths } from "../src/application/intake/lb95/SupplyAsaGeneralPcapRenderer";
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

function completePcapValues(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  const values: Record<string, unknown> = {};
  for (const path of supplyAsaPcapRequiredFieldPaths()) values[path] = `validated:${path}`;
  return {
    ...values,
    contractType: "SUPPLY",
    procedure: "ABIERTO_SIMPLIFICADO_ABREVIADO",
    "economic.fundingSource": "AUTOFINANCED",
    ...overrides,
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
  it("habilita solo Supply ASA autofinanciado con revisión humana, mapping completo y activo oficial", () => {
    const result = evaluateSupplyPcapParametrizationGate(record(completePcapValues()), journey(), true);
    expect(result.ready).toBe(true);
    expect(result.templateId).toBe("JDA-PCAP-SUPPLY-ASA-AUTOFINANCED-2025-12-17");
    expect(result.requiredFieldPaths.length).toBeGreaterThan(10);
  });

  it("impide reutilizar el modelo ASA en otro procedimiento", () => {
    const result = evaluateSupplyPcapParametrizationGate(record(completePcapValues({ procedure: "ABIERTO" })), journey(), true);
    expect(result.ready).toBe(false);
    expect(result.blockers.join(" ")).toContain("exclusivamente al abierto simplificado abreviado");
  });

  it("impide usarlo con financiación distinta o revisión incompleta", () => {
    const result = evaluateSupplyPcapParametrizationGate(record(completePcapValues({ "economic.fundingSource": "EU_FUNDS" })), journey("IN_PROGRESS"), true);
    expect(result.ready).toBe(false);
    expect(result.blockers.join(" ")).toContain("autofinanciada");
    expect(result.blockers.join(" ")).toContain("validación humana");
  });

  it("bloquea si falta un campo obligatorio del mapping físico oficial", () => {
    const values = completePcapValues();
    delete values["economic.annualityBudgetRows"];
    const result = evaluateSupplyPcapParametrizationGate(record(values), journey(), true);
    expect(result.ready).toBe(false);
    expect(result.blockers).toContain("PCAP: falta economic.annualityBudgetRows.");
  });
});
