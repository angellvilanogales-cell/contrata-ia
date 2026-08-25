import { describe, expect, it } from "vitest";
import { EstadoExpediente } from "../src/domain/expediente/EstadoExpediente";
import { CanonicalExpedienteState } from "../src/domain/expediente/CanonicalExpedienteState";
import { createPendingEvidenceField, EvidenceField } from "../src/domain/expediente/EvidenceField";
import { createUniversalExpedienteFromCanonical } from "../src/domain/expediente/UniversalExpedienteV13";
import { KnowledgeRepository } from "../src/domain/conocimiento/KnowledgeRepository";
import { KnowledgeManager } from "../src/domain/conocimiento/KnowledgeManager";
import { CPVEntry } from "../src/domain/cpv/CPVEntry";
import { CPVEngine } from "../src/engines/CPVEngine";
import { ProcedimientoEngine } from "../src/engines/ProcedimientoEngine";
import { CanonicalExpedienteEngine } from "../src/engines/CanonicalExpedienteEngine";
import { UniversalExpedienteEngine } from "../src/engines/UniversalExpedienteEngine";

function validated<T>(key: string, value: T): EvidenceField<T> {
  return {
    key,
    value,
    status: "HUMAN_VALIDATED",
    sources: [{ kind: "USER_INPUT", sourceId: "lb13-test" }],
    humanValidationRequired: true,
    humanValidated: true,
  };
}

function canonical(): CanonicalExpedienteState {
  return {
    id: "LB13-ENGINE-001",
    lifecycleState: EstadoExpediente.OBJETO_VALIDADO,
    blockers: [],
    warnings: [],
    fields: {
      contractType: validated("contractType", "SERVICE"),
      object: validated("object", "servicio de limpieza de oficinas"),
      cpvMain: createPendingEvidenceField("cpvMain"),
      lots: validated("lots", ["Lote único"]),
      estimatedValueCents: validated("estimatedValueCents", 0),
      baseTenderBudgetCents: validated("baseTenderBudgetCents", 0),
      procedure: createPendingEvidenceField("procedure"),
      durationMonths: validated("durationMonths", 12),
      extensionMonths: validated("extensionMonths", 0),
      modificationPercent: validated("modificationPercent", 0),
      awardCriteria: validated("awardCriteria", []),
      solvency: validated("solvency", []),
    },
  };
}

function engine(): UniversalExpedienteEngine {
  const repository = new KnowledgeRepository();
  const cpv = new CPVEntry();
  cpv.codigo = "90910000-9";
  cpv.descripcion = "Servicios de limpieza";
  cpv.palabrasClave = ["limpieza", "oficinas"];
  repository.registrarCPV(cpv);

  return new UniversalExpedienteEngine(
    new CanonicalExpedienteEngine(
      new CPVEngine(new KnowledgeManager(repository)),
      new ProcedimientoEngine(),
    ),
  );
}

describe("Bloque 13 - fachada universal de motores", () => {
  it("ejecuta identificación desde el expediente universal y devuelve el mismo tipo de autoridad", () => {
    const universal = createUniversalExpedienteFromCanonical(canonical());
    const result = engine().ejecutarIdentificacion(universal);

    expect(result.executed).toContain("CPVEngine");
    expect(result.expediente.schemaVersion).toBe(universal.schemaVersion);
    expect(result.expediente.canonical.fields.cpvMain.value).toBe("90910000-9");
    expect(result.expediente.canonical.fields.cpvMain.status).toBe("SYSTEM_PROPOSAL");
    expect(result.expediente.traceability.sourceRegistry.some(source => source.sourceId === "CPVEngine:CPV-001")).toBe(true);
  });

  it("no permite que el régimen jurídico salte la validación humana del procedimiento", () => {
    const universal = createUniversalExpedienteFromCanonical(canonical());
    universal.canonical.fields.procedure = {
      key: "procedure",
      value: "ABIERTO",
      status: "SYSTEM_PROPOSAL",
      sources: [{ kind: "NORMATIVE_RULE", sourceId: "PROC-001" }],
      humanValidationRequired: true,
      humanValidated: false,
    };

    const result = engine().ejecutarRegimen(universal);
    expect(result.executed).toEqual([]);
    expect(result.expediente.canonical.fields.solvency).toBe(universal.canonical.fields.solvency);
  });

  it("resuelve plazos solo si todas las entradas universales necesarias son promocionables", () => {
    const universal = createUniversalExpedienteFromCanonical(canonical());
    const result = engine().resolverPlazos(universal, []);

    expect(result.executed).toEqual([]);
    expect(result.blockers).toContain("Entrada no promocionable para motor de plazos: procedure");
    expect(result.blockers).toContain("Entrada no promocionable para motor de plazos: processing.processingType");
    expect(result.expediente.regulation.deadlines.status).toBe("PENDING");
  });
});
