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

  it("no inventa datos suplementarios al migrar: nacen pendientes", () => {
    const universal = createUniversalExpedienteFromCanonical(canonical());

    expect(universal.processing.processingType.status).toBe("PENDING");
    expect(universal.processing.urgency.value).toBeNull();
    expect(universal.regulation.harmonizedRegulation.value).toBeNull();
    expect(universal.regulation.threshold.status).toBe("PENDING");
    expect(universal.regulation.deadlines.status).toBe("PENDING");
  });

  it("distingue un expediente canónico válido de un expediente universal todavía incompleto", () => {
    const universal = createUniversalExpedienteFromCanonical(canonical());
    const result = evaluateUniversalExpediente(universal);

    expect(result.canonicalPromotable).toBe(true);
    expect(result.universallyComplete).toBe(false);
    expect(result.blockers).toContain("Campo universal no promocionable: processingType");
    expect(result.blockers).toContain("Campo universal no promocionable: deadlines");
  });

  it("mantiene bloqueante una contradicción de fuente sin resolverla", () => {
    const universal = createUniversalExpedienteFromCanonical(canonical());
    universal.processing.processingType = {
      key: "processingType",
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
    expect(result.blockers).toContain("Campo universal no promocionable: processingType");
  });

  it("preserva una decisión de plazos como propuesta pendiente de validación humana", () => {
    const universal = createUniversalExpedienteFromCanonical(canonical());
    universal.regulation.deadlines = {
      key: "deadlines",
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
    expect(result.blockers).toContain("Campo universal no promocionable: deadlines");
  });
});
