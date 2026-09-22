import { describe, expect, it } from "vitest";
import { runInNewContext } from "node:vm";
import { LB110_CAPACITY_SOLVENCY_SCRIPT } from "../src/interfaces/lb103/LB110CapacityAndSolvencyScript";

describe("LB110 · confirmación interactiva", () => {
  it("guarda las redacciones editadas, valida la solvencia y avanza", async () => {
    const statements = ["CAPACITY", "PROHIBITIONS", "PROFESSIONAL_AUTHORIZATION", "CLASSIFICATION", "ECONOMIC_SOLVENCY", "TECHNICAL_SOLVENCY"].map(element => ({ element, status: "APPLIES", text: `Texto de ${element}`, destinations: ["MEMORY", "PCAP"] }));
    const state: any = { __lb109: { status: "HUMAN_VALIDATED" }, __lb110: { result: { regime: "SOLVENCY_REQUIREMENTS_REQUIRED", documentaryStatements: statements, warnings: [], legalBasis: [] } } };
    const storage = new Map([["contrataIaAdaptiveAnswers", JSON.stringify(state)], ["contrataIaAdaptiveCaseId", "EXP-TEST"]]);
    const localStorage = { getItem: (key: string) => storage.get(key) ?? null, setItem: (key: string, value: string) => { storage.set(key, value); } };
    const sessionStorage = { getItem: localStorage.getItem, setItem: localStorage.setItem };
    const controls = statements.map(x => ({ dataset: { element: x.element }, value: `Redacción revisada: ${x.element}` }));
    const panel: any = { id: "lb110CapacityBlock", innerHTML: "", querySelectorAll: (selector: string) => selector === ".lb110ReviewText" ? controls : [] };
    const confirm: any = { disabled: false };
    const status: any = { textContent: "", className: "", scrollIntoView: () => {} };
    const nodes: Record<string, any> = { lb106VirginPilot: {}, lb110Confirm: confirm, lb110Correct: {}, lb110Review: {}, lb110Status: status };
    const document = { readyState: "complete", querySelector: (selector: string) => selector === "main" ? { insertBefore: () => { nodes.lb110CapacityBlock = panel; } } : null, createElement: () => panel, getElementById: (key: string) => nodes[key] ?? null, addEventListener: () => {}, dispatchEvent: () => {} };
    const requests: string[] = [];
    const fetch = async (url: string, options: any) => { requests.push(`${options.method} ${url}`); return { ok: true, json: async () => ({}) }; };
    runInNewContext(LB110_CAPACITY_SOLVENCY_SCRIPT, { document, localStorage, sessionStorage, fetch, CustomEvent: class { constructor(_name: string, _options: unknown) {} }, setTimeout });
    expect(typeof confirm.onclick).toBe("function");
    await confirm.onclick({ preventDefault: () => {} });
    const saved = JSON.parse(storage.get("contrataIaAdaptiveAnswers")!);
    expect(saved.__lb110.status).toBe("HUMAN_VALIDATED");
    expect(saved.__lb110.result.documentaryStatements[4].text).toBe("Redacción revisada: ECONOMIC_SOLVENCY");
    expect(requests).toHaveLength(4);
  });
});
