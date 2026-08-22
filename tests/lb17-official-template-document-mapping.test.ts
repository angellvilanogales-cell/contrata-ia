import { describe, expect, it } from "vitest";
import {
  UniversalOfficialTemplateCatalog,
  UniversalOfficialTemplateDescriptor,
} from "../src/application/intake/lb17/UniversalOfficialTemplateCatalog";
import {
  buildUniversalDocumentMappingPackage,
  evaluateUniversalDocumentMappingClosure,
  UniversalDocumentMappingSpec,
} from "../src/application/intake/lb17/UniversalDocumentMappingPackage";
import { CanonicalExpedienteState } from "../src/domain/expediente/CanonicalExpedienteState";
import { EvidenceField } from "../src/domain/expediente/EvidenceField";
import { EstadoExpediente } from "../src/domain/expediente/EstadoExpediente";
import { createUniversalExpedienteFromCanonical, UniversalExpedienteV13 } from "../src/domain/expediente/UniversalExpedienteV13";

function validated<T>(key: string, value: T, sourceId = "human"): EvidenceField<T> {
  return {
    key,
    value,
    status: "HUMAN_VALIDATED",
    sources: [{ kind: "USER_INPUT", sourceId }],
    humanValidationRequired: true,
    humanValidated: true,
  };
}

function notApplicable<T>(field: EvidenceField<T>): EvidenceField<T> {
  return {
    ...field,
    value: null,
    status: "NOT_APPLICABLE",
    sources: [{ kind: "SYSTEM_PROPOSAL", sourceId: "lb17-fixture" }],
    humanValidationRequired: false,
    humanValidated: false,
  };
}

function completeExpediente(): UniversalExpedienteV13 {
  const canonical: CanonicalExpedienteState = {
    id: "LB17-MAPPING",
    lifecycleState: EstadoExpediente.VALOR_VALIDADO,
    blockers: [],
    warnings: [],
    fields: {
      contractType: validated("contractType", "SERVICE"),
      object: validated("object", "Servicio de mantenimiento"),
      cpvMain: validated("cpvMain", "50700000-2"),
      lots: validated("lots", ["Lote 1"]),
      estimatedValueCents: {
        ...validated("estimatedValueCents", 182_399_114, "pcap-source"),
        legalBasis: ["LCSP:art.101"],
      },
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

  const domains = [e.economic, e.administrative, e.technical, e.lots, e.guarantees, e.execution, e.criteria] as Array<Record<string, EvidenceField<unknown>>>;
  for (const domain of domains) {
    for (const [key, field] of Object.entries(domain)) {
      if (key === "legalEstimatedValueCents") continue;
      if (field.status === "PENDING") domain[key] = notApplicable(field);
    }
  }
  return e;
}

const serviceTemplates: UniversalOfficialTemplateDescriptor[] = [
  { templateId: "service-memoria-v1", sourceId: "official-service-memoria", contractType: "SERVICE", documentKind: "MEMORIA", official: true },
  { templateId: "service-dpcaf-v1", sourceId: "official-service-dpcaf", contractType: "SERVICE", documentKind: "DPCAF", official: true },
  { templateId: "service-pcap-v1", sourceId: "official-service-pcap", contractType: "SERVICE", documentKind: "PCAP", official: true },
  { templateId: "service-ppt-v1", sourceId: "official-service-ppt", contractType: "SERVICE", documentKind: "PPT", official: true },
];

const specs: UniversalDocumentMappingSpec[] = [
  { documentKind: "MEMORIA", templateId: "service-memoria-v1", slots: [{ slotId: "objeto", fieldKey: "object", required: true }] },
  { documentKind: "DPCAF", templateId: "service-dpcaf-v1", slots: [{ slotId: "valor-estimado", fieldKey: "estimatedValueCents", required: true }] },
  { documentKind: "PCAP", templateId: "service-pcap-v1", slots: [{ slotId: "procedimiento", fieldKey: "procedure", required: true }] },
  { documentKind: "PPT", templateId: "service-ppt-v1", slots: [{ slotId: "cpv", fieldKey: "cpvMain", required: true }] },
];

describe("Bloque 17.2-17.5 - modelos oficiales y mapeo documental", () => {
  it("17.2 selecciona exclusivamente modelos oficiales del tipo contractual exacto", () => {
    const catalog = new UniversalOfficialTemplateCatalog([
      ...serviceTemplates,
      { templateId: "supply-dpcaf", sourceId: "official-supply-dpcaf", contractType: "SUPPLY", documentKind: "DPCAF", official: true },
    ]);
    const service = catalog.resolveBundle("SERVICE", ["DPCAF", "PPT"]);
    const supply = catalog.resolveBundle("SUPPLY", ["DPCAF", "PPT"]);
    expect(service.ready).toBe(true);
    expect(service.templates.map(item => item.templateId)).toEqual(["service-dpcaf-v1", "service-ppt-v1"]);
    expect(supply.ready).toBe(false);
    expect(supply.missingKinds).toEqual(["PPT"]);
  });

  it("17.2 rechaza descriptores que no estén acreditados como oficiales", () => {
    expect(() => new UniversalOfficialTemplateCatalog([
      { templateId: "inventado", sourceId: "fixture", contractType: "SERVICE", documentKind: "DPCAF", official: false },
    ])).toThrow(/no está acreditado como oficial/);
  });

  it("17.3 no permite mapear un expediente que todavía tenga conflicto de fuente", () => {
    const input = completeExpediente();
    input.lots.maxOfferableLots = {
      key: "lots.maxOfferableLots",
      value: null,
      status: "SOURCE_CONFLICT",
      sources: [{ kind: "PRIMARY_DOCUMENT", sourceId: "pcap" }],
      humanValidationRequired: true,
      humanValidated: false,
      conflict: { statements: ["Sin límite", "Máximo dos"], treatment: "DO_NOT_AUTO_RESOLVE" },
    };
    const result = buildUniversalDocumentMappingPackage(input, new UniversalOfficialTemplateCatalog(serviceTemplates), specs);
    expect(result.ready).toBe(false);
    expect(result.stage).toBe("BLOCKED_READINESS");
  });

  it("17.3 exige que la especificación apunte exactamente al modelo oficial resuelto", () => {
    const badSpecs = specs.map(spec => spec.documentKind === "DPCAF" ? { ...spec, templateId: "otro-modelo" } : spec);
    const result = buildUniversalDocumentMappingPackage(completeExpediente(), new UniversalOfficialTemplateCatalog(serviceTemplates), badSpecs);
    expect(result.ready).toBe(false);
    expect(result.stage).toBe("INVALID_MAPPING");
    expect(result.blockers.join(" ")).toContain("no referencia exactamente el modelo oficial");
  });

  it("17.4 proyecta valores sin normalizarlos y conserva fuente y fundamento jurídico", () => {
    const result = buildUniversalDocumentMappingPackage(completeExpediente(), new UniversalOfficialTemplateCatalog(serviceTemplates), specs);
    expect(result.ready).toBe(true);
    expect(result.stage).toBe("READY_FOR_RENDERING");
    const fact = result.documents.find(document => document.documentKind === "DPCAF")?.facts[0];
    expect(fact?.value).toBe(182_399_114);
    expect(fact?.sources).toEqual([{ kind: "USER_INPUT", sourceId: "pcap-source" }]);
    expect(fact?.legalBasis).toEqual(["LCSP:art.101"]);
  });

  it("17.4 bloquea slots que referencien campos inexistentes en vez de fabricar contenido", () => {
    const badSpecs: UniversalDocumentMappingSpec[] = [
      { documentKind: "DPCAF", templateId: "service-dpcaf-v1", slots: [{ slotId: "fantasma", fieldKey: "field.does.not.exist", required: true }] },
    ];
    const result = buildUniversalDocumentMappingPackage(completeExpediente(), new UniversalOfficialTemplateCatalog(serviceTemplates), badSpecs);
    expect(result.ready).toBe(false);
    expect(result.stage).toBe("INVALID_MAPPING");
    expect(result.blockers.join(" ")).toContain("campo inexistente");
  });

  it("17.5 cierra solo cuando están presentes todos los documentos requeridos con referencia oficial", () => {
    const result = buildUniversalDocumentMappingPackage(completeExpediente(), new UniversalOfficialTemplateCatalog(serviceTemplates), specs);
    expect(evaluateUniversalDocumentMappingClosure(result, ["MEMORIA", "DPCAF", "PCAP", "PPT"])).toEqual({ ready: true, blockers: [] });
    const incomplete = evaluateUniversalDocumentMappingClosure(result, ["MEMORIA", "DPCAF", "PCAP", "PPT", "PPT"]);
    expect(incomplete.ready).toBe(true);
    const missing = buildUniversalDocumentMappingPackage(completeExpediente(), new UniversalOfficialTemplateCatalog(serviceTemplates), specs.slice(0, 3));
    expect(evaluateUniversalDocumentMappingClosure(missing, ["MEMORIA", "DPCAF", "PCAP", "PPT"]).ready).toBe(false);
  });
});
