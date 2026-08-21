import { describe, expect, it } from "vitest";
import { EstadoExpediente } from "../src/domain/expediente/EstadoExpediente";
import { CanonicalExpedienteState } from "../src/domain/expediente/CanonicalExpedienteState";
import { EvidenceField } from "../src/domain/expediente/EvidenceField";
import { DocumentRegistry } from "../src/domain/documentModel/DocumentRegistry";
import { DocumentModelEngine } from "../src/domain/documentModel/DocumentModelEngine";
import { DocumentType } from "../src/domain/documentModel/DocumentType";
import { MemoryDefinition } from "../src/domain/documentModel/definitions/MemoryDefinition";
import { evaluateDocumentReadiness } from "../src/engines/CanonicalDocumentReadiness";

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

function completeState(): CanonicalExpedienteState {
  return {
    id: "TEST-12.3",
    lifecycleState: EstadoExpediente.REVISION_JURIDICA,
    blockers: [],
    warnings: [],
    fields: {
      contractType: validated("contractType", "SERVICE"),
      object: validated("object", "Servicio de limpieza"),
      cpvMain: validated("cpvMain", "90910000-9"),
      lots: validated("lots", ["Lote único"]),
      estimatedValueCents: validated("estimatedValueCents", 1000000),
      baseTenderBudgetCents: validated("baseTenderBudgetCents", 900000),
      procedure: validated("procedure", "ABIERTO"),
      durationMonths: validated("durationMonths", 12),
      extensionMonths: validated("extensionMonths", 0),
      modificationPercent: validated("modificationPercent", 0),
      awardCriteria: validated("awardCriteria", ["Precio"]),
      solvency: validated("solvency", ["Solvencia económica", "Solvencia técnica"]),
      publication: validated("publication", "PERFIL_CONTRATANTE"),
    },
  };
}

describe("Bloque 12.3 - puerta documental canónica", () => {
  it("permite preparar un documento solo si expediente y modelo están disponibles", () => {
    const registry = new DocumentRegistry();
    registry.register(MemoryDefinition);
    const engine = new DocumentModelEngine(registry);

    const result = evaluateDocumentReadiness(completeState(), DocumentType.MEMORY, engine);
    expect(result.ready).toBe(true);
    expect(result.modelAvailable).toBe(true);
    expect(result.blockers).toEqual([]);
  });

  it("bloquea PCAP/PPT cuando el modelo todavía no está registrado", () => {
    const registry = new DocumentRegistry();
    registry.register(MemoryDefinition);
    const engine = new DocumentModelEngine(registry);

    const pcap = evaluateDocumentReadiness(completeState(), DocumentType.PCAP, engine);
    const ppt = evaluateDocumentReadiness(completeState(), DocumentType.PPT, engine);
    expect(pcap.ready).toBe(false);
    expect(ppt.ready).toBe(false);
    expect(pcap.blockers).toContain("Modelo documental no registrado: PCAP");
    expect(ppt.blockers).toContain("Modelo documental no registrado: PPT");
  });

  it("bloquea generación aunque exista modelo si hay una decisión jurídica no validada", () => {
    const registry = new DocumentRegistry();
    registry.register(MemoryDefinition);
    const engine = new DocumentModelEngine(registry);
    const state = completeState();
    state.fields.procedure = {
      ...state.fields.procedure,
      status: "SYSTEM_PROPOSAL",
      humanValidated: false,
    };

    const result = evaluateDocumentReadiness(state, DocumentType.MEMORY, engine);
    expect(result.ready).toBe(false);
    expect(result.modelAvailable).toBe(true);
    expect(result.blockers).toContain("Campo no promocionable: procedure");
  });
});
