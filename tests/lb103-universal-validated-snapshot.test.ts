import { describe, expect, it } from "vitest";
import { UniversalGuidedContractFlow } from "../src/application/universal/UniversalGuidedContractFlow";
import { UniversalValidatedSnapshotBuilder } from "../src/application/universal/UniversalValidatedSnapshot";

describe("LB103 UniversalValidatedSnapshotBuilder", () => {
  it("bloquea snapshot mientras queden decisiones aplicables sin validar", () => {
    const flow = new UniversalGuidedContractFlow();
    const builder = new UniversalValidatedSnapshotBuilder();
    expect(() => builder.build(flow.start("SUPPLY"))).toThrow(/no está listo para generación/i);
  });

  it("produce snapshot determinista con evidencia de validación y SHA", () => {
    const flow = new UniversalGuidedContractFlow();
    const builder = new UniversalValidatedSnapshotBuilder();
    let state = flow.start("SERVICE");
    const fixed = "2026-09-05T20:15:00.000Z";

    for (const [id, value] of [
      ["common:object", "Servicio de mantenimiento"],
      ["common:cpv", "50000000-5"],
      ["common:lots", true],
      ["service:pbl", 1000000],
      ["service:estimated-value", 2000000],
    ] as const) {
      state = flow.validate(state, id, value, "revisor-1", fixed);
    }

    expect(state.phase).toBe("READY_FOR_DOCUMENT_GENERATION");
    const a = builder.build(state);
    const b = builder.build(state);
    expect(a.sha256).toMatch(/^[a-f0-9]{64}$/);
    expect(a.sha256).toBe(b.sha256);
    expect(a.decisions).toHaveLength(5);
    expect(a.humanValidated).toBe(true);
    expect(a.answers.object).toBe("Servicio de mantenimiento");
  });
});
