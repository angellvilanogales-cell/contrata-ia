import { describe, expect, it } from "vitest";
import { UniversalFamilyAdaptivePreparation } from "../src/application/universal/UniversalFamilyAdaptivePreparation";

const adaptive = new UniversalFamilyAdaptivePreparation();

function answerAllWorks() {
  let state = adaptive.start("WORKS");
  for (const [field, value] of [
    ["projectPrepared", true], ["projectApproved", true], ["projectReplanted", true],
    ["baseTenderBudgetExVatCents", 40_000_000], ["landAvailabilityConfirmed", true],
    ["supervisionReportAvailable", false], ["affectsStabilitySafetyOrWatertightness", false],
  ] as const) state = adaptive.applyAnswer(state, field, value);
  return state;
}

describe("LB91.23 - preparación adaptativa por familia", () => {
  it("pregunta proyecto antes de cerrar obras", () => {
    const result = adaptive.assess(adaptive.start("WORKS"));
    expect(result.complete).toBe(false);
    expect(result.next?.id).toBe("works:project-prepared");
  });

  it("cierra preparación de obras solo tras pasar el gate jurídico", () => {
    const result = adaptive.assess(answerAllWorks());
    expect(result.complete).toBe(true);
    expect(result.preparation?.contractType).toBe("WORKS");
  });

  it("pregunta primero el subtipo y riesgo operacional en concesiones", () => {
    let state = adaptive.start("CONCESSION");
    expect(adaptive.assess(state).next?.id).toBe("concession:subtype");
    state = adaptive.applyAnswer(state, "subtype", "SERVICE_CONCESSION");
    expect(adaptive.assess(state).next?.id).toBe("concession:risk");
  });

  it("abre justificación de recuperación cuando la concesión supera cinco años", () => {
    let state = adaptive.start("CONCESSION");
    const values: Array<[string, unknown]> = [
      ["subtype", "SERVICE_CONCESSION"], ["operationalRiskTransferred", true], ["demandRiskTransferred", true], ["supplyRiskTransferred", false], ["viabilityStudyApproved", true], ["durationYears", 10],
    ];
    for (const [field, value] of values) state = adaptive.applyAnswer(state, field, value);
    expect(adaptive.assess(state).next?.id).toBe("concession:recovery");
  });

  it("no obliga a preguntar prestación principal del mixto suministro-servicio si puede derivarse de VE separados", () => {
    let state = adaptive.start("MIXED");
    state = adaptive.applyAnswer(state, "components", [
      { contractType: "SERVICE", estimatedValueExVatCents: 9_000_000, functionallyLinked: true, complementaryRelationship: true },
      { contractType: "SUPPLY", estimatedValueExVatCents: 1_000_000, functionallyLinked: true, complementaryRelationship: true },
    ]);
    expect(adaptive.assess(state).next?.id).toBe("mixed:concession");
  });

  it("servicios y suministros no reciben preguntas familiares artificiales", () => {
    expect(adaptive.assess(adaptive.start("SERVICE")).complete).toBe(true);
    expect(adaptive.assess(adaptive.start("SUPPLY")).complete).toBe(true);
  });
});
