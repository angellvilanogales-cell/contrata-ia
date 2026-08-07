import { describe, expect, it } from "vitest";
import {
  VerticalContractingFlow,
  createVerticalSliceDependencies
} from "../src/application/vertical/VerticalSlice";

describe("LB-3 minimum vertical flow", () => {
  it("creates, persists, analyses, proposes, documents, exports and audits an expediente", async () => {
    const dependencies = createVerticalSliceDependencies();
    const flow = new VerticalContractingFlow(dependencies);

    const result = await flow.execute({
      object: "Servicio de apoyo tecnológico para la gestión de expedientes",
      need: "Disponer de un recorrido vertical verificable",
      estimatedValue: 1000
    });

    expect(result.expediente.status).toBe("PENDING_HUMAN_VALIDATION");
    expect(result.expediente.ruleEvaluation?.valid).toBe(true);
    expect(result.expediente.cpvProposal?.code).toBe("UNASSIGNED");
    expect(result.expediente.procedureProposal?.requiresHumanValidation).toBe(true);
    expect(result.expediente.decisions).toHaveLength(2);
    expect(result.expediente.decisions.every(decision => decision.requiresHumanValidation)).toBe(true);
    expect(result.expediente.document?.type).toBe("MEMORIA_PRELIMINAR");
    expect(result.json).toContain("MEMORIA_PRELIMINAR");
    expect(result.html).toContain("<!doctype html>");
    expect(result.audit.map(entry => entry.action)).toEqual([
      "EXPEDIENTE_CREATED",
      "RULES_EVALUATED",
      "PROPOSALS_CREATED",
      "DOCUMENT_GENERATED",
      "DOCUMENT_EXPORTED"
    ]);

    const persisted = dependencies.repository.get(result.expediente.id);
    expect(persisted?.status).toBe("PENDING_HUMAN_VALIDATION");
    expect(persisted?.document?.type).toBe("MEMORIA_PRELIMINAR");
  });

  it("refuses an incomplete expediente before producing legal-looking output", async () => {
    const flow = new VerticalContractingFlow(createVerticalSliceDependencies());

    await expect(flow.execute({ object: "", need: "" })).rejects.toThrow("Validación técnica fallida");
  });
});
