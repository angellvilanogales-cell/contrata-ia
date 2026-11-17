import { describe, expect, it } from "vitest";
import { runInNewContext } from "node:vm";
import { LB112_GUARANTEES_SCRIPT } from "../src/interfaces/lb103/LB112GuaranteesScript";

describe("LB112 · confirmación interactiva", () => {
  it("muestra textos en español, guarda las garantías y avanza", async () => {
    const elements = ["PROVISIONAL", "DEFINITIVE", "DEFINITIVE_BASE", "COMPLEMENTARY", "WARRANTY_PERIOD"];
    const statements = elements.map(element => ({ element, status: "APPLIES", text: `Texto de ${element}`, destinations: ["MEMORY", "PCAP"] }));
    const state: any = { __lb111: { status: "HUMAN_VALIDATED" }, __lb109: { selectedProcedure: "ABIERTO_SIMPLIFICADO" }, __lb112: { result: { provisionalPercent: 0, definitivePercent: 5, complementaryPercent: 0, warrantyPeriodMonths: 12, documentaryStatements: statements, warnings: [], legalBasis: [] } } };
    const storage = new Map([["contrataIaAdaptiveAnswers", JSON.stringify(state)], ["contrataIaAdaptiveCaseId", "EXP-TEST"]]);
    const localStorage = { getItem: (key: string) => storage.get(key) ?? null, setItem: (key: string, value: string) => { storage.set(key, value); } };
    const sessionStorage = { getItem: localStorage.getItem, setItem: localStorage.setItem };
    const panel: any = { id: "lb112GuaranteesBlock", innerHTML: "" };
    const confirm: any = { disabled: false };
    const status: any = { textContent: "", className: "", scrollIntoView: () => {} };
    const nodes: Record<string, any> = { lb106VirginPilot: {}, lb112Confirm: confirm, lb112Correct: {}, lb112Review: {}, lb112Status: status };
    const document = { readyState: "complete", querySelector: (selector: string) => selector === "main" ? { insertBefore: () => { nodes.lb112GuaranteesBlock = panel; } } : null, createElement: () => panel, getElementById: (key: string) => nodes[key] ?? null, addEventListener: () => {}, dispatchEvent: () => {} };
    const requests: string[] = [];
    const fetch = async (url: string, options: any) => { requests.push(`${options.method} ${url}`); return { ok: true, json: async () => ({}) }; };
    runInNewContext(LB112_GUARANTEES_SCRIPT, { document, localStorage, sessionStorage, fetch, CustomEvent: class { constructor(_name: string, _options: unknown) {} }, setTimeout });
    expect(panel.innerHTML).toContain("Garantía provisional · Aplicable");
    expect(panel.innerHTML).toContain("Memoria justificativa");
    expect(panel.innerHTML).not.toContain("<strong>WARRANTY_PERIOD");
    expect(typeof confirm.onclick).toBe("function");
    await confirm.onclick({ preventDefault: () => {} });
    const saved = JSON.parse(storage.get("contrataIaAdaptiveAnswers")!);
    expect(saved.__lb112.status).toBe("HUMAN_VALIDATED");
    expect(requests).toHaveLength(18);
  });
});
