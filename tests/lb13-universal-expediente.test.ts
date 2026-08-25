import { describe, expect, it } from "vitest";
import { CanonicalExpedienteState } from "../src/domain/expediente/CanonicalExpedienteState";
import { EstadoExpediente } from "../src/domain/expediente/EstadoExpediente";
import { EvidenceField } from "../src/domain/expediente/EvidenceField";
import {
  createUniversalExpedienteFromCanonical,
  evaluateUniversalExpediente,
  UNIVERSAL_EXPEDIENTE_SCHEMA_VERSION,
} from "../src/domain/expediente/UniversalExpedienteV13";

function validated<T>(key: string, value: T): EvidenceField<T> {
  return {
    key,
    value,
    status: "HUMAN_VALIDATED",
    sources: [{ kind: "PRIMARY_DOCUMENT", sourceId: "lb13-source", locator: key }],
    humanValidationRequired: true,
    humanValidated: true,
  };
}

function canonical(): CanonicalExpedienteState {
  return {
    id: "EXP-LB13-001",
    lifecycleState: EstadoExpediente.PUBLICIDAD_VALIDADA,
    blockers: [],
    warnings: [],
    fields: {
      contractType: validated("contractType", "SERVICE"),
      object: validated("object", "Servicio de mantenimiento"),
      cpvMain: validated("cpvMain", "50000000-5"),
      lots: validated("lots", ["Lote único"]),
      estimatedValueCents: validated("estimatedValueCents", 10000000),
      baseTenderBudgetCents: validated("baseTenderBudgetCents", 5000000),
      procedure: validated("procedure", "ABIERTO"),
      durationMonths: validated("durationMonths", 24),
      extensionMonths: validated("extensionMonths", 12),
      modificationPercent: validated("modificationPercent", 20),
      awardCriteria: validated("awardCriteria", ["Precio", "Calidad"]),
      solvency: validated("solvency", ["Solvencia económica", "Solvencia técnica"]),
      publicity: validated("publicity", "PLACSP_Y_DOUE"),
    },
  };
}

describe("Bloque 13 - objeto universal del expediente", () => {
  it("migra desde el estado canónico preservando exactamente su evidencia y procedencia", () => {
    const base = canonical();
    const universal = createUniversalExpedienteFromCanonical(base);

    expect(universal.schemaVersion).toBe(UNIVERSAL_EXPEDIENTE_SCHEMA_VERSION);
    expect(universal.canonical).toBe(base);
    expect(universal.canonical.fields.object).toBe(base.fields.object);
    expect(universal.canonical.fields.object.sources).toEqual(base.fields.object.sources);
    expect(universal.canonical.fields.object.status).toBe("HUMAN_VALIDATED");
  });

  it("no inventa datos al abrir los nuevos dominios: todos nacen pendientes", () => {
    const universal = createUniversalExpedienteFromCanonical(canonical());

    expect(universal.processing.processingType.status).toBe("PENDING");
    expect(universal.regulation.deadlines.status).toBe("PENDING");
    expect(universal.economic.vatPercent.status).toBe("PENDING");
    expect(universal.administrative.contractingAuthority.status).toBe("PENDING");
    expect(universal.technical.subrogationRequired.value).toBeNull();
    expect(universal.lots.maxOfferableLots.value).toBeNull();
    expect(universal.guarantees.definitiveGuaranteePercent.value).toBeNull();
    expect(universal.execution.specificPenalties.status).toBe("PENDING");
    expect(universal.criteria.judgmentCriteriaExist.status).toBe("PENDING");
    expect(universal.traceability.decisions).toEqual([]);
  });

  it("distingue completitud canónica de completitud por cada dominio universal", () => {
    const universal = createUniversalExpedienteFromCanonical(canonical());
    const result = evaluateUniversalExpediente(universal);

    expect(result.canonicalPromotable).toBe(true);
    expect(result.universallyComplete).toBe(false);
    expect(Object.values(result.domainCompleteness).every(value => value === false)).toBe(true);
    expect(result.blockers).toContain("Campo universal no promocionable: processing.processingType");
    expect(result.blockers).toContain("Campo universal no promocionable: regulation.deadlines");
    expect(result.blockers).toContain("Campo universal no promocionable: guarantees.definitiveGuaranteePercent");
  });

  it("mantiene separados consumo, proyección, presupuesto máximo y valor estimado jurídico", () => {
    const universal = createUniversalExpedienteFromCanonical(canonical());

    universal.economic.referenceConsumption = validated("economic.referenceConsumption", "1.000 unidades/año");
    universal.economic.projectedConsumption = validated("economic.projectedConsumption", "1.250 unidades/año");
    universal.economic.maximumApprovedBudgetCents = validated("economic.maximumApprovedBudgetCents", 5000000);
    universal.economic.legalEstimatedValueCents = validated("economic.legalEstimatedValueCents", 7200000);

    expect(universal.economic.referenceConsumption.value).toBe("1.000 unidades/año");
    expect(universal.economic.projectedConsumption.value).toBe("1.250 unidades/año");
    expect(universal.economic.maximumApprovedBudgetCents.value).toBe(5000000);
    expect(universal.economic.legalEstimatedValueCents.value).toBe(7200000);
  });

  it("mantiene bloqueante una contradicción de fuente sin resolverla", () => {
    const universal = createUniversalExpedienteFromCanonical(canonical());
    universal.processing.processingType = {
      key: "processing.processingType",
      value: null,
      status: "SOURCE_CONFLICT",
      sources: [
        { kind: "PRIMARY_DOCUMENT", sourceId: "source-a" },
        { kind: "PRIMARY_DOCUMENT", sourceId: "source-b" },
      ],
      humanValidationRequired: true,
      humanValidated: false,
      conflict: {
        statements: ["ORDINARIA", "URGENTE"],
        treatment: "DO_NOT_AUTO_RESOLVE",
      },
    };

    const result = evaluateUniversalExpediente(universal);
    expect(result.universallyComplete).toBe(false);
    expect(result.blockers).toContain("Campo universal no promocionable: processing.processingType");
  });

  it("preserva una decisión de plazos como propuesta pendiente de validación humana", () => {
    const universal = createUniversalExpedienteFromCanonical(canonical());
    universal.regulation.deadlines = {
      key: "regulation.deadlines",
      value: {
        ofertasDias: 35,
        adjudicacionDias: 15,
        formalizacionDias: 15,
        subsanacionDias: 3,
        recursoDias: 15,
        ejecucionDias: 0,
        justificacion: "Regla propuesta",
        normativa: "LCSP",
        articulo: "156",
        confidence: 100,
      },
      status: "SYSTEM_PROPOSAL",
      sources: [{ kind: "NORMATIVE_RULE", sourceId: "deadline:156" }],
      humanValidationRequired: true,
      humanValidated: false,
    };

    const result = evaluateUniversalExpediente(universal);
    expect(universal.regulation.deadlines.status).toBe("SYSTEM_PROPOSAL");
    expect(universal.regulation.deadlines.humanValidated).toBe(false);
    expect(result.blockers).toContain("Campo universal no promocionable: regulation.deadlines");
  });

  it("audita también la evidencia interna de cada lote", () => {
    const universal = createUniversalExpedienteFromCanonical(canonical());
    universal.lots.divisionIntoLots = validated("lots.divisionIntoLots", true);
    universal.lots.lots = validated("lots.lots", [{
      id: "LOT-1",
      name: validated("lots.LOT-1.name", "Lote 1"),
      cpv: validated("lots.LOT-1.cpv", "50000000-5"),
      baseTenderBudgetCents: validated("lots.LOT-1.baseTenderBudgetCents", 1000000),
      estimatedValueCents: {
        key: "lots.LOT-1.estimatedValueCents",
        value: null,
        status: "SOURCE_CONFLICT",
        sources: [
          { kind: "PRIMARY_DOCUMENT", sourceId: "pcap-annex" },
          { kind: "PRIMARY_DOCUMENT", sourceId: "economic-table" },
        ],
        humanValidationRequired: true,
        humanValidated: false,
        conflict: {
          statements: ["10.000,00 EUR", "10.000,01 EUR"],
          treatment: "DO_NOT_AUTO_RESOLVE",
        },
      },
    }]);

    const result = evaluateUniversalExpediente(universal);
    expect(result.domainCompleteness.lots).toBe(false);
    expect(result.blockers).toContain("Campo universal no promocionable: lots.LOT-1.estimatedValueCents");
  });
});
