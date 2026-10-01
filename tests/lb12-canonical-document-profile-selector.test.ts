import { describe, expect, it } from "vitest";
import { EstadoExpediente } from "../src/domain/expediente/EstadoExpediente";
import { CanonicalContractType, CanonicalExpedienteState } from "../src/domain/expediente/CanonicalExpedienteState";
import { EvidenceField, createPendingEvidenceField } from "../src/domain/expediente/EvidenceField";
import { DocumentType } from "../src/domain/documentModel/DocumentType";
import { createStandardContractDocumentProfiles } from "../src/domain/documentModel/StandardContractDocumentProfiles";
import { TipoProcedimiento } from "../src/domain/procedimiento/TipoProcedimiento";
import { selectCanonicalDocumentProfile } from "../src/engines/CanonicalDocumentProfileSelector";

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

function state(
  contractType: CanonicalContractType,
  procedure: TipoProcedimiento,
): CanonicalExpedienteState {
  return {
    id: "TEST-12.5",
    lifecycleState: EstadoExpediente.PROCEDIMIENTO_VALIDADO,
    blockers: [],
    warnings: [],
    fields: {
      contractType: validated("contractType", contractType),
      object: validated("object", "objeto de prueba"),
      cpvMain: validated("cpvMain", "90910000-9"),
      lots: validated("lots", ["Lote único"]),
      estimatedValueCents: validated("estimatedValueCents", 10000000),
      baseTenderBudgetCents: validated("baseTenderBudgetCents", 9000000),
      procedure: validated("procedure", procedure),
      durationMonths: validated("durationMonths", 12),
      extensionMonths: validated("extensionMonths", 0),
      modificationPercent: validated("modificationPercent", 0),
      awardCriteria: validated("awardCriteria", ["Precio"]),
      solvency: validated("solvency", ["Solvencia económica", "Solvencia técnica"]),
      publicity: validated("publicity", "PLACSP"),
    },
  };
}

describe("Bloque 12.5 - selector canónico de modelo documental", () => {
  it("selecciona el PCAP completo de servicios para procedimiento abierto", () => {
    const result = selectCanonicalDocumentProfile(
      state("SERVICE", TipoProcedimiento.ABIERTO),
      DocumentType.PCAP,
      createStandardContractDocumentProfiles(),
    );

    expect(result.status).toBe("SELECTED");
    expect(result.profile?.id).toBe("SERVICE-PCAP-OPEN-ELECTRONIC-2025-12");
    expect(result.canGenerateFullDocument).toBe(true);
  });

  it("selecciona un perfil distinto y específico para servicios por abierto simplificado ordinario", () => {
    const result = selectCanonicalDocumentProfile(
      state("SERVICE", TipoProcedimiento.ABIERTO_SIMPLIFICADO),
      DocumentType.PCAP,
      createStandardContractDocumentProfiles(),
    );

    expect(result.status).toBe("SELECTED");
    expect(result.profile?.id).toBe("SERVICE-PCAP-SIMPLIFIED-ORDINARY-CARL-2024");
    expect(result.canGenerateFullDocument).toBe(true);
  });

  it("bloquea el PCAP completo de suministros cuando no existe perfil para el procedimiento abierto solicitado", () => {
    const result = selectCanonicalDocumentProfile(
      state("SUPPLY", TipoProcedimiento.ABIERTO),
      DocumentType.PCAP,
      createStandardContractDocumentProfiles(),
    );

    expect(result.status).toBe("BLOCKED_BY_COVERAGE");
    expect(result.canGenerateFullDocument).toBe(false);
  });

  it("permite seleccionar un PPT estructural como referencia sin habilitar generación completa", () => {
    const result = selectCanonicalDocumentProfile(
      state("SERVICE", TipoProcedimiento.ABIERTO),
      DocumentType.PPT,
      createStandardContractDocumentProfiles(),
      "STRUCTURAL_MODEL",
    );

    expect(result.status).toBe("SELECTED");
    expect(result.profile?.coverage).toBe("STRUCTURAL_MODEL");
    expect(result.canGenerateFullDocument).toBe(false);
  });

  it("no selecciona ningún modelo mientras el procedimiento siga pendiente", () => {
    const pendingState = state("SERVICE", TipoProcedimiento.ABIERTO);
    pendingState.fields.procedure = createPendingEvidenceField("procedure");

    const result = selectCanonicalDocumentProfile(
      pendingState,
      DocumentType.PCAP,
      createStandardContractDocumentProfiles(),
    );

    expect(result.status).toBe("BLOCKED_BY_EVIDENCE");
    expect(result.canGenerateFullDocument).toBe(false);
  });
});
