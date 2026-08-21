import { describe, expect, it } from "vitest";
import { EstadoExpediente } from "../src/domain/expediente/EstadoExpediente";
import { CanonicalContractType, CanonicalExpedienteState } from "../src/domain/expediente/CanonicalExpedienteState";
import { EvidenceField, createPendingEvidenceField } from "../src/domain/expediente/EvidenceField";
import { DocumentType } from "../src/domain/documentModel/DocumentType";
import { createStandardContractDocumentProfiles } from "../src/domain/documentModel/StandardContractDocumentProfiles";
import { TipoProcedimiento } from "../src/domain/procedimiento/TipoProcedimiento";
import { evaluateCanonicalDocumentGeneration } from "../src/engines/CanonicalDocumentGenerationGate";

function validated<T>(key: string, value: T): EvidenceField<T> {
  return {
    key,
    value,
    status: "HUMAN_VALIDATED",
    sources: [{ kind: "USER_INPUT", sourceId: "test" }],
    humanValidationRequired: true,
    humanValidated: true,
  };
}

function completeState(contractType: CanonicalContractType): CanonicalExpedienteState {
  return {
    id: "TEST-GATE-12.5",
    lifecycleState: EstadoExpediente.PUBLICIDAD_VALIDADA,
    blockers: [],
    warnings: [],
    fields: {
      contractType: validated("contractType", contractType),
      object: validated("object", "objeto contractual validado"),
      cpvMain: validated("cpvMain", "90910000-9"),
      lots: validated("lots", ["Lote único"]),
      estimatedValueCents: validated("estimatedValueCents", 10000000),
      baseTenderBudgetCents: validated("baseTenderBudgetCents", 9000000),
      procedure: validated("procedure", TipoProcedimiento.ABIERTO),
      durationMonths: validated("durationMonths", 12),
      extensionMonths: validated("extensionMonths", 0),
      modificationPercent: validated("modificationPercent", 0),
      awardCriteria: validated("awardCriteria", ["Precio"]),
      solvency: validated("solvency", ["Solvencia económica", "Solvencia técnica"]),
      publicity: validated("publicity", "PLACSP"),
    },
  };
}

describe("Bloque 12.5 - puerta canónica de generación documental", () => {
  it("habilita el PCAP de servicios solo con expediente completo y perfil completo compatible", () => {
    const result = evaluateCanonicalDocumentGeneration(
      completeState("SERVICE"),
      DocumentType.PCAP,
      createStandardContractDocumentProfiles(),
    );

    expect(result.ready).toBe(true);
    expect(result.profile?.coverage).toBe("FULL_MODEL");
    expect(result.definition?.type).toBe(DocumentType.PCAP);
    expect(result.blockers).toHaveLength(0);
  });

  it("bloquea el PCAP de suministros cuando la cobertura disponible es solo Anexo I", () => {
    const result = evaluateCanonicalDocumentGeneration(
      completeState("SUPPLY"),
      DocumentType.PCAP,
      createStandardContractDocumentProfiles(),
    );

    expect(result.ready).toBe(false);
    expect(result.selection.status).toBe("BLOCKED_BY_COVERAGE");
    expect(result.definition).toBeUndefined();
  });

  it("bloquea la generación aunque exista modelo completo si queda un campo jurídico pendiente", () => {
    const incomplete = completeState("SERVICE");
    incomplete.fields.awardCriteria = createPendingEvidenceField("awardCriteria");

    const result = evaluateCanonicalDocumentGeneration(
      incomplete,
      DocumentType.PCAP,
      createStandardContractDocumentProfiles(),
    );

    expect(result.ready).toBe(false);
    expect(result.blockers.some(blocker => blocker.includes("awardCriteria"))).toBe(true);
    expect(result.definition).toBeUndefined();
  });
});
