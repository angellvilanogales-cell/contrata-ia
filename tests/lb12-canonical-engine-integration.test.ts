import { describe, expect, it } from "vitest";
import { EstadoExpediente } from "../src/domain/expediente/EstadoExpediente";
import { CanonicalExpedienteState } from "../src/domain/expediente/CanonicalExpedienteState";
import { createPendingEvidenceField, EvidenceField } from "../src/domain/expediente/EvidenceField";
import { KnowledgeRepository } from "../src/domain/conocimiento/KnowledgeRepository";
import { KnowledgeManager } from "../src/domain/conocimiento/KnowledgeManager";
import { CPVEntry } from "../src/domain/cpv/CPVEntry";
import { CPVEngine } from "../src/engines/CPVEngine";
import { ProcedimientoEngine } from "../src/engines/ProcedimientoEngine";
import { CanonicalExpedienteEngine } from "../src/engines/CanonicalExpedienteEngine";
import { DecisionJuridica } from "../src/domain/conocimiento/DecisionJuridica";
import { promoteNormativeEngineDecision } from "../src/engines/CanonicalEnginePromotion";

function confirmed<T>(key: string, value: T): EvidenceField<T> {
  return {
    key,
    value,
    status: "HUMAN_VALIDATED",
    sources: [{ kind: "USER_INPUT", sourceId: "test" }],
    humanValidationRequired: true,
    humanValidated: true,
  };
}

function state(): CanonicalExpedienteState {
  return {
    id: "TEST-12.2",
    lifecycleState: EstadoExpediente.OBJETO_VALIDADO,
    blockers: [],
    warnings: [],
    fields: {
      contractType: confirmed("contractType", "SERVICE"),
      object: confirmed("object", "servicio de limpieza de oficinas"),
      cpvMain: createPendingEvidenceField("cpvMain"),
      lots: confirmed("lots", ["Lote único"]),
      estimatedValueCents: confirmed("estimatedValueCents", 0),
      baseTenderBudgetCents: confirmed("baseTenderBudgetCents", 0),
      procedure: createPendingEvidenceField("procedure"),
      durationMonths: confirmed("durationMonths", 12),
      extensionMonths: confirmed("extensionMonths", 0),
      modificationPercent: confirmed("modificationPercent", 0),
      awardCriteria: confirmed("awardCriteria", []),
      solvency: confirmed("solvency", []),
    },
  };
}

describe("Bloque 12.2 - integración canónica de motores existentes", () => {
  it("convierte la salida probabilística de CPVEngine en propuesta pendiente de validación", () => {
    const repository = new KnowledgeRepository();
    const cpv = new CPVEntry();
    cpv.codigo = "90910000-9";
    cpv.descripcion = "Servicios de limpieza";
    cpv.palabrasClave = ["limpieza", "oficinas"];
    repository.registrarCPV(cpv);

    const engine = new CanonicalExpedienteEngine(
      new CPVEngine(new KnowledgeManager(repository)),
      new ProcedimientoEngine(),
    );

    const result = engine.ejecutarIdentificacion(state());
    expect(result.executed).toContain("CPVEngine");
    expect(result.executed).not.toContain("ProcedimientoEngine");
    expect(result.state.fields.cpvMain.value).toBe("90910000-9");
    expect(result.state.fields.cpvMain.status).toBe("SYSTEM_PROPOSAL");
    expect(result.state.fields.cpvMain.humanValidationRequired).toBe(true);
    expect(result.state.fields.cpvMain.humanValidated).toBe(false);
  });

  it("conserva regla y fundamento de una decisión normativa sin validarla automáticamente", () => {
    const decision = new DecisionJuridica<string>();
    decision.resultado = "ABIERTO";
    decision.confianza = 100;
    decision.articulos.push("art. 156 LCSP");
    decision.reglasAplicadas.push("PROC-001");

    const field = promoteNormativeEngineDecision(decision, {
      key: "procedure",
      motor: "ProcedimientoEngine",
      sourceId: "PROC-001",
    });

    expect(field.value).toBe("ABIERTO");
    expect(field.status).toBe("SYSTEM_PROPOSAL");
    expect(field.sources[0]?.kind).toBe("NORMATIVE_RULE");
    expect(field.legalBasis).toContain("art. 156 LCSP");
    expect(field.humanValidationRequired).toBe(true);
    expect(field.humanValidated).toBe(false);
  });
});
