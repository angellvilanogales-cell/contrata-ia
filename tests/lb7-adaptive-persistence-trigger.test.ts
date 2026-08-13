import { describe, expect, it } from "vitest";
import { ADAPTIVE_FLOW_SCRIPT } from "../src/interfaces/lb7/AdaptiveFlowScript";
import { ADAPTIVE_PERSISTENCE_SCRIPT } from "../src/interfaces/lb7/AdaptivePersistenceScript";

describe("LB-7 adaptive persistence trigger", () => {
  it("emits persistence only after the parsed answer is written to session storage", () => {
    const write = 'sessionStorage.setItem("contrataIaAdaptiveAnswers",JSON.stringify(answers));';
    const event = 'notifySaved(id);';
    const writePosition = ADAPTIVE_FLOW_SCRIPT.lastIndexOf(write);
    const eventPosition = ADAPTIVE_FLOW_SCRIPT.lastIndexOf(event);
    expect(writePosition).toBeGreaterThan(-1);
    expect(eventPosition).toBeGreaterThan(writePosition);
  });

  it("persists from the completed-write event instead of a click timeout", () => {
    expect(ADAPTIVE_PERSISTENCE_SCRIPT).toContain('contrata-ia:adaptive-saved');
    expect(ADAPTIVE_PERSISTENCE_SCRIPT).not.toContain('t.id==="saveAnswer"||t.id==="saveEconomicFix"');
    expect(ADAPTIVE_PERSISTENCE_SCRIPT).toContain("persistQueue");
  });

  it("keeps semicolon-separated supply extension budgets parseable", () => {
    expect(ADAPTIVE_FLOW_SCRIPT).toContain('if(id==="supplyExtensionBudgetsExVat")return rawValue.split(";")');
  });
});