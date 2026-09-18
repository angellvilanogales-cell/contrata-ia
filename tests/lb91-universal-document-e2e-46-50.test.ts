import { describe, expect, it } from "vitest";
import { EstadoExpediente } from "../src/domain/expediente/EstadoExpediente";
import { CanonicalExpedienteState, CanonicalContractType } from "../src/domain/expediente/CanonicalExpedienteState";
import { EvidenceField, createPendingEvidenceField } from "../src/domain/expediente/EvidenceField";
import { DocumentType } from "../src/domain/documentModel/DocumentType";
import { TipoProcedimiento } from "../src/domain/procedimiento/TipoProcedimiento";
import { selectDocumentFromCanonicalExpediente } from "../src/application/universal/CanonicalUniversalDocumentSelector";
import { UniversalDocumentAdaptivePreparation } from "../src/application/universal/UniversalDocumentAdaptivePreparation";
import { evaluateUniversalAdministrativePackagePreflight } from "../src/application/universal/UniversalDocumentGenerationPreflight";

function validated<T>(key: string, value: T): EvidenceField<T> {
  return {
    key,
    value,
    status: "HUMAN_VALIDATED",
    sources: [{ kind: "USER_INPUT", sourceId: "lb91-e2e" }],
    humanValidationRequired: true,
    humanValidated: true,
  };
}

function state(contractType: CanonicalContractType, procedure: TipoProcedimiento): CanonicalExpedienteState {
  return {
    id: "LB91-E2E",
    lifecycleState: EstadoExpediente.PROCEDIMIENTO_VALIDADO,
    blockers: [],
    warnings: [],
    fields: {
      contractType: validated("contractType", contractType),
      object: validated("object", "Objeto de prueba documental"),
      cpvMain: validated("cpvMain", "44316400-2"),
      lots: validated("lots", ["Lote único"]),
      estimatedValueCents: validated("estimatedValueCents", 1000000),
      baseTenderBudgetCents: validated("baseTenderBudgetCents", 900000),
      procedure: validated("procedure", procedure),
      durationMonths: validated("durationMonths", 12),
      extensionMonths: validated("extensionMonths", 0),
      modificationPercent: validated("modificationPercent", 0),
      awardCriteria: validated("awardCriteria", ["Precio"]),
      solvency: validated("solvency", []),
      publicity: validated("publicity", "PERFIL_CONTRATANTE"),
    },
  };
}

describe("LB91.46-50 - selección documental canónica y E2E físico", () => {
  it("selecciona desde expediente canónico el PCAP general supply ASA autofinanciado", () => {
    const result = selectDocumentFromCanonicalExpediente(
      state("SUPPLY", TipoProcedimiento.ABIERTO_SIMPLIFICADO_ABREVIADO),
      DocumentType.PCAP,
      { financing: "AUTOFINANCED", technicalFamily: "GENERAL_ADMINISTRATIVE" },
    );
    expect(result.readyForSelection).toBe(true);
    expect(result.selection?.status).toBe("GENERAL_EDITABLE_SELECTED");
    expect(result.selection?.selected?.id).toBe("JDA-SUPPLY-ASA-PCAP-GENERAL-ODT");
  });

  it("no selecciona desde evidencia procedimental pendiente", () => {
    const pending = state("SUPPLY", TipoProcedimiento.ABIERTO_SIMPLIFICADO_ABREVIADO);
    pending.fields.procedure = createPendingEvidenceField("procedure");
    const result = selectDocumentFromCanonicalExpediente(pending, DocumentType.PCAP, {
      financing: "AUTOFINANCED",
      technicalFamily: "GENERAL_ADMINISTRATIVE",
    });
    expect(result.readyForSelection).toBe(false);
    expect(result.selection).toBeUndefined();
  });

  it("pregunta financiación sin inferirla y fija familia administrativa del PCAP", () => {
    const flow = new UniversalDocumentAdaptivePreparation();
    const initial = flow.start("SERVICE", DocumentType.PCAP);
    expect(initial.technicalFamily).toBe("GENERAL_ADMINISTRATIVE");
    const first = flow.assess(initial);
    expect(first.next?.field).toBe("financing");
    const answered = flow.applyAnswer(initial, "financing", "EU_FUNDS");
    const closed = flow.assess(answered);
    expect(closed.complete).toBe(true);
    expect(closed.context).toEqual({ financing: "EU_FUNDS", technicalFamily: "GENERAL_ADMINISTRATIVE" });
  });

  it("pregunta la subfamilia del PPT de servicios para no mezclar limpieza y formación", () => {
    const flow = new UniversalDocumentAdaptivePreparation();
    let current = flow.start("SERVICE", DocumentType.PPT);
    current = flow.applyAnswer(current, "financing", "UNKNOWN");
    expect(flow.assess(current).next?.field).toBe("technicalFamily");
    current = flow.applyAnswer(current, "technicalFamily", "CLEANING");
    expect(flow.assess(current).complete).toBe(true);
  });

  it("E2E supply permite render del PCAP pero bloquea paquete mientras Memoria/PPT sean solo activos de caso", () => {
    const result = evaluateUniversalAdministrativePackagePreflight(
      state("SUPPLY", TipoProcedimiento.ABIERTO_SIMPLIFICADO_ABREVIADO),
      {
        financing: "AUTOFINANCED",
        technicalFamilyByDocument: {
          [DocumentType.PCAP]: "GENERAL_ADMINISTRATIVE",
          [DocumentType.MEMORY]: "CATALOGUE_NEEDS_SUPPLY",
          [DocumentType.PPT]: "CATALOGUE_NEEDS_SUPPLY",
        },
      },
    );
    expect(result.packageReady).toBe(false);
    expect(result.documents.find(item => item.documentType === DocumentType.PCAP)?.decision).toBe("RENDER_ALLOWED");
    expect(result.documents.find(item => item.documentType === DocumentType.MEMORY)?.decision).toBe("BLOCKED");
    expect(result.documents.find(item => item.documentType === DocumentType.PPT)?.decision).toBe("BLOCKED");
    expect(result.humanAcceptanceStillRequired).toBe(true);
  });

  it("E2E servicios con fondos europeos bloquea PCAP mientras el ODT siga pendiente de aislamiento", () => {
    const result = evaluateUniversalAdministrativePackagePreflight(
      state("SERVICE", TipoProcedimiento.ABIERTO_SIMPLIFICADO),
      {
        financing: "EU_FUNDS",
        technicalFamilyByDocument: {
          [DocumentType.PCAP]: "GENERAL_ADMINISTRATIVE",
          [DocumentType.MEMORY]: "CLEANING",
          [DocumentType.PPT]: "CLEANING",
        },
      },
    );
    const pcap = result.documents.find(item => item.documentType === DocumentType.PCAP);
    expect(pcap?.decision).toBe("BLOCKED");
    expect(pcap?.selectedSourceId).toBe("SERVICE-ASA-EU-FUNDS-ODT-ISOLATION-PENDING");
    expect(result.packageReady).toBe(false);
  });
});
