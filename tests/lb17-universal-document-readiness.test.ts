import { describe, expect, it } from "vitest";
import { evaluateUniversalDocumentReadiness } from "../src/application/intake/lb17/UniversalDocumentReadinessGate";
import { CanonicalExpedienteState } from "../src/domain/expediente/CanonicalExpedienteState";
import { EvidenceField, createPendingEvidenceField } from "../src/domain/expediente/EvidenceField";
import { EstadoExpediente } from "../src/domain/expediente/EstadoExpediente";
import { createUniversalExpedienteFromCanonical, UniversalExpedienteV13 } from "../src/domain/expediente/UniversalExpedienteV13";

function validated<T>(key: string, value: T): EvidenceField<T> {
  return {
    key,
    value,
    status: "HUMAN_VALIDATED",
    sources: [{ kind: "USER_INPUT", sourceId: "human" }],
    humanValidationRequired: true,
    humanValidated: true,
  };
}

function notApplicable<T>(field: EvidenceField<T>): EvidenceField<T> {
  return {
    ...field,
    value: null,
    status: "NOT_APPLICABLE",
    sources: [{ kind: "SYSTEM_PROPOSAL", sourceId: "lb17-test-fixture" }],
    humanValidationRequired: false,
    humanValidated: false,
  };
}

function base(): UniversalExpedienteV13 {
  const canonical: CanonicalExpedienteState = {
    id: "LB17",
    lifecycleState: EstadoExpediente.VALOR_VALIDADO,
    blockers: [],
    warnings: [],
    fields: {
      contractType: validated("contractType", "SERVICE"),
      object: validated("object", "Servicio"),
      cpvMain: validated("cpvMain", "50700000-2"),
      lots: validated("lots", ["Lote 1"]),
      estimatedValueCents: validated("estimatedValueCents", 182_399_114),
      baseTenderBudgetCents: validated("baseTenderBudgetCents", 82_908_688),
      procedure: validated("procedure", "ABIERTO"),
      durationMonths: validated("durationMonths", 24),
      extensionMonths: validated("extensionMonths", 24),
      modificationPercent: validated("modificationPercent", 20),
      awardCriteria: validated("awardCriteria", ["criterio validado"]),
      solvency: validated("solvency", ["solvencia validada"]),
      publicity: validated("publicity", "publicidad validada"),
    },
  };

  const e = createUniversalExpedienteFromCanonical(canonical);
  e.economic.legalEstimatedValueCents = validated("economic.legalEstimatedValueCents", 182_399_114);
  e.regulation.threshold = validated("regulation.threshold", 1_000_000);
  e.regulation.harmonizedRegulation = validated("regulation.harmonizedRegulation", true);
  e.processing.processingType = validated("processing.processingType", "ORDINARY");
  e.processing.urgency = validated("processing.urgency", false);
  e.processing.emergency = validated("processing.emergency", false);
  e.regulation.europeanFunding = validated("regulation.europeanFunding", false);
  e.regulation.deadlines = validated("regulation.deadlines", {
    ofertasDias: 30,
    adjudicacionDias: 15,
    formalizacionDias: 15,
    subsanacionDias: 3,
    recursoDias: 15,
    ejecucionDias: 0,
    justificacion: "validada",
    normativa: "validada",
    articulo: "validado",
    confidence: 100,
  });
  return e;
}

function completeNonLegalDomains(e: UniversalExpedienteV13): UniversalExpedienteV13 {
  const domains = [
    e.economic,
    e.administrative,
    e.technical,
    e.lots,
    e.guarantees,
    e.execution,
    e.criteria,
  ] as Array<Record<string, EvidenceField<unknown>>>;

  for (const domain of domains) {
    for (const [key, field] of Object.entries(domain)) {
      if (key === "legalEstimatedValueCents") continue;
      if (field.status === "PENDING") domain[key] = notApplicable(field);
    }
  }
  return e;
}

describe("Bloque 17.1 - disponibilidad documental universal", () => {
  it("bloquea la capa documental mientras LB16 no esté cerrado", () => {
    const input = base();
    input.canonical.fields.solvency = createPendingEvidenceField("solvency");

    const result = evaluateUniversalDocumentReadiness(input);

    expect(result.ready).toBe(false);
    expect(result.stage).toBe("BLOCKED_LB16");
    expect(result.blockers.join(" ")).toContain("solvency");
  });

  it("después de LB16 identifica evidencia universal pendiente sin inventarla", () => {
    const input = base();

    const result = evaluateUniversalDocumentReadiness(input);

    expect(result.ready).toBe(false);
    expect(result.stage).toBe("NEEDS_UNIVERSAL_EVIDENCE");
    expect(result.pendingFields).toContain("administrative.contractingAuthority");
    expect(result.pendingFields).toContain("technical.technicalPurpose");
    expect(result.domainCompleteness.administrative).toBe(false);
  });

  it("conserva y señala un conflicto de fuente como bloqueo documental", () => {
    const input = base();
    input.lots.maxOfferableLots = {
      key: "lots.maxOfferableLots",
      value: null,
      status: "SOURCE_CONFLICT",
      sources: [{ kind: "PRIMARY_DOCUMENT", sourceId: "pcap" }],
      humanValidationRequired: true,
      humanValidated: false,
      conflict: {
        statements: ["No existe limitación", "Máximo dos lotes"],
        treatment: "DO_NOT_AUTO_RESOLVE",
      },
    };

    const result = evaluateUniversalDocumentReadiness(input);

    expect(result.ready).toBe(false);
    expect(result.stage).toBe("NEEDS_UNIVERSAL_EVIDENCE");
    expect(result.conflictFields).toContain("lots.maxOfferableLots");
  });

  it("autoriza únicamente el mapeo documental cuando el expediente universal está completo", () => {
    const input = completeNonLegalDomains(base());

    const result = evaluateUniversalDocumentReadiness(input);

    expect(result.ready).toBe(true);
    expect(result.stage).toBe("READY_FOR_DOCUMENT_MAPPING");
    expect(result.pendingFields).toEqual([]);
    expect(result.conflictFields).toEqual([]);
    expect(Object.values(result.domainCompleteness).every(Boolean)).toBe(true);
  });
});
