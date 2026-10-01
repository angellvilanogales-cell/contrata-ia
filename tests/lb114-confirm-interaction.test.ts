import { describe, expect, it } from "vitest";
import { runInNewContext } from "node:vm";
import { LB114_SUBCONTRACTING_ASSIGNMENT_SCRIPT } from "../src/interfaces/lb103/LB114SubcontractingAssignmentScript";

describe("LB114 · confirmación interactiva", () => {
  it("guarda y valida las siete redacciones y avanza", async () => {
    const props = ["subcontractingRegime", "criticalTasksRegime", "offerDisclosureRegime", "communicationRegime", "paymentControlRegime", "assignmentRegime", "assignmentRequirements"];
    const result: any = { warnings: [], legalBasis: [], documentaryStatements: [] };
    for (const prop of props) result[prop] = `Propuesta ${prop}`;
    const state: any = { __lb113: { status: "HUMAN_VALIDATED" }, __lb114: { result } };
    const storage = new Map([["contrataIaAdaptiveAnswers", JSON.stringify(state)], ["contrataIaAdaptiveCaseId", "EXP-TEST"]]);
    const localStorage = { getItem: (key: string) => storage.get(key) ?? null, setItem: (key: string, value: string) => { storage.set(key, value); } };
    const sessionStorage = { getItem: localStorage.getItem, setItem: localStorage.setItem };
    const controls = props.map(prop => ({ value: `Redacción revisada: ${prop}` }));
    const panel: any = { id: "lb114Block", innerHTML: "" };
    const confirm: any = { disabled: false };
    const status: any = { textContent: "", className: "" };
    const nodes: Record<string, any> = { lb106VirginPilot: {}, lb114Confirm: confirm, lb114Correct: {}, lb114Status: status };
    const document = {
      readyState: "complete",
      querySelector: (selector: string) => selector === "main" ? { insertBefore: () => { nodes.lb114Block = panel; } } : null,
      querySelectorAll: (selector: string) => selector === ".lb114Text" ? controls : [],
      createElement: () => panel,
      getElementById: (key: string) => nodes[key] ?? null,
      addEventListener: () => {},
      dispatchEvent: () => {},
    };
    const requests: string[] = [];
    const fetch = async (url: string, options: any) => { requests.push(`${options.method} ${url}`); return { ok: true, json: async () => ({}) }; };
    runInNewContext(LB114_SUBCONTRACTING_ASSIGNMENT_SCRIPT, { document, localStorage, sessionStorage, fetch, CustomEvent: class { constructor(_name: string, _options: unknown) {} }, setTimeout });
    expect(typeof confirm.onclick).toBe("function");
    await confirm.onclick();
    const saved = JSON.parse(storage.get("contrataIaAdaptiveAnswers")!);
    expect(saved.__lb114.status).toBe("HUMAN_VALIDATED");
    expect(saved.__lb114.validatedTexts).toHaveLength(7);
    expect(requests).toHaveLength(14);
  });
});
