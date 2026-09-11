import { describe, expect, it, vi } from "vitest";
import { EstadoExpediente } from "../src/domain/expediente/EstadoExpediente";
import { CanonicalExpedienteState } from "../src/domain/expediente/CanonicalExpedienteState";
import { EvidenceField } from "../src/domain/expediente/EvidenceField";
import { DocumentType } from "../src/domain/documentModel/DocumentType";
import { latestCandidateVersion } from "../src/domain/documentModel/EditableTemplateCandidateRegistry";
import { assessEditableTemplatePromotion } from "../src/domain/documentModel/EditableTemplatePromotionGate";
import { TipoProcedimiento } from "../src/domain/procedimiento/TipoProcedimiento";
import { renderUniversalPhysicalDocument } from "../src/application/universal/UniversalPhysicalDocumentRenderer";

function validated<T>(key: string, value: T): EvidenceField<T> {
  return { key, value, status: "HUMAN_VALIDATED", sources: [{ kind: "USER_INPUT", sourceId: "lb91-55" }], humanValidationRequired: true, humanValidated: true };
}

function supplyState(id = "REG-SUPPLY-UNIVERSAL-001"): CanonicalExpedienteState {
  return {
    id,
    lifecycleState: EstadoExpediente.PROCEDIMIENTO_VALIDADO,
    blockers: [], warnings: [],
    fields: {
      contractType: validated("contractType", "SUPPLY"),
      object: validated("object", "Suministro genérico de material administrativo"),
      cpvMain: validated("cpvMain", "30190000-7"),
      lots: validated("lots", ["Lote único"]),
      estimatedValueCents: validated("estimatedValueCents", 1000000),
      baseTenderBudgetCents: validated("baseTenderBudgetCents", 900000),
      procedure: validated("procedure", TipoProcedimiento.ABIERTO_SIMPLIFICADO_ABREVIADO),
      durationMonths: validated("durationMonths", 12),
      extensionMonths: validated("extensionMonths", 0),
      modificationPercent: validated("modificationPercent", 0),
      awardCriteria: validated("awardCriteria", ["Precio"]),
      solvency: validated("solvency", []),
      publicity: validated("publicity", "PERFIL_CONTRATANTE"),
    },
  };
}

function serviceState(): CanonicalExpedienteState {
  const state = supplyState("REG-SERVICE-EU-001");
  state.fields.contractType = validated("contractType", "SERVICE");
  state.fields.procedure = validated("procedure", TipoProcedimiento.ABIERTO_SIMPLIFICADO);
  return state;
}

describe("LB91.51-55 - biblioteca productiva universal", () => {
  it("mantiene el candidato europeo de servicios bloqueado mientras no esté aislado y verificado", () => {
    const candidate = latestCandidateVersion("SERVICE-ASA-EU-FUNDS-PCAP")!;
    expect(candidate.status).toBe("DISCOVERED");
    const assessment = assessEditableTemplatePromotion(candidate);
    expect(assessment.promotable).toBe(false);
    expect(assessment.blockers.length).toBeGreaterThanOrEqual(4);
  });

  it("exige todos los controles incluso a un candidato marcado PROMOTABLE", () => {
    const base = latestCandidateVersion("SERVICE-ASA-EU-FUNDS-PCAP")!;
    const fake = { ...base, status: "PROMOTABLE" as const };
    expect(assessEditableTemplatePromotion(fake).promotable).toBe(false);
  });

  it("renderiza un PCAP universal fuera del expediente protegido cuando existe modelo general acreditado", async () => {
    const renderer = { render: vi.fn(async ({ expedienteId, sourceId }) => ({ outputId: `${expedienteId}:${sourceId}:ODT` })) };
    const result = await renderUniversalPhysicalDocument(
      supplyState(),
      DocumentType.PCAP,
      { financing: "AUTOFINANCED", technicalFamily: "GENERAL_ADMINISTRATIVE" },
      renderer,
    );
    expect(result.status).toBe("RENDERED");
    if (result.status === "RENDERED") {
      expect(result.sourceId).toBe("JDA-SUPPLY-ASA-PCAP-GENERAL-ODT");
      expect(result.outputId).toContain("REG-SUPPLY-UNIVERSAL-001");
      expect(result.humanAcceptanceStillRequired).toBe(true);
    }
    expect(renderer.render).toHaveBeenCalledTimes(1);
  });

  it("no invoca el renderer para el PCAP europeo de servicios pendiente de aislamiento", async () => {
    const renderer = { render: vi.fn(async () => ({ outputId: "should-not-exist" })) };
    const result = await renderUniversalPhysicalDocument(
      serviceState(),
      DocumentType.PCAP,
      { financing: "EU_FUNDS", technicalFamily: "GENERAL_ADMINISTRATIVE" },
      renderer,
    );
    expect(result.status).toBe("BLOCKED");
    expect(renderer.render).not.toHaveBeenCalled();
  });

  it("no confunde el primer render universal con aceptación humana final", async () => {
    const renderer = { render: vi.fn(async () => ({ outputId: "draft-odt" })) };
    const result = await renderUniversalPhysicalDocument(
      supplyState("REG-SUPPLY-UNIVERSAL-002"), DocumentType.PCAP,
      { financing: "AUTOFINANCED", technicalFamily: "GENERAL_ADMINISTRATIVE" }, renderer,
    );
    expect(result.humanAcceptanceStillRequired).toBe(true);
  });
});
