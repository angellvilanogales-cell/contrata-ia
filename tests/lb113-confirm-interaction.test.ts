import { describe, expect, it } from "vitest";
import { runInNewContext } from "node:vm";
import { LB113_SPECIAL_EXECUTION_SCRIPT } from "../src/interfaces/lb103/LB113SpecialExecutionScript";

describe("LB113 · confirmación interactiva", () => {
  it("guarda las redacciones, valida las condiciones y avanza", async () => {
    const elements = ["SPECIAL_EXECUTION_CONDITIONS", "DATA_TRANSFER_CONDITION", "FOOD_WASTE_CONDITION", "SUBCONTRACTORS"];
    const statements = elements.map(element => ({ element, status: "APPLIES", text: `Texto de ${element}`, destinations: ["MEMORY", "PCAP"] }));
    const condition = { title: "Condición social", category: "SOCIAL_EMPLOYMENT", obligation: "Cumplir el convenio aplicable.", objectLinkReason: "Afecta al personal adscrito.", verificationMethod: "Control documental.", evidenceRequired: "Declaración responsable.", consequence: "SERIOUS_INFRINGEMENT", consequenceDetail: "Incumplimiento grave." };
    const state: any = { __lb112: { status: "HUMAN_VALIDATED" }, __lb113: { result: { normalizedConditions: [condition], documentaryStatements: statements, warnings: [], legalBasis: [] } } };
    const storage = new Map([["contrataIaAdaptiveAnswers", JSON.stringify(state)], ["contrataIaAdaptiveCaseId", "EXP-TEST"]]);
    const localStorage = { getItem: (key: string) => storage.get(key) ?? null, setItem: (key: string, value: string) => { storage.set(key, value); } };
    const sessionStorage = { getItem: localStorage.getItem, setItem: localStorage.setItem };
    const controls = statements.map(x => ({ dataset: { element: x.element }, value: `Redacción revisada: ${x.element}`, oninput: null }));
    const panel: any = { id: "lb113Block", innerHTML: "", querySelectorAll: (selector: string) => selector === ".lb113ReviewText" ? controls : selector === ".lb113Restore" ? [] : [] };
    const confirm: any = { disabled: false };
    const status: any = { textContent: "", className: "", scrollIntoView: () => {} };
    const nodes: Record<string, any> = { lb106VirginPilot: {}, lb113Confirm: confirm, lb113Correct: {}, lb113Review: {}, lb113Status: status };
    const document = { readyState: "complete", querySelector: (selector: string) => selector === "main" ? { insertBefore: () => { nodes.lb113Block = panel; } } : null, createElement: () => panel, getElementById: (key: string) => nodes[key] ?? null, addEventListener: () => {}, dispatchEvent: () => {} };
    const requests: string[] = [];
    const fetch = async (url: string, options: any) => { requests.push(`${options.method} ${url}`); return { ok: true, json: async () => ({}) }; };
    runInNewContext(LB113_SPECIAL_EXECUTION_SCRIPT, { document, localStorage, sessionStorage, fetch, CustomEvent: class { constructor(_name: string, _options: unknown) {} }, setTimeout });
    expect(panel.innerHTML).toContain("Condiciones especiales de ejecución · Aplicable");
    expect(panel.innerHTML).toContain("Memoria justificativa");
    expect(typeof confirm.onclick).toBe("function");
    await confirm.onclick({ preventDefault: () => {} });
    const saved = JSON.parse(storage.get("contrataIaAdaptiveAnswers")!);
    expect(saved.__lb113.status).toBe("HUMAN_VALIDATED");
    expect(saved.__lb113.result.documentaryStatements[0].text).toBe("Redacción revisada: SPECIAL_EXECUTION_CONDITIONS");
    expect(requests).toHaveLength(10);
  });
});
