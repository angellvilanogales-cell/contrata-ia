import { describe, expect, it } from "vitest";
import { UniversalGuidedContractFlow } from "../src/application/universal/UniversalGuidedContractFlow";

describe("LB103 UniversalGuidedContractFlow", () => {
  it("expone pregunta, explicación y fundamento normativo antes de validar", () => {
    const flow = new UniversalGuidedContractFlow();
    const state = flow.start("SUPPLY");
    const question = flow.current(state);

    expect(question?.id).toBe("common:object");
    expect(question?.legalBasis[0]?.authority).toBe("A");
    expect(question?.legalBasis[0]?.rule.length).toBeGreaterThan(10);
    expect(question?.actions).toEqual(["VALIDATE", "REJECT_PROPOSAL", "REQUIRE_CLARIFICATION"]);
    expect(state.phase).toBe("GUIDED_DECISIONS");
  });

  it("no permite obtener snapshot canónico mientras existan decisiones sin validar", () => {
    const flow = new UniversalGuidedContractFlow();
    const state = flow.start("SERVICE");
    expect(() => flow.canonicalAnswers(state)).toThrow(/no está listo para generación/i);
    expect(flow.blockers(state).length).toBeGreaterThan(0);
  });

  it("mantiene una propuesta separada de la validación humana", () => {
    const flow = new UniversalGuidedContractFlow();
    let state = flow.start("SUPPLY");
    state = flow.propose(state, "common:object", "Suministro de equipos", "CASE_EVIDENCE");

    const current = flow.current(state);
    expect(current?.proposedValue).toBe("Suministro de equipos");
    expect(state.decisionSession.decisions.find(d => d.definition.id === "common:object")?.status).toBe("PENDING_USER_DECISION");
  });
});
