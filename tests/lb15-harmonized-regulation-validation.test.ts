import { describe, expect, it } from "vitest";
import { validateHarmonizedRegulationProposal } from "../src/domain/legal/modules/harmonized/UniversalHarmonizedRegulationValidator";
import { UniversalHarmonizedRegulationResolver } from "../src/domain/legal/modules/harmonized/UniversalHarmonizedRegulationResolver";
import { CanonicalExpedienteState } from "../src/domain/expediente/CanonicalExpedienteState";
import { createPendingEvidenceField, EvidenceField } from "../src/domain/expediente/EvidenceField";
import { EstadoExpediente } from "../src/domain/expediente/EstadoExpediente";
import { createUniversalExpedienteFromCanonical } from "../src/domain/expediente/UniversalExpedienteV13";

function validated<T>(key: string, value: T): EvidenceField<T> {
  return { key, value, status: "HUMAN_VALIDATED", sources: [{ kind: "USER_INPUT", sourceId: "validated" }], humanValidationRequired: true, humanValidated: true };
}

function proposedExpediente() {
  const canonical: CanonicalExpedienteState = {
    id: "LB15-11", lifecycleState: EstadoExpediente.VALOR_VALIDADO, blockers: [], warnings: [],
    fields: {
      contractType: validated("contractType", "SERVICE"), object: validated("object", "Servicio"), cpvMain: validated("cpvMain", "50700000-2"), lots: validated("lots", ["Lote 1"]),
      estimatedValueCents: validated("estimatedValueCents", 182_399_114), baseTenderBudgetCents: validated("baseTenderBudgetCents", 80_000_000), procedure: validated("procedure", "ABIERTO"),
      durationMonths: validated("durationMonths", 24), extensionMonths: validated("extensionMonths", 0), modificationPercent: validated("modificationPercent", 0),
      awardCriteria: createPendingEvidenceField("awardCriteria"), solvency: createPendingEvidenceField("solvency"), publicity: createPendingEvidenceField("publicity"),
    },
  };
  const expediente = createUniversalExpedienteFromCanonical(canonical);
  expediente.economic.legalEstimatedValueCents = validated("economic.legalEstimatedValueCents", 182_399_114);
  return new UniversalHarmonizedRegulationResolver().resolve(expediente, {
    id: "FIXTURE", contractKinds: ["SERVICE"], thresholdCents: 100_000_000, sourceId: "fixture:norm", legalBasis: ["Norma de prueba"], scopeConfirmed: true, scopeDescription: "Ámbito contrastado",
  }).expediente;
}

describe("Bloque 15.11 - validación humana atómica de SARA", () => {
  it("valida conjuntamente umbral y SARA conservando valores y fuentes", () => {
    const before = proposedExpediente();
    const result = validateHarmonizedRegulationProposal(before, { validatedBy: "tester" });
    expect(result.blockers).toEqual([]);
    expect(result.validatedFields).toEqual(["regulation.threshold", "regulation.harmonizedRegulation"]);
    expect(result.expediente.regulation.threshold.status).toBe("HUMAN_VALIDATED");
    expect(result.expediente.regulation.harmonizedRegulation.status).toBe("HUMAN_VALIDATED");
    expect(result.expediente.regulation.threshold.value).toBe(before.regulation.threshold.value);
    expect(result.expediente.regulation.harmonizedRegulation.value).toBe(true);
  });

  it("rechaza validación sin identidad humana", () => {
    const result = validateHarmonizedRegulationProposal(proposedExpediente(), { validatedBy: "" });
    expect(result.validatedFields).toEqual([]);
    expect(result.blockers.join(" ")).toContain("identificarse");
  });

  it("no valida un paquete parcial", () => {
    const input = proposedExpediente();
    input.regulation.threshold = createPendingEvidenceField("regulation.threshold");
    const result = validateHarmonizedRegulationProposal(input, { validatedBy: "tester" });
    expect(result.validatedFields).toEqual([]);
    expect(result.blockers.join(" ")).toContain("conjuntamente");
  });

  it("bloquea si umbral y SARA provienen de reglas distintas", () => {
    const input = proposedExpediente();
    input.regulation.threshold = { ...input.regulation.threshold, sources: [{ kind: "NORMATIVE_RULE", sourceId: "rule:A" }] };
    input.regulation.harmonizedRegulation = { ...input.regulation.harmonizedRegulation, sources: [{ kind: "NORMATIVE_RULE", sourceId: "rule:B" }] };
    const result = validateHarmonizedRegulationProposal(input, { validatedBy: "tester" });
    expect(result.validatedFields).toEqual([]);
    expect(result.blockers.join(" ")).toContain("misma fuente normativa");
  });
});
