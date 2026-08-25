import fs from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { SUPPLY_CROSS_DOCUMENT_AUDIT_SCRIPT } from "../src/interfaces/lb7/SupplyCrossDocumentAuditScript";

describe("LB-7 supply cross-document audit", () => {
  it("keeps the browser script syntactically valid", () => {
    expect(() => new Function(SUPPLY_CROSS_DOCUMENT_AUDIT_SCRIPT)).not.toThrow();
  });

  it("encodes the four source-grounded blockers detected for CONTR/2026/240267", () => {
    expect(SUPPLY_CROSS_DOCUMENT_AUDIT_SCRIPT).toContain('id:"MEM-VE"');
    expect(SUPPLY_CROSS_DOCUMENT_AUDIT_SCRIPT).toContain('id:"MEM-MOD"');
    expect(SUPPLY_CROSS_DOCUMENT_AUDIT_SCRIPT).toContain('id:"CAT-SCOPE"');
    expect(SUPPLY_CROSS_DOCUMENT_AUDIT_SCRIPT).toContain('id:"PBL-BREAKDOWN"');
  });

  it("distinguishes the stale memory estimated value from the validated value", () => {
    expect(SUPPLY_CROSS_DOCUMENT_AUDIT_SCRIPT).toContain("25.325,86");
    expect(SUPPLY_CROSS_DOCUMENT_AUDIT_SCRIPT).toContain("21.793,15");
  });

  it("preserves the quantified PBL breakdown found in the memory as a coherence issue", () => {
    expect(SUPPLY_CROSS_DOCUMENT_AUDIT_SCRIPT).toContain("8.019,85");
    expect(SUPPLY_CROSS_DOCUMENT_AUDIT_SCRIPT).toContain("1.899,44");
    expect(SUPPLY_CROSS_DOCUMENT_AUDIT_SCRIPT).toContain("633,15");
    expect(SUPPLY_CROSS_DOCUMENT_AUDIT_SCRIPT).toContain("76 %");
    expect(SUPPLY_CROSS_DOCUMENT_AUDIT_SCRIPT).toContain("18 %");
    expect(SUPPLY_CROSS_DOCUMENT_AUDIT_SCRIPT).toContain("6 %");
  });

  it("blocks the obsolete open-ended catalogue wording instead of silently accepting it", () => {
    expect(SUPPLY_CROSS_DOCUMENT_AUDIT_SCRIPT).toContain("no exhaustivo ni limitativo");
    expect(SUPPLY_CROSS_DOCUMENT_AUDIT_SCRIPT).toContain("sin nuevos artículos ni nuevos precios");
  });

  it("is integrated after the global PCAP closure in AdaptiveFlowUi", () => {
    const ui = fs.readFileSync(path.resolve("src/interfaces/lb7/AdaptiveFlowUi.ts"), "utf8");
    expect(ui).toContain('SUPPLY_CROSS_DOCUMENT_AUDIT_SCRIPT');
    expect(ui.indexOf('${SUPPLY_CROSS_DOCUMENT_AUDIT_SCRIPT}')).toBeGreaterThan(ui.indexOf('${SUPPLY_PCAP_GLOBAL_CLOSURE_SCRIPT}'));
    expect(ui).toContain("Paso 11.4 auditoría cruzada documental");
  });
});
