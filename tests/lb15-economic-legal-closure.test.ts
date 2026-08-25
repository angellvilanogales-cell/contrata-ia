import { describe, expect, it } from "vitest";
import { evaluateEconomicLegalClosure } from "../src/application/intake/lb15/UniversalEconomicLegalClosureGate";
import { CanonicalExpedienteState } from "../src/domain/expediente/CanonicalExpedienteState";
import { createPendingEvidenceField, EvidenceField } from "../src/domain/expediente/EvidenceField";
import { EstadoExpediente } from "../src/domain/expediente/EstadoExpediente";
import { createUniversalExpedienteFromCanonical } from "../src/domain/expediente/UniversalExpedienteV13";

function validated<T>(key: string, value: T): EvidenceField<T> {
  return { key, value, status: "HUMAN_VALIDATED", sources: [{ kind: "USER_INPUT", sourceId: "validation" }], humanValidationRequired: true, humanValidated: true };
}

function closedCandidate() {
  const canonical: CanonicalExpedienteState = {
    id: "LB15-12", lifecycleState: EstadoExpediente.VALOR_VALIDADO, blockers: [], warnings: [],
    fields: {
      contractType: validated("contractType", "SERVICE"), object: validated("object", "Servicio"), cpvMain: validated("cpvMain", "50700000-2"), lots: validated("lots", ["Lote 1"]),
      estimatedValueCents: validated("estimatedValueCents", 182_399_114), baseTenderBudgetCents: validated("baseTenderBudgetCents", 80_000_000), procedure: validated("procedure", "ABIERTO"),
      durationMonths: validated("durationMonths", 24), extensionMonths: validated("extensionMonths", 24), modificationPercent: validated("modificationPercent", 20),
      awardCriteria: createPendingEvidenceField("awardCriteria"), solvency: createPendingEvidenceField("solvency"), publicity: createPendingEvidenceField("publicity"),
    },
  };
  const expediente = createUniversalExpedienteFromCanonical(canonical);
  expediente.economic.legalEstimatedValueCents = validated("economic.legalEstimatedValueCents", 182_399_114);
  expediente.regulation.threshold = validated("regulation.threshold", 1_000_000);
  expediente.regulation.harmonizedRegulation = validated("regulation.harmonizedRegulation", true);
  return expediente;
}

describe("Bloque 15.12 - cierre económico-jurídico", () => {
  it("cierra el tramo cuando naturaleza, VE, procedimiento y SARA son promocionables", () => {
    const result = evaluateEconomicLegalClosure(closedCandidate());
    expect(result.ready).toBe(true);
    expect(result.blockers).toEqual([]);
    expect(result.confirmed).toContain("economic.legalEstimatedValueCents");
    expect(result.confirmed).toContain("regulation.harmonizedRegulation");
  });

  it("no exige dominios ajenos al tramo económico-jurídico", () => {
    const input = closedCandidate();
    expect(input.criteria.awardCriteria.status).toBe("PENDING");
    expect(input.administrative.contractingAuthority.status).toBe("PENDING");
    expect(evaluateEconomicLegalClosure(input).ready).toBe(true);
  });

  it("bloquea si el procedimiento sigue como propuesta sin validación", () => {
    const input = closedCandidate();
    input.canonical.fields.procedure = { ...input.canonical.fields.procedure, status: "SYSTEM_PROPOSAL", humanValidated: false };
    const result = evaluateEconomicLegalClosure(input);
    expect(result.ready).toBe(false);
    expect(result.blockers.join(" ")).toContain("Procedimiento");
  });

  it("bloquea divergencia entre las dos vistas del VE", () => {
    const input = closedCandidate();
    input.economic.legalEstimatedValueCents = validated("economic.legalEstimatedValueCents", 182_399_116);
    const result = evaluateEconomicLegalClosure(input);
    expect(result.ready).toBe(false);
    expect(result.blockers.join(" ")).toContain("no coinciden");
  });

  it("preserva y bloquea conflictos SARA", () => {
    const input = closedCandidate();
    input.regulation.harmonizedRegulation = {
      key: "regulation.harmonizedRegulation", value: null, status: "SOURCE_CONFLICT",
      sources: [{ kind: "PRIMARY_DOCUMENT", sourceId: "A" }, { kind: "PRIMARY_DOCUMENT", sourceId: "B" }],
      humanValidationRequired: true, humanValidated: false,
      conflict: { statements: ["SARA", "NO SARA"], treatment: "DO_NOT_AUTO_RESOLVE" },
    };
    const result = evaluateEconomicLegalClosure(input);
    expect(result.ready).toBe(false);
    expect(result.blockers.join(" ")).toContain("conflicto de fuente");
  });
});
