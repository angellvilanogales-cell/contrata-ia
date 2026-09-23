import { describe, expect, it } from "vitest";
import { UniversalDecisionEngine } from "../src/application/universal/UniversalDecisionEngine";

describe("LB103 UniversalDecisionEngine", () => {
  it("mantiene cada decisión pendiente hasta validación humana y muestra fundamento normativo", () => {
    const engine = new UniversalDecisionEngine();
    let session = engine.start("SUPPLY");

    const first = engine.next(session);
    expect(first?.definition.id).toBe("common:object");
    expect(first?.definition.legalBasis[0]?.authority).toBe("A");
    expect(first?.definition.legalBasis[0]?.citation).toContain("art. 99");
    expect(engine.readyForGeneration(session)).toBe(false);

    session = engine.propose(session, "common:object", "Suministro de licencias", "DERIVED");
    expect(session.decisions.find(d => d.definition.id === "common:object")?.status).toBe("PENDING_USER_DECISION");

    session = engine.validate(session, "common:object", "Suministro de licencias", "usuario-piloto", "2026-09-05T20:00:00.000Z");
    const validated = session.decisions.find(d => d.definition.id === "common:object");
    expect(validated?.status).toBe("HUMAN_VALIDATED");
    expect(validated?.validatedBy).toBe("usuario-piloto");
    expect(session.answers.object).toBe("Suministro de licencias");
  });

  it("activa la motivación de no división solo cuando la persona valida que no hay lotes", () => {
    const engine = new UniversalDecisionEngine();
    let session = engine.start("SUPPLY");
    const justification = () => session.decisions.find(d => d.definition.id === "common:no-lots-justification");

    expect(justification()?.status).toBe("NOT_APPLICABLE");
    session = engine.validate(session, "common:lots", false, "usuario-piloto");
    expect(justification()?.status).toBe("PENDING_USER_DECISION");
    expect(justification()?.definition.legalBasis[0]?.citation).toContain("99.3");
  });

  it("no acepta una propuesta como validada ni permite generación con decisiones abiertas", () => {
    const engine = new UniversalDecisionEngine();
    let session = engine.start("SERVICE");
    session = engine.propose(session, "service:pbl", 100000, "CALCULATED");
    expect(session.decisions.find(d => d.definition.id === "service:pbl")?.status).toBe("PENDING_USER_DECISION");
    expect(engine.readyForGeneration(session)).toBe(false);
  });

  it("registra rechazo motivado sin convertirlo en una decisión validada", () => {
    const engine = new UniversalDecisionEngine();
    let session = engine.start("SUPPLY");
    session = engine.propose(session, "supply:delivery-mode", "NEEDS_BASED", "DERIVED");
    session = engine.rejectProposal(session, "supply:delivery-mode", "La prestación es una adquisición cerrada.");
    const decision = session.decisions.find(d => d.definition.id === "supply:delivery-mode");
    expect(decision?.status).toBe("USER_REJECTED_PROPOSAL");
    expect(decision?.rejectionReason).toContain("adquisición cerrada");
    expect(engine.readyForGeneration(session)).toBe(false);
  });

  it("separa PBL y valor estimado como decisiones jurídicas independientes", () => {
    const engine = new UniversalDecisionEngine();
    const session = engine.start("SUPPLY");
    const pbl = session.decisions.find(d => d.definition.id === "supply:pbl");
    const ve = session.decisions.find(d => d.definition.id === "supply:estimated-value");
    expect(pbl?.definition.field).toBe("baseTenderBudgetExVatCents");
    expect(ve?.definition.field).toBe("estimatedValueExVatCents");
    expect(pbl?.definition.legalBasis[0]?.citation).toContain("art. 100");
    expect(ve?.definition.legalBasis[0]?.citation).toContain("art. 101");
  });
});
