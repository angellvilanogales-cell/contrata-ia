import { describe, expect, it } from "vitest";
import { ADAPTIVE_FLOW_SCRIPT } from "../src/interfaces/lb7/AdaptiveFlowScript";
import { ADAPTIVE_PERSISTENCE_SCRIPT } from "../src/interfaces/lb7/AdaptivePersistenceScript";

describe("LB-7 adaptive persistence trigger", () => {
  it("emits persistence only after the parsed answer is written to session storage", () => {
    const write = 'sessionStorage.setItem("contrataIaAdaptiveAnswers",JSON.stringify(answers));';
    const event = 'notifySaved(id);';
    expect(ADAPTIVE_FLOW_SCRIPT.lastIndexOf(write)).toBeGreaterThan(-1);
    expect(ADAPTIVE_FLOW_SCRIPT.lastIndexOf(event)).toBeGreaterThan(ADAPTIVE_FLOW_SCRIPT.lastIndexOf(write));
  });

  it("persists from the completed-write event instead of a click timeout", () => {
    expect(ADAPTIVE_PERSISTENCE_SCRIPT).toContain('contrata-ia:adaptive-saved');
    expect(ADAPTIVE_PERSISTENCE_SCRIPT).toContain("persistQueue");
  });

  it("uses structured extension fields", () => {
    expect(ADAPTIVE_FLOW_SCRIPT).toContain('extensionCount');
    expect(ADAPTIVE_FLOW_SCRIPT).toContain('extensionMonth_');
    expect(ADAPTIVE_FLOW_SCRIPT).toContain('extensionBudget_');
    expect(ADAPTIVE_FLOW_SCRIPT).toContain('readSupplyExtensionBudgets');
  });
});